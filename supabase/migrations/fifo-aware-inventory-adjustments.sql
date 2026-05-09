create or replace function public.adjust_inventory_with_fifo(
  p_product_id uuid,
  p_location public.inventory_location,
  p_adjustment_type text,
  p_quantity integer,
  p_reason text,
  p_user_id uuid,
  p_landed_cost_per_unit numeric default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_inventory_id uuid;
  v_previous_quantity integer := 0;
  v_new_quantity integer := 0;
  v_effective_delta integer := 0;
  v_total_fifo_remaining integer := 0;
  v_remaining_to_consume integer := 0;
  v_consumed_quantity integer := 0;
  v_reason text := trim(coalesce(p_reason, ''));
  v_movement_reason text;
  v_batch record;
begin
  if p_adjustment_type not in ('increase', 'decrease', 'set') then
    raise exception 'invalid adjustment type';
  end if;

  if p_quantity < 0 then
    raise exception 'inventory cannot go below zero';
  end if;

  if v_reason = '' then
    raise exception 'reason is required';
  end if;

  select role
  into v_role
  from public.profiles
  where id = p_user_id;

  if v_role is null then
    raise exception 'unauthorized';
  end if;

  if v_role not in ('admin', 'partner') then
    raise exception 'unauthorized';
  end if;

  if v_role = 'partner' and p_location <> 'bangladesh' then
    raise exception 'partners can only adjust bangladesh inventory';
  end if;

  perform 1
  from public.products
  where id = p_product_id;

  if not found then
    raise exception 'invalid product selection';
  end if;

  select id, quantity
  into v_inventory_id, v_previous_quantity
  from public.inventory
  where product_id = p_product_id
    and location = p_location
  for update;

  if not found then
    v_inventory_id := null;
    v_previous_quantity := 0;
  end if;

  if p_adjustment_type = 'increase' then
    if p_quantity <= 0 then
      raise exception 'quantity must be greater than 0';
    end if;

    v_new_quantity := v_previous_quantity + p_quantity;
    v_effective_delta := p_quantity;
  elsif p_adjustment_type = 'decrease' then
    if p_quantity <= 0 then
      raise exception 'quantity must be greater than 0';
    end if;

    if v_inventory_id is null then
      raise exception 'cannot decrease inventory because no stock exists in that location';
    end if;

    v_new_quantity := v_previous_quantity - p_quantity;
    v_effective_delta := -p_quantity;
  else
    v_new_quantity := p_quantity;
    v_effective_delta := p_quantity - v_previous_quantity;
  end if;

  if v_new_quantity < 0 then
    raise exception 'inventory cannot go below zero';
  end if;

  if p_location = 'bangladesh'
    and (p_adjustment_type = 'increase' or (p_adjustment_type = 'set' and v_effective_delta > 0))
    and coalesce(p_landed_cost_per_unit, 0) <= 0 then
    raise exception 'landed cost required';
  end if;

  if p_location = 'bangladesh' and v_effective_delta < 0 then
    perform 1
    from public.inventory_batches
    where product_id = p_product_id
      and remaining_quantity > 0
    for update;

    select coalesce(sum(remaining_quantity), 0)
    into v_total_fifo_remaining
    from public.inventory_batches
    where product_id = p_product_id
      and remaining_quantity > 0;

    if v_total_fifo_remaining < abs(v_effective_delta) then
      raise exception 'not enough fifo batch inventory to decrease bangladesh stock';
    end if;

    v_remaining_to_consume := abs(v_effective_delta);

    for v_batch in
      select id, remaining_quantity
      from public.inventory_batches
      where product_id = p_product_id
        and remaining_quantity > 0
      order by received_at asc nulls first, id asc
      for update
    loop
      exit when v_remaining_to_consume <= 0;

      v_consumed_quantity := least(v_remaining_to_consume, v_batch.remaining_quantity);

      update public.inventory_batches
      set remaining_quantity = remaining_quantity - v_consumed_quantity
      where id = v_batch.id;

      v_remaining_to_consume := v_remaining_to_consume - v_consumed_quantity;
    end loop;
  end if;

  if v_inventory_id is not null then
    update public.inventory
    set quantity = v_new_quantity
    where id = v_inventory_id;
  elsif v_new_quantity > 0 then
    insert into public.inventory (
      product_id,
      location,
      quantity
    )
    values (
      p_product_id,
      p_location,
      v_new_quantity
    )
    returning id into v_inventory_id;
  end if;

  if p_location = 'bangladesh'
    and (p_adjustment_type = 'increase' or (p_adjustment_type = 'set' and v_effective_delta > 0))
    and v_effective_delta > 0 then
    insert into public.inventory_batches (
      product_id,
      shipment_id,
      shipment_item_id,
      original_quantity,
      remaining_quantity,
      purchase_price_bdt,
      allocated_shipping_cost_per_unit,
      allocated_customs_cost_per_unit,
      landed_cost_per_unit,
      received_at
    )
    values (
      p_product_id,
      null,
      null,
      v_effective_delta,
      v_effective_delta,
      p_landed_cost_per_unit,
      0,
      0,
      p_landed_cost_per_unit,
      now()
    );
  end if;

  if v_effective_delta <> 0 then
    if p_location = 'bangladesh' and v_effective_delta < 0 then
      v_movement_reason := 'manual_adjustment_fifo_decrease: ' || v_reason;
    elsif p_location = 'bangladesh' and v_effective_delta > 0 then
      v_movement_reason := 'manual_adjustment_fifo_increase: ' || v_reason;
    else
      v_movement_reason := 'manual_adjustment: ' || v_reason;
    end if;

    insert into public.inventory_movements (
      product_id,
      from_location,
      to_location,
      quantity,
      reason,
      created_by
    )
    values (
      p_product_id,
      case when v_effective_delta < 0 then p_location else null end,
      case when v_effective_delta > 0 then p_location else null end,
      abs(v_effective_delta),
      v_movement_reason,
      p_user_id
    );
  end if;

  insert into public.audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    metadata
  )
  values (
    case when v_effective_delta = 0 then 'inventory_adjustment_no_change' else 'inventory_adjusted' end,
    'inventory',
    coalesce(v_inventory_id, p_product_id),
    p_user_id,
    jsonb_build_object(
      'product_id', p_product_id,
      'location', p_location,
      'adjustment_type', p_adjustment_type,
      'requested_quantity', p_quantity,
      'previous_quantity', v_previous_quantity,
      'new_quantity', v_new_quantity,
      'effective_delta', v_effective_delta,
      'reason', v_reason,
      'landed_cost_per_unit', p_landed_cost_per_unit
    )
  );

  return jsonb_build_object(
    'inventory_id', v_inventory_id,
    'previous_quantity', v_previous_quantity,
    'new_quantity', v_new_quantity,
    'effective_delta', v_effective_delta,
    'message', case
      when v_effective_delta = 0 then 'No change needed.'
      else 'Inventory adjusted successfully.'
    end
  );
end;
$$;

grant execute on function public.adjust_inventory_with_fifo(
  uuid,
  public.inventory_location,
  text,
  integer,
  text,
  uuid,
  numeric
) to authenticated;

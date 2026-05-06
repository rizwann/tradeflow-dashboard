create or replace function public.void_sale_with_reversal(
  p_sale_id uuid,
  p_user_id uuid,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale public.sales%rowtype;
  v_role text;
begin
  select role
  into v_role
  from public.profiles
  where id = p_user_id;

  if v_role is null then
    raise exception 'unauthorized';
  end if;

  select *
  into v_sale
  from public.sales
  where id = p_sale_id
  for update;

  if not found then
    raise exception 'sale not found';
  end if;

  if v_sale.status <> 'active' then
    raise exception 'sale already voided';
  end if;

  if v_role <> 'admin' and v_sale.sold_by <> p_user_id then
    raise exception 'unauthorized';
  end if;

  perform 1
  from public.sale_batch_consumptions
  where sale_id = p_sale_id
  for update;

  with batch_reversals as (
    select batch_id, sum(quantity) as restored_quantity
    from public.sale_batch_consumptions
    where sale_id = p_sale_id
    group by batch_id
  )
  update public.inventory_batches as inventory_batch
  set remaining_quantity =
    inventory_batch.remaining_quantity + batch_reversals.restored_quantity
  from batch_reversals
  where inventory_batch.id = batch_reversals.batch_id;

  update public.inventory
  set quantity = quantity + v_sale.quantity
  where product_id = v_sale.product_id
    and location = 'bangladesh';

  if not found then
    insert into public.inventory (product_id, location, quantity)
    values (v_sale.product_id, 'bangladesh', v_sale.quantity);
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
    v_sale.product_id,
    null,
    'bangladesh',
    v_sale.quantity,
    'sale_voided',
    p_user_id
  );

  update public.sales
  set status = 'voided',
      voided_at = now(),
      voided_by = p_user_id,
      void_reason = p_reason
  where id = p_sale_id;

  insert into public.audit_logs (
    action,
    entity_type,
    entity_id,
    user_id,
    metadata
  )
  values (
    'sale_voided',
    'sale',
    p_sale_id,
    p_user_id,
    jsonb_build_object(
      'reason', p_reason,
      'product_id', v_sale.product_id,
      'quantity', v_sale.quantity
    )
  );

  return p_sale_id;
end;
$$;

grant execute on function public.void_sale_with_reversal(uuid, uuid, text) to authenticated;

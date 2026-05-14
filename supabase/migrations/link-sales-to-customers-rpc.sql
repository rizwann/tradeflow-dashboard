create or replace function public.record_sale_with_customer_link(
  p_product_id uuid,
  p_quantity integer,
  p_unit_selling_price_bdt numeric,
  p_discount numeric,
  p_sale_date date,
  p_sold_by uuid,
  p_customer_id uuid,
  p_customer_name text,
  p_payment_status text,
  p_notes text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id uuid;
  v_transaction_started_at timestamptz := transaction_timestamp();
begin
  if p_customer_id is null then
    raise exception 'customer is required';
  end if;

  perform public.record_sale_with_fifo(
    p_product_id,
    p_quantity,
    p_unit_selling_price_bdt,
    p_discount,
    p_sale_date,
    p_sold_by,
    coalesce(p_customer_name, ''),
    p_payment_status::payment_status,
    coalesce(p_notes, '')
  );

  select id
  into v_sale_id
  from public.sales
  where product_id = p_product_id
    and quantity = p_quantity
    and unit_selling_price_bdt = p_unit_selling_price_bdt
    and coalesce(discount, 0) = coalesce(p_discount, 0)
    and sale_date = p_sale_date
    and sold_by = p_sold_by
    and coalesce(customer_name, '') = coalesce(p_customer_name, '')
    and payment_status = p_payment_status::payment_status
    and coalesce(notes, '') = coalesce(p_notes, '')
    and created_at >= v_transaction_started_at
  order by created_at desc, id desc
  limit 1
  for update;

  if v_sale_id is null then
    raise exception 'sale created but could not be linked to a customer';
  end if;

  update public.sales
  set customer_id = p_customer_id
  where id = v_sale_id;

  update public.audit_logs
  set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'customer_id', p_customer_id,
    'customer_name', nullif(p_customer_name, '')
  )
  where entity_type = 'sale'
    and entity_id = v_sale_id
    and user_id = p_sold_by
    and created_at >= v_transaction_started_at;

  return v_sale_id;
end;
$$;

grant execute on function public.record_sale_with_customer_link(
  uuid,
  integer,
  numeric,
  numeric,
  date,
  uuid,
  uuid,
  text,
  text,
  text
) to authenticated;
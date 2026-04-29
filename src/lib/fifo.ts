import type { SupabaseClient } from "@supabase/supabase-js"

type ConsumeFifoBatchesParams = {
  supabase: SupabaseClient
  saleId: string
  productId: string
  quantity: number
  revenuePerUnit: number
}

export async function consumeFifoBatches({
  supabase,
  saleId,
  productId,
  quantity,
  revenuePerUnit,
}: ConsumeFifoBatchesParams) {
  let remainingToConsume = quantity

  const { data: batches, error: batchesError } = await supabase
    .from("inventory_batches")
    .select(
      "id, product_id, remaining_quantity, landed_cost_per_unit, received_at",
    )
    .eq("product_id", productId)
    .gt("remaining_quantity", 0)
    .order("received_at", { ascending: true })

  if (batchesError) {
    throw new Error(batchesError.message)
  }

  const totalAvailable =
    batches?.reduce((sum, batch) => sum + batch.remaining_quantity, 0) ?? 0

  if (totalAvailable < quantity) {
    throw new Error("Not enough FIFO batch inventory")
  }

  const consumptions = []

  for (const batch of batches ?? []) {
    if (remainingToConsume <= 0) break

    const consumedQuantity = Math.min(
      remainingToConsume,
      batch.remaining_quantity,
    )

    const newRemainingQuantity = batch.remaining_quantity - consumedQuantity

    const { error: updateBatchError } = await supabase
      .from("inventory_batches")
      .update({
        remaining_quantity: newRemainingQuantity,
      })
      .eq("id", batch.id)

    if (updateBatchError) {
      throw new Error(updateBatchError.message)
    }
    const totalCost = consumedQuantity * Number(batch.landed_cost_per_unit)
    const totalRevenue = consumedQuantity * revenuePerUnit

    consumptions.push({
      sale_id: saleId,
      batch_id: batch.id,
      product_id: productId,
      quantity: consumedQuantity,
      landed_cost_per_unit: Number(batch.landed_cost_per_unit),
      total_cost: totalCost,
      revenue_per_unit: revenuePerUnit,
      total_revenue: totalRevenue,
      gross_profit: totalRevenue - totalCost,
    })

    remainingToConsume -= consumedQuantity
  }

  const { error: consumptionError } = await supabase
    .from("sale_batch_consumptions")
    .insert(consumptions)

  if (consumptionError) {
    throw new Error(consumptionError.message)
  }
}

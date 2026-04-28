import type { SupabaseClient } from "@supabase/supabase-js"

type InventoryLocation = "germany" | "in_transit" | "bangladesh"

type MoveInventoryParams = {
  supabase: SupabaseClient
  productId: string
  fromLocation: InventoryLocation
  toLocation: InventoryLocation
  quantity: number
  userId: string
  reason: string
}

export async function moveInventory({
  supabase,
  productId,
  fromLocation,
  toLocation,
  quantity,
  userId,
  reason,
}: MoveInventoryParams) {
  const { data: fromInventory, error: fromError } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", productId)
    .eq("location", fromLocation)
    .single()

  if (fromError || !fromInventory) {
    throw new Error(`No inventory found in ${fromLocation}`)
  }

  if (fromInventory.quantity < quantity) {
    throw new Error(`Not enough stock in ${fromLocation}`)
  }

  const { error: decreaseError } = await supabase
    .from("inventory")
    .update({
      quantity: fromInventory.quantity - quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", fromInventory.id)

  if (decreaseError) {
    throw new Error(decreaseError.message)
  }

  const { data: toInventory } = await supabase
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", productId)
    .eq("location", toLocation)
    .maybeSingle()

  if (toInventory) {
    const { error: increaseError } = await supabase
      .from("inventory")
      .update({
        quantity: toInventory.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", toInventory.id)

    if (increaseError) {
      throw new Error(increaseError.message)
    }
  } else {
    const { error: insertError } = await supabase.from("inventory").insert({
      product_id: productId,
      location: toLocation,
      quantity,
    })

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      product_id: productId,
      from_location: fromLocation,
      to_location: toLocation,
      quantity,
      reason,
      created_by: userId,
    })

  if (movementError) {
    throw new Error(movementError.message)
  }
}

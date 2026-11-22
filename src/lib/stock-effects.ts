import type { Article, InventoryEntry } from "@/contexts/DataContext";

/**
 * Pure stock effect helpers - extracted from approveQualityControl
 * These functions take an Article and return a NEW Article with updated stock/inventory.
 * NO side effects, NO state mutations, NO React dependencies.
 */

/**
 * ENTRÉE APPROVAL: Add valid quantity to destination zone and total stock
 * 
 * Logic extracted from DataContext.tsx lines 887-930:
 * - Add validQuantity to inventory zone matching destinationZone
 * - Create zone if it doesn't exist
 * - Add validQuantity to total stock
 * 
 * @param article - Current article state
 * @param destinationZone - Zone name where stock is added
 * @param validQuantity - Quantity to add (already in exit unit)
 * @returns New article with updated stock and inventory
 */
export const applyEntreeStock = (
  article: Article,
  destinationZone: string,
  validQuantity: number
): Article => {
  // Update inventory: Add valid quantity to destination zone
  const updatedInventory = article.inventory.map(loc => {
    if (loc.zone === destinationZone) {
      const newQty = Number(loc.quantity) + validQuantity;
      return { ...loc, quantity: newQty };
    }
    return loc;
  });

  // If destination zone doesn't exist, create it
  if (!updatedInventory.some(loc => loc.zone === destinationZone)) {
    updatedInventory.push({ zone: destinationZone, quantity: validQuantity });
  }

  // Update total stock
  const newTotalStock = article.stock + validQuantity;

  return {
    ...article,
    stock: newTotalStock,
    inventory: updatedInventory
  };
};

/**
 * SORTIE APPROVAL (and DEFECTIVE REFUSAL): Deduct quantity from source zone and total stock
 * 
 * Logic extracted from DataContext.tsx lines 970-1009 (Sortie approval)
 * and lines 766-806 (Defective refusal - same math)
 * 
 * - Deduct qtyToDeduct from inventory zone matching sourceZone
 * - Remove zones with 0 quantity
 * - Deduct qtyToDeduct from total stock (clamped to 0)
 * 
 * @param article - Current article state
 * @param sourceZone - Zone name where stock is deducted
 * @param qtyToDeduct - Quantity to deduct (already in exit unit)
 * @returns New article with updated stock and inventory
 */
export const applySortieStock = (
  article: Article,
  sourceZone: string,
  qtyToDeduct: number
): Article => {
  // If no source zone, return article unchanged
  if (!sourceZone) {
    return article;
  }

  // Find the inventory entry for this specific zone and deduct
  const updatedInventory = article.inventory.map(loc => {
    if (loc.zone === sourceZone) {
      const currentQty = Number(loc.quantity);
      const newQty = Math.max(0, currentQty - qtyToDeduct);
      return { ...loc, quantity: newQty };
    }
    return loc;
  }).filter(l => Number(l.quantity) > 0); // Remove zones with 0 quantity

  // Calculate new total stock (clamped to 0)
  const newTotalStock = Math.max(0, article.stock - qtyToDeduct);

  return {
    ...article,
    stock: newTotalStock,
    inventory: updatedInventory
  };
};

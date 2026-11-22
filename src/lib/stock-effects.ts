import type { Article, InventoryEntry, Mouvement } from "@/contexts/DataContext";

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

/**
 * Phase 7b: Compute stock effects for an entire operation
 * 
 * Pre-validates all Sortie deductions against current stock, then applies all lines
 * (Entrée and Sortie) in a single pass.
 * 
 * @param articles - Current articles state snapshot
 * @param movements - Movements to apply (filtered to operationId, stockApplied === false)
 * @returns { success, error, failedLines, updatedArticles } or error with original articles
 */
export const computeOperationStockEffect = (
  articles: Article[],
  movements: Mouvement[]
): {
  success: boolean;
  error?: string;
  failedLines?: string[];
  updatedArticles: Article[];
} => {
  // Pre-validation: check all Sortie deductions against current stock
  // Track cumulative deductions per (articleRef, zone)
  const sortieDeductions: Record<string, Record<string, number>> = {};

  for (const movement of movements) {
    if (movement.type === "Sortie") {
      const key = movement.ref;
      const zone = movement.emplacementSource;
      
      if (!zone) continue;
      
      if (!sortieDeductions[key]) sortieDeductions[key] = {};
      if (!sortieDeductions[key][zone]) sortieDeductions[key][zone] = 0;
      
      // Sortie normal approval OR defective refusal: deduct full qte
      sortieDeductions[key][zone] += movement.qte;
    }
  }

  // Validate cumulative deductions
  const failedLines: string[] = [];
  
  for (const [articleRef, zoneDeductions] of Object.entries(sortieDeductions)) {
    const article = articles.find(a => a.ref === articleRef);
    if (!article) {
      failedLines.push(`Article ${articleRef} not found`);
      continue;
    }
    
    for (const [zone, totalDeduction] of Object.entries(zoneDeductions)) {
      const zoneStock = article.inventory.find(loc => loc.zone === zone)?.quantity || 0;
      if (totalDeduction > zoneStock) {
        failedLines.push(
          `${article.nom} (${zone}): insufficient stock (need ${totalDeduction}, have ${zoneStock})`
        );
      }
    }
  }

  if (failedLines.length > 0) {
    return {
      success: false,
      error: `Insufficient stock for ${failedLines.length} line(s)`,
      failedLines,
      updatedArticles: articles // return unchanged
    };
  }

  // Apply all movements in a single fold
  const updatedArticles = movements.reduce((currentArticles, movement) => {
    return currentArticles.map(article => {
      if (article.ref !== movement.ref) {
        return article;
      }

      // Entrée: add validQuantity (0 if total refusal)
      if (movement.type === "Entrée") {
        const validQuantity = movement.validQuantity || 0;
        if (validQuantity > 0) {
          return applyEntreeStock(article, movement.emplacementDestination, validQuantity);
        }
        return article; // No effect if validQuantity is 0
      }

      // Sortie: deduct full qte (normal approval or defective refusal)
      if (movement.type === "Sortie") {
        // Only apply if this is an approval or defective refusal (has stock effect)
        // Administrative refusal has no stock effect (not in deferred movements)
        if (movement.emplacementSource) {
          return applySortieStock(article, movement.emplacementSource, movement.qte);
        }
        return article;
      }

      return article;
    });
  }, articles);

  return {
    success: true,
    updatedArticles
  };
};

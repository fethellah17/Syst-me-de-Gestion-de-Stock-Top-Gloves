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
 * Phase 7c: TRANSFERT - Move quantity from source to destination zone
 * 
 * Logic extracted from DataContext.tsx processTransfer lines 1103-1148:
 * - Deduct quantity from source zone (with Math.max(0, ...))
 * - Add quantity to destination zone (or create it)
 * - Remove zones with 0 quantity
 * - Total stock UNCHANGED
 * 
 * @param article - Current article state
 * @param sourceZone - Zone name where stock is deducted
 * @param destinationZone - Zone name where stock is added
 * @param qty - Quantity to transfer (already in exit unit)
 * @returns New article with updated inventory (total stock unchanged)
 */
export const applyTransferStock = (
  article: Article,
  sourceZone: string,
  destinationZone: string,
  qty: number
): Article => {
  // Step 1: Update source and destination zones
  const updatedInventory = article.inventory.map(loc => {
    if (loc.zone === sourceZone) {
      // CRITICAL: Convert to Number before subtracting to prevent string issues
      return { ...loc, quantity: Math.max(0, Number(loc.quantity) - Number(qty)) };
    }
    if (loc.zone === destinationZone) {
      // CRITICAL: Convert to Number before adding to prevent string concatenation
      return { ...loc, quantity: Number(loc.quantity) + Number(qty) };
    }
    return loc;
  });

  // Step 2: If the destination doesn't exist in the inventory, add it
  if (!updatedInventory.find(l => l.zone === destinationZone)) {
    updatedInventory.push({ zone: destinationZone, quantity: Number(qty) });
  }

  // Step 3: Remove inventory with quantity 0
  const cleanedInventory = updatedInventory.filter(l => Number(l.quantity) > 0);

  // Total stock UNCHANGED
  return {
    ...article,
    inventory: cleanedInventory
  };
};

/**
 * Phase 7b+7c: Compute stock effects for an entire operation
 * 
 * Pre-validates all Sortie and Transfert deductions against current stock, then applies all lines
 * (Entrée, Sortie, Transfert) in a single pass, in line order.
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
  // Phase 7c: Pre-validation in a SINGLE FOLD (line order matters)
  // Track cumulative effects per (articleRef, zone) as we simulate the operation
  const simulatedStocks: Record<string, Record<string, number>> = {};

  // Initialize with current stock
  for (const article of articles) {
    simulatedStocks[article.ref] = {};
    for (const loc of article.inventory) {
      simulatedStocks[article.ref][loc.zone] = Number(loc.quantity);
    }
  }

  const failedLines: string[] = [];

  // Simulate each movement in order
  for (const movement of movements) {
    const articleRef = movement.ref;
    
    if (!simulatedStocks[articleRef]) {
      failedLines.push(`Article ${articleRef} not found`);
      continue;
    }

    // Entrée: adds to destination zone
    if (movement.type === "Entrée") {
      const validQuantity = movement.validQuantity || 0;
      if (validQuantity > 0) {
        const zone = movement.emplacementDestination;
        if (!simulatedStocks[articleRef][zone]) {
          simulatedStocks[articleRef][zone] = 0;
        }
        simulatedStocks[articleRef][zone] += validQuantity;
      }
    }

    // Sortie: deducts from source zone
    if (movement.type === "Sortie") {
      const zone = movement.emplacementSource;
      if (!zone) continue;

      if (!simulatedStocks[articleRef][zone]) {
        simulatedStocks[articleRef][zone] = 0;
      }

      const available = simulatedStocks[articleRef][zone];
      const needed = movement.qte;

      if (needed > available) {
        const article = articles.find(a => a.ref === articleRef);
        failedLines.push(
          `${article?.nom || articleRef} (${zone}): insufficient stock (need ${needed}, have ${available})`
        );
      } else {
        simulatedStocks[articleRef][zone] = Math.max(0, available - needed);
      }
    }

    // Phase 7c: Transfert deducts from source, adds to destination
    if (movement.type === "Transfert") {
      const sourceZone = movement.emplacementSource;
      const destinationZone = movement.emplacementDestination;
      const qty = movement.qte;

      if (!sourceZone || !destinationZone) continue;

      if (!simulatedStocks[articleRef][sourceZone]) {
        simulatedStocks[articleRef][sourceZone] = 0;
      }

      const available = simulatedStocks[articleRef][sourceZone];

      if (qty > available) {
        const article = articles.find(a => a.ref === articleRef);
        failedLines.push(
          `${article?.nom || articleRef} (${sourceZone}): insufficient stock for transfer (need ${qty}, have ${available})`
        );
      } else {
        // Deduct from source
        simulatedStocks[articleRef][sourceZone] = Math.max(0, available - qty);
        // Add to destination
        if (!simulatedStocks[articleRef][destinationZone]) {
          simulatedStocks[articleRef][destinationZone] = 0;
        }
        simulatedStocks[articleRef][destinationZone] += qty;
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

      // Phase 7c: Transfert - move quantity from source to destination
      if (movement.type === "Transfert") {
        if (movement.emplacementSource && movement.emplacementDestination) {
          return applyTransferStock(
            article,
            movement.emplacementSource,
            movement.emplacementDestination,
            movement.qte
          );
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

/**
 * Phase 7d: Determine if stock should be reversed when deleting a movement
 * 
 * Operation lines have deferred stock (stockApplied field tracks whether applied).
 * Non-operation lines apply stock immediately (legacy behavior).
 * 
 * @param m - Movement with optional operationId and stockApplied fields
 * @returns true if stock should be reversed, false if stock was never applied
 */
export function shouldReverseStockOnDelete(m: { operationId?: unknown; stockApplied?: boolean }): boolean {
  return m.operationId ? m.stockApplied === true : true;
}

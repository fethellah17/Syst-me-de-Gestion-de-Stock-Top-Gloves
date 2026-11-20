// Unit conversion utilities for dual-unit system

export interface UnitConversion {
  uniteEntree: string;
  uniteSortie: string;
  facteurConversion: number;
}

/**
 * Round stock quantity based on unit type
 * - Whole items (Pièce, Boîte, Unité, Paire, Carton): Round to integer
 * - Weight/Volume (Kg, g, Litre, ml, Tonne): Round to 3 decimals
 */
export const roundStockQuantity = (quantity: number, unit: string): number => {
  const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
  const isWholeItem = wholeItemUnits.some(u => unit.toLowerCase().includes(u));
  
  if (isWholeItem) {
    // Round to nearest integer for whole items
    return Math.round(quantity);
  } else {
    // Round to 3 decimals for weight/volume, then remove trailing zeros
    return parseFloat(quantity.toFixed(3));
  }
};

/**
 * Format stock for display - removes unnecessary trailing zeros
 */
export const formatStockDisplay = (quantity: number): number => {
  return parseFloat(quantity.toFixed(3));
};

/**
 * Convert from entry unit to exit unit with proper rounding
 * Example: 2 Tonnes -> 2000 Kg (with factor 1000)
 */
export const convertEntryToExit = (
  quantityInEntryUnit: number,
  facteurConversion: number,
  exitUnit: string
): number => {
  const rawQuantity = quantityInEntryUnit * facteurConversion;
  return roundStockQuantity(rawQuantity, exitUnit);
};

/**
 * Convert from exit unit to entry unit with proper rounding
 * Example: 2000 Kg -> 2 Tonnes (with factor 1000)
 */
export const convertExitToEntry = (
  quantityInExitUnit: number,
  facteurConversion: number,
  entryUnit: string
): number => {
  const rawQuantity = quantityInExitUnit / facteurConversion;
  return roundStockQuantity(rawQuantity, entryUnit);
};

/**
 * Format quantity with appropriate unit
 */
export const formatQuantityWithUnit = (
  quantity: number,
  unit: string,
  locale: string = 'fr-FR'
): string => {
  const formattedQty = formatStockDisplay(quantity);
  return `${formattedQty.toLocaleString(locale)} ${unit}`;
};

/**
 * Get conversion display text
 * Example: "1 Tonne = 1000 Kg"
 */
export const getConversionText = (conversion: UnitConversion): string => {
  return `1 ${conversion.uniteEntree} = ${conversion.facteurConversion} ${conversion.uniteSortie}`;
};

/**
 * Calculate stock in entry units for display
 * Example: 2500 Kg -> 2.5 Tonnes (with factor 1000)
 */
export const getStockInEntryUnits = (
  stockInExitUnits: number,
  facteurConversion: number,
  entryUnit: string
): number => {
  return convertExitToEntry(stockInExitUnits, facteurConversion, entryUnit);
};

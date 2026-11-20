export interface StockStatus {
  level: "critical" | "warning" | "secure";
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface AutonomyInfo {
  days: number;
  hours: number;
  label: string;
  isLow: boolean;
}

// Unit mapping: symbol -> full French name
export const UNIT_FULL_NAMES: Record<string, string> = {
  // Weight units
  "T": "Tonnes",
  "Tonne": "Tonnes",
  "Tonnes": "Tonnes",
  "Kg": "Kilogrammes",
  "kg": "Kilogrammes",
  "Kilogramme": "Kilogrammes",
  "Kilogrammes": "Kilogrammes",
  "g": "Grammes",
  "Gramme": "Grammes",
  "Grammes": "Grammes",
  "mg": "Milligrammes",
  "Milligramme": "Milligrammes",
  "Milligrammes": "Milligrammes",
  
  // Volume units
  "L": "Litres",
  "Litre": "Litres",
  "Litres": "Litres",
  "mL": "Millilitres",
  "ml": "Millilitres",
  "Millilitre": "Millilitres",
  "Millilitres": "Millilitres",
  
  // Count units
  "pièce": "Pièces",
  "Pièce": "Pièces",
  "Pièces": "Pièces",
  "unité": "Unités",
  "Unité": "Unités",
  "Unités": "Unités",
  "boîte": "Boîtes",
  "Boîte": "Boîtes",
  "Boîtes": "Boîtes",
  "carton": "Cartons",
  "Carton": "Cartons",
  "Cartons": "Cartons",
  "palette": "Palettes",
  "Palette": "Palettes",
  "Palettes": "Palettes",
  "paire": "Paires",
  "Paire": "Paires",
  "Paires": "Paires",
  "Pa": "Paires",
  "pa": "Paires",
  
  // Default
  "": "Unités",
};

/**
 * Convert unit symbol to full French name
 * @param unit Unit symbol (e.g., "T", "Kg", "pièce")
 * @returns Full French name (e.g., "Tonnes", "Kilogrammes", "Pièces")
 */
export const getFullUnitName = (unit: string): string => {
  if (!unit) return "Unités";
  return UNIT_FULL_NAMES[unit] || unit;
};

export const calculateAutonomy = (stock: number, dailyConsumption: number): AutonomyInfo => {
  if (dailyConsumption <= 0) {
    return { days: 0, hours: 0, label: "N/A", isLow: false };
  }

  const totalHours = (stock / dailyConsumption) * 24;
  const days = Math.floor(totalHours / 24);
  const hours = Math.floor(totalHours % 24);

  let label = "";
  if (days > 0) {
    label = `${days}j`;
    if (hours > 0) label += ` ${hours}h`;
  } else {
    label = `${hours}h`;
  }

  return {
    days,
    hours,
    label,
    isLow: totalHours <= 72, // 3 days
  };
};

export const getStockStatus = (
  stock: number,
  seuil: number,
  dailyConsumption: number
): StockStatus => {
  const autonomy = calculateAutonomy(stock, dailyConsumption);
  const totalHours = (stock / dailyConsumption) * 24;

  // CRITIQUE: Stock <= Seuil OR Autonomy <= 3 days
  if (stock <= seuil || totalHours <= 72) {
    return {
      level: "critical",
      label: "CRITIQUE",
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      icon: "🔴",
    };
  }

  // ATTENTION: Autonomy between 4-7 days
  if (totalHours > 72 && totalHours <= 168) {
    return {
      level: "warning",
      label: "ATTENTION",
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      icon: "🟠",
    };
  }

  // SÉCURISÉ: Stock > Seuil AND Autonomy > 7 days
  return {
    level: "secure",
    label: "SÉCURISÉ",
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    icon: "🟢",
  };
};

export function escapeCsvField(value: unknown): string {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return "";
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle numbers
  if (typeof value === "number") {
    // Negative numbers stay unchanged
    // Non-integer numbers use comma as decimal separator
    if (Number.isInteger(value)) {
      return String(value);
    } else {
      return String(value).replace(".", ",");
    }
  }

  // Handle objects/arrays - convert to JSON
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  // Convert to string
  let str = String(value);

  // CSV injection guard ONLY for strings: prefix with apostrophe if starts with = + - @
  if (typeof value === "string" && /^[=+\-@]/.test(str)) {
    str = "'" + str;
  }

  // Quote if contains delimiter, quotes, or newlines
  if (str.includes(";") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    // Double any quotes
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  return str;
}

export interface CsvColumn<T> {
  header: string;
  get: (row: T) => unknown;
}

export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  // Build header row
  const headerRow = columns.map(col => escapeCsvField(col.header)).join(";");
  
  // Build data rows
  const dataRows = rows.map(row => {
    return columns.map(col => {
      const value = col.get(row);
      return escapeCsvField(value);
    }).join(";");
  });

  // Combine with \r\n line breaks
  return [headerRow, ...dataRows].join("\r\n");
}

export function withBom(csv: string): string {
  return "\uFEFF" + csv;
}

export function downloadCsv(filename: string, csvString: string): void {
  // Add UTF-8 BOM for proper encoding in Excel
  const csvWithBom = withBom(csvString);
  
  // Create blob
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });
  
  // Create temporary anchor
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Type imports from DataContext (read-only derivation, no exports needed)
import type { useData } from "@/contexts/DataContext";
type DataCtx = ReturnType<typeof useData>;
type Article = DataCtx["articles"][number];
type Mouvement = DataCtx["mouvements"][number];
type Operation = DataCtx["operations"][number];
type InventoryRecord = DataCtx["inventoryHistory"][number];

// Staff interface (from StaffPage.tsx localStorage, password field NEVER exported)
interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
}

// Column definitions for each table

export const ARTICLES_COLUMNS: CsvColumn<Article>[] = [
  { header: "ID", get: (row) => row.id },
  { header: "Référence", get: (row) => row.ref },
  { header: "Nom", get: (row) => row.nom },
  { header: "Catégorie", get: (row) => row.categorie },
  { header: "Stock", get: (row) => row.stock },
  { header: "Seuil", get: (row) => row.seuil },
  { header: "Unité", get: (row) => row.unite },
  { header: "Unité d'entrée", get: (row) => row.uniteEntree },
  { header: "Unité de sortie", get: (row) => row.uniteSortie },
  { header: "Facteur de conversion", get: (row) => row.facteurConversion },
];

export const MOUVEMENTS_COLUMNS: CsvColumn<Mouvement>[] = [
  { header: "ID", get: (row) => row.id },
  { header: "Date", get: (row) => row.date },
  { header: "Type", get: (row) => row.type },
  { header: "Article", get: (row) => row.article },
  { header: "Référence", get: (row) => row.ref },
  { header: "Quantité", get: (row) => row.qte },
  { header: "Numéro de lot", get: (row) => row.lotNumber },
  { header: "Fournisseur", get: (row) => row.fournisseur || "" },
  { header: "Emplacement source", get: (row) => row.emplacementSource || "" },
  { header: "Emplacement destination", get: (row) => row.emplacementDestination },
  { header: "Destination", get: (row) => row.destination || "" },
  { header: "Opérateur", get: (row) => row.operateur },
  { header: "Statut", get: (row) => row.statut || "" },
  { header: "Contrôleur", get: (row) => row.controleur || "" },
  { header: "Commentaire", get: (row) => row.commentaire || "" },
  { header: "ID opération", get: (row) => row.operationId || "" },
];

// Extended Operation type for export with computed nbLignes field
export interface OperationWithLines extends Operation {
  nbLignes: number;
}

export const OPERATIONS_COLUMNS: CsvColumn<OperationWithLines>[] = [
  { header: "ID", get: (row) => row.id },
  { header: "Référence", get: (row) => row.reference },
  { header: "Type", get: (row) => row.type },
  { header: "Opérateur", get: (row) => row.operateur },
  { header: "Contrôleur", get: (row) => row.controleur || "" },
  { header: "Gestionnaire", get: (row) => row.gestionnaire || "" },
  { header: "Date planifiée", get: (row) => row.datePlanifiee },
  { header: "Statut", get: (row) => row.statut },
  { header: "Document origine", get: (row) => row.documentOrigine || "" },
  { header: "Nombre de lignes", get: (row) => row.nbLignes },
];

export const INVENTAIRE_COLUMNS: CsvColumn<InventoryRecord>[] = [
  { header: "ID", get: (row) => row.id },
  { header: "Date et heure", get: (row) => row.dateHeure },
  { header: "Article", get: (row) => row.article },
  { header: "Référence", get: (row) => row.ref },
  { header: "Emplacement", get: (row) => row.emplacement },
  { header: "Stock théorique", get: (row) => row.stockTheorique },
  { header: "Stock physique", get: (row) => row.stockPhysique },
  { header: "Écart", get: (row) => row.ecart },
  { header: "Unité", get: (row) => row.uniteSortie },
];

export const PERSONNEL_COLUMNS: CsvColumn<Staff>[] = [
  { header: "ID", get: (row) => row.id },
  { header: "Nom", get: (row) => row.name },
  { header: "Email", get: (row) => row.email },
  { header: "Rôle", get: (row) => row.role },
  { header: "Nombre de permissions", get: (row) => row.permissions?.length ?? 0 },
  { header: "Actif", get: (row) => row.active ? "Oui" : "Non" },
];

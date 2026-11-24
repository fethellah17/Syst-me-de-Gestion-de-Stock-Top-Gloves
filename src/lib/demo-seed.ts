import type { Article, Categorie, InventoryEntry } from "@/contexts/DataContext";

export const DEMO_SEED_ENABLED = true;

export const demoCategories: Categorie[] = [
  { 
    id: 7, 
    nom: "Emballages", 
    description: "Boîtes de rangement et emballages", 
    articles: 2, 
    stock: 7200 
  },
  { 
    id: 8, 
    nom: "Matières premières", 
    description: "Latex et coagulants pour production", 
    articles: 3, 
    stock: 11500 
  },
];

export const demoArticles: Article[] = [
  {
    id: 7,
    ref: "BR-007",
    nom: "Boîte de rangement",
    categorie: "Emballages",
    stock: 1200,
    seuil: 200,
    unite: "Unité",
    uniteEntree: "Unité",
    uniteSortie: "Unité",
    facteurConversion: 1,
    consommationParInventaire: 0,
    consommationJournaliere: 20,
    inventory: [
      { zone: "Zone D - Rack 05", quantity: 1200 }
    ],
    supplierIds: [1]
  },
  {
    id: 8,
    ref: "BD-008",
    nom: "Boîte distributrice carton 100 gants (lot de 500)",
    categorie: "Emballages",
    stock: 6000,
    seuil: 1000,
    unite: "Unité",
    uniteEntree: "Unité",
    uniteSortie: "Unité",
    facteurConversion: 1,
    consommationParInventaire: 0,
    consommationJournaliere: 150,
    inventory: [
      { zone: "Zone D - Rack 05", quantity: 6000 }
    ],
    supplierIds: [2]
  },
  {
    id: 9,
    ref: "GC-T75-009",
    nom: "Gants chirurgicaux stériles latex sans poudre T7.5 (boîte de 50 paires)",
    categorie: "Gants Latex",
    stock: 4000,
    seuil: 800,
    unite: "Paire",
    uniteEntree: "Boîte",
    uniteSortie: "Paire",
    facteurConversion: 50,
    consommationParInventaire: 0,
    consommationJournaliere: 60,
    inventory: [
      { zone: "Zone A - Rack 08", quantity: 4000 }
    ],
    supplierIds: [1, 2]
  },
  {
    id: 10,
    ref: "GE-L-010",
    nom: "Gants d'examen latex poudrés L (boîte de 100)",
    categorie: "Gants Latex",
    stock: 9000,
    seuil: 2000,
    unite: "Pièce",
    uniteEntree: "Boîte",
    uniteSortie: "Pièce",
    facteurConversion: 100,
    consommationParInventaire: 0,
    consommationJournaliere: 150,
    inventory: [
      { zone: "Zone A - Rack 12", quantity: 5000 },
      { zone: "Zone B - Rack 03", quantity: 4000 }
    ],
    supplierIds: [2, 3]
  },
  {
    id: 11,
    ref: "LN-60-011",
    nom: "Latex naturel concentré 60 % (fût de 200 kg)",
    categorie: "Matières premières",
    stock: 6000,
    seuil: 1000,
    unite: "Kg",
    uniteEntree: "Kg",
    uniteSortie: "Kg",
    facteurConversion: 1,
    consommationParInventaire: 0,
    consommationJournaliere: 200,
    inventory: [
      { zone: "Zone D - Rack 05", quantity: 6000 }
    ],
    supplierIds: [1, 3]
  },
  {
    id: 12,
    ref: "LB-NBR-012",
    nom: "Latex nitrile NBR (fût de 200 kg)",
    categorie: "Matières premières",
    stock: 4000,
    seuil: 800,
    unite: "Kg",
    uniteEntree: "Kg",
    uniteSortie: "Kg",
    facteurConversion: 1,
    consommationParInventaire: 0,
    consommationJournaliere: 150,
    inventory: [
      { zone: "Zone D - Rack 05", quantity: 4000 }
    ],
    supplierIds: [2, 3]
  },
  {
    id: 13,
    ref: "NC-025-013",
    nom: "Nitrate de calcium coagulant (sac de 25 kg)",
    categorie: "Matières premières",
    stock: 1500,
    seuil: 250,
    unite: "Kg",
    uniteEntree: "Kg",
    uniteSortie: "Kg",
    facteurConversion: 1,
    consommationParInventaire: 0,
    consommationJournaliere: 40,
    inventory: [
      { zone: "Zone D - Rack 05", quantity: 1500 }
    ],
    supplierIds: [1, 2]
  },
];

export function getDemoArticles(enabled: boolean = DEMO_SEED_ENABLED): Article[] {
  return enabled ? demoArticles : [];
}

export function getDemoCategories(enabled: boolean = DEMO_SEED_ENABLED): Categorie[] {
  return enabled ? demoCategories : [];
}

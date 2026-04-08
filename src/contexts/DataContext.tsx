import React, { createContext, useContext, useState } from "react";

export interface InventoryEntry {
  zone: string;
  quantity: number;
}

export interface Article {
  id: number;
  ref: string;
  nom: string;
  categorie: string;
  stock: number; // Always stored in exit unit (smallest unit)
  seuil: number;
  unite: string; // Legacy field - kept for backward compatibility
  uniteEntree: string; // Entry unit (bulk unit, e.g., "Tonne")
  uniteSortie: string; // Exit unit (consumption unit, e.g., "Kg")
  facteurConversion: number; // How many exit units in one entry unit (e.g., 1000 Kg per Tonne)
  consommationParInventaire: number;
  consommationJournaliere: number;
  inventory: InventoryEntry[];
}

export interface Categorie {
  id: number;
  nom: string;
  description: string;
  articles: number;
  stock: number;
}

export interface Emplacement {
  id: number;
  code: string;
  nom: string;
  type: string;
}

export interface Mouvement {
  id: number;
  date: string;
  article: string;
  ref: string;
  type: "Entrée" | "Sortie" | "Transfert" | "Ajustement";
  qte: number;                  // Always stored in exit unit (smallest unit) for consistency
  qteOriginale?: number;        // Original quantity as entered by user (for display)
  uniteUtilisee?: string;       // Unit selected by user during operation (for display)
  uniteSortie?: string;         // Exit unit (base unit) of the article (for display in Impact Stock)
  lotNumber: string;            // Lot/Batch Number for traceability (medical compliance)
  lotDate?: string;             // Lot/Batch Production Date for traceability
  emplacementSource?: string;
  emplacementDestination: string;
  operateur: string;
  commentaire?: string;         // Optional movement note/comment
  status?: "pending" | "approved" | "rejected";  // QC workflow status
  statut?: "En attente de validation Qualité" | "Terminé" | "Rejeté";
  controleur?: string;
  etatArticles?: "Conforme" | "Non-conforme";
  unitesDefectueuses?: number;
  validQuantity?: number;       // QC metadata: quantity approved for use
  defectiveQuantity?: number;   // QC metadata: quantity marked as defective
  raison?: string;
  rejectionReason?: string;     // QC rejection reason for PDF report
  motif?: string;
  typeAjustement?: "Surplus" | "Manquant";
}

export interface InventoryRecord {
  id: number;
  dateHeure: string;
  article: string;
  ref: string; // Article reference for linking
  emplacement: string; // Specific emplacement where inventory was done
  stockTheorique: number;
  stockPhysique: number;
  ecart: number;
  uniteSortie: string; // Unit for display in PDF
}

interface DataContextType {
  articles: Article[];
  categories: Categorie[];
  emplacements: Emplacement[];
  mouvements: Mouvement[];
  inventoryHistory: InventoryRecord[];
  
  addArticle: (article: Omit<Article, "id">) => void;
  updateArticle: (id: number, article: Partial<Article>) => void;
  deleteArticle: (id: number) => void;
  
  addCategorie: (categorie: Omit<Categorie, "id">) => void;
  updateCategorie: (id: number, categorie: Partial<Categorie>) => void;
  deleteCategorie: (id: number) => void;
  
  addEmplacement: (emplacement: Omit<Emplacement, "id">) => void;
  updateEmplacement: (id: number, emplacement: Partial<Emplacement>) => void;
  deleteEmplacement: (id: number) => void;
  
  addMouvement: (mouvement: Omit<Mouvement, "id">) => void;
  updateMouvement: (id: number, mouvement: Partial<Mouvement>) => void;
  deleteMouvement: (id: number) => void;
  approveQualityControl: (id: number, controleur: string, etatArticles: "Conforme" | "Non-conforme", unitesDefectueuses?: number) => void;
  rejectQualityControl: (id: number, controleur: string, raison: string) => void;
  
  addInventoryRecord: (record: Omit<InventoryRecord, "id">) => void;
  applyInventoryAdjustment: (articleId: number, emplacementNom: string, ecart: number) => void;
  batchUpdateArticles: (updatedArticles: Article[]) => void;
  batchAddInventoryRecords: (records: Array<Omit<InventoryRecord, "id">>) => void;
  
  calculateEmplacementOccupancy: (emplacementName: string) => number;
  getArticleLocations: (articleRef: string) => InventoryEntry[];
  getArticleStockByLocation: (articleRef: string, emplacementName: string) => number;
  getArticleCurrentLocation: (articleRef: string) => string | null;
  processTransfer: (articleRef: string, sourceLocation: string, quantity: number, destinationLocation: string) => { success: boolean; error?: string };
  recalculateAllOccupancies: () => void;
}

/**
 * Round stock quantity based on unit type
 * - Whole items (Pièce, Boîte, Unité, Paire, Carton): Round to integer
 * - Weight/Volume (Kg, g, Litre, ml, Tonne): Round to 3 decimals
 */
const roundStockQuantity = (quantity: number, unit: string): number => {
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
const formatStockDisplay = (quantity: number): number => {
  return parseFloat(quantity.toFixed(3));
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialArticles: Article[] = [
  { id: 1, ref: "GN-M-001", nom: "Gants Nitrile M", categorie: "Gants Nitrile", stock: 2500, seuil: 500, unite: "Paire", uniteEntree: "Boîte", uniteSortie: "Paire", facteurConversion: 100, consommationParInventaire: -15, consommationJournaliere: 50, inventory: [{ zone: "Zone A - Rack 12", quantity: 1500 }, { zone: "Zone B - Rack 03", quantity: 1000 }] },
  { id: 2, ref: "GL-S-002", nom: "Gants Latex S", categorie: "Gants Latex", stock: 1800, seuil: 400, unite: "Paire", uniteEntree: "Boîte", uniteSortie: "Paire", facteurConversion: 100, consommationParInventaire: 12, consommationJournaliere: 35, inventory: [{ zone: "Zone A - Rack 12", quantity: 1800 }] },
  { id: 3, ref: "GV-L-003", nom: "Gants Vinyle L", categorie: "Gants Vinyle", stock: 3200, seuil: 600, unite: "Paire", uniteEntree: "Boîte", uniteSortie: "Paire", facteurConversion: 100, consommationParInventaire: 0, consommationJournaliere: 40, inventory: [{ zone: "Zone A - Rack 08", quantity: 2000 }, { zone: "Zone C - Rack 01", quantity: 1200 }] },
  { id: 4, ref: "GN-XL-004", nom: "Gants Nitrile XL", categorie: "Gants Nitrile", stock: 45, seuil: 200, unite: "Paire", uniteEntree: "Paire", uniteSortie: "Paire", facteurConversion: 1, consommationParInventaire: -5, consommationJournaliere: 15, inventory: [{ zone: "Zone B - Rack 03", quantity: 45 }] },
  { id: 5, ref: "SG-PE-005", nom: "Sur-gants PE", categorie: "Sur-gants", stock: 120, seuil: 500, unite: "Paire", uniteEntree: "Paire", uniteSortie: "Paire", facteurConversion: 1, consommationParInventaire: -2, consommationJournaliere: 8, inventory: [{ zone: "Zone D - Rack 05", quantity: 120 }] },
  { id: 6, ref: "MK-FFP2-006", nom: "Masques FFP2", categorie: "Masques", stock: 8000, seuil: 1000, unite: "Unité", uniteEntree: "Carton", uniteSortie: "Unité", facteurConversion: 1000, consommationParInventaire: -50, consommationJournaliere: 200, inventory: [{ zone: "Zone D - Rack 05", quantity: 5000 }, { zone: "Zone E - Quarantaine", quantity: 3000 }] },
];

const initialCategories: Categorie[] = [
  { id: 1, nom: "Gants Nitrile", description: "Gants en nitrile pour usage médical et industriel", articles: 8, stock: 12500 },
  { id: 2, nom: "Gants Latex", description: "Gants en latex naturel", articles: 5, stock: 8200 },
  { id: 3, nom: "Gants Vinyle", description: "Gants en vinyle pour usage court", articles: 4, stock: 6800 },
  { id: 4, nom: "Sur-gants", description: "Sur-gants de protection polyéthylène", articles: 3, stock: 3400 },
  { id: 5, nom: "Masques", description: "Masques de protection respiratoire", articles: 6, stock: 15000 },
  { id: 6, nom: "Accessoires", description: "Distributeurs, supports et accessoires", articles: 12, stock: 2200 },
];

const initialLocations: Emplacement[] = [
  { id: 1, code: "A-12", nom: "Zone A - Rack 12", type: "Stockage" },
  { id: 2, code: "B-03", nom: "Zone B - Rack 03", type: "Stockage" },
  { id: 3, code: "A-08", nom: "Zone A - Rack 08", type: "Stockage" },
  { id: 4, code: "C-01", nom: "Zone C - Rack 01", type: "Stockage" },
  { id: 5, code: "D-05", nom: "Zone D - Rack 05", type: "Stockage" },
  { id: 6, code: "E-02", nom: "Zone E - Quarantaine", type: "Stockage" },
];

const initialMovements: Mouvement[] = [
  { id: 1, date: "2026-03-02 14:32:20", article: "Gants Nitrile M", ref: "GN-M-001", type: "Entrée", qte: 500, qteOriginale: 5, uniteUtilisee: "Boîte", uniteSortie: "Paire", lotNumber: "LOT-2026-03-001", lotDate: "2026-02-28", emplacementDestination: "Zone A-12", operateur: "Karim B." },
  { id: 2, date: "2026-03-02 13:15:45", article: "Gants Latex S", ref: "GL-S-002", type: "Sortie", qte: 200, qteOriginale: 200, uniteUtilisee: "Paire", uniteSortie: "Paire", lotNumber: "LOT-2026-03-002", lotDate: "2026-02-27", emplacementDestination: "Département Production", operateur: "Sara M." },
  { id: 3, date: "2026-03-02 09:30:15", article: "Gants Nitrile M", ref: "GN-M-001", type: "Sortie", qte: 50, qteOriginale: 50, uniteUtilisee: "Paire", uniteSortie: "Paire", lotNumber: "LOT-2026-03-003", lotDate: "2026-03-01", emplacementSource: "Zone A - Rack 12", emplacementDestination: "Département Production", operateur: "Jean D.", statut: "Terminé", controleur: "Marie L.", etatArticles: "Conforme" },
  { id: 4, date: "2026-03-01 10:45:30", article: "Gants Nitrile M", ref: "GN-M-001", type: "Sortie", qte: 50, qteOriginale: 50, uniteUtilisee: "Paire", uniteSortie: "Paire", lotNumber: "LOT-2026-03-004", lotDate: "2026-02-28", emplacementSource: "Zone A - Rack 12", emplacementDestination: "Département Production", operateur: "Pierre M.", statut: "Terminé", controleur: "Marie L.", etatArticles: "Conforme" },
  { id: 5, date: "2026-03-01 11:20:00", article: "Masques FFP2", ref: "MK-FFP2-006", type: "Sortie", qte: 100, qteOriginale: 100, uniteUtilisee: "Unité", uniteSortie: "Unité", lotNumber: "LOT-2026-03-005", lotDate: "2026-02-27", emplacementSource: "Zone D - Rack 05", emplacementDestination: "Département Production", operateur: "Sophie R.", statut: "Terminé", controleur: "Marie L.", etatArticles: "Conforme" },
  { id: 6, date: "2026-03-01 14:15:45", article: "Masques FFP2", ref: "MK-FFP2-006", type: "Sortie", qte: 150, qteOriginale: 150, uniteUtilisee: "Unité", uniteSortie: "Unité", lotNumber: "LOT-2026-03-006", lotDate: "2026-02-28", emplacementSource: "Zone D - Rack 05", emplacementDestination: "Département Production", operateur: "Luc B.", statut: "Terminé", controleur: "Marie L.", etatArticles: "Conforme" },
];

const initialHistory: InventoryRecord[] = [
  { id: 1, dateHeure: "2025-02-24 14:30", article: "Gants Nitrile M", ref: "GN-M-001", emplacement: "Zone A - Rack 12", stockTheorique: 2500, stockPhysique: 2485, ecart: -15, uniteSortie: "Paire" },
  { id: 2, dateHeure: "2025-02-24 14:30", article: "Gants Latex S", ref: "GL-S-002", emplacement: "Zone A - Rack 12", stockTheorique: 1800, stockPhysique: 1812, ecart: 12, uniteSortie: "Paire" },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [categories, setCategories] = useState<Categorie[]>(initialCategories);
  const [emplacements, setEmplacements] = useState<Emplacement[]>(initialLocations);
  const [mouvements, setMouvements] = useState<Mouvement[]>(initialMovements);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryRecord[]>(initialHistory);

  const addArticle = (article: Omit<Article, "id">) => {
    const newId = Math.max(...articles.map(a => a.id), 0) + 1;
    setArticles([...articles, { ...article, id: newId }]);
  };

  const updateArticle = (id: number, updates: Partial<Article>) => {
    setArticles(articles.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteArticle = (id: number) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  const addCategorie = (categorie: Omit<Categorie, "id">) => {
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    setCategories([...categories, { ...categorie, id: newId }]);
  };

  const updateCategorie = (id: number, updates: Partial<Categorie>) => {
    setCategories(categories.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCategorie = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const addEmplacement = (emplacement: Omit<Emplacement, "id">) => {
    const newId = Math.max(...emplacements.map(e => e.id), 0) + 1;
    setEmplacements([...emplacements, { ...emplacement, id: newId }]);
  };

  const updateEmplacement = (id: number, updates: Partial<Emplacement>) => {
    setEmplacements(emplacements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEmplacement = (id: number) => {
    setEmplacements(emplacements.filter(e => e.id !== id));
  };

  const addMouvement = (mouvement: Omit<Mouvement, "id">) => {
    const newId = Math.max(...mouvements.map(m => m.id), 0) + 1;
    
    // TEMPORARY: All movements are now completed immediately (QC logic disabled)
    // Will be re-implemented later for both Entrée and Sortie
    let mouvementAvecStatut = mouvement;
    if (mouvement.type === "Sortie") {
      mouvementAvecStatut = { ...mouvement, statut: "Terminé" as const, status: "approved" as const };
    } else if (mouvement.type === "Ajustement") {
      mouvementAvecStatut = { ...mouvement, statut: "Terminé" as const, status: "approved" as const };
    } else if (mouvement.type === "Entrée") {
      mouvementAvecStatut = { ...mouvement, statut: "Terminé" as const, status: "approved" as const };
    } else if (mouvement.type === "Transfert") {
      mouvementAvecStatut = { ...mouvement, statut: "Terminé" as const, status: "approved" as const };
    }
    
    // Add new movement to the array (prepend for efficiency)
    // Note: Sorting by date is handled in the UI layer (MouvementsPage, Dashboard)
    // to ensure chronological consistency between mock and real data
    setMouvements(prev => [{ ...mouvementAvecStatut, id: newId }, ...prev]);
    
    // Update article stock based on movement type
    const article = articles.find(a => a.ref === mouvement.ref);
    if (article) {
      if (mouvement.type === "Entrée") {
        // CRITICAL: mouvement.qte is ALREADY in exit unit (smallest unit)
        // The conversion from entry unit to exit unit happens in the form BEFORE calling addMouvement
        // DO NOT multiply by facteurConversion again here - that would be double multiplication!
        
        const quantityInExitUnit = roundStockQuantity(mouvement.qte, article.uniteSortie);
        
        console.log(`[ENTRÉE] Article: ${article.nom}`);
        console.log(`  Quantité reçue (déjà en ${article.uniteSortie}): ${mouvement.qte}`);
        console.log(`  Quantité arrondie: ${quantityInExitUnit} ${article.uniteSortie}`);
        console.log(`  Stock avant: ${article.stock} ${article.uniteSortie}`);
        
        const rawNewStock = article.stock + quantityInExitUnit;
        const newStock = roundStockQuantity(rawNewStock, article.uniteSortie);
        
        console.log(`  Stock après (brut): ${rawNewStock} ${article.uniteSortie}`);
        console.log(`  Stock après (arrondi): ${newStock} ${article.uniteSortie}`);
        
        // Mettre à jour les inventory (en unité de sortie)
        const updatedInventory = [...article.inventory];
        const existingLocation = updatedInventory.find(l => l.zone === mouvement.emplacementDestination);
        
        if (existingLocation) {
          // CRITICAL: Convert to Number before adding to prevent string concatenation
          const rawLocationQty = Number(existingLocation.quantity) + Number(quantityInExitUnit);
          existingLocation.quantity = roundStockQuantity(rawLocationQty, article.uniteSortie);
        } else {
          updatedInventory.push({ 
            zone: mouvement.emplacementDestination, 
            quantity: Number(quantityInExitUnit)
          });
        }
        
        updateArticle(article.id, { stock: newStock, inventory: updatedInventory });
      } else if (mouvement.type === "Sortie") {
        // Pour les sorties, NE PAS déduire le stock immédiatement
        // Attendre l'approbation du contrôle qualité
        // Stock reste inchangé
        // NOTE: La quantité de sortie est DÉJÀ en unité de sortie (pas de conversion)
        console.log(`[SORTIE] Article: ${article.nom}`);
        console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
        console.log(`  En attente de validation qualité`);
      } else if (mouvement.type === "Ajustement") {
        // Pour les Ajustements: logique bi-directionnelle selon le typeAjustement
        // NOTE: Les ajustements sont TOUJOURS en unité de sortie
        if (mouvement.typeAjustement === "Surplus") {
          // SURPLUS: Ajouter au stock (comme une Entrée)
          const emplacementCible = mouvement.emplacementSource || mouvement.emplacementDestination;
          if (emplacementCible) {
            console.log(`[AJUSTEMENT SURPLUS] Article: ${article.nom}`);
            console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
            
            const newStock = article.stock + mouvement.qte;
            
            // Mettre à jour les inventory
            const updatedInventory = [...article.inventory];
            const existingLocation = updatedInventory.find(l => l.zone === emplacementCible);
            
            if (existingLocation) {
              // CRITICAL: Convert to Number before adding to prevent string concatenation
              existingLocation.quantity = Number(existingLocation.quantity) + Number(mouvement.qte);
            } else {
              updatedInventory.push({ zone: emplacementCible, quantity: Number(mouvement.qte) });
            }
            
            updateArticle(article.id, { stock: newStock, inventory: updatedInventory });
          }
        } else if (mouvement.typeAjustement === "Manquant") {
          // MANQUANT: Retirer du stock (comme une Sortie)
          if (mouvement.emplacementSource) {
            console.log(`[AJUSTEMENT MANQUANT] Article: ${article.nom}`);
            console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
            
            const updatedInventory = article.inventory.map(loc => {
              if (loc.zone === mouvement.emplacementSource) {
                return { ...loc, quantity: Math.max(0, loc.quantity - mouvement.qte) };
              }
              return loc;
            }).filter(l => l.quantity > 0);
            
            updateArticle(article.id, { 
              stock: Math.max(0, article.stock - mouvement.qte),
              inventory: updatedInventory 
            });
          }
        }
      }
      // Transfert ne change pas le stock total et est géré par processTransfer
    }
  };

  const updateMouvement = (id: number, updates: Partial<Mouvement>) => {
    const oldMouvement = mouvements.find(m => m.id === id);
    if (!oldMouvement) return;

    // Calculate stock adjustment
    const article = articles.find(a => a.ref === oldMouvement.ref);
    if (article && updates.qte !== undefined) {
      // Reverse the old movement effect
      let newStock = article.stock;
      
      if (oldMouvement.type === "Entrée") {
        newStock = article.stock - oldMouvement.qte;
      } else if (oldMouvement.type === "Sortie") {
        newStock = article.stock + oldMouvement.qte;
      }
      
      // Apply the new movement effect
      const newType = updates.type || oldMouvement.type;
      const newQte = updates.qte || oldMouvement.qte;
      
      if (newType === "Entrée") {
        newStock = newStock + newQte;
      } else if (newType === "Sortie") {
        newStock = newStock - newQte;
      }
      // Transfert ne change pas le stock total
      
      updateArticle(article.id, { stock: Math.max(0, newStock) });
    }

    setMouvements(mouvements.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMouvement = (id: number) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement) return;

    // Reverse the movement effect on stock
    const article = articles.find(a => a.ref === mouvement.ref);
    if (article) {
      let newStock = article.stock;
      
      if (mouvement.type === "Entrée") {
        newStock = article.stock - mouvement.qte;
      } else if (mouvement.type === "Sortie") {
        newStock = article.stock + mouvement.qte;
      }
      // Transfert ne change pas le stock total
      
      updateArticle(article.id, { stock: Math.max(0, newStock) });
    }

    setMouvements(mouvements.filter(m => m.id !== id));
  };

  const addInventoryRecord = (record: Omit<InventoryRecord, "id">) => {
    const newId = Math.max(...inventoryHistory.map(r => r.id), 0) + 1;
    setInventoryHistory([...inventoryHistory, { ...record, id: newId }]);
    
    // Update article consommationParInventaire
    const article = articles.find(a => a.nom === record.article);
    if (article) {
      updateArticle(article.id, { consommationParInventaire: record.ecart });
    }
  };

  const applyInventoryAdjustment = (articleId: number, emplacementNom: string, ecart: number) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    console.log(`[INVENTORY ADJUSTMENT] Article: ${article.nom}, Emplacement: ${emplacementNom}, Écart: ${ecart}`);

    // Update the specific location quantity
    const updatedInventory = article.inventory.map(loc => {
      if (loc.zone === emplacementNom) {
        // CRITICAL: Convert to Number before adding to prevent string concatenation
        const newQuantity = Math.max(0, Number(loc.quantity) + Number(ecart));
        console.log(`  Location ${emplacementNom}: ${loc.quantity} → ${newQuantity}`);
        return { ...loc, quantity: roundStockQuantity(newQuantity, article.uniteSortie) };
      }
      return loc;
    }).filter(l => Number(l.quantity) > 0); // Remove locations with 0 quantity

    // Update the total article stock
    const newTotalStock = Math.max(0, article.stock + ecart);
    console.log(`  Total Stock: ${article.stock} → ${newTotalStock}`);

    updateArticle(articleId, { 
      stock: roundStockQuantity(newTotalStock, article.uniteSortie),
      inventory: updatedInventory 
    });
  };

  const batchUpdateArticles = (updatedArticles: Article[]) => {
    setArticles(updatedArticles);
  };

  const batchAddInventoryRecords = (records: Array<Omit<InventoryRecord, "id">>) => {
    const newRecords = records.map((record, index) => {
      const newId = Math.max(...inventoryHistory.map(r => r.id), 0) + 1 + index;
      return { ...record, id: newId };
    });
    setInventoryHistory([...inventoryHistory, ...newRecords]);
  };

  const approveQualityControl = (id: number, controleur: string, etatArticles: "Conforme" | "Non-conforme", unitesDefectueuses: number = 0) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement || mouvement.type !== "Sortie") return;

    // CRITICAL: ALL units (including defective) have physically left the warehouse
    // We ALWAYS deduct the TOTAL quantity from inventory
    // Defective units are a PERMANENT LOSS and are NOT added back to stock
    const totalQtyToDeduct = mouvement.qte;

    // Calculer les quantités pour l'affichage dans le tableau (metadata only)
    const validQty = etatArticles === "Non-conforme" 
      ? mouvement.qte - unitesDefectueuses 
      : mouvement.qte;
    const defectiveQty = etatArticles === "Non-conforme" ? unitesDefectueuses : 0;

    // Mettre à jour le mouvement avec le statut "Terminé" et les métadonnées QC
    setMouvements(mouvements.map(m => 
      m.id === id 
        ? { 
            ...m, 
            statut: "Terminé" as const,
            status: "approved" as const,
            controleur,
            etatArticles,
            unitesDefectueuses: etatArticles === "Non-conforme" ? unitesDefectueuses : undefined,
            validQuantity: validQty,
            defectiveQuantity: defectiveQty
          }
        : m
    ));

    // CRITICAL: Use functional state update to ensure we read the LATEST article state
    // This prevents race conditions and ensures proper inventory updates
    setArticles(prevArticles => {
      return prevArticles.map(article => {
        // Only update the article that matches this mouvement
        if (article.ref !== mouvement.ref) {
          return article;
        }

        // CRITICAL: Find the specific zone and subtract ONLY from that zone
        if (!mouvement.emplacementSource) {
          return article;
        }

        console.log(`[SORTIE APPROVAL] Article: ${article.nom} | Zone: ${mouvement.emplacementSource} | Qty to deduct: ${totalQtyToDeduct}`);

        // Find the inventory entry for this specific zone
        const updatedInventory = article.inventory.map(loc => {
          if (loc.zone === mouvement.emplacementSource) {
            const currentQty = Number(loc.quantity);
            const newQty = Math.max(0, currentQty - totalQtyToDeduct);
            
            console.log(`[SORTIE APPROVAL] Zone: ${loc.zone} | Before: ${currentQty} | After: ${newQty}`);
            
            // CRITICAL: Return new object, don't mutate
            return { ...loc, quantity: newQty };
          }
          // CRITICAL: Preserve all other zones unchanged
          return loc;
        }).filter(l => Number(l.quantity) > 0); // Remove zones with 0 quantity

        // Calculate new total stock
        const newTotalStock = Math.max(0, article.stock - totalQtyToDeduct);

        console.log(`[SORTIE APPROVAL] Article: ${article.nom} | Total stock: ${article.stock} → ${newTotalStock}`);
        console.log(`[SORTIE APPROVAL] Remaining zones: ${updatedInventory.map(z => `${z.zone}(${z.quantity})`).join(', ')}`);

        // Return updated article with new inventory and stock
        return {
          ...article,
          stock: newTotalStock,
          inventory: updatedInventory
        };
      });
    });
  };

  const rejectQualityControl = (id: number, controleur: string, raison: string) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement || mouvement.type !== "Sortie") return;

    // Mettre à jour le mouvement avec le statut "Rejeté"
    setMouvements(mouvements.map(m => 
      m.id === id 
        ? { 
            ...m, 
            statut: "Rejeté" as const,
            status: "rejected" as const,
            controleur,
            raison,
            rejectionReason: raison
          }
        : m
    ));
  };

  const calculateEmplacementOccupancy = (emplacementName: string): number => {
    return articles
      .reduce((sum, a) => {
        const location = a.inventory.find(l => l.zone === emplacementName);
        return sum + (location?.quantity || 0);
      }, 0);
  };

  const getArticleLocations = (articleRef: string): InventoryEntry[] => {
    const article = articles.find(a => a.ref === articleRef);
    return article?.inventory || [];
  };

  const getArticleStockByLocation = (articleRef: string, emplacementName: string): number => {
    const article = articles.find(a => a.ref === articleRef);
    const location = article?.inventory.find(l => l.zone === emplacementName);
    return location?.quantity || 0;
  };

  const getArticleCurrentLocation = (articleRef: string): string | null => {
    // Récupère le dernier mouvement "Terminé" de l'article
    const lastMovement = mouvements
      .filter(m => m.ref === articleRef && m.statut !== "Rejeté")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .at(0);

    if (!lastMovement) return null;

    // Pour les Entrées et Transferts, retourner la destination
    if (lastMovement.type === "Entrée" || lastMovement.type === "Transfert") {
      return lastMovement.emplacementDestination;
    }

    // Pour les Sorties, retourner la source (avant la sortie)
    if (lastMovement.type === "Sortie") {
      return lastMovement.emplacementSource || null;
    }

    return null;
  };

  const processTransfer = (articleRef: string, sourceLocation: string, quantity: number, destinationLocation: string): { success: boolean; error?: string } => {
    const article = articles.find(a => a.ref === articleRef);
    if (!article) {
      return { success: false, error: "Article non trouvé" };
    }

    // Vérifier que la quantité disponible dans la source est suffisante
    const sourceStock = getArticleStockByLocation(articleRef, sourceLocation);
    if (quantity > sourceStock) {
      return { success: false, error: `Quantité insuffisante dans ${sourceLocation}. Disponible: ${sourceStock}` };
    }

    // Mettre à jour les inventory de l'article
    const updatedInventory = article.inventory.map(loc => {
      if (loc.zone === sourceLocation) {
        // CRITICAL: Convert to Number before subtracting to prevent string issues
        return { ...loc, quantity: Math.max(0, Number(loc.quantity) - Number(quantity)) };
      }
      if (loc.zone === destinationLocation) {
        // CRITICAL: Convert to Number before adding to prevent string concatenation
        return { ...loc, quantity: Number(loc.quantity) + Number(quantity) };
      }
      return loc;
    });

    // Si la destination n'existe pas dans les inventory, l'ajouter
    if (!updatedInventory.find(l => l.zone === destinationLocation)) {
      updatedInventory.push({ zone: destinationLocation, quantity: Number(quantity) });
    }

    // Supprimer les inventory avec quantité 0
    const cleanedInventory = updatedInventory.filter(l => Number(l.quantity) > 0);

    // Mettre à jour l'article avec les nouvelles inventory
    updateArticle(article.id, { inventory: cleanedInventory });

    return { success: true };
  };

  const recalculateAllOccupancies = () => {
    // No-op: Capacity tracking has been removed
  };

  return (
    <DataContext.Provider value={{
      articles,
      categories,
      emplacements,
      mouvements,
      inventoryHistory,
      addArticle,
      updateArticle,
      deleteArticle,
      addCategorie,
      updateCategorie,
      deleteCategorie,
      addEmplacement,
      updateEmplacement,
      deleteEmplacement,
      addMouvement,
      updateMouvement,
      deleteMouvement,
      approveQualityControl,
      rejectQualityControl,
      addInventoryRecord,
      applyInventoryAdjustment,
      batchUpdateArticles,
      batchAddInventoryRecords,
      calculateEmplacementOccupancy,
      getArticleLocations,
      getArticleStockByLocation,
      getArticleCurrentLocation,
      processTransfer,
      recalculateAllOccupancies,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

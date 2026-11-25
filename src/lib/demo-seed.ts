import type { Article, Categorie, Mouvement, Operation } from "@/contexts/DataContext";

export const DEMO_SEED_ENABLED = true;

// Categories updated for demo-only mode
export const demoCategories: Categorie[] = [
  { 
    id: 1, 
    nom: "Gants Latex", 
    description: "Gants en latex naturel chirurgicaux et d'examen", 
    articles: 2, 
    stock: 13000 
  },
  { 
    id: 2, 
    nom: "Emballages", 
    description: "Boîtes de rangement et emballages", 
    articles: 2, 
    stock: 7200 
  },
  { 
    id: 3, 
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

// LCG (Linear Congruential Generator) for deterministic randomness
class LCG {
  private state: number;
  
  constructor(seed: number) {
    this.state = seed;
  }
  
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(min + this.next() * (max - min + 1));
  }
  
  // Returns value in [-1, 1]
  nextBiased(): number {
    return this.next() * 2 - 1;
  }
}

// Memoization cache for getDemoData
let cachedData: { operations: Operation[]; movements: Mouvement[] } | null = null;
let cachedNow: number | null = null;

interface DemoDataResult {
  operations: Operation[];
  movements: Mouvement[];
}

/**
 * Generate 90 days of demo operations and movements
 * Deterministic for a given `now` parameter
 */
export function getDemoData(now: Date = new Date()): DemoDataResult {
  if (!DEMO_SEED_ENABLED) {
    return { operations: [], movements: [] };
  }
  
  // Memoization: return cached data if same `now` timestamp
  const nowTimestamp = now.getTime();
  if (cachedData && cachedNow === nowTimestamp) {
    return cachedData;
  }
  
  const rng = new LCG(20261123); // Fixed seed for determinism
  
  // Helper: check if a date is a working day (Sunday to Thursday)
  const isWorkingDay = (date: Date): boolean => {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    return day !== 5 && day !== 6; // Not Friday, not Saturday
  };
  
  // Helper: format date to YYYY-MM-DD HH:MM:SS
  const formatDateTime = (date: Date, hour: number = 9, minute: number = 0): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(hour).padStart(2, '0');
    const min = String(minute).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}:00`;
  };
  
  // Helper: format date to YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  
  // Helper: add months to date
  const addMonths = (date: Date, months: number): Date => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };
  
  // Helper: find nearest working day
  const nearestWorkingDay = (target: Date, workingDays: Date[]): Date => {
    let nearest = workingDays[0];
    let minDiff = Math.abs(target.getTime() - nearest.getTime());
    for (const wd of workingDays) {
      const diff = Math.abs(target.getTime() - wd.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        nearest = wd;
      }
    }
    return nearest;
  };
  
  // Calculate window: 90 days ending YESTERDAY
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(23, 59, 59, 999);
  
  const windowStart = new Date(yesterday);
  windowStart.setDate(windowStart.getDate() - 89);
  windowStart.setHours(0, 0, 0, 0);
  
  // Generate working days in window
  const workingDays: Date[] = [];
  for (let d = new Date(windowStart); d <= yesterday; d.setDate(d.getDate() + 1)) {
    if (isWorkingDay(d)) {
      workingDays.push(new Date(d));
    }
  }
  
  // Person names
  const operators = ["Karim B.", "Ahmed K.", "Yacine M.", "Samir H.", "Nadia S.", "Amel R.", "Rachid T.", "Fatima Z.", "Mourad D.", "Sofiane L.", "Lamia A.", "Hakim O."];
  const controllers = ["Amel R.", "Samir H.", "Nadia S.", "Hakim O."];
  const managers = ["Rachid T.", "Yacine M.", "Fatima Z."];
  const supplierNames = ["Fournisseur A", "Fournisseur B", "Fournisseur C"];
  
  // Destination mapping
  const destinationForArticle = (ref: string): string => {
    if (ref.startsWith("LN-") || ref.startsWith("LB-") || ref.startsWith("NC-") || ref.startsWith("BR-") || ref.startsWith("BD-")) {
      return "Département Production";
    }
    return rng.next() < 0.6 ? "Département Production" : "Client A";
  };
  
  // Article lot sizes (exit units)
  const lotSizes: Record<string, number> = {
    "BR-007": 50,
    "BD-008": 500,
    "GC-T75-009": 50,
    "GE-L-010": 100,
    "LN-60-011": 200,
    "LB-NBR-012": 200,
    "NC-025-013": 25,
  };
  
  // Target sortie quantities per article
  const targetSortie: Record<string, number> = {};
  demoArticles.forEach(article => {
    targetSortie[article.ref] = Math.round(90 * article.consommationJournaliere);
  });
  
  // Lot tracking per article
  const latestLots: Record<string, Record<string, string>> = {};
  
  // Build all operations BEFORE sorting
  interface OpBuilder {
    date: Date;
    type: "Entrée" | "Sortie" | "Transfert";
    hour: number;
    lines: Array<{
      article: Article;
      qte: number;
      qteOriginale: number;
      lotNumber?: string;
      lotDate?: string;
      validQuantity?: number;
      defectiveQuantity?: number;
      fournisseur?: string;
      emplacementSource?: string;
      emplacementDestination?: string;
    }>;
  }
  
  const opBuilders: OpBuilder[] = [];
  
  // === STEP 1: Build Entrée operations ===
  demoArticles.forEach((article, aIdx) => {
    const lotSize = lotSizes[article.ref];
    const Ta = targetSortie[article.ref];
    
    // Delivery days: nearest working day to windowStart + 3 + 2*aIdx + 14*k
    const deliveryDays: Date[] = [];
    for (let k = 0; ; k++) {
      const targetDate = new Date(windowStart);
      targetDate.setDate(targetDate.getDate() + 3 + 2 * aIdx + 14 * k);
      if (targetDate > workingDays[workingDays.length - 1]) break;
      const nearest = nearestWorkingDay(targetDate, workingDays);
      if (!deliveryDays.some(d => d.getTime() === nearest.getTime())) {
        deliveryDays.push(nearest);
      }
    }
    
    const numDeliveries = deliveryDays.length;
    if (numDeliveries === 0) return;
    
    // Total lots
    const totalLots = Math.max(numDeliveries, Math.round(0.96 * Ta / lotSize));
    
    // Spread lots evenly (difference <= 1)
    const baseLots = Math.floor(totalLots / numDeliveries);
    const extraLots = totalLots % numDeliveries;
    
    deliveryDays.forEach((day, dIdx) => {
      const lots = baseLots + (dIdx < extraLots ? 1 : 0);
      const qte = lots * lotSize;
      const qteOriginale = qte / article.facteurConversion;
      
      // Defective quantity: every 3rd delivery for gloves
      let defectiveQuantity = 0;
      if ((article.ref === "GC-T75-009" || article.ref === "GE-L-010") && dIdx % 3 === 2) {
        defectiveQuantity = Math.floor(0.02 * qte);
      }
      const validQuantity = qte - defectiveQuantity;
      
      // Lot number and date
      const lotNumber = `LOT-${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(dIdx + 1).padStart(3, '0')}`;
      const expiryMonths = article.ref.startsWith("GC-") || article.ref.startsWith("GE-") ? 24 :
                          article.ref.startsWith("LN-") || article.ref.startsWith("LB-") || article.ref.startsWith("NC-") ? 12 : 36;
      const lotDate = formatDate(addMonths(day, expiryMonths));
      
      // Track latest lot
      if (!latestLots[article.ref]) latestLots[article.ref] = {};
      latestLots[article.ref][formatDate(day)] = lotNumber;
      
      // Supplier
      const supplierId = article.supplierIds[aIdx % article.supplierIds.length];
      const fournisseur = supplierNames[supplierId - 1];
      
      // Find or create operation for this day
      let opBuilder = opBuilders.find(op => op.type === "Entrée" && op.date.getTime() === day.getTime());
      if (!opBuilder) {
        opBuilder = {
          date: new Date(day),
          type: "Entrée",
          hour: 8 + rng.nextInt(0, 180) / 60, // 8:00-11:00
          lines: []
        };
        opBuilders.push(opBuilder);
      }
      
      opBuilder.lines.push({
        article,
        qte,
        qteOriginale,
        lotNumber,
        lotDate,
        validQuantity,
        defectiveQuantity,
        fournisseur,
        emplacementDestination: article.inventory[0].zone,
      });
    });
  });
  
  // === STEP 2: Build Sortie operations ===
  // Calculate which articles appear on which days
  const sortieMatrix: boolean[][] = []; // [dayIdx][articleIdx]
  workingDays.forEach((day, i) => {
    sortieMatrix[i] = [];
    demoArticles.forEach((article, a) => {
      sortieMatrix[i][a] = (i + a) % 7 !== 0 && (3 * i + a) % 11 !== 0;
    });
  });
  
  // Calculate weights and allocate quantities
  demoArticles.forEach((article, aIdx) => {
    const Ta = targetSortie[article.ref];
    const includedDays: number[] = [];
    const weights: number[] = [];
    
    workingDays.forEach((day, i) => {
      if (sortieMatrix[i][aIdx]) {
        includedDays.push(i);
        const u = rng.nextBiased();
        weights.push(1 + 0.15 * u);
      }
    });
    
    if (includedDays.length === 0) return;
    
    // Allocate Ta proportionally with largest-remainder method
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const quotas = weights.map(w => (Ta * w) / totalWeight);
    const allocated = quotas.map(q => Math.floor(q));
    const remainders = quotas.map((q, idx) => ({ idx, rem: q - allocated[idx] }));
    remainders.sort((a, b) => b.rem - a.rem);
    
    let allocatedSum = allocated.reduce((sum, v) => sum + v, 0);
    for (const { idx } of remainders) {
      if (allocatedSum >= Ta) break;
      allocated[idx]++;
      allocatedSum++;
    }
    
    // Ensure every quantity >= 1
    for (let idx = 0; idx < allocated.length; idx++) {
      if (allocated[idx] === 0) {
        allocated[idx] = 1;
        allocatedSum++;
      }
    }
    
    // Adjust if over target
    while (allocatedSum > Ta && allocated.length > 0) {
      const maxIdx = allocated.reduce((iMax, val, i, arr) => val > arr[iMax] ? i : iMax, 0);
      if (allocated[maxIdx] > 1) {
        allocated[maxIdx]--;
        allocatedSum--;
      } else {
        break;
      }
    }
    
    // Create Sortie lines
    includedDays.forEach((dayIdx, allocIdx) => {
      const day = workingDays[dayIdx];
      const qte = allocated[allocIdx];
      
      // Get latest lot
      let lotNumber = `LOT-INIT-${article.ref}`;
      const dateStr = formatDate(day);
      if (latestLots[article.ref]) {
        const lotDates = Object.keys(latestLots[article.ref]).sort();
        for (const ld of lotDates) {
          if (ld <= dateStr) {
            lotNumber = latestLots[article.ref][ld];
          }
        }
      }
      
      // Source zone
      let sourceZone = article.inventory[0].zone;
      if (article.inventory.length > 1) {
        sourceZone = article.inventory[dayIdx % article.inventory.length].zone;
      }
      
      // Find or create Sortie operation
      let opBuilder = opBuilders.find(op => op.type === "Sortie" && op.date.getTime() === day.getTime());
      if (!opBuilder) {
        opBuilder = {
          date: new Date(day),
          type: "Sortie",
          hour: 14 + rng.nextInt(0, 180) / 60, // 14:00-17:00
          lines: []
        };
        opBuilders.push(opBuilder);
      }
      
      opBuilder.lines.push({
        article,
        qte,
        qteOriginale: qte,
        lotNumber,
        emplacementSource: sourceZone,
        emplacementDestination: destinationForArticle(article.ref),
      });
    });
  });
  
  // === STEP 3: Build Transfert operations ===
  const transfertArticle = demoArticles.find(a => a.ref === "GE-L-010");
  if (transfertArticle && transfertArticle.inventory.length >= 2 && workingDays.length >= 5) {
    const transfertIndices = [
      Math.floor(workingDays.length * 0.2),
      Math.floor(workingDays.length * 0.35),
      Math.floor(workingDays.length * 0.5),
      Math.floor(workingDays.length * 0.65),
      Math.floor(workingDays.length * 0.8),
    ];
    
    transfertIndices.forEach((dayIdx, tIdx) => {
      const day = workingDays[dayIdx];
      const direction = tIdx % 2 === 0;
      const sourceZone = direction ? transfertArticle.inventory[0].zone : transfertArticle.inventory[1].zone;
      const destZone = direction ? transfertArticle.inventory[1].zone : transfertArticle.inventory[0].zone;
      const qte = rng.nextInt(200, 500);
      
      opBuilders.push({
        date: new Date(day),
        type: "Transfert",
        hour: 11.5 + rng.nextInt(0, 90) / 60, // 11:30-13:00
        lines: [{
          article: transfertArticle,
          qte,
          qteOriginale: qte,
          lotNumber: `LOT-INIT-${transfertArticle.ref}`,
          emplacementSource: sourceZone,
          emplacementDestination: destZone,
        }]
      });
    });
  }
  
  // === STEP 4: Sort operations chronologically ===
  opBuilders.sort((a, b) => {
    const timeDiff = a.date.getTime() - b.date.getTime();
    if (timeDiff !== 0) return timeDiff;
    // Tie-breaker: Entrée < Sortie < Transfert
    const typeOrder = { "Entrée": 0, "Sortie": 1, "Transfert": 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
  
  // === STEP 5: Assign IDs and references ===
  const operations: Operation[] = [];
  const movements: Mouvement[] = [];
  let operationIdCounter = 100;
  let movementIdCounter = 1;
  const referenceCounters: Record<string, Record<string, number>> = {}; // year -> type -> counter
  
  opBuilders.forEach(opBuilder => {
    const year = opBuilder.date.getFullYear().toString();
    if (!referenceCounters[year]) referenceCounters[year] = {};
    if (!referenceCounters[year][opBuilder.type]) referenceCounters[year][opBuilder.type] = 0;
    referenceCounters[year][opBuilder.type]++;
    const counter = referenceCounters[year][opBuilder.type];
    
    const typePrefix = opBuilder.type === "Entrée" ? "IN" : opBuilder.type === "Sortie" ? "OUT" : "TRF";
    const reference = `${typePrefix}/${year}/${String(counter).padStart(4, '0')}`;
    
    const operationId = operationIdCounter++;
    const operateur = operators[operationIdCounter % operators.length];
    const controleur = controllers[operationIdCounter % controllers.length];
    const gestionnaire = managers[operationIdCounter % managers.length];
    
    const operation: Operation = {
      id: operationId,
      reference,
      type: opBuilder.type,
      operateur,
      datePlanifiee: formatDate(opBuilder.date),
      statut: "Terminé",
    };
    
    if (opBuilder.type === "Entrée") {
      operation.controleur = controleur;
      operation.gestionnaire = gestionnaire;
      operation.documentOrigine = `BC-${year}-${String(counter).padStart(4, '0')}`;
    } else if (opBuilder.type === "Sortie") {
      operation.controleur = controleur;
      operation.gestionnaire = gestionnaire;
    } else {
      operation.gestionnaire = gestionnaire;
    }
    
    operations.push(operation);
    
    // Create movements
    const baseHour = Math.floor(opBuilder.hour);
    const baseMinute = Math.floor((opBuilder.hour - baseHour) * 60);
    
    opBuilder.lines.forEach((line, lineIdx) => {
      const minute = Math.min(59, baseMinute + lineIdx * 2);
      const movement: Mouvement = {
        id: `D-${String(movementIdCounter++).padStart(4, '0')}`,
        date: formatDateTime(opBuilder.date, baseHour, minute),
        article: line.article.nom,
        ref: line.article.ref,
        type: opBuilder.type,
        qte: line.qte,
        qteOriginale: line.qteOriginale,
        uniteUtilisee: opBuilder.type === "Entrée" ? line.article.uniteEntree : line.article.uniteSortie,
        uniteSortie: line.article.uniteSortie,
        lotNumber: line.lotNumber || `LOT-INIT-${line.article.ref}`,
        operateur,
        statut: "Terminé",
        operationId,
        emplacementDestination: line.emplacementDestination || "",
      };
      
      if (opBuilder.type === "Entrée") {
        movement.lotDate = line.lotDate;
        movement.fournisseur = line.fournisseur;
        movement.emplacementDestination = line.emplacementDestination!;
        movement.status = "approved";
        movement.controleur = controleur;
        movement.etatArticles = "Conforme";
        movement.validQuantity = line.validQuantity;
        movement.defectiveQuantity = line.defectiveQuantity;
        movement.qcStatus = "Conforme";
        movement.noteControle = "";
        movement.verificationPoints = {};
        movement.wasDelayed = false;
      } else if (opBuilder.type === "Sortie") {
        movement.emplacementSource = line.emplacementSource;
        movement.emplacementDestination = line.emplacementDestination!;
        movement.controleur = controleur;
        movement.etatArticles = "Conforme";
      } else {
        // Transfert
        movement.emplacementSource = line.emplacementSource;
        movement.emplacementDestination = line.emplacementDestination!;
      }
      
      movements.push(movement);
    });
  });
  
  // Cache result
  cachedData = { operations, movements };
  cachedNow = nowTimestamp;
  
  return cachedData;
}

export function getDemoMovements(enabled: boolean = DEMO_SEED_ENABLED): Mouvement[] {
  return enabled ? getDemoData().movements : [];
}

export function getDemoOperations(enabled: boolean = DEMO_SEED_ENABLED): Operation[] {
  return enabled ? getDemoData().operations : [];
}

export function getDemoInventoryHistory(enabled: boolean = DEMO_SEED_ENABLED): never[] {
  return []; // Always empty for demo mode
}

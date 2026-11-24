import { parseMovementDate } from "@/lib/dashboard-utils";
import type { useData } from "@/contexts/DataContext";

// Type derivation (read-only, no DataContext modification)
type DataCtx = ReturnType<typeof useData>;
type Article = DataCtx["articles"][number];
type Mouvement = DataCtx["mouvements"][number];

export type Period = "7j" | "30j" | "90j" | "tout";

/**
 * Determine if a movement represents a real stock effect
 * Per Phase 13c DECIDED RULE:
 * - Counted if stockApplied === true OR (stockApplied undefined AND statut === "Terminé")
 * - NOT counted: stockApplied === false, Brouillon/En attente/En inspection, rejected/refused
 * - Transfert excluded (no effect on total stock, only zone moves)
 */
export function isRealStockMovement(m: Mouvement): boolean {
  // Transfert never affects total stock (only moves between zones)
  if (m.type === "Transfert") {
    return false;
  }

  // Deferred movements not yet applied
  if (m.stockApplied === false) {
    return false;
  }

  // Current workflow: stockApplied === true means applied
  if (m.stockApplied === true) {
    return true;
  }

  // Legacy/seed movements: stockApplied === undefined
  // Only count if statut === "Terminé" (already in stock)
  if (m.stockApplied === undefined) {
    return m.statut === "Terminé";
  }

  return false;
}

/**
 * Get the stock effect quantity of a movement
 * Returns 0 for movements not counted or Transfert
 * - Entrée: validQuantity (fallback to qte if undefined, then to 0)
 * - Sortie: full qte
 * - Transfert: 0 (excluded)
 */
export function getEffectQuantity(m: Mouvement): number {
  if (!isRealStockMovement(m)) {
    return 0;
  }

  if (m.type === "Entrée") {
    // validQuantity set during QC; fallback to qte for legacy, then 0
    return m.validQuantity !== undefined ? m.validQuantity : (m.qte || 0);
  }

  if (m.type === "Sortie") {
    // Full qte (including defective items)
    return m.qte || 0;
  }

  // Ajustement or other types: not counted
  return 0;
}

/**
 * Get start of period in local time
 * @param period Period type
 * @param now Current date
 * @returns Start date (start of local day) or null for "tout"
 */
export function startOfPeriod(period: Period, now: Date): Date | null {
  if (period === "tout") {
    return null;
  }

  const days = period === "7j" ? 7 : period === "30j" ? 30 : 90;

  // Start of day for (now minus (days - 1))
  const start = new Date(now);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return start;
}

/**
 * Compute product statistics for a given article and period
 * @param params Article, movements, period, and current time
 * @returns Statistics object
 */
export function computeProductStats(params: {
  article: Article;
  movements: Mouvement[];
  period: Period;
  now: Date;
}): {
  stockActuel: number;
  unite: string;
  entrees: number;
  sorties: number;
  nbMouvements: number;
  joursPeriode: number;
  consoMoyenneJour: number;
  autonomieJours: number | null;
} {
  const { article, movements, period, now } = params;

  const periodStart = startOfPeriod(period, now);
  const nowTimestamp = now.getTime();

  // Filter movements for this article, real stock effects, valid dates, within period
  const relevantMovements = movements.filter(m => {
    // Must match article
    if (m.ref !== article.ref) {
      return false;
    }

    // Must be a real stock movement
    if (!isRealStockMovement(m)) {
      return false;
    }

    // Must have valid date
    const movementDate = parseMovementDate(m.date);
    if (!movementDate) {
      return false;
    }

    const movementTimestamp = movementDate.getTime();

    // Must be within period
    if (periodStart !== null) {
      const periodStartTimestamp = periodStart.getTime();
      if (movementTimestamp < periodStartTimestamp || movementTimestamp > nowTimestamp) {
        return false;
      }
    } else {
      // "tout": only exclude future dates
      if (movementTimestamp > nowTimestamp) {
        return false;
      }
    }

    return true;
  });

  // Compute entrees, sorties, count
  let entrees = 0;
  let sorties = 0;
  let nbMouvements = 0;

  for (const m of relevantMovements) {
    const qty = getEffectQuantity(m);
    if (m.type === "Entrée") {
      entrees += qty;
      nbMouvements++;
    } else if (m.type === "Sortie") {
      sorties += qty;
      nbMouvements++;
    }
  }

  // Compute joursPeriode
  let joursPeriode = 1;

  if (period === "7j") {
    joursPeriode = 7;
  } else if (period === "30j") {
    joursPeriode = 30;
  } else if (period === "90j") {
    joursPeriode = 90;
  } else {
    // "tout": whole local days from first movement to today inclusive
    if (relevantMovements.length > 0) {
      // Find earliest movement date
      let earliestTimestamp = Infinity;
      for (const m of relevantMovements) {
        const movementDate = parseMovementDate(m.date);
        if (movementDate) {
          earliestTimestamp = Math.min(earliestTimestamp, movementDate.getTime());
        }
      }

      if (earliestTimestamp !== Infinity) {
        // Start of earliest day
        const earliestDate = new Date(earliestTimestamp);
        earliestDate.setHours(0, 0, 0, 0);

        // Start of today
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // Days difference (inclusive)
        const diffMs = todayStart.getTime() - earliestDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

        joursPeriode = Math.max(1, diffDays);
      }
    }
  }

  // Compute consumption moyenne and autonomy
  const consoMoyenneJour = sorties / joursPeriode;
  const autonomieJours = consoMoyenneJour > 0 ? article.stock / consoMoyenneJour : null;

  return {
    stockActuel: article.stock,
    unite: article.uniteSortie,
    entrees,
    sorties,
    nbMouvements,
    joursPeriode,
    consoMoyenneJour,
    autonomieJours,
  };
}

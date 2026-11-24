import { parseMovementDate } from "@/lib/dashboard-utils";
import { isRealStockMovement, getEffectQuantity, startOfPeriod, type Period } from "@/lib/product-stats";
import type { useData } from "@/contexts/DataContext";

// Type derivation (read-only, no DataContext modification)
type DataCtx = ReturnType<typeof useData>;
type Article = DataCtx["articles"][number];
type Mouvement = DataCtx["mouvements"][number];

export type SeriesPoint = {
  key: string;
  label: string;
  fullLabel: string;
  entrees: number;
  sorties: number;
  stock: number;
};

export type ProductSeriesResult = {
  granularity: "day" | "week";
  points: SeriesPoint[];
};

/**
 * Build product time series data for charts
 * Returns continuous buckets (day or week) with entrees/sorties sums and reconstructed stock
 * 
 * Rules:
 * - Movements filtered same as computeProductStats: article ref, isRealStockMovement, valid date, date <= now
 * - For 7j/30j/90j: also filter date >= startOfPeriod
 * - Range: 7j/30j/90j from startOfPeriod to now; "tout" from earliest movement to now
 * - Granularity: "day" for <= 90 days range, "week" for > 90 days (weeks start Monday)
 * - Buckets are continuous with zeros for empty buckets
 * - Stock reconstructed backwards from article.stock
 * - Never mutates inputs, never calls new Date() inside (now is a parameter)
 */
export function buildProductSeries({
  article,
  movements,
  period,
  now,
}: {
  article: Article;
  movements: Mouvement[];
  period: Period;
  now: Date;
}): ProductSeriesResult {
  // Filter movements: same selection as computeProductStats
  const periodStart = startOfPeriod(period, now);

  const countedMovements = movements.filter((m) => {
    // Same article
    if (m.ref !== article.ref) return false;

    // Real stock movement
    if (!isRealStockMovement(m)) return false;

    // Valid date
    const movementDate = parseMovementDate(m.date);
    if (!movementDate) return false;

    // Not in the future
    if (movementDate > now) return false;

    // Period boundary
    if (periodStart !== null && movementDate < periodStart) return false;

    return true;
  });

  // If no counted movements for "tout", return empty
  if (countedMovements.length === 0 && period === "tout") {
    return { granularity: "day", points: [] };
  }

  // Determine range
  let rangeStart: Date;
  let rangeEnd: Date = now;

  if (period === "tout") {
    // Find earliest movement date and get start of its day
    const earliestDate = countedMovements.reduce((earliest, m) => {
      const mDate = parseMovementDate(m.date)!;
      return mDate < earliest ? mDate : earliest;
    }, parseMovementDate(countedMovements[0].date)!);

    // Start of day for earliest movement (local time)
    rangeStart = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), earliestDate.getDate());
  } else {
    rangeStart = periodStart!;
  }

  // Calculate range in days
  const msPerDay = 24 * 60 * 60 * 1000;
  const startOfDayNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDayStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
  const rangeDays = Math.floor((startOfDayNow.getTime() - startOfDayStart.getTime()) / msPerDay) + 1;

  // Determine granularity
  const granularity: "day" | "week" = rangeDays <= 90 ? "day" : "week";

  // Build buckets
  if (granularity === "day") {
    return buildDailyBuckets(article, countedMovements, rangeStart, now, rangeDays);
  } else {
    return buildWeeklyBuckets(article, countedMovements, rangeStart, now);
  }
}

function buildDailyBuckets(
  article: Article,
  movements: Mouvement[],
  rangeStart: Date,
  now: Date,
  rangeDays: number
): ProductSeriesResult {
  // Create continuous buckets
  const buckets: Array<{
    key: string;
    label: string;
    fullLabel: string;
    start: Date;
    end: Date;
    entrees: number;
    sorties: number;
  }> = [];

  for (let i = 0; i < rangeDays; i++) {
    const dayStart = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i);
    const dayEnd = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate() + i + 1);

    const key = `${dayStart.getFullYear()}-${String(dayStart.getMonth() + 1).padStart(2, "0")}-${String(dayStart.getDate()).padStart(2, "0")}`;
    const label = `${String(dayStart.getDate()).padStart(2, "0")}/${String(dayStart.getMonth() + 1).padStart(2, "0")}`;
    const fullLabel = `${String(dayStart.getDate()).padStart(2, "0")}/${String(dayStart.getMonth() + 1).padStart(2, "0")}/${dayStart.getFullYear()}`;

    buckets.push({
      key,
      label,
      fullLabel,
      start: dayStart,
      end: dayEnd,
      entrees: 0,
      sorties: 0,
    });
  }

  // Assign movements to buckets
  for (const m of movements) {
    const mDate = parseMovementDate(m.date)!;
    const qty = getEffectQuantity(m);

    for (const bucket of buckets) {
      if (mDate >= bucket.start && mDate < bucket.end) {
        if (m.type === "Entrée") {
          bucket.entrees += qty;
        } else if (m.type === "Sortie") {
          bucket.sorties += qty;
        }
        break;
      }
    }
  }

  // Reconstruct stock backwards
  const points: SeriesPoint[] = buckets.map((b) => ({
    key: b.key,
    label: b.label,
    fullLabel: b.fullLabel,
    entrees: b.entrees,
    sorties: b.sorties,
    stock: 0,
  }));

  // Last bucket stock = article.stock
  if (points.length > 0) {
    points[points.length - 1].stock = article.stock;

    // Work backwards
    for (let i = points.length - 2; i >= 0; i--) {
      points[i].stock = points[i + 1].stock - (points[i + 1].entrees - points[i + 1].sorties);
    }
  }

  return { granularity: "day", points };
}

function buildWeeklyBuckets(
  article: Article,
  movements: Mouvement[],
  rangeStart: Date,
  now: Date
): ProductSeriesResult {
  // Find the Monday on or before rangeStart
  const startDay = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
  const dayOfWeek = startDay.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days to subtract to get to Monday
  const firstMonday = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() - daysToMonday);

  // Build weekly buckets
  const buckets: Array<{
    key: string;
    label: string;
    fullLabel: string;
    start: Date;
    end: Date;
    entrees: number;
    sorties: number;
  }> = [];

  let currentMonday = new Date(firstMonday);
  while (currentMonday <= now) {
    const weekEnd = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 7);

    const key = `${currentMonday.getFullYear()}-${String(currentMonday.getMonth() + 1).padStart(2, "0")}-${String(currentMonday.getDate()).padStart(2, "0")}`;
    const label = `${String(currentMonday.getDate()).padStart(2, "0")}/${String(currentMonday.getMonth() + 1).padStart(2, "0")}`;
    const fullLabel = `Semaine du ${String(currentMonday.getDate()).padStart(2, "0")}/${String(currentMonday.getMonth() + 1).padStart(2, "0")}/${currentMonday.getFullYear()}`;

    buckets.push({
      key,
      label,
      fullLabel,
      start: new Date(currentMonday),
      end: weekEnd,
      entrees: 0,
      sorties: 0,
    });

    currentMonday = new Date(currentMonday.getFullYear(), currentMonday.getMonth(), currentMonday.getDate() + 7);
  }

  // Assign movements to buckets
  for (const m of movements) {
    const mDate = parseMovementDate(m.date)!;
    const qty = getEffectQuantity(m);

    for (const bucket of buckets) {
      if (mDate >= bucket.start && mDate < bucket.end) {
        if (m.type === "Entrée") {
          bucket.entrees += qty;
        } else if (m.type === "Sortie") {
          bucket.sorties += qty;
        }
        break;
      }
    }
  }

  // Reconstruct stock backwards
  const points: SeriesPoint[] = buckets.map((b) => ({
    key: b.key,
    label: b.label,
    fullLabel: b.fullLabel,
    entrees: b.entrees,
    sorties: b.sorties,
    stock: 0,
  }));

  // Last bucket stock = article.stock
  if (points.length > 0) {
    points[points.length - 1].stock = article.stock;

    // Work backwards
    for (let i = points.length - 2; i >= 0; i--) {
      points[i].stock = points[i + 1].stock - (points[i + 1].entrees - points[i + 1].sorties);
    }
  }

  return { granularity: "week", points };
}

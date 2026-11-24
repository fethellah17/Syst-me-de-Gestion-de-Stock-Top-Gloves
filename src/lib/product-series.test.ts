import { describe, it, expect } from "vitest";
import { buildProductSeries } from "./product-series";

describe("Product Series", () => {
  describe("buildProductSeries", () => {
    it("should create continuous daily buckets with zeros", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23); // Nov 23
      const result = buildProductSeries({ article, movements, period: "7j", now });

      expect(result.granularity).toBe("day");
      expect(result.points.length).toBe(7); // Nov 17-23 inclusive
      
      // Check continuous dates
      expect(result.points[0].label).toBe("17/11");
      expect(result.points[6].label).toBe("23/11");
      
      // Most buckets should be zero except Nov 20
      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(100);
      expect(nov20?.sorties).toBe(0);

      const nov17 = result.points.find(p => p.label === "17/11");
      expect(nov17?.entrees).toBe(0);
      expect(nov17?.sorties).toBe(0);
    });

    it("should sum movements correctly per bucket", () => {
      const article = {
        ref: "ART-001",
        stock: 800,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Entrée" as const, qte: 50, stockApplied: true, date: "2026-11-20 14:00:00" },
        { ref: "ART-001", type: "Sortie" as const, qte: 30, stockApplied: true, date: "2026-11-20 16:00:00" },
        { ref: "ART-001", type: "Sortie" as const, qte: 20, stockApplied: true, date: "2026-11-21 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23); // Nov 23
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(150); // 100 + 50
      expect(nov20?.sorties).toBe(30);

      const nov21 = result.points.find(p => p.label === "21/11");
      expect(nov21?.entrees).toBe(0);
      expect(nov21?.sorties).toBe(20);
    });

    it("should ignore Transfert movements", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Transfert" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Entrée" as const, qte: 50, stockApplied: true, date: "2026-11-20 14:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(50); // Only Entrée counted
      expect(nov20?.sorties).toBe(0);
    });

    it("should ignore non-counted movements", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: false, date: "2026-11-20 10:00:00" }, // Deferred
        { ref: "ART-001", type: "Sortie" as const, qte: 50, statut: "En attente", date: "2026-11-20 14:00:00" }, // Pending
        { ref: "ART-001", type: "Entrée" as const, qte: 200, stockApplied: true, date: "2026-11-21 10:00:00" }, // Counted
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(0);
      expect(nov20?.sorties).toBe(0);

      const nov21 = result.points.find(p => p.label === "21/11");
      expect(nov21?.entrees).toBe(200);
    });

    it("should ignore movements from other articles", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-002", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Entrée" as const, qte: 50, stockApplied: true, date: "2026-11-20 14:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(50); // Only ART-001
    });

    it("should ignore invalid dates", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "invalid-date" },
        { ref: "ART-001", type: "Entrée" as const, qte: 50, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(50); // Only valid date
    });

    it("should ignore future-dated movements", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Entrée" as const, qte: 200, stockApplied: true, date: "2026-11-25 10:00:00" }, // Future
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      const nov20 = result.points.find(p => p.label === "20/11");
      expect(nov20?.entrees).toBe(100);

      // Nov 25 should not exist in 7j period ending Nov 23
      const nov25 = result.points.find(p => p.label === "25/11");
      expect(nov25).toBeUndefined();
    });

    it("should start tout at the earliest counted movement", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-01 10:00:00" }, // Nov 1
        { ref: "ART-001", type: "Sortie" as const, qte: 30, stockApplied: true, date: "2026-11-15 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "tout", now });

      expect(result.granularity).toBe("day");
      expect(result.points[0].label).toBe("01/11"); // Nov 1
      expect(result.points[0].key).toBe("2026-11-01");
      expect(result.points[result.points.length - 1].label).toBe("23/11");
    });

    it("should use weekly buckets for tout over 90 days", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      // Movement on March 1, 2026 (a Sunday) and March 2, 2026 (a Monday)
      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-03-01 10:00:00" }, // Sunday
        { ref: "ART-001", type: "Sortie" as const, qte: 30, stockApplied: true, date: "2026-03-02 10:00:00" }, // Monday
      ] as any[];

      const now = new Date(2026, 10, 23); // Nov 23, 2026
      const result = buildProductSeries({ article, movements, period: "tout", now });

      expect(result.granularity).toBe("week");
      
      // March 1 is a Sunday, so it should land in the week starting Feb 23 (previous Monday)
      // March 2 is a Monday, so it should land in the week starting March 2
      const firstWeek = result.points[0];
      expect(firstWeek.fullLabel).toContain("Semaine du");
      
      // Verify they land in different weeks
      const march1Week = result.points.find(p => p.sorties === 50);
      const march2Week = result.points.find(p => p.sorties === 30);
      expect(march1Week).toBeDefined();
      expect(march2Week).toBeDefined();
      expect(march1Week?.key).not.toBe(march2Week?.key);
    });

    it("should return empty points when no counted movements for tout", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: false, date: "2026-11-20 10:00:00" }, // Not counted
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "tout", now });

      expect(result.granularity).toBe("day");
      expect(result.points.length).toBe(0);
    });

    it("should have last point stock equal to article.stock", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      expect(result.points[result.points.length - 1].stock).toBe(1000);
    });

    it("should maintain backward consistency in stock calculation", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-21 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      // Verify backward consistency: stock[i-1] = stock[i] - (entrees[i] - sorties[i])
      for (let i = result.points.length - 1; i > 0; i--) {
        const current = result.points[i];
        const previous = result.points[i - 1];
        const expectedPrevStock = current.stock - (current.entrees - current.sorties);
        expect(previous.stock).toBe(expectedPrevStock);
      }
    });

    it("should produce exactly 7 points for 7j period", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [] as any[];

      const now = new Date(2026, 10, 23);
      const result = buildProductSeries({ article, movements, period: "7j", now });

      expect(result.granularity).toBe("day");
      expect(result.points.length).toBe(7);
    });

    it("should not mutate inputs", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const originalMovements = JSON.stringify(movements);
      const originalArticle = JSON.stringify(article);

      const now = new Date(2026, 10, 23);
      buildProductSeries({ article, movements, period: "7j", now });

      expect(JSON.stringify(movements)).toBe(originalMovements);
      expect(JSON.stringify(article)).toBe(originalArticle);
    });
  });
});

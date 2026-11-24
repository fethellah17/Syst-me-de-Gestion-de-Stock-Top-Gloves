import { describe, it, expect } from "vitest";
import {
  isRealStockMovement,
  getEffectQuantity,
  startOfPeriod,
  computeProductStats,
  type Period,
} from "./product-stats";

describe("Product Stats", () => {
  describe("isRealStockMovement", () => {
    it("should count legacy Terminé movements", () => {
      const m = {
        type: "Sortie" as const,
        stockApplied: undefined,
        statut: "Terminé" as const,
      } as any;
      expect(isRealStockMovement(m)).toBe(true);
    });

    it("should NOT count legacy En attente movements", () => {
      const m = {
        type: "Entrée" as const,
        stockApplied: undefined,
        statut: "En attente" as const,
      } as any;
      expect(isRealStockMovement(m)).toBe(false);
    });

    it("should NOT count stockApplied false (deferred)", () => {
      const m = {
        type: "Entrée" as const,
        stockApplied: false,
        statut: "Terminé" as const,
      } as any;
      expect(isRealStockMovement(m)).toBe(false);
    });

    it("should count stockApplied true movements", () => {
      const m = {
        type: "Sortie" as const,
        stockApplied: true,
        statut: "Terminé" as const,
      } as any;
      expect(isRealStockMovement(m)).toBe(true);
    });

    it("should NOT count rejected movements", () => {
      const m = {
        type: "Sortie" as const,
        stockApplied: undefined,
        statut: "Rejeté" as const,
      } as any;
      expect(isRealStockMovement(m)).toBe(false);
    });

    it("should exclude Transfert regardless of stockApplied", () => {
      const m1 = {
        type: "Transfert" as const,
        stockApplied: true,
        statut: "Terminé" as const,
      } as any;
      const m2 = {
        type: "Transfert" as const,
        stockApplied: undefined,
        statut: "Terminé" as const,
      } as any;
      expect(isRealStockMovement(m1)).toBe(false);
      expect(isRealStockMovement(m2)).toBe(false);
    });
  });

  describe("getEffectQuantity", () => {
    it("should use validQuantity for Entrée when present", () => {
      const m = {
        type: "Entrée" as const,
        qte: 1000,
        validQuantity: 950,
        stockApplied: true,
      } as any;
      expect(getEffectQuantity(m)).toBe(950);
    });

    it("should fallback to qte for Entrée when validQuantity undefined", () => {
      const m = {
        type: "Entrée" as const,
        qte: 1000,
        validQuantity: undefined,
        stockApplied: undefined,
        statut: "Terminé" as const,
      } as any;
      expect(getEffectQuantity(m)).toBe(1000);
    });

    it("should use full qte for Sortie", () => {
      const m = {
        type: "Sortie" as const,
        qte: 200,
        stockApplied: true,
      } as any;
      expect(getEffectQuantity(m)).toBe(200);
    });

    it("should return 0 for Transfert", () => {
      const m = {
        type: "Transfert" as const,
        qte: 50,
        stockApplied: true,
      } as any;
      expect(getEffectQuantity(m)).toBe(0);
    });

    it("should return 0 for non-counted movements", () => {
      const m = {
        type: "Entrée" as const,
        qte: 500,
        stockApplied: false,
      } as any;
      expect(getEffectQuantity(m)).toBe(0);
    });
  });

  describe("startOfPeriod", () => {
    it("should return null for tout", () => {
      const now = new Date(2026, 10, 23, 15, 30);
      const start = startOfPeriod("tout", now);
      expect(start).toBeNull();
    });

    it("should return start of day 7 days ago for 7j", () => {
      const now = new Date(2026, 10, 23, 15, 30);
      const start = startOfPeriod("7j", now);
      expect(start).not.toBeNull();
      expect(start!.getFullYear()).toBe(2026);
      expect(start!.getMonth()).toBe(10); // November
      expect(start!.getDate()).toBe(17); // 23 - 6
      expect(start!.getHours()).toBe(0);
      expect(start!.getMinutes()).toBe(0);
    });

    it("should return start of day 30 days ago for 30j", () => {
      const now = new Date(2026, 10, 23, 15, 30);
      const start = startOfPeriod("30j", now);
      expect(start).not.toBeNull();
      expect(start!.getDate()).toBe(25); // Oct 25 (23 - 29, crosses month)
    });

    it("should return start of day 90 days ago for 90j", () => {
      const now = new Date(2026, 10, 23, 15, 30);
      const start = startOfPeriod("90j", now);
      expect(start).not.toBeNull();
      // 23 Nov - 89 days = Aug 26
      expect(start!.getMonth()).toBe(7); // August
    });
  });

  describe("computeProductStats", () => {
    it("should filter movements by article ref", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-002", type: "Entrée" as const, qte: 200, stockApplied: true, date: "2026-11-20 11:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const stats = computeProductStats({ article, movements, period: "7j", now });

      expect(stats.entrees).toBe(100); // Only ART-001
      expect(stats.nbMouvements).toBe(1);
    });

    it("should respect period boundaries for 7j", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const now = new Date(2026, 10, 23, 23, 59, 59, 999); // Nov 23 end of day
      // 7j period: Nov 17-23 inclusive

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-17 00:00:00" }, // Day 1 (included)
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-16 23:59:59" }, // Before (excluded)
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-23 23:59:59" }, // Today (included)
      ] as any[];

      const stats = computeProductStats({ article, movements, period: "7j", now });

      expect(stats.sorties).toBe(100); // 2 movements
      expect(stats.nbMouvements).toBe(2);
    });

    it("should exclude movements dated after now for 7j and tout", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const now = new Date(2026, 10, 23, 12, 0, 0); // Nov 23 noon

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-20 10:00:00" }, // Before now (included)
        { ref: "ART-001", type: "Sortie" as const, qte: 100, stockApplied: true, date: "2026-11-25 10:00:00" }, // After now (excluded)
        { ref: "ART-001", type: "Entrée" as const, qte: 200, stockApplied: true, date: "2026-11-24 10:00:00" }, // After now (excluded)
      ] as any[];

      const stats7j = computeProductStats({ article, movements, period: "7j", now });
      expect(stats7j.sorties).toBe(50); // Only Nov 20
      expect(stats7j.entrees).toBe(0); // Nov 24 excluded
      expect(stats7j.nbMouvements).toBe(1);

      const statsTout = computeProductStats({ article, movements, period: "tout", now });
      expect(statsTout.sorties).toBe(50); // Only Nov 20
      expect(statsTout.entrees).toBe(0); // Nov 24 excluded
      expect(statsTout.nbMouvements).toBe(1);
    });

    it("should exclude invalid dates", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Entrée" as const, qte: 100, stockApplied: true, date: "2026-11-20 10:00:00" },
        { ref: "ART-001", type: "Entrée" as const, qte: 200, stockApplied: true, date: "invalid-date" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const stats = computeProductStats({ article, movements, period: "7j", now });

      expect(stats.entrees).toBe(100); // Invalid excluded
      expect(stats.nbMouvements).toBe(1);
    });

    it("should compute joursPeriode from first movement for tout", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const now = new Date(2026, 10, 23); // Nov 23

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-01 10:00:00" }, // Nov 1
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-15 10:00:00" },
      ] as any[];

      const stats = computeProductStats({ article, movements, period: "tout", now });

      // Nov 1 to Nov 23 = 23 days
      expect(stats.joursPeriode).toBe(23);
    });

    it("should compute consoMoyenneJour and autonomieJours", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 70, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const now = new Date(2026, 10, 23);
      const stats = computeProductStats({ article, movements, period: "7j", now });

      expect(stats.sorties).toBe(70);
      expect(stats.joursPeriode).toBe(7);
      expect(stats.consoMoyenneJour).toBe(70 / 7); // 10
      expect(stats.autonomieJours).toBe(1000 / (70 / 7)); // 100
    });

    it("should return null autonomieJours when sorties = 0", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements: any[] = [];

      const now = new Date(2026, 10, 23);
      const stats = computeProductStats({ article, movements, period: "7j", now });

      expect(stats.sorties).toBe(0);
      expect(stats.consoMoyenneJour).toBe(0);
      expect(stats.autonomieJours).toBeNull();
    });

    it("should not mutate inputs", () => {
      const article = {
        ref: "ART-001",
        stock: 1000,
        uniteSortie: "Paire",
      } as any;

      const movements = [
        { ref: "ART-001", type: "Sortie" as const, qte: 50, stockApplied: true, date: "2026-11-20 10:00:00" },
      ] as any[];

      const originalMovements = [...movements];
      const originalArticle = { ...article };

      const now = new Date(2026, 10, 23);
      computeProductStats({ article, movements, period: "7j", now });

      expect(article).toEqual(originalArticle);
      expect(movements).toEqual(originalMovements);
    });
  });
});

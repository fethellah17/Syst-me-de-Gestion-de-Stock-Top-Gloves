import { describe, it, expect } from "vitest";
import type { Article } from "@/contexts/DataContext";
import { applyTransferStock, computeOperationStockEffect } from "./stock-effects";

/**
 * Phase 7c: Tests for Transfert stock deferral
 * 
 * These tests validate:
 * - applyTransferStock pure function (same math as processTransfer)
 * - computeOperationStockEffect extended to include Transfert
 * - Line-order validation for mixed Entrée + Transfert operations
 */

describe("Phase 7c: Transfer Stock Effects", () => {
  const createArticle = (ref: string, stock: number, inventory: Array<{ zone: string; quantity: number }>): Article => ({
    id: 1,
    nom: `Article ${ref}`,
    ref,
    categorie: "Test",
    stock,
    seuil: 100,
    uniteSortie: "Pièce",
    uniteEntree: "Pièce",
    facteurConversion: 1,
    inventory
  });

  describe("applyTransferStock - pure function", () => {
    it("should transfer 300 from zone A (600) to zone B (existing)", () => {
      const article = createArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 600 },
        { zone: "Zone B", quantity: 400 }
      ]);

      const result = applyTransferStock(article, "Zone A", "Zone B", 300);

      expect(result.stock).toBe(1000); // Total stock unchanged
      expect(result.inventory.find(l => l.zone === "Zone A")?.quantity).toBe(300); // 600 - 300
      expect(result.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(700); // 400 + 300
      expect(result.inventory).toHaveLength(2);
    });

    it("should transfer into a missing zone (zone created)", () => {
      const article = createArticle("TEST-002", 500, [
        { zone: "Zone A", quantity: 500 }
      ]);

      const result = applyTransferStock(article, "Zone A", "Zone C", 200);

      expect(result.stock).toBe(500); // Total stock unchanged
      expect(result.inventory.find(l => l.zone === "Zone A")?.quantity).toBe(300); // 500 - 200
      expect(result.inventory.find(l => l.zone === "Zone C")?.quantity).toBe(200); // Created
      expect(result.inventory).toHaveLength(2);
    });

    it("should transfer the full zone quantity (source zone removed)", () => {
      const article = createArticle("TEST-003", 800, [
        { zone: "Zone A", quantity: 300 },
        { zone: "Zone B", quantity: 500 }
      ]);

      const result = applyTransferStock(article, "Zone A", "Zone B", 300);

      expect(result.stock).toBe(800); // Total stock unchanged
      expect(result.inventory.find(l => l.zone === "Zone A")).toBeUndefined(); // Removed (0 quantity)
      expect(result.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(800); // 500 + 300
      expect(result.inventory).toHaveLength(1);
    });

    it("should use Math.max(0, ...) for source zone quantity", () => {
      const article = createArticle("TEST-004", 100, [
        { zone: "Zone A", quantity: 50 }
      ]);

      // Transfer more than available (validation should catch this, but test the math)
      const result = applyTransferStock(article, "Zone A", "Zone B", 100);

      expect(result.stock).toBe(100); // Total stock unchanged
      expect(result.inventory.find(l => l.zone === "Zone A")).toBeUndefined(); // Removed (clamped to 0)
      expect(result.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(100);
    });
  });

  describe("computeOperationStockEffect - Transfert validation", () => {
    it("should fail when two transfers from the same zone exceed available stock", () => {
      const articles = [
        createArticle("TEST-005", 500, [
          { zone: "Zone A", quantity: 500 }
        ])
      ];

      const movements = [
        {
          id: "1",
          ref: "TEST-005",
          type: "Transfert" as const,
          qte: 300,
          emplacementSource: "Zone A",
          emplacementDestination: "Zone B",
          stockApplied: false
        },
        {
          id: "2",
          ref: "TEST-005",
          type: "Transfert" as const,
          qte: 300,
          emplacementSource: "Zone A",
          emplacementDestination: "Zone C",
          stockApplied: false
        }
      ];

      const result = computeOperationStockEffect(articles, movements as any);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Insufficient stock");
      expect(result.failedLines).toHaveLength(1);
      expect(result.failedLines![0]).toContain("Zone A");
      expect(result.failedLines![0]).toContain("need 300, have 200"); // After first transfer, only 200 left
    });

    it("should succeed when Entrée +500 into zone A then Transfert 700 from A (line order matters)", () => {
      /**
       * CRITICAL TEST: This validates that the fold processes lines in order:
       * 1. Zone A starts with 300
       * 2. Entrée adds 500 → Zone A becomes 800
       * 3. Transfert deducts 700 → Zone A becomes 100
       * 
       * If validation were cumulative instead of fold-based, this would fail
       * (700 transfer > 300 initial stock).
       */
      const articles = [
        createArticle("TEST-006", 300, [
          { zone: "Zone A", quantity: 300 }
        ])
      ];

      const movements = [
        {
          id: "1",
          ref: "TEST-006",
          type: "Entrée" as const,
          qte: 500,
          validQuantity: 500,
          emplacementDestination: "Zone A",
          stockApplied: false
        },
        {
          id: "2",
          ref: "TEST-006",
          type: "Transfert" as const,
          qte: 700,
          emplacementSource: "Zone A",
          emplacementDestination: "Zone B",
          stockApplied: false
        }
      ];

      const result = computeOperationStockEffect(articles, movements as any);

      expect(result.success).toBe(true);
      
      const updatedArticle = result.updatedArticles.find(a => a.ref === "TEST-006")!;
      expect(updatedArticle.stock).toBe(800); // 300 + 500 (Entrée)
      expect(updatedArticle.inventory.find(l => l.zone === "Zone A")?.quantity).toBe(100); // 300 + 500 - 700
      expect(updatedArticle.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(700); // Transferred
    });

    it("should apply all movements when stockApplied is already true (idempotent)", () => {
      const articles = [
        createArticle("TEST-007", 500, [
          { zone: "Zone A", quantity: 500 }
        ])
      ];

      const movements = [
        {
          id: "1",
          ref: "TEST-007",
          type: "Transfert" as const,
          qte: 200,
          emplacementSource: "Zone A",
          emplacementDestination: "Zone B",
          stockApplied: true // Already applied
        }
      ];

      // Since stockApplied is true, these movements should be filtered out BEFORE reaching computeOperationStockEffect
      // But if they do reach it, the function should handle them gracefully
      const result = computeOperationStockEffect(articles, movements as any);

      expect(result.success).toBe(true);
      // Stock should be applied even if stockApplied is true (function is pure, doesn't check that flag)
      const updatedArticle = result.updatedArticles.find(a => a.ref === "TEST-007")!;
      expect(updatedArticle.inventory.find(l => l.zone === "Zone A")?.quantity).toBe(300); // 500 - 200
      expect(updatedArticle.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(200);
    });

    it("should apply mixed Entrée + Sortie + Transfert in one operation", () => {
      const articles = [
        createArticle("TEST-008", 1000, [
          { zone: "Zone A", quantity: 600 },
          { zone: "Zone B", quantity: 400 }
        ])
      ];

      const movements = [
        {
          id: "1",
          ref: "TEST-008",
          type: "Entrée" as const,
          qte: 200,
          validQuantity: 200,
          emplacementDestination: "Zone C",
          stockApplied: false
        },
        {
          id: "2",
          ref: "TEST-008",
          type: "Sortie" as const,
          qte: 100,
          emplacementSource: "Zone A",
          stockApplied: false
        },
        {
          id: "3",
          ref: "TEST-008",
          type: "Transfert" as const,
          qte: 300,
          emplacementSource: "Zone B",
          emplacementDestination: "Zone C",
          stockApplied: false
        }
      ];

      const result = computeOperationStockEffect(articles, movements as any);

      expect(result.success).toBe(true);
      
      const updatedArticle = result.updatedArticles.find(a => a.ref === "TEST-008")!;
      expect(updatedArticle.stock).toBe(1100); // 1000 + 200 (Entrée) - 100 (Sortie)
      expect(updatedArticle.inventory.find(l => l.zone === "Zone A")?.quantity).toBe(500); // 600 - 100
      expect(updatedArticle.inventory.find(l => l.zone === "Zone B")?.quantity).toBe(100); // 400 - 300
      expect(updatedArticle.inventory.find(l => l.zone === "Zone C")?.quantity).toBe(500); // 200 + 300
    });
  });
});

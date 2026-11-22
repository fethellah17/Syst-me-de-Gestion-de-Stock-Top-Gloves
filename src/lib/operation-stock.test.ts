import { describe, it, expect } from "vitest";
import { computeOperationStockEffect } from "./stock-effects";
import type { Article, Mouvement } from "@/contexts/DataContext";

describe("Operation Stock Effect (Phase 7b)", () => {
  // Helper to create test article
  const createTestArticle = (
    ref: string,
    stock: number,
    inventory: Array<{ zone: string; quantity: number }>
  ): Article => ({
    id: 1,
    ref,
    nom: `Article ${ref}`,
    categorie: "Test",
    stock,
    seuil: 500,
    unite: "Paire",
    uniteEntree: "Boîte",
    uniteSortie: "Paire",
    facteurConversion: 100,
    consommationParInventaire: 0,
    consommationJournaliere: 50,
    inventory,
    supplierIds: []
  });

  // Helper to create test movement
  const createTestMovement = (
    ref: string,
    type: "Entrée" | "Sortie",
    qte: number,
    validQuantity: number,
    zone: string
  ): Mouvement => ({
    id: `test-${Date.now()}`,
    date: "2026-02-26 10:00:00",
    article: `Article ${ref}`,
    ref,
    type,
    qte,
    lotNumber: "LOT001",
    emplacementSource: type === "Sortie" ? zone : undefined,
    emplacementDestination: type === "Entrée" ? zone : zone,
    operateur: "Test",
    operationId: 1,
    statut: "Terminé",
    status: "approved",
    validQuantity,
    defectiveQuantity: qte - validQuantity,
    qcStatus: "Conforme",
    stockApplied: false
  });

  describe("computeOperationStockEffect", () => {
    it("should apply Entrée of 500 to article stock exactly once", () => {
      const article = createTestArticle("TEST-001", 2000, [
        { zone: "Zone A", quantity: 2000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Entrée", 500, 500, "Zone A")
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles).toHaveLength(1);
      expect(result.updatedArticles[0].stock).toBe(2500); // 2000 + 500
      expect(result.updatedArticles[0].inventory.find(z => z.zone === "Zone A")?.quantity).toBe(2500);
    });

    it("should reject when two Sortie lines exceed available stock", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Sortie", 600, 600, "Zone A"),
        createTestMovement("TEST-001", "Sortie", 500, 500, "Zone A")
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Insufficient stock");
      expect(result.failedLines).toHaveLength(1);
      expect(result.failedLines![0]).toContain("need 1100, have 1000");
      // Articles unchanged
      expect(result.updatedArticles[0].stock).toBe(1000);
    });

    it("should apply two Entrée lines for same article (cumulative)", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Entrée", 300, 300, "Zone A"),
        createTestMovement("TEST-001", "Entrée", 200, 200, "Zone A")
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(1500); // 1000 + 300 + 200
      expect(result.updatedArticles[0].inventory.find(z => z.zone === "Zone A")?.quantity).toBe(1500);
    });

    it("should deduct full qte for Sortie defective refusal", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movement: Mouvement = {
        ...createTestMovement("TEST-001", "Sortie", 500, 0, "Zone A"),
        statut: "Refusé",
        refusalType: "defective",
        validQuantity: 0,
        defectiveQuantity: 500
      };

      const result = computeOperationStockEffect([article], [movement]);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(500); // 1000 - 500 (full qte deducted)
    });

    it("should be idempotent: no change when stockApplied is already true", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        { ...createTestMovement("TEST-001", "Entrée", 500, 500, "Zone A"), stockApplied: true }
      ];

      // Filter out already-applied movements (as applyOperationStock does)
      const filtered = movements.filter(m => m.stockApplied === false);
      
      const result = computeOperationStockEffect([article], filtered);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(1000); // No change
    });

    it("should apply multiple operations correctly", () => {
      const article1 = createTestArticle("ART-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const article2 = createTestArticle("ART-002", 2000, [
        { zone: "Zone B", quantity: 2000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("ART-001", "Entrée", 300, 300, "Zone A"),
        createTestMovement("ART-002", "Sortie", 500, 500, "Zone B")
      ];

      const result = computeOperationStockEffect([article1, article2], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles.find(a => a.ref === "ART-001")?.stock).toBe(1300); // +300
      expect(result.updatedArticles.find(a => a.ref === "ART-002")?.stock).toBe(1500); // -500
    });

    it("should handle Entrée with validQuantity 0 (no effect)", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Entrée", 500, 0, "Zone A") // Total refusal
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(1000); // No change
    });

    it("should create new zone if Entrée destination doesn't exist", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Entrée", 500, 500, "Zone C") // New zone
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(1500);
      expect(result.updatedArticles[0].inventory).toHaveLength(2);
      expect(result.updatedArticles[0].inventory.find(z => z.zone === "Zone C")?.quantity).toBe(500);
    });

    it("should remove zone when Sortie empties it", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 600 },
        { zone: "Zone B", quantity: 400 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Sortie", 600, 600, "Zone A")
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(400);
      expect(result.updatedArticles[0].inventory).toHaveLength(1);
      expect(result.updatedArticles[0].inventory.find(z => z.zone === "Zone A")).toBeUndefined();
    });

    it("should handle partial Entrée acceptance (300 valid out of 500 total)", () => {
      const article = createTestArticle("TEST-001", 1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);
      
      const movements: Mouvement[] = [
        createTestMovement("TEST-001", "Entrée", 500, 300, "Zone A") // 300 valid, 200 defective
      ];

      const result = computeOperationStockEffect([article], movements);

      expect(result.success).toBe(true);
      expect(result.updatedArticles[0].stock).toBe(1300); // Only valid quantity added
    });
  });
});

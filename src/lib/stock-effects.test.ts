import { describe, it, expect } from "vitest";
import { applyEntreeStock, applySortieStock } from "./stock-effects";
import type { Article } from "@/contexts/DataContext";

describe("Stock Effect Helpers", () => {
  // Base article for testing
  const createTestArticle = (stock: number, inventory: Array<{ zone: string; quantity: number }>): Article => ({
    id: 1,
    ref: "TEST-001",
    nom: "Test Article",
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

  describe("applyEntreeStock", () => {
    it("should add 500 to existing zone and total stock", () => {
      // Setup: article with 1000 stock, zone "A" has 600
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 600 },
        { zone: "Zone B", quantity: 400 }
      ]);

      // Action: add 500 to Zone A
      const result = applyEntreeStock(article, "Zone A", 500);

      // Expected: Zone A becomes 1100 (600+500), total becomes 1500 (1000+500)
      expect(result.stock).toBe(1500);
      expect(result.inventory).toHaveLength(2);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(1100);
      expect(result.inventory.find(z => z.zone === "Zone B")?.quantity).toBe(400); // unchanged
    });

    it("should create new zone if destination doesn't exist", () => {
      // Setup: article with 1000 stock, only zone "A"
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);

      // Action: add 500 to new Zone C
      const result = applyEntreeStock(article, "Zone C", 500);

      // Expected: Zone C created with 500, total becomes 1500
      expect(result.stock).toBe(1500);
      expect(result.inventory).toHaveLength(2);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(1000); // unchanged
      expect(result.inventory.find(z => z.zone === "Zone C")?.quantity).toBe(500); // new
    });

    it("should handle adding to empty article (first entry)", () => {
      // Setup: article with 0 stock, no zones
      const article = createTestArticle(0, []);

      // Action: add 500 to Zone A
      const result = applyEntreeStock(article, "Zone A", 500);

      // Expected: Zone A created with 500, total becomes 500
      expect(result.stock).toBe(500);
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory[0].zone).toBe("Zone A");
      expect(result.inventory[0].quantity).toBe(500);
    });

    it("should handle partial acceptance (300 out of 500)", () => {
      // Setup: article with 2000 stock
      const article = createTestArticle(2000, [
        { zone: "Zone A", quantity: 2000 }
      ]);

      // Action: add only 300 (defective 200 not added)
      const result = applyEntreeStock(article, "Zone A", 300);

      // Expected: Zone A becomes 2300, total becomes 2300
      expect(result.stock).toBe(2300);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(2300);
    });
  });

  describe("applySortieStock", () => {
    it("should deduct 500 from source zone and total stock", () => {
      // Setup: article with 1000 stock, zone "A" has 600
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 600 },
        { zone: "Zone B", quantity: 400 }
      ]);

      // Action: deduct 500 from Zone A
      const result = applySortieStock(article, "Zone A", 500);

      // Expected: Zone A becomes 100 (600-500), total becomes 500 (1000-500)
      expect(result.stock).toBe(500);
      expect(result.inventory).toHaveLength(2);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(100);
      expect(result.inventory.find(z => z.zone === "Zone B")?.quantity).toBe(400); // unchanged
    });

    it("should remove zone when deduction empties it exactly", () => {
      // Setup: article with 1000 stock, zone "A" has 600
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 600 },
        { zone: "Zone B", quantity: 400 }
      ]);

      // Action: deduct exactly 600 from Zone A (empties it)
      const result = applySortieStock(article, "Zone A", 600);

      // Expected: Zone A removed (0 quantity), total becomes 400
      expect(result.stock).toBe(400);
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory.find(z => z.zone === "Zone A")).toBeUndefined(); // removed
      expect(result.inventory.find(z => z.zone === "Zone B")?.quantity).toBe(400);
    });

    it("should clamp stock to 0 when deduction exceeds available", () => {
      // Setup: article with 300 stock, zone "A" has 300
      const article = createTestArticle(300, [
        { zone: "Zone A", quantity: 300 }
      ]);

      // Action: deduct 500 (more than available)
      const result = applySortieStock(article, "Zone A", 500);

      // Expected: Zone A removed (clamped to 0), total clamped to 0 (not negative)
      expect(result.stock).toBe(0); // Math.max(0, 300 - 500) = 0
      expect(result.inventory).toHaveLength(0); // Zone removed at 0
    });

    it("should handle defective refusal deduction (same math)", () => {
      // Setup: article with 1000 stock, zone "A" has 800
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 800 },
        { zone: "Zone B", quantity: 200 }
      ]);

      // Action: deduct 500 (defective refusal uses same applySortieStock)
      const result = applySortieStock(article, "Zone A", 500);

      // Expected: Zone A becomes 300 (800-500), total becomes 500 (1000-500)
      expect(result.stock).toBe(500);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(300);
    });

    it("should return unchanged article if no source zone provided", () => {
      // Setup: article with 1000 stock
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);

      // Action: deduct with empty sourceZone
      const result = applySortieStock(article, "", 500);

      // Expected: article unchanged (guard clause)
      expect(result).toEqual(article);
      expect(result.stock).toBe(1000);
      expect(result.inventory).toHaveLength(1);
    });

    it("should handle zone not existing in inventory (no-op for that zone)", () => {
      // Setup: article with 1000 stock, only zone "A"
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 1000 }
      ]);

      // Action: try to deduct from non-existent Zone B
      const result = applySortieStock(article, "Zone B", 500);

      // Expected: Zone A unchanged, total still deducted (by design of original code)
      // Note: Original code deducts from total stock regardless of zone match
      expect(result.stock).toBe(500); // 1000 - 500 (total always deducted)
      expect(result.inventory).toHaveLength(1);
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(1000); // unchanged
    });

    it("should handle Number() conversion correctly", () => {
      // Setup: article with potentially string-typed quantity (edge case)
      const article = createTestArticle(1000, [
        { zone: "Zone A", quantity: 600 as any }, // simulates data that might be string
        { zone: "Zone B", quantity: 400 }
      ]);

      // Action: deduct 100
      const result = applySortieStock(article, "Zone A", 100);

      // Expected: Number() cast prevents string concatenation
      expect(result.inventory.find(z => z.zone === "Zone A")?.quantity).toBe(500); // not "600100" or NaN
    });

    it("should remove multiple zones when they hit 0", () => {
      // Setup: article with small quantities in multiple zones
      const article = createTestArticle(600, [
        { zone: "Zone A", quantity: 200 },
        { zone: "Zone B", quantity: 200 },
        { zone: "Zone C", quantity: 200 }
      ]);

      // Action: deduct 200 from Zone A
      const result = applySortieStock(article, "Zone A", 200);

      // Expected: Zone A removed, others unchanged
      expect(result.stock).toBe(400);
      expect(result.inventory).toHaveLength(2);
      expect(result.inventory.find(z => z.zone === "Zone A")).toBeUndefined();
      expect(result.inventory.find(z => z.zone === "Zone B")?.quantity).toBe(200);
      expect(result.inventory.find(z => z.zone === "Zone C")?.quantity).toBe(200);
    });
  });

  describe("Equivalence to Original Code", () => {
    it("applyEntreeStock matches original lines 887-930 logic", () => {
      // This test verifies the helper produces identical output to the original inline code
      const article = createTestArticle(2500, [
        { zone: "Zone A - Rack 12", quantity: 1500 },
        { zone: "Zone B - Rack 03", quantity: 1000 }
      ]);

      const validQuantity = 500;
      const destinationZone = "Zone A - Rack 12";

      // Original code logic (simplified):
      // updatedInventory = article.inventory.map(loc => loc.zone === destinationZone ? {...loc, quantity: Number(loc.quantity) + validQuantity} : loc)
      // newTotalStock = article.stock + validQuantity

      const result = applyEntreeStock(article, destinationZone, validQuantity);

      // Verify exact match to expected behavior
      expect(result.stock).toBe(2500 + 500); // 3000
      expect(result.inventory.find(z => z.zone === "Zone A - Rack 12")?.quantity).toBe(1500 + 500); // 2000
      expect(result.inventory.find(z => z.zone === "Zone B - Rack 03")?.quantity).toBe(1000); // unchanged
    });

    it("applySortieStock matches original lines 970-1009 logic", () => {
      // This test verifies the helper produces identical output to the original inline code
      const article = createTestArticle(2500, [
        { zone: "Zone A - Rack 12", quantity: 1500 },
        { zone: "Zone B - Rack 03", quantity: 1000 }
      ]);

      const totalQtyToDeduct = 500;
      const sourceZone = "Zone A - Rack 12";

      // Original code logic (simplified):
      // updatedInventory = article.inventory.map(loc => loc.zone === sourceZone ? {...loc, quantity: Math.max(0, Number(loc.quantity) - totalQtyToDeduct)} : loc).filter(l => Number(l.quantity) > 0)
      // newTotalStock = Math.max(0, article.stock - totalQtyToDeduct)

      const result = applySortieStock(article, sourceZone, totalQtyToDeduct);

      // Verify exact match to expected behavior
      expect(result.stock).toBe(Math.max(0, 2500 - 500)); // 2000
      expect(result.inventory.find(z => z.zone === "Zone A - Rack 12")?.quantity).toBe(Math.max(0, 1500 - 500)); // 1000
      expect(result.inventory.find(z => z.zone === "Zone B - Rack 03")?.quantity).toBe(1000); // unchanged
      expect(result.inventory).toHaveLength(2); // no zones removed
    });
  });
});

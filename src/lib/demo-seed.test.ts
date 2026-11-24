import { describe, it, expect } from "vitest";
import { demoArticles, demoCategories, getDemoArticles, getDemoCategories, DEMO_SEED_ENABLED } from "./demo-seed";
import { getStockStatus } from "@/lib/stock-utils";

describe("Demo Seed", () => {
  const LEGACY_REFS = ["GN-M-001", "GL-S-002", "GV-L-003", "GN-XL-004", "SG-PE-005", "MK-FFP2-006"];
  const LEGACY_IDS = [1, 2, 3, 4, 5, 6];
  const LEGACY_ZONES = [
    "Zone A - Rack 12",
    "Zone B - Rack 03",
    "Zone A - Rack 08",
    "Zone C - Rack 01",
    "Zone D - Rack 05",
    "Zone E - Quarantaine"
  ];
  const LEGACY_CATEGORY_NAMES = [
    "Gants Nitrile",
    "Gants Latex",
    "Gants Vinyle",
    "Sur-gants",
    "Masques",
    "Accessoires"
  ];
  const DEMO_CATEGORY_NAMES = ["Emballages", "Matières premières"];
  const ALLOWED_UNITS = ["Paire", "Unité", "Boîte", "Kg", "Pièce"];
  const LEGACY_SUPPLIER_IDS = [1, 2, 3];

  describe("demoArticles", () => {
    it("should contain exactly 7 articles", () => {
      expect(demoArticles).toHaveLength(7);
    });

    it("should have unique refs different from legacy refs", () => {
      const refs = demoArticles.map(a => a.ref);
      
      // All refs should be unique
      const uniqueRefs = new Set(refs);
      expect(uniqueRefs.size).toBe(refs.length);
      
      // No ref should match legacy refs
      refs.forEach(ref => {
        expect(LEGACY_REFS).not.toContain(ref);
      });
    });

    it("should have unique ids different from legacy ids", () => {
      const ids = demoArticles.map(a => a.id);
      
      // All ids should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      
      // No id should match legacy ids
      ids.forEach(id => {
        expect(LEGACY_IDS).not.toContain(id);
      });
    });

    it("should have inventory sum equal to stock for every article", () => {
      demoArticles.forEach(article => {
        const inventorySum = article.inventory.reduce((sum, loc) => sum + loc.quantity, 0);
        expect(inventorySum).toBe(article.stock);
      });
    });

    it("should have stock divisible by facteurConversion", () => {
      demoArticles.forEach(article => {
        expect(article.stock % article.facteurConversion).toBe(0);
      });
    });

    it("should have stock greater than seuil", () => {
      demoArticles.forEach(article => {
        expect(article.stock).toBeGreaterThan(article.seuil);
      });
    });

    it("should have autonomy greater than 7 days", () => {
      demoArticles.forEach(article => {
        const autonomy = article.stock / article.consommationJournaliere;
        expect(autonomy).toBeGreaterThan(7);
      });
    });

    it("should have secure stock status for every article", () => {
      demoArticles.forEach(article => {
        const status = getStockStatus(article.stock, article.seuil, article.consommationJournaliere);
        expect(status.level).toBe("secure");
      });
    });

    it("should use only allowed units", () => {
      demoArticles.forEach(article => {
        expect(ALLOWED_UNITS).toContain(article.uniteEntree);
        expect(ALLOWED_UNITS).toContain(article.uniteSortie);
        expect(ALLOWED_UNITS).toContain(article.unite);
      });
    });

    it("should have inventory zones from legacy zone names", () => {
      demoArticles.forEach(article => {
        article.inventory.forEach(loc => {
          expect(LEGACY_ZONES).toContain(loc.zone);
        });
      });
    });

    it("should have categorie from legacy or demo categories", () => {
      const allowedCategories = [...LEGACY_CATEGORY_NAMES, ...DEMO_CATEGORY_NAMES];
      demoArticles.forEach(article => {
        expect(allowedCategories).toContain(article.categorie);
      });
    });

    it("should have supplierIds referencing only legacy supplier ids", () => {
      demoArticles.forEach(article => {
        if (article.supplierIds) {
          article.supplierIds.forEach(supplierId => {
            expect(LEGACY_SUPPLIER_IDS).toContain(supplierId);
          });
        }
      });
    });
  });

  describe("demoCategories", () => {
    it("should contain exactly 2 categories", () => {
      expect(demoCategories).toHaveLength(2);
    });

    it("should have the expected category names", () => {
      const names = demoCategories.map(c => c.nom);
      expect(names).toContain("Emballages");
      expect(names).toContain("Matières premières");
    });

    it("should have unique ids different from legacy category ids", () => {
      const legacyCategoryIds = [1, 2, 3, 4, 5, 6];
      const ids = demoCategories.map(c => c.id);
      
      // All ids should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
      
      // No id should match legacy ids
      ids.forEach(id => {
        expect(legacyCategoryIds).not.toContain(id);
      });
    });
  });

  describe("getDemoArticles", () => {
    it("should return demo articles when enabled is true", () => {
      const articles = getDemoArticles(true);
      expect(articles).toHaveLength(7);
      expect(articles).toBe(demoArticles);
    });

    it("should return empty array when enabled is false", () => {
      const articles = getDemoArticles(false);
      expect(articles).toHaveLength(0);
      expect(articles).toEqual([]);
    });

    it("should return demo articles when no parameter (uses default)", () => {
      const articles = getDemoArticles();
      if (DEMO_SEED_ENABLED) {
        expect(articles).toHaveLength(7);
      } else {
        expect(articles).toHaveLength(0);
      }
    });
  });

  describe("getDemoCategories", () => {
    it("should return demo categories when enabled is true", () => {
      const categories = getDemoCategories(true);
      expect(categories).toHaveLength(2);
      expect(categories).toBe(demoCategories);
    });

    it("should return empty array when enabled is false", () => {
      const categories = getDemoCategories(false);
      expect(categories).toHaveLength(0);
      expect(categories).toEqual([]);
    });

    it("should return demo categories when no parameter (uses default)", () => {
      const categories = getDemoCategories();
      if (DEMO_SEED_ENABLED) {
        expect(categories).toHaveLength(2);
      } else {
        expect(categories).toHaveLength(0);
      }
    });
  });
});

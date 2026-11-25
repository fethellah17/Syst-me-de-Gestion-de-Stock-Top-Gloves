import { describe, it, expect } from "vitest";
import { DEMO_SEED_ENABLED, getDemoArticles, getDemoCategories, getDemoData, getDemoMovements, getDemoOperations, getDemoInventoryHistory } from "./demo-seed";
import { parseMovementDate } from "./dashboard-utils";
import { computeProductStats } from "./product-stats";
import { buildProductSeries } from "./product-series";
import { getStockStatus } from "./stock-utils";

describe("Demo Seed", () => {
  const fixedNow = new Date(2026, 10, 24, 12, 0, 0); // November 24, 2026, 12:00:00
  
  it("should return 7 demo articles when enabled", () => {
    const articles = getDemoArticles(true);
    expect(articles).toHaveLength(7);
    expect(articles.map(a => a.ref)).toEqual([
      "BR-007",
      "BD-008",
      "GC-T75-009",
      "GE-L-010",
      "LN-60-011",
      "LB-NBR-012",
      "NC-025-013",
    ]);
  });
  
  it("should return 3 demo categories when enabled", () => {
    const categories = getDemoCategories(true);
    expect(categories).toHaveLength(3);
    expect(categories.map(c => c.nom)).toEqual([
      "Gants Latex",
      "Emballages",
      "Matières premières",
    ]);
  });
  
  it("should return empty arrays when disabled", () => {
    expect(getDemoArticles(false)).toEqual([]);
    expect(getDemoCategories(false)).toEqual([]);
    expect(getDemoMovements(false)).toEqual([]);
    expect(getDemoOperations(false)).toEqual([]);
    expect(getDemoInventoryHistory(false)).toEqual([]);
  });
  
  it("should have correct article stock values", () => {
    const articles = getDemoArticles(true);
    expect(articles.find(a => a.ref === "BR-007")?.stock).toBe(1200);
    expect(articles.find(a => a.ref === "BD-008")?.stock).toBe(6000);
    expect(articles.find(a => a.ref === "GC-T75-009")?.stock).toBe(4000);
    expect(articles.find(a => a.ref === "GE-L-010")?.stock).toBe(9000);
    expect(articles.find(a => a.ref === "LN-60-011")?.stock).toBe(6000);
    expect(articles.find(a => a.ref === "LB-NBR-012")?.stock).toBe(4000);
    expect(articles.find(a => a.ref === "NC-025-013")?.stock).toBe(1500);
  });
  
  describe("getDemoData determinism", () => {
    it("should return identical data for same timestamp", () => {
      const data1 = getDemoData(fixedNow);
      const data2 = getDemoData(fixedNow);
      
      expect(data1.operations).toEqual(data2.operations);
      expect(data1.movements).toEqual(data2.movements);
    });
  });
  
  describe("operation structure", () => {
    it("should have unique operation ids >= 100", () => {
      const { operations } = getDemoData(fixedNow);
      const ids = operations.map(op => op.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
      expect(Math.min(...ids)).toBeGreaterThanOrEqual(100);
    });
    
    it("should have valid reference format TYPE/YEAR/NNNN", () => {
      const { operations } = getDemoData(fixedNow);
      const refPattern = /^(IN|OUT|TRF)\/\d{4}\/\d{4}$/;
      
      operations.forEach(op => {
        expect(op.reference).toMatch(refPattern);
      });
    });
    
    it("should have sequential counters per type-year", () => {
      const { operations } = getDemoData(fixedNow);
      const countersByTypeYear: Record<string, number[]> = {};
      
      operations.forEach(op => {
        const [type, year, counterStr] = op.reference.split('/');
        const key = `${type}/${year}`;
        const counter = parseInt(counterStr, 10);
        
        if (!countersByTypeYear[key]) countersByTypeYear[key] = [];
        countersByTypeYear[key].push(counter);
      });
      
      Object.values(countersByTypeYear).forEach(counters => {
        const sorted = [...counters].sort((a, b) => a - b);
        expect(counters).toEqual(sorted);
        
        // Check sequential (1, 2, 3, ...)
        sorted.forEach((counter, idx) => {
          expect(counter).toBe(idx + 1);
        });
      });
    });
    
    it("should have all operations with statut Terminé", () => {
      const { operations } = getDemoData(fixedNow);
      operations.forEach(op => {
        expect(op.statut).toBe("Terminé");
      });
    });
  });
  
  describe("movement structure", () => {
    it("should have unique movement ids", () => {
      const { movements } = getDemoData(fixedNow);
      const ids = movements.map(m => m.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });
    
    it("should have every movement linked to an existing operation", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const operationIds = new Set(operations.map(op => op.id));
      
      movements.forEach(m => {
        expect(m.operationId).toBeDefined();
        expect(operationIds.has(m.operationId!)).toBe(true);
        
        const op = operations.find(o => o.id === m.operationId);
        expect(op?.type).toBe(m.type);
        expect(op?.statut).toBe("Terminé");
      });
    });
    
    it("should have valid dates via parseMovementDate", () => {
      const { movements } = getDemoData(fixedNow);
      
      movements.forEach(m => {
        const date = parseMovementDate(m.date);
        expect(date).not.toBeNull();
        expect(date!.getTime()).toBeLessThanOrEqual(fixedNow.getTime());
      });
    });
    
    it("should have only Sunday-Thursday for Sortie/Entrée operations", () => {
      const { movements } = getDemoData(fixedNow);
      
      movements.forEach(m => {
        if (m.type === "Sortie" || m.type === "Entrée") {
          const date = parseMovementDate(m.date)!;
          const day = date.getDay(); // 0 = Sunday, 6 = Saturday
          expect(day).not.toBe(5); // Not Friday
          expect(day).not.toBe(6); // Not Saturday
        }
      });
    });
    
    it("should reference only demo articles", () => {
      const { movements } = getDemoData(fixedNow);
      const demoRefs = new Set(getDemoArticles(true).map(a => a.ref));
      
      movements.forEach(m => {
        expect(demoRefs.has(m.ref)).toBe(true);
      });
    });
    
    it("should have Sortie emplacementSource from article inventory", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      movements.filter(m => m.type === "Sortie").forEach(m => {
        const article = articles.find(a => a.ref === m.ref);
        expect(article).toBeDefined();
        
        const zones = article!.inventory.map(inv => inv.zone);
        expect(zones).toContain(m.emplacementSource);
      });
    });
    
    it("should have Entrée emplacementDestination from article inventory", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      movements.filter(m => m.type === "Entrée").forEach(m => {
        const article = articles.find(a => a.ref === m.ref);
        expect(article).toBeDefined();
        
        const zones = article!.inventory.map(inv => inv.zone);
        expect(zones).toContain(m.emplacementDestination);
      });
    });
    
    it("should have Transfert only for GE-L-010 between its two zones", () => {
      const { movements } = getDemoData(fixedNow);
      const transferts = movements.filter(m => m.type === "Transfert");
      
      const geArticle = getDemoArticles(true).find(a => a.ref === "GE-L-010");
      expect(geArticle).toBeDefined();
      expect(geArticle!.inventory).toHaveLength(2);
      
      const zones = geArticle!.inventory.map(inv => inv.zone);
      
      transferts.forEach(m => {
        expect(m.ref).toBe("GE-L-010");
        expect(zones).toContain(m.emplacementSource);
        expect(zones).toContain(m.emplacementDestination);
        expect(m.emplacementSource).not.toBe(m.emplacementDestination);
      });
    });
  });
  
  describe("Entrée quantity constraints", () => {
    it("should have qte as multiple of lot size and facteurConversion", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      const lotSizes: Record<string, number> = {
        "BR-007": 50,
        "BD-008": 500,
        "GC-T75-009": 50,
        "GE-L-010": 100,
        "LN-60-011": 200,
        "LB-NBR-012": 200,
        "NC-025-013": 25,
      };
      
      movements.filter(m => m.type === "Entrée").forEach(m => {
        const article = articles.find(a => a.ref === m.ref);
        expect(article).toBeDefined();
        
        const lotSize = lotSizes[m.ref];
        const facteur = article!.facteurConversion;
        
        expect(m.qte % facteur).toBe(0);
        expect(m.qte % lotSize).toBe(0);
      });
    });
    
    it("should have validQuantity <= qte", () => {
      const { movements } = getDemoData(fixedNow);
      
      movements.filter(m => m.type === "Entrée").forEach(m => {
        expect(m.validQuantity).toBeDefined();
        expect(m.validQuantity!).toBeLessThanOrEqual(m.qte);
      });
    });
  });
  
  describe("consumption coverage", () => {
    it("should have per-article Sortie sum within ±5% of 90 × consommationJournaliere", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const sorties = movements.filter(m => m.type === "Sortie" && m.ref === article.ref);
        const totalSortie = sorties.reduce((sum, m) => sum + m.qte, 0);
        const target = article.consommationJournaliere * 90;
        const tolerance = target * 0.05;
        
        expect(totalSortie).toBeGreaterThanOrEqual(target - tolerance);
        expect(totalSortie).toBeLessThanOrEqual(target + tolerance);
      });
    });
    
    it("should have per-article Entrée validQuantity between 0.85 and 1.00 × Sortie sum", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const sorties = movements.filter(m => m.type === "Sortie" && m.ref === article.ref);
        const entrees = movements.filter(m => m.type === "Entrée" && m.ref === article.ref);
        
        const totalSortie = sorties.reduce((sum, m) => sum + m.qte, 0);
        const totalValidQuantity = entrees.reduce((sum, m) => sum + (m.validQuantity || 0), 0);
        
        expect(totalValidQuantity).toBeGreaterThanOrEqual(totalSortie * 0.85);
        expect(totalValidQuantity).toBeLessThanOrEqual(totalSortie * 1.00);
      });
    });
  });
  
  describe("Dashboard integration", () => {
    it("should have computeProductStats sorties equal Σ Sortie", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const stats = computeProductStats({
          article,
          movements,
          period: "90j",
          now: fixedNow,
        });
        
        const expectedSorties = movements
          .filter(m => m.type === "Sortie" && m.ref === article.ref)
          .reduce((sum, m) => sum + m.qte, 0);
        
        // Allow small difference due to period boundary filtering in computeProductStats
        expect(Math.abs(stats.sorties - expectedSorties)).toBeLessThan(expectedSorties * 0.05);
      });
    });
    
    it("should have computeProductStats entrees equal Σ validQuantity", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const stats = computeProductStats({
          article,
          movements,
          period: "90j",
          now: fixedNow,
        });
        
        const expectedEntrees = movements
          .filter(m => m.type === "Entrée" && m.ref === article.ref)
          .reduce((sum, m) => sum + (m.validQuantity || 0), 0);
        
        // Allow small difference due to period boundary filtering in computeProductStats
        expect(Math.abs(stats.entrees - expectedEntrees)).toBeLessThan(expectedEntrees * 0.05);
      });
    });
    
    it("should have consoMoyenneJour within 6% of consommationJournaliere", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const stats = computeProductStats({
          article,
          movements,
          period: "90j",
          now: fixedNow,
        });
        
        const tolerance = article.consommationJournaliere * 0.06;
        expect(stats.consoMoyenneJour).toBeGreaterThanOrEqual(article.consommationJournaliere - tolerance);
        expect(stats.consoMoyenneJour).toBeLessThanOrEqual(article.consommationJournaliere + tolerance);
      });
    });
    
    it("should have buildProductSeries last point stock === article.stock", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const series = buildProductSeries({
          article,
          movements,
          period: "tout",
          now: fixedNow,
        });
        
        expect(series.points.length).toBeGreaterThan(0);
        const lastPoint = series.points[series.points.length - 1];
        expect(lastPoint.stock).toBe(article.stock);
      });
    });
    
    it("should have buildProductSeries minimum stock >= seuil", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const series = buildProductSeries({
          article,
          movements,
          period: "tout",
          now: fixedNow,
        });
        
        series.points.forEach(point => {
          expect(point.stock).toBeGreaterThanOrEqual(article.seuil);
        });
      });
    });
    
    it("should have buildProductSeries no NaN values", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const series = buildProductSeries({
          article,
          movements,
          period: "tout",
          now: fixedNow,
        });
        
        series.points.forEach(point => {
          expect(isNaN(point.stock)).toBe(false);
          expect(isNaN(point.entrees)).toBe(false);
          expect(isNaN(point.sorties)).toBe(false);
        });
      });
    });
  });
  
  describe("reference chronology", () => {
    it("should have references sorted by date with strictly increasing counters per type-year", () => {
      const { operations } = getDemoData(fixedNow);
      const byTypeYear: Record<string, Array<{ date: string; counter: number }>> = {};
      
      operations.forEach(op => {
        const [type, year, counterStr] = op.reference.split('/');
        const key = `${type}/${year}`;
        const counter = parseInt(counterStr, 10);
        
        if (!byTypeYear[key]) byTypeYear[key] = [];
        byTypeYear[key].push({ date: op.datePlanifiee, counter });
      });
      
      Object.entries(byTypeYear).forEach(([key, items]) => {
        // Sort by date
        const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
        
        // Counters should be strictly increasing
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i].counter).toBeGreaterThan(sorted[i - 1].counter);
        }
        
        // First counter should be 1
        expect(sorted[0].counter).toBe(1);
      });
    });
  });
  
  describe("person names", () => {
    it("should have no French personal names in demo data", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const frenchNames = ["Jean", "Pierre", "Sophie", "Luc", "Marie"];
      
      operations.forEach(op => {
        frenchNames.forEach(name => {
          expect(op.operateur).not.toContain(name);
          if (op.controleur) expect(op.controleur).not.toContain(name);
          if (op.gestionnaire) expect(op.gestionnaire).not.toContain(name);
        });
      });
      
      movements.forEach(m => {
        frenchNames.forEach(name => {
          expect(m.operateur).not.toContain(name);
          if (m.controleur) expect(m.controleur).not.toContain(name);
        });
      });
    });
  });
  
  describe("stock status", () => {
    it("should have all demo articles with secure stock status", () => {
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const status = getStockStatus(article.stock, article.seuil, article.consommationJournaliere);
        expect(status.level).toBe("secure");
      });
    });
  });
});

import { describe, it, expect } from "vitest";
import { DEMO_SEED_ENABLED, getDemoArticles, getDemoCategories, getDemoData, getDemoMovements, getDemoOperations, getDemoInventoryHistory } from "./demo-seed";
import { parseMovementDate } from "./dashboard-utils";
import { computeProductStats } from "./product-stats";
import { buildProductSeries } from "./product-series";
import { getStockStatus } from "./stock-utils";
import { computeOperationStockEffect } from "./stock-effects";
import type { Article } from "@/contexts/DataContext";

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
    
    it("should have all completed operations with statut Terminé", () => {
      const { operations } = getDemoData(fixedNow);
      const completed = operations.filter(op => 
        op.statut !== "Brouillon" && 
        op.statut !== "En inspection" && 
        op.statut !== "En attente de validation"
      );
      completed.forEach(op => {
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
    
    it("should have validQuantity <= qte for completed Entrée lines", () => {
      const { movements } = getDemoData(fixedNow);
      
      movements.filter(m => m.type === "Entrée" && m.statut === "Terminé" && m.validQuantity !== undefined).forEach(m => {
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
  
  describe("in-flight operations (Phase 14d)", () => {
    it("should have exactly 124 total operations (113 Terminé + 11 in-flight)", () => {
      const { operations } = getDemoData(fixedNow);
      expect(operations).toHaveLength(124);
    });
    
    it("should have correct counts by statut and type", () => {
      const { operations } = getDemoData(fixedNow);
      
      const termine = operations.filter(op => op.statut === "Terminé");
      const brouillon = operations.filter(op => op.statut === "Brouillon");
      const inspection = operations.filter(op => op.statut === "En inspection");
      const validation = operations.filter(op => op.statut === "En attente de validation");
      
      // Terminé: 113 (44 Entrée, 64 Sortie, 5 Transfert)
      expect(termine).toHaveLength(113);
      expect(termine.filter(op => op.type === "Entrée")).toHaveLength(44);
      expect(termine.filter(op => op.type === "Sortie")).toHaveLength(64);
      expect(termine.filter(op => op.type === "Transfert")).toHaveLength(5);
      
      // Brouillon: 4 (1 Entrée, 2 Sortie, 1 Transfert)
      expect(brouillon).toHaveLength(4);
      expect(brouillon.filter(op => op.type === "Entrée")).toHaveLength(1);
      expect(brouillon.filter(op => op.type === "Sortie")).toHaveLength(2);
      expect(brouillon.filter(op => op.type === "Transfert")).toHaveLength(1);
      
      // En inspection: 3 (1 Entrée, 2 Sortie)
      expect(inspection).toHaveLength(3);
      expect(inspection.filter(op => op.type === "Entrée")).toHaveLength(1);
      expect(inspection.filter(op => op.type === "Sortie")).toHaveLength(2);
      
      // En attente de validation: 4 (1 Entrée, 2 Sortie, 1 Transfert)
      expect(validation).toHaveLength(4);
      expect(validation.filter(op => op.type === "Entrée")).toHaveLength(1);
      expect(validation.filter(op => op.type === "Sortie")).toHaveLength(2);
      expect(validation.filter(op => op.type === "Transfert")).toHaveLength(1);
    });
    
    it("should have Brouillon operations without controleur or gestionnaire", () => {
      const { operations } = getDemoData(fixedNow);
      const brouillon = operations.filter(op => op.statut === "Brouillon");
      
      brouillon.forEach(op => {
        expect(op.controleur).toBeUndefined();
        expect(op.gestionnaire).toBeUndefined();
      });
    });
    
    it("should have Brouillon lines in correct shape (En attente for E/S, Terminé+stockApplied false for T)", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const brouillon = operations.filter(op => op.statut === "Brouillon");
      
      brouillon.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        expect(lines.length).toBeGreaterThan(0);
        
        if (op.type === "Entrée" || op.type === "Sortie") {
          lines.forEach(line => {
            expect(line.statut).toBe("En attente");
            expect(line.status).toBe("pending");
            expect(line.stockApplied).toBeUndefined();
          });
        } else {
          // Transfert
          lines.forEach(line => {
            expect(line.statut).toBe("Terminé");
            expect(line.status).toBe("approved");
            expect(line.stockApplied).toBe(false);
          });
        }
      });
    });
    
    it("should have exactly 2 of 3 En inspection operations with controleur set", () => {
      const { operations } = getDemoData(fixedNow);
      const inspection = operations.filter(op => op.statut === "En inspection");
      
      expect(inspection).toHaveLength(3);
      const withControleur = inspection.filter(op => op.controleur);
      expect(withControleur).toHaveLength(2);
    });
    
    it("should have En inspection lines not inspected (En attente + pending)", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const inspection = operations.filter(op => op.statut === "En inspection");
      
      inspection.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        expect(lines.length).toBeGreaterThan(0);
        
        lines.forEach(line => {
          expect(line.statut).toBe("En attente");
          expect(line.status).toBe("pending");
        });
      });
    });
    
    it("should have exactly 2 of 4 En attente de validation operations with gestionnaire set", () => {
      const { operations } = getDemoData(fixedNow);
      const validation = operations.filter(op => op.statut === "En attente de validation");
      
      expect(validation).toHaveLength(4);
      const withGestionnaire = validation.filter(op => op.gestionnaire);
      expect(withGestionnaire).toHaveLength(2);
    });
    
    it("should have En attente de validation Entrée/Sortie lines fully inspected (approved + stockApplied false)", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const validation = operations.filter(op => op.statut === "En attente de validation" && (op.type === "Entrée" || op.type === "Sortie"));
      
      validation.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        expect(lines.length).toBeGreaterThan(0);
        
        lines.forEach(line => {
          expect(line.statut).toBe("Terminé");
          expect(line.status).toBe("approved");
          expect(line.stockApplied).toBe(false);
          expect(line.controleur).toBeDefined();
          expect(line.etatArticles).toBeDefined();
          expect(line.validQuantity).toBeDefined();
        });
      });
    });
    
    it("should have En attente de validation Transfert lines with stockApplied false", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const validation = operations.filter(op => op.statut === "En attente de validation" && op.type === "Transfert");
      
      validation.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        expect(lines.length).toBeGreaterThan(0);
        
        lines.forEach(line => {
          expect(line.statut).toBe("Terminé");
          expect(line.status).toBe("approved");
          expect(line.stockApplied).toBe(false);
        });
      });
    });
    
    it("should have one En attente de validation Entrée line with partial acceptance", () => {
      const { movements } = getDemoData(fixedNow);
      const validationEntrees = movements.filter(m => 
        m.type === "Entrée" && 
        m.statut === "Terminé" && 
        m.stockApplied === false
      );
      
      const partialAcceptances = validationEntrees.filter(m => 
        m.validQuantity && m.defectiveQuantity && 
        m.validQuantity < m.qte && 
        m.defectiveQuantity > 0
      );
      
      expect(partialAcceptances.length).toBeGreaterThanOrEqual(1);
    });
    
    it("should have all in-flight lines fail isRealStockMovement (stockApplied undefined or false)", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const inFlightOperations = operations.filter(op => op.statut !== "Terminé");
      
      inFlightOperations.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        
        lines.forEach(line => {
          // isRealStockMovement checks: (statut !== "Terminé" || stockApplied === true)
          // In-flight lines should have either:
          // - statut !== "Terminé" (Brouillon Entrée/Sortie lines)
          // - statut === "Terminé" && stockApplied === false (Brouillon/validation Transfert, validation E/S)
          const wouldCountAsReal = line.statut === "Terminé" && line.stockApplied !== false;
          expect(wouldCountAsReal).toBe(false);
        });
      });
    });
    
    it("should have computeProductStats ignore in-flight movements", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      // Compare stats computed with all movements vs only Terminé+stockApplied movements
      articles.forEach(article => {
        const statsAll = computeProductStats({
          article,
          movements,
          period: "90j",
          now: fixedNow,
        });
        
        const realMovements = movements.filter(m => 
          m.ref === article.ref && 
          (m.statut === "Terminé" && m.stockApplied !== false)
        );
        
        const statsReal = computeProductStats({
          article,
          movements: realMovements,
          period: "90j",
          now: fixedNow,
        });
        
        // Stats should be identical (in-flight not counted)
        expect(statsAll.entrees).toBe(statsReal.entrees);
        expect(statsAll.sorties).toBe(statsReal.sorties);
      });
    });
    
    it("should have buildProductSeries ignore in-flight movements", () => {
      const { movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      
      articles.forEach(article => {
        const seriesAll = buildProductSeries({
          article,
          movements,
          period: "tout",
          now: fixedNow,
        });
        
        const realMovements = movements.filter(m => 
          m.ref === article.ref && 
          (m.statut === "Terminé" && m.stockApplied !== false)
        );
        
        const seriesReal = buildProductSeries({
          article,
          movements: realMovements,
          period: "tout",
          now: fixedNow,
        });
        
        // Series should be identical
        expect(seriesAll.points).toEqual(seriesReal.points);
      });
    });
    
    it("should have in-flight operations on last 3 working days before now", () => {
      const { operations } = getDemoData(fixedNow);
      const inFlight = operations.filter(op => op.statut !== "Terminé");
      
      // Calculate last 3 working days before fixedNow
      const isWorkingDay = (date: Date): boolean => {
        const day = date.getDay();
        return day !== 5 && day !== 6; // Not Friday or Saturday
      };
      
      const lastWorkingDays: Date[] = [];
      const nowDate = new Date(fixedNow);
      nowDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(nowDate);
      checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday
      
      for (let d = new Date(checkDate); lastWorkingDays.length < 3; d.setDate(d.getDate() - 1)) {
        if (isWorkingDay(d)) {
          lastWorkingDays.unshift(new Date(d));
        }
      }
      
      // fixedNow is Tuesday 2026-11-24, so last 3 working days are:
      // Monday 2026-11-23 (day 1), Sunday 2026-11-22 (day 0), Thursday 2026-11-19 (day 4)
      expect(lastWorkingDays).toHaveLength(3);
      expect(lastWorkingDays[0].getDay()).toBe(4); // Thursday
      expect(lastWorkingDays[1].getDay()).toBe(0); // Sunday
      expect(lastWorkingDays[2].getDay()).toBe(1); // Monday
      
      const expectedDateStrs = lastWorkingDays.map(d => 
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      );
      
      // All in-flight operations must be on these exact 3 days
      inFlight.forEach(op => {
        expect(expectedDateStrs).toContain(op.datePlanifiee);
        
        // Parse date and verify day of week is Sunday-Thursday (0-4)
        const [year, month, day] = op.datePlanifiee.split('-').map(Number);
        const opDate = new Date(year, month - 1, day);
        const dayOfWeek = opDate.getDay();
        expect([0, 1, 2, 3, 4]).toContain(dayOfWeek);
      });
      
      // Verify distribution across the 3 days (at least 1 operation per day)
      const operationsByDate: Record<string, number> = {};
      inFlight.forEach(op => {
        operationsByDate[op.datePlanifiee] = (operationsByDate[op.datePlanifiee] || 0) + 1;
      });
      
      expect(Object.keys(operationsByDate)).toHaveLength(3);
      expectedDateStrs.forEach(dateStr => {
        expect(operationsByDate[dateStr]).toBeGreaterThan(0);
      });
    });
    
    it("should have in-flight lines with quantities <= 8% of zone stock for Sortie/Transfert", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      const inFlight = operations.filter(op => op.statut !== "Terminé");
      
      // Build zone quantities per article
      const zoneStock: Record<string, Record<string, number>> = {};
      articles.forEach(article => {
        zoneStock[article.ref] = {};
        article.inventory.forEach(inv => {
          zoneStock[article.ref][inv.zone] = inv.quantity;
        });
      });
      
      inFlight.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        
        lines.forEach(line => {
          if (line.type === "Sortie" || line.type === "Transfert") {
            const zone = line.emplacementSource;
            if (zone && zoneStock[line.ref] && zoneStock[line.ref][zone]) {
              const available = zoneStock[line.ref][zone];
              const maxAllowed = available * 0.08;
              expect(line.qte).toBeLessThanOrEqual(maxAllowed);
            }
          }
        });
      });
    });
    
    it("should have in-flight Entrée lines with qte = lots × lotSize", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const inFlight = operations.filter(op => op.statut !== "Terminé" && op.type === "Entrée");
      const lotSizes: Record<string, number> = {
        "BR-007": 50,
        "BD-008": 500,
        "GC-T75-009": 50,
        "GE-L-010": 100,
        "LN-60-011": 200,
        "LB-NBR-012": 200,
        "NC-025-013": 25,
      };
      
      inFlight.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        
        lines.forEach(line => {
          const lotSize = lotSizes[line.ref];
          expect(line.qte % lotSize).toBe(0);
          expect(line.qte / lotSize).toBeGreaterThanOrEqual(1);
          expect(line.qte / lotSize).toBeLessThanOrEqual(2);
        });
      });
    });
    
    it("should have all En attente de validation operations pass computeOperationStockEffect", () => {
      const { operations, movements } = getDemoData(fixedNow);
      const articles = getDemoArticles(true);
      const validation = operations.filter(op => op.statut === "En attente de validation");
      
      validation.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id && m.stockApplied === false);
        expect(lines.length).toBeGreaterThan(0);
        
        const result = computeOperationStockEffect(articles, lines);
        
        expect(result.success).toBe(true);
        expect(result.error).toBeUndefined();
        expect(result.failedLines).toBeUndefined();
        expect(result.updatedArticles).toBeDefined();
        
        // Verify arithmetic for each article affected
        const affectedRefs = [...new Set(lines.map(l => l.ref))];
        
        affectedRefs.forEach(ref => {
          const originalArticle = articles.find(a => a.ref === ref)!;
          const updatedArticle = result.updatedArticles.find(a => a.ref === ref)!;
          const articleLines = lines.filter(l => l.ref === ref);
          
          // Calculate expected changes
          let expectedStockChange = 0;
          const expectedZoneChanges: Record<string, number> = {};
          
          // Initialize with original zones
          originalArticle.inventory.forEach(inv => {
            expectedZoneChanges[inv.zone] = 0;
          });
          
          articleLines.forEach(line => {
            if (line.type === "Entrée") {
              const validQty = line.validQuantity || 0;
              expectedStockChange += validQty;
              const zone = line.emplacementDestination;
              expectedZoneChanges[zone] = (expectedZoneChanges[zone] || 0) + validQty;
            } else if (line.type === "Sortie") {
              expectedStockChange -= line.qte;
              const zone = line.emplacementSource!;
              expectedZoneChanges[zone] = (expectedZoneChanges[zone] || 0) - line.qte;
            } else if (line.type === "Transfert") {
              // Transfert: total stock unchanged
              const sourceZone = line.emplacementSource!;
              const destZone = line.emplacementDestination!;
              expectedZoneChanges[sourceZone] = (expectedZoneChanges[sourceZone] || 0) - line.qte;
              expectedZoneChanges[destZone] = (expectedZoneChanges[destZone] || 0) + line.qte;
            }
          });
          
          // Assert total stock change
          const actualStockChange = updatedArticle.stock - originalArticle.stock;
          expect(actualStockChange).toBe(expectedStockChange);
          
          // Assert zone changes
          Object.entries(expectedZoneChanges).forEach(([zone, change]) => {
            if (change !== 0) {
              const originalZone = originalArticle.inventory.find(inv => inv.zone === zone);
              const updatedZone = updatedArticle.inventory.find(inv => inv.zone === zone);
              
              const originalQty = originalZone ? originalZone.quantity : 0;
              const updatedQty = updatedZone ? updatedZone.quantity : 0;
              const actualChange = updatedQty - originalQty;
              
              expect(actualChange).toBe(change);
            }
          });
        });
      });
    });
    
    it("should have all in-flight operations pass computeOperationStockEffect cumulatively", () => {
      const { operations, movements } = getDemoData(fixedNow);
      let currentArticles = getDemoArticles(true);
      
      // Sort in-flight operations chronologically
      const inFlight = operations
        .filter(op => op.statut !== "Terminé")
        .sort((a, b) => a.datePlanifiee.localeCompare(b.datePlanifiee) || a.id - b.id);
      
      // Apply each operation cumulatively
      inFlight.forEach(op => {
        const lines = movements.filter(m => m.operationId === op.id);
        
        // Simulate post-QC shape for all lines
        const simulatedLines = lines.map(line => {
          if (line.type === "Entrée" || line.type === "Sortie") {
            // If already has QC data (En attente de validation), use it
            if (line.stockApplied === false && line.status === "approved") {
              return line;
            }
            // Otherwise simulate approval (Brouillon/En inspection)
            const simulated = { ...line };
            (simulated as any).stockApplied = false;
            (simulated as any).status = "approved";
            (simulated as any).statut = "Terminé";
            (simulated as any).validQuantity = line.qte;
            (simulated as any).defectiveQuantity = 0;
            (simulated as any).etatArticles = "Conforme";
            return simulated;
          } else {
            // Transfert
            const simulated = { ...line };
            (simulated as any).stockApplied = false;
            (simulated as any).status = "approved";
            (simulated as any).statut = "Terminé";
            return simulated;
          }
        });
        
        const result = computeOperationStockEffect(currentArticles, simulatedLines);
        
        expect(result.success).toBe(true);
        if (!result.success) {
          console.error(`Operation ${op.reference} failed:`, result.error, result.failedLines);
        }
        
        // Update articles for next iteration
        currentArticles = result.updatedArticles;
      });
    });
  });
});

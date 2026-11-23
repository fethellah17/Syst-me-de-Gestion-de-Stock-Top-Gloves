import { describe, it, expect } from "vitest";
import { buildOperationPdfRows } from "./operation-pdf";
import type { Mouvement, Article, Operation } from "@/contexts/DataContext";

describe("buildOperationPdfRows", () => {
  const mockArticles: Article[] = [
    {
      id: 1,
      ref: "GN-M-001",
      nom: "Gants Nitrile M",
      categorie: "EPI",
      stock: 1000,
      seuil: 100,
      unite: "Boîte",
      uniteEntree: "Carton",
      uniteSortie: "Boîte",
      facteurConversion: 10,
      consommationParInventaire: 50,
      consommationJournaliere: 10,
      inventory: []
    }
  ];

  it("should include Fournisseur column for Entrée and no Source column", () => {
    const operation: Operation = {
      id: 1,
      type: "Entrée",
      reference: "ENT-001",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Alice",
      statut: "Terminé",
      documentOrigine: "BL-123"
    };

    const lines: Mouvement[] = [
      {
        id: "1",
        date: "10/04/2026 10:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Entrée",
        qte: 100,
        qteOriginale: 10,
        uniteUtilisee: "Carton",
        uniteSortie: "Boîte",
        lotNumber: "LOT001",
        fournisseur: "Fournisseur A",
        emplacementDestination: "Zone A",
        operateur: "Alice",
        validQuantity: 100,
        defectiveQuantity: 0
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check headers include Fournisseur, not Source
    expect(result.headers).toContain("Fournisseur");
    expect(result.headers).not.toContain("Source");
    expect(result.headers).toEqual([
      "Article",
      "N° Lot",
      "Qté Saisie",
      "Impact Stock",
      "Qté Valide",
      "Qté Défect.",
      "Fournisseur",
      "Destination"
    ]);

    // Check row data
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][6]).toBe("Fournisseur A"); // Fournisseur column
  });

  it("should include Source column for Sortie and no Fournisseur column", () => {
    const operation: Operation = {
      id: 2,
      type: "Sortie",
      reference: "SOR-001",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Bob",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "2",
        date: "10/04/2026 11:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Sortie",
        qte: 50,
        qteOriginale: 50,
        uniteUtilisee: "Boîte",
        uniteSortie: "Boîte",
        lotNumber: "LOT002",
        emplacementSource: "Zone A",
        emplacementDestination: "Client X",
        operateur: "Bob",
        validQuantity: 50,
        defectiveQuantity: 0
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check headers include Source, not Fournisseur
    expect(result.headers).toContain("Source");
    expect(result.headers).not.toContain("Fournisseur");
    expect(result.headers).toEqual([
      "Article",
      "N° Lot",
      "Qté Saisie",
      "Impact Stock",
      "Qté Valide",
      "Qté Défect.",
      "Source",
      "Destination"
    ]);

    // Check row data
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][6]).toBe("Zone A"); // Source column
  });

  it("should include Source column for Transfert and no Fournisseur column", () => {
    const operation: Operation = {
      id: 3,
      type: "Transfert",
      reference: "TRF-001",
      datePlanifiee: "2026-04-10 12:00:00",
      operateur: "Charlie",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "3",
        date: "10/04/2026 12:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Transfert",
        qte: 30,
        qteOriginale: 30,
        uniteUtilisee: "Boîte",
        uniteSortie: "Boîte",
        lotNumber: "LOT003",
        emplacementSource: "Zone A",
        emplacementDestination: "Zone B",
        operateur: "Charlie"
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check headers include Source, not Fournisseur
    expect(result.headers).toContain("Source");
    expect(result.headers).not.toContain("Fournisseur");
    expect(result.headers).toEqual([
      "Article",
      "N° Lot",
      "Qté Saisie",
      "Impact Stock",
      "Qté Valide",
      "Qté Défect.",
      "Source",
      "Destination"
    ]);

    // Check row data
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][6]).toBe("Zone A"); // Source column
  });

  it("should NOT include Date, Type, Date Lot, or Commentaire columns", () => {
    const operation: Operation = {
      id: 4,
      type: "Entrée",
      reference: "ENT-002",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Alice",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "4",
        date: "10/04/2026 10:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Entrée",
        qte: 100,
        lotNumber: "LOT004",
        lotDate: "2026-03-01",
        emplacementDestination: "Zone A",
        operateur: "Alice",
        commentaire: "Test comment"
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Excluded columns should not be present
    expect(result.headers).not.toContain("Date");
    expect(result.headers).not.toContain("Type");
    expect(result.headers).not.toContain("Date Lot");
    expect(result.headers).not.toContain("Commentaire");
  });

  it("should show '—' for Qté Valide and Qté Défect. for Transfert lines", () => {
    const operation: Operation = {
      id: 5,
      type: "Transfert",
      reference: "TRF-002",
      datePlanifiee: "2026-04-10 12:00:00",
      operateur: "Charlie",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "5",
        date: "10/04/2026 12:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Transfert",
        qte: 30,
        lotNumber: "LOT005",
        emplacementSource: "Zone A",
        emplacementDestination: "Zone B",
        operateur: "Charlie",
        validQuantity: 30, // Should be ignored for Transfert
        defectiveQuantity: 0 // Should be ignored for Transfert
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check that QC columns show "—" for Transfert
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][4]).toBe("—"); // Qté Valide
    expect(result.rows[0][5]).toBe("—"); // Qté Défect.
  });

  it("should handle missing fournisseur with '—'", () => {
    const operation: Operation = {
      id: 6,
      type: "Entrée",
      reference: "ENT-003",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Alice",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "6",
        date: "10/04/2026 10:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Entrée",
        qte: 100,
        lotNumber: "LOT006",
        emplacementDestination: "Zone A",
        operateur: "Alice"
        // fournisseur is missing
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check that missing fournisseur shows "—"
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0][6]).toBe("—"); // Fournisseur column
  });

  it("should handle empty document d'origine (not needed in rows, only in PDF header)", () => {
    const operation: Operation = {
      id: 7,
      type: "Sortie",
      reference: "SOR-002",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Bob",
      statut: "Terminé"
      // documentOrigine is missing
    };

    const lines: Mouvement[] = [
      {
        id: "7",
        date: "10/04/2026 11:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Sortie",
        qte: 50,
        lotNumber: "LOT007",
        emplacementSource: "Zone A",
        emplacementDestination: "Client Y",
        operateur: "Bob"
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Document d'origine is not in rows, only in PDF header section
    // This test just confirms the function doesn't crash with missing documentOrigine
    expect(result.rows).toHaveLength(1);
    expect(result.headers).toHaveLength(8);
  });

  it("should format quantities with French locale", () => {
    const operation: Operation = {
      id: 8,
      type: "Sortie",
      reference: "SOR-003",
      datePlanifiee: "2026-04-10 10:00:00",
      operateur: "Bob",
      statut: "Terminé"
    };

    const lines: Mouvement[] = [
      {
        id: "8",
        date: "10/04/2026 11:00",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Sortie",
        qte: 1234.56,
        qteOriginale: 123.45,
        uniteUtilisee: "Carton",
        uniteSortie: "Boîte",
        lotNumber: "LOT008",
        emplacementSource: "Zone A",
        emplacementDestination: "Client Z",
        operateur: "Bob",
        validQuantity: 1234.56,
        defectiveQuantity: 10.5
      }
    ];

    const result = buildOperationPdfRows(operation, lines, mockArticles);

    // Check French number formatting (space as thousand separator, comma for decimal)
    expect(result.rows[0][2]).toContain("123,45"); // Qté Saisie
    expect(result.rows[0][3]).toContain("1 234,56"); // Impact Stock (note: has space for thousands)
    expect(result.rows[0][4]).toContain("1 234,56"); // Qté Valide
    expect(result.rows[0][5]).toContain("10,5"); // Qté Défect.
  });
});

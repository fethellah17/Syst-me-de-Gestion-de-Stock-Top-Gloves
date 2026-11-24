import { describe, it, expect } from "vitest";
import {
  escapeCsvField,
  buildCsv,
  withBom,
  ARTICLES_COLUMNS,
  MOUVEMENTS_COLUMNS,
  OPERATIONS_COLUMNS,
  INVENTAIRE_COLUMNS,
  PERSONNEL_COLUMNS,
  type OperationWithLines,
} from "./csv-export";

describe("CSV Export", () => {
  describe("escapeCsvField", () => {
    it("should use semicolon delimiter when building CSV", () => {
      const result = escapeCsvField("test");
      expect(result).toBe("test");
    });

    it("should double quotes when field contains quotes", () => {
      const result = escapeCsvField('He said "hello"');
      expect(result).toBe('"He said ""hello"""');
    });

    it("should quote fields containing semicolons", () => {
      const result = escapeCsvField("A;B");
      expect(result).toBe('"A;B"');
    });

    it("should handle newlines in fields", () => {
      const result = escapeCsvField("Line1\nLine2");
      expect(result).toBe('"Line1\nLine2"');
    });

    it("should preserve accents", () => {
      const result = escapeCsvField("Éléphant");
      expect(result).toBe("Éléphant");
    });

    it("should guard against CSV injection with = prefix ONLY for strings", () => {
      const result = escapeCsvField("=SUM(A1:A10)");
      expect(result).toBe("'=SUM(A1:A10)");
    });

    it("should guard against CSV injection with + prefix ONLY for strings", () => {
      const result = escapeCsvField("+1234");
      expect(result).toBe("'+1234");
    });

    it("should guard against CSV injection with - prefix ONLY for strings", () => {
      const result = escapeCsvField("-cmd");
      expect(result).toBe("'-cmd");
    });

    it("should guard against CSV injection with @ prefix ONLY for strings", () => {
      const result = escapeCsvField("@formula");
      expect(result).toBe("'@formula");
    });

    it("should handle null as empty string", () => {
      const result = escapeCsvField(null);
      expect(result).toBe("");
    });

    it("should handle undefined as empty string", () => {
      const result = escapeCsvField(undefined);
      expect(result).toBe("");
    });

    it("should convert Date to ISO string", () => {
      const date = new Date("2026-11-23T10:00:00.000Z");
      const result = escapeCsvField(date);
      expect(result).toBe("2026-11-23T10:00:00.000Z");
    });

    it("should convert objects to JSON", () => {
      const obj = { key: "value" };
      const result = escapeCsvField(obj);
      expect(result).toBe('{"key":"value"}');
    });

    it("should convert arrays to JSON", () => {
      const arr = ["a", "b"];
      const result = escapeCsvField(arr);
      expect(result).toBe('["a","b"]');
    });

    it("should keep negative numbers unchanged", () => {
      const result = escapeCsvField(-50);
      expect(result).toBe("-50");
    });

    it("should guard negative number as string", () => {
      const result = escapeCsvField("-50");
      expect(result).toBe("'-50");
    });

    it("should use comma as decimal separator for non-integer numbers", () => {
      const result = escapeCsvField(1.5);
      expect(result).toBe("1,5");
    });

    it("should keep integers unchanged", () => {
      const result = escapeCsvField(100);
      expect(result).toBe("100");
    });
  });

  describe("buildCsv", () => {
    it("should build CSV with headers and data rows", () => {
      const columns = [
        { header: "Name", get: (row: any) => row.name },
        { header: "Age", get: (row: any) => row.age },
      ];
      const rows = [{ name: "Alice", age: 30 }];
      const csv = buildCsv(columns, rows);
      expect(csv).toBe("Name;Age\r\nAlice;30");
    });

    it("should use \\r\\n line breaks", () => {
      const columns = [{ header: "Header", get: () => "Value" }];
      const rows = [{}];
      const csv = buildCsv(columns, rows);
      expect(csv).toContain("\r\n");
    });

    it("should handle empty rows array", () => {
      const columns = [{ header: "Header", get: () => "" }];
      const csv = buildCsv(columns, []);
      expect(csv).toBe("Header");
    });

    it("should escape all fields properly", () => {
      const columns = [{ header: "Field", get: (row: any) => row.value }];
      const rows = [{ value: "A;B" }];
      const csv = buildCsv(columns, rows);
      expect(csv).toBe('Field\r\n"A;B"');
    });
  });

  describe("withBom", () => {
    it("should add UTF-8 BOM to CSV string", () => {
      const csv = "Header\r\nValue";
      const result = withBom(csv);
      expect(result).toBe("\uFEFF" + csv);
      expect(result.startsWith("\uFEFF")).toBe(true);
    });
  });

  describe("ARTICLES_COLUMNS", () => {
    it("should export realistic Article row with correct CSV line", () => {
      type Article = {
        id: number;
        ref: string;
        nom: string;
        categorie: string;
        stock: number;
        seuil: number;
        unite: string;
        uniteEntree: string;
        uniteSortie: string;
        facteurConversion: number;
        consommationParInventaire: number;
        consommationJournaliere: number;
        inventory: any[];
        supplierIds?: number[];
      };

      const article: Article = {
        id: 1,
        ref: "GN-M-001",
        nom: "Gants Nitrile M",
        categorie: "EPI",
        stock: 1000,
        seuil: 500,
        unite: "Boîte",
        uniteEntree: "Carton",
        uniteSortie: "Boîte",
        facteurConversion: 10,
        consommationParInventaire: 50,
        consommationJournaliere: 25,
        inventory: [],
      };

      const csv = buildCsv(ARTICLES_COLUMNS, [article]);
      const lines = csv.split("\r\n");
      expect(lines[0]).toBe("ID;Référence;Nom;Catégorie;Stock;Seuil;Unité;Unité d'entrée;Unité de sortie;Facteur de conversion");
      expect(lines[1]).toBe("1;GN-M-001;Gants Nitrile M;EPI;1000;500;Boîte;Carton;Boîte;10");
    });
  });

  describe("MOUVEMENTS_COLUMNS", () => {
    it("should export realistic Mouvement row with correct CSV line", () => {
      type Mouvement = {
        id: string;
        date: string;
        article: string;
        ref: string;
        type: "Entrée" | "Sortie" | "Transfert" | "Ajustement";
        qte: number;
        lotNumber: string;
        fournisseur?: string;
        emplacementSource?: string;
        emplacementDestination: string;
        destination?: string;
        operateur: string;
        statut?: string;
        controleur?: string;
        commentaire?: string;
        operationId?: number;
      };

      const mouvement: Mouvement = {
        id: "uuid-123",
        date: "2026-11-23",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        type: "Entrée",
        qte: 100,
        lotNumber: "LOT2026-001",
        fournisseur: "Fournisseur A",
        emplacementDestination: "Zone A",
        operateur: "Jean Dupont",
        operationId: 1,
      };

      const csv = buildCsv(MOUVEMENTS_COLUMNS, [mouvement]);
      const lines = csv.split("\r\n");
      expect(lines[1]).toContain("uuid-123");
      expect(lines[1]).toContain("GN-M-001");
      expect(lines[1]).toContain("100");
    });
  });

  describe("OPERATIONS_COLUMNS", () => {
    it("should export realistic Operation row with reference and nbLignes", () => {
      const operation: OperationWithLines = {
        id: 1,
        reference: "IN/2026/0001",
        type: "Entrée",
        operateur: "Jean Dupont",
        datePlanifiee: "2026-11-23T10:00:00.000Z",
        statut: "En attente",
        nbLignes: 3,
      };

      const csv = buildCsv(OPERATIONS_COLUMNS, [operation]);
      const lines = csv.split("\r\n");
      expect(lines[1]).toContain("IN/2026/0001");
      expect(lines[1]).toContain("3");
    });
  });

  describe("INVENTAIRE_COLUMNS", () => {
    it("should export realistic InventoryRecord row with correct CSV line", () => {
      type InventoryRecord = {
        id: number;
        dateHeure: string;
        article: string;
        ref: string;
        emplacement: string;
        stockTheorique: number;
        stockPhysique: number;
        ecart: number;
        uniteSortie: string;
      };

      const record: InventoryRecord = {
        id: 1,
        dateHeure: "2026-11-23T14:00:00.000Z",
        article: "Gants Nitrile M",
        ref: "GN-M-001",
        emplacement: "Zone A",
        stockTheorique: 1000,
        stockPhysique: 950,
        ecart: -50,
        uniteSortie: "Boîte",
      };

      const csv = buildCsv(INVENTAIRE_COLUMNS, [record]);
      const lines = csv.split("\r\n");
      expect(lines[1]).toContain("GN-M-001");
      expect(lines[1]).toContain("-50");
    });
  });

  describe("PERSONNEL_COLUMNS", () => {
    it("should not include password field in columns", () => {
      const headers = PERSONNEL_COLUMNS.map(col => col.header);
      expect(headers).not.toContain("password");
      expect(headers).not.toContain("Password");
      expect(headers).not.toContain("Mot de passe");
    });

    it("should not extract password field from row", () => {
      interface StaffWithPassword {
        id: number;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        active: boolean;
        password: string;
      }

      const staff: StaffWithPassword = {
        id: 1,
        name: "Admin Principal",
        email: "admin@topgloves.com",
        role: "Administrateur",
        permissions: ["dashboard", "articles", "admin"],
        active: true,
        password: "secret123",
      };

      const csv = buildCsv(PERSONNEL_COLUMNS, [staff]);
      expect(csv).not.toContain("secret123");
      expect(csv).not.toContain("password");
    });

    it("should include safe personnel fields only", () => {
      interface Staff {
        id: number;
        name: string;
        email: string;
        role: string;
        permissions: string[];
        active: boolean;
      }

      const staff: Staff = {
        id: 1,
        name: "Admin Principal",
        email: "admin@topgloves.com",
        role: "Administrateur",
        permissions: ["dashboard", "articles", "admin"],
        active: true,
      };

      const csv = buildCsv(PERSONNEL_COLUMNS, [staff]);
      const lines = csv.split("\r\n");
      expect(lines[0]).toBe("ID;Nom;Email;Rôle;Nombre de permissions;Actif");
      expect(lines[1]).toBe("1;Admin Principal;admin@topgloves.com;Administrateur;3;Oui");
    });

    it("should handle Personnel row without permissions field", () => {
      interface StaffPartial {
        id: number;
        name: string;
        email: string;
        role: string;
        permissions?: string[];
        active: boolean;
      }

      const staff: StaffPartial = {
        id: 2,
        name: "User Test",
        email: "user@test.com",
        role: "Opérateur",
        active: false,
      };

      // Cast as needed to test robustness
      const csv = buildCsv(PERSONNEL_COLUMNS, [staff as any]);
      const lines = csv.split("\r\n");
      expect(lines.length).toBe(2);
      expect(lines[1]).toBe("2;User Test;user@test.com;Opérateur;0;Non");
    });
  });
});

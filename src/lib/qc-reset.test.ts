import { describe, it, expect } from "vitest";
import { resetQcFields, canRedoInspection } from "./qc-reset";
import type { Mouvement } from "@/contexts/DataContext";

describe("resetQcFields", () => {
  it("should reset full QC Entrée line to fresh state", () => {
    // Fresh Entrée line (pending, no QC fields)
    const fresh: Mouvement = {
      id: "test-1",
      date: "2026-03-15T10:00:00Z",
      article: "Gants Nitrile M",
      ref: "GN-M-001",
      type: "Entrée",
      qte: 500,
      qteOriginale: 5,
      uniteUtilisee: "Boîte",
      uniteSortie: "Paire",
      lotNumber: "LOT-2026-03-001",
      lotDate: "2026-02-28",
      fournisseur: "Supplier A",
      emplacementDestination: "Zone A",
      operateur: "John Doe",
      statut: "En attente",
      status: "pending",
      operationId: 123,
    };

    // Simulate full QC approval
    const afterQc: Mouvement = {
      ...fresh,
      statut: "Terminé",
      status: "approved",
      controleur: "Jane Smith",
      etatArticles: "Conforme",
      qcStatus: "Conforme",
      validQuantity: 500,
      defectiveQuantity: 0,
      noteControle: "All good",
      verificationPoints: { check1: true, check2: true },
      wasDelayed: false,
      stockApplied: false,
    };

    // Reset should return to fresh state
    const result = resetQcFields(afterQc);
    expect(result).toStrictEqual(fresh);
  });

  it("should reset full QC Sortie line to fresh state", () => {
    const fresh: Mouvement = {
      id: "test-2",
      date: "2026-03-15T11:00:00Z",
      article: "Gants Latex S",
      ref: "GL-S-002",
      type: "Sortie",
      qte: 200,
      qteOriginale: 200,
      uniteUtilisee: "Paire",
      uniteSortie: "Paire",
      lotNumber: "LOT-2026-03-002",
      lotDate: "2026-02-27",
      emplacementSource: "Zone A",
      emplacementDestination: "Production",
      operateur: "Alice",
      statut: "En attente",
      status: "pending",
      operationId: 123,
    };

    const afterQc: Mouvement = {
      ...fresh,
      statut: "Terminé",
      status: "approved",
      controleur: "Bob",
      etatArticles: "Non-conforme",
      qcStatus: "Non-conforme",
      validQuantity: 180,
      defectiveQuantity: 20,
      unitesDefectueuses: 20,
      noteControle: "Some defects",
      verificationPoints: { check1: true, check2: false },
      wasDelayed: true,
      stockApplied: false,
    };

    const result = resetQcFields(afterQc);
    expect(result).toStrictEqual(fresh);
  });

  it("should remove stockApplied from Sortie defective refusal", () => {
    const line: Mouvement = {
      id: "test-3",
      date: "2026-03-15T12:00:00Z",
      article: "Masques FFP2",
      ref: "MK-FFP2-006",
      type: "Sortie",
      qte: 100,
      lotNumber: "LOT-2026-03-003",
      lotDate: "2026-03-01",
      emplacementSource: "Zone D",
      emplacementDestination: "Production",
      operateur: "Carol",
      statut: "Refusé",
      status: "rejected",
      operationId: 123,
      refusalType: "defective",
      stockApplied: false,
      controleur: "Dave",
      nomControleur: "Dave Smith",
      motifRejet: "Damaged items",
      validQuantity: 0,
      defectiveQuantity: 100,
      qcStatus: "Non-conforme",
      noteControle: "All items rejected",
      verificationPoints: {},
      wasDelayed: false,
    };

    const result = resetQcFields(line);
    
    // stockApplied should be removed (not present in result)
    expect("stockApplied" in result).toBe(false);
    expect(result.statut).toBe("En attente");
    expect(result.status).toBe("pending");
    expect(result.operationId).toBe(123);
  });

  it("should reset Sortie administrative refusal (no stockApplied) to fresh", () => {
    const fresh: Mouvement = {
      id: "test-4",
      date: "2026-03-15T13:00:00Z",
      article: "Sur-gants PE",
      ref: "SG-PE-005",
      type: "Sortie",
      qte: 50,
      lotNumber: "LOT-2026-03-004",
      emplacementSource: "Zone B",
      emplacementDestination: "Production",
      operateur: "Eve",
      statut: "En attente",
      status: "pending",
      operationId: 123,
    };

    const afterRefusal: Mouvement = {
      ...fresh,
      statut: "Refusé",
      status: "rejected",
      refusalType: "administrative",
      controleur: "Frank",
      nomOperateur: "Frank Jones",
      motifErreur: "Wrong form",
      refusalReason: "Wrong form",
      validQuantity: 0,
      defectiveQuantity: 50,
      qcStatus: "Non-conforme",
      noteControle: "Administrative error",
      verificationPoints: {},
      wasDelayed: false,
      // NO stockApplied (administrative refusal doesn't set it)
    };

    const result = resetQcFields(afterRefusal);
    expect(result).toStrictEqual(fresh);
  });

  it("should reset Entrée total refusal (no stockApplied) to fresh", () => {
    const fresh: Mouvement = {
      id: "test-5",
      date: "2026-03-15T14:00:00Z",
      article: "Gants Vinyle L",
      ref: "GV-L-003",
      type: "Entrée",
      qte: 300,
      lotNumber: "LOT-2026-03-005",
      fournisseur: "Supplier B",
      emplacementDestination: "Zone C",
      operateur: "Grace",
      statut: "En attente",
      status: "pending",
      operationId: 123,
    };

    const afterRefusal: Mouvement = {
      ...fresh,
      statut: "Refusé",
      status: "rejected",
      controleur: "Henry",
      refusalReason: "Quality issue",
      validQuantity: 0,
      defectiveQuantity: 300,
      qcStatus: "Non-conforme",
      noteControle: "Total rejection",
      verificationPoints: {},
      wasDelayed: false,
      // NO stockApplied (total refusal with validQuantity=0)
    };

    const result = resetQcFields(afterRefusal);
    expect(result).toStrictEqual(fresh);
  });

  it("should reset line with raison/rejectionReason (rejectQualityControl) to fresh", () => {
    const fresh: Mouvement = {
      id: "test-6",
      date: "2026-03-15T15:00:00Z",
      article: "Gants Nitrile XL",
      ref: "GN-XL-004",
      type: "Sortie",
      qte: 75,
      lotNumber: "LOT-2026-03-006",
      emplacementSource: "Zone A",
      emplacementDestination: "Production",
      operateur: "Ivy",
      statut: "En attente",
      status: "pending",
      operationId: 123,
    };

    const afterReject: Mouvement = {
      ...fresh,
      statut: "Rejeté",
      status: "rejected",
      controleur: "Jack",
      raison: "Incomplete paperwork",
      rejectionReason: "Incomplete paperwork",
    };

    const result = resetQcFields(afterReject);
    expect(result).toStrictEqual(fresh);
  });

  it("should return Transfert line unchanged", () => {
    const transfert: Mouvement = {
      id: "test-7",
      date: "2026-03-15T16:00:00Z",
      article: "Masques FFP2",
      ref: "MK-FFP2-006",
      type: "Transfert",
      qte: 500,
      lotNumber: "LOT-2026-03-007",
      emplacementSource: "Zone D",
      emplacementDestination: "Zone E",
      operateur: "Kate",
      statut: "Terminé",
      status: "approved",
      operationId: 123,
      stockApplied: false,
    };

    const result = resetQcFields(transfert);
    
    // Should return the exact same object (Transfert lines skip QC)
    expect(result).toBe(transfert);
    expect(result).toStrictEqual(transfert);
  });

  it("should not mutate input object", () => {
    const original: Mouvement = {
      id: "test-8",
      date: "2026-03-15T17:00:00Z",
      article: "Gants Latex S",
      ref: "GL-S-002",
      type: "Entrée",
      qte: 100,
      lotNumber: "LOT-2026-03-008",
      emplacementDestination: "Zone A",
      operateur: "Leo",
      statut: "Terminé",
      status: "approved",
      operationId: 123,
      controleur: "Mia",
      validQuantity: 100,
      stockApplied: false,
    };

    const copy = { ...original };
    resetQcFields(original);

    // Original should remain unchanged
    expect(original).toStrictEqual(copy);
  });

  it("should preserve core fields after reset", () => {
    const line: Mouvement = {
      id: "test-9",
      date: "2026-03-15T18:00:00Z",
      article: "Sur-gants PE",
      ref: "SG-PE-005",
      type: "Sortie",
      qte: 200,
      qteOriginale: 2,
      uniteUtilisee: "Boîte",
      uniteSortie: "Paire",
      lotNumber: "LOT-2026-03-009",
      lotDate: "2026-03-10",
      emplacementSource: "Zone B",
      emplacementDestination: "Production",
      commentaire: "Urgent order",
      operateur: "Nina",
      statut: "Terminé",
      status: "approved",
      operationId: 456,
      controleur: "Oscar",
      validQuantity: 200,
      stockApplied: false,
    };

    const result = resetQcFields(line);

    // Core fields must be identical
    expect(result.id).toBe("test-9");
    expect(result.date).toBe("2026-03-15T18:00:00Z");
    expect(result.qte).toBe(200);
    expect(result.qteOriginale).toBe(2);
    expect(result.uniteUtilisee).toBe("Boîte");
    expect(result.uniteSortie).toBe("Paire");
    expect(result.lotNumber).toBe("LOT-2026-03-009");
    expect(result.lotDate).toBe("2026-03-10");
    expect(result.emplacementSource).toBe("Zone B");
    expect(result.emplacementDestination).toBe("Production");
    expect(result.commentaire).toBe("Urgent order");
    expect(result.operateur).toBe("Nina");
    expect(result.operationId).toBe(456);
  });

  it("should ensure reset line will not be selected by applyOperationStock", () => {
    const line: Mouvement = {
      id: "test-10",
      date: "2026-03-15T19:00:00Z",
      article: "Gants Nitrile M",
      ref: "GN-M-001",
      type: "Entrée",
      qte: 500,
      lotNumber: "LOT-2026-03-010",
      emplacementDestination: "Zone A",
      operateur: "Paul",
      statut: "Terminé",
      status: "approved",
      operationId: 789,
      controleur: "Quinn",
      validQuantity: 500,
      stockApplied: false,
    };

    const result = resetQcFields(line);

    // applyOperationStock filter checks: m.stockApplied === false
    // After reset, stockApplied should NOT be false (should be absent)
    expect(result.stockApplied === false).toBe(false);
    expect("stockApplied" in result).toBe(false);
    
    // The filter `m.stockApplied === false` will not match this line
    // because result.stockApplied is undefined, not false
  });
});

describe("canRedoInspection", () => {
  it("should return true for an approved Entrée line in 'En inspection'", () => {
    const line = { type: "Entrée" as const, status: "approved" as const };
    expect(canRedoInspection(line, "En inspection")).toBe(true);
  });

  it("should return true for a rejected Sortie line in 'En inspection'", () => {
    const line = { type: "Sortie" as const, status: "rejected" as const };
    expect(canRedoInspection(line, "En inspection")).toBe(true);
  });

  it("should return false for a pending line", () => {
    const line = { type: "Entrée" as const, status: "pending" as const };
    expect(canRedoInspection(line, "En inspection")).toBe(false);
  });

  it("should return false for a Transfert line even if approved", () => {
    const line = { type: "Transfert" as const, status: "approved" as const };
    expect(canRedoInspection(line, "En inspection")).toBe(false);
  });

  it("should return false when operationStatut is 'Brouillon'", () => {
    const line = { type: "Entrée" as const, status: "approved" as const };
    expect(canRedoInspection(line, "Brouillon")).toBe(false);
  });

  it("should return false when operationStatut is 'En attente de validation'", () => {
    const line = { type: "Sortie" as const, status: "approved" as const };
    expect(canRedoInspection(line, "En attente de validation")).toBe(false);
  });

  it("should return false when operationStatut is 'Terminé'", () => {
    const line = { type: "Entrée" as const, status: "approved" as const };
    expect(canRedoInspection(line, "Terminé")).toBe(false);
  });

  it("should return false when operationStatut is undefined", () => {
    const line = { type: "Sortie" as const, status: "rejected" as const };
    expect(canRedoInspection(line, undefined)).toBe(false);
  });
});

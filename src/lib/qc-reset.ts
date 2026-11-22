import type { Mouvement } from "@/contexts/DataContext";

/**
 * Reset QC fields on a line to "pending" state for operation revert
 * 
 * Used when reverting operation status from "En inspection" to "Brouillon".
 * Only applies to Entrée and Sortie lines (Transfert lines skip QC).
 * 
 * @param line - Movement to reset
 * @returns New movement with QC fields removed, statut/status = "En attente"/"pending"
 */
export function resetQcFields<T extends Mouvement>(line: T): T {
  // Only reset Entrée and Sortie lines (Transfert lines skip QC workflow)
  if (line.type !== "Entrée" && line.type !== "Sortie") {
    return line;
  }

  // Blacklist: Remove QC-specific fields
  const {
    qcStatus,
    validQuantity,
    defectiveQuantity,
    controleur,
    noteControle,
    verificationPoints,
    wasDelayed,
    refusalReason,
    refusalType,
    nomOperateur,
    motifErreur,
    nomControleur,
    motifRejet,
    rejectionReason,
    raison,
    etatArticles,
    unitesDefectueuses,
    stockApplied,
    ...rest
  } = line as any;

  // Return new object with pending status and all non-QC fields preserved
  return {
    ...rest,
    statut: "En attente" as const,
    status: "pending" as const,
  } as T;
}

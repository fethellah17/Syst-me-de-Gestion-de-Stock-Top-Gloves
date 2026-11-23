import { FileText, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, FileEdit, CheckCircle2, AlertCircle, Clock, Copy, CheckIcon, XIcon, ClipboardCheck, Timer, Trash2, RotateCcw } from "lucide-react";
import { 
  generateInboundPDF, 
  generateOutboundPDF, 
  generateTransferPDF, 
  generateAdjustmentPDF,
  generateRejectionPDF,
  generateAdministrativeErrorPDF,
  generateDefectiveItemsPDF
} from "@/lib/pdf-generator";
import { UnitBadge } from "@/components/UnitBadge";
import { canRedoInspection } from "@/lib/qc-reset";
import type { Mouvement, Article } from "@/contexts/DataContext";

interface MovementTableProps {
  movements: Mouvement[];
  articles?: Article[];
  onQualityControl?: (id: string) => void;
  onReject?: (id: string) => void;
  onInspect?: (id: string) => void;
  onRedoInspection?: (id: string) => void;
  onDuplicate?: (mouvement: Mouvement) => void;
  onDelete?: (id: string) => void;
  hideLinePdf?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export const MovementTable = ({ 
  movements, 
  articles = [],
  onQualityControl,
  onReject,
  onInspect,
  onRedoInspection,
  onDuplicate,
  onDelete,
  hideLinePdf = false,
  showActions = true,
  compact = false
}: MovementTableProps) => {
  
  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Entrée":
        return <ArrowDownToLine className="w-3 h-3" />;
      case "Sortie":
        return <ArrowUpFromLine className="w-3 h-3" />;
      case "Transfert":
        return <ArrowRightLeft className="w-3 h-3" />;
      case "Ajustement":
        return <FileEdit className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Check if a movement uses an old conversion factor
  const hasOldFactor = (mouvement: Mouvement): boolean => {
    if (!mouvement.ref) return false;
    const article = articles.find(a => a.ref === mouvement.ref);
    if (!article) return false;
    // If movement has a stored factor and it differs from current, it's old
    return mouvement.uniteSortie !== undefined && article.facteurConversion !== 1;
  };

  const getOldFactorTooltip = (mouvement: Mouvement): string => {
    const article = articles.find(a => a.ref === mouvement.ref);
    if (!article) return "";
    // Calculate what the old factor might have been based on the conversion
    if (mouvement.qteOriginale && mouvement.qte && mouvement.qteOriginale !== mouvement.qte) {
      const oldFactor = mouvement.qte / mouvement.qteOriginale;
      return `Ce mouvement utilise un ancien facteur de conversion (${oldFactor.toFixed(1)}). Le facteur actuel est ${article.facteurConversion}.`;
    }
    return "";
  };

  // Calculate if a movement is delayed (> 24 hours in "En attente" status)
  const isMovementDelayed = (mouvement: Mouvement): boolean => {
    if (mouvement.statut !== "En attente") return false;
    
    try {
      const movementDate = new Date(mouvement.date);
      const currentDate = new Date();
      const hoursDifference = (currentDate.getTime() - movementDate.getTime()) / (1000 * 60 * 60);
      
      return hoursDifference > 24;
    } catch {
      return false;
    }
  };

  // Get delay duration in hours for tooltip
  const getDelayDuration = (mouvement: Mouvement): string => {
    try {
      const movementDate = new Date(mouvement.date);
      const currentDate = new Date();
      const hoursDifference = (currentDate.getTime() - movementDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDifference < 1) {
        const minutes = Math.round(hoursDifference * 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else if (hoursDifference < 24) {
        const hours = Math.round(hoursDifference);
        return `${hours} heure${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.round(hoursDifference / 24);
        return `${days} jour${days > 1 ? 's' : ''}`;
      }
    } catch {
      return "N/A";
    }
  };

  const getStatusBadge = (mouvement: Mouvement) => {
    const isDelayed = isMovementDelayed(mouvement);
    const delayDuration = getDelayDuration(mouvement);
    
    switch (mouvement.statut) {
      case "En attente":
        return (
          <div className="relative group inline-flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700">
              {isDelayed && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
              En attente
            </span>
            {isDelayed && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                En attente depuis {delayDuration}
              </div>
            )}
          </div>
        );
      case "En attente de validation Qualité":
        return <span className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700">
          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
          En attente
        </span>;
      case "Terminé":
        return <span className="text-xs font-normal text-gray-700">Terminé</span>;
      case "Rejeté":
        return <span className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          Rejeté
        </span>;
      default:
        return null;
    }
  };

  const getSourceLabel = (mouvement: Mouvement) => {
    if (mouvement.type === "Sortie" || mouvement.type === "Transfert" || mouvement.type === "Ajustement") {
      return mouvement.emplacementSource || "N/A";
    }
    return "—";
  };

  const getDestinationLabel = (mouvement: Mouvement) => {
    if (mouvement.type === "Entrée" || mouvement.type === "Transfert") {
      return mouvement.emplacementDestination;
    }
    if (mouvement.type === "Sortie") {
      return mouvement.emplacementDestination;
    }
    if (mouvement.type === "Ajustement") {
      return "—";
    }
    return "N/A";
  };

  const getApprovedByLabel = (mouvement: Mouvement) => {
    if (mouvement.controleur) {
      return mouvement.controleur;
    }
    if (mouvement.type === "Entrée" || mouvement.type === "Ajustement") {
      return "Système";
    }
    if (mouvement.type === "Transfert") {
      return "N/A";
    }
    if (mouvement.type === "Sortie" && mouvement.statut === "En attente de validation Qualité") {
      return "En attente";
    }
    return "N/A";
  };

  if (compact) {
    // Version compacte pour le Dashboard
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 md:px-4 text-xs font-medium text-gray-500">Type</th>
              <th className="text-left py-2 px-2 md:px-4 text-xs font-medium text-gray-500">Article</th>
              <th className="hidden md:table-cell text-left py-2 px-4 text-xs font-medium text-gray-500">Source</th>
              <th className="hidden md:table-cell text-left py-2 px-4 text-xs font-medium text-gray-500">Destination</th>
              <th className="text-right py-2 px-2 md:px-4 text-xs font-medium text-gray-500">Date</th>
              <th className="text-center py-2 px-2 md:px-4 text-xs font-medium text-gray-500">Statut</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-sm text-gray-500">
                  Aucun mouvement récent
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 px-2 md:px-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700">
                      {getMovementIcon(m.type)}
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 md:px-4 font-medium text-gray-900 text-sm">{m.article}</td>
                  <td className="hidden md:table-cell py-2.5 px-4 text-gray-600 text-xs">{getSourceLabel(m)}</td>
                  <td className="hidden md:table-cell py-2.5 px-4 text-gray-600 text-xs">{getDestinationLabel(m)}</td>
                  <td className="py-2.5 px-2 md:px-4 text-right text-gray-600 font-mono text-xs tabular-nums">{m.date.split(' ')[1]?.substring(0, 5) || "00:00"}</td>
                  <td className="py-2.5 px-2 md:px-4 text-center">{getStatusBadge(m)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // Version complète pour la page Mouvements
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto min-w-[1200px]">
        <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-white border-b border-gray-200">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">Article</th>
            <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-500">N° Lot</th>
            <th className="hidden md:table-cell text-center py-2.5 px-3 text-xs font-medium text-gray-500">Qté Saisie</th>
            <th className="hidden lg:table-cell text-center py-2.5 px-3 text-xs font-medium text-gray-500">Impact Stock</th>
            <th className="hidden lg:table-cell text-right py-2.5 px-3 text-xs font-medium text-gray-500">Qté Valide</th>
            <th className="hidden lg:table-cell text-right py-2.5 px-3 text-xs font-medium text-gray-500">Qté Défect.</th>
            <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-500">
              {movements.length > 0 && movements.every(m => m.type === "Entrée") ? "Fournisseur" : "Source"}
            </th>
            <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-500">Destination</th>
            <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-500">Statut</th>
            <th className="hidden md:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-500">Opérateur</th>
            <th className="hidden lg:table-cell text-left py-2.5 px-3 text-xs font-medium text-gray-500">Approuvé par</th>
            {showActions && <th className="text-center py-2.5 px-3 text-xs font-medium text-gray-500">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 12 : 11} className="py-8 text-center text-sm text-gray-500">
                Aucun mouvement récent
              </td>
            </tr>
          ) : (
            movements.map((m) => {
              // Determine if conversion happened
              const hasConversion = m.qteOriginale !== undefined && m.qte !== m.qteOriginale;
              
              return (
                <tr key={m.id} className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-medium text-gray-900 text-sm">{m.article}</span>
                    <span className="block text-xs text-gray-500 font-mono">{m.ref}</span>
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3">
                    <span className="font-mono text-xs text-gray-900">
                      {m.lotNumber || "—"}
                    </span>
                  </td>
                  
                  {/* Quantité Saisie - User Input with Unit Badge */}
                  <td className="hidden md:table-cell py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-gray-900 text-sm tabular-nums">
                        {m.qteOriginale !== undefined ? m.qteOriginale.toLocaleString('fr-FR') : m.qte.toLocaleString('fr-FR')}
                      </span>
                      {m.uniteUtilisee ? (
                        <UnitBadge unit={m.uniteUtilisee} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Impact Stock - Calculated Total with Arrow and Exit Unit Badge */}
                  <td className="hidden lg:table-cell py-3 px-3">
                    <div className="flex items-center justify-center gap-2">
                      {m.statut === "En attente" && m.type === "Entrée" ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-mono text-gray-600 text-sm tabular-nums">
                            {m.qte.toLocaleString('fr-FR')}
                          </span>
                          {m.uniteSortie && <UnitBadge unit={m.uniteSortie} />}
                        </>
                      ) : hasConversion ? (
                        <>
                          <span className="text-gray-400 text-xs">→</span>
                          <span className="font-mono text-gray-900 text-sm tabular-nums">
                            {m.qte.toLocaleString('fr-FR')}
                          </span>
                          {m.uniteSortie && <UnitBadge unit={m.uniteSortie} />}
                          {hasOldFactor(m) && (
                            <div className="relative group">
                              <Clock className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {getOldFactorTooltip(m)}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-mono text-gray-600 text-xs tabular-nums">
                            {m.qte.toLocaleString('fr-FR')}
                          </span>
                          {m.uniteSortie && <UnitBadge unit={m.uniteSortie} />}
                          {hasOldFactor(m) && (
                            <div className="relative group">
                              <Clock className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {getOldFactorTooltip(m)}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  
                  <td className="hidden lg:table-cell py-3 px-3 text-right font-mono">
                    {m.validQuantity !== undefined ? (
                      <span className="text-gray-900 text-sm tabular-nums">{m.validQuantity.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3 text-right font-mono">
                    {m.defectiveQuantity !== undefined && m.defectiveQuantity > 0 ? (
                      <span className="text-red-600 text-sm tabular-nums">{m.defectiveQuantity.toLocaleString()}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3 text-gray-600 text-xs">
                    {getSourceLabel(m)}
                  </td>
                  <td className="hidden lg:table-cell py-3 px-3 text-gray-600 text-xs">
                    {getDestinationLabel(m)}
                  </td>
                  <td className="py-3 px-3 text-center">{getStatusBadge(m)}</td>
                  <td className="hidden md:table-cell py-3 px-3 text-gray-600 text-xs">{m.operateur}</td>
                  <td className="hidden lg:table-cell py-3 px-3 text-gray-600 text-xs">
                    {getApprovedByLabel(m)}
                  </td>
                  {showActions && (
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                      {onInspect && (m.type === "Entrée" || m.type === "Sortie") && m.statut === "En attente" && (
                        <button
                          onClick={() => onInspect?.(m.id)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Contrôle Qualité"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                      )}
                      {onRedoInspection && canRedoInspection(m, "En inspection") && (
                        <button
                          onClick={() => onRedoInspection(m.id)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Refaire le contrôle"
                          aria-label="Refaire le contrôle"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Terminé" && m.status === "approved" && !hideLinePdf && (
                        <button
                          onClick={() => generateOutboundPDF(m, articles)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon de Sortie (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "administrative" && !hideLinePdf && (
                        <button
                          onClick={() => generateAdministrativeErrorPDF(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger la Note de Correction (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "defective" && !hideLinePdf && (
                        <button
                          onClick={() => generateDefectiveItemsPDF(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger l'Avis de Rejet (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Entrée" && m.statut !== "En attente" && !hideLinePdf && (
                        <button
                          onClick={() => generateInboundPDF(m, articles)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon d'Entrée (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Transfert" && !hideLinePdf && (
                        <button
                          onClick={() => generateTransferPDF(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon de Transfert (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Ajustement" && !hideLinePdf && (
                        <button
                          onClick={() => generateAdjustmentPDF(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon d'Ajustement (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.status === "rejected" && m.rejectionReason && !hideLinePdf && (
                        <button
                          onClick={() => generateRejectionPDF(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le rapport de rejet (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {onDuplicate && m.type !== "Ajustement" && (
                        <button
                          onClick={() => onDuplicate(m)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Dupliquer ce mouvement"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(m.id)}
                          className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-600"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {movements.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            Aucun mouvement récent
          </div>
        ) : (
          movements.map((m) => {
            const hasConversion = m.qteOriginale !== undefined && m.qte !== m.qteOriginale;
            const hasQualityData = m.validQuantity !== undefined || (m.defectiveQuantity !== undefined && m.defectiveQuantity > 0);
            
            return (
              <div key={m.id} className="border border-gray-200 rounded-md p-4 bg-white hover:bg-gray-50 transition-colors space-y-3">
                {/* Header: Article Name + REF + Type Badge */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-200">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{m.article}</div>
                    <div className="text-xs text-gray-500 font-mono truncate">{m.ref}</div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-normal text-gray-700 whitespace-nowrap flex-shrink-0">
                    {getMovementIcon(m.type)}
                    {m.type === "Ajustement" 
                      ? `${m.typeAjustement === "Surplus" ? "+" : "-"}`
                      : m.type
                    }
                  </span>
                </div>

                {/* Section 1: Quantities */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Quantité Saisie</span>
                      <div className="text-sm font-medium text-gray-900">
                        {m.qteOriginale !== undefined ? m.qteOriginale.toLocaleString('fr-FR') : m.qte.toLocaleString('fr-FR')}
                        {m.uniteUtilisee && ` ${m.uniteUtilisee}`}
                      </div>
                    </div>
                    {hasConversion && (
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">Impact Stock</span>
                        <div className="text-sm font-medium text-gray-900">
                          → {m.qte.toLocaleString('fr-FR')} {m.uniteSortie}
                        </div>
                      </div>
                    )}
                  </div>
                  {!hasConversion && (
                    <div>
                      <span className="text-xs text-gray-500">Impact Stock</span>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {m.statut === "En attente" && m.type === "Entrée" ? (
                          <>
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{m.qte.toLocaleString('fr-FR')} {m.uniteSortie}</span>
                          </>
                        ) : (
                          <span className="text-gray-900">{m.qte.toLocaleString('fr-FR')} {m.uniteSortie}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200" />

                {/* Section 2: Traceability - Lot Number and Date */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Lot:</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-900 truncate">
                        {m.lotNumber || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Date Lot:</span>
                    <div className="text-xs font-mono text-gray-600">
                      {m.lotDate ? new Date(m.lotDate).toLocaleDateString('fr-FR') : "—"}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Section 3: Location - Source ⮕ Destination */}
                {(m.emplacementSource || m.emplacementDestination) && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="truncate flex-1">{getSourceLabel(m)}</span>
                        <span className="text-gray-400 flex-shrink-0">→</span>
                        <span className="truncate flex-1">{getDestinationLabel(m)}</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-200" />
                  </>
                )}

                {/* Section 4: Approval Information */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Approuvé par:</span>
                    <div className="text-xs text-gray-600">
                      {getApprovedByLabel(m)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Section 5: Quality Control Data */}
                {hasQualityData && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Contrôle Qualité</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {m.validQuantity !== undefined && (
                          <div className="flex items-center gap-2">
                            <CheckIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Qté Valide</div>
                              <div className="text-sm font-medium text-gray-900">
                                {m.validQuantity.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                        {m.defectiveQuantity !== undefined && m.defectiveQuantity > 0 && (
                          <div className="flex items-center gap-2">
                            <XIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-gray-500">Qté Défect.</div>
                              <div className="text-sm font-medium text-red-600">
                                {m.defectiveQuantity.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="border-t border-gray-200" />
                  </>
                )}

                {/* Section 6: System Info - Date/Heure and Opérateur */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Date:</span>
                    <div className="text-xs font-mono text-gray-600 tabular-nums">
                      {m.date}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Opérateur:</span>
                    <div className="text-xs text-gray-600">
                      {m.operateur}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 min-w-fit">Statut:</span>
                    <div className="text-xs">
                      {getStatusBadge(m)}
                    </div>
                  </div>
                </div>

                {/* Section 7: Notes - Commentaire */}
                {m.commentaire && (
                  <>
                    <div className="border-t border-gray-200" />
                    <div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Commentaire
                        </span>
                        <div className="text-xs text-gray-700 break-words">
                          {m.commentaire}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Bottom: Action Buttons */}
                {showActions && (
                  <>
                    <div className="border-t border-gray-200" />
                    <div className="flex items-center justify-end gap-2 pt-2">
                      {/* Inspecter Button for Pending Entrée/Sortie */}
                      {onInspect && (m.type === "Entrée" || m.type === "Sortie") && m.statut === "En attente" && (
                        <button
                          onClick={() => onInspect?.(m.id)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Contrôle Qualité"
                        >
                          <ClipboardCheck className="w-5 h-5" />
                        </button>
                      )}
                      {onRedoInspection && canRedoInspection(m, "En inspection") && (
                        <button
                          onClick={() => onRedoInspection(m.id)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Refaire le contrôle"
                          aria-label="Refaire le contrôle"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      )}
                      {/* PDF Download Buttons */}
                      {m.type === "Sortie" && m.statut === "Terminé" && m.status === "approved" && !hideLinePdf && (
                        <button
                          onClick={() => generateOutboundPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon de Sortie (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "administrative" && !hideLinePdf && (
                        <button
                          onClick={() => generateAdministrativeErrorPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger la Note de Correction (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Refusé" && m.refusalType === "defective" && !hideLinePdf && (
                        <button
                          onClick={() => generateDefectiveItemsPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger l'Avis de Rejet (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Entrée" && m.statut !== "En attente" && !hideLinePdf && (
                        <button
                          onClick={() => generateInboundPDF(m, articles)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon d'Entrée (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Transfert" && !hideLinePdf && (
                        <button
                          onClick={() => generateTransferPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon de Transfert (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Ajustement" && !hideLinePdf && (
                        <button
                          onClick={() => generateAdjustmentPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le Bon d'Ajustement (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.status === "rejected" && m.rejectionReason && !hideLinePdf && (
                        <button
                          onClick={() => generateRejectionPDF(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Télécharger le rapport de rejet (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {/* Copy/Duplicate Button */}
                      {onDuplicate && m.type !== "Ajustement" && (
                        <button
                          onClick={() => onDuplicate(m)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                          title="Dupliquer ce mouvement"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                      {/* Delete Button */}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(m.id)}
                          className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-600"
                          title="Supprimer la ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

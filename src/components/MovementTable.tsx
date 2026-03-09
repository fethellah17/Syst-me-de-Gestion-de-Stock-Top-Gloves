import { Shield, Pencil, Trash2, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, FileEdit, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { 
  generateInboundPDF, 
  generateOutboundPDF, 
  generateTransferPDF, 
  generateAdjustmentPDF,
  generateRejectionPDF 
} from "@/lib/pdf-generator";
import { UnitBadge } from "@/components/UnitBadge";
import type { Mouvement } from "@/contexts/DataContext";

interface MovementTableProps {
  movements: Mouvement[];
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onQualityControl?: (id: number) => void;
  onReject?: (id: number) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const MovementTable = ({ 
  movements, 
  onEdit, 
  onDelete, 
  onQualityControl,
  onReject,
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

  const getStatusBadge = (mouvement: Mouvement) => {
    if (mouvement.type !== "Sortie" && mouvement.type !== "Ajustement") return null;
    
    switch (mouvement.statut) {
      case "En attente de validation Qualité":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3" />
          En attente
        </span>;
      case "Terminé":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold status-green">
          <CheckCircle2 className="w-3 h-3" />
          Terminé
        </span>;
      case "Rejeté":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold status-red">
          <AlertCircle className="w-3 h-3" />
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
            <tr className="border-b">
              <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Article</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Source</th>
              <th className="text-left py-2 text-muted-foreground font-medium">Destination</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Date</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-muted-foreground text-xs">
                  Aucun mouvement récent
                </td>
              </tr>
            ) : (
              movements.map((m) => (
                <tr key={m.id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      m.type === "Entrée" ? "status-green" 
                      : m.type === "Sortie" ? "status-yellow" 
                      : m.type === "Ajustement" ? "bg-purple-100 text-purple-800"
                      : "status-blue"
                    }`}>
                      {getMovementIcon(m.type)}
                      {m.type}
                    </span>
                  </td>
                  <td className="py-2.5 font-medium text-foreground">{m.article}</td>
                  <td className="py-2.5 text-muted-foreground">{getSourceLabel(m)}</td>
                  <td className="py-2.5 text-muted-foreground">{getDestinationLabel(m)}</td>
                  <td className="py-2.5 text-right text-muted-foreground font-mono">{m.date.split(' ')[1]?.substring(0, 5) || "00:00"}</td>
                  <td className="py-2.5 text-center">{getStatusBadge(m)}</td>
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wide">Numéro de Lot</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-primary uppercase tracking-wide">Date du Lot</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité Saisie</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Impact Stock</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-success uppercase tracking-wide">Qté Valide</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-destructive uppercase tracking-wide">Qté Défect.</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opérateur</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Approuvé par</th>
            {showActions && <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 15 : 14} className="py-8 text-center text-muted-foreground">
                Aucun mouvement récent
              </td>
            </tr>
          ) : (
            movements.map((m) => {
              // Determine if conversion happened
              const hasConversion = m.qteOriginale !== undefined && m.qte !== m.qteOriginale;
              
              return (
                <tr key={m.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{m.date}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-foreground">{m.article}</span>
                    <span className="block text-[10px] text-muted-foreground font-mono">{m.ref}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      m.type === "Entrée" ? "status-green" 
                      : m.type === "Sortie" ? "status-yellow" 
                      : m.type === "Ajustement" ? "bg-purple-100 text-purple-800"
                      : "status-blue"
                    }`}>
                      {getMovementIcon(m.type)}
                      {m.type === "Ajustement" 
                        ? `Ajustement (${m.typeAjustement === "Surplus" ? "+" : "-"})`
                        : m.type
                      }
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/20">
                      {m.lotNumber || "N/A"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs text-foreground">
                      {m.lotDate ? new Date(m.lotDate).toLocaleDateString('fr-FR') : "N/A"}
                    </span>
                  </td>
                  
                  {/* Quantité Saisie - User Input with Unit Badge */}
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono font-semibold text-foreground text-sm">
                        {m.qteOriginale !== undefined ? m.qteOriginale.toLocaleString('fr-FR') : m.qte.toLocaleString('fr-FR')}
                      </span>
                      {m.uniteUtilisee ? (
                        <UnitBadge unit={m.uniteUtilisee} />
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">—</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Impact Stock - Calculated Total with Arrow and Exit Unit Badge */}
                  <td className="py-3 px-4">
                    {hasConversion ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-muted-foreground text-xs">→</span>
                        <span className="font-mono font-semibold text-primary text-sm">
                          {m.qte.toLocaleString('fr-FR')}
                        </span>
                        {m.uniteSortie && <UnitBadge unit={m.uniteSortie} />}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono text-muted-foreground text-xs">
                          {m.qte.toLocaleString('fr-FR')}
                        </span>
                        {m.uniteSortie && <UnitBadge unit={m.uniteSortie} />}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-3 px-4 text-right font-mono">
                    {m.validQuantity !== undefined ? (
                      <span className="text-success font-semibold">{m.validQuantity.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    {m.defectiveQuantity !== undefined && m.defectiveQuantity > 0 ? (
                      <span className="text-destructive font-semibold">{m.defectiveQuantity.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    <span className="font-medium">{getSourceLabel(m)}</span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    <span className="font-medium">{getDestinationLabel(m)}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(m)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{m.operateur}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    <span className={`${
                      getApprovedByLabel(m) === "En attente" ? "text-orange-600 font-medium" :
                      getApprovedByLabel(m) === "Système" ? "text-blue-600 font-medium" :
                      getApprovedByLabel(m) === "N/A" ? "text-muted-foreground/50" :
                      "text-foreground font-medium"
                    }`}>
                      {getApprovedByLabel(m)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                      {m.type === "Sortie" && m.statut === "En attente de validation Qualité" && onQualityControl && (
                        <button
                          onClick={() => onQualityControl(m.id)}
                          className="p-1.5 rounded-md hover:bg-orange-100 transition-colors text-orange-600 hover:text-orange-800"
                          title="Passer le contrôle qualité"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Sortie" && m.statut === "Terminé" && m.status === "approved" && (
                        <button
                          onClick={() => generateOutboundPDF(m)}
                          className="p-1.5 rounded-md hover:bg-green-100 transition-colors text-green-600 hover:text-green-800"
                          title="Télécharger le Bon de Sortie (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Entrée" && (
                        <button
                          onClick={() => generateInboundPDF(m)}
                          className="p-1.5 rounded-md hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-800"
                          title="Télécharger le Bon d'Entrée (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Transfert" && (
                        <button
                          onClick={() => generateTransferPDF(m)}
                          className="p-1.5 rounded-md hover:bg-purple-100 transition-colors text-purple-600 hover:text-purple-800"
                          title="Télécharger le Bon de Transfert (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.type === "Ajustement" && (
                        <button
                          onClick={() => generateAdjustmentPDF(m)}
                          className="p-1.5 rounded-md hover:bg-amber-100 transition-colors text-amber-600 hover:text-amber-800"
                          title="Télécharger le Bon d'Ajustement (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {m.status === "rejected" && m.rejectionReason && (
                        <button
                          onClick={() => generateRejectionPDF(m)}
                          className="p-1.5 rounded-md hover:bg-red-100 transition-colors text-red-600 hover:text-red-800"
                          title="Télécharger le rapport de rejet (PDF)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(m.id)}
                          className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(m.id)}
                          className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Supprimer"
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
  );
};

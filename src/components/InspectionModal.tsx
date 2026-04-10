import { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import type { Mouvement, Article } from "@/contexts/DataContext";

interface InspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mouvement: Mouvement | null;
  article: Article | null;
  onApprove: (data: InspectionData) => void;
}

export interface InspectionData {
  controleur: string;
  verificationPoints: {
    [key: string]: boolean;
  };
  qteValide: number;
  qteDefectueuse: number;
  qteDefectueuseUnit: "entree" | "sortie"; // Track which unit was used for input
  noteControle: string;
  refusTotalMotif?: string;
}

// Define checklists for each movement type
const VERIFICATION_CHECKLISTS = {
  Entrée: [
    {
      key: "aspect",
      label: "Aspect / Emballage Extérieur",
      description: "Vérifier l'état général et l'intégrité",
    },
    {
      key: "quantite",
      label: "Conformité Quantité vs BL",
      description: "Vérifier que la quantité correspond au bon de livraison",
    },
    {
      key: "documents",
      label: "Présence Documents (FDS/BL)",
      description: "Vérifier la présence des documents obligatoires",
    },
  ],
  Sortie: [
    {
      key: "etat",
      label: "État de l'article (Condition check)",
      description: "Vérifier l'état et la condition de l'article",
    },
    {
      key: "quantite",
      label: "Conformité Quantité vs Demande",
      description: "Vérifier que la quantité correspond à la demande",
    },
    {
      key: "emballage",
      label: "Emballage Expédition (Packaging for exit)",
      description: "Vérifier que l'emballage est approprié pour l'expédition",
    },
  ],
};

// Helper to get checklist for movement type
const getChecklistForType = (type: string) => {
  return VERIFICATION_CHECKLISTS[type as keyof typeof VERIFICATION_CHECKLISTS] || VERIFICATION_CHECKLISTS.Entrée;
};

// Helper to get modal title
const getModalTitle = (type: string) => {
  return `Contrôle Qualité - ${type}`;
};

export const InspectionModal = ({
  isOpen,
  onClose,
  mouvement,
  article,
  onApprove,
}: InspectionModalProps) => {
  const [controleur, setControleur] = useState("");
  const [verificationPoints, setVerificationPoints] = useState<Record<string, boolean>>({});
  const [qteValide, setQteValide] = useState(0);
  const [qteDefectueuse, setQteDefectueuse] = useState(0);
  const [qteDefectueuseUnit, setQteDefectueuseUnit] = useState<"entree" | "sortie">("sortie");
  const [noteControle, setNoteControle] = useState("");
  const [refusTotal, setRefusTotal] = useState(false);
  const [refusTotalMotif, setRefusTotalMotif] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize quantities and verification points when mouvement changes
  useEffect(() => {
    if (mouvement && isOpen) {
      setQteValide(mouvement.qte);
      setQteDefectueuse(0);
      setControleur("");
      setNoteControle("");
      setRefusTotal(false);
      setRefusTotalMotif("");
      
      // Initialize verification points based on movement type
      const checklist = getChecklistForType(mouvement.type);
      const initialPoints: Record<string, boolean> = {};
      checklist.forEach(item => {
        initialPoints[item.key] = false;
      });
      setVerificationPoints(initialPoints);
      setErrors([]);
    }
  }, [mouvement, isOpen]);

  // Auto-calculate Qté Valide when Qté Défectueuse changes
  const handleDefectuousChange = (value: string, unit: "entree" | "sortie") => {
    if (mouvement && article) {
      // Parse as number and ensure no leading zeros
      const numValue = value === "" ? 0 : parseFloat(value);
      
      // Convert to exit unit (sortie) for internal storage
      let defectiveQtyInExitUnit: number;
      
      if (unit === "sortie") {
        // Already in exit unit
        defectiveQtyInExitUnit = Math.max(0, Math.min(isNaN(numValue) ? 0 : numValue, mouvement.qte));
      } else {
        // Convert from entry unit (entree) to exit unit (sortie)
        // Formula: entree_qty * facteurConversion = sortie_qty
        defectiveQtyInExitUnit = Math.max(0, Math.min(isNaN(numValue) ? 0 : numValue * article.facteurConversion, mouvement.qte));
      }
      
      setQteDefectueuse(defectiveQtyInExitUnit);
      setQteDefectueuseUnit(unit);
      setQteValide(mouvement.qte - defectiveQtyInExitUnit);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // If refus total is selected, only validate controller name and motif
    if (refusTotal) {
      if (!controleur.trim()) {
        newErrors.push("Veuillez renseigner le nom du contrôleur");
      }
      if (!refusTotalMotif.trim()) {
        newErrors.push("Veuillez renseigner le motif du refus total");
      }
      setErrors(newErrors);
      return newErrors.length === 0;
    }

    // Check controller name
    if (!controleur.trim()) {
      newErrors.push("Veuillez renseigner le nom du contrôleur");
    }

    // Check quantity validation - must equal total
    if (!mouvement) {
      newErrors.push("Mouvement non trouvé");
    } else {
      const totalQty = qteValide + qteDefectueuse;
      if (totalQty !== mouvement.qte) {
        newErrors.push(
          `La somme des quantités (${totalQty}) doit égaler la quantité reçue (${mouvement.qte})`
        );
      }

      // Check if note is mandatory when there are defective items
      if (qteDefectueuse > 0 && !noteControle.trim()) {
        newErrors.push(
          "Une note de contrôle est obligatoire quand il y a des articles défectueux"
        );
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleApprove = () => {
    if (validateForm()) {
      if (refusTotal) {
        // Refus total: send with motif
        onApprove({
          controleur,
          verificationPoints: {},
          qteValide: 0,
          qteDefectueuse: mouvement?.qte || 0,
          noteControle: "",
          refusTotalMotif,
        });
      } else {
        // Normal approval
        onApprove({
          controleur,
          verificationPoints,
          qteValide,
          qteDefectueuse,
          qteDefectueuseUnit,
          noteControle,
        });
      }
      onClose();
    }
  };

  // Check if all verification points are checked
  const allPointsChecked = Object.values(verificationPoints).every(v => v);
  
  // Toggle all verification points
  const handleSelectAll = () => {
    const newState: Record<string, boolean> = {};
    const checklist = getChecklistForType(mouvement?.type || "Entrée");
    checklist.forEach(item => {
      newState[item.key] = !allPointsChecked;
    });
    setVerificationPoints(newState);
  };

  // CRUCIAL: Button is ENABLED by default - NOT locked by checkboxes
  const isApproveDisabled = refusTotal 
    ? false 
    : (qteValide + qteDefectueuse !== mouvement?.qte);

  if (!isOpen || !mouvement || !article) return null;

  const checklist = getChecklistForType(mouvement.type);
  const modalTitle = getModalTitle(mouvement.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-background border-b p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {modalTitle}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Vérification de la qualité et de la conformité
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-md transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Refus Total Toggle - Prominent at top */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={refusTotal}
                onChange={(e) => setRefusTotal(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-foreground text-sm">
                  Refuser toute la quantité
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Cochez cette case pour rejeter complètement ce mouvement
                </div>
              </div>
            </label>
          </div>

          {/* If Refus Total is selected, show only motif field */}
          {refusTotal ? (
            <>
              {/* Movement Details */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50 space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  Détails du Mouvement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Article
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {article.nom}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {article.ref}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Quantité à Refuser
                    </span>
                    <p className="text-sm font-semibold text-destructive">
                      {mouvement.qte.toLocaleString("fr-FR")} {article.uniteSortie}
                    </p>
                  </div>
                </div>
              </div>

              {/* Controller Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom du Contrôleur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={controleur}
                  onChange={(e) => setControleur(e.target.value)}
                  placeholder="Entrez votre nom"
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Refus Total Motif - Large mandatory text area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Motif du Refus Total <span className="text-red-500">* (Obligatoire)</span>
                </label>
                <textarea
                  value={refusTotalMotif}
                  onChange={(e) => setRefusTotalMotif(e.target.value)}
                  placeholder="Décrivez les raisons du refus complet de ce mouvement..."
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Justification détaillée du refus total
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Movement Details */}
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50 space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  Détails du Mouvement
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Article
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {article.nom}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {article.ref}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Quantité Reçue
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {mouvement.qte.toLocaleString("fr-FR")} {article.uniteSortie}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Zone de Destination
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {mouvement.emplacementDestination}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Opérateur
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {mouvement.operateur}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Numéro de Lot
                    </span>
                    <p className="text-sm font-mono font-semibold text-primary">
                      {mouvement.lotNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      Date
                    </span>
                    <p className="text-sm font-mono text-foreground">
                      {mouvement.date}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Checklist - Dynamic based on type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    Points de Vérification
                  </h3>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-medium px-3 py-1.5 rounded-md bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
                  >
                    {allPointsChecked ? "Désélectionner Tout" : "Sélectionner Tout"}
                  </button>
                </div>
                <div className="space-y-2">
                  {checklist.map(({ key, label, description }) => (
                    <label
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={verificationPoints[key] || false}
                        onChange={(e) =>
                          setVerificationPoints({
                            ...verificationPoints,
                            [key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded border-border mt-0.5 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground text-sm">
                          {label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity Input Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                  Saisie des Quantités
                </h3>
                
                {/* Total to Process - Read-only Master Reference */}
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Quantité à Traiter (Total)
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {mouvement.qte.toLocaleString("fr-FR")} {article.uniteSortie}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Référence maître (lecture seule)
                  </p>
                </div>

                {/* Dual Unit Input for Defective Quantity */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantité Non-Conforme (Défectueuse)
                    <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Unit Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setQteDefectueuseUnit("sortie")}
                      className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                        qteDefectueuseUnit === "sortie"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      En {article.uniteSortie}
                    </button>
                    <button
                      type="button"
                      onClick={() => setQteDefectueuseUnit("entree")}
                      className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                        qteDefectueuseUnit === "entree"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      En {article.uniteEntree}
                    </button>
                  </div>

                  {/* Input Field */}
                  <input
                    type="number"
                    value={
                      qteDefectueuse === 0
                        ? ""
                        : qteDefectueuseUnit === "sortie"
                        ? qteDefectueuse
                        : qteDefectueuse / article.facteurConversion
                    }
                    onChange={(e) => handleDefectuousChange(e.target.value, qteDefectueuseUnit)}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Saisissez le nombre d'unités défectueuses en {qteDefectueuseUnit === "sortie" ? article.uniteSortie : article.uniteEntree}
                  </p>
                  
                  {/* Conversion Display */}
                  {qteDefectueuse > 0 && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                      {qteDefectueuseUnit === "sortie" ? (
                        <>
                          {qteDefectueuse.toLocaleString("fr-FR")} {article.uniteSortie} = {(qteDefectueuse / article.facteurConversion).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {article.uniteEntree}
                        </>
                      ) : (
                        <>
                          {(qteDefectueuse / article.facteurConversion).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {article.uniteEntree} = {qteDefectueuse.toLocaleString("fr-FR")} {article.uniteSortie}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Auto-calculated: Quantité Valide */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quantité Conforme (Auto-calculée)
                  </label>
                  <div className="w-full h-10 px-3 rounded-md border border-slate-200 bg-background flex items-center text-sm text-foreground font-semibold">
                    {qteValide.toLocaleString("fr-FR")} {article.uniteSortie}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Calculée automatiquement: Total - Défectueuse
                  </p>
                </div>
              </div>

              {/* Compact Horizontal Summary */}
              <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 px-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex-1 text-center">
                    <div className="text-muted-foreground mb-1">Total</div>
                    <div className="font-bold text-foreground">
                      {mouvement.qte.toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 px-2">|</div>
                  <div className="flex-1 text-center">
                    <div className="text-muted-foreground mb-1">Conforme</div>
                    <div className="font-bold text-green-600 dark:text-green-400">
                      {qteValide.toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 px-2">|</div>
                  <div className="flex-1 text-center">
                    <div className="text-muted-foreground mb-1">Non-Conforme</div>
                    <div className={`font-bold ${
                      qteDefectueuse > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    }`}>
                      {qteDefectueuse.toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
                {/* Warning Message - Inline if defects */}
                {qteDefectueuse > 0 && (
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <AlertCircle className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      {qteDefectueuse.toLocaleString("fr-FR")} unité{qteDefectueuse > 1 ? "s" : ""} exclue{qteDefectueuse > 1 ? "s" : ""} du stock
                    </p>
                  </div>
                )}
              </div>

              {/* Controller Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nom du Contrôleur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={controleur}
                  onChange={(e) => setControleur(e.target.value)}
                  placeholder="Entrez votre nom"
                  className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Personne responsable de l'inspection
                </p>
              </div>

              {/* Control Note - Mandatory when defective items */}
              {qteDefectueuse > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Note de Contrôle{" "}
                    <span className="text-red-500">* (Obligatoire)</span>
                  </label>
                  <textarea
                    value={noteControle}
                    onChange={(e) => setNoteControle(e.target.value)}
                    placeholder="Décrivez les défauts détectés..."
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Détails sur les articles défectueux
                  </p>
                </div>
              )}
            </>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 space-y-2">
              {errors.map((error, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 dark:text-red-200">
                    {error}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-background border-t p-6 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleApprove}
            disabled={isApproveDisabled || !controleur.trim() || (refusTotal && !refusTotalMotif.trim())}
            className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors ${
              refusTotal
                ? isApproveDisabled || !controleur.trim() || !refusTotalMotif.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
                : isApproveDisabled || !controleur.trim()
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {refusTotal ? "Confirmer le Refus Total" : "Approuver la Réception"}
          </button>
        </div>
      </div>
    </div>
  );
};

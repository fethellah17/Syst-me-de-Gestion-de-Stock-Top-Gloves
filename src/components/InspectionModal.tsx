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
  refusalType?: "administrative" | "defective"; // SORTIE ONLY: Type of refusal
  nomOperateur?: string; // For administrative error
  motifErreur?: string; // For administrative error
  nomControleur?: string; // For defective items
  motifRejet?: string; // For defective items
  lotDate?: string; // Optional expiration date
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
  const [refusalType, setRefusalType] = useState<"administrative" | "defective" | null>(null);
  const [nomOperateur, setNomOperateur] = useState("");
  const [motifErreur, setMotifErreur] = useState("");
  const [nomControleur, setNomControleur] = useState("");
  const [motifRejet, setMotifRejet] = useState("");
  const [lotDate, setLotDate] = useState("");
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
      setRefusalType(null);
      setNomOperateur("");
      setMotifErreur("");
      setNomControleur("");
      setMotifRejet("");
      setLotDate(mouvement.lotDate || "");
      
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

    // SORTIE ONLY: If refus total is selected, validate dual refusal mode
    if (mouvement?.type === "Sortie" && refusTotal) {
      if (!refusalType) {
        newErrors.push("Veuillez sélectionner le type de refus");
      }
      
      if (refusalType === "administrative") {
        if (!nomOperateur.trim()) {
          newErrors.push("Veuillez renseigner le nom de l'opérateur");
        }
        if (!motifErreur.trim()) {
          newErrors.push("Veuillez renseigner le motif de l'erreur");
        }
      } else if (refusalType === "defective") {
        if (!nomControleur.trim()) {
          newErrors.push("Veuillez renseigner le nom du contrôleur");
        }
        if (!motifRejet.trim()) {
          newErrors.push("Veuillez renseigner le motif du rejet");
        }
      }
      
      setErrors(newErrors);
      return newErrors.length === 0;
    }

    // ENTRÉE ONLY: Simple refusal logic (no stock impact)
    if (mouvement?.type === "Entrée" && refusTotal) {
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
      // SORTIE ONLY: Dual refusal modes
      if (mouvement?.type === "Sortie" && refusTotal && refusalType) {
        onApprove({
          controleur: refusalType === "administrative" ? nomOperateur : nomControleur,
          verificationPoints: {},
          qteValide: 0,
          qteDefectueuse: mouvement?.qte || 0,
          qteDefectueuseUnit: "sortie",
          noteControle: "",
          refusalType,
          nomOperateur: refusalType === "administrative" ? nomOperateur : undefined,
          motifErreur: refusalType === "administrative" ? motifErreur : undefined,
          nomControleur: refusalType === "defective" ? nomControleur : undefined,
          motifRejet: refusalType === "defective" ? motifRejet : undefined,
          lotDate: lotDate || undefined,
        });
      }
      // ENTRÉE ONLY: Simple refusal logic
      else if (mouvement?.type === "Entrée" && refusTotal) {
        onApprove({
          controleur,
          verificationPoints: {},
          qteValide: 0,
          qteDefectueuse: mouvement?.qte || 0,
          qteDefectueuseUnit: "sortie",
          noteControle: "",
          refusTotalMotif,
          lotDate: lotDate || undefined,
        });
      }
      // Normal approval (both Entrée and Sortie)
      else {
        onApprove({
          controleur,
          verificationPoints,
          qteValide,
          qteDefectueuse,
          qteDefectueuseUnit,
          noteControle,
          lotDate: lotDate || undefined,
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
  // For Sortie: quantities must sum to total
  // For Entrée: quantities must sum to total
  const isApproveDisabled = refusTotal 
    ? false 
    : (qteValide + qteDefectueuse !== mouvement?.qte);

  if (!isOpen || !mouvement || !article) return null;

  const checklist = getChecklistForType(mouvement.type);
  const modalTitle = getModalTitle(mouvement.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-[95vw] max-h-[92vh] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {modalTitle}
            </h2>
            <p className="text-[13px] text-gray-500">
              Vérification de la qualité et de la conformité
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="px-6 py-4 overflow-y-auto overflow-x-hidden flex-1">
          <div className="space-y-5">
            {/* Refus Total Toggle - Full width compact row */}
            <div className="md:col-span-2 border border-gray-200 rounded py-2 px-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={refusTotal}
                  onChange={(e) => setRefusTotal(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer accent-primary"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    Refuser toute la quantité
                  </div>
                  <div className="text-xs text-gray-500">
                    Cochez cette case pour rejeter complètement ce mouvement
                  </div>
                </div>
              </label>
            </div>

            {/* If Refus Total is selected, show conditional fields */}
            {refusTotal ? (
              <div className="space-y-5">
                {/* SORTIE ONLY: Dual Refusal Mode Selection */}
                {mouvement.type === "Sortie" ? (
                  <>
                    <div className="border-b border-gray-200 pb-2">
                      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500">
                        Sélectionnez le Type de Refus
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Option 1: Administrative Error */}
                      <label className="flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-colors"
                        style={{
                          borderColor: refusalType === "administrative" ? "rgb(59, 130, 246)" : "rgb(229, 231, 235)",
                          backgroundColor: refusalType === "administrative" ? "rgb(239, 246, 255)" : "transparent"
                        }}>
                        <input
                          type="radio"
                          name="refusalType"
                          value="administrative"
                          checked={refusalType === "administrative"}
                          onChange={() => setRefusalType("administrative")}
                          className="w-4 h-4 mt-0.5 cursor-pointer accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            Erreur Administrative / Retour en Stock
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Erreur de picking ou d'entrée. La marchandise est réintégrée au stock.
                          </div>
                        </div>
                      </label>

                      {/* Option 2: Defective Items */}
                      <label className="flex items-start gap-3 p-3 rounded border-2 cursor-pointer transition-colors"
                        style={{
                          borderColor: refusalType === "defective" ? "rgb(220, 38, 38)" : "rgb(229, 231, 235)",
                          backgroundColor: refusalType === "defective" ? "rgb(254, 242, 242)" : "transparent"
                        }}>
                        <input
                          type="radio"
                          name="refusalType"
                          value="defective"
                          checked={refusalType === "defective"}
                          onChange={() => setRefusalType("defective")}
                          className="w-4 h-4 mt-0.5 cursor-pointer accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            Article Défectueux / Rebut
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Dommage physique. La marchandise est déduite du stock.
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Conditional Fields Based on Refusal Type */}
                    {refusalType === "administrative" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Nom de l'Opérateur <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={nomOperateur}
                            onChange={(e) => setNomOperateur(e.target.value)}
                            placeholder="Entrez le nom de l'opérateur"
                            className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>

                        <div className="md:col-span-2 min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Motif de l'Erreur <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            value={motifErreur}
                            onChange={(e) => setMotifErreur(e.target.value)}
                            placeholder="Décrivez l'erreur de préparation..."
                            className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Détails sur l'erreur administrative
                          </p>
                        </div>
                      </div>
                    )}

                    {refusalType === "defective" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Nom du Contrôleur <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={nomControleur}
                            onChange={(e) => setNomControleur(e.target.value)}
                            placeholder="Entrez le nom du contrôleur"
                            className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          />
                        </div>

                        <div className="md:col-span-2 min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Motif du Rejet <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            value={motifRejet}
                            onChange={(e) => setMotifRejet(e.target.value)}
                            placeholder="Décrivez les défauts détectés..."
                            className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                            rows={3}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Détails sur les articles défectueux
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* ENTRÉE ONLY: Simple refusal logic */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      <div className="min-w-0">
                        <label className="block text-[13px] font-medium text-gray-600 mb-1">
                          Nom du Contrôleur <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={controleur}
                          onChange={(e) => setControleur(e.target.value)}
                          placeholder="Entrez votre nom"
                          className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                        />
                      </div>

                      <div className="md:col-span-2 min-w-0">
                        <label className="block text-[13px] font-medium text-gray-600 mb-1">
                          Motif du Refus Total <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          value={refusTotalMotif}
                          onChange={(e) => setRefusTotalMotif(e.target.value)}
                          placeholder="Décrivez les raisons du refus complet de ce mouvement..."
                          className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Justification détaillée du refus total
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Two-column layout for normal approval */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                  {/* Left Column: Détails du mouvement */}
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500 border-b border-gray-200 pb-2 mb-3">
                        Détails du mouvement
                      </h3>
                      <div className="space-y-0">
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Article</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-900">{article.nom}</div>
                            <div className="text-xs text-gray-500">{article.ref}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Quantité reçue</span>
                          <span className="text-sm text-gray-900">{mouvement.qte.toLocaleString("fr-FR")} {article.uniteSortie}</span>
                        </div>
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Zone</span>
                          <span className="text-sm text-gray-900">{mouvement.emplacementDestination || mouvement.emplacementSource}</span>
                        </div>
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Opérateur</span>
                          <span className="text-sm text-gray-900">{mouvement.operateur}</span>
                        </div>
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Numéro de lot</span>
                          <span className="text-sm text-gray-900">{mouvement.lotNumber}</span>
                        </div>
                        <div className="flex items-start gap-3 py-1.5 border-b border-dotted border-gray-200">
                          <span className="text-[13px] text-gray-500 w-36 flex-shrink-0">Date</span>
                          <span className="text-sm text-gray-900">{mouvement.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date d'expiration - inline with other fields */}
                    <div className="min-w-0">
                      <label className="block text-[13px] font-medium text-gray-600 mb-1">
                        Date d'expiration (optionnel)
                      </label>
                      <input
                        type="date"
                        value={lotDate}
                        onChange={(e) => setLotDate(e.target.value)}
                        className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Date limite de consommation ou d'utilisation
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Points de vérification */}
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-3">
                        <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500">
                          Points de vérification
                        </h3>
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-xs text-primary hover:underline"
                        >
                          {allPointsChecked ? "Désélectionner Tout" : "Sélectionner Tout"}
                        </button>
                      </div>
                      <div className="space-y-0">
                        {checklist.map(({ key, label, description }) => (
                          <label
                            key={key}
                            className="flex items-start gap-3 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
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
                              className="w-4 h-4 rounded border-gray-300 mt-0.5 cursor-pointer accent-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-gray-900">
                                {label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Full width: Saisie des quantités */}
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500 border-b border-gray-200 pb-2 mb-3">
                        Saisie des quantités
                      </h3>

                      {/* Three-column row on desktop */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Total */}
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Quantité à traiter (total)
                          </label>
                          <div className="w-full h-9 px-3 rounded border border-gray-300 bg-gray-50 flex items-center text-sm text-gray-900 font-medium">
                            {mouvement.qte.toLocaleString("fr-FR")} {article.uniteSortie}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Référence maître (lecture seule)
                          </p>
                        </div>

                        {/* Defective with unit toggle */}
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Quantité non-conforme <span className="text-red-600">*</span>
                          </label>
                          
                          {/* Unit Toggle - segmented control */}
                          <div className="flex gap-0.5 mb-2 border border-gray-300 rounded overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setQteDefectueuseUnit("sortie")}
                              className={`flex-1 h-9 text-xs font-medium transition-colors ${
                                qteDefectueuseUnit === "sortie"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              En {article.uniteSortie}
                            </button>
                            <button
                              type="button"
                              onClick={() => setQteDefectueuseUnit("entree")}
                              className={`flex-1 h-9 text-xs font-medium transition-colors ${
                                qteDefectueuseUnit === "entree"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              En {article.uniteEntree}
                            </button>
                          </div>

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
                            className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary no-spinner"
                            min="0"
                            step="0.01"
                            placeholder="0"
                          />
                          {/* Conversion hint */}
                          {qteDefectueuse > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {qteDefectueuseUnit === "sortie" ? (
                                <>{qteDefectueuse.toLocaleString("fr-FR")} {article.uniteSortie} = {(qteDefectueuse / article.facteurConversion).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {article.uniteEntree}</>
                              ) : (
                                <>{(qteDefectueuse / article.facteurConversion).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {article.uniteEntree} = {qteDefectueuse.toLocaleString("fr-FR")} {article.uniteSortie}</>
                              )}
                            </p>
                          )}
                        </div>

                        {/* Valid (auto-calculated) */}
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Quantité conforme (auto)
                          </label>
                          <div className="w-full h-9 px-3 rounded border border-gray-300 bg-gray-50 flex items-center text-sm text-gray-900 font-medium">
                            {qteValide.toLocaleString("fr-FR")} {article.uniteSortie}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Calculée: Total - Défectueuse
                          </p>
                        </div>
                      </div>

                      {/* Summary stats - single inline row */}
                      <div className="flex items-center justify-around py-2 border-t border-b border-gray-200">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-0.5">Total</div>
                          <div className="text-sm font-medium text-gray-900">
                            {mouvement.qte.toLocaleString("fr-FR")}
                          </div>
                        </div>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-0.5">Conforme</div>
                          <div className="text-sm font-medium text-gray-900">
                            {qteValide.toLocaleString("fr-FR")}
                          </div>
                        </div>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-0.5">Non-Conforme</div>
                          <div className={`text-sm font-medium ${
                            qteDefectueuse > 0 ? "text-red-600" : "text-gray-900"
                          }`}>
                            {qteDefectueuse.toLocaleString("fr-FR")}
                          </div>
                        </div>
                      </div>

                      {/* Warning: units excluded from stock */}
                      {qteDefectueuse > 0 && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-2">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{qteDefectueuse.toLocaleString("fr-FR")} unité{qteDefectueuse > 1 ? "s" : ""} exclue{qteDefectueuse > 1 ? "s" : ""} du stock</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Full width: Contrôle section */}
                  <div className="md:col-span-2 space-y-5">
                    <div>
                      <h3 className="text-xs uppercase tracking-wide font-medium text-gray-500 border-b border-gray-200 pb-2 mb-3">
                        Contrôle
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Nom du Contrôleur <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={controleur}
                            onChange={(e) => setControleur(e.target.value)}
                            placeholder="Entrez votre nom"
                            className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Personne responsable de l'inspection
                          </p>
                        </div>

                        {/* Note de Contrôle - Mandatory when defective items, full width */}
                        {qteDefectueuse > 0 && (
                          <div className="md:col-span-2 min-w-0">
                            <label className="block text-[13px] font-medium text-gray-600 mb-1">
                              Note de Contrôle <span className="text-xs text-red-600">(Obligatoire)</span>
                            </label>
                            <textarea
                              value={noteControle}
                              onChange={(e) => setNoteControle(e.target.value)}
                              placeholder="Décrivez les défauts détectés..."
                              className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                              rows={2}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Détails sur les articles défectueux
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="p-3 rounded border border-red-200 bg-red-50 space-y-1.5">
                {errors.map((error, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">
                      {error}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleApprove}
            disabled={
              refusTotal
                ? mouvement?.type === "Sortie"
                  ? !refusalType || (refusalType === "administrative" && (!nomOperateur.trim() || !motifErreur.trim())) || (refusalType === "defective" && (!nomControleur.trim() || !motifRejet.trim()))
                  : !controleur.trim() || !refusTotalMotif.trim()
                : isApproveDisabled || !controleur.trim()
            }
            className={`h-9 px-4 rounded text-sm font-medium transition-colors ${
              refusTotal
                ? mouvement?.type === "Sortie"
                  ? !refusalType || (refusalType === "administrative" && (!nomOperateur.trim() || !motifErreur.trim())) || (refusalType === "defective" && (!nomControleur.trim() || !motifRejet.trim()))
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                  : !controleur.trim() || !refusTotalMotif.trim()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
                : isApproveDisabled || !controleur.trim()
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {refusTotal
              ? mouvement?.type === "Sortie"
                ? "Confirmer le Refus Total"
                : "Confirmer le Refus Total"
              : "Approuver la Réception"}
          </button>
        </div>
      </div>
    </div>
  );
};

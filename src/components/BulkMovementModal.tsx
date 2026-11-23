import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { BulkMovementModalWrapper } from "@/components/BulkMovementModalWrapper";
import CreatableSelect from "@/components/CreatableSelect";

type MovementType = "Entrée" | "Sortie" | "Transfert";

interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  fournisseur?: string;
  lotNumber: string;
  lotDate?: Date;
  commentaire?: string;
  qc_status: "pending" | "approved" | "rejected";
}

interface BulkMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: any[];
  emplacements: any[];
  destinations: any[];
  suppliers?: any[];
  getArticleLocations: (ref: string) => any[];
  getArticleStockByLocation: (ref: string, location: string) => number;
  onSubmit: (items: BulkMovementItem[], movementType: MovementType, operateur: string) => void;
  onAddDestination?: (name: string) => void;
  editingId?: number | null;
  initialData?: { movementType: MovementType; items: BulkMovementItem[] } | null;
  defaultMovementType?: "Entrée" | "Sortie" | "Transfert";
  fixedMovementType?: "Entrée" | "Sortie" | "Transfert";
  fixedOperateur?: string;
}

export const BulkMovementModal = ({
  isOpen,
  onClose,
  articles,
  emplacements,
  destinations,
  suppliers = [],
  getArticleLocations,
  getArticleStockByLocation,
  onSubmit,
  onAddDestination,
  editingId = null,
  initialData = null,
  defaultMovementType,
  fixedMovementType,
  fixedOperateur,
}: BulkMovementModalProps) => {
  const [movementType, setMovementType] = useState<MovementType>(
    fixedMovementType || initialData?.movementType || defaultMovementType || "Entrée"
  );
  const [items, setItems] = useState<BulkMovementItem[]>(
    initialData?.items || [
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
    ]
  );
  const [operateur, setOperateur] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update state when initialData changes (for duplicate feature)
  useEffect(() => {
    if (initialData && initialData.items && initialData.items.length > 0) {
      setMovementType(initialData.movementType);
      setItems(initialData.items);
      setOperateur("");
      setErrors({});
      console.log(`[DUPLICATE MODAL] Initialized with ${initialData.items.length} item(s), Type: ${initialData.movementType}`);
    }
  }, [initialData]);

  // Apply defaultMovementType or fixedMovementType when modal opens (if no initialData with items)
  useEffect(() => {
    if (isOpen) {
      const hasInitialItems = initialData && initialData.items && initialData.items.length > 0;
      if (!hasInitialItems) {
        if (fixedMovementType) {
          setMovementType(fixedMovementType);
        } else if (defaultMovementType) {
          setMovementType(defaultMovementType);
        }
      }
    }
  }, [isOpen, defaultMovementType, fixedMovementType, initialData]);

  // Reset form to initial state
  const resetForm = () => {
    setMovementType(fixedMovementType || "Entrée");
    setItems([
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
    ]);
    setOperateur("");
    setErrors({});
  };

  // Check if form has any meaningful data entered
  const hasFormData = (): boolean => {
    // Check if any article has data (articleId selected OR quantity entered)
    const hasArticleData = items.some(
      item => item.articleId !== "" || item.quantity > 0
    );
    
    // Check if operator field has data
    const hasOperatorData = operateur.trim() !== "";
    
    return hasArticleData || hasOperatorData;
  };

  // Handle movement type change with confirmation
  const handleMovementTypeChange = (newType: MovementType) => {
    if (newType === movementType) return;

    if (hasFormData()) {
      const confirmed = window.confirm(
        "Attention: Changer le type de mouvement réinitialisera vos données. Continuer ?"
      );
      if (!confirmed) return;
    }

    setMovementType(newType);
    setItems([
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
    ]);
    setErrors({});
  };

  // Destinations for Sortie - now dynamic from context
  // Legacy destinations kept for backward compatibility
  const destinationsUtilisation = destinations.map(d => d.nom);

  const addRow = () => {
    const newId = (Math.max(...items.map(i => parseInt(i.id) || 0), 0) + 1).toString();
    setItems([
      ...items,
      { id: newId, articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
    ]);
  };

  const removeRow = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BulkMovementItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === "articleId" && value) {
          const article = articles.find(a => a.id === parseInt(value));
          if (article) {
            updated.selectedUnit = movementType === "Entrée" ? article.uniteEntree : article.uniteSortie;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Only validate operateur if not provided as fixed prop
    if (!fixedOperateur && !operateur.trim()) newErrors.operateur = "Requis";

    items.forEach((item) => {
      if (!item.articleId) newErrors[`item-${item.id}-article`] = "Requis";
      if (!item.quantity || item.quantity <= 0) newErrors[`item-${item.id}-qty`] = "Requis";
      if (!item.selectedUnit) newErrors[`item-${item.id}-unit`] = "Requis";
      if (!item.lotNumber.trim()) newErrors[`item-${item.id}-lot`] = "Requis";
      // lotDate is optional - removed validation

      if (movementType === "Entrée") {
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
        if (!item.fournisseur) newErrors[`item-${item.id}-supplier`] = "Requis";
      } else if (movementType === "Sortie") {
        if (!item.emplacementSource) newErrors[`item-${item.id}-source`] = "Requis";
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
        
        // HARD STOCK LOCK: Check if quantity exceeds available stock
        if (item.emplacementSource && item.articleId) {
          const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
          if (!validation.isValid) {
            newErrors[`item-${item.id}-qty`] = `الكمية تتجاوز المخزون المتوفر`;
          }
        }
      } else if (movementType === "Transfert") {
        if (!item.emplacementSource) newErrors[`item-${item.id}-source`] = "Requis";
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
        if (item.emplacementSource === item.emplacementDestination) {
          newErrors[`item-${item.id}-dest`] = "Doit être différent";
        }
        
        // HARD STOCK LOCK: Check if quantity exceeds available stock in source
        if (item.emplacementSource && item.articleId) {
          const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
          if (!validation.isValid) {
            newErrors[`item-${item.id}-qty`] = `الكمية تتجاوز المخزون المتوفر`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Use fixedOperateur if provided, otherwise use state operateur
      const effectiveOperateur = fixedOperateur || operateur;
      onSubmit(items, movementType, effectiveOperateur);
      resetForm();
      onClose();
    }
  };

  const getArticleById = (id: string) => {
    if (!id) return null;
    return articles.find(a => a.id === parseInt(id)) || null;
  };

  // Get available stock for a specific article in a specific location
  const getAvailableStock = (articleId: string, locationName: string): number => {
    if (!articleId || !locationName) return 0;
    const article = getArticleById(articleId);
    if (!article) return 0;
    
    // CRITICAL: Read directly from the inventory array
    const inventoryEntry = article.inventory?.find(inv => inv.zone === locationName);
    
    if (inventoryEntry && Number(inventoryEntry.quantity) > 0) {
      console.log(`[AVAILABLE STOCK] Article: ${article.nom} | Zone: ${locationName} | Stock: ${inventoryEntry.quantity} ${article.uniteSortie}`);
      return Number(inventoryEntry.quantity);
    }
    
    console.log(`[AVAILABLE STOCK] Article: ${article.nom} | Zone: ${locationName} | Stock: 0 (not found in inventory)`);
    return 0;
  };

  // Check if quantity exceeds available stock
  const isQuantityExceeded = (articleId: string, locationName: string, quantity: number): boolean => {
    if (!articleId || !locationName || quantity <= 0) return false;
    const availableStock = getAvailableStock(articleId, locationName);
    return quantity > availableStock;
  };

  // STRICT LOCATION FILTERING: Get already-used locations for the same article
  const getUsedLocationsForArticle = (articleId: string, currentItemId: string, isSource: boolean): string[] => {
    if (!articleId) return [];
    
    const usedLocations: string[] = [];
    items.forEach(item => {
      // Skip current row
      if (item.id === currentItemId) return;
      
      // Only check rows with the same article
      if (item.articleId !== articleId) return;
      
      // For Sortie/Transfert: check source locations
      if (isSource && item.emplacementSource) {
        usedLocations.push(item.emplacementSource);
      }
      // For Entrée/Transfert: check destination locations
      if (!isSource && item.emplacementDestination) {
        usedLocations.push(item.emplacementDestination);
      }
    });
    
    return usedLocations;
  };

  // DYNAMIC STOCK DEDUCTION: Calculate real-time available stock after accounting for other rows
  const getRealTimeAvailableStock = (articleId: string, locationName: string, currentItemId: string): number => {
    if (!articleId || !locationName) return 0;
    
    const baseStock = getAvailableStock(articleId, locationName);
    
    // Sum quantities already entered for this location in OTHER rows (same article)
    const alreadyUsed = items.reduce((sum, item) => {
      // Skip current row
      if (item.id === currentItemId) return sum;
      
      // Only count same article and same source location
      if (item.articleId !== articleId || item.emplacementSource !== locationName) return sum;
      
      // Add the quantity already entered
      return sum + Number(item.quantity || 0);
    }, 0);
    
    const realTimeAvailable = Math.max(0, baseStock - alreadyUsed);
    console.log(`[REAL-TIME STOCK] Article: ${getArticleById(articleId)?.nom} | Zone: ${locationName} | Base: ${baseStock} | Already Used: ${alreadyUsed} | Available: ${realTimeAvailable}`);
    
    return realTimeAvailable;
  };

  // VALIDATION: Check if total quantity for a zone exceeds available stock across all rows
  const validateTotalQuantityForZone = (articleId: string, locationName: string): { isValid: boolean; totalUsed: number; available: number } => {
    if (!articleId || !locationName) return { isValid: true, totalUsed: 0, available: 0 };
    
    const baseStock = getAvailableStock(articleId, locationName);
    
    // Sum ALL quantities for this article in this location across ALL rows
    const totalUsed = items.reduce((sum, item) => {
      if (item.articleId !== articleId || item.emplacementSource !== locationName) return sum;
      return sum + Number(item.quantity || 0);
    }, 0);
    
    const isValid = totalUsed <= baseStock;
    console.log(`[ZONE VALIDATION] Article: ${getArticleById(articleId)?.nom} | Zone: ${locationName} | Total Used: ${totalUsed} | Available: ${baseStock} | Valid: ${isValid}`);
    
    return { isValid, totalUsed, available: baseStock };
  };

  const getAvailableSourceLocations = (articleId: string) => {
    const article = getArticleById(articleId);
    if (!article) return [];
    
    const availableLocations = article.inventory?.filter(inv => Number(inv.quantity) > 0) || [];
    
    return availableLocations;
  };

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BulkMovementModalWrapper isOpen={isOpen} onClose={handleClose} title="Ajouter ligne">
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Scrollable Content */}
        <div className="overflow-x-hidden overflow-y-auto">
          {/* Common Information - Only show when NOT in fixed mode */}
          {!fixedMovementType && !fixedOperateur && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium border-b border-gray-200 pb-2 mb-2">Informations Communes</h3>
          
          {/* Movement Type */}
          <div className="mb-3">
            <label className="block text-[13px] font-medium text-gray-600 mb-1">Type de Mouvement</label>
            <div className="grid grid-cols-3 gap-3">
              {(["Entrée", "Sortie", "Transfert"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleMovementTypeChange(t)}
                  className={`h-9 rounded text-sm font-medium transition-colors ${
                    movementType === t
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Operator */}
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">
              Opérateur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={operateur}
              onChange={(e) => {
                setOperateur(e.target.value);
                setErrors({ ...errors, operateur: "" });
              }}
              className={`w-full h-9 px-3 rounded border bg-white text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-gray-400 ${errors.operateur ? "border-destructive" : "border-gray-300"}`}
              placeholder="Nom"
            />
            {errors.operateur && <p className="text-xs text-red-600 mt-1">{errors.operateur}</p>}
          </div>
        </div>
          )}

        {/* Form Lines */}
        <div className="px-6 py-3 space-y-3">
          {items.map((item, index) => {
            const selectedArticle = getArticleById(item.articleId);
            const availableSourceLocations = selectedArticle ? getAvailableSourceLocations(item.articleId) : [];
            const showLineHeader = items.length > 1;

            return (
              <div key={item.id} className={showLineHeader ? "border border-gray-200 rounded-lg p-4" : ""}>
                {/* Line Header (only when multiple lines from duplicate) */}
                {showLineHeader && (
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <span className="text-xs uppercase tracking-wide text-gray-500 font-medium">Ligne {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeRow(item.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Section: Article */}
                <div className="mb-3">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-medium border-b border-gray-200 pb-1.5 mb-2">Article</h4>
                  <div className="space-y-2">
                    {/* Article Select */}
                    <div className="min-w-0">
                      <label className="block text-[13px] font-medium text-gray-600 mb-1">
                        Article <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={item.articleId}
                          onChange={(e) => updateItem(item.id, "articleId", e.target.value)}
                          className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none ${errors[`item-${item.id}-article`] ? "border-destructive" : "border-gray-300"}`}
                        >
                          <option value="">Sélectionner...</option>
                          {articles.map(a => (
                            <option key={a.id} value={a.id}>{a.nom} ({a.ref})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors[`item-${item.id}-article`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-article`]}</p>}
                    </div>

                    {/* Quantity + Numéro de Lot in two columns */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Quantity */}
                      <div className="min-w-0">
                        <label className="block text-[13px] font-medium text-gray-600 mb-1">
                          Quantité <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2 min-w-0">
                          <input
                            type="number"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                            className={`min-w-0 flex-1 h-9 px-3 rounded bg-white border text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-gray-400 ${errors[`item-${item.id}-qty`] ? "border-destructive" : "border-gray-300"}`}
                            style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                            placeholder="0"
                            min="0"
                            step="0.01"
                          />
                          {selectedArticle && (
                            <div className="relative flex-shrink-0">
                              <select
                                value={item.selectedUnit}
                                onChange={(e) => updateItem(item.id, "selectedUnit", e.target.value)}
                                className="w-20 h-9 px-2 pr-6 rounded bg-white border border-gray-300 text-xs appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                              >
                                <option value={selectedArticle.uniteEntree}>{selectedArticle.uniteEntree}</option>
                                {selectedArticle.uniteSortie !== selectedArticle.uniteEntree && (
                                  <option value={selectedArticle.uniteSortie}>{selectedArticle.uniteSortie}</option>
                                )}
                              </select>
                              <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                          )}
                        </div>
                        {errors[`item-${item.id}-qty`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-qty`]}</p>}
                        {errors[`item-${item.id}-unit`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-unit`]}</p>}
                        {/* Real-time Conversion Display */}
                        {selectedArticle && item.quantity > 0 && item.selectedUnit && !errors[`item-${item.id}-qty`] && (
                          (() => {
                            const isEntryUnit = item.selectedUnit === selectedArticle.uniteEntree;
                            const conversionFactor = selectedArticle.facteurConversion || 1;
                            
                            if (isEntryUnit && conversionFactor > 1) {
                              const convertedQty = item.quantity * conversionFactor;
                              return (
                                <div className="text-xs text-gray-500 mt-1">
                                  = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteSortie}
                                </div>
                              );
                            }
                            
                            if (!isEntryUnit && conversionFactor > 1) {
                              const convertedQty = item.quantity / conversionFactor;
                              return (
                                <div className="text-xs text-gray-500 mt-1">
                                  = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteEntree}
                                </div>
                              );
                            }
                            
                            return null;
                          })()
                        )}
                      </div>

                      {/* Numéro de Lot */}
                      <div className="min-w-0">
                        <label className="block text-[13px] font-medium text-gray-600 mb-1">
                          Numéro de Lot <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.lotNumber}
                          onChange={(e) => {
                            updateItem(item.id, "lotNumber", e.target.value);
                            setErrors({ ...errors, [`item-${item.id}-lot`]: "" });
                          }}
                          className={`w-full h-9 px-3 rounded bg-white border text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-gray-400 ${errors[`item-${item.id}-lot`] ? "border-destructive" : "border-gray-300"}`}
                          placeholder="LOT-XXXX"
                        />
                        {errors[`item-${item.id}-lot`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-lot`]}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Emplacement (by type) */}
                <div className="mb-3">
                  <h4 className="text-xs uppercase tracking-wide text-gray-500 font-medium border-b border-gray-200 pb-1.5 mb-2">
                    {movementType === "Entrée" ? "Approvisionnement" : movementType === "Sortie" ? "Mouvement de sortie" : "Mouvement de transfert"}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Entrée: Fournisseur | Destination */}
                    {movementType === "Entrée" && (
                      <>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Fournisseur <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.fournisseur || ""}
                              onChange={(e) => updateItem(item.id, "fournisseur", e.target.value)}
                              className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none ${errors[`item-${item.id}-supplier`] ? "border-destructive" : "border-gray-300"}`}
                            >
                              <option value="">Sélectionner...</option>
                              {suppliers.map(s => (
                                <option key={s.id} value={s.nom}>{s.nom}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`item-${item.id}-supplier`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-supplier`]}</p>}
                        </div>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Destination <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.emplacementDestination || ""}
                              onChange={(e) => updateItem(item.id, "emplacementDestination", e.target.value)}
                              className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none ${errors[`item-${item.id}-dest`] ? "border-destructive" : "border-gray-300"}`}
                            >
                              <option value="">Sélectionner...</option>
                              {emplacements.map(e => (
                                <option key={e.id} value={e.nom}>{e.nom} ({e.code})</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`item-${item.id}-dest`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-dest`]}</p>}
                        </div>
                      </>
                    )}

                    {/* Sortie: Source | Destination (Client/Service) */}
                    {movementType === "Sortie" && (
                      <>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Source <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.emplacementSource || ""}
                              onChange={(e) => updateItem(item.id, "emplacementSource", e.target.value)}
                              className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors[`item-${item.id}-source`] ? "border-destructive" : "border-gray-300"}`}
                              disabled={!selectedArticle || availableSourceLocations.length === 0}
                            >
                              <option value="">Sélectionner...</option>
                              {availableSourceLocations.map((loc, idx) => {
                                const usedLocations = getUsedLocationsForArticle(item.articleId, item.id, true);
                                const isAlreadyUsed = usedLocations.includes(loc.zone);
                                
                                if (isAlreadyUsed && item.emplacementSource !== loc.zone) {
                                  return null;
                                }
                                
                                return (
                                  <option key={idx} value={loc.zone}>
                                    {loc.zone} ({loc.quantity} dispo)
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`item-${item.id}-source`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-source`]}</p>}
                          {/* Live Stock Preview */}
                          {item.emplacementSource && selectedArticle && !errors[`item-${item.id}-source`] && (
                            (() => {
                              const realTimeStock = getRealTimeAvailableStock(item.articleId, item.emplacementSource, item.id);
                              const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
                              const isExceeded = !validation.isValid;
                              
                              return (
                                <div className="text-xs mt-1">
                                  <div className={isExceeded ? "text-red-600 font-medium" : "text-gray-500"}>
                                    Stock disponible: {realTimeStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                  </div>
                                  {isExceeded && (
                                    <div className="text-red-600">
                                      الكمية الإجمالية تتجاوز المتوفر في هذا المكان
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </div>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Destination (Client/Service) <span className="text-red-500">*</span>
                          </label>
                          <CreatableSelect
                            options={destinations}
                            value={item.emplacementDestination || ""}
                            onChange={(value) => updateItem(item.id, "emplacementDestination", value)}
                            onCreateNew={(name) => {
                              if (onAddDestination) {
                                onAddDestination(name);
                                updateItem(item.id, "emplacementDestination", name);
                              }
                            }}
                            placeholder="Sélectionner..."
                          />
                          {errors[`item-${item.id}-dest`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-dest`]}</p>}
                        </div>
                      </>
                    )}

                    {/* Transfert: Source | Destination */}
                    {movementType === "Transfert" && (
                      <>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Source <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.emplacementSource || ""}
                              onChange={(e) => updateItem(item.id, "emplacementSource", e.target.value)}
                              className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors[`item-${item.id}-source`] ? "border-destructive" : "border-gray-300"}`}
                              disabled={!selectedArticle || availableSourceLocations.length === 0}
                            >
                              <option value="">Sélectionner...</option>
                              {availableSourceLocations.map((loc, idx) => {
                                const usedLocations = getUsedLocationsForArticle(item.articleId, item.id, true);
                                const isAlreadyUsed = usedLocations.includes(loc.zone);
                                
                                if (isAlreadyUsed && item.emplacementSource !== loc.zone) {
                                  return null;
                                }
                                
                                return (
                                  <option key={idx} value={loc.zone}>
                                    {loc.zone} ({loc.quantity} dispo)
                                  </option>
                                );
                              })}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`item-${item.id}-source`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-source`]}</p>}
                          {/* Live Stock Preview */}
                          {item.emplacementSource && selectedArticle && !errors[`item-${item.id}-source`] && (
                            (() => {
                              const realTimeStock = getRealTimeAvailableStock(item.articleId, item.emplacementSource, item.id);
                              const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
                              const isExceeded = !validation.isValid;
                              
                              return (
                                <div className="text-xs mt-1">
                                  <div className={isExceeded ? "text-red-600 font-medium" : "text-gray-500"}>
                                    Stock disponible: {realTimeStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                  </div>
                                  {isExceeded && (
                                    <div className="text-red-600">
                                      الكمية الإجمالية تتجاوز المتوفر في هذا المكان
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )}
                        </div>
                        <div className="min-w-0">
                          <label className="block text-[13px] font-medium text-gray-600 mb-1">
                            Destination <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={item.emplacementDestination || ""}
                              onChange={(e) => updateItem(item.id, "emplacementDestination", e.target.value)}
                              className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none ${errors[`item-${item.id}-dest`] ? "border-destructive" : "border-gray-300"}`}
                            >
                              <option value="">Sélectionner...</option>
                              {emplacements.map(e => (
                                <option key={e.id} value={e.nom}>{e.nom} ({e.code})</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          {errors[`item-${item.id}-dest`] && <p className="text-xs text-red-600 mt-1">{errors[`item-${item.id}-dest`]}</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {/* End Scrollable Content */}
        </div>

        {/* FOOTER - Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 border-t bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="h-9 px-4 rounded text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {items.length === 1 ? "Confirmer" : `Confirmer (${items.length})`}
          </button>
        </div>
      </form>
    </BulkMovementModalWrapper>
  );
};

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
      { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
      { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
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
      { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
      { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
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
    if (newType === movementType) return; // No change needed

    // Only show alert if form has data
    if (hasFormData()) {
      const confirmed = window.confirm(
        "Attention: Changer le type de mouvement réinitialisera vos données. Continuer ?"
      );
      if (!confirmed) return; // User cancelled
    }

    // Change type and reset articles to 3 empty rows
    setMovementType(newType);
    setItems([
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
      { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
      { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", fournisseur: "", lotNumber: "", lotDate: undefined, commentaire: "", qc_status: "pending" },
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
    
    // CRITICAL: Return inventory entries directly from the article's inventory array
    // Filter to only include locations with quantity > 0
    const availableLocations = article.inventory?.filter(inv => Number(inv.quantity) > 0) || [];
    
    console.log(`[AVAILABLE LOCATIONS] Article: ${article.nom} | Locations: ${availableLocations.map(l => `${l.zone}(${l.quantity})`).join(', ')}`);
    
    return availableLocations;
  };

  const getMovementTypeLabel = (): string => {
    switch (movementType) {
      case "Entrée": return "Entrées";
      case "Sortie": return "Sorties";
      case "Transfert": return "Transferts";
    }
  };

  const getMovementTypeColor = (): string => {
    switch (movementType) {
      case "Entrée": return "bg-success text-success-foreground";
      case "Sortie": return "bg-warning text-warning-foreground";
      case "Transfert": return "bg-info text-info-foreground";
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BulkMovementModalWrapper isOpen={isOpen} onClose={handleClose} title="Ajouter ligne">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Common Information - Only show when NOT in fixed mode */}
          {!fixedMovementType && !fixedOperateur && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mx-6 mt-6">
          <h3 className="text-base font-semibold mb-6">Informations Communes</h3>
          
          {/* Movement Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Type de Mouvement</label>
            <div className="grid grid-cols-3 gap-3">
              {(["Entrée", "Sortie", "Transfert"] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleMovementTypeChange(t)}
                  className={`h-10 rounded-md text-sm font-medium transition-colors ${
                    movementType === t
                      ? t === "Entrée" ? "bg-success text-success-foreground" 
                        : t === "Sortie" ? "bg-warning text-warning-foreground" 
                        : "bg-info text-info-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Operator Only */}
          <div>
            <label className="block text-sm font-medium mb-2">Opérateur *</label>
            <input
              type="text"
              value={operateur}
              onChange={(e) => {
                setOperateur(e.target.value);
                setErrors({ ...errors, operateur: "" });
              }}
              className={`w-full h-12 md:h-10 px-3 rounded-md border bg-background text-sm ${errors.operateur ? "border-destructive" : ""}`}
              placeholder="Nom"
            />
          </div>
        </div>
          )}

        {/* Articles Table */}
        <div className={!fixedMovementType && !fixedOperateur ? "mx-6 mt-6" : "mx-6 mt-0"}>
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <h3 className="text-xs uppercase tracking-wide text-gray-500 font-medium">Articles à traiter</h3>
            <span className="text-[13px] text-gray-500">{items.length} article(s)</span>
          </div>

              {/* Desktop Table View */}
              <div className="hidden md:block border border-gray-200 rounded overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Article</th>
                      <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Quantité</th>
                      {movementType === "Sortie" || movementType === "Transfert" ? (
                        <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Source</th>
                      ) : null}
                      {movementType === "Entrée" ? (
                        <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Fournisseur</th>
                      ) : null}
                      <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">
                        {movementType === "Sortie" ? "Destination (Client/Service)" : "Destination"}
                      </th>
                      <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Numéro de Lot</th>
                      <th className="text-left px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium">Commentaire</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-500 font-medium w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const selectedArticle = getArticleById(item.articleId);
                      const availableSourceLocations = selectedArticle ? getAvailableSourceLocations(item.articleId) : [];

                      return (
                        <tr key={item.id} className="border-t border-gray-100">
                          {/* Article */}
                          <td className="px-3 py-2">
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
                          </td>

                          {/* Quantity */}
                          <td className="px-3 py-2">
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={item.quantity === 0 ? "" : item.quantity}
                                  onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                                  className={`w-20 h-9 px-3 rounded bg-white border text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none ${errors[`item-${item.id}-qty`] ? "border-destructive" : "border-gray-300"}`}
                                  style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                                {selectedArticle && (
                                  <div className="relative">
                                    <select
                                      value={item.selectedUnit}
                                      onChange={(e) => updateItem(item.id, "selectedUnit", e.target.value)}
                                      className="w-24 h-9 px-3 pr-8 rounded bg-white border border-gray-300 text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none"
                                    >
                                      <option value={selectedArticle.uniteEntree}>{selectedArticle.uniteEntree}</option>
                                      {selectedArticle.uniteSortie !== selectedArticle.uniteEntree && (
                                        <option value={selectedArticle.uniteSortie}>{selectedArticle.uniteSortie}</option>
                                      )}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                  </div>
                                )}
                              </div>
                              {/* Real-time Conversion Display */}
                              {selectedArticle && item.quantity > 0 && item.selectedUnit && (
                                (() => {
                                  const isEntryUnit = item.selectedUnit === selectedArticle.uniteEntree;
                                  const conversionFactor = selectedArticle.facteurConversion || 1;
                                  
                                  // If using entry unit, show conversion to exit unit
                                  if (isEntryUnit && conversionFactor > 1) {
                                    const convertedQty = item.quantity * conversionFactor;
                                    return (
                                      <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                        = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteSortie}
                                      </div>
                                    );
                                  }
                                  
                                  // If using exit unit and conversion exists, show conversion to entry unit
                                  if (!isEntryUnit && conversionFactor > 1) {
                                    const convertedQty = item.quantity / conversionFactor;
                                    return (
                                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                        = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteEntree}
                                      </div>
                                    );
                                  }
                                  
                                  return null;
                                })()
                              )}
                            </div>
                          </td>

                          {/* Source (for Sortie/Transfert) */}
                          {(movementType === "Sortie" || movementType === "Transfert") && (
                            <td className="px-3 py-2">
                              <div className="space-y-2">
                                <div className="relative">
                                  <select
                                    value={item.emplacementSource || ""}
                                    onChange={(e) => updateItem(item.id, "emplacementSource", e.target.value)}
                                    className={`w-full h-9 px-3 pr-8 rounded bg-white border text-sm appearance-none hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors[`item-${item.id}-source`] ? "border-destructive" : "border-gray-300"}`}
                                    disabled={!selectedArticle || availableSourceLocations.length === 0}
                                  >
                                    <option value="">Sélectionner...</option>
                                  {availableSourceLocations.map((loc, idx) => {
                                    // STRICT FILTERING: Hide locations already used for this article
                                    const usedLocations = getUsedLocationsForArticle(item.articleId, item.id, true);
                                    const isAlreadyUsed = usedLocations.includes(loc.zone);
                                    
                                    // Show location if: not used OR it's the currently selected one
                                    if (isAlreadyUsed && item.emplacementSource !== loc.zone) {
                                      return null; // Hide this option
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
                                {/* Live Stock Preview with Dynamic Deduction */}
                                {item.emplacementSource && selectedArticle && (
                                  (() => {
                                    const realTimeStock = getRealTimeAvailableStock(item.articleId, item.emplacementSource, item.id);
                                    const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
                                    const isExceeded = !validation.isValid;
                                    const stockColor = isExceeded ? "text-red-500" : "text-gray-500";
                                    
                                    return (
                                      <div className="space-y-1">
                                        <div className={`text-xs font-medium ${stockColor}`}>
                                          Stock disponible: {realTimeStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                        </div>
                                        {isExceeded && (
                                          <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                            الكمية الإجمالية تتجاوز المتوفر في هذا المكان
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()
                                )}
                              </div>
                            </td>
                          )}

                          {/* Supplier (Entrée only) */}
                          {movementType === "Entrée" && (
                            <td className="px-3 py-2">
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
                            </td>
                          )}

                          {/* Destination */}
                          <td className="px-3 py-2">
                            {movementType === "Sortie" ? (
                              <div className={errors[`item-${item.id}-dest`] ? "border-destructive" : ""}>
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
                              </div>
                            ) : (
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
                            )}
                          </td>

                          {/* Lot Number */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.lotNumber}
                              onChange={(e) => updateItem(item.id, "lotNumber", e.target.value)}
                              className={`w-full h-9 px-3 rounded bg-white border text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-gray-400 ${errors[`item-${item.id}-lot`] ? "border-destructive" : "border-gray-300"}`}
                              placeholder="LOT-2024-001"
                            />
                          </td>

                          {/* Commentaire */}
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={item.commentaire || ""}
                              onChange={(e) => updateItem(item.id, "commentaire", e.target.value)}
                              className="w-full h-9 px-3 rounded bg-white border border-gray-300 text-sm hover:border-gray-400 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none placeholder:text-gray-400"
                              placeholder="Optionnel"
                            />
                          </td>

                          {/* Action */}
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(item.id)}
                              disabled={items.length === 1}
                              className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:bg-transparent transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {items.map((item) => {
                  const selectedArticle = getArticleById(item.articleId);
                  const availableSourceLocations = selectedArticle ? getAvailableSourceLocations(item.articleId) : [];

                  return (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-card hover:bg-muted/30 transition-colors">
                      {/* Article */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Article</label>
                        <select
                          value={item.articleId}
                          onChange={(e) => updateItem(item.id, "articleId", e.target.value)}
                          className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-article`] ? "border-destructive" : ""}`}
                        >
                          <option value="">Sélectionner...</option>
                          {articles.map(a => (
                            <option key={a.id} value={a.id}>{a.nom} ({a.ref})</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Quantité</label>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                              className={`flex-1 h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-qty`] ? "border-destructive" : ""}`}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                            {selectedArticle && (
                              <select
                                value={item.selectedUnit}
                                onChange={(e) => updateItem(item.id, "selectedUnit", e.target.value)}
                                className="h-12 px-3 rounded border text-sm"
                              >
                                <option value={selectedArticle.uniteEntree}>{selectedArticle.uniteEntree}</option>
                                {selectedArticle.uniteSortie !== selectedArticle.uniteEntree && (
                                  <option value={selectedArticle.uniteSortie}>{selectedArticle.uniteSortie}</option>
                                )}
                              </select>
                            )}
                          </div>
                          {/* Real-time Conversion Display */}
                          {selectedArticle && item.quantity > 0 && item.selectedUnit && (
                            (() => {
                              const isEntryUnit = item.selectedUnit === selectedArticle.uniteEntree;
                              const conversionFactor = selectedArticle.facteurConversion || 1;
                              
                              if (isEntryUnit && conversionFactor > 1) {
                                const convertedQty = item.quantity * conversionFactor;
                                return (
                                  <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                    = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteSortie}
                                  </div>
                                );
                              }
                              
                              if (!isEntryUnit && conversionFactor > 1) {
                                const convertedQty = item.quantity / conversionFactor;
                                return (
                                  <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    = {convertedQty.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {selectedArticle.uniteEntree}
                                  </div>
                                );
                              }
                              
                              return null;
                            })()
                          )}
                        </div>
                      </div>

                      {/* Source (for Sortie/Transfert) */}
                      {(movementType === "Sortie" || movementType === "Transfert") && (
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-2">Source</label>
                          <div className="space-y-2">
                            <select
                              value={item.emplacementSource || ""}
                              onChange={(e) => updateItem(item.id, "emplacementSource", e.target.value)}
                              className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-source`] ? "border-destructive" : ""}`}
                              disabled={!selectedArticle || availableSourceLocations.length === 0}
                            >
                              <option value="">Sélectionner...</option>
                              {availableSourceLocations.map((loc, idx) => {
                                // STRICT FILTERING: Hide locations already used for this article
                                const usedLocations = getUsedLocationsForArticle(item.articleId, item.id, true);
                                const isAlreadyUsed = usedLocations.includes(loc.zone);
                                
                                // Show location if: not used OR it's the currently selected one
                                if (isAlreadyUsed && item.emplacementSource !== loc.zone) {
                                  return null; // Hide this option
                                }
                                
                                return (
                                  <option key={idx} value={loc.zone}>
                                    {loc.zone} ({loc.quantity} dispo)
                                  </option>
                                );
                              })}
                            </select>
                            {/* Live Stock Preview with Dynamic Deduction */}
                            {item.emplacementSource && selectedArticle && (
                              (() => {
                                const realTimeStock = getRealTimeAvailableStock(item.articleId, item.emplacementSource, item.id);
                                const validation = validateTotalQuantityForZone(item.articleId, item.emplacementSource);
                                const isExceeded = !validation.isValid;
                                const stockColor = isExceeded ? "text-red-500" : "text-gray-500";
                                
                                return (
                                  <div className="space-y-1">
                                    <div className={`text-xs font-medium ${stockColor}`}>
                                      Stock disponible: {realTimeStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                    </div>
                                    {isExceeded && (
                                      <div className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                        الكمية الإجمالية تتجاوز المتوفر في هذا المكان
                                      </div>
                                    )}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      )}

                      {/* Supplier (Entrée only) */}
                      {movementType === "Entrée" && (
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-2">Fournisseur</label>
                          <select
                            value={item.fournisseur || ""}
                            onChange={(e) => updateItem(item.id, "fournisseur", e.target.value)}
                            className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-supplier`] ? "border-destructive" : ""}`}
                          >
                            <option value="">Sélectionner...</option>
                            {suppliers.map(s => (
                              <option key={s.id} value={s.nom}>{s.nom}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Destination */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          {movementType === "Sortie" ? "Destination (Client/Service)" : "Destination"}
                        </label>
                        {movementType === "Sortie" ? (
                          <div className={errors[`item-${item.id}-dest`] ? "border-destructive" : ""}>
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
                          </div>
                        ) : (
                          <select
                            value={item.emplacementDestination || ""}
                            onChange={(e) => updateItem(item.id, "emplacementDestination", e.target.value)}
                            className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-dest`] ? "border-destructive" : ""}`}
                          >
                            <option value="">Sélectionner...</option>
                            {emplacements.map(e => (
                              <option key={e.id} value={e.nom}>{e.nom} ({e.code})</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Lot Number */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Numéro de Lot</label>
                        <input
                          type="text"
                          value={item.lotNumber}
                          onChange={(e) => updateItem(item.id, "lotNumber", e.target.value)}
                          className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-lot`] ? "border-destructive" : ""}`}
                          placeholder="LOT-2024-001"
                        />
                      </div>

                      {/* Commentaire */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Commentaire</label>
                        <input
                          type="text"
                          value={item.commentaire || ""}
                          onChange={(e) => updateItem(item.id, "commentaire", e.target.value)}
                          className="w-full h-12 px-3 rounded border bg-background text-sm"
                          placeholder="Optionnel"
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => removeRow(item.id)}
                        disabled={items.length === 1}
                        className="w-full h-12 rounded border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer cet article
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Row Button */}
              <button
                type="button"
                onClick={addRow}
                className="w-full mt-4 h-10 rounded border border-dashed border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:text-gray-900 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un autre article
              </button>
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
            Confirmer ({items.length})
          </button>
        </div>
      </form>
    </BulkMovementModalWrapper>
  );
};

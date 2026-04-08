import { useState } from "react";
import { Plus, Trash2, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { BulkMovementModalWrapper } from "@/components/BulkMovementModalWrapper";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type MovementType = "Entrée" | "Sortie" | "Transfert";

interface BulkMovementItem {
  id: string;
  articleId: string;
  quantity: number;
  selectedUnit: string;
  emplacementSource?: string;
  emplacementDestination?: string;
  lotNumber: string;
  lotDate?: Date;
  qc_status: "pending" | "approved" | "rejected";
}

interface BulkMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: any[];
  emplacements: any[];
  getArticleLocations: (ref: string) => any[];
  getArticleStockByLocation: (ref: string, location: string) => number;
  onSubmit: (items: BulkMovementItem[], movementType: MovementType, operateur: string) => void;
  editingId?: number | null;
}

export const BulkMovementModal = ({
  isOpen,
  onClose,
  articles,
  emplacements,
  getArticleLocations,
  getArticleStockByLocation,
  onSubmit,
  editingId = null,
}: BulkMovementModalProps) => {
  const [movementType, setMovementType] = useState<MovementType>("Entrée");
  const [items, setItems] = useState<BulkMovementItem[]>([
    { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
    { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
    { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
  ]);
  const [operateur, setOperateur] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form to initial state
  const resetForm = () => {
    setMovementType("Entrée");
    setItems([
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
      { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
      { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
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
      { id: "1", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
      { id: "2", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
      { id: "3", articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
    ]);
    setErrors({});
  };

  // Destinations for Sortie
  const destinationsUtilisation = [
    "Département Production",
    "Maintenance",
    "Expédition",
    "Destruction",
    "Retour Fournisseur",
    "Échantillons",
  ];

  const addRow = () => {
    const newId = (Math.max(...items.map(i => parseInt(i.id) || 0), 0) + 1).toString();
    setItems([
      ...items,
      { id: newId, articleId: "", quantity: 0, selectedUnit: "", emplacementSource: "", emplacementDestination: "", lotNumber: "", lotDate: undefined, qc_status: "pending" },
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

    if (!operateur.trim()) newErrors.operateur = "Requis";

    items.forEach((item) => {
      if (!item.articleId) newErrors[`item-${item.id}-article`] = "Requis";
      if (!item.quantity || item.quantity <= 0) newErrors[`item-${item.id}-qty`] = "Requis";
      if (!item.selectedUnit) newErrors[`item-${item.id}-unit`] = "Requis";
      if (!item.lotNumber.trim()) newErrors[`item-${item.id}-lot`] = "Requis";
      if (!item.lotDate) newErrors[`item-${item.id}-lotDate`] = "Requis";

      if (movementType === "Entrée") {
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
      } else if (movementType === "Sortie") {
        if (!item.emplacementSource) newErrors[`item-${item.id}-source`] = "Requis";
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
        // Check if quantity exceeds available stock
        if (item.emplacementSource && isQuantityExceeded(item.articleId, item.emplacementSource, item.quantity)) {
          newErrors[`item-${item.id}-qty`] = "Quantité insuffisante";
        }
      } else if (movementType === "Transfert") {
        if (!item.emplacementSource) newErrors[`item-${item.id}-source`] = "Requis";
        if (!item.emplacementDestination) newErrors[`item-${item.id}-dest`] = "Requis";
        if (item.emplacementSource === item.emplacementDestination) {
          newErrors[`item-${item.id}-dest`] = "Doit être différent";
        }
        // Check if quantity exceeds available stock
        if (item.emplacementSource && isQuantityExceeded(item.articleId, item.emplacementSource, item.quantity)) {
          newErrors[`item-${item.id}-qty`] = "Quantité insuffisante";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(items, movementType, operateur);
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
    <BulkMovementModalWrapper isOpen={isOpen} onClose={handleClose} title="Nouveau Mouvement">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Common Information */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
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

        {/* SCROLLABLE BODY - Articles Table */}
        <div className="mt-8">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">Articles à Traiter</h3>
                <span className="text-sm text-muted-foreground">{items.length} article(s)</span>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0 z-5">
                    <tr>
                      <th className="text-left p-4 text-xs font-semibold">Article</th>
                      <th className="text-left p-4 text-xs font-semibold">Quantité</th>
                      {movementType === "Sortie" || movementType === "Transfert" ? (
                        <th className="text-left p-4 text-xs font-semibold">Source</th>
                      ) : null}
                      <th className="text-left p-4 text-xs font-semibold">
                        {movementType === "Sortie" ? "Destination (Client/Service)" : "Destination"}
                      </th>
                      <th className="text-left p-4 text-xs font-semibold">Numéro de Lot</th>
                      <th className="text-left p-4 text-xs font-semibold">Date d'expiration</th>
                      <th className="text-center p-4 text-xs font-semibold w-20">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const selectedArticle = getArticleById(item.articleId);
                      const availableSourceLocations = selectedArticle ? getAvailableSourceLocations(item.articleId) : [];

                      return (
                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                          {/* Article */}
                          <td className="p-4">
                            <select
                              value={item.articleId}
                              onChange={(e) => updateItem(item.id, "articleId", e.target.value)}
                              className={`w-full h-10 px-3 rounded border text-sm ${errors[`item-${item.id}-article`] ? "border-destructive" : ""}`}
                            >
                              <option value="">Sélectionner...</option>
                              {articles.map(a => (
                                <option key={a.id} value={a.id}>{a.nom} ({a.ref})</option>
                              ))}
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="p-4">
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={item.quantity === 0 ? "" : item.quantity}
                                  onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                                  className={`w-20 h-9 px-2 rounded border text-sm ${errors[`item-${item.id}-qty`] ? "border-destructive" : ""}`}
                                  placeholder="0"
                                  min="0"
                                  step="0.01"
                                />
                                {selectedArticle && (
                                  <select
                                    value={item.selectedUnit}
                                    onChange={(e) => updateItem(item.id, "selectedUnit", e.target.value)}
                                    className="w-24 h-9 px-1 rounded border text-sm"
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
                            <td className="p-4">
                              <div className="space-y-2">
                                <select
                                  value={item.emplacementSource || ""}
                                  onChange={(e) => updateItem(item.id, "emplacementSource", e.target.value)}
                                  className={`w-full h-10 px-3 rounded border text-sm ${errors[`item-${item.id}-source`] ? "border-destructive" : ""}`}
                                  disabled={!selectedArticle || availableSourceLocations.length === 0}
                                >
                                  <option value="">Sélectionner...</option>
                                  {availableSourceLocations.map((loc, idx) => (
                                    <option key={idx} value={loc.zone}>
                                      {loc.zone} ({loc.quantity} dispo)
                                    </option>
                                  ))}
                                </select>
                                {/* Live Stock Preview */}
                                {item.emplacementSource && selectedArticle && (
                                  (() => {
                                    const availableStock = getAvailableStock(item.articleId, item.emplacementSource);
                                    const isExceeded = isQuantityExceeded(item.articleId, item.emplacementSource, item.quantity);
                                    const stockColor = isExceeded ? "text-red-500" : "text-gray-500";
                                    return (
                                      <div className={`text-xs font-medium ${stockColor}`}>
                                        Stock disponible: {availableStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                      </div>
                                    );
                                  })()
                                )}
                              </div>
                            </td>
                          )}

                          {/* Destination */}
                          <td className="p-4">
                            <select
                              value={item.emplacementDestination || ""}
                              onChange={(e) => updateItem(item.id, "emplacementDestination", e.target.value)}
                              className={`w-full h-10 px-3 rounded border text-sm ${errors[`item-${item.id}-dest`] ? "border-destructive" : ""}`}
                            >
                              <option value="">Sélectionner...</option>
                              {movementType === "Sortie" ? (
                                destinationsUtilisation.map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))
                              ) : (
                                emplacements.map(e => (
                                  <option key={e.id} value={e.nom}>{e.nom} ({e.code})</option>
                                ))
                              )}
                            </select>
                          </td>

                          {/* Lot Number */}
                          <td className="p-4">
                            <input
                              type="text"
                              value={item.lotNumber}
                              onChange={(e) => updateItem(item.id, "lotNumber", e.target.value)}
                              className={`w-full h-10 px-3 rounded border text-sm ${errors[`item-${item.id}-lot`] ? "border-destructive" : ""}`}
                              placeholder="LOT-2024-001"
                            />
                          </td>

                          {/* Lot Date */}
                          <td className="p-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={`w-full h-10 px-3 rounded border bg-background text-sm flex items-center justify-between ${errors[`item-${item.id}-lotDate`] ? "border-destructive" : ""}`}
                                >
                                  <span>{item.lotDate ? format(item.lotDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}</span>
                                  <CalendarIcon className="w-4 h-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={item.lotDate}
                                  onSelect={(date) => updateItem(item.id, "lotDate", date)}
                                  initialFocus
                                  locale={fr}
                                />
                              </PopoverContent>
                            </Popover>
                          </td>

                          {/* Action */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(item.id)}
                              disabled={items.length === 1}
                              className="p-2 rounded hover:bg-destructive/10 disabled:opacity-50 transition-colors"
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
                              {availableSourceLocations.map((loc, idx) => (
                                <option key={idx} value={loc.zone}>
                                  {loc.zone} ({loc.quantity} dispo)
                                </option>
                              ))}
                            </select>
                            {/* Live Stock Preview */}
                            {item.emplacementSource && selectedArticle && (
                              (() => {
                                const availableStock = getAvailableStock(item.articleId, item.emplacementSource);
                                const isExceeded = isQuantityExceeded(item.articleId, item.emplacementSource, item.quantity);
                                const stockColor = isExceeded ? "text-red-500" : "text-gray-500";
                                return (
                                  <div className={`text-xs font-medium ${stockColor}`}>
                                    Stock disponible: {availableStock.toLocaleString('fr-FR')} {selectedArticle.uniteSortie}
                                  </div>
                                );
                              })()
                            )}
                          </div>
                        </div>
                      )}

                      {/* Destination */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">
                          {movementType === "Sortie" ? "Destination (Client/Service)" : "Destination"}
                        </label>
                        <select
                          value={item.emplacementDestination || ""}
                          onChange={(e) => updateItem(item.id, "emplacementDestination", e.target.value)}
                          className={`w-full h-12 px-3 rounded border text-sm ${errors[`item-${item.id}-dest`] ? "border-destructive" : ""}`}
                        >
                          <option value="">Sélectionner...</option>
                          {movementType === "Sortie" ? (
                            destinationsUtilisation.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))
                          ) : (
                            emplacements.map(e => (
                              <option key={e.id} value={e.nom}>{e.nom} ({e.code})</option>
                            ))
                          )}
                        </select>
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

                      {/* Lot Date */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-2">Date d'expiration</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`w-full h-12 px-3 rounded border bg-background text-sm flex items-center justify-between ${errors[`item-${item.id}-lotDate`] ? "border-destructive" : ""}`}
                            >
                              <span>{item.lotDate ? format(item.lotDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}</span>
                              <CalendarIcon className="w-4 h-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={item.lotDate}
                              onSelect={(date) => updateItem(item.id, "lotDate", date)}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
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

              {/* Add Row Button - Inside scrollable area with bottom margin */}
              <button
                type="button"
                onClick={addRow}
                className="w-full mt-4 h-12 md:h-10 rounded-md border border-dashed border-primary text-primary text-sm font-medium hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter un autre article
              </button>

              {/* Info */}
              <div className="p-4 bg-info/5 border border-info/20 rounded-md flex gap-3 mt-4">
                <AlertCircle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                <p className="text-xs text-info">
                  Tous les articles partageront le même numéro et date de lot.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* End Scrollable Content */}
        </div>

        {/* FOOTER - Actions - Sticky */}
        <div className="flex gap-3 px-4 py-6 border-t bg-card sticky bottom-0 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-12 md:h-11 rounded-md border text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className={`flex-1 h-12 md:h-11 rounded-md text-sm font-medium ${getMovementTypeColor()} hover:opacity-90 transition-opacity`}
          >
            Confirmer les {getMovementTypeLabel()} ({items.length})
          </button>
        </div>
      </form>
    </BulkMovementModalWrapper>
  );
};

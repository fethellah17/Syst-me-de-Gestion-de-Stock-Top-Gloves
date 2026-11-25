import { useState, useMemo, useEffect } from "react";
import { Package, Plus, Search, Edit, Trash2, TrendingDown, HelpCircle, MapPin, Flame, PanelRightOpen, TrendingUp, ChevronDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { getStockStatus, calculateAutonomy } from "@/lib/stock-utils";
import { AutonomyBadge } from "@/components/AutonomyBadge";
import { StockStatusBadge } from "@/components/StockStatusBadge";
import { UnitBadge } from "@/components/UnitBadge";
import { getUnitNames, getUnitSymbol } from "@/lib/units-storage";
import { roundStockQuantity } from "@/lib/unit-conversion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};

// Helper to format dates in French numeric format (dd/MM/yyyy)
const formatDateFR = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });


const ArticlesPage = () => {
  const { articles, addArticle, updateArticle, deleteArticle, categories, suppliers, mouvements } = useData();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [units, setUnits] = useState<string[]>([]);
  const [detailsArticle, setDetailsArticle] = useState<typeof articles[0] | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [formData, setFormData] = useState({
    ref: "",
    nom: "",
    categorie: "",
    seuil: 0,
    unite: "", // Legacy
    uniteEntree: "",
    uniteSortie: "",
    facteurConversion: "1", // Store as string to allow typing decimals
    consommationJournaliere: 0,
  });

  // Load units from localStorage
  useEffect(() => {
    const loadedUnits = getUnitNames();
    setUnits(loadedUnits);
    // Set default units if form is empty
    if (!formData.uniteEntree && loadedUnits.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        unite: loadedUnits[0],
        uniteEntree: loadedUnits[0],
        uniteSortie: loadedUnits[0]
      }));
    }
  }, []);

  // ============================================================================
  // HISTORIQUE DES CONSOMMATIONS JOURNALIÈRES
  // ============================================================================
  // Regroupe les sorties validées par DATE et par ARTICLE
  // Utilise .reduce() conceptuellement (via forEach + Map) pour une performance optimale
  // Format: [Date] | [Article] | [Total Consommé ce jour-là]
  // ============================================================================
  const consumptionHistory = useMemo(() => {
    interface HistoryEntry {
      date: string;
      dateObj: Date;
      article: string;
      ref: string;
      totalConsomme: number;
    }

    // Map pour regrouper les consommations par date + article
    const historyMap: Record<string, HistoryEntry> = {};

    // Parcourir TOUS les mouvements et regrouper les sorties validées
    mouvements.forEach(m => {
      // Filtrer uniquement les sorties validées (Terminé)
      if (m.type === "Sortie" && m.statut === "Terminé") {
        const dateStr = new Date(m.date).toDateString();
        const dateObj = new Date(m.date);
        // Clé unique: Date + Référence article
        const key = `${dateStr}|${m.ref}`;

        if (!historyMap[key]) {
          // Créer une nouvelle entrée pour cette date + article
          historyMap[key] = {
            date: dateStr,
            dateObj,
            article: m.article,
            ref: m.ref,
            totalConsomme: 0,
          };
        }
        // SOMME CUMULATIVE: ajouter la quantité au total du jour
        historyMap[key].totalConsomme += m.qte;
      }
    });

    // Convertir en array et trier par date DÉCROISSANTE (plus récent en premier)
    const history = Object.values(historyMap).sort(
      (a, b) => b.dateObj.getTime() - a.dateObj.getTime()
    );

    return history;
  }, [mouvements]); // RÉACTIVITÉ: se recalcule instantanément quand mouvements change

  const filtered = articles.filter(
    (a) =>
      a.nom.toLowerCase().includes(search.toLowerCase()) ||
      a.ref.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (article?: typeof articles[0]) => {
    const currentUnits = getUnitNames();
    setUnits(currentUnits);
    
    if (article) {
      setFormData({
        ref: article.ref,
        nom: article.nom,
        categorie: article.categorie,
        seuil: article.seuil,
        unite: article.uniteSortie, // Use exit unit for legacy field
        uniteEntree: article.uniteEntree,
        uniteSortie: article.uniteSortie,
        facteurConversion: String(article.facteurConversion), // Convert to string for editing
        consommationJournaliere: article.consommationJournaliere,
      });
      setEditingId(article.id);
    } else {
      const defaultUnit = currentUnits.length > 0 ? currentUnits[0] : "";
      setFormData({
        ref: "",
        nom: "",
        categorie: "",
        seuil: 0,
        unite: defaultUnit,
        uniteEntree: defaultUnit,
        uniteSortie: defaultUnit,
        facteurConversion: "1", // Store as string
        consommationJournaliere: 0,
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ref || !formData.nom) {
      setToast({ message: "Veuillez remplir tous les champs", type: "error" });
      return;
    }

    // Convert facteurConversion from string to number
    const facteurConversionNumber = parseFloat(formData.facteurConversion as string) || 1;
    const formDataWithNumber = { ...formData, facteurConversion: facteurConversionNumber };

    if (editingId) {
      const existingArticle = articles.find(a => a.id === editingId);
      
      if (existingArticle) {
        // Check if conversion factor has changed
        const factorChanged = existingArticle.facteurConversion !== facteurConversionNumber;
        
        if (factorChanged && existingArticle.stock > 0) {
          // CRITICAL: When factor changes, preserve entry unit quantity and recalculate exit unit stock
          // Formula: Stock in Entry Units = Current Stock (Exit) / Old Factor
          //          New Stock (Exit) = Stock in Entry Units × New Factor
          
          const stockInEntryUnits = existingArticle.stock / existingArticle.facteurConversion;
          const newStockInExitUnits = stockInEntryUnits * facteurConversionNumber;
          
          // Apply rounding based on unit type
          const roundedNewStock = roundStockQuantity(newStockInExitUnits, formData.uniteSortie);
          
          console.log(`[MODIFICATION FACTEUR] Article: ${existingArticle.nom}`);
          console.log(`  Stock actuel: ${existingArticle.stock} ${existingArticle.uniteSortie}`);
          console.log(`  Ancien facteur: ${existingArticle.facteurConversion}`);
          console.log(`  Nouveau facteur: ${facteurConversionNumber}`);
          console.log(`  Stock en unité d'entrée: ${stockInEntryUnits} ${formData.uniteEntree}`);
          console.log(`  Nouveau stock calculé: ${newStockInExitUnits} ${formData.uniteSortie}`);
          console.log(`  Nouveau stock arrondi: ${roundedNewStock} ${formData.uniteSortie}`);
          
          // Update article with new factor AND recalculated stock
          updateArticle(editingId, {
            ...formDataWithNumber,
            stock: roundedNewStock
          });
          
          setToast({ 
            message: "Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !", 
            type: "success" 
          });
        } else if (factorChanged) {
          // Factor changed but no stock to recalculate
          updateArticle(editingId, formDataWithNumber);
          setToast({ 
            message: "Le facteur de conversion a été mis à jour. Le stock dans tous les emplacements a été recalculé avec succès !", 
            type: "success" 
          });
        } else {
          // No factor change, just update normally
          updateArticle(editingId, formDataWithNumber);
          setToast({ message: "Article modifié avec succès", type: "success" });
        }
      }
    } else {
      // Le stock est automatiquement initialisé à 0 lors de la création
      addArticle({ ...formDataWithNumber, stock: 0, consommationParInventaire: 0, inventory: [] });
      setToast({ message: "Article ajouté avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      deleteArticle(id);
      setToast({ message: "Article supprimé avec succès", type: "success" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Articles</h2>
          <p className="text-sm text-muted-foreground">{articles.length} articles enregistrés</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un article..."
          className="w-full h-9 pl-9 pr-3 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="w-full max-w-full overflow-x-auto bg-white border border-gray-200 rounded-md">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Réf</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Article</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Catégorie</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Stock</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">Consommation Inv.</th>
              <th className="w-12 py-3 px-2"></th>
            </tr>
          </thead>
          <tbody>
              {filtered.map((a) => {
                // CRITICAL: Calculate total stock directly from inventory array using numeric addition
                const hasInventoryData = a.inventory && a.inventory.length > 0;
                const totalStockFromInventory = a.inventory?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
                
                // Fallback to movement-based calculation ONLY if inventory array is completely empty
                let totalQtyInEntryUnits = 0;
                if (!hasInventoryData) {
                  mouvements.forEach(mouvement => {
                    if (mouvement.ref === a.ref) {
                      if (mouvement.type === "Entrée") {
                        if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
                          const originalQty = mouvement.qteOriginale || mouvement.qte;
                          totalQtyInEntryUnits += originalQty;
                        }
                      } else if (mouvement.type === "Sortie") {
                        if (mouvement.statut === "Terminé" || mouvement.status === "approved") {
                          const originalQty = mouvement.qteOriginale || mouvement.qte;
                          totalQtyInEntryUnits -= originalQty;
                        }
                      } else if (mouvement.type === "Ajustement") {
                        const qtyInEntryUnits = mouvement.qte / a.facteurConversion;
                        if (mouvement.typeAjustement === "Surplus") {
                          totalQtyInEntryUnits += qtyInEntryUnits;
                        } else if (mouvement.typeAjustement === "Manquant") {
                          totalQtyInEntryUnits -= qtyInEntryUnits;
                        }
                      }
                    }
                  });
                }
                
                const stockInExitUnits = hasInventoryData ? Number(totalStockFromInventory) : Number(totalQtyInEntryUnits * a.facteurConversion);
                const stockInEntryUnits = hasInventoryData ? Number(totalStockFromInventory / a.facteurConversion) : Number(totalQtyInEntryUnits);
                
                const status = getStockStatus(stockInExitUnits, a.seuil, a.consommationJournaliere);
                const autonomy = calculateAutonomy(stockInExitUnits, a.consommationJournaliere);
                
                return (
                  <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors h-12">
                    <td className="py-2 px-4 text-sm text-gray-500">{a.ref}</td>
                    <td className="py-2 px-4">
                      <span className="text-sm font-medium text-gray-900">{a.nom}</span>
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-600">{a.categorie}</td>
                    <td className="py-2 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {status.level === "critical" && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-gray-900 tabular-nums">
                            {String(stockInExitUnits)} <span className="text-gray-500">{getUnitSymbol(a.uniteSortie)}</span>
                          </span>
                          {a.facteurConversion !== 1 && (
                            <span className="text-xs text-gray-500 tabular-nums">
                              ({String(stockInEntryUnits)} {getUnitSymbol(a.uniteEntree)})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {a.consommationParInventaire < 0 ? (
                          <TrendingDown className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : a.consommationParInventaire > 0 ? (
                          <TrendingUp className="w-4 h-4 text-gray-400 shrink-0" />
                        ) : null}
                        <span className="text-sm text-gray-700 tabular-nums">
                          {a.consommationParInventaire > 0 ? "+" : ""}{a.consommationParInventaire}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => setDetailsArticle(a)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
                        aria-label="Voir les détails"
                        title="Détails"
                      >
                        <PanelRightOpen className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>

      {/* Details Modal */}
      <Dialog open={!!detailsArticle} onOpenChange={(open) => !open && setDetailsArticle(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          {detailsArticle && (() => {
            // Compute values for the modal (same logic as table)
            const hasInventoryData = detailsArticle.inventory && detailsArticle.inventory.length > 0;
            const totalStockFromInventory = detailsArticle.inventory?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
            
            let totalQtyInEntryUnits = 0;
            if (!hasInventoryData) {
              mouvements.forEach(mouvement => {
                if (mouvement.ref === detailsArticle.ref) {
                  if (mouvement.type === "Entrée" && (mouvement.statut === "Terminé" || mouvement.status === "approved")) {
                    totalQtyInEntryUnits += mouvement.qteOriginale || mouvement.qte;
                  } else if (mouvement.type === "Sortie" && (mouvement.statut === "Terminé" || mouvement.status === "approved")) {
                    totalQtyInEntryUnits -= mouvement.qteOriginale || mouvement.qte;
                  } else if (mouvement.type === "Ajustement") {
                    const qtyInEntryUnits = mouvement.qte / detailsArticle.facteurConversion;
                    if (mouvement.typeAjustement === "Surplus") totalQtyInEntryUnits += qtyInEntryUnits;
                    else if (mouvement.typeAjustement === "Manquant") totalQtyInEntryUnits -= qtyInEntryUnits;
                  }
                }
              });
            }
            
            const stockInExitUnits = hasInventoryData ? Number(totalStockFromInventory) : Number(totalQtyInEntryUnits * detailsArticle.facteurConversion);
            const stockInEntryUnits = hasInventoryData ? Number(totalStockFromInventory / detailsArticle.facteurConversion) : Number(totalQtyInEntryUnits);
            const status = getStockStatus(stockInExitUnits, detailsArticle.seuil, detailsArticle.consommationJournaliere);
            const autonomy = calculateAutonomy(stockInExitUnits, detailsArticle.consommationJournaliere);
            
            const articleSuppliers = detailsArticle.supplierIds?.map(id => suppliers.find(s => s.id === id)).filter(Boolean) || [];
            
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-lg font-semibold text-gray-900">{detailsArticle.nom}</DialogTitle>
                        {status.level === "critical" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Critique
                          </span>
                        )}
                        {status.level === "ok" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            Sécurisé
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{detailsArticle.ref}</span>
                        <span>•</span>
                        <span>{detailsArticle.categorie}</span>
                      </div>
                    </div>
                  </div>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 py-4">
                  {/* Section Stock */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">Stock</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Stock actuel</span>
                        <div className="flex flex-col items-end">
                          <span className="text-sm text-gray-900 tabular-nums font-medium">
                            {String(stockInExitUnits)} {getUnitSymbol(detailsArticle.uniteSortie)}
                          </span>
                          {detailsArticle.facteurConversion !== 1 && (
                            <span className="text-xs text-gray-500 tabular-nums">
                              ({String(stockInEntryUnits)} {getUnitSymbol(detailsArticle.uniteEntree)})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Seuil d'alerte</span>
                        <span className="text-sm text-gray-900 tabular-nums">{detailsArticle.seuil}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Temps restant</span>
                        <span className={`text-sm tabular-nums ${status.level === "critical" ? "text-red-600" : "text-gray-900"}`}>
                          {autonomy.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Consomm. inventaire</span>
                        <span className="text-sm text-gray-900 tabular-nums">
                          {detailsArticle.consommationParInventaire > 0 ? "+" : ""}{detailsArticle.consommationParInventaire}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-500 w-36">Consomm. journalière</span>
                        <span className="text-sm text-gray-900 tabular-nums">{detailsArticle.consommationJournaliere}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Unités */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">Unités de mesure</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Unité d'entrée</span>
                        <span className="text-sm text-gray-900">
                          {detailsArticle.uniteEntree} <span className="text-gray-500">({getUnitSymbol(detailsArticle.uniteEntree)})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-dotted border-gray-200">
                        <span className="text-sm text-gray-500 w-36">Unité de sortie</span>
                        <span className="text-sm text-gray-900">
                          {detailsArticle.uniteSortie} <span className="text-gray-500">({getUnitSymbol(detailsArticle.uniteSortie)})</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-500 w-36">Facteur conversion</span>
                        <span className="text-sm text-gray-900 tabular-nums">
                          1:{detailsArticle.facteurConversion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section Fournisseurs */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">Fournisseurs</h3>
                    {articleSuppliers.length > 0 ? (
                      <div className="space-y-2">
                        {articleSuppliers.map((supplier: any) => (
                          <div key={supplier.id} className="py-2 border-b border-dotted border-gray-200 last:border-0">
                            <span className="text-sm text-gray-700">{supplier.nom}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic py-2">Aucun fournisseur</p>
                    )}
                  </div>

                  {/* Section Emplacements */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2">Emplacements</h3>
                    {detailsArticle.inventory && detailsArticle.inventory.length > 0 ? (
                      <div className="space-y-2">
                        {detailsArticle.inventory.map((inv: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-dotted border-gray-200 last:border-0">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{inv.zone}</span>
                            </div>
                            <span className="text-sm text-gray-900 tabular-nums font-medium">{Number(inv.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic py-2">Non localisé</p>
                    )}
                  </div>
                </div>

                <DialogFooter className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <button
                    onClick={() => {
                      setDetailsArticle(null);
                      handleDelete(detailsArticle.id);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                  <div className="flex items-center gap-2">
                    <DialogClose asChild>
                      <button className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                        Fermer
                      </button>
                    </DialogClose>
                    <button
                      onClick={() => {
                        setDetailsArticle(null);
                        handleOpenModal(detailsArticle);
                      }}
                      className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
                    >
                      Modifier
                    </button>
                  </div>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Historique des Consommations Journalières */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">Historique des Consommations Journalières</span>
          <span className="text-xs text-muted-foreground">({consumptionHistory.length} entrées)</span>
        </div>

        {consumptionHistory.length > 0 ? (
          <>
            <div className="w-full max-w-full overflow-x-auto bg-white border border-gray-200 rounded-md">
              <table className="min-w-[700px] w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Référence</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide">Article</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        <span>Total Consommé</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllHistory ? consumptionHistory : consumptionHistory.slice(0, 15)).map((entry, idx) => {
                    const today = new Date().toDateString();
                    const isToday = entry.date === today;
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`border-b border-gray-100 transition-colors h-12 ${
                          isToday 
                            ? "bg-orange-50 hover:bg-orange-100" 
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-2 px-4 text-sm text-gray-500 whitespace-nowrap tabular-nums">
                          <div className="flex items-center gap-2">
                            {isToday && <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />}
                            {formatDateFR(entry.dateObj)}
                          </div>
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-500 whitespace-nowrap">{entry.ref}</td>
                        <td className="py-2 px-4 text-sm font-medium text-gray-900">{entry.article}</td>
                        <td className="py-2 px-4 text-right whitespace-nowrap">
                          <span className={`text-sm font-medium tabular-nums ${
                            isToday ? "text-orange-600" : "text-gray-900"
                          }`}>
                            {entry.totalConsomme.toLocaleString()}
                          </span>
                        </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
            {consumptionHistory.length > 15 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllHistory(!showAllHistory)}
                  className="text-primary font-medium hover:underline text-sm"
                >
                  {showAllHistory ? 'Réduire' : `Afficher tout (${consumptionHistory.length})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card border rounded-lg p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucune consommation enregistrée pour le moment.</p>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Modifier l'article" : "Ajouter un article"}
        maxWidth="max-w-4xl"
        maxHeight="max-h-[95vh]"
        bodyClassName="px-6 py-4"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-9 px-4 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="article-form"
              className="h-9 px-4 rounded bg-primary text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} id="article-form" className="space-y-4">
          {/* Section: Informations générales */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
              Informations générales
            </h3>
            <div className="space-y-4">
              {/* Row 1: Référence | Nom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Référence <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="Ex: GN-M-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="Ex: Gants Nitrile M"
                  />
                </div>
              </div>
              {/* Row 2: Catégorie | Seuil d'alerte | CJE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Catégorie</label>
                  <div className="relative">
                    <select
                      value={formData.categorie}
                      onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                      className="w-full h-9 px-3 pr-9 rounded border border-gray-300 bg-white text-sm text-gray-900 appearance-none hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.nom}>
                          {cat.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formData.seuil === 0 ? '' : formData.seuil}
                    onChange={(e) => setFormData({ ...formData, seuil: Number(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors no-spinner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Consommation Journalière Estimée (CJE)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={formData.consommationJournaliere === 0 ? '' : formData.consommationJournaliere}
                    onChange={(e) => setFormData({ ...formData, consommationJournaliere: Number(e.target.value) || 0 })}
                    className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors no-spinner"
                    placeholder="Ex: 50 unités/jour"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Unités et conversion */}
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
              Unités et conversion
            </h3>
            <div className="space-y-4">
              {/* Row: Unité d'Entrée | Unité de Sortie | Facteur de Conversion */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Unité d'Entrée (Achat)</label>
                  <div className="relative">
                    <select
                      value={formData.uniteEntree}
                      onChange={(e) => setFormData({ ...formData, uniteEntree: e.target.value, unite: formData.uniteSortie })}
                      className="w-full h-9 px-3 pr-9 rounded border border-gray-300 bg-white text-sm text-gray-900 appearance-none hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    >
                      {units.length === 0 ? (
                        <option value="">Aucune unité disponible</option>
                      ) : (
                        units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unité utilisée lors des entrées de stock (ex: Tonne, Carton, Boîte)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Unité de Sortie (Consommation)</label>
                  <div className="relative">
                    <select
                      value={formData.uniteSortie}
                      onChange={(e) => setFormData({ ...formData, uniteSortie: e.target.value, unite: e.target.value })}
                      className="w-full h-9 px-3 pr-9 rounded border border-gray-300 bg-white text-sm text-gray-900 appearance-none hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    >
                      {units.length === 0 ? (
                        <option value="">Aucune unité disponible</option>
                      ) : (
                        units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unité utilisée lors des sorties de stock (ex: Kg, Paire, Unité)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Facteur de Conversion</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.facteurConversion}
                    onChange={(e) => {
                      const value = e.target.value.replace(',', '.');
                      setFormData({ ...formData, facteurConversion: value });
                    }}
                    className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="Ex: 1000 ou 0.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    1 {formData.uniteEntree} = {formData.facteurConversion} {formData.uniteSortie}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ArticlesPage;

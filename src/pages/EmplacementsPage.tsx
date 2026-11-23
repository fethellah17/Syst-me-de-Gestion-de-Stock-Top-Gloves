import { Plus, Edit, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

const EmplacementsPage = () => {
  const { emplacements, addEmplacement, updateEmplacement, deleteEmplacement, articles, mouvements } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    nom: "",
  });

  // Format number to remove trailing zeros
  const formatQuantity = (quantity: number): string => {
    // Strip trailing zeros by converting to Number, then back to string
    // This handles both integers (10000) and decimals (10.5) correctly
    return String(Number(quantity));
  };

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Rafraîchir l'occupation en temps réel
  useEffect(() => {
    // When mouvements change, trigger a re-render of the drawer
    // This ensures inventory adjustments are reflected immediately
    setRefreshTrigger(prev => prev + 1);
  }, [mouvements]);

  const handleOpenModal = (emplacement?: typeof emplacements[0]) => {
    if (emplacement) {
      setFormData({
        code: emplacement.code,
        nom: emplacement.nom,
      });
      setEditingId(emplacement.id);
    } else {
      setFormData({ code: "", nom: "" });
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
    if (!formData.code || !formData.nom) {
      setToast({ message: "Veuillez remplir tous les champs", type: "error" });
      return;
    }

    if (editingId) {
      updateEmplacement(editingId, {
        code: formData.code,
        nom: formData.nom,
        type: "Stockage",
      });
      setToast({ message: "Emplacement modifié avec succès", type: "success" });
    } else {
      addEmplacement({
        code: formData.code,
        nom: formData.nom,
        type: "Stockage",
      });
      setToast({ message: "Emplacement ajouté avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet emplacement ?")) {
      deleteEmplacement(id);
      setToast({ message: "Emplacement supprimé avec succès", type: "success" });
    }
  };

  // Récupérer les articles d'une zone spécifique
  // Read directly from the inventory array structure
  const getArticlesInLocation = (locationName: string) => {
    return articles
      .map(article => {
        // CRITICAL: Check if this article has the location in its inventory array
        const inventoryEntry = article.inventory?.find(inv => inv.zone === locationName);
        
        if (inventoryEntry && Number(inventoryEntry.quantity) > 0) {
          console.log(`[ZONE] Article: ${article.nom} | Zone: ${locationName} | Quantity: ${inventoryEntry.quantity} ${article.uniteSortie}`);
          return {
            ref: article.ref,
            nom: article.nom,
            quantite: Number(inventoryEntry.quantity), // Get quantity directly from inventory
            unite: article.uniteSortie,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Emplacements</h2>
          <p className="text-sm text-muted-foreground">{emplacements.length} emplacements</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {emplacements.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-12 text-center">
          <p className="text-sm text-gray-500">Aucun emplacement</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Code</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Nom</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {emplacements.map((loc) => (
                <tr key={loc.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{loc.code}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{loc.nom}</td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                      {loc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(loc)}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(loc.id)}
                        className="p-1.5 rounded text-gray-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier l'emplacement" : "Ajouter un emplacement"} hideCloseButton={true} bodyClassName="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">
              Code<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              placeholder="Ex: A-12"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">
              Nom<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              placeholder="Ex: Zone A - Rack 12"
            />
          </div>

          <div className="flex justify-end gap-2 px-6 py-3 -mx-6 -mb-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-9 px-4 rounded border border-gray-300 bg-white text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Drawer pour afficher le détail des stocks */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="flex-1 bg-black/50 transition-opacity"
            onClick={() => setSelectedLocation(null)}
          />
          
          {/* Drawer */}
          <div className="w-full max-w-2xl bg-background shadow-lg flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-foreground">Contenu de {selectedLocation}</h2>
                <p className="text-sm text-muted-foreground mt-1">Détail des articles présents dans cette zone</p>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                // Use refreshTrigger to ensure recalculation when mouvements change
                const _ = refreshTrigger; // Reference the trigger to force dependency
                const articlesInLocation = getArticlesInLocation(selectedLocation);
                const totalArticles = articlesInLocation.length;

                return (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="mb-6">
                      <div className="bg-muted rounded-lg p-4 border">
                        <p className="text-xs text-muted-foreground mb-1">Articles différents</p>
                        <p className="text-2xl font-bold text-foreground">{totalArticles}</p>
                      </div>
                    </div>

                    {/* Table */}
                    {articlesInLocation.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted border-b">
                              <th className="px-4 py-3 text-left font-semibold text-foreground">Référence</th>
                              <th className="px-4 py-3 text-left font-semibold text-foreground">Désignation</th>
                              <th className="px-4 py-3 text-right font-semibold text-foreground">Quantité</th>
                            </tr>
                          </thead>
                          <tbody>
                            {articlesInLocation.map((article, idx) => (
                              <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-xs text-primary font-semibold">{article.ref}</td>
                                <td className="px-4 py-3 text-foreground">{article.nom}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted text-foreground font-semibold text-xs">
                                    {formatQuantity(article.quantite)} {article.unite}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">Aucun article dans cette zone</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-muted/30">
              <button
                onClick={() => setSelectedLocation(null)}
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmplacementsPage;

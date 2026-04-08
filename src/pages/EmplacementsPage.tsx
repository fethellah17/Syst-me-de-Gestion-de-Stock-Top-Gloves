import { MapPin, Plus, Edit, Trash2, X } from "lucide-react";
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
    <div className="space-y-6 max-w-7xl">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {emplacements.map((loc) => (
          <div 
            key={loc.id} 
            className="bg-card border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer hover:border-primary/30"
            onClick={() => setSelectedLocation(loc.nom)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{loc.nom}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{loc.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleOpenModal(loc)}
                  className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium mt-3 ${
              loc.type === "Quarantaine" ? "bg-muted text-muted-foreground border border-border" : 
              loc.type === "Expédition" ? "bg-muted text-muted-foreground border border-border" : 
              "bg-muted text-muted-foreground border border-border"
            }`}>
              {loc.type}
            </span>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier l'emplacement" : "Ajouter un emplacement"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: A-12"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Zone A - Rack 12"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {editingId ? "Modifier" : "Ajouter"}
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

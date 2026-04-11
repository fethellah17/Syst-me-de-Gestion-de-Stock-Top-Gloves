import { useState } from "react";
import { Truck, Plus, Edit, Trash2, Search, Phone } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

const FournisseursPage = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useData();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({ nom: "", contact1: "", contact2: "" });

  const filtered = suppliers.filter(s =>
    s.nom.toLowerCase().includes(search.toLowerCase()) ||
    s.contact1.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact2 && s.contact2.toLowerCase().includes(search.toLowerCase()))
  );

  const handleOpenModal = (supplier?: typeof suppliers[0]) => {
    if (supplier) {
      setFormData({ nom: supplier.nom, contact1: supplier.contact1, contact2: supplier.contact2 || "" });
      setEditingId(supplier.id);
    } else {
      setFormData({ nom: "", contact1: "", contact2: "" });
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
    if (!formData.nom.trim()) {
      setToast({ message: "Veuillez entrer un nom de fournisseur", type: "error" });
      return;
    }

    if (!formData.contact1.trim()) {
      setToast({ message: "Veuillez entrer au moins un contact", type: "error" });
      return;
    }

    if (editingId) {
      updateSupplier(editingId, { nom: formData.nom, contact1: formData.contact1, contact2: formData.contact2 || undefined });
      setToast({ message: "Fournisseur modifié avec succès", type: "success" });
    } else {
      addSupplier({ nom: formData.nom, contact1: formData.contact1, contact2: formData.contact2 || undefined });
      setToast({ message: "Fournisseur ajouté avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      deleteSupplier(id);
      setToast({ message: "Fournisseur supprimé avec succès", type: "success" });
    }
  };

  return (
    <div className="space-y-6 w-full px-4 md:px-0 md:max-w-5xl">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Fournisseurs</h2>
          <p className="text-sm text-muted-foreground">{suppliers.length} fournisseurs enregistrés</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Search - Full width on mobile */}
      <div className="relative w-full md:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur..."
          className="w-full h-9 pl-9 pr-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden md:block bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nom du Fournisseur</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone 1</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone 2</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    Aucun fournisseur trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-muted-foreground">{supplier.id}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{supplier.nom}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{supplier.contact1}</td>
                    <td className="py-3 px-4 text-foreground">{supplier.contact2 || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(supplier)}
                          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List - Visible only on mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground bg-card rounded-lg border">
            Aucun fournisseur trouvé
          </div>
        ) : (
          filtered.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 className="font-bold text-foreground flex-1 truncate">{supplier.nom}</h3>
              </div>

              {/* Card Body - Contact Info */}
              <div className="px-4 py-3 space-y-2">
                {/* Téléphone 1 */}
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href={`tel:${supplier.contact1}`}
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {supplier.contact1}
                  </a>
                </div>

                {/* Téléphone 2 */}
                {supplier.contact2 && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`tel:${supplier.contact2}`}
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {supplier.contact2}
                    </a>
                  </div>
                )}
              </div>

              {/* Card Footer - Actions */}
              <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(supplier)}
                  className="h-8 px-3 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="h-8 px-3 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal - Responsive sizing */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier le fournisseur" : "Ajouter un fournisseur"}>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom du Fournisseur</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Fournisseur A"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Téléphone 1 *</label>
            <input
              type="text"
              value={formData.contact1}
              onChange={(e) => setFormData({ ...formData, contact1: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: +213 5XX XX XX XX"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: +213 suivi de 9 chiffres (ex: +213 555 12 34 56)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Téléphone 2 (optionnel)</label>
            <input
              type="text"
              value={formData.contact2}
              onChange={(e) => setFormData({ ...formData, contact2: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: +213 5XX XX XX XX"
            />
            <p className="text-xs text-muted-foreground mt-1">Format: +213 suivi de 9 chiffres (ex: +213 556 23 45 67)</p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="h-9 px-4 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {editingId ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
        />
      )}
    </div>
  );
};

export default FournisseursPage;

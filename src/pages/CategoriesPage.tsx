import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";

const CategoriesPage = () => {
  const { categories, addCategorie, updateCategorie, deleteCategorie } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  });

  const handleOpenModal = (categorie?: typeof categories[0]) => {
    if (categorie) {
      setFormData({
        nom: categorie.nom,
        description: categorie.description,
      });
      setEditingId(categorie.id);
    } else {
      setFormData({ nom: "", description: "" });
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
    if (!formData.nom) {
      setToast({ message: "Veuillez remplir le nom", type: "error" });
      return;
    }

    if (editingId) {
      updateCategorie(editingId, formData);
      setToast({ message: "Catégorie modifiée avec succès", type: "success" });
    } else {
      addCategorie({
        ...formData,
        articles: 0,
        stock: 0,
      });
      setToast({ message: "Catégorie ajoutée avec succès", type: "success" });
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      deleteCategorie(id);
      setToast({ message: "Catégorie supprimée avec succès", type: "success" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Catégories</h2>
          <p className="text-sm text-muted-foreground">{categories.length} catégories</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md py-12 text-center">
          <p className="text-sm text-gray-500">Aucune catégorie</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Nom</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Description</th>
                <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{c.nom}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 truncate">{c.description || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(c)}
                        className="p-1.5 rounded text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? "Modifier la catégorie" : "Ajouter une catégorie"} hideCloseButton={true} bodyClassName="px-6 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">
              Nom<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              placeholder="Ex: Gants Nitrile"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary resize-none"
              rows={3}
              placeholder="Description de la catégorie"
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
    </div>
  );
};

export default CategoriesPage;

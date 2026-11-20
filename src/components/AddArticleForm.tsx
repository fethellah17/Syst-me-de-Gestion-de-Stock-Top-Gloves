import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { getUnitNames } from "@/lib/units-storage";

export const AddArticleForm = () => {
  const { addArticle, categories } = useData();
  const [units, setUnits] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    ref: "",
    nom: "",
    categorie: "",
    stock: 0,
    seuil: 0,
    uniteEntree: "",
    uniteSortie: "",
    facteurConversion: 1,
    consommationJournaliere: 0,
  });

  useEffect(() => {
    const loadedUnits = getUnitNames();
    setUnits(loadedUnits);
    if (loadedUnits.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        uniteEntree: loadedUnits[0],
        uniteSortie: loadedUnits[0]
      }));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ref || !formData.nom) {
      alert("Veuillez remplir la référence et le nom");
      return;
    }

    addArticle({
      ref: formData.ref,
      nom: formData.nom,
      categorie: formData.categorie,
      stock: formData.stock,
      seuil: formData.seuil,
      unite: formData.uniteSortie,
      uniteEntree: formData.uniteEntree,
      uniteSortie: formData.uniteSortie,
      facteurConversion: formData.facteurConversion,
      consommationParInventaire: 0,
      consommationJournaliere: formData.consommationJournaliere,
      inventory: []
    });

    // Reset form
    setFormData({
      ref: "",
      nom: "",
      categorie: "",
      stock: 0,
      seuil: 0,
      uniteEntree: units[0] || "",
      uniteSortie: units[0] || "",
      facteurConversion: 1,
      consommationJournaliere: 0,
    });
  };

  return (
    <div className="bg-card border rounded-lg p-6 max-w-2xl">
      <h3 className="text-lg font-bold text-foreground mb-4">Ajouter un Article</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Référence *</label>
            <input
              type="text"
              value={formData.ref}
              onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: ART-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom *</label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex: Gants Nitrile"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
          <select
            value={formData.categorie}
            onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
            className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.nom}>
                {cat.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Stock Initial</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Seuil</label>
            <input
              type="number"
              value={formData.seuil}
              onChange={(e) => setFormData({ ...formData, seuil: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Unité d'Entrée</label>
            <select
              value={formData.uniteEntree}
              onChange={(e) => setFormData({ ...formData, uniteEntree: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Unité de Sortie</label>
            <select
              value={formData.uniteSortie}
              onChange={(e) => setFormData({ ...formData, uniteSortie: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Facteur de Conversion</label>
            <input
              type="number"
              step="0.001"
              value={formData.facteurConversion}
              onChange={(e) => setFormData({ ...formData, facteurConversion: Number(e.target.value) || 1 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              1 {formData.uniteEntree} = {formData.facteurConversion} {formData.uniteSortie}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Consommation Journalière</label>
            <input
              type="number"
              value={formData.consommationJournaliere}
              onChange={(e) => setFormData({ ...formData, consommationJournaliere: Number(e.target.value) || 0 })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ajouter l'Article
        </button>
      </form>
    </div>
  );
};

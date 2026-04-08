import { useState, useEffect } from "react";
import { Plus, Trash2, Ruler, Edit2, X, Check } from "lucide-react";
import { Toast } from "@/components/Toast";
import { getUnits, addUnit, updateUnit, deleteUnit, type Unit } from "@/lib/units-storage";

const UnitesPage = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitSymbol, setNewUnitSymbol] = useState("");
  const [editingUnit, setEditingUnit] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSymbol, setEditSymbol] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load units on mount
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = () => {
    const loadedUnits = getUnits();
    console.log("Loaded units:", loadedUnits);
    setUnits(loadedUnits);
  };

  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newUnitName.trim();
    const trimmedSymbol = newUnitSymbol.trim();
    
    console.log("Attempting to add unit:", trimmedName, "with symbol:", trimmedSymbol);
    
    if (!trimmedName) {
      setToast({ message: "Veuillez entrer un nom d'unité", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const success = addUnit(trimmedName, trimmedSymbol);
    console.log("Add unit result:", success);
    
    if (success) {
      loadUnits();
      setNewUnitName("");
      setNewUnitSymbol("");
      setToast({ message: `Unité "${trimmedName}" ajoutée avec succès`, type: "success" });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: "Cette unité existe déjà", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleStartEdit = (unit: Unit) => {
    setEditingUnit(unit.name);
    setEditName(unit.name);
    setEditSymbol(unit.symbol);
  };

  const handleCancelEdit = () => {
    setEditingUnit(null);
    setEditName("");
    setEditSymbol("");
  };

  const handleSaveEdit = (oldName: string) => {
    const success = updateUnit(oldName, editName, editSymbol);
    
    if (success) {
      loadUnits();
      setEditingUnit(null);
      setToast({ message: "Unité modifiée avec succès", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } else {
      setToast({ message: "Erreur lors de la modification", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteUnit = (unitName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'unité "${unitName}" ?`)) {
      console.log("Attempting to delete unit:", unitName);
      const success = deleteUnit(unitName);
      console.log("Delete unit result:", success);
      
      if (success) {
        loadUnits();
        setToast({ message: `Unité "${unitName}" supprimée avec succès`, type: "success" });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ message: "Impossible de supprimer la dernière unité", type: "error" });
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Unités de Mesure</h2>
          <p className="text-sm text-muted-foreground">{units.length} unités configurées</p>
        </div>
      </div>

      {/* Add Unit Form */}
      <div className="bg-card border rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Ajouter une Unité</h3>
        <form onSubmit={handleAddUnit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="Ex: Kilogramme, Boîte..."
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Symbole / Abréviation
              </label>
              <input
                type="text"
                value={newUnitSymbol}
                onChange={(e) => setNewUnitSymbol(e.target.value)}
                placeholder="Ex: Kg, Bx..."
                maxLength={4}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </form>
      </div>

      {/* Units Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {units.length === 0 ? (
          <div className="p-8 text-center">
            <Ruler className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">Aucune unité configurée</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez votre première unité ci-dessus</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Nom complet
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Symbole
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    {editingUnit === unit.name ? (
                      <>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full h-8 px-2 rounded border bg-background text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={editSymbol}
                            onChange={(e) => setEditSymbol(e.target.value)}
                            maxLength={4}
                            className="w-full h-8 px-2 rounded border bg-background text-sm text-center"
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveEdit(unit.name)}
                              className="p-1.5 rounded hover:bg-success/10 transition-colors text-success"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Ruler className="w-4 h-4 text-primary" />
                            <span className="font-medium text-foreground">{unit.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-600 border-gray-200">
                            {unit.symbol}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(unit)}
                              className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUnit(unit.name)}
                              className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default UnitesPage;

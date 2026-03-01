import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Shield } from "lucide-react";
import { Toast } from "@/components/Toast";

interface Permission {
  id: string;
  label: string;
  description: string;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  { id: "dashboard", label: "Tableau de Bord", description: "Accès au tableau de bord", category: "Général" },
  
  { id: "articles", label: "Voir Articles", description: "Consulter la liste des articles", category: "Articles" },
  { id: "articles.create", label: "Créer Articles", description: "Créer de nouveaux articles", category: "Articles" },
  { id: "articles.edit", label: "Modifier Articles", description: "Modifier les articles existants", category: "Articles" },
  { id: "articles.delete", label: "Supprimer Articles", description: "Supprimer des articles", category: "Articles" },
  
  { id: "categories", label: "Gérer Catégories", description: "Voir et gérer les catégories", category: "Catégories" },
  
  { id: "emplacements", label: "Gérer Emplacements", description: "Voir et gérer les emplacements", category: "Emplacements" },
  
  { id: "mouvements", label: "Voir Mouvements", description: "Consulter les mouvements de stock", category: "Mouvements" },
  { id: "mouvements.create", label: "Créer Mouvements", description: "Créer des mouvements", category: "Mouvements" },
  { id: "mouvements.edit", label: "Modifier Mouvements", description: "Modifier les mouvements", category: "Mouvements" },
  { id: "mouvements.delete", label: "Supprimer Mouvements", description: "Supprimer des mouvements", category: "Mouvements" },
  { id: "mouvements.qc", label: "Contrôle Qualité", description: "Valider les sorties", category: "Mouvements" },
  
  { id: "inventaire", label: "Voir Inventaire", description: "Accès à l'inventaire", category: "Inventaire" },
  { id: "inventaire.adjust", label: "Ajuster Inventaire", description: "Effectuer des ajustements", category: "Inventaire" },
  
  { id: "staff", label: "Gérer Personnel", description: "Voir et gérer le personnel", category: "Administration" },
  { id: "admin", label: "Administration", description: "Accès complet à l'administration", category: "Administration" },
];

const StaffFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    permissions: [] as string[],
    active: true,
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Load data if editing
  useEffect(() => {
    if (isEditing) {
      // Here you would load the actual staff member data from context/API
      // For now, using dummy data
      setFormData({
        name: "Jean Dupont",
        email: "jean.dupont@topgloves.com",
        password: "",
        role: "Gestionnaire",
        permissions: ["dashboard", "articles", "articles.create", "articles.edit", "mouvements", "mouvements.create"],
        active: true,
      });
    }
  }, [isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      setToast({ message: "Veuillez remplir tous les champs obligatoires", type: "error" });
      return;
    }

    if (!isEditing && !formData.password) {
      setToast({ message: "Le mot de passe est obligatoire pour un nouveau membre", type: "error" });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setToast({ message: "Le mot de passe doit contenir au moins 6 caractères", type: "error" });
      return;
    }

    // Here you would normally save to backend/context
    console.log("Saving staff member:", formData);

    setToast({ 
      message: isEditing ? "Membre modifié avec succès" : "Membre ajouté avec succès", 
      type: "success" 
    });
    
    setTimeout(() => {
      navigate("/staff");
    }, 1000);
  };

  const togglePermission = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [],
    }));
  };

  const categories = Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.category)));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/staff")}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            {isEditing ? "Modifier le membre" : "Ajouter un membre"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditing ? "Modifier les informations et permissions" : "Créer un nouveau membre du personnel"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Informations de base</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nom complet <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ex: jean.dupont@topgloves.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Mot de passe {!isEditing && <span className="text-destructive">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={isEditing ? "Laisser vide pour ne pas modifier" : "Minimum 6 caractères"}
              required={!isEditing}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {isEditing 
                ? "Laisser vide pour conserver le mot de passe actuel" 
                : "Le mot de passe doit contenir au moins 6 caractères"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Rôle <span className="text-destructive">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Sélectionner un rôle</option>
              <option value="Administrateur">Administrateur</option>
              <option value="Gestionnaire">Gestionnaire</option>
              <option value="Opérateur">Opérateur</option>
              <option value="Contrôleur Qualité">Contrôleur Qualité</option>
              <option value="Magasinier">Magasinier</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="active" className="text-sm text-foreground">Compte actif</label>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Permissions</h3>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllPermissions}
                className="text-xs text-primary hover:underline"
              >
                Tout sélectionner
              </button>
              <span className="text-xs text-muted-foreground">|</span>
              <button
                type="button"
                onClick={clearAllPermissions}
                className="text-xs text-muted-foreground hover:underline"
              >
                Tout désélectionner
              </button>
            </div>
          </div>

          <div className="p-3 bg-muted/30 rounded-md">
            <p className="text-xs text-muted-foreground">
              {formData.permissions.length} permission{formData.permissions.length > 1 ? 's' : ''} sélectionnée{formData.permissions.length > 1 ? 's' : ''} sur {AVAILABLE_PERMISSIONS.length}
            </p>
          </div>

          {/* Permissions by Category */}
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryPermissions = AVAILABLE_PERMISSIONS.filter(p => p.category === category);
              const selectedCount = categoryPermissions.filter(p => formData.permissions.includes(p.id)).length;
              
              return (
                <div key={category} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">{category}</h4>
                      <span className="text-xs text-muted-foreground">
                        {selectedCount} / {categoryPermissions.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    {categoryPermissions.map((permission) => (
                      <div
                        key={permission.id}
                        onClick={() => togglePermission(permission.id)}
                        className="flex items-start gap-3 p-3 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          formData.permissions.includes(permission.id)
                            ? "bg-primary border-primary"
                            : "border-border bg-background"
                        }`}>
                          {formData.permissions.includes(permission.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{permission.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => navigate("/staff")}
            className="h-9 px-6 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {isEditing ? "Enregistrer les modifications" : "Créer le membre"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default StaffFormPage;

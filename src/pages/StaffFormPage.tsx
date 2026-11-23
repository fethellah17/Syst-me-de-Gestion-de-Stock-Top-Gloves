import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Toast } from "@/components/Toast";
import {
  PERMISSIONS,
  ROLES,
  getRoleTemplate,
  isCustomized,
  withViewDependency,
  getPermissionMatrix,
  normalizePermissions,
} from "@/lib/permissions";

const STORAGE_KEY = 'staff_members';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data if editing
  useEffect(() => {
    if (isEditing) {
      loadStaffMember();
    }
  }, [isEditing, id]);

  const loadStaffMember = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const staffList = JSON.parse(stored);
        const member = staffList.find((s: any) => s.id === parseInt(id!));
        
        if (member) {
          setFormData({
            name: member.name,
            email: member.email,
            password: "",
            role: member.role,
            permissions: member.permissions || [],
            active: member.active,
          });
        }
      }
    } catch (error) {
      console.error('Error loading staff member:', error);
      setToast({ message: "Erreur lors du chargement des données", type: "error" });
    }
  };

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

    setIsSubmitting(true);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const staffList = stored ? JSON.parse(stored) : [];

      if (isEditing) {
        // Update existing member
        const updatedList = staffList.map((s: any) => {
          if (s.id === parseInt(id!)) {
            return {
              ...s,
              name: formData.name,
              email: formData.email,
              ...(formData.password && { password: formData.password }),
              role: formData.role,
              permissions: formData.permissions,
              active: formData.active,
            };
          }
          return s;
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        setToast({ message: "Membre modifié avec succès", type: "success" });
      } else {
        // Create new member
        const newId = staffList.length > 0 ? Math.max(...staffList.map((s: any) => s.id)) + 1 : 1;
        const newMember = {
          id: newId,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          permissions: formData.permissions,
          active: formData.active,
        };

        const updatedList = [...staffList, newMember];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        setToast({ message: "Membre ajouté avec succès", type: "success" });
      }

      setTimeout(() => {
        navigate("/staff");
      }, 1000);
    } catch (error: any) {
      console.error('Error saving staff member:', error);
      setToast({ 
        message: "Erreur lors de l'enregistrement", 
        type: "error" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: withViewDependency(prev.permissions, permissionId, checked),
    }));
  };

  const toggleAllForRow = (rowPermissions: string[]) => {
    setFormData(prev => {
      const allSelected = rowPermissions.every(id => prev.permissions.includes(id));
      let updated = [...prev.permissions];
      
      if (allSelected) {
        // Remove all
        updated = updated.filter(id => !rowPermissions.includes(id));
      } else {
        // Add all missing
        for (const id of rowPermissions) {
          if (!updated.includes(id)) {
            updated.push(id);
          }
        }
      }
      
      return {
        ...prev,
        permissions: normalizePermissions(updated),
      };
    });
  };

  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: PERMISSIONS.map(p => p.id),
    }));
  };

  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleRoleChange = (newRole: string) => {
    if (isEditing && formData.role) {
      // In edit mode, apply template when role changes
      const template = getRoleTemplate(newRole);
      setFormData(prev => ({
        ...prev,
        role: newRole,
        permissions: template,
      }));
    } else {
      // In create mode, always apply template
      const template = getRoleTemplate(newRole);
      setFormData(prev => ({
        ...prev,
        role: newRole,
        permissions: template,
      }));
    }
  };

  const matrix = getPermissionMatrix();
  const customized = formData.role && isCustomized(formData.role, formData.permissions);
  const hasStaffWithoutAdmin = formData.permissions.some(id => id.startsWith("staff")) && !formData.permissions.includes("admin");

  return (
    <div className="space-y-6 w-full">
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
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          {/* Basic Information */}
          <div className="bg-white border border-gray-200 rounded-md p-6 space-y-4 lg:sticky lg:top-4">
            <h3 className="text-sm font-medium text-gray-900">Informations de base</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1">
                  Nom complet <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                  placeholder="Ex: fethellah hadjbouziane"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                  placeholder="Ex: fethellahhadjbouziane@topgloves.com"
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1">
                  Mot de passe {!isEditing && <span className="text-destructive">*</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                  placeholder={isEditing ? "Laisser vide pour ne pas modifier" : "Minimum 6 caractères"}
                  autoComplete="new-password"
                  required={!isEditing}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isEditing 
                    ? "Laisser vide pour conserver le mot de passe actuel" 
                    : "Le mot de passe doit contenir au moins 6 caractères"}
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1">
                  Rôle <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                  required
                >
                  <option value="">Sélectionner un rôle</option>
                  {ROLES.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {isEditing && formData.role && (
                  <p className="text-xs text-gray-500 mt-1">
                    Changer le rôle appliquera le modèle de permissions correspondant.
                  </p>
                )}
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

            <div className="p-3 bg-muted/30 rounded-md flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {formData.permissions.length} permission{formData.permissions.length > 1 ? 's' : ''} sélectionnée{formData.permissions.length > 1 ? 's' : ''} sur {PERMISSIONS.length}
              </p>
              {customized && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
                  Personnalisé
                </span>
              )}
            </div>

            {/* Permission Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white border border-gray-200 rounded-md">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Page</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Voir</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Créer</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Modifier</th>
                    <th className="text-center py-2 px-3 text-xs font-medium text-gray-500">Supprimer</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Actions spéciales</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row) => {
                    const rowPermissions: string[] = [];
                    if (row.view) rowPermissions.push(row.view.id);
                    if (row.create) rowPermissions.push(row.create.id);
                    if (row.edit) rowPermissions.push(row.edit.id);
                    if (row.delete) rowPermissions.push(row.delete.id);
                    rowPermissions.push(...row.specials.map(s => s.id));
                    
                    return (
                      <tr key={row.group} className="border-t border-gray-100">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{row.label}</span>
                            <button
                              type="button"
                              onClick={() => toggleAllForRow(rowPermissions)}
                              className="text-xs text-primary hover:underline"
                            >
                              Tout
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.view ? (
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(row.view.id)}
                              onChange={(e) => togglePermission(row.view!.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                              title={row.view.description}
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.create ? (
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(row.create.id)}
                              onChange={(e) => togglePermission(row.create!.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                              title={row.create.description}
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.edit ? (
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(row.edit.id)}
                              onChange={(e) => togglePermission(row.edit!.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                              title={row.edit.description}
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {row.delete ? (
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(row.delete.id)}
                              onChange={(e) => togglePermission(row.delete!.id, e.target.checked)}
                              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                              title={row.delete.description}
                            />
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {row.specials.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {row.specials.map(special => (
                                <label key={special.id} className="flex items-center gap-1 cursor-pointer" title={special.description}>
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(special.id)}
                                    onChange={(e) => togglePermission(special.id, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                                  />
                                  <span className="text-xs text-gray-700">{special.label}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Warning for staff permissions without admin */}
            {hasStaffWithoutAdmin && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-xs text-gray-600">
                  Le personnel n'est accessible que depuis l'Administration : cochez aussi « Administration ».
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => navigate("/staff")}
            className="h-9 px-4 rounded border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 px-6 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? "Enregistrement..." 
              : isEditing 
                ? "Enregistrer" 
                : "Créer le membre"}
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default StaffFormPage;

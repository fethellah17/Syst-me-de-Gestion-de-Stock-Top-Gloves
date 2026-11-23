import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Toast } from "@/components/Toast";

export interface Staff {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
}

const STORAGE_KEY = 'staff_members';

const StaffPage = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStaff(JSON.parse(stored));
      } else {
        // Initialize with default admin user
        const defaultStaff: Staff[] = [
          {
            id: 1,
            name: "Admin Principal",
            email: "admin@topgloves.com",
            role: "Administrateur",
            permissions: ["dashboard", "articles", "articles.create", "articles.edit", "articles.delete", "categories", "emplacements", "mouvements", "mouvements.create", "mouvements.edit", "mouvements.delete", "mouvements.qc", "inventaire", "inventaire.adjust", "staff", "admin"],
            active: true,
          },
        ];
        setStaff(defaultStaff);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStaff));
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      setToast({ message: "Erreur lors du chargement du personnel", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;

    try {
      const updatedStaff = staff.filter(s => s.id !== id);
      setStaff(updatedStaff);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStaff));
      setToast({ message: "Membre supprimé avec succès", type: "success" });
    } catch (error) {
      console.error('Error deleting staff:', error);
      setToast({ message: "Erreur lors de la suppression", type: "error" });
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Back to Admin */}
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Administration
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Personnel</h2>
          <p className="text-sm text-muted-foreground">{staff.length} membres</p>
        </div>
        <button
          onClick={() => navigate("/staff/new")}
          className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun membre
          </div>
        ) : (
          <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Nom</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Rôle</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">Permissions</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">Statut</th>
              <th className="text-center py-3 px-4 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900">{member.name}</span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{member.email}</td>
                <td className="py-3 px-4">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="text-sm text-gray-600">{member.permissions.length}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${member.active ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-sm text-gray-600">{member.active ? "Actif" : "Inactif"}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => navigate(`/staff/edit/${member.id}`)}
                      className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 rounded hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default StaffPage;

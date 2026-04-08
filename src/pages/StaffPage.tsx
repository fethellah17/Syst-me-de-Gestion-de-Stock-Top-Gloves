import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Shield } from "lucide-react";
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
    <div className="space-y-6 max-w-7xl">
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
      <div className="bg-card border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Chargement...
          </div>
        ) : staff.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun membre du personnel
          </div>
        ) : (
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Nom</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Rôle</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Permissions</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Statut</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium text-foreground">{member.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{member.email}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-foreground">
                    {member.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary">
                    <Shield className="w-3 h-3" />
                    <span className="text-xs font-semibold">{member.permissions.length}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    member.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  }`}>
                    {member.active ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => navigate(`/staff/edit/${member.id}`)}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import {
  ShieldCheck,
  Lock,
  LogOut,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  downloadCsv,
  buildCsv,
  ARTICLES_COLUMNS,
  MOUVEMENTS_COLUMNS,
  OPERATIONS_COLUMNS,
  INVENTAIRE_COLUMNS,
  PERSONNEL_COLUMNS,
} from "@/lib/csv-export";

const AdminPage = () => {
  const { isAdmin, adminLogin, logoutAdmin } = useAuth();
  const { articles, mouvements, operations, inventoryHistory } = useData();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedTable, setSelectedTable] = useState("Articles");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminLogin(password)) {
      setError("Mot de passe admin incorrect");
    }
    setPassword("");
  };

  const handleExport = () => {
    const today = new Date().toISOString().split("T")[0];
    const filename = `top-gloves-${selectedTable.toLowerCase()}-${today}.csv`;

    let csvString = "";

    switch (selectedTable) {
      case "Articles":
        csvString = buildCsv(ARTICLES_COLUMNS, articles);
        break;
      case "Mouvements":
        csvString = buildCsv(MOUVEMENTS_COLUMNS, mouvements);
        break;
      case "Opérations": {
        // Compute nbLignes for each operation (read-only, never mutate context data)
        const operationsWithLines = operations.map(op => ({
          ...op,
          nbLignes: mouvements.filter(m => m.operationId === op.id).length
        }));
        csvString = buildCsv(OPERATIONS_COLUMNS, operationsWithLines);
        break;
      }
      case "Inventaire":
        csvString = buildCsv(INVENTAIRE_COLUMNS, inventoryHistory);
        break;
      case "Personnel":
        try {
          const stored = localStorage.getItem("staff_members");
          const staff = stored ? JSON.parse(stored) : [];
          csvString = buildCsv(PERSONNEL_COLUMNS, staff);
        } catch {
          csvString = buildCsv(PERSONNEL_COLUMNS, []);
        }
        break;
      default:
        return;
    }

    downloadCsv(filename, csvString);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto mt-20">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Accès Admin</h2>
          <p className="text-sm text-muted-foreground mt-1">Authentification requise pour accéder à la zone d'administration</p>
        </div>
        <form onSubmit={handleAdminLogin} className="bg-card border rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe Admin</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="w-full h-10 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Accéder
          </button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Mot de passe démo: <span className="font-mono">admin</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gray-500" />
            Zone Administration
          </h2>
          <p className="text-sm text-muted-foreground">Gestion avancée de la base de données</p>
        </div>
        <button
          onClick={logoutAdmin}
          className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Quitter Admin
        </button>
      </div>

      {/* Admin modules */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden max-w-3xl">
        {/* TODO 12f: Paramètres Système - non-functional, hidden */}
        {false && (
          <button className="bg-card border rounded-lg p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              {/* <Settings className="w-5 h-5 text-primary" /> */}
            </div>
            <h3 className="font-semibold text-foreground text-sm">Paramètres Système</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Configuration générale</p>
          </button>
        )}
        
        <button 
          onClick={() => navigate("/staff")}
          className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-900">Gestion Utilisateurs</h3>
            <p className="text-sm text-gray-500 mt-0.5">Rôles et permissions</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        
        <button 
          onClick={() => navigate("/admin/historique")}
          className="w-full px-5 py-4 flex items-center justify-between border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div>
            <h3 className="text-sm font-medium text-gray-900">Historique Complet</h3>
            <p className="text-sm text-gray-500 mt-0.5">Historique des connexions</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        
        <div className="w-full px-5 py-4 border-t border-gray-100 space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Export de données</h3>
            <p className="text-sm text-gray-500">Exporter les données en CSV</p>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="flex-1 h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
            >
              <option value="Articles">Articles</option>
              <option value="Mouvements">Mouvements</option>
              <option value="Opérations">Opérations</option>
              <option value="Inventaire">Inventaire</option>
              <option value="Personnel">Personnel</option>
            </select>
            <button
              onClick={handleExport}
              className="h-9 px-4 border border-gray-300 bg-white rounded text-sm font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exporter (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

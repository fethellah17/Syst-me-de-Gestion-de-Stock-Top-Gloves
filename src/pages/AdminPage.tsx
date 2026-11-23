import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShieldCheck,
  Lock,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";

const AdminPage = () => {
  const { isAdmin, adminLogin, logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminLogin(password)) {
      setError("Mot de passe admin incorrect");
    }
    setPassword("");
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
            <ShieldCheck className="w-5 h-5 text-primary" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-3xl gap-4">
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
          className="relative bg-card border rounded-lg p-5 text-left cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors group"
        >
          <ChevronRight className="absolute top-5 right-5 w-4 h-4 text-gray-400" />
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Gestion Utilisateurs</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Rôles et permissions</p>
        </button>
        
        <button className="bg-card border rounded-lg p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Historique Complet</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Audit de toutes les actions</p>
        </button>
        
        {/* TODO 12f: Import/Export - non-functional, hidden */}
        {false && (
          <button className="bg-card border rounded-lg p-5 text-left hover:shadow-md hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
              {/* <FileSpreadsheet className="w-5 h-5 text-primary" /> */}
            </div>
            <h3 className="font-semibold text-foreground text-sm">Import/Export</h3>
            <p className="text-xs text-muted-foreground mt-0.5">CSV et Excel</p>
          </button>
        )}
      </div>

      {/* TODO 12f: Quick actions - non-functional, hidden */}
      {false && (
        <div className="flex flex-wrap gap-3">
          <button className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-foreground hover:bg-muted transition-colors">
            {/* <Download className="w-4 h-4" /> */}
            Exporter CSV
          </button>
          <button className="h-9 px-4 border rounded-md text-sm font-medium flex items-center gap-2 text-foreground hover:bg-muted transition-colors">
            {/* <Upload className="w-4 h-4" /> */}
            Importer Données
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;

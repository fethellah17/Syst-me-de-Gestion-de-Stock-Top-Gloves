import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { sortEventsDesc } from "@/lib/login-history";

const LoginHistoryPage = () => {
  const navigate = useNavigate();
  const { loginEvents } = useAuth();
  
  const sortedEvents = sortEventsDesc(loginEvents);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
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
          <h2 className="text-xl font-bold text-foreground">Historique des connexions</h2>
          <p className="text-sm text-muted-foreground">{sortedEvents.length} événements</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucune connexion enregistrée
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Date et heure</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Utilisateur</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Rôle</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">Événement</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => (
                <tr key={event.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">
                    {formatDate(event.date)}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                    {event.user}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                      {event.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        event.type === "login" ? "bg-green-500" : "bg-gray-400"
                      }`} />
                      <span className="text-sm text-gray-600">
                        {event.type === "login" ? "Connexion" : "Déconnexion"}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryPage;

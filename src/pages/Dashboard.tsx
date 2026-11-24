import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useMemo } from "react";
import { formatMovementDateTime, getRecentMovements } from "@/lib/dashboard-utils";

const Dashboard = () => {
  const { articles, mouvements, operations } = useData();
  const navigate = useNavigate();

  // Get 10 most recent movements
  const recentMovements = useMemo(() => {
    return getRecentMovements(mouvements, 10);
  }, [mouvements]);

  const getSourceLabel = (m: typeof mouvements[0]) => {
    if (m.type === "Sortie" || m.type === "Transfert" || m.type === "Ajustement") {
      return m.emplacementSource || "N/A";
    }
    return "—";
  };

  const getDestinationLabel = (m: typeof mouvements[0]) => {
    if (m.type === "Entrée" || m.type === "Transfert") {
      return m.emplacementDestination;
    }
    if (m.type === "Sortie") {
      return m.emplacementDestination;
    }
    if (m.type === "Ajustement") {
      return "—";
    }
    return "N/A";
  };

  const getMovementStatus = (m: typeof mouvements[0]) => {
    // If movement has an operation, show operation's status
    if (m.operationId) {
      const operation = operations.find(o => o.id === m.operationId);
      if (operation) {
        return operation.statut;
      }
    }
    // Otherwise show movement's status
    return m.statut || "—";
  };

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-foreground">Tableau de Bord</h2>
        <p className="text-sm text-muted-foreground">Vue d'ensemble du stock</p>
      </div>

      {/* Recent Movements Card */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Card Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Derniers mouvements</h3>
          <button
            onClick={() => navigate("/mouvements")}
            className="text-primary font-medium hover:underline text-sm"
          >
            Voir tout
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Date</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Référence</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Type</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Article</th>
                <th className="text-right py-2 px-4 text-xs font-medium text-gray-500">Quantité</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-gray-500">Source → Destination</th>
                <th className="text-center py-2 px-4 text-xs font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    Aucun mouvement
                  </td>
                </tr>
              ) : (
                recentMovements.map((m) => {
                  const operation = m.operationId ? operations.find(o => o.id === m.operationId) : null;
                  const article = articles.find(a => a.ref === m.ref);
                  const unit = article?.uniteSortie || "";
                  const status = getMovementStatus(m);
                  const isTermine = status === "Terminé";

                  return (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 text-gray-600">{formatMovementDateTime(m.date)}</td>
                      <td className="py-2 px-4 text-gray-900 font-medium">
                        {operation?.reference || "—"}
                      </td>
                      <td className="py-2 px-4 text-gray-600">{m.type}</td>
                      <td className="py-2 px-4 text-gray-900">{m.article}</td>
                      <td className="py-2 px-4 text-right text-gray-900 tabular-nums">
                        {m.qte.toLocaleString('fr-FR')} {unit}
                      </td>
                      <td className="py-2 px-4 text-gray-600">
                        {getSourceLabel(m)} → {getDestinationLabel(m)}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className={isTermine ? "text-gray-900" : "text-gray-500"}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useMemo, useState } from "react";
import { formatMovementDateTime, getRecentMovements } from "@/lib/dashboard-utils";
import { computeProductStats, type Period } from "@/lib/product-stats";

const Dashboard = () => {
  const { articles, mouvements, operations } = useData();
  const navigate = useNavigate();
  
  // State for filters
  const [selectedRef, setSelectedRef] = useState<string>("");
  const [period, setPeriod] = useState<Period>("tout");

  // Sort articles by name
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => a.nom.localeCompare(b.nom));
  }, [articles]);

  // Get selected article (default to first)
  const selectedArticle = useMemo(() => {
    if (articles.length === 0) return null;
    if (selectedRef) {
      return articles.find(a => a.ref === selectedRef) || articles[0];
    }
    return articles[0];
  }, [articles, selectedRef]);

  // Compute stats with injected now
  const stats = useMemo(() => {
    if (!selectedArticle) {
      return null;
    }
    const now = new Date();
    return computeProductStats({
      article: selectedArticle,
      movements: mouvements,
      period,
      now,
    });
  }, [selectedArticle, mouvements, period]);

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

      {articles.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
          <p className="text-sm text-gray-500">Aucun article</p>
        </div>
      ) : (
        <>
          {/* Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="article-select" className="text-sm font-medium text-gray-700">
                  Article
                </label>
                <select
                  id="article-select"
                  value={selectedArticle?.ref || ""}
                  onChange={(e) => setSelectedRef(e.target.value)}
                  className="h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                >
                  {sortedArticles.map(a => (
                    <option key={a.ref} value={a.ref}>
                      {a.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="period-select" className="text-sm font-medium text-gray-700">
                  Période
                </label>
                <select
                  id="period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as Period)}
                  className="h-9 px-3 rounded border border-gray-300 bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
                >
                  <option value="7j">7 derniers jours</option>
                  <option value="30j">30 derniers jours</option>
                  <option value="90j">90 derniers jours</option>
                  <option value="tout">Tout</option>
                </select>
              </div>
            </div>
          </div>

          {/* KPI Tiles */}
          {stats && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                {/* Stock actuel */}
                <div className="px-5 py-4">
                  <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                    {stats.stockActuel.toLocaleString("fr-FR")} {stats.unite}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Stock actuel</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Seuil : {selectedArticle.seuil.toLocaleString("fr-FR")}
                  </div>
                </div>

                {/* Entrées */}
                <div className="px-5 py-4">
                  <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                    {stats.entrees.toLocaleString("fr-FR")} {stats.unite}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Entrées</div>
                </div>

                {/* Sorties */}
                <div className="px-5 py-4">
                  <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                    {stats.sorties.toLocaleString("fr-FR")} {stats.unite}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Sorties</div>
                </div>

                {/* Conso moyenne */}
                <div className="px-5 py-4">
                  <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                    {stats.consoMoyenneJour.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} {stats.unite}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Conso. moyenne / jour</div>
                </div>

                {/* Autonomie */}
                <div className="px-5 py-4">
                  <div className="text-2xl font-semibold text-gray-900 tabular-nums">
                    {stats.autonomieJours === null
                      ? "—"
                      : stats.autonomieJours > 365
                      ? "> 365 j"
                      : `${Math.floor(stats.autonomieJours)} j`}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Autonomie estimée</div>
                </div>
              </div>

              {/* Note */}
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  {stats.nbMouvements === 0
                    ? "Aucun mouvement validé sur la période. "
                    : ""}
                  Basé sur les mouvements validés (date de création du mouvement).
                </p>
              </div>
            </div>
          )}
        </>
      )}

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

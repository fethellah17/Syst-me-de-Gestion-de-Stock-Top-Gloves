import { useState } from "react";
import { ClipboardCheck, Check, AlertTriangle, FileDown } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Toast } from "@/components/Toast";
import { generateInventoryPDF } from "@/lib/pdf-generator";

interface InventoryRow {
  key: string; // Unique key: `${articleId}-${emplacementNom}`
  articleId: number;
  ref: string;
  nom: string;
  emplacement: string;
  stockTheorique: number;
  isVerified: boolean;
}

const InventairePage = () => {
  const { articles, inventoryHistory, addInventoryRecord, addMouvement } = useData();
  
  // Flatten articles by emplacement: each Article-Emplacement pair becomes a row
  const flattenedRows: InventoryRow[] = articles.flatMap(article => {
    return article.inventory.map(location => {
      // DEBUG: Log the calculation for each row
      console.log(
        `[Inventaire] Article: ${article.nom} (${article.ref}), ` +
        `Emplacement: ${location.zone}, ` +
        `Stock Théorique (location.quantity): ${location.quantity}, ` +
        `Unit Sortie: ${article.uniteSortie}, ` +
        `Facteur Conversion: ${article.facteurConversion}`
      );
      
      return {
        key: `${article.id}-${location.zone}`,
        articleId: article.id,
        ref: article.ref,
        nom: article.nom,
        emplacement: location.zone,
        stockTheorique: location.quantity, // Already in exit unit (uniteSortie)
        isVerified: false,
      };
    });
  });

  // Local state for physical stock inputs: keyed by `${articleId}-${emplacementNom}`
  const [physicalStock, setPhysicalStock] = useState<Record<string, number | null>>({});
  
  // Track verified rows
  const [verifiedRows, setVerifiedRows] = useState<Set<string>>(new Set());
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const today = new Date().toLocaleDateString("fr-FR");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePhysique = (key: string, value: string) => {
    setPhysicalStock(prev => ({
      ...prev,
      [key]: value === "" ? null : Number(value),
    }));
  };

  const getEcart = (theorique: number, physique: number | null) => {
    if (physique === null) return null;
    return physique - theorique;
  };

  const completed = verifiedRows.size;

  const handleResetInventory = () => {
    // Reset physical stock inputs and verified rows for a new inventory session
    setPhysicalStock({});
    setVerifiedRows(new Set());
    showToast("Tableau réinitialisé pour une nouvelle session d'inventaire", "success");
  };

  const handleDownloadInventoryPDF = async (record: typeof inventoryHistory[0]) => {
    try {
      await generateInventoryPDF(record);
      showToast("PDF généré avec succès", "success");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Erreur lors de la génération du PDF", "error");
    }
  };

  const handleValidateAll = () => {
    let validatedCount = 0;
    const now = new Date();
    const dateStr = now.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+)/, "$3-$2-$1 $4:$5");

    // Loop through all rows
    flattenedRows.forEach((row) => {
      // Skip if already verified
      if (verifiedRows.has(row.key)) {
        return;
      }

      // Skip if no physical stock entered
      const physique = physicalStock[row.key];
      if (physique === null || physique === undefined) {
        return;
      }

      // Get article
      const article = articles.find(a => a.id === row.articleId);
      if (!article) return;

      // Calculate écart
      const ecart = getEcart(row.stockTheorique, physique);
      if (ecart === null) return;

      // Add to inventory history
      addInventoryRecord({
        dateHeure: dateStr,
        article: row.nom,
        ref: row.ref,
        emplacement: row.emplacement,
        stockTheorique: row.stockTheorique,
        stockPhysique: physique,
        ecart: ecart,
        uniteSortie: article.uniteSortie,
      });

      // Create Ajustement movement if écart is not zero
      if (ecart !== 0) {
        const typeAjustement = ecart > 0 ? "Surplus" : "Manquant";
        const absEcart = Math.abs(ecart);
        
        addMouvement({
          date: dateStr,
          article: row.nom,
          ref: row.ref,
          type: "Ajustement",
          qte: absEcart,
          qteOriginale: absEcart,
          uniteUtilisee: article.uniteSortie,
          uniteSortie: article.uniteSortie,
          lotNumber: `INV-${Date.now()}-${validatedCount}`,
          emplacementSource: ecart < 0 ? row.emplacement : undefined,
          emplacementDestination: ecart > 0 ? row.emplacement : "Ajustement Inventaire",
          operateur: "Système (Inventaire)",
          typeAjustement: typeAjustement,
          motif: `Ajustement inventaire: Écart de ${ecart > 0 ? '+' : ''}${ecart} ${article.uniteSortie}`,
        });
      }

      // Mark row as verified
      setVerifiedRows(prev => new Set([...prev, row.key]));
      validatedCount++;
    });

    // Show success message
    if (validatedCount > 0) {
      showToast(`Tous les emplacements remplis ont été validés et ajustés avec succès ! (${validatedCount} emplacements)`, "success");
    } else {
      showToast("Aucun emplacement à valider. Veuillez remplir au moins un champ Stock Physique.", "error");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground">Inventaire Quotidien</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Date: {today}</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {completed}/{flattenedRows.length} emplacements vérifiés
          </span>
          <button
            onClick={handleValidateAll}
            disabled={completed === flattenedRows.length}
            className={`h-9 px-4 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
              completed === flattenedRows.length
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-success text-success-foreground hover:opacity-90"
            }`}
          >
            <Check className="w-4 h-4" />
            Valider Tout le Inventaire
          </button>
          {completed === flattenedRows.length && flattenedRows.length > 0 && (
            <button
              onClick={handleResetInventory}
              className="h-9 px-4 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center gap-2 bg-info text-info-foreground hover:opacity-90 transition-all w-full sm:w-auto"
            >
              <Check className="w-4 h-4" />
              Nouvelle Session
            </button>
          )}
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emplacement</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Théorique</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Physique</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Écart</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</th>
              </tr>
            </thead>
            <tbody>
              {flattenedRows.map((row) => {
                const isVerified = verifiedRows.has(row.key);
                const physique = physicalStock[row.key];
                const ecart = getEcart(row.stockTheorique, physique ?? null);
                
                return (
                  <tr key={row.key} className={`border-b border-border/50 ${isVerified ? "bg-success/5" : ""}`}>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="font-medium text-foreground text-xs sm:text-sm">{row.nom}</span>
                      <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-mono">{row.ref}</span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground font-mono text-[10px] sm:text-xs">{row.emplacement}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-mono font-semibold text-foreground text-xs sm:text-sm">{row.stockTheorique.toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={physique ?? ""}
                        onChange={(e) => updatePhysique(row.key, e.target.value)}
                        placeholder="—"
                        disabled={isVerified}
                        className={`w-16 sm:w-24 max-w-[100px] h-7 sm:h-8 mx-auto block text-center rounded-md border bg-background text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          isVerified ? "bg-success/10 border-success/50 cursor-not-allowed" : ""
                        }`}
                      />
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      {ecart !== null ? (
                        <span className={`font-mono font-semibold text-xs sm:text-sm ${ecart === 0 ? "text-success" : ecart > 0 ? "text-info" : "text-danger"}`}>
                          {ecart > 0 ? "+" : ""}{ecart}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs sm:text-sm">—</span>
                      )}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      {isVerified ? (
                        <div className="flex items-center justify-center gap-1">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                          <span className="text-[10px] sm:text-xs text-success font-medium hidden sm:inline">Vérifié</span>
                        </div>
                      ) : physique === null || physique === undefined ? (
                        <span className="text-muted-foreground text-[10px] sm:text-xs">En attente</span>
                      ) : ecart === 0 ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success mx-auto" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-warning mx-auto" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historique des Inventaires Passés */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="border-b bg-muted/50 p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            Historique des Inventaires Passés ({inventoryHistory.length} entrées)
          </h3>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date et Heure</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Emplacement</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Théorique</th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Physique</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">Écart</th>
                <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wide">PDF</th>
              </tr>
            </thead>
            <tbody>
              {inventoryHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 sm:py-8 px-4 text-center text-muted-foreground text-xs sm:text-sm">
                    Aucun inventaire enregistré pour le moment
                  </td>
                </tr>
              ) : (
                [...inventoryHistory].reverse().map((record) => (
                  <tr key={record.id} className="border-b border-border/50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 font-mono text-[10px] sm:text-xs text-muted-foreground">{record.dateHeure}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="font-medium text-foreground text-xs sm:text-sm">{record.article}</span>
                      <span className="block text-[9px] sm:text-[10px] text-muted-foreground font-mono">{record.ref}</span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-muted-foreground font-mono text-[10px] sm:text-xs">{record.emplacement}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-mono font-semibold text-foreground text-xs sm:text-sm">{record.stockTheorique.toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-mono font-semibold text-foreground text-xs sm:text-sm">{record.stockPhysique.toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      <span className={`font-mono font-semibold text-xs sm:text-sm ${record.ecart === 0 ? "text-success" : record.ecart > 0 ? "text-info" : "text-danger"}`}>
                        {record.ecart > 0 ? "+" : ""}{record.ecart}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                      <button
                        onClick={() => handleDownloadInventoryPDF(record)}
                        className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md hover:bg-muted transition-colors"
                        title="Télécharger le PDF"
                      >
                        <FileDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default InventairePage;

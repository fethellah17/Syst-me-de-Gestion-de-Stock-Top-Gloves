import { useState, useMemo } from "react";
import { Shield, CheckCircle2, Package, MapPin } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const ControleQualitePage = () => {
  const { mouvements, articles, approveQualityControl } = useData();
  const [activeTab, setActiveTab] = useState<"entree" | "sortie">("entree");
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);
  const [selectedMouvementId, setSelectedMouvementId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  
  const [qcFormData, setQCFormData] = useState({
    etatArticles: "Conforme" as "Conforme" | "Non-conforme",
    unitesDefectueuses: 0,
    rejectCompletely: false,
    controleur: "",
  });

  // Filter movements pending QC validation
  const pendingEntrees = useMemo(() => {
    return mouvements.filter(m => 
      m.type === "Entrée" && 
      m.statut === "En attente de validation Qualité"
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [mouvements]);

  const pendingSorties = useMemo(() => {
    return mouvements.filter(m => 
      m.type === "Sortie" && 
      m.statut === "En attente de validation Qualité"
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [mouvements]);

  const handleOpenQCModal = (id: number) => {
    setSelectedMouvementId(id);
    setQCFormData({
      etatArticles: "Conforme",
      unitesDefectueuses: 0,
      rejectCompletely: false,
      controleur: "",
    });
    setIsQCModalOpen(true);
  };

  const handleCloseQCModal = () => {
    setIsQCModalOpen(false);
    setSelectedMouvementId(null);
  };

  const handleSubmitQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcFormData.controleur) {
      setToast({ message: "Veuillez renseigner le nom du contrôleur", type: "error" });
      return;
    }

    if (selectedMouvementId) {
      const mouvement = mouvements.find(m => m.id === selectedMouvementId);
      const article = mouvement ? articles.find(a => a.ref === mouvement.ref) : null;
      
      if (!mouvement || !article) {
        setToast({ message: "Erreur: Mouvement ou article introuvable", type: "error" });
        return;
      }
      
      // Validation for Sortie: Check stock availability
      if (mouvement.type === "Sortie") {
        const totalQtyToDeduct = mouvement.qte;
        if (article.stock < totalQtyToDeduct) {
          setToast({ 
            message: `Impossible d'approuver: stock insuffisant. Stock actuel: ${article.stock}, quantité requise: ${totalQtyToDeduct}`, 
            type: "error" 
          });
          return;
        }
      }
      
      // Calculate quantities
      const unitesDefectueuses = qcFormData.rejectCompletely ? mouvement.qte : qcFormData.unitesDefectueuses;
      const validQty = qcFormData.etatArticles === "Non-conforme" 
        ? mouvement.qte - unitesDefectueuses 
        : mouvement.qte;
      
      console.log(`[QC MODAL] Submitting approval for movement ${selectedMouvementId}`);
      console.log(`  Type: ${mouvement.type}`);
      console.log(`  Current Stock: ${article.stock}`);
      console.log(`  Quantity: ${mouvement.qte}`);
      console.log(`  Valid Quantity: ${validQty}`);
      console.log(`  Defective Units: ${unitesDefectueuses}`);
      
      // Call the context approval function - it handles ALL stock updates
      // This will update the movement status to "Terminé" which triggers
      // the ArticlesPage to recalculate stock dynamically from movements
      approveQualityControl(selectedMouvementId, qcFormData.controleur, qcFormData.etatArticles, unitesDefectueuses);
      
      // Generate success message
      let message = "";
      if (mouvement.type === "Sortie") {
        if (qcFormData.etatArticles === "Non-conforme") {
          if (qcFormData.rejectCompletely) {
            // 100% defective - all waste
            message = `✓ Sortie traitée : ${mouvement.qte} unités retirées du stock (Rebut Total - 100% défectueux)`;
          } else if (unitesDefectueuses > 0) {
            // Partial defective
            message = `✓ Sortie traitée : ${mouvement.qte} unités retirées du stock (${validQty} valides, ${unitesDefectueuses} défectueuses)`;
          } else {
            // Non-conforme but 0 defective (edge case)
            message = `✓ Sortie traitée : ${mouvement.qte} unités retirées du stock`;
          }
        } else {
          // All conform
          message = `✓ Sortie validée : ${mouvement.qte} unités retirées du stock (Conforme)`;
        }
      } else {
        // Entrée
        message = `✓ Entrée validée : ${validQty} unités ajoutées au stock`;
      }
      
      setToast({ message, type: "success" });
      handleCloseQCModal();
    }
  };

  const renderMovementRow = (mouvement: typeof mouvements[0]) => {
    const article = articles.find(a => a.ref === mouvement.ref);
    if (!article) return null;

    return (
      <tr key={mouvement.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
        <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
          {format(new Date(mouvement.date), "dd/MM/yyyy HH:mm", { locale: fr })}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <div>
              <div className="font-medium text-foreground">{mouvement.article}</div>
              <div className="text-xs text-muted-foreground font-mono">{mouvement.ref}</div>
            </div>
          </div>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="font-mono font-semibold text-foreground">
            {mouvement.qte.toLocaleString()} <span className="text-xs text-muted-foreground">{article.uniteSortie}</span>
          </span>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {mouvement.type === "Entrée" ? mouvement.emplacementDestination : mouvement.emplacementSource}
          </div>
        </td>
        <td className="py-3 px-4 text-xs text-muted-foreground">{mouvement.operateur}</td>
        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{mouvement.lotNumber}</td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenQCModal(mouvement.id)}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valider
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Contrôle de Qualité
          </h2>
          <p className="text-sm text-muted-foreground">
            Validation des entrées et sorties nécessitant un contrôle qualité
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-md border overflow-hidden bg-card">
        <button
          onClick={() => setActiveTab("entree")}
          className={`flex-1 h-10 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "entree" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Package className="w-4 h-4" />
          Contrôles à l'Entrée
          {pendingEntrees.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-warning text-warning-foreground text-xs font-bold">
              {pendingEntrees.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("sortie")}
          className={`flex-1 h-10 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            activeTab === "sortie" 
              ? "bg-primary text-primary-foreground" 
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Shield className="w-4 h-4" />
          Contrôles à la Sortie
          {pendingSorties.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-warning text-warning-foreground text-xs font-bold">
              {pendingSorties.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {activeTab === "entree" ? (
          pendingEntrees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opérateur</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">N° Lot</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEntrees.map(renderMovementRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucune entrée en attente de validation</p>
            </div>
          )
        ) : (
          pendingSorties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Opérateur</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">N° Lot</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSorties.map(renderMovementRow)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Aucune sortie en attente de validation</p>
            </div>
          )
        )}
      </div>

      {/* QC Approval Modal - Consolidated UI */}
      {selectedMouvementId && (
          <Modal isOpen={isQCModalOpen} onClose={handleCloseQCModal} title="Contrôle Qualité">
            <form onSubmit={handleSubmitQC} className="space-y-4">
              {selectedMouvementId && (() => {
                const mouvement = mouvements.find(m => m.id === selectedMouvementId);
                const article = mouvement ? articles.find(a => a.ref === mouvement.ref) : null;
            
            // Calculate display values
            const unitesDefectueuses = qcFormData.rejectCompletely ? mouvement.qte : qcFormData.unitesDefectueuses;
            const validQty = qcFormData.etatArticles === "Non-conforme" 
              ? (mouvement?.qte || 0) - unitesDefectueuses 
              : (mouvement?.qte || 0);
            const defectiveQty = qcFormData.etatArticles === "Non-conforme" ? unitesDefectueuses : 0;

            return article && mouvement ? (
              <div className="space-y-4">
                {/* Movement Info */}
                <div className="p-3 bg-muted/50 rounded-md border border-border/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Type:</span>
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded ${
                      mouvement.type === "Entrée" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}>
                      {mouvement.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Article:</span>
                    <span className="text-sm font-semibold text-foreground">{article.nom} ({article.ref})</span>
                  </div>
                  {mouvement.type === "Entrée" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Stock Actuel:</span>
                        <span className="text-sm font-semibold text-foreground">{article.stock.toLocaleString()} {article.unite}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">Quantité à Ajouter:</span>
                        <span className="text-sm font-semibold text-warning">{mouvement.qte.toLocaleString()} {article.unite}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Stock Actuel:</span>
                      <span className="text-sm font-semibold text-foreground">{article.stock.toLocaleString()} {article.unite}</span>
                    </div>
                  )}
                </div>

                {/* État des Articles Selection - ONLY Quality Choice */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">État des Articles</label>
                  <div className="flex gap-2">
                    {(["Conforme", "Non-conforme"] as const).map(etat => (
                      <button
                        key={etat}
                        type="button"
                        onClick={() => setQCFormData({ 
                          ...qcFormData, 
                          etatArticles: etat, 
                          unitesDefectueuses: 0,
                          rejectCompletely: false 
                        })}
                        className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                          qcFormData.etatArticles === etat
                            ? etat === "Conforme" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {etat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Content Based on État */}
                {qcFormData.etatArticles === "Conforme" ? (
                  // CONFORME WORKFLOW
                  <div className="space-y-3">
                    {/* Summary */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-800">Unités Valides:</span>
                        <span className="text-sm font-semibold text-green-900">{mouvement.qte.toLocaleString()} {article.unite}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-green-800">Unités Défectueuses:</span>
                        <span className="text-sm font-semibold text-green-900">0 {article.unite}</span>
                      </div>
                      {mouvement.type === "Entrée" && (
                        <div className="flex items-center justify-between pt-2 border-t border-green-200">
                          <span className="text-xs font-medium text-green-800">Nouveau Stock (Prévu):</span>
                          <span className="text-sm font-semibold text-green-900">{(article.stock + mouvement.qte).toLocaleString()} {article.unite}</span>
                        </div>
                      )}
                    </div>

                    {/* Info Message */}
                    {mouvement.type === "Sortie" ? (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-800 font-medium">
                          ✓ Les {mouvement.qte} unités seront déduites du stock (Conforme)
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-800 font-medium">
                          ✓ Les {mouvement.qte} unités valides seront ajoutées au stock après approbation
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  // NON-CONFORME WORKFLOW
                  <div className="space-y-3">
                    {/* Defective Units Input */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Nombre d'unités défectueuses
                      </label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={qcFormData.rejectCompletely ? mouvement.qte : (qcFormData.unitesDefectueuses === 0 ? '' : qcFormData.unitesDefectueuses)}
                        onChange={(e) => setQCFormData({ ...qcFormData, unitesDefectueuses: Number(e.target.value) || 0 })}
                        disabled={qcFormData.rejectCompletely}
                        className={`w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                          qcFormData.rejectCompletely ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        min="0"
                        max={mouvement.qte}
                      />
                    </div>

                    {/* Reject Completely Checkbox */}
                    <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <input
                        type="checkbox"
                        id="rejectCompletely"
                        checked={qcFormData.rejectCompletely}
                        onChange={(e) => setQCFormData({ 
                          ...qcFormData, 
                          rejectCompletely: e.target.checked,
                          unitesDefectueuses: e.target.checked ? mouvement.qte : 0
                        })}
                        className="w-4 h-4 rounded border-border cursor-pointer"
                      />
                      <label htmlFor="rejectCompletely" className="text-sm font-medium text-red-800 cursor-pointer flex-1">
                        Rejeter complètement le mouvement
                      </label>
                    </div>

                    {/* Summary */}
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-orange-800">Unités Valides:</span>
                        <span className="text-sm font-semibold text-orange-900">{validQty.toLocaleString()} {article.unite}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-orange-800">Unités Défectueuses (Perte):</span>
                        <span className="text-sm font-semibold text-orange-900">{defectiveQty.toLocaleString()} {article.unite}</span>
                      </div>
                      {mouvement.type === "Entrée" && (
                        <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                          <span className="text-xs font-medium text-orange-800">Nouveau Stock (Prévu):</span>
                          <span className="text-sm font-semibold text-orange-900">{(article.stock + validQty).toLocaleString()} {article.unite}</span>
                        </div>
                      )}
                    </div>

                    {/* Info Message */}
                    {mouvement.type === "Sortie" ? (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-800 font-medium">
                          ⚠️ Les {mouvement.qte} unités seront déduites du stock (incluant les défectueuses)
                        </p>
                        {defectiveQty > 0 && (
                          <p className="text-blue-700 mt-1">
                            Les {defectiveQty} unités défectueuses sont une perte permanente.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-800 font-medium">
                          ℹ️ Seules les {validQty} unités valides seront ajoutées au stock après approbation
                        </p>
                        {defectiveQty > 0 && (
                          <p className="text-blue-700 mt-1">
                            Les {defectiveQty} unités défectueuses seront rejetées (perte permanente).
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Contrôleur Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Nom du Contrôleur</label>
                  <input
                    type="text"
                    value={qcFormData.controleur}
                    onChange={(e) => setQCFormData({ ...qcFormData, controleur: e.target.value })}
                    className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Nom du contrôleur"
                    required
                  />
                </div>

                {/* Bottom Action Buttons - ONLY TWO BUTTONS */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseQCModal}
                    className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Confirmer le {mouvement.type}
                  </button>
                </div>
              </div>
            ) : null;
          })()}
            </form>
          </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ControleQualitePage;

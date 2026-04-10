import { useState, useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Plus } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { MovementTable } from "@/components/MovementTable";
import { BulkMovementModal } from "@/components/BulkMovementModal";
import { InspectionModal, type InspectionData } from "@/components/InspectionModal";
import { format } from "date-fns";

const MouvementsPage = () => {
  const { mouvements, articles, emplacements, addMouvement, updateArticle, deleteMouvement, getArticleLocations, approveQualityControl, rejectQualityControl, processTransfer, recalculateAllOccupancies } = useData();
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Entrée" | "Sortie" | "Transfert">("all");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isQCModalOpen, setIsQCModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [inspectionMouvementId, setInspectionMouvementId] = useState<string | null>(null);
  const [qcMouvementId, setQCMouvementId] = useState<string | null>(null);
  const [rejectMouvementId, setRejectMouvementId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [duplicateData, setDuplicateData] = useState<any>(null);
  const [qcFormData, setQCFormData] = useState({
    etatArticles: "Conforme" as "Conforme" | "Non-conforme",
    unitesDefectueuses: 0,
    controleur: "",
    decision: "Approuver" as "Approuver" | "Rejeter",
    raison: "",
  });
  const [rejectFormData, setRejectFormData] = useState({
    controleur: "",
    raison: "",
  });

  // Data Unification: Single source of truth for all movements
  const combinedMovements = useMemo(() => {
    return [...mouvements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [mouvements]);

  const filtered = combinedMovements
    .filter((m) => {
      // STRICT DATA SEPARATION: Exclude Ajustement type
      // Ajustement records are isolated in the Inventaire page history
      if (m.type === "Ajustement") {
        return false;
      }
      
      // Filter by selected article (if any)
      const matchArticle = selectedArticleId === "" || m.ref === selectedArticleId;
      // Filter by movement type
      const matchType = typeFilter === "all" || m.type === typeFilter;
      return matchArticle && matchType;
    });

  const handleOpenQCModal = (id: string) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement) return;
    
    setQCMouvementId(id);
    setQCFormData({
      etatArticles: "Conforme",
      unitesDefectueuses: 0,
      controleur: "",
      decision: "Approuver",
      raison: "",
    });
    setIsQCModalOpen(true);
  };

  const handleOpenRejectModal = (id: string) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement) return;
    
    setRejectMouvementId(id);
    setRejectFormData({
      controleur: "",
      raison: "",
    });
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectMouvementId(null);
  };

  const handleCloseQCModal = () => {
    setIsQCModalOpen(false);
    setQCMouvementId(null);
  };

  const handleOpenInspectionModal = (id: string) => {
    const mouvement = mouvements.find(m => m.id === id);
    if (!mouvement || mouvement.type !== "Entrée") return;
    
    setInspectionMouvementId(id);
    setIsInspectionModalOpen(true);
  };

  const handleCloseInspectionModal = () => {
    setIsInspectionModalOpen(false);
    setInspectionMouvementId(null);
  };

  const handleInspectionApprove = (data: InspectionData) => {
    if (!inspectionMouvementId) return;

    const mouvement = mouvements.find(m => m.id === inspectionMouvementId);
    if (!mouvement) return;

    // Check if this is a total refusal
    if (data.refusTotalMotif) {
      // Total refusal
      approveQualityControl(
        inspectionMouvementId,
        data.controleur,
        "Non-conforme",
        0,
        0,
        data.refusTotalMotif,
        data.refusTotalMotif,
        data.verificationPoints
      );

      setToast({
        message: `✗ Mouvement refusé complètement (${mouvement.qte} ${mouvement.uniteSortie})`,
        type: "success"
      });
    } else {
      // Normal approval
      approveQualityControl(
        inspectionMouvementId,
        data.controleur,
        data.qteDefectueuse > 0 ? "Non-conforme" : "Conforme",
        data.qteDefectueuse,
        data.qteValide,
        undefined,
        data.noteControle,
        data.verificationPoints
      );

      setToast({
        message: `✓ Stock mis à jour avec succès (Qté: ${data.qteValide} ${mouvement.uniteSortie})`,
        type: "success"
      });
    }

    // Recalculate occupancies
    recalculateAllOccupancies();

    // Close modal
    handleCloseInspectionModal();
  };

  const handleSubmitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectFormData.controleur) {
      setToast({ message: "Veuillez renseigner le nom du contrôleur", type: "error" });
      return;
    }

    if (!rejectFormData.raison) {
      setToast({ message: "Veuillez renseigner la raison du rejet", type: "error" });
      return;
    }

    if (rejectMouvementId) {
      rejectQualityControl(rejectMouvementId, rejectFormData.controleur, rejectFormData.raison);
      setToast({ message: "✗ Sortie rejetée. Opération annulée.", type: "success" });
      handleCloseRejectModal();
    }
  };

  const handleSubmitQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcFormData.controleur) {
      setToast({ message: "Veuillez renseigner le nom du contrôleur", type: "error" });
      return;
    }

    if (qcFormData.decision === "Rejeter" && !qcFormData.raison) {
      setToast({ message: "Veuillez renseigner la raison du rejet", type: "error" });
      return;
    }

    if (qcMouvementId) {
      const mouvement = mouvements.find(m => m.id === qcMouvementId);
      const article = mouvement ? articles.find(a => a.ref === mouvement.ref) : null;
      
      if (qcFormData.decision === "Approuver") {
        if (article && mouvement) {
          const totalQtyToDeduct = mouvement.qte;
          
          if (article.stock < totalQtyToDeduct) {
            setToast({ 
              message: `Impossible d'approuver: stock insuffisant. Stock actuel: ${article.stock}, quantité requise: ${totalQtyToDeduct}`, 
              type: "error" 
            });
            return;
          }
        }
        
        approveQualityControl(qcMouvementId, qcFormData.controleur, qcFormData.etatArticles, qcFormData.unitesDefectueuses);
        setToast({ message: "✓ Qualité validée. Stock mis à jour avec succès.", type: "success" });
      } else {
        rejectQualityControl(qcMouvementId, qcFormData.controleur, qcFormData.raison);
        setToast({ message: "✗ Sortie rejetée. Opération annulée.", type: "success" });
      }
      
      recalculateAllOccupancies();
      handleCloseQCModal();
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteMouvement(deleteConfirmId);
      setToast({ message: "Mouvement supprimé avec succès", type: "success" });
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmId(null);
      recalculateAllOccupancies();
    }
  };

  const handleDuplicate = (mouvement: any) => {
    // Find the article to get its details
    const article = articles.find(a => a.ref === mouvement.ref);
    if (!article) {
      setToast({ message: "Article non trouvé", type: "error" });
      return;
    }

    console.log(`[DUPLICATE] Mouvement:`, mouvement);
    console.log(`[DUPLICATE] Article:`, article);

    // Prepare the duplicate data for the modal
    const duplicateItem = {
      id: "1",
      articleId: article.id.toString(),
      quantity: mouvement.qteOriginale || mouvement.qte,
      selectedUnit: mouvement.uniteUtilisee || article.uniteEntree,
      emplacementSource: mouvement.emplacementSource || "",
      emplacementDestination: mouvement.emplacementDestination || "",
      lotNumber: mouvement.lotNumber || "",
      lotDate: mouvement.lotDate ? new Date(mouvement.lotDate) : undefined,
      qc_status: "pending" as const,
    };

    console.log(`[DUPLICATE] Item prepared:`, duplicateItem);

    const duplicatePayload = {
      movementType: mouvement.type,
      items: [duplicateItem],
    };

    console.log(`[DUPLICATE] Payload:`, duplicatePayload);

    setDuplicateData(duplicatePayload);
    setIsBulkModalOpen(true);
  };

  // ============================================================================
  // BULK MOVEMENT HANDLER - STRICT SMART MERGE LOGIC
  // ============================================================================
  const handleBulkMovementSubmit = (
    items: any[],
    movementType: "Entrée" | "Sortie" | "Transfert",
    operateur: string
  ) => {
    const now = new Date();
    const dateStr = now.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, "$3-$2-$1 $4:$5:$6");

    // Helper: Convert quantity to exit unit
    const convertToExitUnit = (quantity: number, unit: string, article: any): number => {
      if (unit === article.uniteEntree) {
        const rawQty = quantity * article.facteurConversion;
        const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
        const isWholeItem = wholeItemUnits.some(u => article.uniteSortie.toLowerCase().includes(u));
        return isWholeItem ? Math.round(rawQty) : parseFloat(rawQty.toFixed(3));
      } else {
        const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
        const isWholeItem = wholeItemUnits.some(u => article.uniteSortie.toLowerCase().includes(u));
        return isWholeItem ? Math.round(quantity) : parseFloat(quantity.toFixed(3));
      }
    };

    // Step 1: Add all mouvement records
    items.forEach(item => {
      const articleId = parseInt(item.articleId);
      const article = articles.find(a => a.id === articleId);
      if (!article) return;

      const qty = Number(item.quantity) || 0;
      if (qty <= 0) return;

      const qtyInExitUnit = convertToExitUnit(qty, item.selectedUnit, article);

      if (movementType === "Entrée") {
        addMouvement({
          date: dateStr,
          article: article.nom,
          ref: article.ref,
          type: "Entrée",
          qte: qtyInExitUnit,
          qteOriginale: qty,
          uniteUtilisee: item.selectedUnit,
          uniteSortie: article.uniteSortie,
          lotNumber: item.lotNumber,
          lotDate: item.lotDate ? format(item.lotDate, "yyyy-MM-dd") : "",
          emplacementDestination: item.emplacementDestination,
          commentaire: item.commentaire || "",
          operateur: operateur,
        });
      } else if (movementType === "Sortie") {
        addMouvement({
          date: dateStr,
          article: article.nom,
          ref: article.ref,
          type: "Sortie",
          qte: qtyInExitUnit,
          qteOriginale: qty,
          uniteUtilisee: item.selectedUnit,
          uniteSortie: article.uniteSortie,
          lotNumber: item.lotNumber,
          lotDate: item.lotDate ? format(item.lotDate, "yyyy-MM-dd") : "",
          emplacementSource: item.emplacementSource,
          emplacementDestination: item.emplacementDestination,
          commentaire: item.commentaire || "",
          operateur: operateur,
        });
      } else if (movementType === "Transfert") {
        const transferResult = processTransfer(
          article.ref,
          item.emplacementSource,
          qtyInExitUnit,
          item.emplacementDestination
        );

        if (transferResult.success) {
          addMouvement({
            date: dateStr,
            article: article.nom,
            ref: article.ref,
            type: "Transfert",
            qte: qtyInExitUnit,
            qteOriginale: qty,
            uniteUtilisee: item.selectedUnit,
            uniteSortie: article.uniteSortie,
            lotNumber: item.lotNumber,
            lotDate: item.lotDate ? format(item.lotDate, "yyyy-MM-dd") : "",
            emplacementSource: item.emplacementSource,
            emplacementDestination: item.emplacementDestination,
            commentaire: item.commentaire || "",
            operateur: operateur,
          });
        }
      }
    });

    // Step 2: SMART MERGE - Update articles state with strict zone logic
    // CRITICAL: SKIP this step entirely for Entrée AND Sortie movements with "En attente" status
    // Stock must NOT be updated for pending movements - it will be updated only upon QC approval
    if (movementType !== "Entrée" && movementType !== "Sortie") {
      // Group items by article ID
      const itemsByArticle: Record<number, any[]> = {};
      items.forEach(item => {
        const articleId = parseInt(item.articleId);
        if (!itemsByArticle[articleId]) {
          itemsByArticle[articleId] = [];
        }
        itemsByArticle[articleId].push(item);
      });

      // Update each affected article
      Object.entries(itemsByArticle).forEach(([articleIdStr, articleItems]) => {
        const articleId = parseInt(articleIdStr);
        const article = articles.find(a => a.id === articleId);
        if (!article) return;

        // Create a NEW copy of the inventory array
        let updatedInventory = article.inventory.map(inv => ({
          zone: inv.zone,
          quantity: Number(inv.quantity)
        }));

        let totalStockChange = 0;

        // Process each movement for this article
        articleItems.forEach(item => {
          const qty = Number(item.quantity) || 0;
          if (qty <= 0) return;

          const qtyInExitUnit = convertToExitUnit(qty, item.selectedUnit, article);

          // CRITICAL: Only Transfert reaches here (Sortie is blocked above)
          if (movementType === "Transfert") {
            // TRANSFERT: SUBTRACT from source AND ADD to destination
            const sourceZone = item.emplacementSource;
            const destZone = item.emplacementDestination;

            // Subtract from source
            const sourceIndex = updatedInventory.findIndex(inv => inv.zone === sourceZone);
            if (sourceIndex >= 0) {
              const currentQty = Number(updatedInventory[sourceIndex].quantity);
              const newQty = Math.max(0, currentQty - Number(qtyInExitUnit));
              updatedInventory[sourceIndex].quantity = newQty;
              console.log(`[SMART MERGE TRANSFERT] Source ${sourceZone}: ${currentQty} - ${qtyInExitUnit} = ${newQty}`);
            }

            // Add to destination
            const destIndex = updatedInventory.findIndex(inv => inv.zone === destZone);
            if (destIndex >= 0) {
              updatedInventory[destIndex].quantity = Number(updatedInventory[destIndex].quantity) + Number(qtyInExitUnit);
              console.log(`[SMART MERGE TRANSFERT] Dest ${destZone}: +${qtyInExitUnit} → ${updatedInventory[destIndex].quantity}`);
            } else {
              updatedInventory.push({ zone: destZone, quantity: Number(qtyInExitUnit) });
              console.log(`[SMART MERGE TRANSFERT] Dest ${destZone} is NEW: +${qtyInExitUnit}`);
            }
          }
        });

        // Remove zones with 0 quantity
        updatedInventory = updatedInventory.filter(l => Number(l.quantity) > 0);

        // Calculate new total stock
        const newTotalStock = Math.max(0, article.stock + totalStockChange);

        console.log(`[SMART MERGE FINAL] ${article.nom}: Stock ${article.stock} → ${newTotalStock}, Zones: ${updatedInventory.map(z => `${z.zone}(${z.quantity})`).join(', ')}`);

        // Update the article with the new inventory and stock
        updateArticle(articleId, {
          ...article,
          stock: newTotalStock,
          inventory: updatedInventory
        });
      });
    } else {
      // For Entrée and Sortie movements: ZERO stock updates
      // Stock will be updated only upon QC approval
      console.log(`[PENDING QC] Step 2 SKIPPED - Stock will NOT be updated until QC approval`);
    }

    recalculateAllOccupancies();

    const totalItems = items.length;
    const message = movementType === "Sortie"
      ? `✓ ${totalItems} sortie(s) enregistrée(s) en attente de validation qualité.`
      : movementType === "Transfert"
      ? `✓ ${totalItems} transfert(s) effectué(s) avec succès.`
      : `✓ ${totalItems} entrée(s) enregistrée(s) en attente de validation qualité.`;
    
    setToast({ message, type: "success" });
    setIsBulkModalOpen(false);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "Entrée":
        return <ArrowDownToLine className="w-3 h-3" />;
      case "Sortie":
        return <ArrowUpFromLine className="w-3 h-3" />;
      case "Transfert":
        return <ArrowRightLeft className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Mouvements</h2>
          <p className="text-sm text-muted-foreground">Gestion des entrées, sorties et transferts</p>
        </div>
        <button
          onClick={() => {
            setDuplicateData(null);
            setIsBulkModalOpen(true);
          }}
          className="hidden md:flex h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nouveau Mouvement
        </button>
      </div>

      {/* Filters - Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* Article Selector */}
          <div className="w-full">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Article</label>
            <select
              value={selectedArticleId}
              onChange={(e) => setSelectedArticleId(e.target.value)}
              className="w-full h-10 px-3 rounded-md border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="">Tous les articles</option>
              {articles.map((article) => (
                <option key={article.id} value={article.ref}>
                  {article.nom} ({article.ref})
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type Tabs */}
          <div className="w-full">
            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Type de Mouvement</label>
            <div className="flex rounded-md border overflow-x-auto md:overflow-visible">
              {(["all", "Entrée", "Sortie", "Transfert"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`h-10 px-4 text-xs font-medium transition-colors whitespace-nowrap flex-1 ${
                    typeFilter === t ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {t === "all" ? "Tous" : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <MovementTable 
          movements={filtered}
          articles={articles}
          onDuplicate={handleDuplicate}
          onQualityControl={handleOpenQCModal}
          onReject={handleOpenRejectModal}
          onInspect={handleOpenInspectionModal}
          showActions={true}
          compact={false}
        />
      </div>

      {/* Bulk Movement Modal */}
      <BulkMovementModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setDuplicateData(null);
        }}
        articles={articles}
        emplacements={emplacements}
        getArticleLocations={getArticleLocations}
        getArticleStockByLocation={() => 0}
        onSubmit={handleBulkMovementSubmit}
        initialData={duplicateData}
      />

      {/* Quality Control Modal */}
      <Modal isOpen={isQCModalOpen} onClose={handleCloseQCModal} title="Contrôle Qualité - Sortie">
        <form onSubmit={handleSubmitQC} className="space-y-4">
          {qcMouvementId && (() => {
            const mouvement = mouvements.find(m => m.id === qcMouvementId);
            const article = mouvement ? articles.find(a => a.ref === mouvement.ref) : null;

            return article && mouvement ? (
              <div className="p-3 bg-muted/50 rounded-md border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Article:</span>
                  <span className="text-sm font-semibold text-foreground">{article.nom} ({article.ref})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Quantité:</span>
                  <span className="text-sm font-semibold text-foreground">{mouvement.qte.toLocaleString()} {article.uniteSortie}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Opérateur:</span>
                  <span className="text-sm font-semibold text-foreground">{mouvement.operateur}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Date:</span>
                  <span className="text-sm font-mono text-foreground">{mouvement.date}</span>
                </div>
              </div>
            ) : null;
          })()}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">État des Articles</label>
            <div className="flex gap-2">
              {(["Conforme", "Non-conforme"] as const).map(etat => (
                <button
                  key={etat}
                  type="button"
                  onClick={() => setQCFormData({ ...qcFormData, etatArticles: etat })}
                  className={`flex-1 h-9 rounded-md text-sm font-medium transition-colors ${
                    qcFormData.etatArticles === etat
                      ? etat === "Conforme" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {etat}
                </button>
              ))}
            </div>
          </div>

          {qcFormData.etatArticles === "Non-conforme" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unités Défectueuses</label>
              <input
                type="number"
                value={qcFormData.unitesDefectueuses}
                onChange={(e) => setQCFormData({ ...qcFormData, unitesDefectueuses: Number(e.target.value) || 0 })}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                min="0"
              />
            </div>
          )}

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

          <div className="flex gap-2 pt-4">
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
              Approuver la Sortie
            </button>
          </div>
        </form>
      </Modal>

      {/* Rejection Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={handleCloseRejectModal} title="Rejeter le Mouvement">
        <form onSubmit={handleSubmitReject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom du Contrôleur</label>
            <input
              type="text"
              value={rejectFormData.controleur}
              onChange={(e) => setRejectFormData({ ...rejectFormData, controleur: e.target.value })}
              className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nom du contrôleur"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Raison du Rejet</label>
            <textarea
              value={rejectFormData.raison}
              onChange={(e) => setRejectFormData({ ...rejectFormData, raison: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Décrivez la raison du rejet..."
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCloseRejectModal}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Rejeter
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirmer la suppression">
        <div className="space-y-4">
          <p className="text-sm text-foreground">Êtes-vous sûr de vouloir supprimer ce mouvement ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="flex-1 h-9 rounded-md border text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Inspection Modal for Pending Entrée */}
      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={handleCloseInspectionModal}
        mouvement={inspectionMouvementId ? mouvements.find(m => m.id === inspectionMouvementId) : null}
        article={inspectionMouvementId ? (() => {
          const mouvement = mouvements.find(m => m.id === inspectionMouvementId);
          return mouvement ? articles.find(a => a.ref === mouvement.ref) : null;
        })() : null}
        onApprove={handleInspectionApprove}
      />

      {/* Floating Action Button (FAB) - Mobile Only */}
      <button
        onClick={() => {
          setDuplicateData(null);
          setIsBulkModalOpen(true);
        }}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40"
        title="Nouveau Mouvement"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default MouvementsPage;

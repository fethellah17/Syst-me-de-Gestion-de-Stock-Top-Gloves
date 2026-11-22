import { useState, useMemo } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, ArrowLeftRight, Plus, ChevronLeft } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Modal } from "@/components/Modal";
import { Toast } from "@/components/Toast";
import { MovementTable } from "@/components/MovementTable";
import { BulkMovementModal } from "@/components/BulkMovementModal";
import { InspectionModal, type InspectionData } from "@/components/InspectionModal";
import { generateAdministrativeErrorPDF, generateDefectiveItemsPDF } from "@/lib/pdf-generator";
import { format } from "date-fns";

const MouvementsPage = () => {
  const { mouvements, articles, emplacements, destinations, suppliers, addMouvement, updateArticle, deleteMouvement, getArticleLocations, getArticleStockByLocation, approveQualityControl, rejectQualityControl, processTransfer, recalculateAllOccupancies, addDestination, createOperation, createOperationFull, updateOperationFields, updateOperationStatus, applyOperationStock, operations } = useData();
  const [selectedType, setSelectedType] = useState<"Entrée" | "Sortie" | "Transfert" | null>(null);
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Entrée" | "Sortie" | "Transfert">("all");
  const [operationSearch, setOperationSearch] = useState<string>("");
  const [isCreatingOperation, setIsCreatingOperation] = useState(false);
  const [draftOperateur, setDraftOperateur] = useState("");
  const [draftDocumentOrigine, setDraftDocumentOrigine] = useState("");
  const [draftError, setDraftError] = useState("");
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
      // Filter by operation (level 3 only)
      const matchOperation = selectedOperationId === null || m.operationId === selectedOperationId;
      return matchArticle && matchType && matchOperation;
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
    if (!mouvement || (mouvement.type !== "Entrée" && mouvement.type !== "Sortie")) return;
    
    // Defense in depth: only allow inspection if operation is in "En inspection"
    if (mouvement.operationId) {
      const operation = operations.find(op => op.id === mouvement.operationId);
      if (operation && operation.statut !== "En inspection") {
        setToast({ message: "Soumettez l'opération pour inspection avant de contrôler les lignes", type: "error" });
        return;
      }
    }
    
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
    if (data.refusTotalMotif || data.refusalType) {
      // SORTIE ONLY: Dual refusal modes
      if (mouvement.type === "Sortie" && data.refusalType) {
        approveQualityControl(
          inspectionMouvementId,
          data.controleur,
          "Non-conforme",
          0,
          0,
          "refusal", // Placeholder to trigger refusal logic
          "",
          data.verificationPoints,
          data.refusalType,
          data.nomOperateur,
          data.motifErreur,
          data.nomControleur,
          data.motifRejet,
          data.lotDate
        );

        // Trigger PDF generation based on refusal type
        const updatedMouvement = {
          ...mouvement,
          nomOperateur: data.nomOperateur,
          motifErreur: data.motifErreur,
          nomControleur: data.nomControleur,
          motifRejet: data.motifRejet,
        };

        if (data.refusalType === "administrative") {
          generateAdministrativeErrorPDF(updatedMouvement);
        } else if (data.refusalType === "defective") {
          generateDefectiveItemsPDF(updatedMouvement);
        }

        const refusalTypeLabel = data.refusalType === "administrative" 
          ? "Erreur Administrative" 
          : "Article Défectueux";
        
        // Phase 7b: different message if stock deferred
        const stockMessage = mouvement.operationId && data.refusalType === "defective"
          ? " Le stock sera mis à jour à la validation de l'opération."
          : "";
        
        setToast({
          message: `✗ Mouvement refusé - ${refusalTypeLabel} (${mouvement.qte} ${mouvement.uniteSortie}).${stockMessage}`,
          type: "success"
        });
      }
      // ENTRÉE ONLY: Simple refusal logic
      else if (mouvement.type === "Entrée" && data.refusTotalMotif) {
        approveQualityControl(
          inspectionMouvementId,
          data.controleur,
          "Non-conforme",
          0,
          0,
          data.refusTotalMotif,
          data.refusTotalMotif,
          data.verificationPoints,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          data.lotDate
        );

        setToast({
          message: `✗ Mouvement refusé complètement (${mouvement.qte} ${mouvement.uniteSortie})`,
          type: "success"
        });
      }
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
        data.verificationPoints,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        data.lotDate
      );

      const successMessage = mouvement.type === "Sortie"
        ? (mouvement.operationId 
          ? `✓ Sortie approuvée. Le stock sera mis à jour à la validation de l'opération (Qté: ${data.qteValide} ${mouvement.uniteSortie})`
          : `✓ Sortie approuvée. Stock mis à jour avec succès (Qté: ${data.qteValide} ${mouvement.uniteSortie})`)
        : (mouvement.operationId && data.qteValide > 0
          ? `✓ Qualité validée. Le stock sera mis à jour à la validation de l'opération (Qté: ${data.qteValide} ${mouvement.uniteSortie})`
          : `✓ Stock mis à jour avec succès (Qté: ${data.qteValide} ${mouvement.uniteSortie})`);

      setToast({
        message: successMessage,
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
        
        // Phase 7b: different message if stock deferred
        const stockMessage = mouvement?.operationId 
          ? "Qualité validée. Le stock sera mis à jour à la validation de l'opération."
          : "✓ Qualité validée. Stock mis à jour avec succès.";
        
        setToast({ message: stockMessage, type: "success" });
      } else {
        rejectQualityControl(qcMouvementId, qcFormData.controleur, qcFormData.raison);
        setToast({ message: "✗ Sortie rejetée. Opération annulée.", type: "success" });
      }
      
      recalculateAllOccupancies();
      handleCloseQCModal();
    }
  };

  const handleDeleteClick = (id: string) => {
    // Defense in depth: only allow deletion if operation is in "Brouillon"
    const mouvement = mouvements.find(m => m.id === id);
    if (mouvement?.operationId) {
      const operation = operations.find(op => op.id === mouvement.operationId);
      if (operation && operation.statut !== "Brouillon") {
        setToast({ message: "Les lignes ne peuvent être supprimées que dans l'état Brouillon", type: "error" });
        return;
      }
    }
    
    setDeleteConfirmId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      // Defense in depth: double-check operation status before deleting
      const mouvement = mouvements.find(m => m.id === deleteConfirmId);
      if (mouvement?.operationId) {
        const operation = operations.find(op => op.id === mouvement.operationId);
        if (operation && operation.statut !== "Brouillon") {
          setToast({ message: "Les lignes ne peuvent être supprimées que dans l'état Brouillon", type: "error" });
          setIsDeleteConfirmOpen(false);
          setDeleteConfirmId(null);
          return;
        }
      }
      
      deleteMouvement(deleteConfirmId);
      setToast({ message: "Ligne supprimée avec succès", type: "success" });
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
    // CRITICAL: For Sortie, clear destination so user can select a new one
    // For other types, preserve the destination
    const isDestinationEditable = mouvement.type === "Sortie";
    
    const duplicateItem = {
      id: "1",
      articleId: article.id.toString(),
      quantity: mouvement.qteOriginale || mouvement.qte,
      selectedUnit: mouvement.uniteUtilisee || article.uniteEntree,
      emplacementSource: mouvement.emplacementSource || "",
      emplacementDestination: isDestinationEditable ? "" : (mouvement.emplacementDestination || ""),
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

    // Use existing operation if at level 3, otherwise create new one
    let operation;
    let effectiveOperateur;
    if (selectedOperationId) {
      const existingOp = operations.find(op => op.id === selectedOperationId);
      if (!existingOp) return; // Should not happen
      operation = existingOp;
      effectiveOperateur = existingOp.operateur; // Use operation's operator
    } else {
      operation = createOperation(movementType, operateur);
      effectiveOperateur = operateur;
    }

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
          fournisseur: item.fournisseur,
          emplacementDestination: item.emplacementDestination,
          commentaire: item.commentaire || "",
          operateur: effectiveOperateur,
          operationId: operation.id,
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
          operateur: effectiveOperateur,
          operationId: operation.id,
        });
      } else if (movementType === "Transfert") {
        // Phase 7c: defer stock if operationId present
        if (operation) {
          // Pre-validate for immediate user feedback (UI layer only)
          if (article) {
            const sourceStock = getArticleStockByLocation(article.ref, item.emplacementSource);
            if (qtyInExitUnit > sourceStock) {
              setToast({
                message: `❌ Quantité insuffisante dans ${item.emplacementSource}. Disponible: ${sourceStock}`,
                type: "error"
              });
              return; // Stop the operation
            }
          }

          // Do NOT call processTransfer - defer stock to Valider
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
            operateur: effectiveOperateur,
            operationId: operation.id,
            statut: "Terminé" as const,
            status: "approved" as const,
            stockApplied: false
          });
        } else {
          // Legacy path: no operationId, call processTransfer immediately
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
              operateur: effectiveOperateur,
              statut: "Terminé" as const,
              status: "approved" as const
            });
          } else {
            setToast({
              message: `❌ ${transferResult.error}`,
              type: "error"
            });
            return; // Stop the operation
          }
        }
      }
    });

    // Step 2: SMART MERGE - Update articles state with strict zone logic
    // CRITICAL: SKIP this step entirely for Entrée AND Sortie movements with "En attente" status
    // Stock must NOT be updated for pending movements - it will be updated only upon QC approval
    // Phase 7c: ALSO SKIP Transfert movements that belong to an operation (stockApplied deferred)
    if (movementType !== "Entrée" && movementType !== "Sortie" && !(movementType === "Transfert" && operation)) {
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
      // Phase 7c: For Transfert in operation: stock deferred to Valider
      console.log(`[PENDING QC] Step 2 SKIPPED - Stock will NOT be updated until QC approval`);
    }

    recalculateAllOccupancies();

    const totalItems = items.length;
    const message = movementType === "Sortie"
      ? `✓ ${totalItems} sortie(s) enregistrée(s) en attente de validation qualité.`
      : movementType === "Transfert"
      ? (operation 
        ? `✓ ${totalItems} transfert(s) enregistré(s). Le stock sera mis à jour à la validation.`
        : `✓ ${totalItems} transfert(s) effectué(s) avec succès.`)
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

  // Compute counts for landing cards
  const entreeCounts = useMemo(() => {
    const entreeMovs = combinedMovements.filter(m => m.type === "Entrée" && m.type !== "Ajustement");
    const total = entreeMovs.length;
    const pending = entreeMovs.filter(m => m.qc_status === "pending").length;
    return { total, pending };
  }, [combinedMovements]);

  const sortieCounts = useMemo(() => {
    const sortieMovs = combinedMovements.filter(m => m.type === "Sortie" && m.type !== "Ajustement");
    const total = sortieMovs.length;
    const pending = sortieMovs.filter(m => m.qc_status === "pending").length;
    return { total, pending };
  }, [combinedMovements]);

  const transfertCounts = useMemo(() => {
    const transfertMovs = combinedMovements.filter(m => m.type === "Transfert" && m.type !== "Ajustement");
    const total = transfertMovs.length;
    return { total };
  }, [combinedMovements]);

  // When a card is clicked, set selectedType and sync typeFilter
  const handleCardClick = (type: "Entrée" | "Sortie" | "Transfert") => {
    setSelectedType(type);
    setTypeFilter(type);
    setSelectedOperationId(null);
    setOperationSearch("");
    setIsCreatingOperation(false);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Back to landing
  const handleBackToLanding = () => {
    setSelectedType(null);
    setTypeFilter("all");
    setSelectedOperationId(null);
    setOperationSearch("");
    setIsCreatingOperation(false);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Back to operations list
  const handleBackToOperations = () => {
    setSelectedOperationId(null);
    setIsCreatingOperation(false);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Start creating new operation
  const handleNewOperation = () => {
    setIsCreatingOperation(true);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Workflow status transition handlers
  
  // Phase 7d: Helper to check if a line has been inspected (approved or rejected)
  const isLineInspected = (m: any): boolean => {
    return m.status === "approved" || m.status === "rejected";
  };

  // Phase 7d: Compute operation guard state
  const getOperationGuardState = (operation: any) => {
    const lines = mouvements.filter(m => m.operationId === operation.id);
    const isEmpty = lines.length === 0;
    const uninspectedCount = operation.type === "Transfert" 
      ? 0 
      : lines.filter(m => !isLineInspected(m)).length;
    const canAdvance = !isEmpty && uninspectedCount === 0;
    
    return { isEmpty, uninspectedCount, canAdvance };
  };

  const handleSubmitForInspection = () => {
    if (!selectedOperation) return;
    updateOperationStatus(selectedOperation.id, "En inspection");
    setToast({ message: "Opération soumise pour inspection", type: "success" });
  };

  const handlePassToManager = () => {
    if (!selectedOperation) return;
    
    // Phase 7d: Guard check
    const guardState = getOperationGuardState(selectedOperation);
    if (!guardState.canAdvance) return;
    
    updateOperationStatus(selectedOperation.id, "En attente de validation");
    setToast({ message: "Opération transmise au gestionnaire", type: "success" });
  };

  const handleValidateOperation = () => {
    if (!selectedOperation) return;
    
    // Phase 7b: prevent double-click
    if (selectedOperation.statut === "Terminé") return;
    
    // Phase 7d: Guard check
    const guardState = getOperationGuardState(selectedOperation);
    if (!guardState.canAdvance) return;
    
    // Phase 7b: apply deferred stock first
    const result = applyOperationStock(selectedOperation.id);
    
    if (!result.success) {
      setToast({ 
        message: `❌ ${result.error || "Stock insuffisant"}. ${result.failedLines?.join("; ") || ""}`, 
        type: "error" 
      });
      return;
    }
    
    updateOperationStatus(selectedOperation.id, "Terminé");
    setToast({ message: "Opération validée", type: "success" });
  };

  // Save new operation
  const handleSaveOperation = () => {
    if (!draftOperateur.trim()) {
      setDraftError("L'opérateur est requis");
      return;
    }
    if (!selectedType) return;

    const newOp = createOperationFull(
      selectedType,
      draftOperateur.trim(),
      draftDocumentOrigine.trim() || undefined
    );

    setSelectedOperationId(newOp.id);
    setIsCreatingOperation(false);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Cancel draft operation
  const handleCancelDraft = () => {
    setIsCreatingOperation(false);
    setDraftOperateur("");
    setDraftDocumentOrigine("");
    setDraftError("");
  };

  // Filter operations for selected type
  const filteredOperations = useMemo(() => {
    if (!selectedType) return [];
    return operations
      .filter(op => op.type === selectedType)
      .filter(op => {
        if (!operationSearch) return true;
        const search = operationSearch.toLowerCase();
        return op.reference.toLowerCase().includes(search) || 
               op.operateur.toLowerCase().includes(search) ||
               (op.documentOrigine && op.documentOrigine.toLowerCase().includes(search));
      })
      .sort((a, b) => b.id - a.id); // Newest first
  }, [operations, selectedType, operationSearch]);

  // Get selected operation details
  const selectedOperation = selectedOperationId 
    ? operations.find(op => op.id === selectedOperationId)
    : null;

  // Format date helper
  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return isoDate;
    }
  };

  // Status dot color
  const getStatusDotColor = (statut: string) => {
    switch (statut) {
      case "Brouillon": return "bg-gray-400";
      case "En inspection": return "bg-amber-500";
      case "En attente de validation": return "bg-blue-500";
      case "Terminé": return "bg-green-600";
      default: return "bg-gray-400";
    }
  };

  // Type label plural
  const getTypeLabelPlural = (type: "Entrée" | "Sortie" | "Transfert") => {
    switch (type) {
      case "Entrée": return "Entrées";
      case "Sortie": return "Sorties";
      case "Transfert": return "Transferts";
    }
  };

  // Type label singular
  const getTypeLabelSingular = (type: "Entrée" | "Sortie" | "Transfert") => {
    return type; // Already singular
  };

  // Format date and time for display
  const formatDateTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6 w-full pb-24 md:pb-6">
      {selectedType === null ? (
        // LANDING VIEW: Show 3 cards
        <>
          <div>
            <h2 className="text-xl font-bold text-foreground">Mouvements</h2>
            <p className="text-sm text-muted-foreground">Gestion des entrées, sorties et transferts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Entrée Card */}
            <button
              onClick={() => handleCardClick("Entrée")}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="flex flex-col gap-3">
                <ArrowDownToLine className="w-6 h-6 text-gray-500" />
                <div>
                  <div className="text-base font-medium text-gray-900">Entrée</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {entreeCounts.total} mouvement{entreeCounts.total > 1 ? 's' : ''}
                    {entreeCounts.pending > 0 && ` · ${entreeCounts.pending} en attente`}
                  </div>
                </div>
              </div>
            </button>

            {/* Sortie Card */}
            <button
              onClick={() => handleCardClick("Sortie")}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="flex flex-col gap-3">
                <ArrowUpFromLine className="w-6 h-6 text-gray-500" />
                <div>
                  <div className="text-base font-medium text-gray-900">Sortie</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {sortieCounts.total} mouvement{sortieCounts.total > 1 ? 's' : ''}
                    {sortieCounts.pending > 0 && ` · ${sortieCounts.pending} en attente`}
                  </div>
                </div>
              </div>
            </button>

            {/* Transfert Card */}
            <button
              onClick={() => handleCardClick("Transfert")}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="flex flex-col gap-3">
                <ArrowLeftRight className="w-6 h-6 text-gray-500" />
                <div>
                  <div className="text-base font-medium text-gray-900">Transfert</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {transfertCounts.total} mouvement{transfertCounts.total > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </>
      ) : isCreatingOperation ? (
        // DRAFT OPERATION FORM
        <>
          <div>
            {/* Back button */}
            <button
              onClick={handleBackToOperations}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {getTypeLabelPlural(selectedType)}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span>Mouvements</span>
              <span>/</span>
              <span>{getTypeLabelPlural(selectedType)}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Nouveau</span>
            </div>

            {/* Action row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveOperation}
                  className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Enregistrer
                </button>
                <button
                  onClick={handleCancelDraft}
                  className="h-9 px-4 border border-gray-300 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
              {/* Status Bar */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 bg-primary/10 text-primary font-medium rounded">Brouillon</span>
                <span className="text-gray-400">›</span>
                <span className="px-3 py-1 text-gray-400">En inspection</span>
                <span className="text-gray-400">›</span>
                <span className="px-3 py-1 text-gray-400">En attente de validation</span>
                <span className="text-gray-400">›</span>
                <span className="px-3 py-1 text-gray-400">Terminé</span>
              </div>
            </div>
          </div>

          {/* Operation Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Nouveau</h3>
            
            {draftError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {draftError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left column */}
              <div className="flex items-start">
                <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Type d'opération</label>
                <div className="flex-1 pt-2 text-sm text-gray-900">{getTypeLabelSingular(selectedType)}</div>
              </div>

              <div className="flex items-start">
                <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">
                  Opérateur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={draftOperateur}
                  onChange={(e) => {
                    setDraftOperateur(e.target.value);
                    setDraftError("");
                  }}
                  className="flex-1 h-9 px-3 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Nom de l'opérateur"
                />
              </div>

              <div className="flex items-start">
                <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Date planifiée</label>
                <div className="flex-1 pt-2 text-sm text-gray-900">{formatDateTime(new Date().toISOString())}</div>
              </div>

              <div className="flex items-start">
                <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Document d'origine</label>
                <input
                  type="text"
                  value={draftDocumentOrigine}
                  onChange={(e) => setDraftDocumentOrigine(e.target.value)}
                  className="flex-1 h-9 px-3 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder="Ex: BC-2026-001"
                />
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div>
            <h4 className="text-xs uppercase text-gray-500 mb-3">Articles à traiter</h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-sm text-gray-500">Enregistrez l'opération pour ajouter des lignes.</p>
            </div>
          </div>
        </>
      ) : selectedOperationId === null ? (
        // LEVEL 2: Operations list for selected type
        <>
          <div>
            {/* Back button */}
            <button
              onClick={handleBackToLanding}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Mouvements
            </button>

            {/* Header with breadcrumb style */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Mouvements</span>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">{getTypeLabelPlural(selectedType)}</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">{getTypeLabelPlural(selectedType)}</h2>
                <p className="text-sm text-muted-foreground">{filteredOperations.length} opération{filteredOperations.length > 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={handleNewOperation}
                className="hidden md:flex h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Nouvelle opération
              </button>
            </div>
          </div>

          {/* Search */}
          <div>
            <input
              type="text"
              value={operationSearch}
              onChange={(e) => setOperationSearch(e.target.value)}
              placeholder="Rechercher par référence ou opérateur..."
              className="w-full h-9 px-3 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* Operations Table */}
          {filteredOperations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-md p-12 text-center">
              <p className="text-gray-500 text-sm">Aucune opération pour le moment.</p>
              <p className="text-gray-400 text-xs mt-1">Cliquez sur "Nouveau Mouvement" pour commencer</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opérateur</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document d'origine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date planifiée</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOperations.map((op) => (
                    <tr
                      key={op.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedOperationId(op.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedOperationId(op.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors h-12"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 tabular-nums">{op.reference}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{op.operateur}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{op.documentOrigine || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(op.datePlanifiee)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusDotColor(op.statut)}`}></div>
                          <span className="text-xs text-gray-700">{op.statut}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // LEVEL 3: Operation details with movements
        <>
          <div>
            {/* Back button */}
            <button
              onClick={handleBackToOperations}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              {getTypeLabelPlural(selectedType)}
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <span>Mouvements</span>
              <span>/</span>
              <span>{getTypeLabelPlural(selectedType)}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{selectedOperation?.reference}</span>
            </div>

            {/* Action row with workflow buttons and status bar */}
            <div className="flex items-center justify-between mb-6">
              {/* Workflow Buttons - Left */}
              <div className="flex items-center gap-2">
                {selectedOperation?.statut === "Brouillon" && (
                  <>
                    {/* Phase 7c: Transfert operations skip "Soumettre pour inspection" */}
                    {selectedOperation.type === "Transfert" ? (
                      <button
                        type="button"
                        onClick={handlePassToManager}
                        disabled={mouvements.filter(m => m.operationId === selectedOperationId).length === 0}
                        title={mouvements.filter(m => m.operationId === selectedOperationId).length === 0 ? "Ajoutez au moins une ligne" : ""}
                        className={`h-9 px-4 rounded text-sm font-medium transition-colors ${
                          mouvements.filter(m => m.operationId === selectedOperationId).length === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        Passer au gestionnaire
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitForInspection}
                        disabled={mouvements.filter(m => m.operationId === selectedOperationId).length === 0}
                        title={mouvements.filter(m => m.operationId === selectedOperationId).length === 0 ? "Ajoutez au moins une ligne" : ""}
                        className={`h-9 px-4 rounded text-sm font-medium transition-colors ${
                          mouvements.filter(m => m.operationId === selectedOperationId).length === 0
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        Soumettre pour inspection
                      </button>
                    )}
                  </>
                )}
                {selectedOperation?.statut === "En inspection" && (() => {
                  const guardState = getOperationGuardState(selectedOperation);
                  const helperText = guardState.isEmpty 
                    ? "Ajoutez au moins une ligne" 
                    : guardState.uninspectedCount > 0 
                    ? `${guardState.uninspectedCount} ligne(s) restent à contrôler` 
                    : "";
                  
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePassToManager}
                        disabled={!guardState.canAdvance}
                        title={helperText}
                        className={`h-9 px-4 rounded text-sm font-medium transition-colors ${
                          !guardState.canAdvance
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        Passer au gestionnaire
                      </button>
                      {!guardState.canAdvance && (
                        <span className="text-xs text-muted-foreground">{helperText}</span>
                      )}
                    </div>
                  );
                })()}
                {selectedOperation?.statut === "En attente de validation" && (() => {
                  const guardState = getOperationGuardState(selectedOperation);
                  const helperText = guardState.isEmpty 
                    ? "Ajoutez au moins une ligne" 
                    : guardState.uninspectedCount > 0 
                    ? `${guardState.uninspectedCount} ligne(s) restent à contrôler` 
                    : "";
                  
                  return (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleValidateOperation}
                        disabled={!guardState.canAdvance}
                        title={helperText}
                        className={`h-9 px-4 rounded text-sm font-medium transition-colors ${
                          !guardState.canAdvance
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-primary-foreground hover:opacity-90"
                        }`}
                      >
                        Valider
                      </button>
                      {!guardState.canAdvance && (
                        <span className="text-xs text-muted-foreground">{helperText}</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Status Bar - Right */}
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-3 py-1 rounded ${
                  selectedOperation?.statut === "Brouillon" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-600"
                }`}>
                  {selectedOperation?.statut !== "Brouillon" && "✓ "}Brouillon
                </span>
                {/* Phase 7c: Hide "En inspection" step for Transfert operations */}
                {selectedOperation?.type !== "Transfert" && (
                  <>
                    <span className="text-gray-400">›</span>
                    <span className={`px-3 py-1 rounded ${
                      selectedOperation?.statut === "En inspection" 
                        ? "bg-primary/10 text-primary font-medium" 
                        : selectedOperation?.statut === "En attente de validation" || selectedOperation?.statut === "Terminé"
                        ? "text-gray-600"
                        : "text-gray-400"
                    }`}>
                      {(selectedOperation?.statut === "En attente de validation" || selectedOperation?.statut === "Terminé") && "✓ "}En inspection
                    </span>
                  </>
                )}
                <span className="text-gray-400">›</span>
                <span className={`px-3 py-1 rounded ${
                  selectedOperation?.statut === "En attente de validation" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : selectedOperation?.statut === "Terminé"
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}>
                  {selectedOperation?.statut === "Terminé" && "✓ "}En attente de validation
                </span>
                <span className="text-gray-400">›</span>
                <span className={`px-3 py-1 rounded ${
                  selectedOperation?.statut === "Terminé" 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-gray-400"
                }`}>
                  Terminé
                </span>
              </div>
            </div>
          </div>

          {/* Operation Card */}
          {selectedOperation && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">{selectedOperation.reference}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {/* Left column */}
                <div className="flex items-start">
                  <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Type d'opération</label>
                  <div className="flex-1 pt-2 text-sm text-gray-900">{getTypeLabelSingular(selectedOperation.type)}</div>
                </div>

                <div className="flex items-start">
                  <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">
                    Opérateur {selectedOperation.statut === "Brouillon" && <span className="text-red-500">*</span>}
                  </label>
                  {selectedOperation.statut === "Brouillon" ? (
                    <input
                      type="text"
                      defaultValue={selectedOperation.operateur}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== selectedOperation.operateur) {
                          updateOperationFields(selectedOperation.id, { operateur: e.target.value.trim() });
                        }
                      }}
                      className="flex-1 h-9 px-3 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  ) : (
                    <div className="flex-1 pt-2 text-sm text-gray-900">{selectedOperation.operateur}</div>
                  )}
                </div>

                <div className="flex items-start">
                  <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Date planifiée</label>
                  <div className="flex-1 pt-2 text-sm text-gray-900">{formatDateTime(selectedOperation.datePlanifiee)}</div>
                </div>

                <div className="flex items-start">
                  <label className="w-40 text-sm text-gray-500 pt-2 flex-shrink-0">Document d'origine</label>
                  {selectedOperation.statut === "Brouillon" ? (
                    <input
                      type="text"
                      defaultValue={selectedOperation.documentOrigine || ""}
                      onBlur={(e) => {
                        const newValue = e.target.value.trim() || undefined;
                        if (newValue !== selectedOperation.documentOrigine) {
                          updateOperationFields(selectedOperation.id, { documentOrigine: newValue });
                        }
                      }}
                      className="flex-1 h-9 px-3 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      placeholder="Ex: BC-2026-001"
                    />
                  ) : (
                    <div className="flex-1 pt-2 text-sm text-gray-900">{selectedOperation.documentOrigine || "—"}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Articles section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase text-gray-500">Articles à traiter</h4>
              {selectedOperation?.statut === "Brouillon" && (
                <button
                  onClick={() => {
                    setDuplicateData(null);
                    setIsBulkModalOpen(true);
                  }}
                  className="h-9 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter ligne
                </button>
              )}
            </div>

            {/* Article Filter - only if more than 1 line */}
            {filtered.length > 1 && (
              <div className="mb-3">
                <select
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="h-9 px-3 rounded border border-gray-300 bg-white text-sm text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                >
                  <option value="">Tous les articles</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.ref}>
                      {article.nom} ({article.ref})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <MovementTable 
                movements={filtered}
                articles={articles}
                onDuplicate={handleDuplicate}
                onQualityControl={handleOpenQCModal}
                onReject={handleOpenRejectModal}
                onInspect={selectedOperation?.statut === "En inspection" ? handleOpenInspectionModal : undefined}
                onDelete={selectedOperation?.statut === "Brouillon" ? handleDeleteClick : undefined}
                showActions={true}
                compact={false}
              />
            </div>
          </div>
        </>
      )}

      {/* Modals remain outside conditional rendering */}

      {/* Bulk Movement Modal */}
      <BulkMovementModal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setDuplicateData(null);
        }}
        articles={articles}
        emplacements={emplacements}
        destinations={destinations}
        suppliers={suppliers}
        getArticleLocations={getArticleLocations}
        getArticleStockByLocation={() => 0}
        onSubmit={handleBulkMovementSubmit}
        onAddDestination={(name) => {
          addDestination({ nom: name });
        }}
        initialData={duplicateData}
        defaultMovementType={selectedType ?? undefined}
        fixedMovementType={selectedOperation?.type}
        fixedOperateur={selectedOperation?.operateur}
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
          <p className="text-sm text-foreground">Êtes-vous sûr de vouloir supprimer cette ligne ?</p>
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
      {selectedType !== null && (
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
      )}
    </div>
  );
};

export default MouvementsPage;

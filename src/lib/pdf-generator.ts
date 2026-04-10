import jsPDF from 'jspdf';
import type { Mouvement } from '@/contexts/DataContext';
import { getUnitSymbol } from './units-storage';
import { getFullUnitName } from './stock-utils';

// Standardized PDF Template - Monochrome Design
// Logo: Square 20x20mm top-left (slightly smaller)
// Company Name: "Top Gloves" directly below logo
// Signature: Bottom-right

/**
 * EMERGENCY CLEAN - Remove ALL & symbols
 * This is the simplest possible approach
 */
const emergencyClean = (text: string | number): string => {
  return String(text).replace(/&/g, '');
};

/**
 * Format quantity - simple and clean with nice formatting
 */
const formatQty = (qty: number): string => {
  if (!qty) return '0';
  const formatted = qty.toLocaleString('fr-FR', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
  return emergencyClean(formatted);
};

/**
 * Format verification points for PDF display
 * Shows checked items as [X] and unchecked as [ ]
 */
const formatVerificationPoints = (verificationPoints?: Record<string, boolean>, movementType?: string): string[] => {
  if (!verificationPoints || Object.keys(verificationPoints).length === 0) {
    return [];
  }

  const VERIFICATION_CHECKLISTS: Record<string, Array<{ key: string; label: string }>> = {
    Entrée: [
      { key: "aspect", label: "Aspect / Emballage Extérieur" },
      { key: "quantite", label: "Conformité Quantité vs BL" },
      { key: "documents", label: "Présence Documents (FDS/BL)" },
    ],
    Sortie: [
      { key: "etat", label: "État de l'article (Condition check)" },
      { key: "quantite", label: "Conformité Quantité vs Demande" },
      { key: "emballage", label: "Emballage Expédition (Packaging for exit)" },
    ],
  };

  const checklist = VERIFICATION_CHECKLISTS[movementType as keyof typeof VERIFICATION_CHECKLISTS] || VERIFICATION_CHECKLISTS.Entrée;
  
  return checklist.map(item => {
    const isChecked = verificationPoints[item.key] || false;
    const checkbox = isChecked ? "[X]" : "[ ]";
    return `${checkbox} ${item.label}`;
  });
};

/**
 * Get unit symbol - simple string only
 */
const getUnit = (unitId: string | undefined): string => {
  if (!unitId) return '';
  const symbol = getUnitSymbol(unitId);
  return emergencyClean(String(symbol));
};

/**
 * ULTRA SIMPLE quantity display - NO conversion logic
 * Just show what the user entered
 */
const getQuantityDisplay = (movement: any): { qty: string; unit: string } => {
  // Use qteOriginale if it exists (what user typed), otherwise use qte
  const displayQty = movement.qteOriginale !== undefined ? movement.qteOriginale : movement.qte;
  const displayUnit = movement.uniteUtilisee || movement.uniteSortie;
  
  const qtyStr = String(displayQty);
  const unitStr = displayUnit ? String(getUnit(displayUnit)) : '';
  
  return { qty: qtyStr, unit: unitStr };
};

/**
 * Load logo image and convert to Base64
 * This ensures the logo works in both dev and production environments
 * 
 * @returns Promise<string> Base64 encoded image data
 */
const loadLogoAsBase64 = async (): Promise<string | null> => {
  try {
    // Try to load from public folder
    const response = await fetch('/logo.jpg');
    if (!response.ok) {
      console.warn('?? Logo file not found at /logo.jpg');
      return null;
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('? Failed to load logo:', error);
    return null;
  }
};

// Cache the logo Base64 data to avoid repeated fetches
let cachedLogoBase64: string | null | undefined = undefined;

/**
 * Get cached logo or load it
 */
const getLogoBase64 = async (): Promise<string | null> => {
  if (cachedLogoBase64 !== undefined) {
    return cachedLogoBase64;
  }
  
  cachedLogoBase64 = await loadLogoAsBase64();
  if (cachedLogoBase64) {
    console.log('? Logo loaded and cached successfully');
  } else {
    console.warn('?? Logo could not be loaded - PDFs will be generated without logo');
  }
  
  return cachedLogoBase64;
};

/**
 * Centralized Header Rendering Function
 * Ensures consistent header layout across all PDF documents
 * 
 * @param doc - jsPDF document instance
 * @param title - Document title (e.g., "Bon d'Entree", "Bon de Sortie")
 * @param logoBase64 - Optional Base64 encoded logo image
 * @returns Y position where content should start (after header)
 */
const renderHeader = (doc: jsPDF, title: string, logoBase64?: string | null): number => {
  // Logo - Square 20x20mm fixed to top-left corner
  const logoSize = 20; // Slightly smaller than before (was 25)
  const logoX = 10;
  const logoY = 10;
  
  // Add logo if available
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
      console.log('? Logo added to PDF');
    } catch (error) {
      console.error('? Failed to add logo to PDF:', error);
    }
  } else {
    console.warn('?? No logo data available for PDF');
  }
  
  // Company Name - "Top Gloves" directly underneath logo
  const companyNameY = logoY + logoSize + 5; // 5mm below logo
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Black
  doc.text(emergencyClean("Top Gloves"), logoX, companyNameY);
  
  // Title - Aligned right
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(emergencyClean(title), 200, 20, { align: "right" });
  
  // Report Date - Aligned right below title
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const reportDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(emergencyClean("Date du rapport: " + reportDate), 200, 28, { align: "right" });
  
  // Separator Line - Black, positioned below company name
  const separatorY = companyNameY + 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, separatorY, 200, separatorY);
  
  // Return Y position where content should start
  return separatorY + 10;
};

/**
 * Standardized PDF Template Generator
 * Uses centralized renderHeader() function to ensure consistency
 * Now with robust Base64 logo loading
 */
const generatePDFTemplate = async (
  doc: jsPDF,
  title: string,
  movement: Mouvement,
  signatureText: string,
  contentCallback: (doc: jsPDF, yPos: number) => void
) => {
  // Load logo as Base64 (cached after first load)
  const logoBase64 = await getLogoBase64();

  // Render standardized header with logo
  const contentStartY = renderHeader(doc, title, logoBase64);

  // Content Section
  contentCallback(doc, contentStartY);

  // Signature - Bottom-right
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(emergencyClean(signatureText), 120, 260, { align: "left" });
  doc.line(120, 268, 200, 268);

  // Save PDF
  const cleanTitle = emergencyClean(title).replace(/\s+/g, '_');
  const cleanId = emergencyClean(movement.id);
  const filename = cleanTitle + "_" + cleanId + ".pdf";
  doc.save(filename);
};

// 1. Bon d'Entree (Inbound) - FORMAL BLACK & WHITE with Professional Signature Blocks
export const generateInboundPDF = async (movement: Mouvement, articles?: any[]) => {
  console.log('=== GENERATING INBOUND PDF ===');
  console.log('Movement:', movement);
  
  const doc = new jsPDF();
  const logoBase64 = await getLogoBase64();

  // Determine QC outcome
  const isTotalRefusal = movement.qcStatus === "Non-conforme" && movement.validQuantity === 0;
  const isPartialAcceptance = movement.qcStatus === "Non-conforme" && movement.validQuantity !== undefined && movement.validQuantity > 0;
  const isTotalAcceptance = movement.qcStatus === "Conforme" || (movement.validQuantity === movement.qte && movement.defectiveQuantity === 0);

  // Dynamic title based on QC outcome
  let titleText = "BON D'ENTREE";
  if (isTotalRefusal) {
    titleText = "AVIS DE REFUS DE RECEPTION";
  }

  const contentStartY = renderHeader(doc, titleText, logoBase64);
  let yPos = contentStartY;

  // Movement Details Section - Simple Black & White
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DETAILS DE LA RECEPTION", 10, yPos);
  yPos += 7;

  // Separator line (1pt black)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Details in simple format (no boxes, just text)
  doc.text("Article: " + emergencyClean(movement.article) + " (" + emergencyClean(movement.ref) + ")", 15, yPos);
  yPos += 5;

  doc.text("Date de Reception: " + emergencyClean(movement.date), 15, yPos);
  yPos += 5;

  doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
  yPos += 5;

  const lotDate = movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A';
  doc.text("Date du Lot: " + emergencyClean(lotDate), 15, yPos);
  yPos += 5;

  doc.text("Zone de Destination: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
  yPos += 5;

  doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
  yPos += 10;

  // CASE A: Total Acceptance (100% Valide)
  if (isTotalAcceptance) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("QUANTITES", 10, yPos);
    yPos += 7;

    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, 200, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const { qty, unit } = getQuantityDisplay(movement);
    
    // Get article to access unit information
    const article = articles?.find(a => a.ref === movement.ref);
    const exitUnit = article?.uniteSortie || movement.uniteSortie || "unité";
    const entryUnit = article?.uniteEntree || "unité";
    const conversionFactor = article?.facteurConversion || 1;

    // Get full unit names
    const exitUnitFull = getFullUnitName(exitUnit);
    const entryUnitFull = getFullUnitName(entryUnit);

    // For total acceptance, display in ENTRY UNIT (original reception unit)
    // Calculate the quantity in entry unit
    const qtyInEntryUnit = article ? (movement.qte / conversionFactor) : movement.qte;

    // Display with full unit name in ENTRY UNIT
    doc.text("Quantite Recue:        " + formatQty(qtyInEntryUnit) + " " + entryUnitFull, 15, yPos);
    yPos += 5;
    doc.text("Quantite Acceptee:     " + formatQty(qtyInEntryUnit) + " " + entryUnitFull, 15, yPos);
    yPos += 5;
    doc.text("(100% de la quantite recue)", 15, yPos);
    yPos += 8;

    // Conversion factor display (discreet, informative)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100); // Gray text for discreet appearance
    const conversionText = `Facteur de Conversion: 1 ${entryUnitFull} = ${conversionFactor} ${exitUnitFull}`;
    doc.text(conversionText, 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 10;
  }
  // CASE B: Partial Acceptance (With Defects)
  else if (isPartialAcceptance) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("QUANTITES", 10, yPos);
    yPos += 7;

    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, 200, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    const { qty: totalQty, unit: totalUnit } = getQuantityDisplay(movement);
    const validQty = movement.validQuantity !== undefined ? movement.validQuantity : movement.qte;
    const defectiveQty = movement.defectiveQuantity !== undefined ? movement.defectiveQuantity : 0;

    // Get article to access unit information
    const article = articles?.find(a => a.ref === movement.ref);
    const exitUnit = article?.uniteSortie || movement.uniteSortie || "unité";
    const entryUnit = article?.uniteEntree || "unité";
    const conversionFactor = article?.facteurConversion || 1;

    // Get full unit names
    const exitUnitFull = getFullUnitName(exitUnit);
    const entryUnitFull = getFullUnitName(entryUnit);

    // Display quantities with proper units (full names)
    // Quantité Reçue: in entry unit (original received quantity)
    const receivedInEntryUnit = article ? (movement.qte / conversionFactor) : movement.qte;
    doc.text("Quantite Recue:        " + formatQty(receivedInEntryUnit) + " " + entryUnitFull, 15, yPos);
    yPos += 5;
    
    // Quantité Acceptée: in exit unit (warehouse unit)
    doc.text("Quantite Acceptee:     " + formatQty(validQty) + " " + exitUnitFull, 15, yPos);
    yPos += 5;
    
    // Quantité Défectueuse: in exit unit (warehouse unit)
    doc.text("Quantite Defectueuse:  " + formatQty(defectiveQty) + " " + exitUnitFull, 15, yPos);
    yPos += 8;

    // Conversion factor display (discreet, informative)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100); // Gray text for discreet appearance
    const conversionText = `Facteur de Conversion: 1 ${entryUnitFull} = ${conversionFactor} ${exitUnitFull}`;
    doc.text(conversionText, 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 6;

    // Observations / Control Note
    if (movement.noteControle) {
      yPos += 2;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("OBSERVATIONS", 10, yPos);
      yPos += 7;

      // Separator line
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(10, yPos, 200, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const noteLines = doc.splitTextToSize(emergencyClean(movement.noteControle), 180);
      doc.text(noteLines, 15, yPos);
      yPos += noteLines.length * 5 + 5;
    }
  }
  // CASE C: Total Refusal (Refusé)
  else if (isTotalRefusal) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("MOTIF DU REFUS", 10, yPos);
    yPos += 7;

    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, 200, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const refusalReason = movement.refusalReason || movement.noteControle || "Non specifiee";
    const reasonLines = doc.splitTextToSize(emergencyClean(refusalReason), 180);
    doc.text(reasonLines, 15, yPos);
    yPos += reasonLines.length * 5 + 5;

    // Show zero acceptance
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Quantite Acceptee: 0 (REFUS TOTAL)", 15, yPos);
    yPos += 10;
  }

  // POINTS DE CONTRÔLE (Verification Checklist) - Minimalist text-based display
  if (movement.verificationPoints && Object.keys(movement.verificationPoints).length > 0) {
    yPos += 5;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("POINTS DE CONTROLE", 10, yPos);
    yPos += 7;

    // Separator line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, yPos, 200, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    
    const checklistLines = formatVerificationPoints(movement.verificationPoints, movement.type);
    checklistLines.forEach(line => {
      doc.text(emergencyClean(line), 15, yPos);
      yPos += 5;
    });
    
    yPos += 3;
  }

  // Professional Signature Section - Formal Layout
  yPos = 200;
  
  // Separator line before signatures
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;
  
  // Separator line before signatures
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  // Left column: Operator
  const leftX = 15;
  const rightX = 120;
  const signatureHeight = 20; // 2cm space for signature

  // Operator signature block
  doc.text("Signature de l'Operateur:", leftX, yPos);
  yPos += 4;
  
  // Empty space for signature (20mm = ~7.5 lines)
  doc.line(leftX, yPos + signatureHeight, leftX + 70, yPos + signatureHeight);
  yPos += signatureHeight + 3;
  
  // Operator name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Nom: " + emergencyClean(movement.operateur), leftX, yPos);
  yPos += 8;

  // QC Controller signature block
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature du Controleur Qualite:", rightX, yPos - 8);
  yPos -= 4;
  
  // Empty space for signature
  doc.line(rightX, yPos + signatureHeight, rightX + 70, yPos + signatureHeight);
  yPos += signatureHeight + 3;
  
  // QC Controller name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Nom: " + emergencyClean(movement.controleur || 'N/A'), rightX, yPos);
  yPos += 10;

  // Validation date at bottom (small, neutral font)
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const validationDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text("Date de Validation: " + emergencyClean(validationDate), 10, 285);

  // Save PDF
  const cleanTitle = isTotalRefusal ? "Avis_Refus_Reception" : "Bon_Entree";
  const cleanId = emergencyClean(movement.id);
  const filename = cleanTitle + "_" + cleanId + ".pdf";
  doc.save(filename);
};

// 2. Bon de Sortie (Outbound) - SIMPLIFIED with proper quantity display
export const generateOutboundPDF = async (movement: Mouvement) => {
  console.log('=== GENERATING OUTBOUND PDF ===');
  console.log('Movement:', movement);
  
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon de Sortie",
    movement,
    "Signature du Controleur Qualite:",
    (doc, yPos) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(emergencyClean("Details de la Sortie"), 10, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // ID and Date
      doc.text("ID du Mouvement: " + emergencyClean(movement.id), 15, yPos);
      yPos += 7;

      doc.text("Date de Sortie: " + emergencyClean(movement.date), 15, yPos);
      yPos += 7;

      doc.text("Article: " + emergencyClean(movement.article) + " (" + emergencyClean(movement.ref) + ")", 15, yPos);
      yPos += 7;

      // QUANTITY - ULTRA SIMPLE: Just one line
      const { qty, unit } = getQuantityDisplay(movement);
      doc.text("Quantite Saisie: " + qty + " " + unit, 15, yPos);
      yPos += 7;

      doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
      yPos += 7;

      const lotDate = movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A';
      doc.text("Date de lot: " + emergencyClean(lotDate), 15, yPos);
      yPos += 7;

      doc.text("Emplacement Source: " + emergencyClean(movement.emplacementSource || 'N/A'), 15, yPos);
      yPos += 7;

      doc.text("Destination: " + emergencyClean(movement.emplacementDestination), 15, yPos);
      yPos += 7;

      doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
      yPos += 7;

      if (movement.controleur) {
        doc.text("Controle Qualite: " + emergencyClean(movement.controleur), 15, yPos);
        yPos += 7;
      }

      doc.text("Date d'Approbation: " + emergencyClean(movement.date), 15, yPos);
      yPos += 10;

      // Quality Control Metrics - SIMPLIFIED
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(emergencyClean("Details de la Quantite"), 10, yPos);
      yPos += 10;

      doc.setFillColor(255, 255, 255);
      doc.rect(10, yPos - 5, 190, 28, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(10, yPos - 5, 190, 28, 'S');

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      // Use the final stock unit for QC metrics
      const qcQty = formatQty(movement.qte);
      const qcUnit = getUnit(movement.uniteSortie);

      // Total Quantity
      doc.setFont("helvetica", "bold");
      doc.text("Quantite Totale:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(qcQty + " " + qcUnit, 70, yPos);
      yPos += 8;

      // Valid Quantity
      const validQty = formatQty(movement.validQuantity !== undefined ? movement.validQuantity : movement.qte);
      doc.setFont("helvetica", "bold");
      doc.text("Quantite Valide:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(validQty + " " + qcUnit, 70, yPos);
      yPos += 8;

      // Defective Quantity
      const defectiveQty = formatQty(movement.defectiveQuantity !== undefined ? movement.defectiveQuantity : 0);
      doc.setFont("helvetica", "bold");
      doc.text("Quantite Defectueuse:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(defectiveQty + " " + qcUnit, 70, yPos);
    }
  );
};

// 3. Bon de Transfert (Transfer) - SIMPLIFIED with proper quantity display
export const generateTransferPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon de Transfert",
    movement,
    "Signature du Responsable Stock:",
    (doc, yPos) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(emergencyClean("Details du Transfert"), 10, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // ID and Date
      doc.text("ID du Mouvement: " + emergencyClean(movement.id), 15, yPos);
      yPos += 7;

      doc.text("Date de Transfert: " + emergencyClean(movement.date), 15, yPos);
      yPos += 7;

      doc.text("Article: " + emergencyClean(movement.article) + " (" + emergencyClean(movement.ref) + ")", 15, yPos);
      yPos += 7;

      // QUANTITY - ULTRA SIMPLE: Just one line
      const { qty, unit } = getQuantityDisplay(movement);
      doc.text("Quantite Saisie: " + qty + " " + unit, 15, yPos);
      yPos += 7;

      doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
      yPos += 7;

      if (movement.lotDate) {
        doc.text("Date de lot: " + emergencyClean(movement.lotDate), 15, yPos);
        yPos += 7;
      }

      doc.text("Zone Origine: " + emergencyClean(movement.emplacementSource || 'N/A'), 15, yPos);
      yPos += 7;

      doc.text("Zone Destination: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
      yPos += 7;

      doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
    }
  );
};

// 4. Bon d'Ajustement (Adjustment) - SIMPLIFIED with proper quantity display
export const generateAdjustmentPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon d'Ajustement",
    movement,
    "Signature du Responsable Inventaire:",
    (doc, yPos) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(emergencyClean("Details de l'Ajustement"), 10, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // ID and Date
      doc.text("ID du Mouvement: " + emergencyClean(movement.id), 15, yPos);
      yPos += 7;

      doc.text("Date d'Ajustement: " + emergencyClean(movement.date), 15, yPos);
      yPos += 7;

      doc.text("Article: " + emergencyClean(movement.article) + " (" + emergencyClean(movement.ref) + ")", 15, yPos);
      yPos += 7;

      doc.text("Type: " + emergencyClean(movement.typeAjustement || 'N/A'), 15, yPos);
      yPos += 7;

      // QUANTITY - ULTRA SIMPLE: Just one line
      const { qty, unit } = getQuantityDisplay(movement);
      doc.text("Quantite Ajustee: " + qty + " " + unit, 15, yPos);
      yPos += 7;

      doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
      yPos += 7;

      if (movement.lotDate) {
        doc.text("Date de lot: " + emergencyClean(movement.lotDate), 15, yPos);
        yPos += 7;
      }

      if (movement.motif) {
        doc.text("Motif de l'ajustement: " + emergencyClean(movement.motif), 15, yPos);
        yPos += 7;
      }

      doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
    }
  );
};

// 5. Bon de Rejet (Rejection Report) - Now uses centralized renderHeader() with Base64 logo and dynamic units
export const generateRejectionPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();
  
  const logoBase64 = await getLogoBase64();
  const contentStartY = renderHeader(doc, "Bon de Rejet", logoBase64);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  let yPos = contentStartY;
  
  // Simple lines - NO complex logic
  doc.text("ID du Mouvement: " + emergencyClean(movement.id), 15, yPos);
  yPos += 10;
  
  doc.text("Date: " + emergencyClean(movement.date), 15, yPos);
  yPos += 10;
  
  doc.text("Article: " + emergencyClean(movement.article), 15, yPos);
  yPos += 10;
  
  doc.text("Type: Sortie", 15, yPos);
  yPos += 10;
  
  // QUANTITY - ULTRA SIMPLE: Just one line
  const { qty, unit } = getQuantityDisplay(movement);
  doc.text("Quantite Saisie: " + qty + " " + unit, 15, yPos);
  yPos += 10;
  
  doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
  yPos += 10;
  
  const lotDate = movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A';
  doc.text("Date du Lot: " + emergencyClean(lotDate), 15, yPos);
  yPos += 10;
  
  doc.text("Emplacement Source: " + emergencyClean(movement.emplacementSource || 'N/A'), 15, yPos);
  yPos += 10;
  
  doc.text("Destination: Retour Fournisseur", 15, yPos);
  yPos += 10;
  
  doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
  yPos += 10;
  
  doc.text("Controleur Qualite: " + emergencyClean(movement.controleur || 'N/A'), 15, yPos);
  yPos += 15;
  
  // Raison du Rejet
  doc.setFont("helvetica", "bold");
  doc.text("Raison du Rejet:", 15, yPos);
  yPos += 10;
  doc.setFont("helvetica", "normal");
  const rejectionText = emergencyClean(movement.rejectionReason || "Non specifiee");
  const splitReason = doc.splitTextToSize(rejectionText, 180);
  doc.text(splitReason, 15, yPos);
  
  // Signature
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Signature du Controleur Qualite:", 120, 260, { align: "left" });
  doc.line(120, 268, 200, 268);
  
  // Save PDF
  const cleanId = emergencyClean(movement.id);
  const filename = "Bon_Rejet_" + cleanId + ".pdf";
  doc.save(filename);
};



// 6. Bon d'Inventaire (Inventory Receipt) - Shows inventory adjustment details
export const generateInventoryPDF = async (record: {
  id: number;
  dateHeure: string;
  article: string;
  ref: string;
  emplacement: string;
  stockTheorique: number;
  stockPhysique: number;
  ecart: number;
  uniteSortie: string;
}) => {
  console.log('=== GENERATING INVENTORY PDF ===');
  console.log('Record:', record);
  
  const doc = new jsPDF();

  // Render header with logo
  const logoBase64 = await getLogoBase64();
  const yAfterHeader = renderHeader(doc, "Bon d'Inventaire", logoBase64);

  let yPos = yAfterHeader + 5;

  // Details section
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(emergencyClean("Details de l'Inventaire"), 10, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // ID and Date
  doc.text("ID: " + emergencyClean(record.id), 15, yPos);
  yPos += 7;

  doc.text("Date et Heure: " + emergencyClean(record.dateHeure), 15, yPos);
  yPos += 7;

  doc.text("Article: " + emergencyClean(record.article) + " (" + emergencyClean(record.ref) + ")", 15, yPos);
  yPos += 7;

  doc.text("Emplacement: " + emergencyClean(record.emplacement), 15, yPos);
  yPos += 10;

  // Stock information - CLEAN TEXT ONLY
  doc.setFont("helvetica", "bold");
  doc.text("Comptage:", 15, yPos);
  yPos += 7;

  doc.setFont("helvetica", "normal");
  const unit = getUnit(record.uniteSortie);
  
  // Use pure text strings - NO formatting functions that might corrupt encoding
  const theoriqueText = "Stock Theorique: " + String(record.stockTheorique) + " " + unit;
  const physiqueText = "Stock Physique: " + String(record.stockPhysique) + " " + unit;
  const ecartSign = record.ecart > 0 ? "+" : "";
  const ecartText = "Ecart: " + ecartSign + String(record.ecart) + " " + unit;
  
  doc.text(theoriqueText, 20, yPos);
  yPos += 7;

  doc.text(physiqueText, 20, yPos);
  yPos += 7;

  // Écart with color coding
  if (record.ecart < 0) {
    doc.setTextColor(220, 38, 38); // Red for negative
  } else if (record.ecart > 0) {
    doc.setTextColor(59, 130, 246); // Blue for positive
  } else {
    doc.setTextColor(34, 197, 94); // Green for zero
  }
  doc.setFont("helvetica", "bold");
  doc.text(ecartText, 20, yPos);
  doc.setTextColor(0, 0, 0); // Reset to black
  yPos += 10;

  // Adjustment note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  if (record.ecart !== 0) {
    doc.text("Le stock a ete automatiquement ajuste selon cet ecart.", 15, yPos);
  } else {
    doc.text("Aucun ajustement necessaire - stock conforme.", 15, yPos);
  }

  // Signature section
  yPos = 250;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Signature du Responsable:", 140, yPos);
  doc.line(140, yPos + 15, 200, yPos + 15);

  // Save the PDF
  const filename = `Inventaire_${emergencyClean(record.ref)}_${emergencyClean(record.id)}.pdf`;
  doc.save(filename);
  console.log('✅ Inventory PDF generated:', filename);
};

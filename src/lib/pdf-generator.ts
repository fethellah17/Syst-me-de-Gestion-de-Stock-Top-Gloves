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
 * Generate professional PDF filename with product name and date
 * Format: Type_ProductName_Date.pdf
 * Example: Bon_Entree_Gants-Nitrile-M_09-04-2026.pdf
 */
const generatePDFFilename = (documentType: string, productName: string, isRefusal: boolean = false): string => {
  // Clean product name: remove special characters, replace spaces with hyphens
  const cleanProductName = emergencyClean(productName)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9\-]/g, '') // Remove special characters except hyphens
    .substring(0, 50); // Limit length for filesystem compatibility

  // Get current date in DD-MM-YYYY format
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');

  // Build filename based on document type
  let filename = '';
  if (isRefusal) {
    filename = `Avis_Refus_Reception_${cleanProductName}_${dateStr}.pdf`;
  } else {
    filename = `${documentType}_${cleanProductName}_${dateStr}.pdf`;
  }

  return filename;
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
 * Safely render observations/notes section in PDF
 * Handles text wrapping and encoding properly
 * Returns updated yPos for proper layout flow
 */
const renderObservationsSection = (doc: jsPDF, note: string, xPos: number, yPos: number): number => {
  if (!note || note.trim().length === 0) {
    return yPos; // Return unchanged yPos if no note
  }

  // Add fixed margin before section (ensures separation from previous section)
  yPos += 8;

  // Section title
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("OBSERVATIONS / NOTES DE CONTROLE", 10, yPos);
  yPos += 7;

  // Separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 6;

  // Clean and render note text
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  const cleanNote = emergencyClean(note);
  const noteLines = doc.splitTextToSize(cleanNote, 180);
  doc.text(noteLines, xPos, yPos);
  
  // Calculate new yPos based on number of lines
  // Each line is approximately 5mm, add extra margin after section
  yPos += noteLines.length * 5 + 8;
  
  return yPos;
};

/**
 * Safely render a quantity line in PDF
 * Ensures proper text encoding and no overlapping
 */
const renderQuantityLine = (doc: jsPDF, label: string, quantity: number, unit: string, xPos: number, yPos: number): void => {
  // Clean all components separately
  const cleanLabel = emergencyClean(label);
  const cleanQty = formatQty(quantity);
  const cleanUnit = emergencyClean(unit);
  
  // Build the complete text
  const fullText = `${cleanLabel} ${cleanQty} ${cleanUnit}`;
  
  // Render with proper font settings
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(fullText, xPos, yPos);
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
 * Calculate Quality Health Score (Taux de Conformité)
 * Formula: (Valid Quantity / Received Quantity) * 100
 * @returns Object with score percentage and contextual label
 */
const calculateQualityScore = (validQuantity: number, receivedQuantity: number): { score: number; label: string; isPerfect: boolean; isRefused: boolean } => {
  if (receivedQuantity === 0) {
    return { score: 0, label: "N/A", isPerfect: false, isRefused: true };
  }
  
  const score = (validQuantity / receivedQuantity) * 100;
  const roundedScore = Math.round(score * 10) / 10; // Round to 1 decimal place
  
  const isPerfect = roundedScore === 100;
  const isRefused = roundedScore === 0;
  
  let label = `${roundedScore.toLocaleString('fr-FR')}%`;
  if (isPerfect) {
    label += " (Réception Parfaite)";
  } else if (isRefused) {
    label += " (Refus Total)";
  }
  
  return { score: roundedScore, label, isPerfect, isRefused };
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
  const filename = generatePDFFilename(title, movement.article, false);
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

  // SLA Monitoring: Show if treatment was delayed
  if (movement.wasDelayed) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red text for delayed
    doc.text("Traitement: Retarde", 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont("helvetica", "normal");
    yPos += 5;
  }

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
    renderQuantityLine(doc, "Quantite Recue:", qtyInEntryUnit, entryUnitFull, 15, yPos);
    yPos += 5;
    renderQuantityLine(doc, "Quantite Acceptee:", qtyInEntryUnit, entryUnitFull, 15, yPos);
    yPos += 5;
    doc.text("(100% de la quantite recue)", 15, yPos);
    yPos += 8;

    // Quality Score - Total Acceptance (100%)
    const qualityScoreA = calculateQualityScore(qtyInEntryUnit, qtyInEntryUnit);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreA.label, 17, yPos + 3);
    yPos += 12;

    // Conversion factor display (discreet, informative)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100); // Gray text for discreet appearance
    const conversionText = `Facteur de Conversion: 1 ${entryUnitFull} = ${conversionFactor} ${exitUnitFull}`;
    doc.text(conversionText, 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 10;

    // Observations / Control Notes (if any)
    // Add fixed margin before observations section
    yPos = renderObservationsSection(doc, movement.noteControle || "", 15, yPos);
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
    renderQuantityLine(doc, "Quantite Recue:", receivedInEntryUnit, entryUnitFull, 15, yPos);
    yPos += 5;
    
    // Quantité Acceptée: in exit unit (warehouse unit)
    renderQuantityLine(doc, "Quantite Acceptee:", validQty, exitUnitFull, 15, yPos);
    yPos += 5;
    
    // Quantité Défectueuse: in exit unit (warehouse unit)
    renderQuantityLine(doc, "Quantite Defectueuse:", defectiveQty, exitUnitFull, 15, yPos);
    yPos += 8;

    // Quality Score - Partial Acceptance
    const qualityScoreB = calculateQualityScore(validQty, movement.qte);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreB.label, 17, yPos + 3);
    yPos += 12;

    // Conversion factor display (discreet, informative)
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100); // Gray text for discreet appearance
    const conversionText = `Facteur de Conversion: 1 ${entryUnitFull} = ${conversionFactor} ${exitUnitFull}`;
    doc.text(conversionText, 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    yPos += 6;

    // Observations / Control Notes (if any)
    // Add fixed margin before observations section
    yPos = renderObservationsSection(doc, movement.noteControle || "", 15, yPos);
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
    yPos += 8;

    // Quality Score - Total Refusal (0%)
    const qualityScoreC = calculateQualityScore(0, movement.qte);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreC.label, 17, yPos + 3);
    yPos += 10;
  }

  // POINTS DE CONTRÔLE (Verification Checklist) - Minimalist text-based display
  // IMPORTANT: This section comes AFTER observations
  if (movement.verificationPoints && Object.keys(movement.verificationPoints).length > 0) {
    // Add fixed margin before checklist section
    yPos += 8;
    
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
    
    yPos += 5; // Add margin after checklist
  }

  // Professional Signature Section - Formal Layout
  // IMPORTANT: Position signatures dynamically, ensuring minimum space before them
  const minSignatureY = 180; // Minimum Y position for signatures
  if (yPos < minSignatureY) {
    yPos = minSignatureY;
  }
  
  // Add fixed margin before signature section
  yPos += 8;
  
  // Separator line before signatures
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  // ============================================================================
  // PROFESSIONAL SIDE-BY-SIDE SIGNATURE SECTION
  // ============================================================================
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Column positions
  const leftX = 15;
  const rightX = 115;
  const signatureHeight = 18; // Space for hand signature (2cm)
  const columnWidth = 70; // Width of each signature block

  // ========== LEFT COLUMN: OPERATOR SIGNATURE ==========
  
  // Title
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature de l'Operateur:", leftX, yPos);
  yPos += 6;
  
  // Empty space for signature (horizontal line)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(leftX, yPos + signatureHeight, leftX + columnWidth, yPos + signatureHeight);
  yPos += signatureHeight + 5;
  
  // Printed name
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Nom: " + emergencyClean(movement.operateur), leftX, yPos);

  // ========== RIGHT COLUMN: QC CONTROLLER SIGNATURE ==========
  
  // Reset yPos to align with left column
  let signatureYPos = yPos - signatureHeight - 5 - 6;
  
  // Title
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature du Controleur Qualite:", rightX, signatureYPos);
  signatureYPos += 6;
  
  // Empty space for signature (horizontal line)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(rightX, signatureYPos + signatureHeight, rightX + columnWidth, signatureYPos + signatureHeight);
  signatureYPos += signatureHeight + 5;
  
  // Printed name
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Nom: " + emergencyClean(movement.controleur || 'N/A'), rightX, signatureYPos);
  
  // Move yPos to bottom of signature section
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

  // Footer Timestamp - Discreet, professional
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100); // Gray text for discreet appearance
  const generationDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const footerText = `Document genere automatiquement par le Systeme de Gestion de Stock Top Gloves le ${generationDate}`;
  doc.text(emergencyClean(footerText), 10, 292, { maxWidth: 190 });
  doc.setTextColor(0, 0, 0); // Reset to black

  // Save PDF
  const isRefusal = isTotalRefusal;
  const filename = generatePDFFilename("Bon_Entree", movement.article, isRefusal);
  doc.save(filename);
};

// 2. Bon de Sortie (Outbound) - PROFESSIONAL BLACK & WHITE matching Entrée standards
export const generateOutboundPDF = async (movement: Mouvement, articles?: any[]) => {
  console.log('=== GENERATING OUTBOUND PDF ===');
  console.log('Movement:', movement);
  
  const doc = new jsPDF();
  const logoBase64 = await getLogoBase64();

  // Determine QC outcome
  const isTotalRefusal = movement.qcStatus === "Non-conforme" && movement.validQuantity === 0;
  const isPartialAcceptance = movement.qcStatus === "Non-conforme" && movement.validQuantity !== undefined && movement.validQuantity > 0;
  const isTotalAcceptance = movement.qcStatus === "Conforme" || (movement.validQuantity === movement.qte && movement.defectiveQuantity === 0);

  // Dynamic title based on QC outcome
  let titleText = "BON DE SORTIE";
  if (isTotalRefusal) {
    titleText = "AVIS DE REFUS DE SORTIE";
  }

  const contentStartY = renderHeader(doc, titleText, logoBase64);
  let yPos = contentStartY;

  // Movement Details Section - Simple Black & White
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DETAILS DE LA SORTIE", 10, yPos);
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

  doc.text("Date de Sortie: " + emergencyClean(movement.date), 15, yPos);
  yPos += 5;

  // SLA Monitoring: Show if treatment was delayed
  if (movement.wasDelayed) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red text for delayed
    doc.text("Traitement: Retarde", 15, yPos);
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont("helvetica", "normal");
    yPos += 5;
  }

  doc.text("Numero de Lot: " + emergencyClean(movement.lotNumber || 'N/A'), 15, yPos);
  yPos += 5;

  const lotDate = movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A';
  doc.text("Date du Lot: " + emergencyClean(lotDate), 15, yPos);
  yPos += 5;

  doc.text("Zone Source: " + emergencyClean(movement.emplacementSource || 'N/A'), 15, yPos);
  yPos += 5;

  doc.text("Destination: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
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

    // Get article to access unit information
    const article = articles?.find(a => a.ref === movement.ref);
    const exitUnit = article?.uniteSortie || movement.uniteSortie || "unité";
    const exitUnitFull = getFullUnitName(exitUnit);

    // For sortie, display in EXIT UNIT (warehouse unit)
    renderQuantityLine(doc, "Quantite Demandee:", movement.qte, exitUnitFull, 15, yPos);
    yPos += 5;
    renderQuantityLine(doc, "Quantite Validee:", movement.qte, exitUnitFull, 15, yPos);
    yPos += 5;
    doc.text("(100% de la quantite demandee)", 15, yPos);
    yPos += 8;

    // Quality Score - Total Acceptance (100%)
    const qualityScoreA = calculateQualityScore(movement.qte, movement.qte);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreA.label, 17, yPos + 3);
    yPos += 12;

    // Observations / Control Notes (if any)
    yPos = renderObservationsSection(doc, movement.noteControle || "", 15, yPos);
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

    const validQty = movement.validQuantity !== undefined ? movement.validQuantity : movement.qte;
    const defectiveQty = movement.defectiveQuantity !== undefined ? movement.defectiveQuantity : 0;

    // Get article to access unit information
    const article = articles?.find(a => a.ref === movement.ref);
    const exitUnit = article?.uniteSortie || movement.uniteSortie || "unité";
    const exitUnitFull = getFullUnitName(exitUnit);

    // Display quantities with proper units (full names)
    renderQuantityLine(doc, "Quantite Demandee:", movement.qte, exitUnitFull, 15, yPos);
    yPos += 5;
    
    renderQuantityLine(doc, "Quantite Validee:", validQty, exitUnitFull, 15, yPos);
    yPos += 5;
    
    renderQuantityLine(doc, "Quantite Endommagee:", defectiveQty, exitUnitFull, 15, yPos);
    yPos += 8;

    // Quality Score - Partial Acceptance
    const qualityScoreB = calculateQualityScore(validQty, movement.qte);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreB.label, 17, yPos + 3);
    yPos += 12;

    // Observations / Control Notes (if any)
    yPos = renderObservationsSection(doc, movement.noteControle || "", 15, yPos);
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
    doc.text("Quantite Validee: 0 (REFUS TOTAL)", 15, yPos);
    yPos += 8;

    // Quality Score - Total Refusal (0%)
    const qualityScoreC = calculateQualityScore(0, movement.qte);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    
    // Draw simple box around quality score
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 2, 100, 8, 'S');
    
    doc.text("Taux de Conformite: " + qualityScoreC.label, 17, yPos + 3);
    yPos += 10;
  }

  // POINTS DE CONTRÔLE (Verification Checklist) - Minimalist text-based display
  if (movement.verificationPoints && Object.keys(movement.verificationPoints).length > 0) {
    yPos += 8;
    
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
    
    yPos += 5;
  }

  // Professional Signature Section - Formal Layout
  const minSignatureY = 180;
  if (yPos < minSignatureY) {
    yPos = minSignatureY;
  }
  
  yPos += 8;
  
  // Separator line before signatures
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 200, yPos);
  yPos += 8;

  // ============================================================================
  // PROFESSIONAL SIDE-BY-SIDE SIGNATURE SECTION
  // ============================================================================
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);

  // Column positions
  const leftX = 15;
  const rightX = 115;
  const signatureHeight = 18;
  const columnWidth = 70;

  // ========== LEFT COLUMN: OPERATOR SIGNATURE ==========
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature de l'Operateur:", leftX, yPos);
  yPos += 6;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(leftX, yPos + signatureHeight, leftX + columnWidth, yPos + signatureHeight);
  yPos += signatureHeight + 5;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Nom: " + emergencyClean(movement.operateur), leftX, yPos);

  // ========== RIGHT COLUMN: QC CONTROLLER SIGNATURE ==========
  
  let signatureYPos = yPos - signatureHeight - 5 - 6;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Signature du Controleur Qualite:", rightX, signatureYPos);
  signatureYPos += 6;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(rightX, signatureYPos + signatureHeight, rightX + columnWidth, signatureYPos + signatureHeight);
  signatureYPos += signatureHeight + 5;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Nom: " + emergencyClean(movement.controleur || 'N/A'), rightX, signatureYPos);
  
  yPos += 10;

  // Validation date at bottom
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

  // Footer Timestamp
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const generationDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const footerText = `Document genere automatiquement par le Systeme de Gestion de Stock Top Gloves le ${generationDate}`;
  doc.text(emergencyClean(footerText), 10, 292, { maxWidth: 190 });
  doc.setTextColor(0, 0, 0);

  // Save PDF
  const isRefusal = isTotalRefusal;
  const filename = generatePDFFilename("Bon_Sortie", movement.article, isRefusal);
  doc.save(filename);
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
  const filename = generatePDFFilename("Bon_Rejet", movement.article, false);
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
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
  const cleanArticle = emergencyClean(record.article)
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .substring(0, 50);
  const filename = `Inventaire_${cleanArticle}_${dateStr}.pdf`;
  doc.save(filename);
  console.log('✅ Inventory PDF generated:', filename);
};

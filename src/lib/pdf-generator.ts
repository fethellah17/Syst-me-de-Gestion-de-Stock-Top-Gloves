import jsPDF from 'jspdf';
import type { Mouvement } from '@/contexts/DataContext';
import { getUnitSymbol } from './units-storage';

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

// 1. Bon d'Entree (Inbound) - SIMPLIFIED with proper quantity display
export const generateInboundPDF = async (movement: Mouvement) => {
  console.log('=== GENERATING INBOUND PDF ===');
  console.log('Movement:', movement);
  
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon d'Entree",
    movement,
    "Signature du Receptionnaire:",
    (doc, yPos) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(emergencyClean("Details de l'Entree"), 10, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // ID and Date
      doc.text("ID du Mouvement: " + emergencyClean(movement.id), 15, yPos);
      yPos += 7;

      doc.text("Date d'Entree: " + emergencyClean(movement.date), 15, yPos);
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

      doc.text("Source: " + emergencyClean(movement.emplacementDestination || 'N/A'), 15, yPos);
      yPos += 7;

      doc.text("Operateur: " + emergencyClean(movement.operateur), 15, yPos);
    }
  );
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



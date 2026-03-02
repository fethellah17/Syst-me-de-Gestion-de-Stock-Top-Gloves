import jsPDF from 'jspdf';
import type { Mouvement } from '@/contexts/DataContext';

// Standardized PDF Template - Monochrome Design
// Logo: Square 20x20mm top-left (slightly smaller)
// Company Name: "Top Gloves" directly below logo
// Signature: Bottom-right

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
      console.warn('⚠️ Logo file not found at /logo.jpg');
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
    console.error('❌ Failed to load logo:', error);
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
    console.log('✅ Logo loaded and cached successfully');
  } else {
    console.warn('⚠️ Logo could not be loaded - PDFs will be generated without logo');
  }
  
  return cachedLogoBase64;
};

/**
 * Centralized Header Rendering Function
 * Ensures consistent header layout across all PDF documents
 * 
 * @param doc - jsPDF document instance
 * @param title - Document title (e.g., "Bon d'Entrée", "Bon de Sortie")
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
      console.log('✅ Logo added to PDF');
    } catch (error) {
      console.error('❌ Failed to add logo to PDF:', error);
    }
  } else {
    console.warn('⚠️ No logo data available for PDF');
  }
  
  // Company Name - "Top Gloves" directly underneath logo
  const companyNameY = logoY + logoSize + 5; // 5mm below logo
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // Black
  doc.text("Top Gloves", logoX, companyNameY);
  
  // Title - Aligned right
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(title, 200, 20, { align: "right" });
  
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
  doc.text(`Date du rapport: ${reportDate}`, 200, 28, { align: "right" });
  
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
  doc.text(signatureText, 120, 260, { align: "left" });
  doc.line(120, 268, 200, 268);

  // Save PDF
  const filename = `${title.replace(/\s+/g, '_')}_${movement.id}.pdf`;
  doc.save(filename);
};

// 1. Bon d'Entrée (Inbound) - UPDATED with async/await
export const generateInboundPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon d'Entrée",
    movement,
    "Signature du Réceptionnaire:",
    (doc, yPos) => {
      // Section Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Détails de l'Entrée", 10, yPos);
      yPos += 10;

      // Fields - All in black
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`ID du Mouvement: ${movement.id}`, 15, yPos);
      yPos += 7;

      doc.text(`Date d'Entrée: ${movement.date}`, 15, yPos);
      yPos += 7;

      doc.text(`Article: ${movement.article} (${movement.ref})`, 15, yPos);
      yPos += 7;

      doc.text(`Quantité: ${movement.qte}`, 15, yPos);
      yPos += 7;

      doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Date de lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, yPos);
      yPos += 7;

      // Source field (renamed from "Fournisseur / Source")
      doc.text(`Source: ${movement.emplacementDestination || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Opérateur: ${movement.operateur}`, 15, yPos);
    }
  );
};

// 2. Bon de Sortie (Outbound) - Existing with QC metrics, now async
export const generateOutboundPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon de Sortie",
    movement,
    "Signature du Contrôleur Qualité:",
    (doc, yPos) => {
      // Section Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Détails de la Sortie", 10, yPos);
      yPos += 10;

      // Fields
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`ID du Mouvement: ${movement.id}`, 15, yPos);
      yPos += 7;

      doc.text(`Date de Sortie: ${movement.date}`, 15, yPos);
      yPos += 7;

      doc.text(`Article: ${movement.article} (${movement.ref})`, 15, yPos);
      yPos += 7;

      doc.text(`Quantité: ${movement.qte}`, 15, yPos);
      yPos += 7;

      doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Date de lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Emplacement Source: ${movement.emplacementSource || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Destination: ${movement.emplacementDestination}`, 15, yPos);
      yPos += 7;

      doc.text(`Opérateur: ${movement.operateur}`, 15, yPos);
      yPos += 7;

      if (movement.controleur) {
        doc.text(`Contrôle qualité: ${movement.controleur}`, 15, yPos);
        yPos += 7;
      }

      doc.text(`Date d'Approbation: ${movement.date}`, 15, yPos);
      yPos += 10;

      // Quality Control Metrics Section - Monochrome
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Détails de la Quantité", 10, yPos);
      yPos += 10;

      // White box with black border
      doc.setFillColor(255, 255, 255);
      doc.rect(10, yPos - 5, 190, 28, 'F');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(10, yPos - 5, 190, 28, 'S');

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0); // All black

      // Total Quantity
      doc.setFont("helvetica", "bold");
      doc.text("Quantité Totale:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${movement.qte}`, 70, yPos);
      yPos += 8;

      // Valid Quantity - Black (no green)
      const validQty = movement.validQuantity !== undefined ? movement.validQuantity : movement.qte;
      doc.setFont("helvetica", "bold");
      doc.text("Quantité Valide:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${validQty}`, 70, yPos);
      yPos += 8;

      // Defective Quantity - Black (no red)
      const defectiveQty = movement.defectiveQuantity !== undefined ? movement.defectiveQuantity : 0;
      doc.setFont("helvetica", "bold");
      doc.text("Quantité Défectueuse:", 15, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(`${defectiveQty}`, 70, yPos);
    }
  );
};

// 3. Bon de Transfert (Transfer) - UPDATED with async/await
export const generateTransferPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon de Transfert",
    movement,
    "Signature du Responsable Stock:",
    (doc, yPos) => {
      // Section Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Détails du Transfert", 10, yPos);
      yPos += 10;

      // Fields
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`ID du Mouvement: ${movement.id}`, 15, yPos);
      yPos += 7;

      doc.text(`Date de Transfert: ${movement.date}`, 15, yPos);
      yPos += 7;

      doc.text(`Article: ${movement.article} (${movement.ref})`, 15, yPos);
      yPos += 7;

      doc.text(`Quantité: ${movement.qte}`, 15, yPos);
      yPos += 7;

      doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
      yPos += 7;

      // Date de lot field
      if (movement.lotDate) {
        doc.text(`Date de lot: ${movement.lotDate}`, 15, yPos);
        yPos += 7;
      }

      doc.text(`Zone Origine: ${movement.emplacementSource || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Zone Destination: ${movement.emplacementDestination || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Opérateur: ${movement.operateur}`, 15, yPos);
    }
  );
};

// 4. Bon d'Ajustement (Adjustment) - UPDATED with async/await
export const generateAdjustmentPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();

  await generatePDFTemplate(
    doc,
    "Bon d'Ajustement",
    movement,
    "Signature du Responsable Inventaire:",
    (doc, yPos) => {
      // Section Title
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Détails de l'Ajustement", 10, yPos);
      yPos += 10;

      // Fields
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`ID du Mouvement: ${movement.id}`, 15, yPos);
      yPos += 7;

      doc.text(`Date d'Ajustement: ${movement.date}`, 15, yPos);
      yPos += 7;

      doc.text(`Article: ${movement.article} (${movement.ref})`, 15, yPos);
      yPos += 7;

      doc.text(`Type: ${movement.typeAjustement || 'N/A'}`, 15, yPos);
      yPos += 7;

      doc.text(`Quantité Ajustée: ${movement.qte}`, 15, yPos);
      yPos += 7;

      doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
      yPos += 7;

      // Date de lot field
      if (movement.lotDate) {
        doc.text(`Date de lot: ${movement.lotDate}`, 15, yPos);
        yPos += 7;
      }

      if (movement.motif) {
        doc.text(`Motif de l'ajustement: ${movement.motif}`, 15, yPos);
        yPos += 7;
      }

      doc.text(`Opérateur: ${movement.operateur}`, 15, yPos);
    }
  );
};

// 5. Bon de Rejet (Rejection Report) - Now uses centralized renderHeader() with Base64 logo
export const generateRejectionPDF = async (movement: Mouvement) => {
  const doc = new jsPDF();
  
  // Load logo as Base64 (cached after first load)
  const logoBase64 = await getLogoBase64();
  
  // Render standardized header using centralized function
  const contentStartY = renderHeader(doc, "Bon de Rejet", logoBase64);
  
  // === BODY CONTENT ===
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  
  let yPos = contentStartY;
  doc.text(`ID du Mouvement: ${movement.id}`, 15, yPos);
  yPos += 10;
  doc.text(`Date: ${movement.date}`, 15, yPos);
  yPos += 10;
  doc.text(`Article: ${movement.article}`, 15, yPos);
  yPos += 10;
  doc.text(`Type: Sortie`, 15, yPos);
  yPos += 10;
  doc.text(`Quantité: ${movement.qte}`, 15, yPos);
  yPos += 10;
  doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, yPos);
  yPos += 10;
  doc.text(`Date du Lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, yPos);
  yPos += 10;
  doc.text(`Emplacement Source: ${movement.emplacementSource || 'N/A'}`, 15, yPos);
  yPos += 10;
  doc.text(`Destination: Retour Fournisseur`, 15, yPos);
  yPos += 10;
  doc.text(`Opérateur: ${movement.operateur}`, 15, yPos);
  yPos += 10;
  doc.text(`Contrôleur Qualité: ${movement.controleur || 'N/A'}`, 15, yPos);
  yPos += 15;
  
  // Raison du Rejet (with word wrap)
  doc.setFont("helvetica", "bold");
  doc.text(`Raison du Rejet:`, 15, yPos);
  yPos += 10;
  doc.setFont("helvetica", "normal");
  const rejectionText = movement.rejectionReason || "Non spécifiée";
  const splitReason = doc.splitTextToSize(rejectionText, 180);
  doc.text(splitReason, 15, yPos);
  
  // === SIGNATURE SECTION - BOTTOM RIGHT ===
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Signature du Contrôleur Qualité:", 120, 260, { align: "left" });
  doc.line(120, 268, 200, 268);
  
  // Save PDF
  doc.save(`Bon_Rejet_${movement.id}.pdf`);
};

import jsPDF from 'jspdf';
import type { Mouvement } from '@/contexts/DataContext';

// Standardized PDF Template - Monochrome Design
// Logo: Square 25x25mm top-left
// Company Name: "Top Gloves" below logo
// Signature: Bottom-right

const generatePDFTemplate = (
  doc: jsPDF,
  title: string,
  movement: Mouvement,
  signatureText: string,
  contentCallback: (doc: jsPDF, yPos: number) => void
) => {
  const logo = new Image();
  logo.src = '/logo-topgloves.jpg';

  logo.onload = () => {
    // Logo - Square 25x25mm top-left
    const logoSize = 25;
    doc.addImage(logo, 'JPEG', 10, 10, logoSize, logoSize);

    // Company Name - "Top Gloves" below logo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black
    doc.text("Top Gloves", 10, 40);

    // Title - Aligned right
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 200, 20, { align: "right" });

    // Report Date - Aligned right
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

    // Separator Line - Black
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, 48, 200, 48);

    // Content Section
    contentCallback(doc, 58);

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

  // Fallback without logo
  logo.onerror = () => {
    // Company Name without logo
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Top Gloves", 10, 20);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 200, 20, { align: "right" });

    // Report Date
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

    // Separator Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, 48, 200, 48);

    // Content
    contentCallback(doc, 58);

    // Signature
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(signatureText, 120, 260, { align: "left" });
    doc.line(120, 268, 200, 268);

    // Save
    const filename = `${title.replace(/\s+/g, '_')}_${movement.id}.pdf`;
    doc.save(filename);
  };
};

// 1. Bon d'Entrée (Inbound) - UPDATED
export const generateInboundPDF = (movement: Mouvement) => {
  const doc = new jsPDF();

  generatePDFTemplate(
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

// 2. Bon de Sortie (Outbound) - Existing with QC metrics
export const generateOutboundPDF = (movement: Mouvement) => {
  const doc = new jsPDF();

  generatePDFTemplate(
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

// 3. Bon de Transfert (Transfer) - UPDATED
export const generateTransferPDF = (movement: Mouvement) => {
  const doc = new jsPDF();

  generatePDFTemplate(
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

// 4. Bon d'Ajustement (Adjustment) - UPDATED
export const generateAdjustmentPDF = (movement: Mouvement) => {
  const doc = new jsPDF();

  generatePDFTemplate(
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

// 5. Bon de Rejet (Rejection Report) - Fixed Template with Absolute Positioning
export const generateRejectionPDF = (movement: Mouvement) => {
  const doc = new jsPDF();
  
  const logo = new Image();
  logo.src = '/logo-topgloves.jpg';
  
  logo.onload = () => {
    // === HEADER SECTION ===
    // Logo - Square 25x25mm top-left (Fixed coordinates)
    const logoSize = 25;
    doc.addImage(logo, 'JPEG', 10, 10, logoSize, logoSize);
    
    // Company Name - "Top Gloves" below logo (Fixed coordinates)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0); // Black only
    doc.text("Top Gloves", 10, 40);
    
    // Title - "Bon de Rejet" aligned right (Fixed coordinates)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bon de Rejet", 200, 20, { align: "right" });
    
    // Report Date - Aligned right (Fixed coordinates)
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
    
    // Separator Line - Black (Fixed coordinates)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, 48, 200, 48);
    
    // === BODY CONTENT - FIXED LAYOUT ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black only
    
    // Fixed Y positions for each field (absolute positioning)
    doc.text(`ID du Mouvement: ${movement.id}`, 15, 60);
    doc.text(`Date: ${movement.date}`, 15, 70);
    doc.text(`Article: ${movement.article}`, 15, 80);
    doc.text(`Type: Sortie`, 15, 90);
    doc.text(`Quantité: ${movement.qte}`, 15, 100);
    doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, 110);
    doc.text(`Date du Lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, 120);
    doc.text(`Emplacement Source: ${movement.emplacementSource || 'N/A'}`, 15, 130);
    doc.text(`Destination: Retour Fournisseur`, 15, 140);
    doc.text(`Opérateur: ${movement.operateur}`, 15, 150);
    doc.text(`Contrôleur Qualité: ${movement.controleur || 'N/A'}`, 15, 160);
    
    // Raison du Rejet (Fixed position with word wrap)
    doc.setFont("helvetica", "bold");
    doc.text(`Raison du Rejet:`, 15, 175);
    doc.setFont("helvetica", "normal");
    const rejectionText = movement.rejectionReason || "Non spécifiée";
    const splitReason = doc.splitTextToSize(rejectionText, 180);
    doc.text(splitReason, 15, 185);
    
    // === SIGNATURE SECTION - BOTTOM RIGHT (Fixed coordinates) ===
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Signature du Contrôleur Qualité:", 120, 260, { align: "left" });
    doc.line(120, 268, 200, 268);
    
    // Save PDF
    doc.save(`Bon_Rejet_${movement.id}.pdf`);
  };
  
  // Fallback without logo
  logo.onerror = () => {
    // === HEADER SECTION (Fallback) ===
    // Company Name without logo (Fixed coordinates)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Top Gloves", 10, 20);
    
    // Title - "Bon de Rejet" aligned right (Fixed coordinates)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bon de Rejet", 200, 20, { align: "right" });
    
    // Report Date (Fixed coordinates)
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
    
    // Separator Line (Fixed coordinates)
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(10, 35, 200, 35);
    
    // === BODY CONTENT - FIXED LAYOUT ===
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    
    // Fixed Y positions (adjusted for no logo)
    doc.text(`ID du Mouvement: ${movement.id}`, 15, 50);
    doc.text(`Date: ${movement.date}`, 15, 60);
    doc.text(`Article: ${movement.article}`, 15, 70);
    doc.text(`Type: Sortie`, 15, 80);
    doc.text(`Quantité: ${movement.qte}`, 15, 90);
    doc.text(`Numéro de Lot: ${movement.lotNumber || 'N/A'}`, 15, 100);
    doc.text(`Date du Lot: ${movement.lotDate ? new Date(movement.lotDate).toLocaleDateString('fr-FR') : 'N/A'}`, 15, 110);
    doc.text(`Emplacement Source: ${movement.emplacementSource || 'N/A'}`, 15, 120);
    doc.text(`Destination: Retour Fournisseur`, 15, 130);
    doc.text(`Opérateur: ${movement.operateur}`, 15, 140);
    doc.text(`Contrôleur Qualité: ${movement.controleur || 'N/A'}`, 15, 150);
    
    // Raison du Rejet (Fixed position)
    doc.setFont("helvetica", "bold");
    doc.text(`Raison du Rejet:`, 15, 165);
    doc.setFont("helvetica", "normal");
    const rejectionText = movement.rejectionReason || "Non spécifiée";
    const splitReason = doc.splitTextToSize(rejectionText, 180);
    doc.text(splitReason, 15, 175);
    
    // === SIGNATURE SECTION - BOTTOM RIGHT (Fixed coordinates) ===
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Signature du Contrôleur Qualité:", 120, 260, { align: "left" });
    doc.line(120, 268, 200, 268);
    
    // Save PDF
    doc.save(`Bon_Rejet_${movement.id}.pdf`);
  };
};

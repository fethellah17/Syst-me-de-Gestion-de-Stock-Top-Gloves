import jsPDF from 'jspdf';
import type { Mouvement, Article, Supplier, Operation } from '@/contexts/DataContext';

/**
 * Emergency clean function - same as pdf-generator.ts
 * Removes problematic characters for PDF text encoding
 */
const emergencyClean = (text: string | number): string => {
  let result = String(text);
  result = result.replace(/&/g, '');
  result = result.replace(/&#\d+;/g, '');
  result = result.replace(/&[a-zA-Z]+;/g, '');
  result = result.replace(/\s+/g, ' ').trim();
  return result;
};

/**
 * Format quantity with French locale - same as pdf-generator.ts formatQty
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
 * Get source label - same logic as MovementTable.tsx getSourceLabel
 */
const getSourceLabel = (mouvement: Mouvement): string => {
  if (mouvement.type === "Sortie" || mouvement.type === "Transfert" || mouvement.type === "Ajustement") {
    return mouvement.emplacementSource || "N/A";
  }
  return "—";
};

/**
 * Get destination label - same logic as MovementTable.tsx getDestinationLabel
 */
const getDestinationLabel = (mouvement: Mouvement): string => {
  if (mouvement.type === "Entrée" || mouvement.type === "Transfert") {
    return mouvement.emplacementDestination;
  }
  if (mouvement.type === "Sortie") {
    return mouvement.emplacementDestination;
  }
  if (mouvement.type === "Ajustement") {
    return "—";
  }
  return "N/A";
};

/**
 * Get logo as base64 - same as pdf-generator.ts
 */
let cachedLogoBase64: string | null | undefined = undefined;

const loadLogoAsBase64 = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/jpeg');
          resolve(dataURL);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Error converting logo to base64:', error);
        resolve(null);
      }
    };
    img.onerror = () => {
      console.error('Failed to load logo image');
      resolve(null);
    };
    img.src = '/logo-topgloves.jpg';
  });
};

const getLogoBase64 = async (): Promise<string | null> => {
  if (cachedLogoBase64 !== undefined) {
    return cachedLogoBase64;
  }
  cachedLogoBase64 = await loadLogoAsBase64();
  return cachedLogoBase64;
};

/**
 * Render header - same style as pdf-generator.ts renderHeader
 */
const renderHeader = (doc: jsPDF, title: string, logoBase64?: string | null): number => {
  const logoSize = 20;
  const logoX = 10;
  const logoY = 10;
  
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', logoX, logoY, logoSize, logoSize);
    } catch (error) {
      console.error('Failed to add logo to PDF:', error);
    }
  }
  
  const companyNameY = logoY + logoSize + 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(emergencyClean("Top Gloves"), logoX, companyNameY);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(emergencyClean(title), 287, 20, { align: "right" });
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const reportDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(emergencyClean("Date du rapport: " + reportDate), 287, 28, { align: "right" });
  
  const separatorY = companyNameY + 8;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, separatorY, 287, separatorY);
  
  return separatorY + 10;
};

/**
 * Build operation PDF rows - pure function
 * Returns headers and rows for the operation table
 */
export function buildOperationPdfRows(
  operation: Operation,
  lines: Mouvement[],
  articles: Article[],
  suppliers?: Supplier[]
): { headers: string[]; rows: string[][] } {
  const type = operation.type;
  
  // Define headers based on operation type
  let headers: string[];
  if (type === "Entrée") {
    headers = [
      "Article",
      "N° Lot",
      "Qté Saisie",
      "Impact Stock",
      "Qté Valide",
      "Qté Défect.",
      "Fournisseur",
      "Destination"
    ];
  } else {
    // Sortie and Transfert
    headers = [
      "Article",
      "N° Lot",
      "Qté Saisie",
      "Impact Stock",
      "Qté Valide",
      "Qté Défect.",
      "Source",
      "Destination"
    ];
  }
  
  // Build rows
  const rows = lines.map(line => {
    const article = articles.find(a => a.ref === line.ref);
    
    // Article name
    const articleName = emergencyClean(line.article);
    
    // Lot number
    const lotNumber = emergencyClean(line.lotNumber || "—");
    
    // Qté Saisie (original quantity with entry unit)
    const qtySaisie = line.qteOriginale !== undefined 
      ? `${formatQty(line.qteOriginale)} ${line.uniteUtilisee || ""}`.trim()
      : `${formatQty(line.qte)} ${line.uniteSortie || ""}`.trim();
    
    // Impact Stock (always in exit unit)
    const impactStock = `${formatQty(line.qte)} ${line.uniteSortie || ""}`.trim();
    
    // Qté Valide
    const qtyValide = type === "Transfert" 
      ? "—" 
      : line.validQuantity !== undefined 
        ? formatQty(line.validQuantity) 
        : "—";
    
    // Qté Défect.
    const qtyDefect = type === "Transfert" 
      ? "—" 
      : (line.defectiveQuantity !== undefined && line.defectiveQuantity > 0) 
        ? formatQty(line.defectiveQuantity) 
        : "—";
    
    // Source or Fournisseur
    const sourceOrSupplier = type === "Entrée" 
      ? emergencyClean(line.fournisseur || "—")
      : emergencyClean(getSourceLabel(line));
    
    // Destination
    const destination = emergencyClean(getDestinationLabel(line));
    
    return [
      articleName,
      lotNumber,
      qtySaisie,
      impactStock,
      qtyValide,
      qtyDefect,
      sourceOrSupplier,
      destination
    ];
  });
  
  return { headers, rows };
}

/**
 * Generate operation PDF - landscape A4 with table
 */
export const generateOperationPDF = async (
  operation: Operation,
  lines: Mouvement[],
  articles: Article[],
  suppliers?: Supplier[]
): Promise<void> => {
  // Create landscape A4 document
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const logoBase64 = await getLogoBase64();
  
  // Title based on operation type
  let titleText = "BON D'OPERATION";
  if (operation.type === "Entrée") {
    titleText = "BON D'ENTREE";
  } else if (operation.type === "Sortie") {
    titleText = "BON DE SORTIE";
  } else if (operation.type === "Transfert") {
    titleText = "BON DE TRANSFERT";
  }
  titleText += ` - ${operation.reference}`;
  
  const contentStartY = renderHeader(doc, titleText, logoBase64);
  let yPos = contentStartY;
  
  // Operation details section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DETAILS DE L'OPERATION", 10, yPos);
  yPos += 7;
  
  // Separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 287, yPos);
  yPos += 6;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  // Reference
  doc.text("Reference: " + emergencyClean(operation.reference), 15, yPos);
  yPos += 5;
  
  // Document d'origine
  doc.text("Document d'origine: " + emergencyClean(operation.documentOrigine || "—"), 15, yPos);
  yPos += 5;
  
  // Date planifiée
  const datePlanifiee = operation.datePlanifiee 
    ? new Date(operation.datePlanifiee).toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    : "—";
  doc.text("Date planifiee: " + emergencyClean(datePlanifiee), 15, yPos);
  yPos += 5;
  
  // Opérateur
  doc.text("Operateur: " + emergencyClean(operation.operateur), 15, yPos);
  yPos += 10;
  
  // Build table data
  const { headers, rows } = buildOperationPdfRows(operation, lines, articles, suppliers);
  
  // Table section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("LIGNES DE L'OPERATION", 10, yPos);
  yPos += 7;
  
  // Separator line
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(10, yPos, 287, yPos);
  yPos += 6;
  
  // Calculate column widths (total width: 277mm for landscape A4 with 10mm margins)
  const totalWidth = 277;
  const colWidths = {
    article: 50,
    lot: 25,
    qtySaisie: 28,
    impact: 28,
    qtyValide: 22,
    qtyDefect: 22,
    source: 40,
    destination: 40
  };
  
  // Draw table header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(10, yPos - 4, totalWidth, 6, 'F');
  
  let xPos = 10;
  headers.forEach((header, idx) => {
    const colWidth = Object.values(colWidths)[idx];
    doc.text(emergencyClean(header), xPos + 2, yPos);
    xPos += colWidth;
  });
  yPos += 6;
  
  // Draw table rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  
  rows.forEach((row, rowIdx) => {
    // Check if we need a new page
    if (yPos > 190) {
      doc.addPage();
      yPos = 20;
      
      // Repeat header on new page
      doc.setFont("helvetica", "bold");
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPos - 4, totalWidth, 6, 'F');
      
      xPos = 10;
      headers.forEach((header, idx) => {
        const colWidth = Object.values(colWidths)[idx];
        doc.text(emergencyClean(header), xPos + 2, yPos);
        xPos += colWidth;
      });
      yPos += 6;
      doc.setFont("helvetica", "normal");
    }
    
    // Alternate row background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(10, yPos - 4, totalWidth, 6, 'F');
    }
    
    xPos = 10;
    row.forEach((cell, idx) => {
      const colWidth = Object.values(colWidths)[idx];
      // Truncate long text
      const cellText = cell.length > 30 ? cell.substring(0, 27) + '...' : cell;
      doc.text(emergencyClean(cellText), xPos + 2, yPos);
      xPos += colWidth;
    });
    yPos += 6;
  });
  
  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const generationDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(`Document genere le ${emergencyClean(generationDate)}`, 10, 200);
  
  // Generate filename: reference with / replaced by - + date
  const cleanReference = operation.reference.replace(/\//g, '-');
  const dateStr = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
  const filename = `${cleanReference}_${dateStr}.pdf`;
  
  doc.save(filename);
};

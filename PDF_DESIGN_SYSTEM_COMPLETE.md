# PDF Design System - Système Complet

## Vue d'Ensemble

Système de génération PDF standardisé pour toutes les opérations d'inventaire, garantissant une cohérence visuelle et une qualité professionnelle pour tous les documents.

## Design System Standardisé ✅

### Template Global (Tous les PDFs)

#### Header (En-tête)
- **Logo**: Carré 25x25mm en haut à gauche (x: 10, y: 10)
- **Nom entreprise**: "Top Gloves" sous le logo (x: 10, y: 40, 14pt gras)
- **Titre document**: Aligné à droite (x: 200, y: 20, 14pt gras)
- **Date rapport**: Alignée à droite (x: 200, y: 28, 9pt normal)
- **Ligne séparatrice**: Noire, de 10mm à 200mm (y: 48, épaisseur 0.5pt)

#### Footer (Pied de page)
- **Signature**: Alignée en bas à droite (x: 120, y: 260)
- **Ligne signature**: De 120mm à 200mm (y: 268)
- **Texte**: 9pt, normal, noir

#### Style
- **Couleurs**: Monochrome uniquement (noir sur blanc)
- **Police**: Helvetica
- **Marges**: 10mm à gauche, 10mm à droite

## Quatre Templates Implémentés

### 1. Bon de Sortie (Outbound) ✅

#### Informations
- **Titre**: "Bon de Sortie"
- **Fichier**: `Bon_Sortie_[ID].pdf`
- **Déclencheur**: Mouvement type "Sortie" avec statut "Terminé" et status "approved"

#### Champs
- ID du Mouvement
- Date de Sortie
- Article (nom et référence)
- Quantité
- Numéro de Lot
- Emplacement Source
- Destination
- Opérateur
- Contrôle qualité
- Date d'Approbation
- **Section spéciale**: Détails de la Quantité (Totale, Valide, Défectueuse)

#### Signature
- **Texte**: "Signature du Contrôleur Qualité:"

#### Bouton
- **Icône**: FileText (vert)
- **Tooltip**: "Télécharger le Bon de Sortie (PDF)"

### 2. Bon d'Entrée (Inbound) ✅ NOUVEAU

#### Informations
- **Titre**: "Bon d'Entrée"
- **Fichier**: `Bon_Entree_[ID].pdf`
- **Déclencheur**: Mouvement type "Entrée"

#### Champs
- ID du Mouvement
- Date d'Entrée
- Article (nom et référence)
- Quantité
- Numéro de Lot
- Fournisseur/Source
- Opérateur

#### Signature
- **Texte**: "Signature du Réceptionnaire:"

#### Bouton
- **Icône**: FileText (bleu)
- **Tooltip**: "Télécharger le Bon d'Entrée (PDF)"

### 3. Bon de Transfert (Transfer) ✅ NOUVEAU

#### Informations
- **Titre**: "Bon de Transfert"
- **Fichier**: `Bon_Transfert_[ID].pdf`
- **Déclencheur**: Mouvement type "Transfert"

#### Champs
- ID du Mouvement
- Date de Transfert
- Article (nom et référence)
- Quantité
- Numéro de Lot
- Zone Origine
- Zone Destination
- Opérateur

#### Signature
- **Texte**: "Signature du Responsable Stock:"

#### Bouton
- **Icône**: FileText (violet)
- **Tooltip**: "Télécharger le Bon de Transfert (PDF)"

### 4. Bon d'Ajustement (Adjustment) ✅ NOUVEAU

#### Informations
- **Titre**: "Bon d'Ajustement"
- **Fichier**: `Bon_Ajustement_[ID].pdf`
- **Déclencheur**: Mouvement type "Ajustement"

#### Champs
- ID du Mouvement
- Date d'Ajustement
- Article (nom et référence)
- Type (Surplus/Manquant)
- Quantité Ajustée
- Numéro de Lot
- Motif de l'ajustement
- Opérateur

#### Signature
- **Texte**: "Signature du Responsable Inventaire:"

#### Bouton
- **Icône**: FileText (ambre)
- **Tooltip**: "Télécharger le Bon d'Ajustement (PDF)"

## Comparaison des Templates

### Structure Commune

| Élément | Position | Style | Tous les PDFs |
|---------|----------|-------|---------------|
| Logo | (10, 10) | 25x25mm | ✅ |
| Nom entreprise | (10, 40) | 14pt gras | ✅ |
| Titre | (200, 20) | 14pt gras, droite | ✅ |
| Date | (200, 28) | 9pt normal, droite | ✅ |
| Ligne | (10-200, 48) | 0.5pt noir | ✅ |
| Signature | (120, 260) | 9pt normal, droite | ✅ |
| Couleurs | Noir/Blanc | Monochrome | ✅ |

### Différences Spécifiques

| Template | Titre | Section | Signature | Couleur Bouton |
|----------|-------|---------|-----------|----------------|
| Sortie | "Bon de Sortie" | Détails de la Sortie + QC | Contrôleur Qualité | Vert |
| Entrée | "Bon d'Entrée" | Détails de l'Entrée | Réceptionnaire | Bleu |
| Transfert | "Bon de Transfert" | Détails du Transfert | Responsable Stock | Violet |
| Ajustement | "Bon d'Ajustement" | Détails de l'Ajustement | Responsable Inventaire | Ambre |

## Boutons dans le Tableau

### Colonne Actions

| Type Mouvement | Condition | Icône | Couleur | Fonction |
|----------------|-----------|-------|---------|----------|
| Sortie (En attente) | statut = "En attente" | Shield | Orange | Contrôle Qualité |
| Sortie (Approuvé) | statut = "Terminé" + status = "approved" | FileText | Vert | Bon de Sortie |
| Sortie (Rejeté) | status = "rejected" | FileText | Rouge | Rapport de Rejet |
| Entrée | Toujours | FileText | Bleu | Bon d'Entrée |
| Transfert | Toujours | FileText | Violet | Bon de Transfert |
| Ajustement | Toujours | FileText | Ambre | Bon d'Ajustement |

## Code Implémenté

### Structure de Base (Template)
```javascript
const generatePDF = (movement: Movement) => {
  const doc = new jsPDF();
  const logo = new Image();
  logo.src = '/logo.jpg';
  
  logo.onload = () => {
    // Logo carré
    const logoSize = 25;
    doc.addImage(logo, 'JPEG', 10, 10, logoSize, logoSize);
    
    // Nom entreprise
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Top Gloves", 10, 40);
    
    // Titre (variable selon le type)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("[TITRE]", 200, 20, { align: "right" });
    
    // Date
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
    
    // Ligne séparatrice
    doc.setLineWidth(0.5);
    doc.line(10, 48, 200, 48);
    
    // Contenu (variable selon le type)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("[SECTION]", 10, 58);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Noir uniquement
    
    // Champs...
    
    // Signature (variable selon le type)
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("[SIGNATURE]:", 120, 260, { align: "left" });
    doc.line(120, 268, 200, 268);
    
    // Sauvegarde
    doc.save(`[FILENAME]_${movement.id}.pdf`);
  };
  
  // Fallback sans logo
  logo.onerror = () => {
    // Même structure sans logo
  };
};
```

### Boutons dans Actions
```javascript
{showActions && (
  <td className="py-3 px-4 text-center">
    <div className="flex items-center justify-center gap-2">
      {/* Bon d'Entrée */}
      {m.type === "Entrée" && (
        <button
          onClick={() => generateInboundPDF(m)}
          className="p-1.5 rounded-md hover:bg-blue-100 transition-colors text-blue-600 hover:text-blue-800"
          title="Télécharger le Bon d'Entrée (PDF)"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
      
      {/* Bon de Transfert */}
      {m.type === "Transfert" && (
        <button
          onClick={() => generateTransferPDF(m)}
          className="p-1.5 rounded-md hover:bg-purple-100 transition-colors text-purple-600 hover:text-purple-800"
          title="Télécharger le Bon de Transfert (PDF)"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
      
      {/* Bon d'Ajustement */}
      {m.type === "Ajustement" && (
        <button
          onClick={() => generateAdjustmentPDF(m)}
          className="p-1.5 rounded-md hover:bg-amber-100 transition-colors text-amber-600 hover:text-amber-800"
          title="Télécharger le Bon d'Ajustement (PDF)"
        >
          <FileText className="w-4 h-4" />
        </button>
      )}
      
      {/* Autres boutons... */}
    </div>
  </td>
)}
```

## Avantages du Design System

### 1. Cohérence Visuelle ✅
- Tous les documents ont le même look
- Identité visuelle uniforme
- Professionnalisme garanti

### 2. Facilité de Maintenance ✅
- Structure standardisée
- Modifications centralisées
- Code réutilisable

### 3. Expérience Utilisateur ✅
- Interface prévisible
- Apprentissage rapide
- Pas de confusion

### 4. Conformité ✅
- Documents officiels reconnus
- Traçabilité complète
- Audit trail complet

## Cas d'Usage Complets

### Scénario 1: Réception de Marchandises
```
1. Réception de 500 gants
2. Création mouvement "Entrée"
3. Clic sur bouton PDF bleu
4. Génération Bon_Entree_[ID].pdf
5. Signature du Réceptionnaire
6. Archivage du document
```

### Scénario 2: Transfert entre Zones
```
1. Transfert de 200 gants Zone A → Zone B
2. Création mouvement "Transfert"
3. Clic sur bouton PDF violet
4. Génération Bon_Transfert_[ID].pdf
5. Signature du Responsable Stock
6. Archivage du document
```

### Scénario 3: Ajustement d'Inventaire
```
1. Découverte de 10 gants manquants
2. Création mouvement "Ajustement" (Manquant)
3. Clic sur bouton PDF ambre
4. Génération Bon_Ajustement_[ID].pdf
5. Signature du Responsable Inventaire
6. Archivage du document
```

### Scénario 4: Sortie avec Contrôle Qualité
```
1. Sortie de 500 gants
2. Contrôle qualité: 495 valides, 5 défectueux
3. Approbation du mouvement
4. Clic sur bouton PDF vert
5. Génération Bon_Sortie_[ID].pdf avec métriques QC
6. Signature du Contrôleur Qualité
7. Archivage du document
```

## Tests de Validation

### Checklist Globale
- [x] 4 templates PDF implémentés
- [x] Design standardisé appliqué
- [x] Logo carré en haut à gauche
- [x] Nom entreprise sous le logo
- [x] Titre aligné à droite
- [x] Date alignée à droite
- [x] Style monochrome (noir/blanc)
- [x] Signature en bas à droite
- [x] Boutons PDF dans tableau
- [x] Tooltips informatifs
- [x] Noms de fichiers corrects

### Checklist par Template
- [x] Bon de Sortie: Fonctionnel avec métriques QC
- [x] Bon d'Entrée: Fonctionnel avec champs appropriés
- [x] Bon de Transfert: Fonctionnel avec zones origine/destination
- [x] Bon d'Ajustement: Fonctionnel avec type et motif

### Checklist Technique
- [x] Build réussi
- [x] Aucune erreur TypeScript
- [x] Tous les PDFs générés correctement
- [x] Fallback sans logo fonctionne
- [x] Boutons affichés correctement
- [x] Couleurs des boutons distinctes

## Maintenance

### Ajouter un Nouveau Template
```javascript
// 1. Créer la fonction
const generateNewPDF = (movement: Movement) => {
  // Suivre la structure standardisée
};

// 2. Ajouter le bouton
{m.type === "NouveauType" && (
  <button onClick={() => generateNewPDF(m)}>
    <FileText className="w-4 h-4" />
  </button>
)}
```

### Modifier le Design Global
```javascript
// Modifier dans TOUTES les fonctions:
// - Position du logo
// - Taille de police
// - Couleurs (rester monochrome)
// - Espacements
```

### Personnaliser un Template
```javascript
// Modifier uniquement la fonction spécifique:
// - Champs affichés
// - Texte de signature
// - Nom du fichier
```

## Compatibilité

### Impression
- ✅ Imprimante noir et blanc
- ✅ Imprimante couleur (mode N&B)
- ✅ Photocopieuse
- ✅ Scanner

### Archivage
- ✅ Archivage papier
- ✅ Archivage numérique
- ✅ PDF/A (long terme)

### Navigateurs
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Résultat Final

Le système PDF complet offre:
- ✅ 4 templates standardisés (Sortie, Entrée, Transfert, Ajustement)
- ✅ Design cohérent sur tous les documents
- ✅ Style monochrome professionnel
- ✅ Logo et identité visuelle uniformes
- ✅ Signatures appropriées par rôle
- ✅ Boutons PDF colorés et distincts
- ✅ Noms de fichiers clairs
- ✅ Traçabilité complète
- ✅ Conformité garantie
- ✅ Prêt pour production

---

**Status**: ✅ Système Complet Implémenté
**Date**: Mars 1, 2026
**Version**: 1.0.0 (PDF Design System)
**Templates**: 4 (Sortie, Entrée, Transfert, Ajustement)
**Style**: Monochrome standardisé

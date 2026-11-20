# Système de Contrôle Qualité Bi-directionnel - Implémentation Complète

## 📋 Vue d'ensemble

Le système de Contrôle Qualité (QC) bi-directionnel garantit que **toutes les entrées et sorties** de marchandises passent par une validation qualité avant d'impacter le stock final.

---

## 🎯 Objectifs

1. **Quarantaine pour les Entrées** : Les nouvelles réceptions ne sont pas ajoutées au stock immédiatement
2. **Validation pour les Sorties** : Les sorties ne déduisent pas le stock avant validation
3. **Interface Unifiée** : Même expérience utilisateur pour les contrôles Entrée et Sortie
4. **Traçabilité Complète** : Tous les mouvements sont documentés avec contrôleur et décision

---

## 🔄 Flux de Travail

### Pour les ENTRÉES (Inbound)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RÉCEPTION                                                │
│    Opérateur crée une Entrée                                │
│    ├─ Article, Quantité, Lot, Date                         │
│    ├─ Emplacement de destination                           │
│    └─ Statut: "En attente de validation Qualité"           │
│                                                             │
│    ⚠️ Stock NON modifié (Quarantaine virtuelle)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTRÔLE QUALITÉ                                         │
│    Contrôleur examine la marchandise                        │
│    ├─ Conforme : Toutes les unités sont bonnes             │
│    └─ Non-conforme : Certaines unités défectueuses         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3a. VALIDATION (Bon)                                        │
│     ✓ Unités VALIDES → Ajoutées au stock utilisable        │
│     ✗ Unités DÉFECTUEUSES → Rejetées (perte permanente)    │
│     Statut: "Terminé"                                       │
└─────────────────────────────────────────────────────────────┘
                            OU
┌─────────────────────────────────────────────────────────────┐
│ 3b. REJET                                                   │
│     ✗ Toute la marchandise rejetée                         │
│     Stock NON modifié                                       │
│     Statut: "Rejeté"                                        │
│     PDF de rejet généré                                     │
└─────────────────────────────────────────────────────────────┘
```

### Pour les SORTIES (Outbound)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEMANDE DE SORTIE                                        │
│    Opérateur crée une Sortie                                │
│    ├─ Article, Quantité, Lot, Date                         │
│    ├─ Emplacement source                                   │
│    ├─ Destination/Utilisation                              │
│    └─ Statut: "En attente de validation Qualité"           │
│                                                             │
│    ⚠️ Stock NON modifié (marchandise encore en entrepôt)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CONTRÔLE QUALITÉ                                         │
│    Contrôleur examine la marchandise avant sortie           │
│    ├─ Conforme : Toutes les unités sont bonnes             │
│    └─ Non-conforme : Certaines unités défectueuses         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3a. VALIDATION (Bon)                                        │
│     ⚠️ TOUTES les unités (valides + défectueuses)          │
│        sont déduites du stock                               │
│     Raison: Elles ont physiquement quitté l'entrepôt       │
│     Statut: "Terminé"                                       │
│     Bon de Sortie PDF généré                                │
└─────────────────────────────────────────────────────────────┘
                            OU
┌─────────────────────────────────────────────────────────────┐
│ 3b. REJET                                                   │
│     ✗ Sortie annulée                                        │
│     Stock NON modifié (marchandise reste en entrepôt)       │
│     Statut: "Rejeté"                                        │
│     PDF de rejet généré                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Interface Utilisateur

### Page Contrôle Qualité

**Onglets:**
- 🔵 **Contrôles à l'Entrée** : Liste des Entrées en attente
- 🟡 **Contrôles à la Sortie** : Liste des Sorties en attente

**Informations affichées:**
- Date et heure du mouvement
- Article (nom + référence)
- Quantité totale
- Emplacement (source ou destination)
- Opérateur
- Numéro de lot

**Actions disponibles:**
- ✅ **Valider** : Ouvre le modal de validation
- ❌ **Rejeter** : Ouvre le modal de rejet

### Modal de Validation

**Champs:**
1. **État des Articles**
   - Conforme (toutes les unités bonnes)
   - Non-conforme (certaines unités défectueuses)

2. **Nombre d'unités défectueuses** (si Non-conforme)
   - Saisie numérique
   - Maximum = quantité totale

3. **Nom du Contrôleur** (obligatoire)

**Aperçu en temps réel:**
- Quantité totale
- Quantité valide (sera ajoutée/déduite)
- Quantité défectueuse (perte)
- Impact sur le stock

### Modal de Rejet

**Champs:**
1. **Nom du Contrôleur** (obligatoire)
2. **Raison du Rejet** (obligatoire)
   - Texte libre pour documenter le motif

---

## 📊 Affichage dans le Tableau des Mouvements

### Colonne Statut

| Statut | Badge | Signification |
|--------|-------|---------------|
| 🟠 **En attente** | Orange | Mouvement créé, attend validation QC |
| ✅ **Terminé** | Vert | Validé par QC, stock mis à jour |
| ❌ **Rejeté** | Rouge | Rejeté par QC, stock non modifié |

### Colonne Approuvé par

| Valeur | Couleur | Signification |
|--------|---------|---------------|
| **En attente** | Orange | Pas encore validé |
| **Nom du contrôleur** | Noir | Validé par cette personne |
| **Système** | Bleu | Ajustement automatique |
| **N/A** | Gris | Non applicable (Transfert) |

### Colonnes Qualité

- **Qté Valide** : Quantité approuvée pour utilisation (vert)
- **Qté Défect.** : Quantité défectueuse/rejetée (rouge)

---

## 🔧 Implémentation Technique

### DataContext.tsx

**Fonction `addMouvement`:**
```typescript
// Pour Entrée et Sortie: statut "En attente de validation Qualité"
if (mouvement.type === "Entrée" || mouvement.type === "Sortie") {
  mouvementAvecStatut = { 
    ...mouvement, 
    statut: "En attente de validation Qualité",
    status: "pending"
  };
}
```

**Fonction `approveQualityControl`:**
```typescript
// Gère ENTRÉE et SORTIE
if (mouvement.type === "Entrée") {
  // Ajouter seulement les unités VALIDES au stock
  const quantityToAdd = validQty;
  updateArticle(article.id, { 
    stock: article.stock + quantityToAdd,
    locations: updatedLocations 
  });
}

if (mouvement.type === "Sortie") {
  // Déduire TOUTES les unités (valides + défectueuses)
  const totalQtyToDeduct = mouvement.qte;
  updateArticle(article.id, { 
    stock: article.stock - totalQtyToDeduct,
    locations: updatedLocations 
  });
}
```

**Fonction `rejectQualityControl`:**
```typescript
// Gère ENTRÉE et SORTIE
if (mouvement.type === "Entrée" || mouvement.type === "Sortie") {
  // Marquer comme rejeté, stock non modifié
  setMouvements(mouvements.map(m => 
    m.id === id ? { 
      ...m, 
      statut: "Rejeté",
      controleur,
      raison 
    } : m
  ));
}
```

### MovementTable.tsx

**Fonction `getStatusBadge`:**
```typescript
// Affiche le statut pour Entrée, Sortie, Ajustement
if (mouvement.type === "Transfert") return null;

switch (mouvement.statut) {
  case "En attente de validation Qualité":
    return <Badge color="orange">En attente</Badge>;
  case "Terminé":
    return <Badge color="green">Terminé</Badge>;
  case "Rejeté":
    return <Badge color="red">Rejeté</Badge>;
}
```

**Bouton Contrôle Qualité:**
```typescript
{(m.type === "Entrée" || m.type === "Sortie") && 
 m.statut === "En attente de validation Qualité" && (
  <button onClick={() => onQualityControl(m.id)}>
    <Shield /> Contrôle Qualité
  </button>
)}
```

---

## 📈 Logique Métier

### Entrées (Inbound)

**Principe:** Quarantaine virtuelle jusqu'à validation

| Scénario | Quantité Totale | Valides | Défectueuses | Stock Final |
|----------|----------------|---------|--------------|-------------|
| Conforme | 1000 | 1000 | 0 | +1000 |
| Non-conforme | 1000 | 850 | 150 | +850 |
| Rejeté | 1000 | 0 | 0 | +0 |

**Règles:**
- ✅ Unités valides → Ajoutées au stock utilisable
- ❌ Unités défectueuses → Rejetées (perte permanente)
- 🚫 Rejet total → Aucun impact sur le stock

### Sorties (Outbound)

**Principe:** Toutes les unités quittent physiquement l'entrepôt

| Scénario | Quantité Totale | Valides | Défectueuses | Stock Final |
|----------|----------------|---------|--------------|-------------|
| Conforme | 500 | 500 | 0 | -500 |
| Non-conforme | 500 | 450 | 50 | -500 |
| Rejeté | 500 | 0 | 0 | -0 |

**Règles:**
- ⚠️ **TOUTES** les unités (valides + défectueuses) sont déduites
- Raison: Elles ont physiquement quitté l'entrepôt
- Les défectueuses sont une perte permanente
- 🚫 Rejet → Sortie annulée, stock non modifié

---

## 🎨 Design Unifié

### Couleurs

| Élément | Couleur | Usage |
|---------|---------|-------|
| Entrée | Vert | Badge type, boutons |
| Sortie | Jaune/Orange | Badge type, boutons |
| En attente | Orange | Badge statut |
| Terminé | Vert | Badge statut |
| Rejeté | Rouge | Badge statut |
| Valide | Vert | Quantité approuvée |
| Défectueux | Rouge | Quantité rejetée |

### Icônes

- 🛡️ **Shield** : Contrôle qualité
- ✅ **CheckCircle** : Validation
- ❌ **XCircle** : Rejet
- ⚠️ **AlertCircle** : En attente
- 📄 **FileText** : Génération PDF

---

## 📄 Génération PDF

### Bon d'Entrée (Validé)
- Informations article et lot
- Quantité totale reçue
- Quantité valide ajoutée au stock
- Quantité défectueuse rejetée
- Contrôleur et date de validation

### Bon de Sortie (Validé)
- Informations article et lot
- Quantité totale sortie
- Quantité valide utilisable
- Quantité défectueuse (perte)
- Contrôleur et date de validation
- Destination/Utilisation

### Rapport de Rejet
- Type de mouvement (Entrée/Sortie)
- Informations article et lot
- Quantité concernée
- Raison du rejet
- Contrôleur et date de rejet

---

## ✅ Avantages du Système

1. **Conformité Réglementaire** : Traçabilité complète pour dispositifs médicaux
2. **Contrôle Qualité Rigoureux** : Aucune marchandise non validée dans le stock
3. **Transparence** : Tous les mouvements documentés avec contrôleur
4. **Flexibilité** : Gestion des unités défectueuses
5. **Cohérence** : Même processus pour Entrées et Sorties
6. **Audit Trail** : Historique complet avec PDF générés

---

## 🚀 Utilisation

### Créer une Entrée
1. Page Mouvements → Nouveau Mouvement
2. Type: Entrée
3. Remplir article, quantité, lot, emplacement
4. Enregistrer → Statut "En attente"

### Valider une Entrée
1. Page Contrôle Qualité → Onglet "Contrôles à l'Entrée"
2. Cliquer "Valider" sur l'entrée
3. Sélectionner état (Conforme/Non-conforme)
4. Si Non-conforme: saisir nombre d'unités défectueuses
5. Saisir nom du contrôleur
6. Approuver → Stock mis à jour

### Créer une Sortie
1. Page Mouvements → Nouveau Mouvement
2. Type: Sortie
3. Remplir article, quantité, lot, emplacement source
4. Enregistrer → Statut "En attente"

### Valider une Sortie
1. Page Contrôle Qualité → Onglet "Contrôles à la Sortie"
2. Cliquer "Valider" sur la sortie
3. Sélectionner état (Conforme/Non-conforme)
4. Si Non-conforme: saisir nombre d'unités défectueuses
5. Saisir nom du contrôleur
6. Approuver → Stock mis à jour (total déduit)

---

## 📝 Notes Importantes

- ⚠️ **Entrées** : Seules les unités valides sont ajoutées au stock
- ⚠️ **Sorties** : TOUTES les unités (valides + défectueuses) sont déduites
- 🔒 **Quarantaine** : Les entrées non validées n'apparaissent pas dans le stock
- 📊 **Traçabilité** : Chaque mouvement conserve les métadonnées QC
- 🎯 **Cohérence** : Même UX pour Entrées et Sorties

---

## 🎉 Résultat

Un système de Contrôle Qualité bi-directionnel complet, conforme aux normes médicales, avec une interface utilisateur unifiée et une traçabilité totale de tous les mouvements de stock.

# Fix: QC Modal Stock Calculation - Entrée vs Sortie

## 🎯 Problème Résolu

**AVANT:** Le modal de Contrôle Qualité traitait TOUTES les mouvements comme des Sorties (soustraction).

**APRÈS:** Le modal calcule correctement:
- **Entrée:** Stock Après = Stock Actuel + Quantité Valide (ADDITION)
- **Sortie:** Stock Après = Stock Actuel - Quantité Totale (SOUSTRACTION)

---

## 📋 Changements Apportés

### 1. Détection du Type de Mouvement

**AVANT:**
```typescript
// ❌ Traitait toujours comme une Sortie
const totalQtyToDeduct = mouvement?.qte || 0;
const newStock = article ? article.stock - totalQtyToDeduct : 0;
```

**APRÈS:**
```typescript
// ✅ Détecte le type et calcule correctement
let newStock = 0;
let isStockInsufficient = false;

if (mouvement?.type === "Entrée") {
  // For Entrée: ADD valid quantity to stock
  newStock = article ? article.stock + validQty : 0;
  isStockInsufficient = false; // Never negative for Entrée
} else if (mouvement?.type === "Sortie") {
  // For Sortie: SUBTRACT total quantity from stock
  const totalQtyToDeduct = mouvement?.qte || 0;
  newStock = article ? article.stock - totalQtyToDeduct : 0;
  isStockInsufficient = newStock < 0;
}
```

### 2. Mise à Jour du Texte d'Avertissement

**AVANT (Entrée):**
```
⚠️ Les 1000 unités seront déduites du stock (incluant les défectueuses)
```

**APRÈS (Entrée):**
```
ℹ️ Les 950 unités valides seront ajoutées au stock après approbation
```

**AVANT (Sortie):**
```
⚠️ Les 500 unités seront déduites du stock (incluant les défectueuses)
```

**APRÈS (Sortie):**
```
⚠️ Les 500 unités seront déduites du stock (incluant les défectueuses)
```

### 3. Alerte Négative Conditionnelle

**AVANT:**
```typescript
// ❌ Affichait l'alerte pour tous les mouvements
{isStockInsufficient && (
  <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive font-medium">
    ⚠️ Attention: Le stock deviendra négatif après cette opération!
  </div>
)}
```

**APRÈS:**
```typescript
// ✅ Affiche l'alerte SEULEMENT pour les Sorties
{isStockInsufficient && mouvement.type === "Sortie" && (
  <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive font-medium">
    ⚠️ Attention: Le stock deviendra négatif après cette opération!
  </div>
)}
```

---

## 🎨 Affichage dans le Modal

### Entrée - Avant (❌ Incorrect)
```
Type: Entrée
Article: Masques FFP2
Stock Actuel: 8000 Unités
Quantité Totale Sortie: 1000 Unités  ← ❌ Mauvais label
└─ Valides: 950
└─ Défectueuses (Perte): 50

⚠️ Les 1000 unités seront déduites du stock  ← ❌ Mauvais texte

Stock Après Approbation: 7000 Unités  ← ❌ Mauvais calcul (8000 - 1000)
⚠️ NÉGATIF  ← ❌ Faux avertissement
```

### Entrée - Après (✅ Correct)
```
Type: Entrée
Article: Masques FFP2
Stock Actuel: 8000 Unités
Quantité Totale Entrée: 1000 Unités  ← ✅ Bon label

└─ Valides: 950
└─ Défectueuses (Perte): 50

ℹ️ Les 950 unités valides seront ajoutées au stock après approbation  ← ✅ Bon texte

Stock Après Approbation: 8950 Unités  ← ✅ Bon calcul (8000 + 950)
```

### Sortie - Avant (✅ Correct)
```
Type: Sortie
Article: Gants Nitrile M
Stock Actuel: 2500 Unités
Quantité Totale Sortie: 500 Unités

└─ Valides: 450
└─ Défectueuses (Perte): 50

⚠️ Les 500 unités seront déduites du stock

Stock Après Approbation: 2000 Unités
```

### Sortie - Après (✅ Correct - Inchangé)
```
Type: Sortie
Article: Gants Nitrile M
Stock Actuel: 2500 Unités
Quantité Totale Sortie: 500 Unités

└─ Valides: 450
└─ Défectueuses (Perte): 50

⚠️ Les 500 unités seront déduites du stock

Stock Après Approbation: 2000 Unités
```

---

## 📊 Formules Correctes

### Entrée
```
Stock Après Approbation = Stock Actuel + Quantité Valide

Exemple:
- Stock Actuel: 8000
- Quantité Totale: 1000
- Défectueuses: 50
- Quantité Valide: 950
- Stock Après: 8000 + 950 = 8950 ✅
```

### Sortie
```
Stock Après Approbation = Stock Actuel - Quantité Totale

Exemple:
- Stock Actuel: 2500
- Quantité Totale: 500
- Défectueuses: 50
- Stock Après: 2500 - 500 = 2000 ✅
```

---

## ✅ Garanties

1. **Entrée**
   - ✅ Calcul: Stock Actuel + Quantité Valide
   - ✅ Texte: "seront ajoutées au stock"
   - ✅ Alerte Négative: JAMAIS (on ajoute du stock)
   - ✅ Label: "Quantité Totale Entrée"

2. **Sortie**
   - ✅ Calcul: Stock Actuel - Quantité Totale
   - ✅ Texte: "seront déduites du stock"
   - ✅ Alerte Négative: SI résultat < 0
   - ✅ Label: "Quantité Totale Sortie"

---

## 🎯 Cas d'Usage

### Cas 1: Entrée Conforme
```
Stock Actuel: 1000
Entrée: 500 (Conforme)
Défectueuses: 0
Valides: 500

Stock Après: 1000 + 500 = 1500 ✅
Alerte: Aucune
```

### Cas 2: Entrée Non-conforme
```
Stock Actuel: 1000
Entrée: 500 (Non-conforme)
Défectueuses: 50
Valides: 450

Stock Après: 1000 + 450 = 1450 ✅
Alerte: Aucune
```

### Cas 3: Sortie Conforme
```
Stock Actuel: 1000
Sortie: 500 (Conforme)
Défectueuses: 0

Stock Après: 1000 - 500 = 500 ✅
Alerte: Aucune
```

### Cas 4: Sortie Non-conforme
```
Stock Actuel: 1000
Sortie: 500 (Non-conforme)
Défectueuses: 50

Stock Après: 1000 - 500 = 500 ✅
Alerte: Aucune
```

### Cas 5: Sortie Insuffisante
```
Stock Actuel: 300
Sortie: 500

Stock Après: 300 - 500 = -200 ❌
Alerte: "⚠️ Attention: Le stock deviendra négatif après cette opération!"
```

---

## 📝 Fichiers Modifiés

### src/pages/MouvementsPage.tsx
- ✅ Ajout: Détection du type de mouvement
- ✅ Mise à jour: Calcul du stock selon le type
- ✅ Mise à jour: Texte d'avertissement selon le type
- ✅ Mise à jour: Alerte négative conditionnelle (Sortie seulement)
- ✅ Mise à jour: Label "Quantité Totale" selon le type

---

## 🎉 Résultat Final

Le modal de Contrôle Qualité affiche maintenant **correctement**:
- ✅ **Entrée:** Stock AUGMENTE (addition)
- ✅ **Sortie:** Stock DIMINUE (soustraction)
- ✅ **Texte:** Adapté au type de mouvement
- ✅ **Alerte:** Seulement pour les Sorties négatives
- ✅ **Calcul:** Basé sur le type de mouvement

---

## 🚀 Vérification

**Question:** Le modal affiche-t-il correctement une AUGMENTATION pour les Entrées?

**Réponse:** ✅ OUI
- Calcul: Stock Actuel + Quantité Valide
- Texte: "seront ajoutées au stock"
- Alerte: Aucune

**Question:** Le modal affiche-t-il correctement une DIMINUTION pour les Sorties?

**Réponse:** ✅ OUI
- Calcul: Stock Actuel - Quantité Totale
- Texte: "seront déduites du stock"
- Alerte: Si résultat < 0

**Question:** L'alerte négative n'apparaît-elle que pour les Sorties?

**Réponse:** ✅ OUI
- Entrée: Jamais d'alerte (on ajoute du stock)
- Sortie: Alerte si résultat < 0

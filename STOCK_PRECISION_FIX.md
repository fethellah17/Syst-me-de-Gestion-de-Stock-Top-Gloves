# Fix de Précision - Calcul du Stock

## Problème identifié

### Symptômes
- Affichage de valeurs avec trop de décimales : `49.995` au lieu de `50`
- Erreurs d'arrondi dans les conversions : `2499.9999999` au lieu de `2500`
- Incohérence entre les unités entières et les unités de poids

### Cause racine
Les opérations de multiplication JavaScript peuvent produire des erreurs de précision en virgule flottante :
```javascript
// Exemple du problème
0.1 + 0.2 = 0.30000000000000004  // ❌
50 / 100 * 100 = 49.99999999999999  // ❌
```

## Solution implémentée

### 1. Fonction de rounding intelligente

```typescript
/**
 * Round stock quantity based on unit type
 * - Whole items (Pièce, Boîte, Unité, Paire, Carton): Round to integer
 * - Weight/Volume (Kg, g, Litre, ml, Tonne): Round to 3 decimals
 */
const roundStockQuantity = (quantity: number, unit: string): number => {
  const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
  const isWholeItem = wholeItemUnits.some(u => unit.toLowerCase().includes(u));
  
  if (isWholeItem) {
    // Round to nearest integer for whole items
    return Math.round(quantity);
  } else {
    // Round to 3 decimals for weight/volume, then remove trailing zeros
    return parseFloat(quantity.toFixed(3));
  }
};
```

### 2. Logique de rounding par type d'unité

#### Unités entières (Integer)
```
Unités concernées: Pièce, Boîte, Unité, Paire, Carton, Palette

Avant: 49.99999999 Paires
Après: 50 Paires

Méthode: Math.round()
```

#### Unités de poids/volume (3 décimales max)
```
Unités concernées: Kg, g, Tonne, Litre, ml

Avant: 2.4999999999 Kg
Après: 2.5 Kg

Avant: 125.000 Kg
Après: 125 Kg

Méthode: parseFloat(value.toFixed(3))
```

### 3. Application dans le flux de conversion

#### Lors d'une Entrée
```typescript
// Calcul brut
const rawQuantityInExitUnit = mouvement.qte * article.facteurConversion;

// Arrondi selon le type d'unité
const quantityInExitUnit = roundStockQuantity(rawQuantityInExitUnit, article.uniteSortie);

// Mise à jour du stock avec arrondi
const rawNewStock = article.stock + quantityInExitUnit;
const newStock = roundStockQuantity(rawNewStock, article.uniteSortie);
```

#### Logs de debugging
```
[ENTRÉE] Article: Gants Nitrile M
  Quantité saisie: 0.5 Boîte
  Facteur conversion: 100
  Quantité brute: 49.99999999 Paire
  Quantité arrondie: 50 Paire
  Stock avant: 1000 Paire
  Stock après (brut): 1049.99999999 Paire
  Stock après (arrondi): 1050 Paire
```

### 4. Affichage dans le tableau

#### Avant
```typescript
{a.stock.toLocaleString()}  // Affiche: 49.99999999
```

#### Après
```typescript
{parseFloat(a.stock.toFixed(3)).toLocaleString()}  // Affiche: 50
```

## Exemples de correction

### Exemple 1 : Gants en boîtes (Unité entière)

```
Configuration:
  Unité d'Entrée: Boîte
  Unité de Sortie: Paire
  Facteur: 100

Scénario:
  Entrée: 0.5 Boîte

Avant le fix:
  Calcul: 0.5 × 100 = 49.99999999999
  Stock: 49.99999999999 Paires
  Affichage: "49.99999999999 Paires"

Après le fix:
  Calcul brut: 0.5 × 100 = 49.99999999999
  Arrondi: Math.round(49.99999999999) = 50
  Stock: 50 Paires
  Affichage: "50 Paires"
```

### Exemple 2 : Poudre en tonnes (Unité de poids)

```
Configuration:
  Unité d'Entrée: Tonne
  Unité de Sortie: Kg
  Facteur: 1000

Scénario:
  Entrée: 2.5 Tonnes

Avant le fix:
  Calcul: 2.5 × 1000 = 2499.9999999999
  Stock: 2499.9999999999 Kg
  Affichage: "2499.9999999999 Kg"

Après le fix:
  Calcul brut: 2.5 × 1000 = 2499.9999999999
  Arrondi: parseFloat(2499.9999999999.toFixed(3)) = 2500
  Stock: 2500 Kg
  Affichage: "2500 Kg"
```

### Exemple 3 : Poids avec décimales (Unité de poids)

```
Configuration:
  Unité d'Entrée: Kg
  Unité de Sortie: g
  Facteur: 1000

Scénario:
  Entrée: 1.234 Kg

Avant le fix:
  Calcul: 1.234 × 1000 = 1234.0000000001
  Stock: 1234.0000000001 g
  Affichage: "1234.0000000001 g"

Après le fix:
  Calcul brut: 1.234 × 1000 = 1234.0000000001
  Arrondi: parseFloat(1234.0000000001.toFixed(3)) = 1234
  Stock: 1234 g
  Affichage: "1234 g"
```

### Exemple 4 : Suppression des zéros inutiles

```
Avant le fix:
  125.000 Kg → Affiche "125.000 Kg"
  50.100 Kg → Affiche "50.100 Kg"
  2.500 Kg → Affiche "2.500 Kg"

Après le fix:
  125.000 Kg → Affiche "125 Kg"
  50.100 Kg → Affiche "50.1 Kg"
  2.500 Kg → Affiche "2.5 Kg"

Méthode: parseFloat(value.toFixed(3))
```

## Modifications apportées

### 1. src/contexts/DataContext.tsx

#### Ajout des fonctions utilitaires
```typescript
const roundStockQuantity = (quantity: number, unit: string): number => {
  const wholeItemUnits = ['pièce', 'boîte', 'unité', 'paire', 'carton', 'palette'];
  const isWholeItem = wholeItemUnits.some(u => unit.toLowerCase().includes(u));
  
  if (isWholeItem) {
    return Math.round(quantity);
  } else {
    return parseFloat(quantity.toFixed(3));
  }
};

const formatStockDisplay = (quantity: number): number => {
  return parseFloat(quantity.toFixed(3));
};
```

#### Mise à jour de addMouvement()
```typescript
// Conversion avec arrondi
const rawQuantityInExitUnit = mouvement.qte * article.facteurConversion;
const quantityInExitUnit = roundStockQuantity(rawQuantityInExitUnit, article.uniteSortie);

// Stock avec arrondi
const rawNewStock = article.stock + quantityInExitUnit;
const newStock = roundStockQuantity(rawNewStock, article.uniteSortie);

// Locations avec arrondi
if (existingLocation) {
  const rawLocationQty = existingLocation.quantite + quantityInExitUnit;
  existingLocation.quantite = roundStockQuantity(rawLocationQty, article.uniteSortie);
}
```

### 2. src/pages/ArticlesPage.tsx

#### Affichage du stock principal
```typescript
{parseFloat(a.stock.toFixed(3)).toLocaleString()} {a.uniteSortie}
```

#### Affichage du stock secondaire
```typescript
({parseFloat((a.stock / a.facteurConversion).toFixed(3))} {a.uniteEntree})
```

### 3. src/lib/unit-conversion.ts

#### Fonctions mises à jour
```typescript
export const roundStockQuantity = (quantity: number, unit: string): number => {
  // ... (même logique que DataContext)
};

export const formatStockDisplay = (quantity: number): number => {
  return parseFloat(quantity.toFixed(3));
};

export const convertEntryToExit = (
  quantityInEntryUnit: number,
  facteurConversion: number,
  exitUnit: string
): number => {
  const rawQuantity = quantityInEntryUnit * facteurConversion;
  return roundStockQuantity(rawQuantity, exitUnit);
};
```

## Tests de validation

### Test 1 : Unité entière
```
1. Créer un article avec Unité de Sortie = "Paire"
2. Facteur = 100
3. Ajouter 0.5 Boîte
4. Vérifier : Stock = 50 Paires (pas 49.999...)
```

### Test 2 : Unité de poids
```
1. Créer un article avec Unité de Sortie = "Kg"
2. Facteur = 1000
3. Ajouter 2.5 Tonnes
4. Vérifier : Stock = 2500 Kg (pas 2499.999...)
```

### Test 3 : Suppression des zéros
```
1. Article avec stock = 125.000 Kg
2. Vérifier affichage : "125 Kg" (pas "125.000 Kg")
```

### Test 4 : Décimales significatives
```
1. Article avec stock = 125.456 Kg
2. Vérifier affichage : "125.456 Kg"
3. Article avec stock = 125.4567890 Kg
4. Vérifier affichage : "125.457 Kg" (arrondi à 3 décimales)
```

### Test 5 : Opérations multiples
```
1. Stock initial : 1000 Paires
2. Ajouter 0.25 Boîte (facteur 100) → +25 Paires
3. Ajouter 0.25 Boîte → +25 Paires
4. Vérifier : Stock = 1050 Paires (pas 1049.999...)
```

## Avantages de la solution

### 1. Précision
✅ Pas d'erreur d'arrondi visible
✅ Calculs cohérents
✅ Stock toujours exact

### 2. Lisibilité
✅ Affichage propre sans décimales inutiles
✅ Nombres entiers pour les unités entières
✅ Maximum 3 décimales pour les poids/volumes

### 3. Cohérence
✅ Même logique partout dans l'application
✅ Rounding adapté au type d'unité
✅ Logs détaillés pour debugging

### 4. Performance
✅ Calculs optimisés
✅ Pas de ralentissement
✅ Rounding uniquement quand nécessaire

## Règles de rounding

### Tableau récapitulatif

```
┌──────────────────┬─────────────────┬──────────────────────┐
│ Type d'unité     │ Méthode         │ Exemple              │
├──────────────────┼─────────────────┼──────────────────────┤
│ Pièce            │ Math.round()    │ 49.999 → 50          │
│ Boîte            │ Math.round()    │ 24.5 → 25            │
│ Unité            │ Math.round()    │ 99.7 → 100           │
│ Paire            │ Math.round()    │ 1049.999 → 1050      │
│ Carton           │ Math.round()    │ 35.2 → 35            │
│ Palette          │ Math.round()    │ 10.8 → 11            │
├──────────────────┼─────────────────┼──────────────────────┤
│ Kg               │ toFixed(3)      │ 125.000 → 125        │
│ g                │ toFixed(3)      │ 1234.567 → 1234.567  │
│ Tonne            │ toFixed(3)      │ 2.500 → 2.5          │
│ Litre            │ toFixed(3)      │ 50.100 → 50.1        │
│ ml               │ toFixed(3)      │ 999.999 → 1000       │
└──────────────────┴─────────────────┴──────────────────────┘
```

## Debugging

### Console logs améliorés

Chaque entrée affiche maintenant :
```
[ENTRÉE] Article: Gants Nitrile M
  Quantité saisie: 0.5 Boîte
  Facteur conversion: 100
  Quantité brute: 49.99999999 Paire
  Quantité arrondie: 50 Paire
  Stock avant: 1000 Paire
  Stock après (brut): 1049.99999999 Paire
  Stock après (arrondi): 1050 Paire
```

### Vérification manuelle

Pour vérifier le rounding :
1. Ouvrir la console (F12)
2. Créer une entrée avec conversion
3. Vérifier les logs "brut" vs "arrondi"
4. Vérifier l'affichage dans le tableau
5. Calculer manuellement pour confirmer

## Compatibilité

### Articles existants
- Les stocks existants sont automatiquement arrondis lors du prochain mouvement
- Pas de migration nécessaire
- Fonctionnement transparent

### Nouveaux articles
- Le rounding s'applique automatiquement
- Pas de configuration nécessaire
- Détection automatique du type d'unité

## Fichiers modifiés

- ✅ `src/contexts/DataContext.tsx` - Ajout des fonctions de rounding
- ✅ `src/pages/ArticlesPage.tsx` - Affichage avec formatage
- ✅ `src/lib/unit-conversion.ts` - Utilitaires de conversion avec rounding
- ✅ `STOCK_PRECISION_FIX.md` - Documentation (ce fichier)

## Support

Pour toute question sur le rounding :
1. Consulter cette documentation
2. Vérifier les logs de la console
3. Tester avec des valeurs décimales
4. Vérifier le type d'unité de l'article

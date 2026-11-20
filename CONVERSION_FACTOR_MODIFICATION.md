# Modification du Facteur de Conversion - Recalcul Automatique du Stock

## Vue d'ensemble

Lorsqu'un utilisateur modifie le **Facteur de Conversion** d'un article existant, le système recalcule automatiquement le stock en **Unité de Sortie** tout en préservant la quantité en **Unité d'Entrée**.

## Principe fondamental

### Unité d'Entrée = Référence Absolue

```
┌─────────────────────────────────────────────────────────┐
│  RÈGLE LORS DE LA MODIFICATION DU FACTEUR               │
│  ═══════════════════════════════════════════════════    │
│  L'Unité d'Entrée reste CONSTANTE                       │
│  Le Stock en Unité de Sortie est RECALCULÉ              │
│                                                          │
│  Formule:                                               │
│  Stock (Entrée) = Stock Actuel (Sortie) / Ancien Facteur│
│  Nouveau Stock (Sortie) = Stock (Entrée) × Nouveau Facteur│
└─────────────────────────────────────────────────────────┘
```

## Exemple concret

### Scénario : Changement de facteur pour des gants

#### Configuration initiale
```
Article: Gants Nitrile M
Unité d'Entrée: Boîte
Unité de Sortie: Paire
Facteur actuel: 10
Stock actuel: 50 Paires
```

#### Calcul du stock en unité d'entrée
```
Stock en Boîtes = 50 Paires ÷ 10 = 5 Boîtes
```

#### Modification du facteur
```
Nouveau facteur: 100
(Chaque boîte contient maintenant 100 paires au lieu de 10)
```

#### Recalcul automatique
```
Nouveau stock = 5 Boîtes × 100 = 500 Paires
```

#### Résultat
```
AVANT:
  Facteur: 10
  Stock: 50 Paires (5 Boîtes)

APRÈS:
  Facteur: 100
  Stock: 500 Paires (5 Boîtes)
  
✅ Les 5 Boîtes sont préservées
✅ Le stock en Paires est recalculé automatiquement
```

## Logique d'implémentation

### 1. Détection du changement

```typescript
const existingArticle = articles.find(a => a.id === editingId);
const factorChanged = existingArticle.facteurConversion !== formData.facteurConversion;
```

### 2. Calcul du stock en unité d'entrée

```typescript
// Préserver la quantité en unité d'entrée
const stockInEntryUnits = existingArticle.stock / existingArticle.facteurConversion;
```

### 3. Recalcul du stock en unité de sortie

```typescript
// Appliquer le nouveau facteur
const newStockInExitUnits = stockInEntryUnits * formData.facteurConversion;
```

### 4. Arrondi selon le type d'unité

```typescript
// Arrondir selon le type (entier ou décimal)
const roundedNewStock = roundStockQuantity(newStockInExitUnits, formData.uniteSortie);
```

### 5. Mise à jour du stock

```typescript
// Mettre à jour l'article avec le nouveau stock
updateArticle(editingId, {
  ...formData,
  stock: roundedNewStock
});
```

## Exemples détaillés

### Exemple 1 : Gants - Facteur augmenté

```
Configuration:
  Article: Gants Nitrile M
  Unité d'Entrée: Boîte
  Unité de Sortie: Paire
  
État initial:
  Facteur: 10
  Stock: 50 Paires
  
Calcul:
  Stock en Boîtes = 50 ÷ 10 = 5 Boîtes
  
Modification:
  Nouveau facteur: 100
  
Recalcul:
  Nouveau stock = 5 × 100 = 500 Paires
  
Résultat:
  ✅ Stock: 500 Paires (5 Boîtes)
  
Console:
  [MODIFICATION FACTEUR] Article: Gants Nitrile M
    Stock actuel: 50 Paire
    Ancien facteur: 10
    Nouveau facteur: 100
    Stock en unité d'entrée: 5 Boîte
    Nouveau stock calculé: 500 Paire
    Nouveau stock arrondi: 500 Paire
```

### Exemple 2 : Gants - Facteur diminué

```
Configuration:
  Article: Gants Nitrile M
  Unité d'Entrée: Boîte
  Unité de Sortie: Paire
  
État initial:
  Facteur: 100
  Stock: 500 Paires
  
Calcul:
  Stock en Boîtes = 500 ÷ 100 = 5 Boîtes
  
Modification:
  Nouveau facteur: 50
  
Recalcul:
  Nouveau stock = 5 × 50 = 250 Paires
  
Résultat:
  ✅ Stock: 250 Paires (5 Boîtes)
  
Console:
  [MODIFICATION FACTEUR] Article: Gants Nitrile M
    Stock actuel: 500 Paire
    Ancien facteur: 100
    Nouveau facteur: 50
    Stock en unité d'entrée: 5 Boîte
    Nouveau stock calculé: 250 Paire
    Nouveau stock arrondi: 250 Paire
```

### Exemple 3 : Matière première - Facteur modifié

```
Configuration:
  Article: Poudre de Nitrile
  Unité d'Entrée: Tonne
  Unité de Sortie: Kg
  
État initial:
  Facteur: 1000
  Stock: 2500 Kg
  
Calcul:
  Stock en Tonnes = 2500 ÷ 1000 = 2.5 Tonnes
  
Modification:
  Nouveau facteur: 1100 (nouvelle densité)
  
Recalcul:
  Nouveau stock = 2.5 × 1100 = 2750 Kg
  
Résultat:
  ✅ Stock: 2750 Kg (2.5 Tonnes)
  
Console:
  [MODIFICATION FACTEUR] Article: Poudre de Nitrile
    Stock actuel: 2500 Kg
    Ancien facteur: 1000
    Nouveau facteur: 1100
    Stock en unité d'entrée: 2.5 Tonne
    Nouveau stock calculé: 2750 Kg
    Nouveau stock arrondi: 2750 Kg
```

### Exemple 4 : Passage d'un facteur 1 à un facteur réel

```
Configuration:
  Article: Gants XL
  Unité d'Entrée: Paire
  Unité de Sortie: Paire
  
État initial:
  Facteur: 1
  Stock: 100 Paires
  
Calcul:
  Stock en Paires (entrée) = 100 ÷ 1 = 100 Paires
  
Modification:
  Unité d'Entrée: Boîte (changement)
  Unité de Sortie: Paire (inchangé)
  Nouveau facteur: 50
  
Recalcul:
  Nouveau stock = 100 × 50 = 5000 Paires
  
Résultat:
  ✅ Stock: 5000 Paires (100 Boîtes)
  
Note: Dans ce cas, on considère que les 100 unités initiales
      deviennent 100 Boîtes après modification
```

## Flux de modification

### Diagramme du processus

```
┌─────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR OUVRE LE FORMULAIRE DE MODIFICATION     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. SYSTÈME CHARGE LES VALEURS ACTUELLES                │
│    - Facteur actuel: 10                                 │
│    - Stock actuel: 50 Paires                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. UTILISATEUR MODIFIE LE FACTEUR                      │
│    - Nouveau facteur: 100                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. UTILISATEUR CLIQUE SUR "MODIFIER"                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. SYSTÈME DÉTECTE LE CHANGEMENT DE FACTEUR            │
│    factorChanged = (10 !== 100) = true                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. CALCUL DU STOCK EN UNITÉ D'ENTRÉE                   │
│    stockInEntryUnits = 50 ÷ 10 = 5 Boîtes              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. RECALCUL DU STOCK EN UNITÉ DE SORTIE                │
│    newStock = 5 × 100 = 500 Paires                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 8. ARRONDI SELON LE TYPE D'UNITÉ                       │
│    roundedStock = Math.round(500) = 500 Paires          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 9. MISE À JOUR DE L'ARTICLE DANS L'ÉTAT                │
│    updateArticle(id, { ...formData, stock: 500 })      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 10. AFFICHAGE IMMÉDIAT DANS LE TABLEAU                 │
│     Stock: 500 Paires (5 Boîtes)                        │
└─────────────────────────────────────────────────────────┘
```

## Cas particuliers

### Cas 1 : Stock à zéro

```
Si stock actuel = 0:
  → Pas de recalcul nécessaire
  → Le stock reste à 0
  → Seul le facteur est mis à jour
```

### Cas 2 : Facteur inchangé

```
Si ancien facteur = nouveau facteur:
  → Pas de recalcul
  → Mise à jour normale des autres champs
  → Le stock reste inchangé
```

### Cas 3 : Changement d'unités ET de facteur

```
Si unité d'entrée OU unité de sortie change:
  → Le recalcul s'applique quand même
  → Le stock en unité d'entrée est préservé
  → Le nouveau stock est calculé avec le nouveau facteur
```

### Cas 4 : Facteur décimal

```
Ancien facteur: 100
Nouveau facteur: 99.5
Stock actuel: 500 Paires

Calcul:
  Stock en Boîtes = 500 ÷ 100 = 5 Boîtes
  Nouveau stock = 5 × 99.5 = 497.5 Paires
  Arrondi = 498 Paires (si unité entière)
```

## Notifications utilisateur

### Message de succès standard

```
"Article modifié avec succès"
```

### Message de succès avec recalcul

```
"Article modifié. Stock recalculé: 500 Paires"
```

Cela informe l'utilisateur que le stock a été automatiquement recalculé.

## Console logs

### Logs détaillés lors du recalcul

```javascript
[MODIFICATION FACTEUR] Article: Gants Nitrile M
  Stock actuel: 50 Paire
  Ancien facteur: 10
  Nouveau facteur: 100
  Stock en unité d'entrée: 5 Boîte
  Nouveau stock calculé: 500 Paire
  Nouveau stock arrondi: 500 Paire
```

Ces logs permettent de :
- Vérifier que le recalcul est correct
- Débugger en cas de problème
- Tracer les modifications de stock

## Avantages de cette approche

### 1. Cohérence
✅ L'unité d'entrée reste la référence
✅ Pas de perte d'information
✅ Stock toujours cohérent

### 2. Transparence
✅ Logs détaillés dans la console
✅ Message explicite à l'utilisateur
✅ Calcul traçable

### 3. Précision
✅ Arrondi selon le type d'unité
✅ Pas d'erreur de précision
✅ Calcul exact

### 4. Flexibilité
✅ Fonctionne avec tous types d'unités
✅ Supporte les facteurs décimaux
✅ Gère tous les cas particuliers

## Tests suggérés

### Test 1 : Augmentation du facteur
```
1. Créer un article avec facteur 10, stock 50 Paires
2. Modifier le facteur à 100
3. Vérifier : Stock = 500 Paires
4. Vérifier affichage secondaire : (5 Boîtes)
```

### Test 2 : Diminution du facteur
```
1. Créer un article avec facteur 100, stock 500 Paires
2. Modifier le facteur à 10
3. Vérifier : Stock = 50 Paires
4. Vérifier affichage secondaire : (5 Boîtes)
```

### Test 3 : Facteur décimal
```
1. Créer un article avec facteur 100, stock 500 Paires
2. Modifier le facteur à 99.5
3. Vérifier : Stock = 498 Paires (arrondi)
4. Vérifier console logs
```

### Test 4 : Stock à zéro
```
1. Créer un article avec facteur 10, stock 0
2. Modifier le facteur à 100
3. Vérifier : Stock reste à 0
4. Pas de recalcul effectué
```

### Test 5 : Facteur inchangé
```
1. Créer un article avec facteur 100
2. Modifier un autre champ (nom, seuil, etc.)
3. Laisser le facteur à 100
4. Vérifier : Stock inchangé
5. Message standard "Article modifié avec succès"
```

### Test 6 : Affichage immédiat
```
1. Modifier le facteur d'un article
2. Vérifier que le tableau se met à jour IMMÉDIATEMENT
3. Pas besoin de rafraîchir la page
4. Le nouveau stock est visible instantanément
```

## Limitations et considérations

### 1. Mouvements existants

```
⚠️ Les mouvements passés ne sont PAS recalculés
   Seul le stock actuel est mis à jour
   L'historique reste inchangé
```

### 2. Locations multiples

```
⚠️ Si l'article a plusieurs emplacements:
   Le stock total est recalculé
   Mais la répartition par emplacement reste proportionnelle
   (Cette fonctionnalité peut être améliorée)
```

### 3. Validation

```
⚠️ Aucune validation n'empêche de mettre un facteur aberrant
   L'utilisateur est responsable de la cohérence
   Recommandation : Ajouter une confirmation si le changement est > 10x
```

## Fichiers modifiés

- ✅ `src/pages/ArticlesPage.tsx` - Logique de recalcul dans handleSubmit()
- ✅ `CONVERSION_FACTOR_MODIFICATION.md` - Documentation (ce fichier)

## Prochaines améliorations possibles

1. **Confirmation utilisateur** : Afficher une alerte si le changement de facteur est important
2. **Historique des modifications** : Tracer les changements de facteur
3. **Répartition des locations** : Recalculer aussi les quantités par emplacement
4. **Validation du facteur** : Limiter les valeurs aberrantes (ex: facteur > 10000)
5. **Prévisualisation** : Montrer le nouveau stock avant de valider

## Support

Pour toute question :
1. Consulter cette documentation
2. Vérifier les logs de la console
3. Tester avec des données de démonstration
4. Calculer manuellement pour vérifier

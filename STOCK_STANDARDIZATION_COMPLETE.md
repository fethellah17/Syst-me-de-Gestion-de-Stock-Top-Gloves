# Standardisation du Système de Stock - Unité de Sortie

## Vue d'ensemble

Le système de gestion de stock a été standardisé pour utiliser **exclusivement l'Unité de Sortie** comme unité de référence pour tous les calculs et affichages de stock.

## Principe fondamental

### Stock = Toujours en Unité de Sortie

```
┌─────────────────────────────────────────────────────┐
│  RÈGLE D'OR                                         │
│  ═══════════════════════════════════════════════    │
│  Le stock est TOUJOURS stocké et calculé en         │
│  Unité de Sortie (la plus petite unité)            │
│                                                      │
│  Pourquoi ?                                         │
│  • Précision maximale                               │
│  • Pas d'erreur d'arrondi                          │
│  • Cohérence avec la consommation                  │
│  • Seuils et alertes fiables                       │
└─────────────────────────────────────────────────────┘
```

## Logique de conversion automatique

### 1. Lors d'une Entrée (Réception)

#### Avant (problématique)
```typescript
// Quantité saisie = Quantité ajoutée au stock
stock += quantiteSaisie  // ❌ Incohérent si unités différentes
```

#### Après (solution)
```typescript
// Conversion automatique en unité de sortie
const quantityInExitUnit = quantiteSaisie * facteurConversion;
stock += quantityInExitUnit;  // ✅ Toujours en unité de sortie
```

#### Exemple concret
```
Article: Poudre de Nitrile
Unité d'Entrée: Tonne
Unité de Sortie: Kg
Facteur: 1000

Utilisateur saisit: 2 Tonnes
Système calcule: 2 × 1000 = 2000 Kg
Stock mis à jour: +2000 Kg
```

### 2. Lors d'une Sortie (Consommation)

#### Logique
```typescript
// Pas de conversion nécessaire
// La quantité est déjà en unité de sortie
stock -= quantiteSaisie;  // ✅ Direct
```

#### Exemple concret
```
Article: Poudre de Nitrile
Unité de Sortie: Kg

Utilisateur saisit: 250 Kg
Stock mis à jour: -250 Kg
```

### 3. Lors d'un Ajustement

#### Logique
```typescript
// Les ajustements sont TOUJOURS en unité de sortie
if (typeAjustement === "Surplus") {
  stock += quantite;  // ✅ En unité de sortie
} else if (typeAjustement === "Manquant") {
  stock -= quantite;  // ✅ En unité de sortie
}
```

## Affichage du stock

### Dans le tableau des articles

#### Format principal
```
Stock: 2500 Kg
```

#### Format avec conversion (optionnel)
```
Stock: 2500 Kg
       (2.5 Tonnes)
```

#### Implémentation
```typescript
<td>
  <div className="flex flex-col items-end">
    {/* Stock en unité de sortie (principal) */}
    <span className="font-semibold">
      {article.stock.toLocaleString()} {article.uniteSortie}
    </span>
    
    {/* Stock en unité d'entrée (secondaire, si conversion) */}
    {article.facteurConversion !== 1 && (
      <span className="text-xs text-muted">
        ({(article.stock / article.facteurConversion).toFixed(2)} {article.uniteEntree})
      </span>
    )}
  </div>
</td>
```

### Exemple d'affichage

#### Article avec conversion
```
┌──────────────────────────────────────┐
│ Stock                                │
├──────────────────────────────────────┤
│ 2500 Kg                              │
│ (2.5 Tonnes)                         │
└──────────────────────────────────────┘
```

#### Article sans conversion
```
┌──────────────────────────────────────┐
│ Stock                                │
├──────────────────────────────────────┤
│ 100 Paires                           │
└──────────────────────────────────────┘
```

## Modifications apportées

### 1. DataContext.tsx - Fonction addMouvement()

#### Entrées (Réception)
```typescript
if (mouvement.type === "Entrée") {
  // CONVERSION AUTOMATIQUE
  const quantityInExitUnit = mouvement.qte * article.facteurConversion;
  
  // Logs pour debugging
  console.log(`[ENTRÉE] Article: ${article.nom}`);
  console.log(`  Quantité saisie: ${mouvement.qte} ${article.uniteEntree}`);
  console.log(`  Facteur conversion: ${article.facteurConversion}`);
  console.log(`  Quantité convertie: ${quantityInExitUnit} ${article.uniteSortie}`);
  console.log(`  Stock avant: ${article.stock} ${article.uniteSortie}`);
  console.log(`  Stock après: ${article.stock + quantityInExitUnit} ${article.uniteSortie}`);
  
  const newStock = article.stock + quantityInExitUnit;
  updateArticle(article.id, { stock: newStock });
}
```

#### Sorties (Consommation)
```typescript
if (mouvement.type === "Sortie") {
  // PAS DE CONVERSION
  // La quantité est déjà en unité de sortie
  console.log(`[SORTIE] Article: ${article.nom}`);
  console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
  
  // Déduction après validation qualité
  // (logique dans approveQualityControl)
}
```

#### Ajustements
```typescript
if (mouvement.type === "Ajustement") {
  // PAS DE CONVERSION
  // Les ajustements sont TOUJOURS en unité de sortie
  console.log(`[AJUSTEMENT] Article: ${article.nom}`);
  console.log(`  Quantité: ${mouvement.qte} ${article.uniteSortie}`);
  
  if (typeAjustement === "Surplus") {
    stock += mouvement.qte;
  } else {
    stock -= mouvement.qte;
  }
}
```

### 2. ArticlesPage.tsx - Affichage du stock

#### Avant
```typescript
<td>{article.stock.toLocaleString()}</td>
```

#### Après
```typescript
<td>
  <div className="flex flex-col items-end gap-0.5">
    {/* Stock principal en unité de sortie */}
    <span className="font-mono font-semibold">
      {article.stock.toLocaleString()} 
      <span className="text-xs text-muted">{article.uniteSortie}</span>
    </span>
    
    {/* Stock secondaire en unité d'entrée (si conversion) */}
    {article.facteurConversion !== 1 && (
      <span className="text-[10px] text-muted font-mono">
        ({(article.stock / article.facteurConversion).toFixed(2)} {article.uniteEntree})
      </span>
    )}
  </div>
</td>
```

### 3. Dashboard.tsx - Stock total

Le stock total affiché dans le dashboard est la somme de tous les stocks en unités de sortie.

**Note importante** : Le total est une somme d'unités mixtes (Kg + Paires + Unités, etc.). C'est une valeur indicative pour montrer le volume global, pas une valeur précise.

## Exemples de scénarios

### Scénario 1 : Réception de matière première

```
Configuration:
  Article: Poudre de Nitrile
  Unité d'Entrée: Tonne
  Unité de Sortie: Kg
  Facteur: 1000
  Stock initial: 500 Kg

Action: Réception de 3 Tonnes

Calcul:
  Quantité saisie: 3 Tonnes
  Conversion: 3 × 1000 = 3000 Kg
  Nouveau stock: 500 + 3000 = 3500 Kg

Affichage:
  Stock: 3500 Kg
         (3.5 Tonnes)

Console:
  [ENTRÉE] Article: Poudre de Nitrile
    Quantité saisie: 3 Tonne
    Facteur conversion: 1000
    Quantité convertie: 3000 Kg
    Stock avant: 500 Kg
    Stock après: 3500 Kg
```

### Scénario 2 : Consommation

```
Configuration:
  Article: Poudre de Nitrile
  Unité de Sortie: Kg
  Stock actuel: 3500 Kg

Action: Sortie de 250 Kg

Calcul:
  Quantité saisie: 250 Kg (déjà en unité de sortie)
  Pas de conversion
  Nouveau stock: 3500 - 250 = 3250 Kg

Affichage:
  Stock: 3250 Kg
         (3.25 Tonnes)

Console:
  [SORTIE] Article: Poudre de Nitrile
    Quantité: 250 Kg
    En attente de validation qualité
```

### Scénario 3 : Gants en boîtes

```
Configuration:
  Article: Gants Nitrile M
  Unité d'Entrée: Boîte
  Unité de Sortie: Paire
  Facteur: 100
  Stock initial: 1000 Paires

Action: Réception de 25 Boîtes

Calcul:
  Quantité saisie: 25 Boîtes
  Conversion: 25 × 100 = 2500 Paires
  Nouveau stock: 1000 + 2500 = 3500 Paires

Affichage:
  Stock: 3500 Paires
         (35 Boîtes)

Console:
  [ENTRÉE] Article: Gants Nitrile M
    Quantité saisie: 25 Boîte
    Facteur conversion: 100
    Quantité convertie: 2500 Paire
    Stock avant: 1000 Paire
    Stock après: 3500 Paire
```

### Scénario 4 : Article sans conversion

```
Configuration:
  Article: Gants XL
  Unité d'Entrée: Paire
  Unité de Sortie: Paire
  Facteur: 1
  Stock initial: 50 Paires

Action: Réception de 100 Paires

Calcul:
  Quantité saisie: 100 Paires
  Conversion: 100 × 1 = 100 Paires
  Nouveau stock: 50 + 100 = 150 Paires

Affichage:
  Stock: 150 Paires
  (pas de ligne secondaire car facteur = 1)

Console:
  [ENTRÉE] Article: Gants XL
    Quantité saisie: 100 Paire
    Facteur conversion: 1
    Quantité convertie: 100 Paire
    Stock avant: 50 Paire
    Stock après: 150 Paire
```

## Avantages de la standardisation

### 1. Précision
✅ Pas d'erreur d'arrondi
✅ Calculs toujours exacts
✅ Stock fiable à tout moment

### 2. Cohérence
✅ Tous les stocks dans la même unité (sortie)
✅ Seuils et alertes cohérents
✅ Consommation journalière précise

### 3. Simplicité
✅ Une seule unité de référence
✅ Conversion automatique
✅ Pas de confusion

### 4. Traçabilité
✅ Logs détaillés dans la console
✅ Affichage des deux unités
✅ Historique clair

## Debugging et vérification

### Console logs

Lors de chaque mouvement, des logs détaillés sont affichés :

```javascript
// Exemple de log pour une entrée
[ENTRÉE] Article: Poudre de Nitrile
  Quantité saisie: 2 Tonne
  Facteur conversion: 1000
  Quantité convertie: 2000 Kg
  Stock avant: 500 Kg
  Stock après: 2500 Kg
```

### Vérification manuelle

Pour vérifier qu'un article est correctement configuré :

1. Ouvrir la console du navigateur (F12)
2. Créer une entrée
3. Vérifier les logs de conversion
4. Vérifier l'affichage du stock
5. Calculer manuellement : `quantité × facteur = stock ajouté`

### Tests suggérés

#### Test 1 : Conversion simple
```
1. Créer un article avec facteur 1000
2. Stock initial : 0 Kg
3. Ajouter 1 Tonne
4. Vérifier : Stock = 1000 Kg
```

#### Test 2 : Conversion multiple
```
1. Article avec facteur 100
2. Stock initial : 500 Paires
3. Ajouter 10 Boîtes
4. Vérifier : Stock = 1500 Paires (500 + 1000)
```

#### Test 3 : Sans conversion
```
1. Article avec facteur 1
2. Stock initial : 50 Paires
3. Ajouter 100 Paires
4. Vérifier : Stock = 150 Paires
```

#### Test 4 : Sortie
```
1. Article avec stock 2000 Kg
2. Sortie de 250 Kg
3. Après validation qualité
4. Vérifier : Stock = 1750 Kg
```

## Compatibilité

### Articles existants

Les articles créés avant cette mise à jour fonctionnent toujours :
- Si `facteurConversion` n'est pas défini, il est considéré comme 1
- Si `uniteEntree` et `uniteSortie` ne sont pas définis, ils utilisent `unite`
- Pas de migration nécessaire

### Nouveaux articles

Tous les nouveaux articles doivent avoir :
- `uniteEntree` : Unité d'achat
- `uniteSortie` : Unité de consommation
- `facteurConversion` : Ratio entre les deux

## Fichiers modifiés

- ✅ `src/contexts/DataContext.tsx` - Logique de conversion dans addMouvement()
- ✅ `src/pages/ArticlesPage.tsx` - Affichage du stock avec unité
- ✅ `STOCK_STANDARDIZATION_COMPLETE.md` - Documentation (ce fichier)

## Prochaines étapes (optionnel)

1. **Page Mouvements** : Afficher l'unité appropriée pour chaque mouvement
2. **Rapports** : Exporter avec les deux unités
3. **Graphiques** : Afficher les conversions dans les graphiques
4. **Inventaire** : Permettre la saisie dans les deux unités
5. **Alertes** : Afficher les seuils dans les deux unités

## Support

Pour toute question :
1. Consulter cette documentation
2. Vérifier les logs de la console
3. Tester avec des données de démonstration
4. Vérifier les calculs manuellement

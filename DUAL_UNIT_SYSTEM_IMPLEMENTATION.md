# Système de Double Unité avec Facteur de Conversion

## Vue d'ensemble

Implémentation d'un système de gestion d'articles avec deux unités distinctes :
- **Unité d'Entrée** : Utilisée lors des achats/réceptions (ex: Tonne, Carton, Boîte)
- **Unité de Sortie** : Utilisée lors des consommations/sorties (ex: Kg, Paire, Unité)
- **Facteur de Conversion** : Ratio entre les deux unités

## Cas d'usage

### Exemple 1 : Matières premières
- Achat en **Tonnes**
- Consommation en **Kg**
- Facteur : 1 Tonne = 1000 Kg

### Exemple 2 : Gants
- Achat en **Boîtes** (100 paires par boîte)
- Consommation en **Paires**
- Facteur : 1 Boîte = 100 Paires

### Exemple 3 : Masques
- Achat en **Cartons** (1000 unités par carton)
- Consommation en **Unités**
- Facteur : 1 Carton = 1000 Unités

## Modifications apportées

### 1. Interface Article (DataContext.tsx)

```typescript
export interface Article {
  id: number;
  ref: string;
  nom: string;
  categorie: string;
  stock: number; // TOUJOURS stocké en unité de sortie (plus petite unité)
  seuil: number;
  unite: string; // Champ legacy - maintenu pour compatibilité
  uniteEntree: string; // Unité d'achat (ex: "Tonne")
  uniteSortie: string; // Unité de consommation (ex: "Kg")
  facteurConversion: number; // Combien d'unités de sortie dans 1 unité d'entrée
  consommationParInventaire: number;
  consommationJournaliere: number;
  locations: ArticleLocation[];
}
```

### 2. Formulaire Article (ArticlesPage.tsx)

Nouveaux champs ajoutés :
- **Unité d'Entrée** : Dropdown avec toutes les unités disponibles
- **Unité de Sortie** : Dropdown avec toutes les unités disponibles
- **Facteur de Conversion** : Input numérique avec validation
- **Affichage dynamique** : "1 [Unité d'Entrée] = X [Unité de Sortie]"

### 3. Affichage dans le tableau

Colonne "Unités" mise à jour pour afficher :
- Entrée: [Unité d'Entrée]
- Sortie: [Unité de Sortie]
- Ratio: 1:X (si facteur ≠ 1)

### 4. Utilitaires de conversion (unit-conversion.ts)

Fonctions créées :
- `convertEntryToExit()` : Convertit quantité d'entrée → sortie
- `convertExitToEntry()` : Convertit quantité de sortie → entrée
- `formatQuantityWithUnit()` : Formate avec l'unité appropriée
- `getConversionText()` : Génère le texte de conversion
- `getStockInEntryUnits()` : Calcule le stock en unités d'entrée

## Logique de gestion du stock

### Principe fondamental
**Le stock est TOUJOURS stocké en unité de sortie (la plus petite unité)**

Pourquoi ?
- Précision maximale
- Évite les erreurs d'arrondi
- Facilite les calculs de consommation
- Compatible avec les seuils et alertes

### Lors d'une Entrée (Réception)

1. L'utilisateur saisit la quantité en **unité d'entrée**
   - Exemple : 5 Tonnes

2. Le système convertit automatiquement en **unité de sortie**
   - Calcul : 5 × 1000 = 5000 Kg

3. Le stock est mis à jour en **unité de sortie**
   - Stock += 5000 Kg

### Lors d'une Sortie (Consommation)

1. L'utilisateur saisit la quantité en **unité de sortie**
   - Exemple : 250 Kg

2. Le stock est directement déduit (pas de conversion)
   - Stock -= 250 Kg

### Affichage du stock

Le stock peut être affiché de deux façons :

1. **En unité de sortie** (par défaut)
   - Affichage : 5000 Kg
   - Utilisé pour : Consommation quotidienne, seuils, alertes

2. **En unité d'entrée** (optionnel)
   - Calcul : 5000 / 1000 = 5 Tonnes
   - Utilisé pour : Commandes, inventaire physique

## Exemples de configuration

### Configuration 1 : Gants (système actuel)
```
Nom: Gants Nitrile M
Unité d'Entrée: Boîte
Unité de Sortie: Paire
Facteur de Conversion: 100
Signification: 1 Boîte = 100 Paires
```

**Scénario :**
- Réception : 25 Boîtes → Stock += 2500 Paires
- Consommation : 50 Paires → Stock -= 50 Paires
- Stock actuel : 2450 Paires (ou 24.5 Boîtes)

### Configuration 2 : Matière première
```
Nom: Poudre de Nitrile
Unité d'Entrée: Tonne
Unité de Sortie: Kg
Facteur de Conversion: 1000
Signification: 1 Tonne = 1000 Kg
```

**Scénario :**
- Réception : 3 Tonnes → Stock += 3000 Kg
- Consommation : 125 Kg → Stock -= 125 Kg
- Stock actuel : 2875 Kg (ou 2.875 Tonnes)

### Configuration 3 : Unité unique
```
Nom: Gants XL
Unité d'Entrée: Paire
Unité de Sortie: Paire
Facteur de Conversion: 1
Signification: 1 Paire = 1 Paire
```

**Scénario :**
- Réception : 100 Paires → Stock += 100 Paires
- Consommation : 15 Paires → Stock -= 15 Paires
- Stock actuel : 85 Paires

## Validation et règles métier

### Validation du formulaire
✅ Unité d'entrée obligatoire
✅ Unité de sortie obligatoire
✅ Facteur de conversion > 0
✅ Facteur de conversion peut être décimal (ex: 0.001 pour mg → g)

### Règles de conversion
- Facteur = 1 : Unités identiques (pas de conversion)
- Facteur > 1 : Unité d'entrée plus grande (ex: Tonne → Kg)
- Facteur < 1 : Unité d'entrée plus petite (rare, ex: g → Kg = 0.001)

### Compatibilité ascendante
- Le champ `unite` est maintenu pour compatibilité
- Il est automatiquement synchronisé avec `uniteSortie`
- Les anciens articles fonctionnent avec facteur = 1

## Interface utilisateur

### Formulaire d'ajout/modification

```
┌─────────────────────────────────────────┐
│ Unité d'Entrée (Achat)                  │
│ [Dropdown: Tonne ▼]                     │
│ Unité utilisée lors des entrées de stock│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Unité de Sortie (Consommation)          │
│ [Dropdown: Kg ▼]                        │
│ Unité utilisée lors des sorties de stock│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Facteur de Conversion                   │
│ [Input: 1000]                           │
│ 1 Tonne = 1000 Kg                       │
│ Nombre d'unités de sortie dans une      │
│ unité d'entrée                          │
└─────────────────────────────────────────┘
```

### Tableau des articles

```
┌──────────────────────────────────────┐
│ Unités                               │
├──────────────────────────────────────┤
│ Entrée: [Tonne]                      │
│ Sortie: [Kg]                         │
│ 1:1000                               │
└──────────────────────────────────────┘
```

## Avantages du système

### Pour l'entreprise
✅ Achète en gros (Tonnes, Cartons, Palettes)
✅ Consomme en détail (Kg, Unités, Paires)
✅ Conversion automatique et précise
✅ Pas d'erreur de calcul manuel

### Pour la gestion
✅ Stock toujours en unité précise
✅ Seuils et alertes cohérents
✅ Consommation journalière exacte
✅ Inventaire facilité

### Pour les utilisateurs
✅ Interface intuitive
✅ Conversion automatique
✅ Affichage clair des deux unités
✅ Pas de calcul mental nécessaire

## Migration des données existantes

Les articles existants sont automatiquement migrés :
- `uniteEntree` = `unite` (unité actuelle)
- `uniteSortie` = `unite` (unité actuelle)
- `facteurConversion` = 1 (pas de conversion)

Exemple :
```
Avant : unite = "Paire"
Après : uniteEntree = "Paire", uniteSortie = "Paire", facteur = 1
```

## Tests suggérés

### Test 1 : Création avec conversion
1. Créer un article "Poudre Test"
2. Unité d'entrée : Tonne
3. Unité de sortie : Kg
4. Facteur : 1000
5. Créer une entrée de 2 Tonnes
6. Vérifier : Stock = 2000 Kg

### Test 2 : Sortie avec conversion
1. Créer une sortie de 500 Kg
2. Vérifier : Stock = 1500 Kg
3. Vérifier affichage : 1.5 Tonnes

### Test 3 : Sans conversion
1. Créer un article "Gants Test"
2. Unité d'entrée : Paire
3. Unité de sortie : Paire
4. Facteur : 1
5. Créer une entrée de 100 Paires
6. Vérifier : Stock = 100 Paires

### Test 4 : Modification du facteur
1. Modifier un article existant
2. Changer le facteur de conversion
3. Vérifier que le stock reste cohérent
4. Vérifier les nouveaux mouvements

## Fichiers modifiés

- ✅ `src/contexts/DataContext.tsx` - Interface Article étendue
- ✅ `src/pages/ArticlesPage.tsx` - Formulaire et affichage mis à jour
- ✅ `src/lib/unit-conversion.ts` - Utilitaires de conversion (nouveau)
- ✅ `DUAL_UNIT_SYSTEM_IMPLEMENTATION.md` - Documentation (nouveau)

## Prochaines étapes (optionnel)

1. **Page Mouvements** : Afficher l'unité appropriée (entrée/sortie)
2. **Rapports** : Afficher les deux unités dans les exports
3. **Dashboard** : Graphiques avec conversion automatique
4. **Inventaire** : Permettre la saisie dans les deux unités
5. **Historique** : Tracer les conversions effectuées

## Support

Pour toute question sur le système de double unité :
1. Consulter cette documentation
2. Vérifier les exemples de configuration
3. Tester avec des données de démonstration
4. Vérifier les logs de conversion dans la console

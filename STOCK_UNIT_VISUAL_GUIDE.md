# Guide Visuel - Système de Stock Standardisé

## Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX DE GESTION DU STOCK                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   RÉCEPTION  │         │  CONVERSION  │         │    STOCK     │
│   (Entrée)   │────────▶│  AUTOMATIQUE │────────▶│  (Sortie)    │
└──────────────┘         └──────────────┘         └──────────────┘
  Unité d'Entrée         Facteur × Qté           Unité de Sortie
  Ex: 2 Tonnes           2 × 1000                Ex: 2000 Kg


┌──────────────┐                                 ┌──────────────┐
│ CONSOMMATION │                                 │    STOCK     │
│   (Sortie)   │────────────────────────────────▶│  (Sortie)    │
└──────────────┘         Pas de conversion       └──────────────┘
  Unité de Sortie                                Unité de Sortie
  Ex: 250 Kg                                     Ex: 1750 Kg
```

## Affichage dans le tableau

### Article avec conversion (Facteur ≠ 1)

```
┌────────────────────────────────────────────────────────────────┐
│ Réf        │ Article           │ Unités          │ Stock       │
├────────────┼───────────────────┼─────────────────┼─────────────┤
│ MAT-001    │ Poudre Nitrile    │ Entrée: Tonne   │ 2500 Kg     │
│            │                   │ Sortie: Kg      │ (2.5 Tonnes)│
│            │                   │ 1:1000          │             │
└────────────┴───────────────────┴─────────────────┴─────────────┘
                                                    ↑         ↑
                                                Principal  Secondaire
                                                (Sortie)   (Entrée)
```

### Article sans conversion (Facteur = 1)

```
┌────────────────────────────────────────────────────────────────┐
│ Réf        │ Article           │ Unités          │ Stock       │
├────────────┼───────────────────┼─────────────────┼─────────────┤
│ GN-XL-004  │ Gants Nitrile XL  │ Entrée: Paire   │ 150 Paires  │
│            │                   │ Sortie: Paire   │             │
│            │                   │ 1:1             │             │
└────────────┴───────────────────┴─────────────────┴─────────────┘
                                                    ↑
                                                Pas de ligne
                                                secondaire
```

## Exemple complet : Matière première

### Configuration initiale

```
┌─────────────────────────────────────────────────────────┐
│ Article: Poudre de Nitrile                              │
├─────────────────────────────────────────────────────────┤
│ Unité d'Entrée:        Tonne                            │
│ Unité de Sortie:       Kg                               │
│ Facteur de Conversion: 1000                             │
│ Stock initial:         500 Kg                           │
└─────────────────────────────────────────────────────────┘
```

### Étape 1 : Réception

```
┌─────────────────────────────────────────────────────────┐
│ MOUVEMENT: Entrée                                       │
├─────────────────────────────────────────────────────────┤
│ Quantité saisie:  3 Tonnes                              │
│                   ↓                                     │
│ Conversion:       3 × 1000 = 3000 Kg                    │
│                   ↓                                     │
│ Stock mis à jour: 500 + 3000 = 3500 Kg                 │
└─────────────────────────────────────────────────────────┘

Console:
  [ENTRÉE] Article: Poudre de Nitrile
    Quantité saisie: 3 Tonne
    Facteur conversion: 1000
    Quantité convertie: 3000 Kg
    Stock avant: 500 Kg
    Stock après: 3500 Kg
```

### Étape 2 : Affichage

```
┌─────────────────────────────────────────────────────────┐
│ TABLEAU DES ARTICLES                                    │
├─────────────────────────────────────────────────────────┤
│ Stock: 3500 Kg                                          │
│        (3.5 Tonnes)                                     │
│                                                         │
│ ✓ Stock principal en Kg (unité de sortie)              │
│ ✓ Stock secondaire en Tonnes (unité d'entrée)          │
└─────────────────────────────────────────────────────────┘
```

### Étape 3 : Consommation

```
┌─────────────────────────────────────────────────────────┐
│ MOUVEMENT: Sortie                                       │
├─────────────────────────────────────────────────────────┤
│ Quantité saisie:  250 Kg                                │
│                   ↓                                     │
│ Pas de conversion (déjà en unité de sortie)             │
│                   ↓                                     │
│ Stock mis à jour: 3500 - 250 = 3250 Kg                 │
│                   (après validation qualité)            │
└─────────────────────────────────────────────────────────┘

Console:
  [SORTIE] Article: Poudre de Nitrile
    Quantité: 250 Kg
    En attente de validation qualité
```

### Étape 4 : Résultat final

```
┌─────────────────────────────────────────────────────────┐
│ STOCK FINAL                                             │
├─────────────────────────────────────────────────────────┤
│ Stock: 3250 Kg                                          │
│        (3.25 Tonnes)                                    │
│                                                         │
│ Historique:                                             │
│ • Stock initial:  500 Kg                                │
│ • + Entrée:       3000 Kg (3 Tonnes)                    │
│ • - Sortie:       250 Kg                                │
│ • = Stock final:  3250 Kg (3.25 Tonnes)                │
└─────────────────────────────────────────────────────────┘
```

## Exemple complet : Gants en boîtes

### Configuration initiale

```
┌─────────────────────────────────────────────────────────┐
│ Article: Gants Nitrile M                                │
├─────────────────────────────────────────────────────────┤
│ Unité d'Entrée:        Boîte                            │
│ Unité de Sortie:       Paire                            │
│ Facteur de Conversion: 100                              │
│ Stock initial:         1000 Paires                      │
└─────────────────────────────────────────────────────────┘
```

### Étape 1 : Réception

```
┌─────────────────────────────────────────────────────────┐
│ MOUVEMENT: Entrée                                       │
├─────────────────────────────────────────────────────────┤
│ Quantité saisie:  25 Boîtes                             │
│                   ↓                                     │
│ Conversion:       25 × 100 = 2500 Paires                │
│                   ↓                                     │
│ Stock mis à jour: 1000 + 2500 = 3500 Paires            │
└─────────────────────────────────────────────────────────┘

Console:
  [ENTRÉE] Article: Gants Nitrile M
    Quantité saisie: 25 Boîte
    Facteur conversion: 100
    Quantité convertie: 2500 Paire
    Stock avant: 1000 Paire
    Stock après: 3500 Paire
```

### Étape 2 : Affichage

```
┌─────────────────────────────────────────────────────────┐
│ TABLEAU DES ARTICLES                                    │
├─────────────────────────────────────────────────────────┤
│ Stock: 3500 Paires                                      │
│        (35 Boîtes)                                      │
│                                                         │
│ ✓ Stock principal en Paires (unité de sortie)          │
│ ✓ Stock secondaire en Boîtes (unité d'entrée)          │
└─────────────────────────────────────────────────────────┘
```

### Étape 3 : Consommation

```
┌─────────────────────────────────────────────────────────┐
│ MOUVEMENT: Sortie                                       │
├─────────────────────────────────────────────────────────┤
│ Quantité saisie:  75 Paires                             │
│                   ↓                                     │
│ Pas de conversion (déjà en unité de sortie)             │
│                   ↓                                     │
│ Stock mis à jour: 3500 - 75 = 3425 Paires              │
│                   (après validation qualité)            │
└─────────────────────────────────────────────────────────┘

Console:
  [SORTIE] Article: Gants Nitrile M
    Quantité: 75 Paire
    En attente de validation qualité
```

### Étape 4 : Résultat final

```
┌─────────────────────────────────────────────────────────┐
│ STOCK FINAL                                             │
├─────────────────────────────────────────────────────────┤
│ Stock: 3425 Paires                                      │
│        (34.25 Boîtes)                                   │
│                                                         │
│ Historique:                                             │
│ • Stock initial:  1000 Paires (10 Boîtes)               │
│ • + Entrée:       2500 Paires (25 Boîtes)               │
│ • - Sortie:       75 Paires (0.75 Boîtes)               │
│ • = Stock final:  3425 Paires (34.25 Boîtes)            │
└─────────────────────────────────────────────────────────┘
```

## Comparaison : Avec vs Sans conversion

### Avec conversion (Facteur = 1000)

```
┌──────────────────────────────────────────────────────────┐
│ AVANT                          │ APRÈS                   │
├────────────────────────────────┼─────────────────────────┤
│ Réception: 2 Tonnes            │ Stock: +2000 Kg         │
│ Sortie:    250 Kg              │ Stock: -250 Kg          │
│                                │                         │
│ Stock affiché:                 │ Stock affiché:          │
│ • 1750 Kg (principal)          │ • 1750 Kg (principal)   │
│ • 1.75 Tonnes (secondaire)     │ • 1.75 Tonnes (second.) │
└────────────────────────────────┴─────────────────────────┘
```

### Sans conversion (Facteur = 1)

```
┌──────────────────────────────────────────────────────────┐
│ AVANT                          │ APRÈS                   │
├────────────────────────────────┼─────────────────────────┤
│ Réception: 100 Paires          │ Stock: +100 Paires      │
│ Sortie:    15 Paires           │ Stock: -15 Paires       │
│                                │                         │
│ Stock affiché:                 │ Stock affiché:          │
│ • 85 Paires (principal)        │ • 85 Paires (principal) │
│ • Pas de ligne secondaire      │ • Pas de ligne second.  │
└────────────────────────────────┴─────────────────────────┘
```

## Règles de calcul

### Formules

```
┌─────────────────────────────────────────────────────────┐
│ CONVERSION ENTRÉE → SORTIE                              │
├─────────────────────────────────────────────────────────┤
│ Stock (Sortie) = Quantité (Entrée) × Facteur           │
│                                                         │
│ Exemple:                                                │
│ Stock (Kg) = 2 (Tonnes) × 1000 = 2000 Kg               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CONVERSION SORTIE → ENTRÉE (Affichage)                 │
├─────────────────────────────────────────────────────────┤
│ Stock (Entrée) = Stock (Sortie) ÷ Facteur              │
│                                                         │
│ Exemple:                                                │
│ Stock (Tonnes) = 2000 (Kg) ÷ 1000 = 2 Tonnes           │
└─────────────────────────────────────────────────────────┘
```

### Tableau de conversion rapide

```
┌──────────────┬──────────────┬──────────┬─────────────────┐
│ Unité Entrée │ Unité Sortie │ Facteur  │ Exemple         │
├──────────────┼──────────────┼──────────┼─────────────────┤
│ Tonne        │ Kg           │ 1000     │ 1 T = 1000 Kg   │
│ Carton       │ Unité        │ 1000     │ 1 C = 1000 U    │
│ Boîte        │ Paire        │ 100      │ 1 B = 100 P     │
│ Palette      │ Carton       │ 50       │ 1 Pal = 50 C    │
│ Kg           │ g            │ 1000     │ 1 Kg = 1000 g   │
│ Litre        │ ml           │ 1000     │ 1 L = 1000 ml   │
│ Paire        │ Paire        │ 1        │ 1 P = 1 P       │
└──────────────┴──────────────┴──────────┴─────────────────┘
```

## Checklist de vérification

### Avant de créer un mouvement

- [ ] Je connais l'unité d'entrée de l'article
- [ ] Je connais l'unité de sortie de l'article
- [ ] Je connais le facteur de conversion
- [ ] Je sais dans quelle unité je vais saisir la quantité

### Après avoir créé un mouvement

- [ ] Le stock affiché est en unité de sortie
- [ ] La conversion est correcte (si applicable)
- [ ] Les logs de la console sont corrects
- [ ] Le stock secondaire est affiché (si facteur ≠ 1)

### En cas de doute

1. Ouvrir la console (F12)
2. Vérifier les logs de conversion
3. Calculer manuellement : `quantité × facteur`
4. Comparer avec le stock affiché
5. Vérifier le facteur de conversion de l'article

## Support

Pour toute question :
- Consulter `STOCK_STANDARDIZATION_COMPLETE.md` pour les détails techniques
- Consulter `DUAL_UNIT_QUICK_START.md` pour le guide rapide
- Vérifier les logs de la console pour le debugging

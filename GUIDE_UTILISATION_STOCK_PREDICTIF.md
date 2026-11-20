# Guide d'Utilisation - Système de Gestion du Stock Prédictif

## 📋 Table des matières

1. [Introduction](#introduction)
2. [Concepts Clés](#concepts-clés)
3. [Ajouter un Article](#ajouter-un-article)
4. [Consulter le Tableau de Bord](#consulter-le-tableau-de-bord)
5. [Interpréter les Statuts](#interpréter-les-statuts)
6. [Bonnes Pratiques](#bonnes-pratiques)

## Introduction

Le système de gestion du stock prédictif vous aide à anticiper les ruptures de stock en calculant automatiquement l'autonomie de chaque article basée sur sa consommation réelle.

## Concepts Clés

### Consommation Journalière Estimée (CJE)

La **CJE** est le nombre d'unités consommées par jour pour un article donné.

**Exemple** :
- Gants Nitrile M : 50 paires/jour
- Masques FFP2 : 200 unités/jour

### Autonomie (Temps Restant)

L'**autonomie** est le nombre de jours (ou heures) avant rupture de stock, calculée automatiquement :

```
Autonomie = Stock Actuel ÷ CJE
```

**Affichage** :
- "50j" = 50 jours
- "5j 12h" = 5 jours et 12 heures
- "18h" = 18 heures

### Statut Dynamique

Le statut change automatiquement selon l'autonomie et le seuil de sécurité.

## Ajouter un Article

### Étape 1 : Accéder au Formulaire

1. Allez à la page **Articles**
2. Cliquez sur le bouton **"Ajouter"** (en haut à droite)

### Étape 2 : Remplir les Champs

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Référence** | Code unique de l'article | GN-M-001 |
| **Nom** | Nom descriptif | Gants Nitrile M |
| **Catégorie** | Catégorie de l'article | Gants Nitrile |
| **Emplacement** | Localisation du stock | Zone A-12 |
| **Stock** | Quantité actuelle | 2500 |
| **Seuil** | Seuil de sécurité minimum | 500 |
| **Unité** | Unité de mesure | Paire |
| **CJE** | Consommation journalière estimée | 50 |

### Étape 3 : Valider

Cliquez sur **"Ajouter"** pour créer l'article.

## Consulter le Tableau de Bord

### Accéder au Tableau de Bord

1. Allez à la page **Tableau de Bord**
2. Consultez les résumés en haut :
   - 🔴 **Articles Critiques** : Nécessitent une action immédiate
   - 🟠 **Articles en Attention** : À surveiller
   - 🟢 **Articles Sécurisés** : Aucune action requise

### Consulter les Détails

Chaque section affiche un tableau avec :
- **Article** : Nom et référence
- **Stock** : Quantité actuelle
- **Seuil** : Seuil de sécurité
- **Autonomie** : Temps restant avant rupture
- **CJE** : Consommation journalière

## Interpréter les Statuts

### 🔴 CRITIQUE (Rouge)

**Quand** : Stock ≤ Seuil **OU** Autonomie ≤ 3 jours

**Signification** : Risque immédiat de rupture de stock

**Actions Recommandées** :
- ✅ Passer une commande d'urgence
- ✅ Vérifier le stock physique
- ✅ Augmenter la CJE si nécessaire
- ✅ Réduire temporairement la consommation

**Exemple** :
```
Gants Nitrile XL
Stock : 45 unités
Seuil : 200 unités
CJE : 15 unités/jour
Autonomie : 3 jours
Statut : 🔴 CRITIQUE
```

### 🟠 ATTENTION (Orange)

**Quand** : Autonomie entre 4 et 7 jours

**Signification** : Stock en baisse, action préventive recommandée

**Actions Recommandées** :
- ✅ Prévoir une commande pour la semaine
- ✅ Surveiller la consommation
- ✅ Vérifier les délais de livraison
- ✅ Préparer les documents de commande

**Exemple** :
```
Gants Latex S
Stock : 1800 unités
Seuil : 400 unités
CJE : 35 unités/jour
Autonomie : 5 jours
Statut : 🟠 ATTENTION
```

### 🟢 SÉCURISÉ (Vert)

**Quand** : Stock > Seuil **ET** Autonomie > 7 jours

**Signification** : Stock suffisant, aucune action urgente

**Actions Recommandées** :
- ✅ Continuer la surveillance régulière
- ✅ Planifier les commandes futures
- ✅ Analyser les tendances de consommation

**Exemple** :
```
Gants Nitrile M
Stock : 2500 unités
Seuil : 500 unités
CJE : 50 unités/jour
Autonomie : 50 jours
Statut : 🟢 SÉCURISÉ
```

## Bonnes Pratiques

### 1. Mettre à Jour la CJE Régulièrement

- Révisez la CJE tous les mois
- Basez-vous sur les données réelles de consommation
- Ajustez selon les variations saisonnières

### 2. Surveiller le Tableau de Bord

- Consultez le tableau de bord **chaque jour**
- Agissez rapidement sur les articles critiques
- Planifiez les commandes pour les articles en attention

### 3. Valider le Stock Physique

- Effectuez des inventaires réguliers
- Corrigez les écarts entre stock théorique et physique
- Utilisez ces données pour affiner la CJE

### 4. Optimiser les Seuils

- Ajustez les seuils selon votre capacité de stockage
- Considérez les délais de livraison des fournisseurs
- Maintenez un équilibre entre sécurité et coûts

### 5. Documenter les Changements

- Notez les raisons des modifications de CJE
- Tracez les variations de consommation
- Utilisez ces informations pour les prévisions

## Conseils Pratiques

### Déterminer la CJE

**Méthode 1 : Historique**
```
CJE = Consommation totale du mois ÷ Nombre de jours
```

**Méthode 2 : Moyenne Mobile**
```
CJE = Moyenne des 3 derniers mois
```

**Méthode 3 : Prévision**
```
CJE = Consommation prévue basée sur les commandes
```

### Fixer le Seuil de Sécurité

**Formule Recommandée** :
```
Seuil = CJE × Délai de livraison (jours) × 1.5
```

**Exemple** :
- CJE : 50 unités/jour
- Délai de livraison : 5 jours
- Seuil = 50 × 5 × 1.5 = **375 unités**

### Interpréter les Tooltips

Survolez le badge de statut pour voir :
```
"Basé sur une consommation de 50 unités par jour"
```

Cela vous rappelle la CJE utilisée pour le calcul.

## Dépannage

### Le statut ne change pas après modification

- Vérifiez que vous avez cliqué sur "Modifier"
- Assurez-vous que la CJE est correctement saisie
- Rafraîchissez la page si nécessaire

### L'autonomie affiche "N/A"

- Vérifiez que la CJE n'est pas 0
- Assurez-vous que le stock est > 0
- Vérifiez que la CJE est un nombre valide

### Les couleurs ne correspondent pas

- Vérifiez les seuils d'autonomie :
  - 🔴 CRITIQUE : ≤ 3 jours
  - 🟠 ATTENTION : 4-7 jours
  - 🟢 SÉCURISÉ : > 7 jours

## Support

Pour toute question ou problème :
1. Consultez ce guide
2. Vérifiez les données saisies
3. Contactez l'administrateur système

---

**Dernière mise à jour** : Février 2026
**Version** : 1.0

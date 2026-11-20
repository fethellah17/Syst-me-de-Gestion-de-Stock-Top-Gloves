# Système de Gestion du Stock Critique Prédictif

## Vue d'ensemble

Le système de gestion du stock critique a été transformé en un système prédictif basé sur la consommation réelle. Ce système utilise des calculs dynamiques pour évaluer l'autonomie des stocks et générer des alertes intelligentes en temps réel.

## Fonctionnalités Principales

### 1. Consommation Journalière Estimée (CJE)

Chaque article dispose maintenant d'un champ **Consommation Journalière Estimée (CJE)** qui représente le nombre d'unités consommées par jour.

- **Champ**: `consommationJournaliere` (nombre)
- **Unité**: unités/jour
- **Exemple**: 50 unités/jour pour les Gants Nitrile M

### 2. Calcul Dynamique de l'Autonomie

L'autonomie est calculée en temps réel selon la formule :

```
Autonomie (heures) = (Stock Actuel / CJE) × 24
Autonomie (jours) = Stock Actuel / CJE
```

**Affichage lisible** :
- Si > 1 jour : "12j 5h"
- Si < 1 jour : "18h"
- Format : "Xj Yh" ou "Xh"

### 3. Statut Critique Dynamique

Le statut d'un article est calculé selon **deux critères de priorité** :

#### 🔴 CRITIQUE (Rouge)
- **Condition** : Stock Actuel ≤ Seuil de sécurité **OU** Temps Restant ≤ 3 jours
- **Icône** : 🔴 + Alerte
- **Couleur** : Rouge (#DC2626)
- **Action** : Commande urgente requise

#### 🟠 ATTENTION (Orange)
- **Condition** : Temps Restant entre 4 et 7 jours
- **Icône** : 🟠
- **Couleur** : Orange (#EA580C)
- **Action** : Prévoir une commande

#### 🟢 SÉCURISÉ (Vert)
- **Condition** : Stock Actuel > Seuil **ET** Temps Restant > 7 jours
- **Icône** : 🟢
- **Couleur** : Vert (#16A34A)
- **Action** : Aucune action requise

### 4. Interactivité en Temps Réel

- Les modifications du stock ou de la consommation mettent à jour **immédiatement** l'autonomie et le statut
- **Aucun rafraîchissement de page** requis
- Les changements sont réactifs et visibles instantanément

### 5. Tooltips Informatifs

Chaque badge de statut affiche une **tooltip** au survol :
```
"Basé sur une consommation de [X] unités par jour"
```

## Structure des Données

### Interface Article

```typescript
interface Article {
  id: number;
  ref: string;
  nom: string;
  categorie: string;
  emplacement: string;
  stock: number;
  seuil: number;
  unite: string;
  consommationParInventaire: number;
  consommationJournaliere: number;  // ← Nouveau champ
}
```

## Fichiers Créés/Modifiés

### Nouveaux Fichiers

1. **`src/lib/stock-utils.ts`**
   - Utilitaires pour calculer l'autonomie
   - Fonction `calculateAutonomy()` : calcule les jours/heures restants
   - Fonction `getStockStatus()` : détermine le statut dynamique

2. **`src/components/AutonomyBadge.tsx`**
   - Composant pour afficher l'autonomie avec couleurs
   - Gère les icônes et les badges arrondis

3. **`src/components/StockStatusBadge.tsx`**
   - Composant pour afficher le statut avec tooltip
   - Affiche l'icône d'alerte pour les articles critiques

4. **`src/components/StockDashboard.tsx`**
   - Tableau de bord prédictif
   - Affiche les articles critiques, en attention et sécurisés
   - Résumé avec compteurs

### Fichiers Modifiés

1. **`src/contexts/DataContext.tsx`**
   - Ajout du champ `consommationJournaliere` à l'interface Article
   - Initialisation des données avec CJE

2. **`src/pages/ArticlesPage.tsx`**
   - Ajout du champ CJE au formulaire modal
   - Affichage des colonnes "Temps Restant" et "Statut" dynamiques
   - Intégration des composants AutonomyBadge et StockStatusBadge

3. **`src/pages/Dashboard.tsx`**
   - Intégration du StockDashboard
   - Affichage du tableau de bord prédictif

## Utilisation

### Ajouter/Modifier un Article

1. Cliquez sur "Ajouter" ou "Modifier"
2. Remplissez les champs :
   - **Référence** : Code unique de l'article
   - **Nom** : Nom de l'article
   - **Catégorie** : Catégorie de l'article
   - **Emplacement** : Localisation du stock
   - **Stock** : Quantité actuelle
   - **Seuil** : Seuil de sécurité
   - **Unité** : Unité de mesure (paire, unité, boîte)
   - **CJE** : Consommation journalière estimée (ex: 50 unités/jour)

### Consulter le Tableau de Bord

1. Allez à la page "Tableau de Bord"
2. Consultez les résumés :
   - Nombre d'articles critiques
   - Nombre d'articles en attention
   - Nombre d'articles sécurisés
3. Consultez les tableaux détaillés pour chaque catégorie

### Consulter la Liste des Articles

1. Allez à la page "Articles"
2. Consultez les colonnes :
   - **Temps Restant** : Autonomie en jours/heures avec icône de couleur
   - **Statut** : Statut dynamique avec tooltip au survol

## Exemples de Calcul

### Exemple 1 : Gants Nitrile M
- Stock : 2500 unités
- CJE : 50 unités/jour
- Seuil : 500 unités
- **Autonomie** : 2500 / 50 = 50 jours
- **Statut** : 🟢 SÉCURISÉ (50 jours > 7 jours)

### Exemple 2 : Gants Nitrile XL
- Stock : 45 unités
- CJE : 15 unités/jour
- Seuil : 200 unités
- **Autonomie** : 45 / 15 = 3 jours
- **Statut** : 🔴 CRITIQUE (3 jours ≤ 3 jours ET Stock ≤ Seuil)

### Exemple 3 : Gants Latex S
- Stock : 1800 unités
- CJE : 35 unités/jour
- Seuil : 400 unités
- **Autonomie** : 1800 / 35 ≈ 51 jours
- **Statut** : 🟢 SÉCURISÉ (51 jours > 7 jours)

## Conformité à la Charte Graphique Top Gloves

- **Couleurs** : Rouge (#DC2626), Orange (#EA580C), Vert (#16A34A)
- **Badges** : Arrondis avec fond coloré et texte contrasté
- **Icônes** : Emojis pour une meilleure lisibilité
- **Typographie** : Cohérente avec le design système existant

## Performance et Réactivité

- Calculs effectués en **temps réel** sans appel API
- Mise à jour **instantanée** lors de modifications
- Pas de latence perceptible
- Optimisé pour les navigateurs modernes

## Évolutions Futures

- Historique des consommations pour affiner les CJE
- Prévisions basées sur les tendances
- Alertes par email/SMS pour les articles critiques
- Intégration avec les systèmes de commande automatique
- Rapports d'analyse de consommation

# Refactorisation de la Gestion des Mouvements - Top Gloves

## Vue d'ensemble

La localisation des articles est désormais gérée **exclusivement par les Mouvements**. Cette refactorisation suit une architecture ERP classique avec trois types de flux distincts.

## Changements Majeurs

### 1. Suppression du champ "Emplacement" des Articles

**Avant :**
```typescript
interface Article {
  id: number;
  ref: string;
  nom: string;
  categorie: string;
  emplacement: string;  // ❌ Supprimé
  stock: number;
  // ...
}
```

**Après :**
```typescript
interface Article {
  id: number;
  ref: string;
  nom: string;
  categorie: string;
  stock: number;
  // ...
}
```

**Impact :** L'emplacement d'un article est maintenant déterminé dynamiquement par son **dernier mouvement**.

### 2. Refonte du Type "Mouvement"

**Avant :**
```typescript
interface Mouvement {
  id: number;
  date: string;
  article: string;
  ref: string;
  type: "Entrée" | "Sortie";
  qte: number;
  emplacement: string;
  operateur: string;
}
```

**Après :**
```typescript
interface Mouvement {
  id: number;
  date: string;
  article: string;
  ref: string;
  type: "Entrée" | "Sortie" | "Transfert";
  qte: number;
  emplacementSource?: string;      // Pour Sortie et Transfert
  emplacementDestination: string;  // Pour tous les types
  operateur: string;
}
```

### 3. Trois Types de Flux

#### A. **Entrée (Réception)**
- **Champs :** Article, Emplacement de Destination, Quantité, Opérateur
- **Logique :**
  - Ajoute la quantité au stock global
  - Lie l'article à cet emplacement
  - Affiche l'emplacement de destination dans l'historique

#### B. **Sortie (Consommation)**
- **Champs :** Article, Emplacement Source (affiché automatiquement), Quantité à sortir, Opérateur
- **Logique :**
  - Déduit la quantité du stock
  - L'emplacement source est récupéré automatiquement du dernier mouvement
  - La destination est une utilisation (Département Production, Maintenance, etc.)

#### C. **Transfert Interne (Changement de Place)**
- **Champs :** Article, Emplacement Source, Emplacement de Destination, Quantité, Opérateur
- **Logique :**
  - **Ne change pas le stock total**
  - Diminue l'occupation de l'emplacement source
  - Augmente l'occupation de l'emplacement destination
  - Validation : impossible de transférer plus que la quantité disponible

### 4. Fonction Utilitaire : `getArticleCurrentLocation()`

```typescript
const getArticleCurrentLocation = (articleRef: string): string | null => {
  // Récupère le dernier mouvement de l'article
  const lastMovement = mouvements
    .filter(m => m.ref === articleRef)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  
  if (!lastMovement) return null;
  
  // Pour Sortie, retourner la source (avant la sortie)
  if (lastMovement.type === "Sortie" && lastMovement.emplacementSource) {
    return lastMovement.emplacementSource;
  }
  
  // Pour Entrée et Transfert, retourner la destination
  return lastMovement.emplacementDestination;
};
```

## Pages Modifiées

### ArticlesPage.tsx
- ✅ Suppression du champ "Emplacement" du formulaire
- ✅ Affichage dynamique de l'emplacement depuis le dernier mouvement
- ✅ Utilisation de `getArticleCurrentLocation()`

### MouvementsPage.tsx
- ✅ Ajout d'un sélecteur pour les 3 types (Entrée, Sortie, Transfert)
- ✅ Icônes distinctes :
  - 🔽 Flèche bas pour Entrée
  - 🔼 Flèche haut pour Sortie
  - ⇄ Flèches opposées pour Transfert
- ✅ Logique conditionnelle pour les champs selon le type
- ✅ Affichage automatique de l'emplacement source pour les sorties
- ✅ Validation : impossible de transférer plus que disponible
- ✅ Historique clair : "Transfert de [Zone A] vers [Zone B]"

### InventairePage.tsx
- ✅ Utilisation de `getArticleCurrentLocation()` pour afficher l'emplacement

### Dashboard.tsx
- ✅ Mise à jour des données statiques pour refléter la nouvelle structure

### DataContext.tsx
- ✅ Modification du type `Mouvement`
- ✅ Suppression du champ `emplacement` de `Article`
- ✅ Ajout de `getArticleCurrentLocation()`
- ✅ Mise à jour de la logique `addMouvement()`, `updateMouvement()`, `deleteMouvement()`
- ✅ Gestion correcte des trois types de mouvements

## Logique de Gestion des Stocks

### Entrée
```
Stock = Stock + Quantité
```

### Sortie
```
Stock = Stock - Quantité
```

### Transfert
```
Stock = Stock (inchangé)
Occupation[Source] = Occupation[Source] - Quantité
Occupation[Destination] = Occupation[Destination] + Quantité
```

## Avantages de cette Architecture

1. **Source unique de vérité** : L'emplacement est déterminé par l'historique des mouvements
2. **Traçabilité complète** : Chaque mouvement est enregistré avec ses détails
3. **Flexibilité** : Possibilité d'ajouter d'autres types de mouvements à l'avenir
4. **Intégrité des données** : Impossible d'avoir des incohérences entre articles et emplacements
5. **Audit** : Historique complet des transferts et mouvements

## Tests

Les tests ont été mis à jour pour valider :
- ✅ Calcul de l'occupation basé sur les mouvements
- ✅ Transferts d'articles entre emplacements
- ✅ Cohérence des stocks après transfert

## Migration des Données Existantes

Les données initiales ont été mises à jour :
- Articles : suppression du champ `emplacement`
- Mouvements : utilisation de `emplacementDestination` et `emplacementSource`

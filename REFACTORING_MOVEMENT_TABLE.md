# Refactoring - Tableau des Mouvements Réutilisable

## 📋 Résumé

Le tableau "Derniers Mouvements" du Dashboard utilise maintenant le même composant que la page Mouvements, garantissant une cohérence visuelle et fonctionnelle parfaite.

## ✅ Modifications Effectuées

### 1. Nouveau Composant Réutilisable
**Fichier**: `src/components/MovementTable.tsx`

Composant unique qui gère l'affichage des mouvements avec deux modes:
- **Mode Compact** (`compact={true}`): Version simplifiée pour le Dashboard
- **Mode Complet** (`compact={false}`): Version détaillée pour la page Mouvements

#### Colonnes Affichées

**Mode Compact (Dashboard)**:
- Type (avec badge coloré et icône)
- Article
- Source (masqué sur mobile)
- Destination (masqué sur tablette)
- Date/Heure
- Statut (masqué sur mobile)

**Mode Complet (Page Mouvements)**:
- Date complète
- Article (avec référence)
- Type (avec badge coloré et icône)
- Quantité
- Source (masqué sur petits écrans)
- Destination (masqué sur tablette)
- Statut (masqué sur mobile)
- Opérateur (masqué sur tablette)
- Approuvé par (masqué sur tablette)
- Actions (Contrôle Qualité, Modifier, Supprimer)

### 2. Dashboard Mis à Jour
**Fichier**: `src/pages/Dashboard.tsx`

```typescript
// Récupération des 5 derniers mouvements triés par date décroissante
const recentMovements = useMemo(() => {
  return [...mouvements]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
}, [mouvements]);

// Utilisation du composant
<MovementTable 
  movements={recentMovements} 
  showActions={false} 
  compact={true} 
/>
```

**Fonctionnalités**:
- ✅ Affiche les 5 mouvements les plus récents
- ✅ Tri automatique par date décroissante
- ✅ Affichage identique à la page Mouvements
- ✅ Message "Aucun mouvement récent" si vide
- ✅ Badges de statut colorés (En attente, Terminé, Rejeté)
- ✅ Icônes pour chaque type de mouvement

### 3. Page Mouvements Simplifiée
**Fichier**: `src/pages/MouvementsPage.tsx`

```typescript
// Tri intégré dans le filtrage
const filtered = mouvements
  .filter((m) => {
    const matchSearch = m.article.toLowerCase().includes(search.toLowerCase()) || 
                       m.ref.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || m.type === typeFilter;
    return matchSearch && matchType;
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Utilisation du composant
<MovementTable 
  movements={filtered}
  onEdit={handleEditMouvement}
  onDelete={handleDeleteClick}
  onQualityControl={handleOpenQCModal}
  showActions={true}
  compact={false}
/>
```

**Avantages**:
- ✅ Code simplifié (suppression de ~70 lignes de code dupliqué)
- ✅ Logique de rendu centralisée
- ✅ Maintenance facilitée

## 🎨 Badges de Type

Les badges de type sont identiques dans les deux vues:

| Type | Couleur | Icône |
|------|---------|-------|
| Entrée | Vert (`status-green`) | ⬇️ ArrowDownToLine |
| Sortie | Jaune (`status-yellow`) | ⬆️ ArrowUpFromLine |
| Transfert | Bleu (`status-blue`) | ↔️ ArrowRightLeft |
| Ajustement | Violet (`bg-purple-100`) | ✏️ FileEdit |

## 🎯 Badges de Statut

| Statut | Badge | Couleur |
|--------|-------|---------|
| En attente de validation Qualité | ⚠️ En attente | Orange |
| Terminé | ✓ Terminé | Vert |
| Rejeté | ✗ Rejeté | Rouge |

## 📱 Responsive Design

Le tableau s'adapte automatiquement à la taille de l'écran:

- **Mobile** (< 640px): Type, Article, Date
- **Tablette** (640px - 1024px): + Source, Destination
- **Desktop** (> 1024px): Toutes les colonnes

## 🔧 Props du Composant

```typescript
interface MovementTableProps {
  movements: Movement[];        // Liste des mouvements à afficher
  onEdit?: (id: number) => void;           // Callback pour éditer
  onDelete?: (id: number) => void;         // Callback pour supprimer
  onQualityControl?: (id: number) => void; // Callback pour contrôle qualité
  showActions?: boolean;        // Afficher la colonne Actions (défaut: true)
  compact?: boolean;            // Mode compact pour Dashboard (défaut: false)
}
```

## ✨ Avantages de la Refactorisation

1. **Cohérence Visuelle**: Design identique entre Dashboard et page Mouvements
2. **Maintenabilité**: Un seul endroit pour modifier le rendu des mouvements
3. **Réutilisabilité**: Le composant peut être utilisé ailleurs dans l'application
4. **Code Plus Propre**: Suppression de ~70 lignes de code dupliqué
5. **Flexibilité**: Modes compact/complet selon le contexte
6. **Responsive**: Adaptation automatique à tous les écrans

## 🚀 Utilisation Future

Pour afficher un tableau de mouvements ailleurs dans l'application:

```typescript
import { MovementTable } from "@/components/MovementTable";

// Version compacte sans actions
<MovementTable 
  movements={myMovements} 
  showActions={false} 
  compact={true} 
/>

// Version complète avec actions
<MovementTable 
  movements={myMovements}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onQualityControl={handleQC}
  showActions={true}
  compact={false}
/>
```

## 📊 Impact

- **Lignes de code supprimées**: ~70
- **Nouveaux fichiers**: 1 (`MovementTable.tsx`)
- **Fichiers modifiés**: 2 (`Dashboard.tsx`, `MouvementsPage.tsx`)
- **Bugs corrigés**: 0 (pas de régression)
- **Nouvelles fonctionnalités**: Tri automatique par date dans le Dashboard

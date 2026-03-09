# Styling Monochrome des Badges d'Unités

## Vue d'ensemble

Les badges d'unités dans la colonne "UNITÉS" du tableau des articles ont été mis à jour pour utiliser un style monochrome professionnel en gris neutre.

## Changements apportés

### Avant : Couleurs distinctes par type

```
Paire  → Badge bleu   (bg-blue-100, text-blue-700)
Unité  → Badge vert   (bg-green-100, text-green-700)
Boîte  → Badge orange (bg-orange-100, text-orange-700)
Autres → Badge gris   (bg-gray-100, text-gray-700)
```

### Après : Style monochrome uniforme

```
TOUTES les unités → Badge gris (bg-gray-100, text-gray-600, border-gray-200)
```

## Spécifications de couleur

### Couleurs Tailwind utilisées

```css
Background:  bg-gray-100   /* #F3F4F6 - Gris clair */
Text:        text-gray-600 /* #4B5563 - Gris foncé */
Border:      border-gray-200 /* #E5E7EB - Gris moyen */
```

### Couleurs hexadécimales

```
Background:  #F3F4F6
Text:        #4B5563
Border:      #E5E7EB
```

## Structure visuelle

### Layout de la colonne UNITÉS

```
┌─────────────────────────────────┐
│ Entrée: [B]                     │  ← Badge gris
│ Sortie: [P]                     │  ← Badge gris
│ 1:100                           │  ← Texte gris (text-gray-600)
└─────────────────────────────────┘
```

### Exemple visuel

```
┌──────────────────────────────────────────────────┐
│ UNITÉS                                           │
├──────────────────────────────────────────────────┤
│ Entrée: ┌───┐                                    │
│         │ B │  ← Fond gris clair, texte gris foncé│
│         └───┘                                    │
│ Sortie: ┌───┐                                    │
│         │ P │  ← Fond gris clair, texte gris foncé│
│         └───┘                                    │
│ 1:100        ← Texte gris foncé                  │
└──────────────────────────────────────────────────┘
```

## Modifications de code

### 1. UnitBadge.tsx

#### Avant
```typescript
const UNIT_CONFIG = {
  paire: {
    abbreviation: "P",
    fullName: "Paire",
    bgColor: "bg-blue-100",      // ❌ Couleur spécifique
    textColor: "text-blue-700",   // ❌ Couleur spécifique
    borderColor: "border-blue-200", // ❌ Couleur spécifique
  },
  // ... autres unités avec couleurs différentes
};

// Utilisation dynamique des couleurs
className={`... ${config.bgColor} ${config.textColor} ${config.borderColor}`}
```

#### Après
```typescript
const UNIT_CONFIG = {
  paire: {
    abbreviation: "P",
    fullName: "Paire",
    // ✅ Pas de couleurs spécifiques
  },
  // ... autres unités sans couleurs
};

// Couleurs grises uniformes pour tous
className="... bg-gray-100 text-gray-600 border-gray-200"
```

### 2. ArticlesPage.tsx

#### Ratio text color

Avant:
```typescript
<span className="text-[9px] text-info font-mono">
  1:{a.facteurConversion}
</span>
```

Après:
```typescript
<span className="text-[9px] text-gray-600 font-mono">
  1:{a.facteurConversion}
</span>
```

## Unités supportées

Le composant UnitBadge reconnaît maintenant les unités suivantes avec leurs abréviations :

```
┌──────────────┬──────────────┬─────────────────────┐
│ Unité        │ Abréviation  │ Nom complet         │
├──────────────┼──────────────┼─────────────────────┤
│ Paire        │ P            │ Paire               │
│ Unité        │ U            │ Unité               │
│ Boîte        │ B            │ Boîte               │
│ Kg           │ Kg           │ Kilogramme          │
│ Litre        │ L            │ Litre               │
│ Pièce        │ Pc           │ Pièce               │
│ Carton       │ C            │ Carton              │
│ Tonne        │ T            │ Tonne               │
│ Autres       │ 1ère lettre  │ Nom de l'unité      │
└──────────────┴──────────────┴─────────────────────┘
```

Toutes affichées avec le même style gris.

## Avantages du style monochrome

### 1. Professionnalisme
✅ Apparence sobre et professionnelle
✅ Cohérence visuelle dans toute l'interface
✅ Moins de distraction visuelle

### 2. Lisibilité
✅ Contraste optimal entre fond et texte
✅ Pas de confusion avec d'autres éléments colorés
✅ Focus sur les données importantes

### 3. Accessibilité
✅ Meilleur pour les utilisateurs daltoniens
✅ Contraste suffisant pour tous
✅ Pas de dépendance à la couleur pour l'information

### 4. Cohérence
✅ Toutes les unités traitées de la même manière
✅ Pas de hiérarchie visuelle artificielle
✅ Style uniforme dans tout le tableau

## Comparaison visuelle

### Avant (Couleurs distinctes)

```
┌─────────────────────────────────────────────────┐
│ Article 1                                       │
│ Entrée: [B] ← Orange                            │
│ Sortie: [P] ← Bleu                              │
│ 1:100       ← Bleu info                         │
├─────────────────────────────────────────────────┤
│ Article 2                                       │
│ Entrée: [C] ← Gris (par défaut)                │
│ Sortie: [U] ← Vert                              │
│ 1:1000      ← Bleu info                         │
└─────────────────────────────────────────────────┘
```

### Après (Monochrome)

```
┌─────────────────────────────────────────────────┐
│ Article 1                                       │
│ Entrée: [B] ← Gris                              │
│ Sortie: [P] ← Gris                              │
│ 1:100       ← Gris                              │
├─────────────────────────────────────────────────┤
│ Article 2                                       │
│ Entrée: [C] ← Gris                              │
│ Sortie: [U] ← Gris                              │
│ 1:1000      ← Gris                              │
└─────────────────────────────────────────────────┘
```

## Tooltip inchangé

Le tooltip (info-bulle) au survol reste inchangé :
- Fond : Noir (foreground)
- Texte : Blanc (background)
- Affiche le nom complet de l'unité

```
Survol de [B] → Affiche "Boîte"
Survol de [P] → Affiche "Paire"
Survol de [Kg] → Affiche "Kilogramme"
```

## Compatibilité

### Unités personnalisées

Les unités créées par l'utilisateur dans "Unités de Mesure" :
- Utilisent automatiquement le style gris
- Affichent la première lettre en majuscule comme abréviation
- Affichent le nom complet dans le tooltip

Exemple :
```
Unité personnalisée: "Palette"
Badge: [P] en gris
Tooltip: "Palette"
```

### Rétrocompatibilité

✅ Toutes les unités existantes fonctionnent
✅ Pas de migration nécessaire
✅ Changement purement visuel

## Fichiers modifiés

- ✅ `src/components/UnitBadge.tsx` - Style monochrome uniforme
- ✅ `src/pages/ArticlesPage.tsx` - Couleur du ratio en gris
- ✅ `UNIT_BADGE_MONOCHROME_STYLING.md` - Documentation (ce fichier)

## Tests visuels

### Checklist de vérification

- [ ] Tous les badges d'unités sont gris (pas de bleu, vert, orange)
- [ ] Le fond est gris clair (#F3F4F6)
- [ ] Le texte est gris foncé (#4B5563)
- [ ] La bordure est gris moyen (#E5E7EB)
- [ ] Le ratio (1:100) est en gris foncé
- [ ] Le tooltip fonctionne toujours au survol
- [ ] Le style est cohérent sur toutes les lignes
- [ ] Aucune couleur distinctive par type d'unité

## Exemples de rendu

### Article avec conversion

```
┌──────────────────────────────────────┐
│ Gants Nitrile M                      │
├──────────────────────────────────────┤
│ Entrée: [B]  ← bg-gray-100           │
│ Sortie: [P]  ← bg-gray-100           │
│ 1:100        ← text-gray-600         │
└──────────────────────────────────────┘
```

### Article sans conversion

```
┌──────────────────────────────────────┐
│ Gants XL                             │
├──────────────────────────────────────┤
│ Entrée: [P]  ← bg-gray-100           │
│ Sortie: [P]  ← bg-gray-100           │
│ (pas de ratio car facteur = 1)      │
└──────────────────────────────────────┘
```

### Article avec unités de poids

```
┌──────────────────────────────────────┐
│ Poudre de Nitrile                    │
├──────────────────────────────────────┤
│ Entrée: [T]  ← bg-gray-100           │
│ Sortie: [Kg] ← bg-gray-100           │
│ 1:1000       ← text-gray-600         │
└──────────────────────────────────────┘
```

## Notes de design

### Pourquoi le gris ?

1. **Neutralité** : Le gris ne véhicule pas de signification particulière
2. **Professionnalisme** : Aspect sobre et sérieux
3. **Lisibilité** : Bon contraste sans être agressif
4. **Cohérence** : S'intègre bien avec le reste de l'interface

### Nuances de gris choisies

- **gray-100** : Assez clair pour le fond, pas trop pâle
- **gray-600** : Assez foncé pour le texte, pas trop noir
- **gray-200** : Bordure subtile mais visible

### Alternatives considérées

❌ **Gris plus foncé (gray-200/gray-700)** : Trop contrasté
❌ **Gris plus clair (gray-50/gray-500)** : Pas assez de contraste
✅ **gray-100/gray-600** : Équilibre parfait

## Support

Pour toute question sur le style des badges :
1. Consulter cette documentation
2. Vérifier le code de UnitBadge.tsx
3. Tester visuellement dans le tableau des articles

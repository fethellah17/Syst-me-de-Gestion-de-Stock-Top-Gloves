# 🎨 Synthèse Visuelle : Consommation Journalière

## 📸 Aperçu de l'Interface

### Page Articles - Tableau Principal

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Articles                                                                          📦 6 articles         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  🔍 [Rechercher un article...]                                                                        │
│                                                                                                        │
├────┬──────────────┬──────────┬─────────┬───────┬────────────┬────────┬──────────────┬───────────────┤
│Réf │ Article      │Catégorie │Emplace. │ Stock │ Temps Rest.│ Statut │ Conso/Invent.│ Conso/Jour 🔥 │
├────┼──────────────┼──────────┼─────────┼───────┼────────────┼────────┼──────────────┼───────────────┤
│GN- │📦 Gants      │ Gants    │🗺️ Zone A│ 2,500 │ 🟢 50j     │ 🟢 OK  │ 🔻 -15       │ 🔥 100        │
│M-  │   Nitrile M  │ Nitrile  │   Rack12│       │            │        │              │               │
│001 │              │          │🗺️ Zone B│       │            │        │              │               │
│    │              │          │   Rack03│       │            │        │              │               │
├────┼──────────────┼──────────┼─────────┼───────┼────────────┼────────┼──────────────┼───────────────┤
│MK- │📦 Masques    │ Masques  │🗺️ Zone D│ 7,650 │ 🟡 38j     │ 🟡 ATT │ 🔻 -50       │ 🔥 600        │
│FFP2│   FFP2       │          │   Rack05│       │            │        │              │ ✨ ANIMÉ      │
│-006│              │          │🗺️ Zone E│       │            │        │              │               │
│    │              │          │   Quaran│       │            │        │              │               │
└────┴──────────────┴──────────┴─────────┴───────┴────────────┴────────┴──────────────┴───────────────┘
```

### Badge de Consommation - États

#### État Normal
```
┌─────────────────┐
│ 🔥 250          │  ← Badge orange clair
└─────────────────┘
```

#### État Animé (Après Validation)
```
┌─────────────────┐
│ 🔥 350          │  ← Badge orange vif + scale 110% + shadow
└─────────────────┘  ← Animation 600ms
     ✨✨✨
```

### Historique des Consommations

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 📅 Historique des Consommations Journalières                          (4 entrées)     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  Date              │ Référence    │ Article           │ 🔥 Total Consommé            │
│  ─────────────────────────────────────────────────────────────────────────────────    │
│  • Thu Feb 26 2026 │ MK-FFP2-006  │ Masques FFP2      │ 🔥 600  ← Badge orange       │
│  • Thu Feb 26 2026 │ GN-M-001     │ Gants Nitrile M   │ 🔥 100  ← Badge orange       │
│  ─────────────────────────────────────────────────────────────────────────────────    │
│    Wed Feb 25 2026 │ MK-FFP2-006  │ Masques FFP2      │ 450  ← Badge bleu            │
│    Wed Feb 25 2026 │ GL-S-002     │ Gants Latex S     │ 200  ← Badge bleu            │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
     ↑                                                        ↑
     Point orange = Aujourd'hui                              Fond orange clair
```

## 🎬 Animation de la Consommation

### Séquence d'Animation (600ms)

```
Temps 0ms (Avant Validation)
┌─────────────────┐
│ 🔥 250          │  ← État normal
└─────────────────┘

        ↓ Validation d'une sortie de 100

Temps 0-300ms (Transition)
┌─────────────────┐
│ 🔥 350          │  ← Scale 100% → 110%
└─────────────────┘  ← Opacity 0 → 1 sur shadow
     ✨✨✨

Temps 300-600ms (Peak)
┌─────────────────┐
│ 🔥 350          │  ← Scale 110% maintenu
└─────────────────┘  ← Shadow orange vif
     ✨✨✨
     
Temps 600ms+ (Retour)
┌─────────────────┐
│ 🔥 350          │  ← Scale 110% → 100%
└─────────────────┘  ← Shadow fade out
```

## 🎨 Palette de Couleurs

### Badge de Consommation

```css
/* État Normal */
background: #FED7AA      /* orange-100 */
color: #9A3412           /* orange-800 */
border: #FED7AA          /* orange-200 */

/* État Animé */
background: #FED7AA      /* orange-200 */
color: #7C2D12           /* orange-900 */
border: #FB923C          /* orange-400 */
shadow: #FB923C/50       /* orange-400 avec 50% opacité */
```

### Historique

```css
/* Ligne Aujourd'hui */
background: #FFF7ED/50   /* orange-50 avec 50% opacité */
badge: #FED7AA           /* orange-100 */

/* Ligne Passée */
background: transparent
badge: #DBEAFE           /* blue-100 */

/* Point Indicateur */
background: #F97316      /* orange-500 */
```

## 📊 Diagramme de Flux Visuel

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CRÉATION D'UNE SORTIE                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Page Mouvements                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Mouvement #7                                                  │ │
│  │ Type: Sortie | Article: Masques FFP2 | Qté: 100              │ │
│  │ Statut: ⏳ En attente de validation Qualité                  │ │
│  │ [Approuver] [Rejeter]                                         │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                        [Clic Approuver]
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Modal Contrôle Qualité                                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Contrôleur: Marie L.                                          │ │
│  │ État: ● Conforme ○ Non-conforme                               │ │
│  │ [Approuver]                                                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    [Clic Approuver Final]
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  DataContext.approveQualityControl()                                │
│  • Statut → "Terminé"                                               │
│  • Stock → 7650 (7750 - 100)                                        │
│  • mouvements state CHANGE                                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  ArticlesPage.useMemo détecte le changement                         │
│  • dailyConsumptionMap RECALCULÉ                                    │
│  • consumptionHistory RECALCULÉ                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  React Re-render                                                    │
│  • Nouvelle valeur: 600 (500 + 100)                                 │
│  • ConsumptionBadge.useEffect détecte le changement                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Animation Déclenchée                                               │
│  • isHighlighted = true                                             │
│  • Badge: orange vif + scale 110% + shadow                          │
│  • Flamme: pulse                                                    │
│  • Durée: 600ms                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Page Articles - Résultat Final                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ MK-FFP2-006 | Masques FFP2 | Stock: 7650 | 🔥 600 ✨         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  📅 Historique                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ • Thu Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 🔥 600      │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔍 Détails Techniques Visuels

### Structure du Badge

```
┌─────────────────────────────────────────────────────────────┐
│  <span className="inline-flex items-center gap-1 ...">     │
│    <Flame className="w-3.5 h-3.5" />                        │
│    {value}                                                   │
│  </span>                                                     │
└─────────────────────────────────────────────────────────────┘
     ↓                    ↓                ↓
  Container          Icône Flamme      Valeur
  (flex)             (3.5 × 3.5)       (nombre)
```

### Classes CSS Appliquées

```css
/* Container */
.inline-flex        /* Display flex inline */
.items-center       /* Alignement vertical centré */
.gap-1              /* Espacement 0.25rem entre icône et texte */
.px-3               /* Padding horizontal 0.75rem */
.py-1               /* Padding vertical 0.25rem */
.rounded-full       /* Bordures arrondies complètes */
.text-sm            /* Taille de texte 0.875rem */
.font-semibold      /* Poids de police 600 */
.border             /* Bordure 1px */
.transition-all     /* Transition sur toutes les propriétés */
.duration-300       /* Durée de transition 300ms */

/* État Normal */
.bg-orange-100      /* Fond orange clair */
.text-orange-800    /* Texte orange foncé */
.border-orange-200  /* Bordure orange */

/* État Animé */
.bg-orange-200      /* Fond orange plus vif */
.text-orange-900    /* Texte orange très foncé */
.border-orange-400  /* Bordure orange vif */
.shadow-lg          /* Ombre large */
.shadow-orange-400/50 /* Couleur d'ombre orange avec 50% opacité */
.scale-110          /* Agrandissement 110% */
```

### Tooltip

```
                    ┌─────────────────────────────────────────┐
                    │ Total des sorties validées aujourd'hui  │
                    └─────────────────────────────────────────┘
                                      ▼
                              ┌─────────────┐
                              │ 🔥 600      │
                              └─────────────┘
```

## 📱 Responsive Design

### Desktop (> 1024px)
```
┌────────────────────────────────────────────────────────────────────────┐
│ Réf │ Article │ Catégorie │ Emplacement │ Stock │ ... │ Conso/Jour 🔥 │
├─────┼─────────┼───────────┼─────────────┼───────┼─────┼───────────────┤
│ ... │   ...   │    ...    │     ...     │  ...  │ ... │   🔥 600      │
└────────────────────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────────────────────────────────────────┐
│ Réf │ Article │ Catégorie │ Stock │ ... │ Conso/Jour 🔥     │
├─────┼─────────┼───────────┼───────┼─────┼───────────────────┤
│ ... │   ...   │    ...    │  ...  │ ... │   🔥 600          │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────────────────────────────┐
│ Réf │ Article │ Stock │ Conso/Jour 🔥     │
├─────┼─────────┼───────┼───────────────────┤
│ ... │   ...   │  ...  │   🔥 600          │
└────────────────────────────────────────────┘
```

## 🎯 Points d'Attention Visuels

### ✅ Bon Exemple
```
┌─────────────────┐
│ 🔥 350          │  ← Espacement correct, icône visible
└─────────────────┘
```

### ❌ Mauvais Exemple
```
┌─────────────────┐
│🔥350             │  ← Pas d'espacement, difficile à lire
└─────────────────┘
```

### ✅ Animation Fluide
```
250 → 350
 ↓     ↓
[Transition smooth 300ms]
```

### ❌ Animation Brusque
```
250 → 350
 ↓     ↓
[Changement instantané, pas de transition]
```

## 🎨 Thème Sombre (Si Implémenté)

### Badge de Consommation
```css
/* État Normal */
background: #7C2D12      /* orange-900 */
color: #FED7AA           /* orange-100 */
border: #9A3412          /* orange-800 */

/* État Animé */
background: #9A3412      /* orange-800 */
color: #FFEDD5           /* orange-50 */
border: #FB923C          /* orange-400 */
shadow: #FB923C/30       /* orange-400 avec 30% opacité */
```

## 📐 Dimensions et Espacements

```
Badge de Consommation:
├─ Hauteur: auto (py-1 = 0.25rem × 2 + line-height)
├─ Largeur: auto (dépend du contenu)
├─ Padding horizontal: 0.75rem (px-3)
├─ Padding vertical: 0.25rem (py-1)
├─ Gap icône-texte: 0.25rem (gap-1)
├─ Taille icône: 14px × 14px (w-3.5 h-3.5)
└─ Taille texte: 0.875rem (text-sm)

Historique:
├─ Largeur: 100% (w-full)
├─ Padding cellule: 0.75rem (py-3 px-4)
├─ Hauteur ligne: auto
└─ Espacement entre lignes: 1px (border-b)
```

## 🎭 États Interactifs

### Badge de Consommation
```
État Normal:
  ┌─────────────────┐
  │ 🔥 250          │
  └─────────────────┘

Hover (avec Tooltip):
  ┌─────────────────────────────────────┐
  │ Total des sorties validées aujourd'hui │
  └─────────────────────────────────────┘
           ▼
  ┌─────────────────┐
  │ 🔥 250          │  ← Cursor: help
  └─────────────────┘

Animé (Après Validation):
  ┌─────────────────┐
  │ 🔥 350          │  ← Scale 110% + Shadow
  └─────────────────┘
       ✨✨✨
```

### Ligne d'Historique
```
État Normal:
  │ Thu Feb 26 2026 │ MK-FFP2-006 │ Masques FFP2 │ 🔥 600 │

Hover:
  │ Thu Feb 26 2026 │ MK-FFP2-006 │ Masques FFP2 │ 🔥 600 │
  └────────────────────────────────────────────────────────┘
  ↑ Fond légèrement plus foncé (hover:bg-orange-100/50)
```

## 🔄 Cycle de Vie de l'Animation

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Détection du Changement (useEffect)                     │
│    • value !== previousValue                                │
│    • setIsHighlighted(true)                                 │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Application des Classes CSS                              │
│    • bg-orange-200 (au lieu de bg-orange-100)               │
│    • scale-110 (au lieu de scale-100)                       │
│    • shadow-lg shadow-orange-400/50                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Transition CSS (300ms)                                   │
│    • transition-all duration-300                            │
│    • Smooth interpolation des propriétés                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Maintien de l'État (300ms)                               │
│    • Badge reste agrandi et surligné                        │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Retour à l'État Normal (setTimeout 600ms)                │
│    • setIsHighlighted(false)                                │
│    • Transition inverse (300ms)                             │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Comparaison Avant/Après

### AVANT (Statique)
```
┌────────────────────────────────────────────────────────────┐
│ Consommation / Jour: 50 (valeur fixe dans le state)       │
│ ❌ Pas de calcul dynamique                                 │
│ ❌ Pas de réinitialisation automatique                     │
│ ❌ Pas d'historique                                        │
└────────────────────────────────────────────────────────────┘
```

### APRÈS (Dynamique)
```
┌────────────────────────────────────────────────────────────┐
│ Consommation / Jour: 🔥 600 (calculé en temps réel)       │
│ ✅ Calcul dynamique avec useMemo                           │
│ ✅ Réinitialisation automatique à minuit                   │
│ ✅ Historique complet avec regroupement                    │
│ ✅ Animation visuelle lors des changements                 │
└────────────────────────────────────────────────────────────┘
```

---

**🎨 Design System Cohérent | 🚀 Performance Optimisée | ✨ UX Fluide**

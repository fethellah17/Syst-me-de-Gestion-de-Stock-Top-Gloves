# Points Clés - Refactorisation des Mouvements

## 🎯 Les 3 Changements Majeurs

### 1️⃣ Suppression du Champ "Emplacement" des Articles
```typescript
// ❌ Avant
const article = {
  nom: "Gants Nitrile M",
  emplacement: "Zone A-12"  // Fixe
};

// ✅ Après
const article = {
  nom: "Gants Nitrile M"
  // Emplacement déterminé par le dernier mouvement
};

// Récupérer l'emplacement
const location = getArticleCurrentLocation("GN-M-001");
```

### 2️⃣ Trois Types de Mouvements

| Type | Stock | Occupation | Icône |
|------|-------|-----------|-------|
| **Entrée** | +Qte | +Qte | 🔽 |
| **Sortie** | -Qte | -Qte | 🔼 |
| **Transfert** | Inchangé | Source -Qte, Dest +Qte | ⇄ |

### 3️⃣ Localisation Dynamique

```
Article → Dernier Mouvement → Emplacement Actuel

Gants Nitrile M
  ↓
Entrée en Zone A-12 (2026-02-24 10:00)
  ↓
Emplacement = Zone A-12

Gants Nitrile M
  ↓
Transfert vers Zone B-03 (2026-02-24 12:00)
  ↓
Emplacement = Zone B-03
```

## 🔄 Workflow Typique

### Jour 1 : Réception
```
Créer Entrée
├─ Article: Gants Nitrile M
├─ Destination: Zone A-12
├─ Quantité: 1000
└─ Résultat: Stock = 1000, Localisation = Zone A-12
```

### Jour 2 : Réorganisation
```
Créer Transfert
├─ Article: Gants Nitrile M
├─ Source: Zone A-12
├─ Destination: Zone B-03
├─ Quantité: 600
└─ Résultat: Stock = 1000 (inchangé), Localisation = Zone B-03
```

### Jour 3 : Consommation
```
Créer Sortie
├─ Article: Gants Nitrile M
├─ Source: Zone B-03 (automatique)
├─ Destination: Département Production
├─ Quantité: 300
└─ Résultat: Stock = 700, Localisation = Zone B-03
```

## ⚠️ Points Importants à Retenir

### 1. Emplacement des Articles
- ❌ **Pas** un champ fixe de l'article
- ✅ **Déterminé** par le dernier mouvement
- ✅ **Dynamique** et **traçable**

### 2. Transfert ≠ Changement de Stock
- ❌ Un transfert **ne change pas** le stock total
- ✅ Un transfert **change** l'occupation des emplacements
- ✅ Un transfert **déplace** l'article

### 3. Emplacement Source Automatique
- ✅ Pour les **Sorties**, l'emplacement source s'affiche automatiquement
- ✅ Basé sur le **dernier mouvement** de l'article
- ❌ **Pas modifiable** (pour garantir la traçabilité)

### 4. Validation des Transferts
- ❌ Impossible de transférer **plus** que disponible
- ❌ Impossible d'avoir **source = destination**
- ✅ Validation **en temps réel**

## 📊 Logique de Gestion des Stocks

### Entrée
```
Stock Avant: 2000
Mouvement: Entrée de 500
Stock Après: 2500 ✅
```

### Sortie
```
Stock Avant: 2500
Mouvement: Sortie de 300
Stock Après: 2200 ✅
```

### Transfert
```
Stock Avant: 2200
Mouvement: Transfert de 400
Stock Après: 2200 ✅ (inchangé)
Zone A: 2200 → 1800 (perte)
Zone B: 0 → 400 (gain)
```

## 🎨 Icônes et Couleurs

### Types de Mouvements
- 🔽 **Entrée** : Flèche vers le bas (vert)
- 🔼 **Sortie** : Flèche vers le haut (orange)
- ⇄ **Transfert** : Flèches opposées (bleu)

### Occupation des Emplacements
- 🟢 **Vert** : < 70% (bon)
- 🟡 **Orange** : 70-90% (attention)
- 🔴 **Rouge** : > 90% (critique)

## 🔍 Traçabilité Complète

### Historique des Mouvements
```
2026-02-24 10:00 | Entrée | Gants Nitrile M | 1000 | Zone A-12 | Karim B.
2026-02-24 12:00 | Transfert | Gants Nitrile M | 600 | Zone A-12 → Zone B-03 | Ahmed K.
2026-02-24 14:00 | Sortie | Gants Nitrile M | 300 | Zone B-03 → Production | Sara M.
```

### Localisation Actuelle
```
Gants Nitrile M
├─ Dernier mouvement: Sortie (2026-02-24 14:00)
├─ Emplacement source: Zone B-03
└─ Localisation actuelle: Zone B-03 (300 unités)
```

## 💡 Conseils d'Utilisation

### ✅ À Faire
1. **Enregistrer tous les mouvements** - C'est la source de vérité
2. **Utiliser le bon type** - Entrée/Sortie/Transfert selon le contexte
3. **Vérifier l'emplacement source** - Il s'affiche automatiquement
4. **Consulter l'historique** - Pour tracer l'origine d'un article
5. **Valider les quantités** - Avant de créer un mouvement

### ❌ À Éviter
1. **Modifier l'emplacement source** - Il est automatique pour les sorties
2. **Transférer plus que disponible** - Validation en place
3. **Créer des transferts inutiles** - Ils compliquent l'historique
4. **Oublier d'enregistrer les mouvements** - Perte de traçabilité
5. **Confondre transfert et sortie** - Effets différents sur le stock

## 🚀 Cas d'Usage Courants

### Cas 1 : Réception de Fournisseur
```
Créer Entrée
├─ Article: Gants Nitrile M
├─ Destination: Zone A-12 (réception)
└─ Quantité: 500
```

### Cas 2 : Réorganisation du Stock
```
Créer Transfert
├─ Article: Gants Nitrile M
├─ Source: Zone A-12
├─ Destination: Zone B-03 (meilleure localisation)
└─ Quantité: 300
```

### Cas 3 : Consommation Production
```
Créer Sortie
├─ Article: Gants Nitrile M
├─ Source: Zone B-03 (automatique)
├─ Destination: Département Production
└─ Quantité: 200
```

### Cas 4 : Retour Fournisseur
```
Créer Sortie
├─ Article: Gants Nitrile M
├─ Source: Zone B-03 (automatique)
├─ Destination: Retour Fournisseur
└─ Quantité: 100
```

## 📈 Métriques Clés

### Stock
- **Stock Total** : Somme de tous les articles
- **Stock par Emplacement** : Somme des articles dans cet emplacement
- **Stock par Article** : Quantité totale de cet article

### Occupation
- **Occupation** : Quantité occupée / Capacité
- **Pourcentage** : (Occupation / Capacité) × 100
- **Alerte** : Si > 90%

### Mouvements
- **Entrées du Jour** : Nombre de mouvements d'entrée
- **Sorties du Jour** : Nombre de mouvements de sortie
- **Transferts du Jour** : Nombre de mouvements de transfert

## 🔐 Validations Implémentées

### Entrée
- ✅ Article sélectionné
- ✅ Emplacement de destination sélectionné
- ✅ Quantité > 0
- ✅ Opérateur renseigné

### Sortie
- ✅ Article sélectionné
- ✅ Emplacement source affiché (automatique)
- ✅ Destination sélectionnée
- ✅ Quantité > 0
- ✅ Opérateur renseigné

### Transfert
- ✅ Article sélectionné
- ✅ Emplacement source sélectionné
- ✅ Emplacement destination sélectionné
- ✅ Source ≠ Destination
- ✅ Quantité ≤ Stock disponible
- ✅ Quantité > 0
- ✅ Opérateur renseigné

## 🎓 Résumé en 30 Secondes

**Avant :** L'emplacement était un champ fixe de l'article.
**Après :** L'emplacement est déterminé par le dernier mouvement.

**Avant :** 2 types de mouvements (Entrée, Sortie).
**Après :** 3 types de mouvements (Entrée, Sortie, Transfert).

**Avant :** Pas de transferts internes.
**Après :** Transferts internes avec validation complète.

**Résultat :** Localisation dynamique, traçable et intègre.

---

**Pour plus d'informations**, consulter :
- **GUIDE_MOUVEMENTS_REFACTORISES.md** - Guide complet
- **GUIDE_TEST_MOUVEMENTS.md** - Scénarios de test
- **REFACTORING_MOUVEMENTS.md** - Vue d'ensemble technique

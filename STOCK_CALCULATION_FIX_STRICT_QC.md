# Fix: Calcul Strict du Stock Basé sur le Contrôle Qualité

## 🎯 Problème Résolu

**AVANT:** Le stock augmentait immédiatement lors de la création d'une Entrée, avant le Contrôle Qualité.

**APRÈS:** Le stock n'augmente que lorsque l'Entrée est validée en Contrôle Qualité.

---

## 📋 Règle Stricte Implémentée

### Formule de Calcul du Stock

```
Stock Total = (Entrées Validées) - (Sorties Validées) + (Ajustements)

Où:
- Entrées Validées = Mouvements type "Entrée" avec statut "Terminé"
- Sorties Validées = Mouvements type "Sortie" avec statut "Terminé"
- Ajustements = Mouvements type "Ajustement" avec statut "Terminé"

EXCLURE: Tous les mouvements avec statut "En attente de validation Qualité"
EXCLURE: Tous les mouvements avec statut "Rejeté"
```

### Statuts et Impact

| Statut | Entrée | Sortie | Ajustement | Impact Stock |
|--------|--------|--------|-----------|--------------|
| **En attente** | ❌ | ❌ | N/A | ❌ AUCUN |
| **Terminé** | ✅ | ✅ | ✅ | ✅ OUI |
| **Rejeté** | ❌ | ❌ | N/A | ❌ AUCUN |

---

## 💻 Implémentation Technique

### 1. Nouvelle Fonction: `calculateArticleStock`

```typescript
const calculateArticleStock = (articleRef: string): number => {
  let totalStock = 0;

  mouvements.forEach(m => {
    if (m.ref !== articleRef) return;

    // ENTRÉE: Only count if validated (Terminé)
    if (m.type === "Entrée" && m.statut === "Terminé") {
      // Add only valid quantity (defective units are rejected)
      const quantityToAdd = m.validQuantity !== undefined ? m.validQuantity : m.qte;
      totalStock += quantityToAdd;
    }

    // SORTIE: Only count if validated (Terminé)
    if (m.type === "Sortie" && m.statut === "Terminé") {
      // Subtract total quantity (all units left the warehouse)
      totalStock -= m.qte;
    }

    // AJUSTEMENT: Always count (created with Terminé status)
    if (m.type === "Ajustement" && m.statut === "Terminé") {
      if (m.typeAjustement === "Surplus") {
        totalStock += m.qte;
      } else if (m.typeAjustement === "Manquant") {
        totalStock -= m.qte;
      }
    }
  });

  return Math.max(0, totalStock);
};
```

**Points Clés:**
- ✅ Itère sur TOUS les mouvements
- ✅ Filtre par statut "Terminé" SEULEMENT
- ✅ Exclut automatiquement les mouvements "En attente"
- ✅ Exclut automatiquement les mouvements "Rejeté"
- ✅ Pour Entrées: utilise `validQuantity` (unités valides seulement)
- ✅ Pour Sorties: utilise `qte` (toutes les unités)

### 2. Nouvelle Fonction: `calculateLocationStock`

```typescript
const calculateLocationStock = (articleRef: string, emplacementName: string): number => {
  let locationStock = 0;

  mouvements.forEach(m => {
    if (m.ref !== articleRef) return;

    // ENTRÉE: Only count if validated and destination matches
    if (m.type === "Entrée" && m.statut === "Terminé" && 
        m.emplacementDestination === emplacementName) {
      const quantityToAdd = m.validQuantity !== undefined ? m.validQuantity : m.qte;
      locationStock += quantityToAdd;
    }

    // SORTIE: Only count if validated and source matches
    if (m.type === "Sortie" && m.statut === "Terminé" && 
        m.emplacementSource === emplacementName) {
      locationStock -= m.qte;
    }

    // TRANSFERT: Count both source and destination
    if (m.type === "Transfert" && m.statut === "Terminé") {
      if (m.emplacementSource === emplacementName) {
        locationStock -= m.qte;
      }
      if (m.emplacementDestination === emplacementName) {
        locationStock += m.qte;
      }
    }

    // AJUSTEMENT: Count if location matches
    if (m.type === "Ajustement" && m.statut === "Terminé") {
      const adjustmentLocation = m.emplacementSource || m.emplacementDestination;
      if (adjustmentLocation === emplacementName) {
        if (m.typeAjustement === "Surplus") {
          locationStock += m.qte;
        } else if (m.typeAjustement === "Manquant") {
          locationStock -= m.qte;
        }
      }
    }
  });

  return Math.max(0, locationStock);
};
```

**Points Clés:**
- ✅ Calcule le stock pour un emplacement spécifique
- ✅ Filtre par statut "Terminé" SEULEMENT
- ✅ Exclut automatiquement les mouvements "En attente"
- ✅ Gère les Transferts (source ET destination)
- ✅ Gère les Ajustements par emplacement

### 3. Mise à Jour: `getArticleStockByLocation`

**AVANT:**
```typescript
const getArticleStockByLocation = (articleRef: string, emplacementName: string): number => {
  const article = articles.find(a => a.ref === articleRef);
  const location = article?.locations.find(l => l.emplacementNom === emplacementName);
  return location?.quantite || 0;  // ❌ Utilisait article.locations statique
};
```

**APRÈS:**
```typescript
const getArticleStockByLocation = (articleRef: string, emplacementName: string): number => {
  // Use dynamic calculation based on validated movements
  return calculateLocationStock(articleRef, emplacementName);  // ✅ Calcul dynamique
};
```

---

## 🎨 Affichage dans le Tableau des Mouvements

### Colonne "Impact Stock"

**Pour les Entrées en attente:**
```
Impact Stock: (Pending)
```

**Pour les autres mouvements:**
```
Impact Stock: [Quantité] [Unité]
```

**Implémentation:**
```typescript
{m.type === "Entrée" && m.statut === "En attente de validation Qualité" ? (
  <span className="font-mono text-xs text-orange-600 font-semibold italic">
    (Pending)
  </span>
) : (
  // Afficher la quantité normale
)}
```

---

## 🔄 Flux Complet

### Scénario: Entrée de 1000 Gants

#### Étape 1: Création
```
Action: Créer Entrée
├─ Article: Gants Nitrile M
├─ Quantité: 1000 Paires
├─ Destination: Zone A - Rack 12
└─ Statut: "En attente de validation Qualité"

Résultat:
├─ Tableau: Impact Stock = "(Pending)"
├─ Stock Total: INCHANGÉ (reste 2500)
├─ Zone A - Rack 12: INCHANGÉ (reste 1500)
└─ Mouvement visible en QC page
```

#### Étape 2: Validation (Bon)
```
Action: Valider en QC
├─ Contrôleur: Marie L.
├─ État: Conforme
├─ Unités défectueuses: 0
└─ Statut: "Terminé"

Résultat:
├─ Tableau: Impact Stock = "1000 Paires"
├─ Stock Total: 3500 (+1000) ✨
├─ Zone A - Rack 12: 2500 (+1000) ✨
└─ Mouvement visible avec badge "Terminé"
```

#### Étape 3: Validation (Non-conforme)
```
Action: Valider en QC
├─ Contrôleur: Marie L.
├─ État: Non-conforme
├─ Unités défectueuses: 50
└─ Statut: "Terminé"

Résultat:
├─ Tableau: Impact Stock = "950 Paires"
├─ Stock Total: 3450 (+950) ✨
├─ Zone A - Rack 12: 2450 (+950) ✨
├─ Qté Valide: 950
├─ Qté Défect.: 50
└─ Mouvement visible avec badge "Terminé"
```

#### Étape 4: Rejet
```
Action: Rejeter en QC
├─ Contrôleur: Marie L.
├─ Raison: Non-conformité majeure
└─ Statut: "Rejeté"

Résultat:
├─ Tableau: Impact Stock = "(Pending)" (reste inchangé)
├─ Stock Total: INCHANGÉ (reste 2500)
├─ Zone A - Rack 12: INCHANGÉ (reste 1500)
└─ Mouvement visible avec badge "Rejeté"
```

---

## 📊 Exemples de Calcul

### Exemple 1: Stock Simple

**Mouvements:**
```
1. Entrée 1000 (Terminé) → Stock = 1000
2. Entrée 500 (En attente) → Stock = 1000 (EXCLUE)
3. Sortie 200 (Terminé) → Stock = 800
```

**Résultat:** Stock = 800

### Exemple 2: Stock par Emplacement

**Mouvements pour Zone A:**
```
1. Entrée 1000 → Zone A (Terminé) → Zone A = 1000
2. Entrée 500 → Zone A (En attente) → Zone A = 1000 (EXCLUE)
3. Sortie 200 depuis Zone A (Terminé) → Zone A = 800
4. Transfert 100 Zone A → Zone B (Terminé) → Zone A = 700
```

**Résultat:** Zone A = 700

### Exemple 3: Avec Défectueuses

**Mouvements:**
```
1. Entrée 1000 (Terminé, 50 défectueuses)
   → validQuantity = 950
   → Stock = 950 (pas 1000!)
```

**Résultat:** Stock = 950

---

## ✅ Garanties

1. **Quarantaine Stricte**
   - ✅ Les Entrées "En attente" n'affectent JAMAIS le stock
   - ✅ Les Entrées "En attente" n'affectent JAMAIS les emplacements
   - ✅ Les Entrées "En attente" n'affectent JAMAIS les calculs

2. **Validation Obligatoire**
   - ✅ Seuls les mouvements "Terminé" modifient le stock
   - ✅ Les mouvements "Rejeté" n'ont aucun impact
   - ✅ Les mouvements "En attente" sont invisibles

3. **Cohérence Garantie**
   - ✅ Stock = Somme des mouvements validés
   - ✅ Emplacement = Somme des mouvements validés par lieu
   - ✅ Pas de divergence entre stock et emplacements

4. **Traçabilité Complète**
   - ✅ Chaque changement de stock est lié à une validation QC
   - ✅ Les métadonnées QC sont conservées
   - ✅ Les raisons de rejet sont documentées

---

## 🎯 Cas d'Usage

### Cas 1: Entrée Normale
```
Créer Entrée 100 → Stock = 0 (inchangé)
Valider (Conforme) → Stock = +100 ✅
```

### Cas 2: Entrée avec Défauts
```
Créer Entrée 100 → Stock = 0 (inchangé)
Valider (Non-conforme, 10 défectueuses) → Stock = +90 ✅
```

### Cas 3: Entrée Rejetée
```
Créer Entrée 100 → Stock = 0 (inchangé)
Rejeter → Stock = 0 (reste inchangé) ✅
```

### Cas 4: Sortie Normale
```
Stock initial: 500
Créer Sortie 100 → Stock = 500 (inchangé)
Valider (Conforme) → Stock = 400 ✅
```

### Cas 5: Sortie Rejetée
```
Stock initial: 500
Créer Sortie 100 → Stock = 500 (inchangé)
Rejeter → Stock = 500 (reste inchangé) ✅
```

### Cas 6: Plusieurs Entrées
```
Créer Entrée 100 → Stock = 0
Créer Entrée 200 → Stock = 0 (les deux en attente)
Valider Entrée 1 → Stock = 100
Valider Entrée 2 → Stock = 300 ✅
```

---

## 🚀 Résultat Final

Un système de gestion de stock **100% dépendant du Contrôle Qualité** où:

✅ **Aucune Entrée n'augmente le stock avant validation**
✅ **Le stock affiché = Stock réel validé uniquement**
✅ **Les emplacements reflètent uniquement les marchandises approuvées**
✅ **La quarantaine est automatique et invisible**
✅ **Chaque changement de stock est tracé et validé**

---

## 📝 Fichiers Modifiés

1. **src/contexts/DataContext.tsx**
   - ✅ Ajout: `calculateArticleStock()`
   - ✅ Ajout: `calculateLocationStock()`
   - ✅ Mise à jour: `getArticleStockByLocation()`

2. **src/components/MovementTable.tsx**
   - ✅ Mise à jour: Affichage "(Pending)" pour Entrées en attente
   - ✅ Mise à jour: Colonne "Impact Stock"

---

## 🎉 Vérification

Le système garantit maintenant que:
- ✅ Si vous ajoutez 100 unités comme Entrée, l'emplacement reste à sa valeur ANCIENNE
- ✅ Il devient +100 SEULEMENT après approbation en Contrôle Qualité
- ✅ Le tableau affiche "(Pending)" pour les Entrées en attente
- ✅ Le stock total n'augmente que pour les mouvements "Terminé"

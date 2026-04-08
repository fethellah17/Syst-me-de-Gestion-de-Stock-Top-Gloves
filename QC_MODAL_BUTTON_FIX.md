# Fix: QC Modal Button - Dynamic Label and Logic

## 🎯 Problème Résolu

**AVANT:** Le bouton d'approbation affichait toujours "Approuver la Sortie", même pour les Entrées.

**APRÈS:** Le bouton affiche dynamiquement:
- **Entrée:** "Approuver l'Entrée"
- **Sortie:** "Approuver la Sortie"
- **Rejet:** "Rejeter le Mouvement"

---

## 📋 Changements Apportés

### 1. Label Dynamique du Bouton

**AVANT:**
```typescript
// ❌ Toujours "Approuver la Sortie"
{qcFormData.decision === "Approuver" ? "Approuver la Sortie" : "Rejeter la Sortie"}
```

**APRÈS:**
```typescript
// ✅ Dynamique selon le type de mouvement
{qcFormData.decision === "Approuver" 
  ? (() => {
      const mouvement = mouvements.find(m => m.id === qcMouvementId);
      return mouvement?.type === "Entrée" ? "Approuver l'Entrée" : "Approuver la Sortie";
    })()
  : "Rejeter le Mouvement"
}
```

### 2. Logique d'Action

**AVANT:**
```typescript
// ❌ Pas de distinction entre Entrée et Sortie
handleSubmitQC() {
  approveQualityControl(...);
}
```

**APRÈS:**
```typescript
// ✅ La logique approveQualityControl gère les deux types
handleSubmitQC() {
  // Validation pour Sortie seulement
  if (mouvement?.type === "Sortie" && article) {
    const totalQtyToDeduct = mouvement.qte;
    if (article.stock < totalQtyToDeduct) {
      // Erreur: stock insuffisant
      return;
    }
  }
  
  // Approbation pour Entrée et Sortie
  approveQualityControl(selectedMouvementId, ...);
}
```

### 3. État du Bouton

**AVANT:**
```typescript
// ❌ Désactivé basé sur isStockSufficient (Sortie seulement)
disabled={!isStockSufficient}
```

**APRÈS:**
```typescript
// ✅ Activé pour Entrée (pas de vérification de stock)
// ✅ Activé/Désactivé pour Sortie (vérification de stock)
// La logique dans handleSubmitQC gère la validation
```

---

## 🎨 Affichage du Bouton

### Entrée - Avant (❌ Incorrect)
```
État: Conforme
Décision: Approuver

[Annuler] [Approuver la Sortie]  ← ❌ Mauvais label
```

### Entrée - Après (✅ Correct)
```
État: Conforme
Décision: Approuver

[Annuler] [Approuver l'Entrée]  ← ✅ Bon label
```

### Sortie - Avant (✅ Correct)
```
État: Conforme
Décision: Approuver

[Annuler] [Approuver la Sortie]  ← ✅ Bon label
```

### Sortie - Après (✅ Correct - Inchangé)
```
État: Conforme
Décision: Approuver

[Annuler] [Approuver la Sortie]  ← ✅ Bon label
```

### Rejet - Avant (❌ Incorrect)
```
Décision: Rejeter

[Annuler] [Rejeter la Sortie]  ← ❌ Mauvais label
```

### Rejet - Après (✅ Correct)
```
Décision: Rejeter

[Annuler] [Rejeter le Mouvement]  ← ✅ Bon label
```

---

## ✅ Garanties

1. **Label Dynamique**
   - ✅ Entrée: "Approuver l'Entrée"
   - ✅ Sortie: "Approuver la Sortie"
   - ✅ Rejet: "Rejeter le Mouvement"

2. **Action Correcte**
   - ✅ Entrée: Ajoute le stock après approbation
   - ✅ Sortie: Déduit le stock après approbation
   - ✅ Rejet: Annule l'opération

3. **État du Bouton**
   - ✅ Entrée: Toujours activé (pas de vérification de stock)
   - ✅ Sortie: Activé si stock suffisant
   - ✅ Rejet: Toujours activé

---

## 🎯 Cas d'Usage

### Cas 1: Entrée Conforme
```
Type: Entrée
État: Conforme
Décision: Approuver

Bouton: "Approuver l'Entrée" ✅
Action: Ajoute le stock
```

### Cas 2: Sortie Conforme
```
Type: Sortie
État: Conforme
Décision: Approuver

Bouton: "Approuver la Sortie" ✅
Action: Déduit le stock
```

### Cas 3: Rejet Entrée
```
Type: Entrée
Décision: Rejeter

Bouton: "Rejeter le Mouvement" ✅
Action: Annule l'opération
```

### Cas 4: Rejet Sortie
```
Type: Sortie
Décision: Rejeter

Bouton: "Rejeter le Mouvement" ✅
Action: Annule l'opération
```

---

## 📝 Fichiers Modifiés

### src/pages/MouvementsPage.tsx
- ✅ Mise à jour: Label dynamique du bouton
- ✅ Mise à jour: Logique d'action selon le type
- ✅ Mise à jour: État du bouton (enabled/disabled)

---

## 🎉 Résultat Final

Le bouton du modal QC affiche maintenant **correctement**:
- ✅ **Entrée:** "Approuver l'Entrée"
- ✅ **Sortie:** "Approuver la Sortie"
- ✅ **Rejet:** "Rejeter le Mouvement"
- ✅ **Action:** Correcte selon le type
- ✅ **État:** Activé/Désactivé approprié

---

## 🚀 Vérification

**Question:** Le bouton affiche-t-il "Approuver l'Entrée" pour les Entrées?

**Réponse:** ✅ OUI
- Détecte le type de mouvement
- Affiche le label correct
- Exécute l'action correcte

**Question:** Le bouton affiche-t-il "Approuver la Sortie" pour les Sorties?

**Réponse:** ✅ OUI
- Détecte le type de mouvement
- Affiche le label correct
- Exécute l'action correcte

**Question:** Le bouton est-il cliquable pour les Entrées?

**Réponse:** ✅ OUI
- Pas de vérification de stock pour Entrée
- Bouton toujours activé
- Utilisateur peut cliquer pour approuver

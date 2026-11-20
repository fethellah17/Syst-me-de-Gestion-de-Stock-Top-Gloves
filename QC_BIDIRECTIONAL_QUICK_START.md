# Guide Rapide - Contrôle Qualité Bi-directionnel

## 🎯 Résumé en 30 secondes

**Toutes les Entrées et Sorties passent maintenant par le Contrôle Qualité avant d'impacter le stock.**

---

## 📥 ENTRÉES (Réceptions)

### Étape 1: Créer l'Entrée
```
Mouvements → Nouveau Mouvement → Type: Entrée
→ Statut: "En attente" (Quarantaine virtuelle)
→ Stock NON modifié
```

### Étape 2: Valider l'Entrée
```
Contrôle Qualité → Onglet "Contrôles à l'Entrée"
→ Cliquer "Valider"
→ Choisir: Conforme OU Non-conforme
→ Si Non-conforme: Saisir unités défectueuses
→ Nom du contrôleur
→ Approuver
```

### Résultat
- ✅ **Unités valides** → Ajoutées au stock
- ❌ **Unités défectueuses** → Rejetées (perte)
- 📊 **Statut** → "Terminé"

---

## 📤 SORTIES (Expéditions)

### Étape 1: Créer la Sortie
```
Mouvements → Nouveau Mouvement → Type: Sortie
→ Statut: "En attente"
→ Stock NON modifié (marchandise encore en entrepôt)
```

### Étape 2: Valider la Sortie
```
Contrôle Qualité → Onglet "Contrôles à la Sortie"
→ Cliquer "Valider"
→ Choisir: Conforme OU Non-conforme
→ Si Non-conforme: Saisir unités défectueuses
→ Nom du contrôleur
→ Approuver
```

### Résultat
- ⚠️ **TOUTES les unités** (valides + défectueuses) → Déduites du stock
- 📊 **Statut** → "Terminé"
- 📄 **PDF** → Bon de Sortie généré

---

## 🔴 REJET (Entrée ou Sortie)

### Action
```
Contrôle Qualité → Cliquer "Rejeter"
→ Nom du contrôleur
→ Raison du rejet
→ Confirmer
```

### Résultat
- 🚫 **Stock** → NON modifié
- 📊 **Statut** → "Rejeté"
- 📄 **PDF** → Rapport de rejet généré

---

## 📊 Tableau des Mouvements

### Colonnes Importantes

| Colonne | Description |
|---------|-------------|
| **Statut** | 🟠 En attente / ✅ Terminé / ❌ Rejeté |
| **Qté Valide** | Unités approuvées (vert) |
| **Qté Défect.** | Unités défectueuses (rouge) |
| **Approuvé par** | Nom du contrôleur ou "En attente" |

### Actions Disponibles

| Icône | Action | Quand |
|-------|--------|-------|
| 🛡️ Shield | Contrôle Qualité | Statut "En attente" |
| 📄 FileText | Télécharger PDF | Statut "Terminé" ou "Rejeté" |

---

## 💡 Points Clés

### ENTRÉES
- 🔒 **Quarantaine** : Stock non modifié jusqu'à validation
- ✅ **Validation** : Seules les unités valides ajoutées
- ❌ **Défectueuses** : Rejetées (perte permanente)

### SORTIES
- 🔒 **Attente** : Stock non modifié jusqu'à validation
- ⚠️ **Validation** : TOUTES les unités déduites (valides + défectueuses)
- 💡 **Raison** : Elles ont physiquement quitté l'entrepôt

### REJET
- 🚫 **Entrée rejetée** : Marchandise n'entre jamais dans le stock
- 🚫 **Sortie rejetée** : Marchandise reste dans le stock
- 📄 **Documentation** : PDF de rejet généré automatiquement

---

## 🎨 Codes Couleur

| Couleur | Signification |
|---------|---------------|
| 🟢 Vert | Entrée, Terminé, Valide |
| 🟡 Jaune | Sortie |
| 🟠 Orange | En attente de validation |
| 🔴 Rouge | Rejeté, Défectueux |
| 🔵 Bleu | Transfert, Système |

---

## ✅ Checklist Rapide

### Pour valider une Entrée:
- [ ] Vérifier l'article et la quantité
- [ ] Inspecter la marchandise physiquement
- [ ] Déterminer l'état (Conforme/Non-conforme)
- [ ] Compter les unités défectueuses si nécessaire
- [ ] Saisir votre nom comme contrôleur
- [ ] Approuver → Stock mis à jour

### Pour valider une Sortie:
- [ ] Vérifier l'article et la quantité
- [ ] Inspecter la marchandise avant sortie
- [ ] Déterminer l'état (Conforme/Non-conforme)
- [ ] Compter les unités défectueuses si nécessaire
- [ ] Saisir votre nom comme contrôleur
- [ ] Approuver → Stock déduit (total)

### Pour rejeter un mouvement:
- [ ] Identifier le problème
- [ ] Saisir votre nom comme contrôleur
- [ ] Documenter la raison du rejet
- [ ] Confirmer → PDF généré

---

## 🚀 Exemple Pratique

### Scénario: Réception de 1000 gants avec 50 défectueux

1. **Création Entrée**
   - Article: Gants Nitrile M
   - Quantité: 1000 Paires
   - Statut: "En attente"
   - Stock actuel: 2500 (inchangé)

2. **Contrôle Qualité**
   - Inspection physique
   - Résultat: 50 gants défectueux
   - État: Non-conforme
   - Unités défectueuses: 50

3. **Validation**
   - Contrôleur: Marie L.
   - Approuver
   - **Stock final: 2500 + 950 = 3450**
   - 50 gants rejetés (perte)

---

## 📞 Support

Pour toute question sur le système de Contrôle Qualité bi-directionnel, consultez:
- `BIDIRECTIONAL_QC_COMPLETE.md` - Documentation complète
- `GUIDE_CONTROLE_QUALITE.md` - Guide utilisateur détaillé
- `QC_VISUAL_GUIDE.md` - Guide visuel avec captures d'écran

---

**Système opérationnel et prêt à l'emploi! 🎉**

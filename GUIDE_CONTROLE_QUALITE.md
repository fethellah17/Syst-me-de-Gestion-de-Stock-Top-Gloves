# Guide - Contrôle Qualité des Sorties

## 📋 Vue d'ensemble

Une étape de Contrôle Qualité (CQ) obligatoire a été intégrée avant la validation finale de chaque Sortie. Cela garantit que seuls les articles conformes quittent le stock.

## 🔄 Workflow de Sortie avec CQ

### Étape 1 : Créer une Sortie
```
Utilisateur crée une Sortie
↓
Statut : "En attente de contrôle" (Orange)
Stock : Inchangé (pas encore déduit)
```

### Étape 2 : Passer le Contrôle Qualité
```
Contrôleur clique sur l'icône Bouclier
↓
Formulaire de CQ s'ouvre
```

### Étape 3 : Décision du Contrôleur
```
Approuver ✅
├─ Statut : "Validé" (Vert)
├─ Stock : Déduit
└─ Message : "Sortie approuvée par le contrôle qualité"

OU

Rejeter ❌
├─ Statut : "Rejeté" (Rouge)
├─ Stock : Inchangé
└─ Articles : À isoler
```

## 📊 Statuts des Sorties

| Statut | Couleur | Signification | Stock |
|--------|---------|---------------|-------|
| **En attente de contrôle** | 🟠 Orange | Sortie créée, en attente de CQ | Inchangé |
| **Validé** | 🟢 Vert | Approuvé par le contrôleur | Déduit |
| **Rejeté** | 🔴 Rouge | Rejeté par le contrôleur | Inchangé |

## 🛡️ Formulaire de Contrôle Qualité

### Champs Obligatoires

1. **État des Articles**
   - Conforme ✅
   - Non-conforme ⚠️

2. **Nombre d'unités défectueuses** (si Non-conforme)
   - Nombre d'articles défectueux
   - Exemple : 5 unités défectueuses sur 100

3. **Nom du Contrôleur**
   - Qui effectue le contrôle
   - Traçabilité complète

4. **Décision Finale**
   - Approuver la sortie
   - Rejeter la sortie

5. **Raison du Rejet** (si Rejeter)
   - Motif du rejet
   - Exemple : "Articles endommagés", "Quantité incorrecte"

## 🎯 Cas d'Usage

### Cas 1 : Sortie Conforme
```
1. Créer une Sortie
   - Article : Gants Nitrile M
   - Quantité : 500
   - Destination : Production
   - Statut : En attente de contrôle

2. Passer le CQ
   - État : Conforme
   - Contrôleur : Ahmed K.
   - Décision : Approuver

3. Résultat
   - Statut : Validé ✅
   - Stock : 500 déduit
   - Message : "Sortie approuvée par le contrôle qualité"
```

### Cas 2 : Sortie Non-Conforme
```
1. Créer une Sortie
   - Article : Gants Latex S
   - Quantité : 200
   - Destination : Production
   - Statut : En attente de contrôle

2. Passer le CQ
   - État : Non-conforme
   - Unités défectueuses : 15
   - Contrôleur : Sara M.
   - Décision : Rejeter
   - Raison : "Emballage endommagé"

3. Résultat
   - Statut : Rejeté ❌
   - Stock : Inchangé (200 restent en stock)
   - Articles : À isoler en quarantaine
```

## 🔍 Visualisation dans l'Historique

### Tableau des Mouvements

```
Date | Article | Type | Qté | Statut | Actions
-----|---------|------|-----|--------|--------
2026-02-25 14:30 | Gants Nitrile M | Sortie | 500 | ✅ Validé | 🛡️ ✏️ 🗑️
2026-02-25 13:15 | Gants Latex S | Sortie | 200 | ❌ Rejeté | ✏️ 🗑️
2026-02-25 12:00 | Gants Vinyle L | Sortie | 300 | ⏳ En attente | 🛡️ ✏️ 🗑️
```

### Icônes

- 🛡️ **Bouclier** : Passer le contrôle qualité (visible si "En attente")
- ✅ **Check** : Sortie validée
- ❌ **Alerte** : Sortie rejetée
- ⏳ **Alerte** : En attente de contrôle

## 💡 Points Importants

### 1. Stock Déféré
```
❌ Avant : Stock déduit immédiatement
✅ Après : Stock déduit seulement après approbation
```

### 2. Traçabilité Complète
```
Chaque sortie enregistre :
- Opérateur (qui crée la sortie)
- Contrôleur (qui valide)
- État des articles
- Unités défectueuses
- Raison du rejet (si applicable)
```

### 3. Isolation des Articles Rejetés
```
Si Rejeté :
- Articles restent en stock
- Marqués comme "À isoler"
- Nécessitent une action corrective
```

## 🚀 Workflow Complet

```
1. Magasinier crée une Sortie
   ↓
2. Sortie en attente de contrôle (Orange)
   ↓
3. Contrôleur clique sur 🛡️
   ↓
4. Formulaire de CQ s'ouvre
   ↓
5. Contrôleur remplit le formulaire
   ↓
6. Décision : Approuver ou Rejeter
   ↓
   ├─ Approuver → Statut Validé (Vert) → Stock déduit
   └─ Rejeter → Statut Rejeté (Rouge) → Stock inchangé
```

## ✅ Checklist pour le Contrôleur

- [ ] Vérifier l'état des articles
- [ ] Compter les unités défectueuses (si applicable)
- [ ] Renseigner le nom du contrôleur
- [ ] Sélectionner la décision (Approuver/Rejeter)
- [ ] Si Rejeter : Renseigner la raison
- [ ] Valider le formulaire

## 📞 FAQ

**Q: Pourquoi le stock n'est pas déduit immédiatement ?**
A: Pour garantir que seuls les articles conformes quittent le stock. Le CQ valide la qualité avant la déduction.

**Q: Que se passe-t-il si je rejette une sortie ?**
A: Les articles restent en stock et doivent être isolés pour inspection/correction.

**Q: Puis-je modifier une sortie après CQ ?**
A: Non, une fois approuvée ou rejetée, la sortie ne peut pas être modifiée. Vous devez la supprimer et en créer une nouvelle.

**Q: Qui peut passer le CQ ?**
A: N'importe quel utilisateur peut passer le CQ. Le nom du contrôleur est enregistré pour la traçabilité.

**Q: Que signifie "À isoler" ?**
A: Les articles rejetés doivent être séparés du stock normal pour inspection ou correction.

## 🎓 Résumé

La Contrôle Qualité des Sorties garantit :
- ✅ Qualité des articles expédiés
- ✅ Traçabilité complète
- ✅ Stock fiable et à jour
- ✅ Isolation des articles défectueux
- ✅ Responsabilité du contrôleur

---

**Pour plus d'informations**, consulter le guide complet des mouvements.

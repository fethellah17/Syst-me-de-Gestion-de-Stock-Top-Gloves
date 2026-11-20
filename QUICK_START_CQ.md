# Quick Start - Contrôle Qualité

## ⚡ 5 Minutes pour Comprendre

### Le Changement Principal
```
❌ Avant : Sortie créée → Stock déduit immédiatement
✅ Après : Sortie créée → En attente de CQ → Stock déduit après approbation
```

### Les 3 Statuts

```
🟠 En attente de contrôle
   ↓
   Passer le CQ
   ↓
   ├─ 🟢 Validé (Approuvé)
   └─ 🔴 Rejeté (Rejeté)
```

---

## 🚀 Premiers Pas

### Étape 1 : Créer une Sortie
1. Aller à **Mouvements**
2. Cliquer **"Nouveau Mouvement"**
3. Sélectionner **"Sortie"**
4. Remplir le formulaire
5. Cliquer **"Enregistrer"**

✅ **Résultat :** Sortie créée avec statut "En attente de contrôle" (Orange)

### Étape 2 : Passer le Contrôle Qualité
1. Voir la sortie dans le tableau
2. Cliquer sur l'icône 🛡️ (Bouclier)
3. Modal de CQ s'ouvre

✅ **Résultat :** Formulaire de CQ affiché

### Étape 3 : Remplir le Formulaire de CQ
1. Sélectionner l'état : **Conforme** ou **Non-conforme**
2. Si Non-conforme : Renseigner le nombre de défectueuses
3. Renseigner le nom du contrôleur
4. Sélectionner la décision : **Approuver** ou **Rejeter**
5. Si Rejeter : Renseigner la raison
6. Cliquer **"Approuver la Sortie"** ou **"Rejeter la Sortie"**

✅ **Résultat :** Sortie validée ou rejetée

### Étape 4 : Vérifier le Résultat
1. Voir la sortie dans le tableau
2. Statut mis à jour : ✅ Validé ou ❌ Rejeté

✅ **Résultat :** Stock mis à jour (si approuvé)

---

## 📊 Résumé des Effets

### Cas 1 : Approuver
```
Avant CQ :
├─ Statut : En attente (Orange)
├─ Stock : 2500

Après Approbation :
├─ Statut : Validé (Vert)
└─ Stock : 2300 (500 déduit)
```

### Cas 2 : Rejeter
```
Avant CQ :
├─ Statut : En attente (Orange)
├─ Stock : 2500

Après Rejet :
├─ Statut : Rejeté (Rouge)
└─ Stock : 2500 (inchangé)
```

---

## ⚠️ Points Importants

### 1. Stock Déféré
```
❌ Pas de déduction immédiate
✅ Déduction seulement après approbation
```

### 2. Traçabilité
```
Chaque sortie enregistre :
- Opérateur (qui crée)
- Contrôleur (qui valide)
- État des articles
- Unités défectueuses
- Raison du rejet
```

### 3. Isolation
```
Si Rejeté :
- Articles restent en stock
- Marqués comme "À isoler"
- Nécessitent une action corrective
```

---

## 🎯 Cas d'Usage Rapides

### Cas 1 : Sortie Conforme
```
1. Créer Sortie (500 paires)
2. Passer CQ
3. État : Conforme
4. Décision : Approuver
5. Résultat : Stock -500 ✅
```

### Cas 2 : Sortie Non-Conforme
```
1. Créer Sortie (200 paires)
2. Passer CQ
3. État : Non-conforme
4. Défectueuses : 15
5. Décision : Rejeter
6. Raison : "Emballage endommagé"
7. Résultat : Stock inchangé ❌
```

---

## 🔍 Vérifications Rapides

### Vérifier le Statut
1. Aller à **Mouvements**
2. Chercher la sortie
3. Voir la colonne "Statut"

### Vérifier le Stock
1. Aller à **Articles**
2. Chercher l'article
3. Voir le stock mis à jour

### Vérifier l'Historique
1. Aller à **Mouvements**
2. Voir toutes les sorties
3. Voir les statuts (Orange/Vert/Rouge)

---

## ❓ Questions Rapides

**Q: Pourquoi le stock n'est pas déduit immédiatement ?**
A: Pour garantir que seuls les articles conformes quittent le stock.

**Q: Que se passe-t-il si je rejette une sortie ?**
A: Les articles restent en stock et doivent être isolés.

**Q: Qui peut passer le CQ ?**
A: N'importe quel utilisateur. Le nom du contrôleur est enregistré.

**Q: Puis-je modifier une sortie après CQ ?**
A: Non, vous devez la supprimer et en créer une nouvelle.

---

## 📚 Pour Aller Plus Loin

- **Guide complet** : GUIDE_CONTROLE_QUALITE.md
- **Changelog** : CHANGELOG_CONTROLE_QUALITE.md
- **Détails techniques** : EXECUTIVE_SUMMARY_CQ.md

---

## ✅ Checklist Rapide

- [ ] Créer une sortie
- [ ] Voir le statut "En attente"
- [ ] Cliquer sur 🛡️
- [ ] Remplir le formulaire de CQ
- [ ] Approuver la sortie
- [ ] Vérifier le stock mis à jour

**Temps estimé : 5 minutes**

---

**Prêt à commencer ?** Allez à la page **Mouvements** et créez votre première sortie !

# Quick Start - Mouvements Refactorisés

## ⚡ 5 Minutes pour Comprendre

### Le Changement Principal
```
❌ Avant : Emplacement = Champ fixe de l'article
✅ Après : Emplacement = Dernier mouvement de l'article
```

### Les 3 Types de Mouvements

#### 1. Entrée 🔽
```
Quand : Article arrive en stock
Effet : Stock ↑ + Localisation définie
Exemple : Réception de 500 paires en Zone A-12
```

#### 2. Sortie 🔼
```
Quand : Article quitte le stock
Effet : Stock ↓ + Occupation ↓
Exemple : 200 paires vers Département Production
```

#### 3. Transfert ⇄
```
Quand : Article change de place
Effet : Stock inchangé + Occupation mise à jour
Exemple : 300 paires de Zone A-12 vers Zone B-03
```

---

## 🚀 Premiers Pas

### Étape 1 : Créer une Entrée
1. Aller à **Mouvements**
2. Cliquer **"Nouveau Mouvement"**
3. Sélectionner **"Entrée"**
4. Remplir :
   - Article : Gants Nitrile M
   - Destination : Zone A-12
   - Quantité : 500
   - Opérateur : Votre nom
5. Cliquer **"Enregistrer"**

✅ **Résultat :** Article localisé en Zone A-12

### Étape 2 : Vérifier la Localisation
1. Aller à **Articles**
2. Chercher "Gants Nitrile M"
3. Voir la colonne "Emplacement" → **Zone A-12**

✅ **Résultat :** Localisation affichée automatiquement

### Étape 3 : Créer un Transfert
1. Aller à **Mouvements**
2. Cliquer **"Nouveau Mouvement"**
3. Sélectionner **"Transfert"**
4. Remplir :
   - Article : Gants Nitrile M
   - Source : Zone A-12
   - Destination : Zone B-03
   - Quantité : 300
   - Opérateur : Votre nom
5. Cliquer **"Enregistrer"**

✅ **Résultat :** Article déplacé vers Zone B-03

### Étape 4 : Créer une Sortie
1. Aller à **Mouvements**
2. Cliquer **"Nouveau Mouvement"**
3. Sélectionner **"Sortie"**
4. Remplir :
   - Article : Gants Nitrile M
   - Source : **Zone B-03** (automatique)
   - Destination : Département Production
   - Quantité : 200
   - Opérateur : Votre nom
5. Cliquer **"Enregistrer"**

✅ **Résultat :** Article consommé, stock réduit

---

## 📊 Résumé des Effets

| Action | Stock | Zone A | Zone B |
|--------|-------|--------|--------|
| Entrée 500 en A | +500 | +500 | - |
| Transfert 300 A→B | - | -300 | +300 |
| Sortie 200 de B | -200 | - | -200 |
| **Final** | **300** | **200** | **100** |

---

## ⚠️ Points Importants

### 1. Emplacement Source Automatique
```
Sortie
├─ Article: Gants Nitrile M
├─ Source: Zone B-03 ← Automatique (dernier mouvement)
└─ Destination: Production
```

### 2. Transfert ≠ Changement de Stock
```
Avant : Zone A = 500, Zone B = 0, Stock = 500
Transfert 300 A→B
Après : Zone A = 200, Zone B = 300, Stock = 500 ✅
```

### 3. Validation des Transferts
```
❌ Impossible : Transférer 600 si seulement 500 disponible
❌ Impossible : Transférer de Zone A vers Zone A
✅ Possible : Transférer 300 de Zone A vers Zone B
```

---

## 🎯 Cas d'Usage Rapides

### Cas 1 : Réception
```
Entrée
├─ Article: Gants Nitrile M
├─ Destination: Zone A-12
└─ Quantité: 1000
```

### Cas 2 : Réorganisation
```
Transfert
├─ Article: Gants Nitrile M
├─ Source: Zone A-12
├─ Destination: Zone B-03
└─ Quantité: 500
```

### Cas 3 : Consommation
```
Sortie
├─ Article: Gants Nitrile M
├─ Source: Zone B-03 (auto)
├─ Destination: Production
└─ Quantité: 300
```

---

## 🔍 Vérifications Rapides

### Vérifier la Localisation
1. Aller à **Articles**
2. Chercher l'article
3. Voir la colonne "Emplacement"

### Vérifier l'Occupation
1. Aller à **Emplacements**
2. Voir la barre de progression
3. Voir le pourcentage

### Vérifier l'Historique
1. Aller à **Mouvements**
2. Chercher l'article
3. Voir tous les mouvements

---

## ❓ Questions Rapides

**Q: Où est mon article ?**
A: Voir la page Articles → Colonne "Emplacement"

**Q: Comment localiser un article ?**
A: Créer une Entrée avec l'emplacement de destination

**Q: Un transfert change-t-il le stock ?**
A: Non, le stock reste identique

**Q: Pourquoi l'emplacement source s'affiche automatiquement ?**
A: Pour garantir la traçabilité et éviter les erreurs

**Q: Puis-je modifier un mouvement ?**
A: Oui, sauf l'article et le type

---

## 📚 Pour Aller Plus Loin

- **Guide complet** : GUIDE_MOUVEMENTS_REFACTORISES.md
- **Scénarios de test** : GUIDE_TEST_MOUVEMENTS.md
- **Détails techniques** : REFACTORING_MOUVEMENTS.md
- **Points clés** : POINTS_CLES.md

---

## ✅ Checklist Rapide

- [ ] Créer une Entrée
- [ ] Vérifier la localisation
- [ ] Créer un Transfert
- [ ] Vérifier l'occupation
- [ ] Créer une Sortie
- [ ] Vérifier le stock

**Temps estimé : 10 minutes**

---

**Prêt à commencer ?** Allez à la page **Mouvements** et créez votre premier mouvement !

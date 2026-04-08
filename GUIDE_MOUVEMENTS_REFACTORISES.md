# Guide d'Utilisation - Mouvements Refactorisés

## 📋 Vue d'ensemble

La gestion des mouvements a été complètement refactorisée pour suivre une architecture ERP professionnelle. La localisation des articles est maintenant gérée **exclusivement par les Mouvements**, ce qui garantit une traçabilité complète et une intégrité des données.

## 🎯 Les 3 Types de Mouvements

### 1️⃣ Entrée (Réception)

**Quand l'utiliser :** Lorsqu'un article arrive en stock (réception de fournisseur, retour, etc.)

**Champs à remplir :**
- **Article** : Sélectionner l'article reçu
- **Emplacement de Destination** : Où stocker l'article (Zone A-12, Zone B-03, etc.)
- **Quantité** : Nombre d'unités reçues
- **Opérateur** : Nom de la personne effectuant l'opération

**Effet :**
- ✅ Augmente le stock global de l'article
- ✅ Lie l'article à cet emplacement
- ✅ Enregistre l'historique du mouvement

**Exemple :**
```
Article: Gants Nitrile M
Destination: Zone A-12
Quantité: 500 paires
Opérateur: Karim B.
→ Stock passe de 2000 à 2500 paires
→ Article localisé en Zone A-12
```

---

### 2️⃣ Sortie (Consommation)

**Quand l'utiliser :** Lorsqu'un article quitte le stock (consommation, expédition, destruction, etc.)

**Champs à remplir :**
- **Article** : Sélectionner l'article à sortir
- **Emplacement Source** : ⚠️ **Affiché automatiquement** depuis le dernier mouvement
- **Destination/Utilisation** : Où va l'article (Département Production, Maintenance, Expédition, Destruction, Retour Fournisseur)
- **Quantité** : Nombre d'unités à sortir
- **Opérateur** : Nom de la personne effectuant l'opération

**Effet :**
- ✅ Diminue le stock global de l'article
- ✅ Réduit l'occupation de l'emplacement source
- ✅ Enregistre la destination de l'article

**Exemple :**
```
Article: Gants Nitrile M
Emplacement Source: Zone A-12 (automatique)
Destination: Département Production
Quantité: 200 paires
Opérateur: Sara M.
→ Stock passe de 2500 à 2300 paires
→ Zone A-12 perd 200 paires
```

---

### 3️⃣ Transfert (Changement de Place)

**Quand l'utiliser :** Lorsqu'un article change d'emplacement dans le stock (réorganisation, optimisation, etc.)

**Champs à remplir :**
- **Article** : Sélectionner l'article à transférer
- **Emplacement Source** : D'où il sort (Zone A-12, Zone B-03, etc.)
- **Emplacement de Destination** : Où il va (Zone C-01, Zone D-05, etc.)
- **Quantité** : Nombre d'unités à transférer
- **Opérateur** : Nom de la personne effectuant l'opération

**Effet :**
- ✅ **Le stock total ne change pas** (important !)
- ✅ Diminue l'occupation de l'emplacement source
- ✅ Augmente l'occupation de l'emplacement destination
- ✅ Enregistre le transfert dans l'historique

**Validations :**
- ⚠️ Impossible de transférer plus que la quantité disponible
- ⚠️ Les emplacements source et destination doivent être différents

**Exemple :**
```
Article: Gants Nitrile M
Emplacement Source: Zone A-12
Emplacement Destination: Zone B-03
Quantité: 500 paires
Opérateur: Ahmed K.
→ Stock reste 2300 paires (inchangé)
→ Zone A-12 perd 500 paires (3800 → 3300)
→ Zone B-03 gagne 500 paires (1800 → 2300)
→ Historique: "Transfert de Zone A-12 vers Zone B-03"
```

---

## 📍 Localisation Dynamique des Articles

### Comment ça marche ?

L'emplacement d'un article est **toujours déterminé par son dernier mouvement** :

- **Après une Entrée** → L'article est à l'emplacement de destination
- **Après une Sortie** → L'article n'est plus en stock (destination = utilisation)
- **Après un Transfert** → L'article est à l'emplacement de destination

### Affichage dans l'application

**Page Articles :**
- Colonne "Emplacement" affiche la localisation actuelle
- Mise à jour automatique après chaque mouvement

**Page Mouvements :**
- Lors de la création d'une Sortie, l'emplacement source s'affiche automatiquement
- Historique clair : "Transfert de [Zone A] vers [Zone B]"

**Page Inventaire :**
- Affiche l'emplacement actuel de chaque article
- Facilite le comptage physique

---

## 📊 Occupation des Emplacements

### Calcul automatique

L'occupation de chaque emplacement est calculée en temps réel :

```
Occupation = Somme des stocks de tous les articles présents
```

### Mise à jour

L'occupation se met à jour automatiquement lors de :
- ✅ Entrée d'un article
- ✅ Sortie d'un article
- ✅ Transfert d'un article

### Visualisation

**Page Emplacements :**
- Barre de progression colorée
- Pourcentage d'occupation
- Alerte si > 90% de capacité

---

## 🔍 Historique et Traçabilité

### Historique des Mouvements

Chaque mouvement est enregistré avec :
- Date et heure précises
- Article concerné
- Type de mouvement (Entrée/Sortie/Transfert)
- Quantité
- Emplacement(s) concerné(s)
- Opérateur responsable

### Recherche et Filtrage

- Rechercher par nom d'article ou référence
- Filtrer par type de mouvement
- Voir l'historique complet

### Modification et Suppression

- ✏️ Modifier un mouvement (sauf l'article et le type)
- 🗑️ Supprimer un mouvement (annule son effet sur le stock)

---

## ⚠️ Points Importants

### 1. Emplacement des Articles

❌ **Avant :** L'emplacement était un champ fixe de l'article
✅ **Après :** L'emplacement est déterminé par le dernier mouvement

**Conséquence :** Vous ne pouvez plus définir l'emplacement lors de la création d'un article. Vous devez d'abord créer un mouvement d'Entrée.

### 2. Stock et Transfert

❌ **Erreur courante :** Penser qu'un transfert change le stock
✅ **Correct :** Un transfert ne change que la localisation, pas la quantité

**Exemple :**
```
Avant transfert: Zone A-12 = 500 paires, Zone B-03 = 300 paires
Transfert: 200 paires de A-12 vers B-03
Après transfert: Zone A-12 = 300 paires, Zone B-03 = 500 paires
Stock total: 800 paires (inchangé)
```

### 3. Validation des Transferts

Vous ne pouvez pas transférer plus que la quantité disponible :

```
Article: Gants Nitrile M
Emplacement Source: Zone A-12 (contient 500 paires)
Quantité à transférer: 600 paires
→ ❌ Erreur : "Quantité insuffisante. Disponible: 500"
```

### 4. Sorties et Emplacement Source

L'emplacement source d'une sortie s'affiche automatiquement :

```
Vous sélectionnez: Gants Nitrile M
Emplacement Source: Zone A-12 (automatique)
→ Vous ne pouvez pas le modifier
→ Il provient du dernier mouvement de cet article
```

---

## 🚀 Workflow Typique

### Scénario : Réception et Distribution

**Jour 1 - Réception :**
1. Créer une Entrée
   - Article: Gants Nitrile M
   - Destination: Zone A-12
   - Quantité: 1000 paires
   - Opérateur: Karim B.
   - ✅ Stock: 0 → 1000, Localisation: Zone A-12

**Jour 2 - Réorganisation :**
2. Créer un Transfert
   - Article: Gants Nitrile M
   - Source: Zone A-12
   - Destination: Zone B-03
   - Quantité: 600 paires
   - Opérateur: Ahmed K.
   - ✅ Stock: 1000 (inchangé), Localisation: Zone B-03 (600) + Zone A-12 (400)

**Jour 3 - Consommation :**
3. Créer une Sortie
   - Article: Gants Nitrile M
   - Source: Zone B-03 (automatique)
   - Destination: Département Production
   - Quantité: 300 paires
   - Opérateur: Sara M.
   - ✅ Stock: 1000 → 700, Localisation: Zone B-03 (300) + Zone A-12 (400)

---

## 💡 Conseils d'Utilisation

1. **Toujours enregistrer les mouvements** : C'est la source de vérité pour la localisation
2. **Utiliser les bons types** : Entrée/Sortie/Transfert selon le contexte
3. **Vérifier l'emplacement source** : Pour les sorties, il s'affiche automatiquement
4. **Consulter l'historique** : Pour tracer l'origine d'un article
5. **Valider les quantités** : Avant de créer un mouvement

---

## ❓ FAQ

**Q: Pourquoi l'emplacement n'est plus un champ de l'article ?**
A: Pour garantir une traçabilité complète. L'emplacement est maintenant déterminé par l'historique des mouvements, ce qui est plus fiable et auditable.

**Q: Que se passe-t-il si je supprime un mouvement ?**
A: L'effet du mouvement est annulé (stock et localisation reviennent à l'état précédent).

**Q: Puis-je modifier un mouvement ?**
A: Oui, sauf l'article et le type. Vous pouvez modifier la quantité, l'emplacement et l'opérateur.

**Q: Comment savoir où est un article ?**
A: Consultez la page Articles ou l'historique des mouvements. L'emplacement s'affiche automatiquement.

**Q: Un transfert change-t-il le stock ?**
A: Non, un transfert ne change que la localisation. Le stock total reste identique.

# Guide de Test - Mouvements Refactorisés

## 🧪 Comment Tester la Nouvelle Architecture

### Prérequis
- Application lancée et accessible
- Données initiales chargées
- Navigateur moderne

---

## 📋 Scénarios de Test

### Scénario 1 : Vérifier la Suppression du Champ Emplacement

**Étapes :**
1. Aller à la page **Articles**
2. Cliquer sur **"Ajouter"**
3. Remplir le formulaire :
   - Référence : `TEST-001`
   - Nom : `Article Test`
   - Catégorie : `Gants Nitrile`
   - Stock : `100`
   - Seuil : `20`
   - Unité : `paire`
   - CJE : `10`

**Résultat attendu :**
- ✅ Pas de champ "Emplacement" dans le formulaire
- ✅ L'article est créé avec succès
- ✅ Dans le tableau, la colonne "Emplacement" affiche "Non localisé"

---

### Scénario 2 : Créer une Entrée

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur **"Nouveau Mouvement"**
3. Sélectionner le type **"Entrée"**
4. Remplir le formulaire :
   - Article : `Gants Nitrile M` (GN-M-001)
   - Emplacement de Destination : `Zone A-12`
   - Quantité : `500`
   - Opérateur : `Test User`
5. Cliquer sur **"Enregistrer"**

**Résultat attendu :**
- ✅ Message de succès : "Mouvement d'entrée enregistré avec succès"
- ✅ Le mouvement apparaît dans le tableau
- ✅ Icône 🔽 pour le type "Entrée"
- ✅ Aller à la page **Articles** → L'emplacement affiche "Zone A-12"

---

### Scénario 3 : Créer une Sortie

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur **"Nouveau Mouvement"**
3. Sélectionner le type **"Sortie"**
4. Remplir le formulaire :
   - Article : `Gants Nitrile M` (GN-M-001)
   - Emplacement Source : **Doit afficher "Zone A-12" automatiquement**
   - Destination : `Département Production`
   - Quantité : `200`
   - Opérateur : `Test User`
5. Cliquer sur **"Enregistrer"**

**Résultat attendu :**
- ✅ L'emplacement source s'affiche automatiquement
- ✅ Message de succès : "Mouvement de Sortie enregistré avec succès"
- ✅ Icône 🔼 pour le type "Sortie"
- ✅ Aller à la page **Articles** → Stock passe de 2500 à 2300
- ✅ Aller à la page **Emplacements** → Zone A-12 perd 200 unités

---

### Scénario 4 : Créer un Transfert

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur **"Nouveau Mouvement"**
3. Sélectionner le type **"Transfert"**
4. Remplir le formulaire :
   - Article : `Gants Nitrile M` (GN-M-001)
   - Emplacement Source : `Zone A-12`
   - Emplacement de Destination : `Zone B-03`
   - Quantité : `300`
   - Opérateur : `Test User`
5. Cliquer sur **"Enregistrer"**

**Résultat attendu :**
- ✅ Message de succès : "Mouvement de Transfert enregistré avec succès"
- ✅ Icône ⇄ pour le type "Transfert"
- ✅ Historique affiche : "Transfert de Zone A-12 vers Zone B-03"
- ✅ Aller à la page **Articles** → Stock reste 2300 (inchangé)
- ✅ Aller à la page **Emplacements** :
  - Zone A-12 : occupation diminue
  - Zone B-03 : occupation augmente

---

### Scénario 5 : Validation - Transfert Impossible

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur **"Nouveau Mouvement"**
3. Sélectionner le type **"Transfert"**
4. Remplir le formulaire :
   - Article : `Gants Nitrile M` (GN-M-001)
   - Emplacement Source : `Zone A-12`
   - Emplacement de Destination : `Zone B-03`
   - Quantité : `10000` (plus que disponible)
   - Opérateur : `Test User`
5. Cliquer sur **"Enregistrer"**

**Résultat attendu :**
- ✅ Message d'erreur : "Quantité insuffisante. Disponible: [quantité réelle]"
- ✅ Le mouvement n'est pas créé

---

### Scénario 6 : Validation - Emplacements Identiques

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur **"Nouveau Mouvement"**
3. Sélectionner le type **"Transfert"**
4. Remplir le formulaire :
   - Article : `Gants Nitrile M` (GN-M-001)
   - Emplacement Source : `Zone A-12`
   - Emplacement de Destination : `Zone A-12` (même)
   - Quantité : `100`
   - Opérateur : `Test User`
5. Cliquer sur **"Enregistrer"**

**Résultat attendu :**
- ✅ Message d'erreur : "Les emplacements source et destination doivent être différents"
- ✅ Le mouvement n'est pas créé

---

### Scénario 7 : Vérifier l'Occupation des Emplacements

**Étapes :**
1. Aller à la page **Emplacements**
2. Observer les cartes d'emplacements

**Résultat attendu :**
- ✅ Chaque emplacement affiche son occupation
- ✅ Barre de progression colorée :
  - 🟢 Vert : < 70%
  - 🟡 Orange : 70-90%
  - 🔴 Rouge : > 90%
- ✅ Pourcentage d'occupation affiché
- ✅ Quantité occupée / capacité affichée

---

### Scénario 8 : Vérifier l'Historique des Mouvements

**Étapes :**
1. Aller à la page **Mouvements**
2. Observer le tableau des mouvements

**Résultat attendu :**
- ✅ Tous les mouvements créés sont listés
- ✅ Icônes correctes pour chaque type
- ✅ Pour les transferts : "Transfert de [Zone A] vers [Zone B]"
- ✅ Possibilité de filtrer par type
- ✅ Possibilité de rechercher par article

---

### Scénario 9 : Modifier un Mouvement

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur l'icône ✏️ d'un mouvement
3. Modifier la quantité (ex: 500 → 600)
4. Cliquer sur **"Mettre à jour"**

**Résultat attendu :**
- ✅ Message de succès : "Mouvement modifié avec succès"
- ✅ Le stock est recalculé correctement
- ✅ L'occupation des emplacements est mise à jour

---

### Scénario 10 : Supprimer un Mouvement

**Étapes :**
1. Aller à la page **Mouvements**
2. Cliquer sur l'icône 🗑️ d'un mouvement
3. Confirmer la suppression

**Résultat attendu :**
- ✅ Message de succès : "Mouvement supprimé avec succès"
- ✅ Le mouvement disparaît du tableau
- ✅ L'effet du mouvement est annulé (stock et occupation restaurés)

---

### Scénario 11 : Vérifier la Localisation Dynamique

**Étapes :**
1. Aller à la page **Articles**
2. Observer la colonne "Emplacement"
3. Créer un mouvement d'Entrée pour un article
4. Revenir à la page **Articles**

**Résultat attendu :**
- ✅ L'emplacement s'affiche automatiquement après l'entrée
- ✅ L'emplacement change après un transfert
- ✅ L'emplacement reste le même après une sortie (car l'article quitte le stock)

---

### Scénario 12 : Vérifier l'Inventaire

**Étapes :**
1. Aller à la page **Inventaire Quotidien**
2. Observer la colonne "Emplacement"

**Résultat attendu :**
- ✅ L'emplacement de chaque article s'affiche correctement
- ✅ Les emplacements correspondent à ceux de la page Articles

---

## 🔍 Checklist de Validation

### Fonctionnalités Principales
- [ ] Suppression du champ "Emplacement" des articles
- [ ] Affichage dynamique de l'emplacement
- [ ] Création d'Entrée
- [ ] Création de Sortie
- [ ] Création de Transfert
- [ ] Affichage automatique de l'emplacement source pour les sorties
- [ ] Validation des transferts (quantité insuffisante)
- [ ] Validation des transferts (emplacements identiques)
- [ ] Modification des mouvements
- [ ] Suppression des mouvements
- [ ] Historique clair des transferts
- [ ] Icônes distinctes pour chaque type
- [ ] Occupation des emplacements mise à jour

### Données
- [ ] Stock augmente après une Entrée
- [ ] Stock diminue après une Sortie
- [ ] Stock inchangé après un Transfert
- [ ] Occupation source diminue après un Transfert
- [ ] Occupation destination augmente après un Transfert

### UI/UX
- [ ] Sélecteur de type visible et fonctionnel
- [ ] Champs conditionnels affichés correctement
- [ ] Messages d'erreur clairs
- [ ] Messages de succès affichés
- [ ] Icônes correctes pour chaque type
- [ ] Barre de progression d'occupation colorée

---

## 🐛 Dépannage

### Problème : L'emplacement n'affiche pas "Non localisé"
**Solution :** Vérifier que l'article n'a pas de mouvement. Créer une Entrée pour le localiser.

### Problème : L'emplacement source ne s'affiche pas automatiquement
**Solution :** Vérifier que l'article a au moins un mouvement. Créer une Entrée d'abord.

### Problème : Le transfert ne change pas l'occupation
**Solution :** Vérifier que le mouvement a bien été créé. Consulter l'historique des mouvements.

### Problème : Le stock change après un transfert
**Solution :** C'est une erreur. Le stock ne doit pas changer. Vérifier la logique dans DataContext.

---

## 📊 Données de Test Recommandées

### Articles Initiaux
- Gants Nitrile M (GN-M-001) : 2500 paires
- Gants Latex S (GL-S-002) : 1800 paires
- Gants Vinyle L (GV-L-003) : 3200 paires

### Emplacements
- Zone A-12 : Capacité 5000
- Zone B-03 : Capacité 4000
- Zone A-08 : Capacité 6000
- Zone C-01 : Capacité 3000
- Zone D-05 : Capacité 8000

### Mouvements de Test
1. Entrée : 500 paires en Zone A-12
2. Transfert : 300 paires de Zone A-12 vers Zone B-03
3. Sortie : 200 paires vers Département Production

---

## ✅ Résultat Attendu Final

Après tous les tests :
- ✅ Aucune erreur de compilation
- ✅ Aucune erreur dans la console
- ✅ Tous les scénarios fonctionnent correctement
- ✅ Les données sont cohérentes
- ✅ L'UI est responsive et intuitive

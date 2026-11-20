# Exemples d'Utilisation - Système de Gestion du Stock Prédictif

## 📋 Scénarios Pratiques

### Scénario 1 : Article en Stock Critique

**Situation** :
- Article : Gants Nitrile XL
- Stock Actuel : 45 unités
- Seuil de Sécurité : 200 unités
- CJE : 15 unités/jour

**Calculs** :
```
Autonomie = 45 / 15 = 3 jours
Statut = CRITIQUE (car Stock ≤ Seuil ET Autonomie ≤ 3 jours)
```

**Affichage** :
```
Temps Restant : 🔴 3j
Statut : 🔴 CRITIQUE
Tooltip : "Basé sur une consommation de 15 unités par jour"
```

**Actions Recommandées** :
1. ✅ Passer une commande d'urgence immédiatement
2. ✅ Vérifier le stock physique
3. ✅ Notifier l'équipe de la rupture imminente
4. ✅ Réduire temporairement la consommation si possible

---

### Scénario 2 : Article en Attention

**Situation** :
- Article : Sur-gants PE
- Stock Actuel : 120 unités
- Seuil de Sécurité : 500 unités
- CJE : 8 unités/jour

**Calculs** :
```
Autonomie = 120 / 8 = 15 jours
Statut = ATTENTION (car Autonomie entre 4-7 jours)
```

**Affichage** :
```
Temps Restant : 🟠 15j
Statut : 🟠 ATTENTION
Tooltip : "Basé sur une consommation de 8 unités par jour"
```

**Actions Recommandées** :
1. ✅ Prévoir une commande pour la semaine
2. ✅ Vérifier les délais de livraison du fournisseur
3. ✅ Préparer les documents de commande
4. ✅ Surveiller la consommation quotidienne

---

### Scénario 3 : Article Sécurisé

**Situation** :
- Article : Gants Nitrile M
- Stock Actuel : 2500 unités
- Seuil de Sécurité : 500 unités
- CJE : 50 unités/jour

**Calculs** :
```
Autonomie = 2500 / 50 = 50 jours
Statut = SÉCURISÉ (car Stock > Seuil ET Autonomie > 7 jours)
```

**Affichage** :
```
Temps Restant : 🟢 50j
Statut : 🟢 SÉCURISÉ
Tooltip : "Basé sur une consommation de 50 unités par jour"
```

**Actions Recommandées** :
1. ✅ Continuer la surveillance régulière
2. ✅ Planifier les commandes futures
3. ✅ Analyser les tendances de consommation

---

## 🔄 Cas d'Usage : Modification en Temps Réel

### Avant Modification
```
Article : Masques FFP2
Stock : 1000 unités
CJE : 200 unités/jour
Autonomie : 5 jours
Statut : 🟠 ATTENTION
```

### Utilisateur Reçoit une Livraison
```
Stock : 1000 + 5000 = 6000 unités
```

### Après Modification (Automatique)
```
Article : Masques FFP2
Stock : 6000 unités
CJE : 200 unités/jour
Autonomie : 30 jours
Statut : 🟢 SÉCURISÉ (mis à jour instantanément)
```

**Aucun rafraîchissement de page requis** - La mise à jour est instantanée !

---

## 📊 Tableau de Bord : Exemple Complet

### Résumés
```
🔴 Articles Critiques : 2
🟠 Articles en Attention : 3
🟢 Articles Sécurisés : 4
```

### Tableau des Articles Critiques
```
┌─────────────────────────────────────────────────────────────┐
│ Article              │ Stock │ Seuil │ Autonomie │ CJE      │
├─────────────────────────────────────────────────────────────┤
│ Gants Nitrile XL     │ 45    │ 200   │ 🔴 3j     │ 15/j     │
│ Gants Latex XL       │ 80    │ 300   │ 🔴 2j     │ 40/j     │
└─────────────────────────────────────────────────────────────┘
```

### Tableau des Articles en Attention
```
┌─────────────────────────────────────────────────────────────┐
│ Article              │ Stock │ Seuil │ Autonomie │ CJE      │
├─────────────────────────────────────────────────────────────┤
│ Sur-gants PE         │ 120   │ 500   │ 🟠 15j    │ 8/j      │
│ Gants Vinyle S       │ 250   │ 400   │ 🟠 5j     │ 50/j     │
│ Masques Chirurgicaux │ 500   │ 1000  │ 🟠 6j     │ 80/j     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Cas d'Usage : Ajout d'un Nouvel Article

### Étape 1 : Remplir le Formulaire
```
Référence : GL-M-007
Nom : Gants Latex M
Catégorie : Gants Latex
Emplacement : Zone B-05
Stock : 1500
Seuil : 300
Unité : Paire
CJE : 40 unités/jour
```

### Étape 2 : Validation Automatique
```
Autonomie = 1500 / 40 = 37.5 jours
Statut = SÉCURISÉ (37.5 > 7 jours)
```

### Étape 3 : Affichage dans le Tableau
```
Réf : GL-M-007
Article : Gants Latex M
Stock : 1500
Seuil : 300
Temps Restant : 🟢 37j 12h
Statut : 🟢 SÉCURISÉ
```

---

## 📈 Cas d'Usage : Analyse de Tendance

### Semaine 1
```
Article : Gants Nitrile M
CJE : 50 unités/jour
Autonomie : 50 jours
Statut : 🟢 SÉCURISÉ
```

### Semaine 2 (Augmentation de Consommation)
```
Article : Gants Nitrile M
CJE : 75 unités/jour (augmentation de 50%)
Autonomie : 33 jours (diminution automatique)
Statut : 🟢 SÉCURISÉ (toujours)
```

### Semaine 3 (Forte Augmentation)
```
Article : Gants Nitrile M
CJE : 150 unités/jour (augmentation de 100%)
Autonomie : 16 jours (diminution automatique)
Statut : 🟠 ATTENTION (changement automatique)
```

**Observation** : Le système détecte automatiquement les changements de consommation !

---

## 🔔 Cas d'Usage : Gestion des Alertes

### Matin (8h00)
```
Gants Nitrile XL : 🟢 SÉCURISÉ (10 jours)
```

### Midi (12h00) - Forte Consommation
```
Gants Nitrile XL : 🟠 ATTENTION (6 jours)
```

### Après-midi (16h00) - Consommation Continue
```
Gants Nitrile XL : 🔴 CRITIQUE (3 jours)
```

**Action** : L'équipe reçoit une alerte et passe une commande d'urgence

---

## 💡 Cas d'Usage : Optimisation des Seuils

### Situation Initiale
```
Article : Masques FFP2
CJE : 200 unités/jour
Délai de Livraison : 5 jours
Seuil Actuel : 500 unités
```

### Calcul du Seuil Optimal
```
Seuil Optimal = CJE × Délai × 1.5
Seuil Optimal = 200 × 5 × 1.5 = 1500 unités
```

### Mise à Jour
```
Ancien Seuil : 500 unités
Nouveau Seuil : 1500 unités
Résultat : Meilleure sécurité du stock
```

---

## 🚨 Cas d'Usage : Gestion de Crise

### Situation
```
Consommation Normale : 50 unités/jour
Consommation d'Urgence : 200 unités/jour (augmentation 4x)
Stock Disponible : 500 unités
```

### Calculs
```
Autonomie Normale : 500 / 50 = 10 jours
Autonomie d'Urgence : 500 / 200 = 2.5 jours
Statut : 🔴 CRITIQUE
```

### Actions
```
1. Passer une commande d'urgence immédiatement
2. Augmenter la CJE à 200 unités/jour
3. Surveiller le stock toutes les heures
4. Préparer un plan de secours
```

---

## 📱 Cas d'Usage : Consultation Mobile

### Vue Tableau de Bord
```
🔴 Critiques : 2
🟠 Attention : 3
🟢 Sécurisés : 4
```

### Vue Articles (Responsive)
```
Article : Gants Nitrile XL
Stock : 45
Autonomie : 🔴 3j
Statut : 🔴 CRITIQUE
```

**Note** : L'interface s'adapte automatiquement aux petits écrans

---

## 🔐 Cas d'Usage : Validation des Données

### Entrée Invalide
```
CJE : 0 unités/jour
Résultat : Autonomie = "N/A"
Statut : Pas de calcul
Message : "Veuillez entrer une CJE valide"
```

### Entrée Valide
```
CJE : 50 unités/jour
Résultat : Autonomie = "50j"
Statut : 🟢 SÉCURISÉ
```

---

## 📊 Cas d'Usage : Export de Données

### Données Exportées
```
Article,Stock,Seuil,CJE,Autonomie,Statut
Gants Nitrile M,2500,500,50,50j,SÉCURISÉ
Gants Nitrile XL,45,200,15,3j,CRITIQUE
Sur-gants PE,120,500,8,15j,ATTENTION
```

**Utilisation** : Analyse dans Excel, rapports, etc.

---

## 🎓 Cas d'Usage : Formation des Utilisateurs

### Scénario de Formation
```
1. Ajouter un article avec CJE
2. Observer le calcul d'autonomie
3. Modifier le stock et voir la mise à jour
4. Consulter le tableau de bord
5. Interpréter les statuts
```

### Résultats Attendus
```
✅ Utilisateur comprend le système
✅ Utilisateur peut ajouter des articles
✅ Utilisateur peut interpréter les statuts
✅ Utilisateur peut prendre des décisions
```

---

## 📝 Résumé des Cas d'Usage

| Cas d'Usage | Statut | Autonomie | Action |
|------------|--------|-----------|--------|
| Stock Critique | 🔴 | ≤ 3j | Commande urgente |
| Stock en Attention | 🟠 | 4-7j | Prévoir commande |
| Stock Sécurisé | 🟢 | > 7j | Surveillance |
| Modification Temps Réel | ✅ | Instantané | Mise à jour auto |
| Nouvel Article | ✅ | Calculé | Affichage immédiat |
| Augmentation Consommation | ✅ | Diminue | Alerte auto |

---

**Dernière mise à jour** : Février 2026
**Version** : 1.0

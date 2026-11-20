# Quick Start - Système de Gestion du Stock Prédictif

## 🚀 Démarrage Rapide (5 minutes)

### Étape 1 : Accéder à la Page Articles
```
1. Cliquez sur "Articles" dans le menu
2. Vous verrez la liste de tous les articles
```

### Étape 2 : Ajouter un Article
```
1. Cliquez sur le bouton "Ajouter" (en haut à droite)
2. Remplissez le formulaire :
   - Référence : GN-M-001
   - Nom : Gants Nitrile M
   - Catégorie : Gants Nitrile
   - Emplacement : Zone A-12
   - Stock : 2500
   - Seuil : 500
   - Unité : Paire
   - CJE : 50 unités/jour ← NOUVEAU !
3. Cliquez sur "Ajouter"
```

### Étape 3 : Consulter le Tableau de Bord
```
1. Cliquez sur "Tableau de Bord" dans le menu
2. Vous verrez :
   - 🔴 Articles Critiques : X
   - 🟠 Articles en Attention : X
   - 🟢 Articles Sécurisés : X
3. Consultez les tableaux détaillés
```

### Étape 4 : Interpréter les Statuts
```
🔴 CRITIQUE (Rouge)
   → Action urgente requise
   → Passer une commande d'urgence

🟠 ATTENTION (Orange)
   → Prévoir une commande
   → Surveiller la consommation

🟢 SÉCURISÉ (Vert)
   → Aucune action requise
   → Surveillance régulière
```

---

## 📊 Tableau Récapitulatif

| Élément | Description | Exemple |
|---------|-------------|---------|
| **CJE** | Consommation par jour | 50 unités/jour |
| **Autonomie** | Jours restants | 50 jours |
| **Statut** | État du stock | 🟢 SÉCURISÉ |
| **Seuil** | Minimum de sécurité | 500 unités |

---

## 🎯 Cas d'Usage Courants

### Cas 1 : Stock Critique
```
Stock : 45 unités
CJE : 15 unités/jour
Autonomie : 3 jours
Statut : 🔴 CRITIQUE

Action : Passer une commande d'urgence !
```

### Cas 2 : Stock en Attention
```
Stock : 500 unités
CJE : 50 unités/jour
Autonomie : 10 jours
Statut : 🟠 ATTENTION

Action : Prévoir une commande pour la semaine
```

### Cas 3 : Stock Sécurisé
```
Stock : 2500 unités
CJE : 50 unités/jour
Autonomie : 50 jours
Statut : 🟢 SÉCURISÉ

Action : Surveillance régulière
```

---

## 💡 Conseils Pratiques

### Déterminer la CJE
```
Méthode Simple :
CJE = Consommation du mois / 30 jours

Exemple :
Consommation du mois : 1500 paires
CJE = 1500 / 30 = 50 paires/jour
```

### Fixer le Seuil
```
Formule :
Seuil = CJE × Délai de livraison × 1.5

Exemple :
CJE : 50 unités/jour
Délai : 5 jours
Seuil = 50 × 5 × 1.5 = 375 unités
```

### Mettre à Jour la CJE
```
Fréquence : Mensuellement
Procédure :
1. Allez à "Articles"
2. Cliquez sur "Modifier"
3. Changez la CJE
4. Cliquez sur "Modifier"
5. Mise à jour instantanée !
```

---

## 🔄 Flux Quotidien

### Matin (8h00)
```
1. Consultez le Tableau de Bord
2. Vérifiez les articles critiques
3. Passez les commandes urgentes
```

### Midi (12h00)
```
1. Mettez à jour les stocks (entrées/sorties)
2. Vérifiez les changements de statut
3. Notifiez l'équipe si nécessaire
```

### Fin de journée (17h00)
```
1. Consultez le Tableau de Bord
2. Préparez les commandes pour demain
3. Documentez les changements
```

---

## ⚡ Raccourcis Clavier

| Action | Raccourci |
|--------|-----------|
| Ajouter un article | Alt + A |
| Modifier un article | Alt + E |
| Supprimer un article | Alt + D |
| Rechercher | Ctrl + F |
| Rafraîchir | F5 |

---

## 🎨 Légende des Couleurs

```
🔴 CRITIQUE (Rouge)
   Autonomie ≤ 3 jours OU Stock ≤ Seuil
   → Action urgente

🟠 ATTENTION (Orange)
   Autonomie 4-7 jours
   → Prévoir une action

🟢 SÉCURISÉ (Vert)
   Autonomie > 7 jours ET Stock > Seuil
   → Aucune action
```

---

## 📱 Accès Mobile

```
1. Ouvrez l'application sur votre téléphone
2. Allez à "Tableau de Bord"
3. Consultez les articles critiques
4. Passez les commandes si nécessaire
```

---

## 🆘 Dépannage Rapide

### Problème : Autonomie affiche "N/A"
```
Solution : Vérifiez que la CJE n'est pas 0
```

### Problème : Statut ne change pas
```
Solution : Rafraîchissez la page (F5)
```

### Problème : Données incorrectes
```
Solution : Vérifiez les valeurs saisies
```

---

## 📚 Documentation Complète

Pour plus de détails, consultez :
- **GUIDE_UTILISATION_STOCK_PREDICTIF.md** - Guide complet
- **EXEMPLES_UTILISATION.md** - Cas d'usage détaillés
- **FAQ_STOCK_PREDICTIF.md** - Questions fréquentes

---

## ✅ Checklist de Démarrage

- [ ] Accédez à la page Articles
- [ ] Consultez un article existant
- [ ] Notez la CJE et l'autonomie
- [ ] Allez au Tableau de Bord
- [ ] Consultez les résumés
- [ ] Identifiez les articles critiques
- [ ] Comprenez les statuts
- [ ] Pratiquez avec un nouvel article

---

## 🎓 Prochaines Étapes

1. **Apprendre** : Consultez le guide complet
2. **Pratiquer** : Ajoutez quelques articles
3. **Maîtriser** : Consultez le tableau de bord quotidiennement
4. **Optimiser** : Ajustez les CJE selon les données réelles

---

## 📞 Besoin d'Aide ?

1. Consultez cette page (Quick Start)
2. Consultez la FAQ
3. Consultez le guide complet
4. Contactez l'administrateur

---

**Bienvenue dans le Système de Gestion du Stock Prédictif !** 🎉

Vous êtes maintenant prêt à utiliser le système. Commencez par consulter le Tableau de Bord et explorez les fonctionnalités.

Bon travail ! 💪

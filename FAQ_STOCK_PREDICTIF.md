# FAQ - Système de Gestion du Stock Prédictif

## ❓ Questions Fréquemment Posées

### 1. Qu'est-ce que la Consommation Journalière Estimée (CJE) ?

**Q** : Comment définir la CJE ?

**R** : La CJE est le nombre d'unités consommées par jour pour un article. Vous pouvez la déterminer en :
- Divisant la consommation totale du mois par le nombre de jours
- Utilisant la moyenne des 3 derniers mois
- Basant sur les prévisions de commandes

**Exemple** : Si vous consommez 1500 paires de gants par mois (30 jours), la CJE = 1500 / 30 = 50 paires/jour

---

### 2. Comment l'Autonomie est-elle Calculée ?

**Q** : Quelle est la formule exacte ?

**R** : 
```
Autonomie (jours) = Stock Actuel / CJE
Autonomie (heures) = (Stock Actuel / CJE) × 24
```

**Exemple** : 
- Stock : 2500 paires
- CJE : 50 paires/jour
- Autonomie = 2500 / 50 = 50 jours

---

### 3. Quand un Article est-il Critique ?

**Q** : Quels sont les critères pour le statut CRITIQUE ?

**R** : Un article est CRITIQUE quand :
- **Stock ≤ Seuil de Sécurité** OU
- **Autonomie ≤ 3 jours**

L'un ou l'autre critère suffit pour déclencher l'alerte.

**Exemple** :
- Stock : 45 unités, Seuil : 200 unités → CRITIQUE (Stock ≤ Seuil)
- Stock : 2000 unités, CJE : 200/jour → CRITIQUE (Autonomie = 10 heures ≤ 3 jours)

---

### 4. Quelle est la Différence entre ATTENTION et SÉCURISÉ ?

**Q** : Comment distinguer les deux statuts ?

**R** :
| Statut | Autonomie | Stock | Action |
|--------|-----------|-------|--------|
| 🟠 ATTENTION | 4-7 jours | > Seuil | Prévoir commande |
| 🟢 SÉCURISÉ | > 7 jours | > Seuil | Surveillance |

**Exemple** :
- Autonomie 5 jours → 🟠 ATTENTION
- Autonomie 10 jours → 🟢 SÉCURISÉ

---

### 5. Comment Mettre à Jour la CJE ?

**Q** : À quelle fréquence dois-je mettre à jour la CJE ?

**R** : Recommandations :
- **Mensuellement** : Vérifiez et ajustez selon les données réelles
- **Trimestriellement** : Analysez les tendances
- **Immédiatement** : Si changement majeur de consommation

**Procédure** :
1. Allez à la page "Articles"
2. Cliquez sur "Modifier" pour l'article
3. Mettez à jour le champ "CJE"
4. Cliquez sur "Modifier"
5. La mise à jour est instantanée

---

### 6. Pourquoi le Statut Change-t-il Automatiquement ?

**Q** : Le statut se met-il à jour sans action de ma part ?

**R** : Oui ! Le statut est **dynamique** et se met à jour automatiquement quand :
- Vous modifiez le stock
- Vous modifiez la CJE
- Vous modifiez le seuil
- Le temps passe (autonomie diminue)

Aucun rafraîchissement de page requis.

---

### 7. Comment Fixer le Seuil de Sécurité ?

**Q** : Quelle est la meilleure valeur pour le seuil ?

**R** : Formule recommandée :
```
Seuil = CJE × Délai de Livraison × 1.5
```

**Exemple** :
- CJE : 50 unités/jour
- Délai de livraison : 5 jours
- Seuil = 50 × 5 × 1.5 = **375 unités**

Le facteur 1.5 ajoute une marge de sécurité.

---

### 8. Que Signifie "N/A" pour l'Autonomie ?

**Q** : Pourquoi l'autonomie affiche "N/A" ?

**R** : "N/A" s'affiche quand :
- La CJE est 0 ou vide
- La CJE n'est pas un nombre valide
- Le stock est 0 et la CJE est 0

**Solution** : Entrez une CJE valide (nombre positif)

---

### 9. Comment Interpréter les Couleurs ?

**Q** : Que signifient les couleurs ?

**R** :
- 🔴 **Rouge (CRITIQUE)** : Action urgente requise
- 🟠 **Orange (ATTENTION)** : Prévoir une action
- 🟢 **Vert (SÉCURISÉ)** : Aucune action requise

Les couleurs sont conformes à la charte Top Gloves.

---

### 10. Puis-je Modifier le Stock Directement ?

**Q** : Comment mettre à jour le stock ?

**R** : Vous pouvez mettre à jour le stock via :
1. **Page Articles** : Cliquez sur "Modifier" et changez le stock
2. **Page Mouvements** : Enregistrez une entrée ou sortie
3. **Page Inventaire** : Effectuez un inventaire physique

Chaque modification met à jour automatiquement l'autonomie et le statut.

---

### 11. Comment Consulter le Tableau de Bord ?

**Q** : Où voir les articles critiques ?

**R** : Allez à la page **"Tableau de Bord"** pour voir :
- Résumés avec compteurs par statut
- Tableaux détaillés pour chaque catégorie
- Articles critiques en priorité
- Articles en attention
- Articles sécurisés

---

### 12. Que Faire si un Article est Critique ?

**Q** : Quelles sont les actions recommandées ?

**R** : Pour un article CRITIQUE :
1. ✅ **Immédiatement** : Passer une commande d'urgence
2. ✅ **Vérifier** : Le stock physique
3. ✅ **Notifier** : L'équipe de la rupture imminente
4. ✅ **Réduire** : Temporairement la consommation si possible
5. ✅ **Surveiller** : Le stock toutes les heures

---

### 13. Comment Exporter les Données ?

**Q** : Puis-je exporter les articles en CSV ?

**R** : Actuellement, vous pouvez :
- Copier les données du tableau
- Utiliser les outils du navigateur (Imprimer en PDF)
- Prendre des captures d'écran

Une fonctionnalité d'export sera ajoutée dans les futures versions.

---

### 14. Que Faire si la CJE est Incorrecte ?

**Q** : Comment corriger une CJE mal estimée ?

**R** : 
1. Consultez l'historique de consommation
2. Calculez la moyenne réelle
3. Mettez à jour la CJE
4. Observez les changements d'autonomie et de statut
5. Ajustez si nécessaire

**Conseil** : Utilisez les données des 3 derniers mois pour une meilleure estimation.

---

### 15. Comment Fonctionne la Tooltip ?

**Q** : Que montre la tooltip du statut ?

**R** : Survolez le badge de statut pour voir :
```
"Basé sur une consommation de [X] unités par jour"
```

Cela vous rappelle la CJE utilisée pour le calcul.

---

### 16. Peut-on Modifier le Seuil de 3 Jours ?

**Q** : Puis-je changer le seuil d'autonomie critique ?

**R** : Actuellement, le seuil est fixé à 3 jours. Pour le modifier :
1. Contactez l'administrateur système
2. Modifiez `src/config/stock-thresholds.ts`
3. Changez `CRITICAL_AUTONOMY_HOURS: 72` (3 jours)

---

### 17. Comment Gérer les Articles Saisonniers ?

**Q** : Comment gérer les articles avec consommation variable ?

**R** : 
1. Mettez à jour la CJE selon la saison
2. Augmentez le seuil en haute saison
3. Diminuez le seuil en basse saison
4. Consultez le tableau de bord régulièrement

**Exemple** : Masques FFP2 : CJE 100/jour en hiver, 50/jour en été

---

### 18. Que Faire en Cas de Rupture de Stock ?

**Q** : Comment gérer une rupture de stock ?

**R** :
1. **Immédiatement** : Passer une commande d'urgence
2. **Notifier** : Les clients/équipes affectées
3. **Chercher** : Des fournisseurs alternatifs
4. **Analyser** : Pourquoi la rupture s'est produite
5. **Ajuster** : La CJE ou le seuil pour l'avenir

---

### 19. Comment Valider les Données ?

**Q** : Comment vérifier que les données sont correctes ?

**R** :
1. Effectuez un inventaire physique
2. Comparez avec le stock théorique
3. Corrigez les écarts
4. Mettez à jour la CJE si nécessaire
5. Consultez le tableau de bord

---

### 20. Où Trouver de l'Aide ?

**Q** : Où obtenir du support ?

**R** : Consultez :
1. **GUIDE_UTILISATION_STOCK_PREDICTIF.md** - Guide complet
2. **EXEMPLES_UTILISATION.md** - Cas d'usage pratiques
3. **ARCHITECTURE_STOCK_PREDICTIF.md** - Documentation technique
4. **Administrateur système** - Pour les problèmes techniques

---

## 🔧 Questions Techniques

### 21. Comment Fonctionne le Calcul en Temps Réel ?

**Q** : Comment les calculs sont-ils effectués ?

**R** : 
- Les calculs sont effectués en **frontend** (navigateur)
- Pas d'appel API requis
- Mise à jour **instantanée** lors de modifications
- Utilise React pour la réactivité

---

### 22. Quels Navigateurs sont Supportés ?

**Q** : Sur quels navigateurs fonctionne le système ?

**R** : 
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

### 23. Comment Contribuer aux Améliorations ?

**Q** : Comment proposer des améliorations ?

**R** : 
1. Contactez l'administrateur système
2. Décrivez l'amélioration souhaitée
3. Fournissez des exemples d'utilisation
4. Attendez la validation et l'implémentation

---

## 📊 Questions sur les Données

### 24. Comment Importer des Données Existantes ?

**Q** : Puis-je importer des articles existants ?

**R** : Actuellement, vous devez :
1. Ajouter les articles manuellement
2. Ou contacter l'administrateur pour une import en masse

Une fonctionnalité d'import sera ajoutée dans les futures versions.

---

### 25. Comment Sauvegarder les Données ?

**Q** : Les données sont-elles sauvegardées automatiquement ?

**R** : Oui, les données sont sauvegardées automatiquement dans :
- La base de données locale
- Le contexte React
- Le stockage du navigateur

Aucune action manuelle requise.

---

## 🎓 Questions de Formation

### 26. Comment Former les Utilisateurs ?

**Q** : Comment former mon équipe ?

**R** : 
1. Consultez le **GUIDE_UTILISATION_STOCK_PREDICTIF.md**
2. Montrez les **EXEMPLES_UTILISATION.md**
3. Pratiquez avec des articles test
4. Consultez le tableau de bord ensemble
5. Répondez aux questions

---

### 27. Combien de Temps pour Apprendre ?

**Q** : Combien de temps faut-il pour maîtriser le système ?

**R** : 
- **Basique** : 30 minutes
- **Intermédiaire** : 2 heures
- **Avancé** : 1 jour

La courbe d'apprentissage est douce et intuitive.

---

## 🚀 Questions sur les Évolutions

### 28. Quand Auront Lieu les Prochaines Mises à Jour ?

**Q** : Quand de nouvelles fonctionnalités seront-elles ajoutées ?

**R** : Les évolutions prévues incluent :
- Historique des consommations
- Graphiques de tendances
- Prévisions basées sur ML
- Alertes par email/SMS

Consultez le **CHANGELOG_STOCK_PREDICTIF.md** pour les détails.

---

### 29. Comment Signaler un Bug ?

**Q** : Comment signaler un problème ?

**R** :
1. Décrivez le problème en détail
2. Fournissez les étapes pour le reproduire
3. Incluez des captures d'écran si possible
4. Contactez l'administrateur système

---

### 30. Où Trouver la Documentation Complète ?

**Q** : Où est la documentation ?

**R** : Consultez les fichiers :
- **PREDICTIVE_STOCK_SYSTEM.md** - Vue d'ensemble
- **GUIDE_UTILISATION_STOCK_PREDICTIF.md** - Guide utilisateur
- **ARCHITECTURE_STOCK_PREDICTIF.md** - Documentation technique
- **EXEMPLES_UTILISATION.md** - Cas d'usage
- **FAQ_STOCK_PREDICTIF.md** - Ce fichier

---

## 📞 Support

Pour toute question non couverte par cette FAQ :
1. Consultez la documentation complète
2. Contactez l'administrateur système
3. Vérifiez les données saisies
4. Essayez de rafraîchir la page

---

**Dernière mise à jour** : Février 2026
**Version** : 1.0

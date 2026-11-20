# 🧪 Test du Scénario de Consommation Cumulative

## 🎯 Objectif
Vérifier que la consommation journalière fonctionne exactement comme demandé :
- Somme cumulative des sorties validées du jour
- Mise à jour instantanée lors de l'approbation
- Animation visuelle du badge
- Historique correct

## 📝 Scénario de Test Complet

### Étape 1 : État Initial
1. Lancer l'application : `npm run dev`
2. Aller sur la page **Articles**
3. Localiser l'article **Masques FFP2 (MK-FFP2-006)**

**Vérifications** :
- ✅ Stock actuel : **8000** unités
- ✅ Consommation / Jour : **250** (2 sorties validées aujourd'hui : 100 + 150)
- ✅ Badge orange avec icône flamme 🔥

### Étape 2 : Créer une Première Sortie
1. Aller sur la page **Mouvements**
2. Cliquer sur **+ Ajouter un mouvement**
3. Remplir le formulaire :
   - Type : **Sortie**
   - Article : **Masques FFP2**
   - Quantité : **250**
   - Emplacement Source : **Zone D - Rack 05**
   - Emplacement Destination : **Département Production**
   - Opérateur : **Jean D.**
4. Cliquer sur **Ajouter**

**Vérifications** :
- ✅ Le mouvement apparaît avec le statut **"En attente de validation Qualité"**
- ✅ Badge jaune avec icône horloge ⏳
- ✅ Retourner sur **Articles** → Stock reste à **8000** (pas encore déduit)
- ✅ Consommation / Jour reste à **250** (pas encore validé)

### Étape 3 : Valider la Première Sortie
1. Retourner sur la page **Mouvements**
2. Localiser le mouvement créé (en haut de la liste)
3. Cliquer sur le bouton **Approuver** (icône check vert)
4. Remplir le formulaire de contrôle qualité :
   - Contrôleur : **Marie L.**
   - État des articles : **Conforme**
5. Cliquer sur **Approuver**

**Vérifications** :
- ✅ Le statut passe à **"Terminé"**
- ✅ Badge vert avec icône check ✓
- ✅ Retourner sur **Articles** → Stock devient **7750** (8000 - 250)
- ✅ Consommation / Jour devient **500** (250 + 250) avec **animation orange** ✨
- ✅ Le badge s'agrandit brièvement (scale 110%) avec effet de surbrillance

### Étape 4 : Créer une Deuxième Sortie (Test Cumulatif)
1. Retourner sur la page **Mouvements**
2. Cliquer sur **+ Ajouter un mouvement**
3. Remplir le formulaire :
   - Type : **Sortie**
   - Article : **Masques FFP2**
   - Quantité : **100**
   - Emplacement Source : **Zone D - Rack 05**
   - Emplacement Destination : **Département Production**
   - Opérateur : **Sophie R.**
4. Cliquer sur **Ajouter**

**Vérifications** :
- ✅ Le mouvement apparaît avec le statut **"En attente de validation Qualité"**
- ✅ Retourner sur **Articles** → Stock reste à **7750** (pas encore déduit)
- ✅ Consommation / Jour reste à **500** (pas encore validé)

### Étape 5 : Valider la Deuxième Sortie (Vérification Cumulative)
1. Retourner sur la page **Mouvements**
2. Localiser le mouvement créé
3. Cliquer sur **Approuver**
4. Remplir le formulaire :
   - Contrôleur : **Marie L.**
   - État des articles : **Conforme**
5. Cliquer sur **Approuver**

**Vérifications CRITIQUES** :
- ✅ Le statut passe à **"Terminé"**
- ✅ Retourner sur **Articles** → Stock devient **7650** (7750 - 100)
- ✅ **Consommation / Jour devient 600** (500 + 100 = SOMME CUMULATIVE) ✨✨
- ✅ Le badge s'anime à nouveau avec effet de surbrillance orange
- ✅ L'icône flamme pulse brièvement

### Étape 6 : Vérifier l'Historique
1. Rester sur la page **Articles**
2. Scroller vers le bas jusqu'à la section **"📅 Historique des Consommations Journalières"**

**Vérifications** :
- ✅ Une ligne pour **Thu Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 600**
- ✅ La ligne a un **point orange** (indicateur "aujourd'hui")
- ✅ Le fond de la ligne est légèrement orange (bg-orange-50/50)
- ✅ Le badge du total est orange (pas bleu)

### Étape 7 : Test de Rejet (Optionnel)
1. Créer une nouvelle sortie de **50** masques
2. Au lieu d'approuver, cliquer sur **Rejeter**
3. Remplir la raison : **"Défaut de qualité"**
4. Cliquer sur **Rejeter**

**Vérifications** :
- ✅ Le statut passe à **"Rejeté"**
- ✅ Badge rouge avec icône X
- ✅ Retourner sur **Articles** → Stock reste à **7650** (pas déduit)
- ✅ Consommation / Jour reste à **600** (pas ajouté)

## 📊 Résultat Final Attendu

Après avoir suivi toutes les étapes :

```
┌──────────────────────────────────────────────────────────────────────┐
│ Articles - Masques FFP2                                              │
├──────────────────────────────────────────────────────────────────────┤
│ Stock : 7650                                                         │
│ Consommation / Jour : 🔥 600 (badge orange animé)                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 📅 Historique des Consommations Journalières                        │
├──────────────────────────────────────────────────────────────────────┤
│ • Thu Feb 26 2026 │ MK-FFP2-006 │ Masques FFP2  │ 🔥 600            │
│ • Thu Feb 26 2026 │ GN-M-001    │ Gants Nitrile │ 🔥 100            │
└──────────────────────────────────────────────────────────────────────┘
```

## 🔍 Points de Contrôle Détaillés

### Calcul Correct
- [ ] La consommation est la SOMME de toutes les sorties validées du jour
- [ ] Pas de duplication (chaque mouvement compté une seule fois)
- [ ] Les sorties en attente ne sont PAS comptées
- [ ] Les sorties rejetées ne sont PAS comptées
- [ ] Les entrées ne sont PAS comptées
- [ ] Les transferts ne sont PAS comptés

### Réactivité
- [ ] La consommation se met à jour INSTANTANÉMENT après validation
- [ ] Le badge s'anime lors du changement de valeur
- [ ] L'historique se met à jour automatiquement
- [ ] Pas besoin de rafraîchir la page

### Réinitialisation Automatique
- [ ] Si on change la date système au lendemain, la consommation repart de 0
- [ ] Les mouvements de la veille apparaissent dans l'historique mais pas dans "Consommation / Jour"

### Interface Utilisateur
- [ ] Badge orange avec flamme 🔥
- [ ] Animation de surbrillance (600ms)
- [ ] Tooltip explicatif au survol
- [ ] Historique trié par date décroissante
- [ ] Indicateur visuel pour "aujourd'hui" dans l'historique

## 🐛 Problèmes Potentiels et Solutions

### Problème : La consommation ne se met pas à jour
**Solution** : Vérifier que le mouvement a bien le statut "Terminé" et que la date correspond à aujourd'hui

### Problème : L'animation ne se déclenche pas
**Solution** : Vérifier que le composant `ConsumptionBadge` détecte bien le changement de valeur via `useEffect`

### Problème : L'historique affiche des doublons
**Solution** : Vérifier que la clé unique `${dateStr}|${m.ref}` est correctement utilisée

### Problème : Le stock ne diminue pas
**Solution** : Vérifier que la fonction `approveQualityControl` est bien appelée et qu'elle met à jour le stock

## ✅ Validation Finale

Si tous les points de contrôle sont validés :
- ✅ La logique de calcul est correcte (somme cumulative)
- ✅ La réactivité est instantanée (useMemo + dépendances)
- ✅ La réinitialisation est automatique (comparaison de dates)
- ✅ L'historique est fonctionnel (regroupement par date + article)
- ✅ L'interface est claire et animée

**🎉 Implémentation Réussie !**

---

## 📌 Notes Techniques

### Architecture
- **State Management** : Context API (`DataContext`)
- **Calcul Dynamique** : `useMemo` avec dépendance sur `mouvements`
- **Animation** : `useEffect` + CSS transitions
- **Performance** : Calculs optimisés avec Map/Record

### Flux de Données
```
Mouvement créé (Sortie)
  ↓
Statut: "En attente de validation Qualité"
  ↓
Validation (Approuver)
  ↓
Statut: "Terminé" + Stock déduit
  ↓
useMemo détecte le changement de mouvements
  ↓
Recalcul de dailyConsumptionMap
  ↓
Recalcul de consumptionHistory
  ↓
Re-render avec nouvelles valeurs
  ↓
Animation du badge (useEffect détecte le changement)
```

### Formules
- **Consommation du Jour** : `SUM(qte WHERE type='Sortie' AND statut='Terminé' AND date=today)`
- **Historique** : `GROUP BY date, ref THEN SUM(qte) ORDER BY date DESC`
- **Réinitialisation** : Automatique via `new Date().toDateString() !== movementDate`

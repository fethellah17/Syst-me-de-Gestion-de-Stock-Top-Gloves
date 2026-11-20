# Quick Start : Consommation / Jour

## 🚀 Démarrage Rapide

### Qu'est-ce que c'est ?

La colonne **"Consommation / Jour"** affiche la quantité totale d'articles sortis et validés **aujourd'hui**.

### Où la trouver ?

1. Allez à la page **Articles**
2. Regardez la colonne **"Consommation / Jour"** (avec l'icône 🔥)

### Comment ça fonctionne ?

```
Sortie créée → Contrôle Qualité → Approuvée → Consommation / Jour augmente ✨
```

## 📊 Exemple

### Scénario : Gants Nitrile M

**Matin (09:30)** :
- Sortie de 50 paires approuvée
- Consommation / Jour : `🔥 50`

**Midi (10:45)** :
- Sortie de 50 paires approuvée
- Consommation / Jour : `🔥 100` (badge brille ✨)

**Après-midi (14:00)** :
- Sortie de 75 paires approuvée
- Consommation / Jour : `🔥 175` (badge brille à nouveau ✨)

## 🎨 Feedback Visuel

### Badge Normal
```
🔥 100
```
Orange clair, normal

### Badge Pendant Approbation
```
🔥 175  ✨
```
Orange intense, brille pendant 600ms

## 🔍 Ce qui est Compté

✅ **Sorties validées** (statut "Terminé")
✅ **D'aujourd'hui** (même jour)
✅ **Tous les articles**

## ❌ Ce qui n'est PAS Compté

❌ Sorties en attente de validation
❌ Sorties rejetées
❌ Sorties d'hier ou d'avant
❌ Entrées
❌ Transferts

## 🧪 Test Rapide

1. Allez à **Mouvements**
2. Créez une nouvelle **Sortie** (ex: 50 Gants Nitrile M)
3. Cliquez sur **"Passer le contrôle qualité"**
4. Cliquez sur **"Approuver la Sortie"**
5. Retournez à **Articles**
6. Observez le badge briller ✨

## 💡 Cas d'Usage

### Pour le Directeur
- Voir d'un coup d'œil la consommation du jour
- Identifier les articles très consommés
- Prendre des décisions de réapprovisionnement

### Pour l'Opérateur
- Confirmer que les sorties sont bien comptabilisées
- Voir l'impact immédiat de chaque approbation

### Pour le Contrôleur Qualité
- Voir l'effet de chaque approbation
- Valider que le système fonctionne correctement

## ⚙️ Configuration

### Modifier la Durée de l'Animation

Éditer `src/styles/consumption-animation.css` :

```css
/* Changer 0.6s à une autre valeur (en secondes) */
animation: consumptionPulse 0.6s ease-in-out;
```

### Modifier la Couleur

Éditer `src/pages/ArticlesPage.tsx` :

```typescript
// Changer les couleurs orange
isHighlighted 
  ? "bg-orange-200 text-orange-900 border-orange-400 shadow-lg shadow-orange-400/50 scale-110" 
  : "bg-orange-100 text-orange-800 border-orange-200"
```

## 🐛 Dépannage

### Le badge ne brille pas
- Vérifiez que le mouvement a le statut "Terminé"
- Vérifiez que la date est d'aujourd'hui
- Vérifiez que le CSS est chargé

### La valeur ne se met pas à jour
- Rafraîchissez la page (F5)
- Vérifiez que le mouvement est bien approuvé
- Vérifiez la console pour les erreurs

### L'animation est trop rapide/lente
- Modifiez la durée dans `consumption-animation.css`
- Durée par défaut : 600ms

## 📚 Documentation Complète

- `CONSOMMATION_JOUR_FINAL.md` : Guide complet
- `CODE_CONSOMMATION_JOUR.md` : Code source détaillé
- `FEEDBACK_VISUEL_CONSOMMATION.md` : Animation expliquée

## ✅ Checklist

- ✅ Colonne "Consommation / Jour" visible
- ✅ Valeurs correctes affichées
- ✅ Badge brille lors de l'approbation
- ✅ Mise à jour instantanée
- ✅ Addition cumulée correcte

## 🎯 Résumé

| Aspect | Détail |
|--------|--------|
| **Affichage** | Colonne "Consommation / Jour" avec icône 🔥 |
| **Calcul** | Somme des sorties validées d'aujourd'hui |
| **Mise à jour** | Instantanée quand approuvé |
| **Animation** | Brille pendant 600ms |
| **Couleur** | Orange |
| **Tooltip** | "Total des sorties validées aujourd'hui" |

---

**Besoin d'aide ?** Consultez la documentation complète ou contactez l'équipe de développement.

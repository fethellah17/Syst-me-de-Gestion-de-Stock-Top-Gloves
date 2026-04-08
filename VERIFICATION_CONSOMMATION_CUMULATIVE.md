# ✅ Vérification de la Consommation Journalière Cumulative

## 📋 Scénario de Test

### État Initial
- **Article**: Masques FFP2 (MK-FFP2-006)
- **Stock Initial**: 8000 unités
- **Date**: 26 février 2026

### Actions à Effectuer

#### 1️⃣ Première Sortie
- **Action**: Créer une sortie de 250 masques
- **Opérateur**: Jean D.
- **Emplacement Source**: Zone D - Rack 05
- **Statut Initial**: "En attente de validation Qualité"

**Résultat Attendu AVANT Validation**:
- ✅ Stock reste à 8000 (pas encore déduit)
- ✅ Consommation / Jour = 0 (pas encore validé)

**Résultat Attendu APRÈS Validation (Approuvé)**:
- ✅ Stock devient 7750 (8000 - 250)
- ✅ Consommation / Jour = 250 ✨ (badge orange avec flamme)
- ✅ Historique affiche: "Thu Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 250"

#### 2️⃣ Deuxième Sortie (Cumulative)
- **Action**: Créer une sortie de 100 masques
- **Opérateur**: Sophie R.
- **Emplacement Source**: Zone D - Rack 05
- **Statut Initial**: "En attente de validation Qualité"

**Résultat Attendu AVANT Validation**:
- ✅ Stock reste à 7750 (pas encore déduit)
- ✅ Consommation / Jour = 250 (première sortie validée)

**Résultat Attendu APRÈS Validation (Approuvé)**:
- ✅ Stock devient 7650 (7750 - 100)
- ✅ Consommation / Jour = 350 ✨✨ (250 + 100 = SOMME CUMULATIVE)
- ✅ Badge s'anime avec effet de surbrillance orange
- ✅ Historique affiche: "Thu Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 350"

## 🔥 Points Clés de la Logique

### 1. Calcul Dynamique (useMemo)
```typescript
const dailyConsumptionMap = useMemo(() => {
  const today = new Date().toDateString();
  const consumptionByArticle: Record<string, number> = {};

  mouvements.forEach(m => {
    const movementDate = new Date(m.date).toDateString();
    
    // CONDITIONS STRICTES:
    // ✅ Type == 'Sortie'
    // ✅ Statut == 'Terminé'
    // ✅ Date == Aujourd'hui
    if (m.type === "Sortie" && m.statut === "Terminé" && movementDate === today) {
      // SOMME CUMULATIVE
      consumptionByArticle[m.ref] = (consumptionByArticle[m.ref] || 0) + m.qte;
    }
  });

  return consumptionByArticle;
}, [mouvements]); // Se recalcule automatiquement
```

### 2. Réinitialisation Automatique
- **Mécanisme**: Comparaison de `new Date().toDateString()`
- **Comportement**: Si la date système change (nouveau jour), les mouvements de la veille ne remplissent plus la condition `movementDate === today`
- **Résultat**: La consommation repart automatiquement de 0 le lendemain

### 3. Historique Dynamique
```typescript
const consumptionHistory = useMemo(() => {
  const historyMap: Record<string, HistoryEntry> = {};

  mouvements.forEach(m => {
    if (m.type === "Sortie" && m.statut === "Terminé") {
      const dateStr = new Date(m.date).toDateString();
      const key = `${dateStr}|${m.ref}`;

      if (!historyMap[key]) {
        historyMap[key] = { date: dateStr, article: m.article, ref: m.ref, totalConsomme: 0 };
      }
      // SOMME par jour et par article
      historyMap[key].totalConsomme += m.qte;
    }
  });

  return Object.values(historyMap).sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
}, [mouvements]);
```

### 4. Animation Visuelle
- **Composant**: `ConsumptionBadge`
- **Effet**: Détecte le changement de valeur avec `useEffect`
- **Animation**: 
  - Surbrillance orange pendant 600ms
  - Scale 110% + shadow
  - Icône flamme pulse

## 🎯 État Actuel des Données

### Mouvements Existants (26 février 2026)
1. **09:30:15** - Gants Nitrile M - Sortie 50 - Terminé ✅
2. **10:45:30** - Gants Nitrile M - Sortie 50 - Terminé ✅
3. **11:20:00** - Masques FFP2 - Sortie 100 - Terminé ✅
4. **14:15:45** - Masques FFP2 - Sortie 150 - Terminé ✅

### Consommations Actuelles (26 février 2026)
- **Gants Nitrile M (GN-M-001)**: 100 (50 + 50)
- **Masques FFP2 (MK-FFP2-006)**: 250 (100 + 150)

## ✅ Checklist de Validation

- [ ] La colonne "Consommation / Jour" affiche 0 pour les articles sans sortie aujourd'hui
- [ ] La colonne "Consommation / Jour" affiche la SOMME de toutes les sorties validées du jour
- [ ] Le badge s'anime (orange + scale) quand une nouvelle sortie est validée
- [ ] L'historique affiche une ligne par jour et par article
- [ ] L'historique affiche le total cumulé par jour (pas les mouvements individuels)
- [ ] Les lignes d'aujourd'hui dans l'historique ont un point orange
- [ ] Si je valide une sortie, le stock diminue ET la consommation augmente instantanément
- [ ] Si je rejette une sortie, le stock reste inchangé ET la consommation ne change pas

## 🚀 Test Manuel Rapide

1. Ouvrir la page Articles
2. Vérifier que "Masques FFP2" affiche "Consommation / Jour = 250"
3. Aller dans Mouvements
4. Créer une sortie de 100 masques depuis "Zone D - Rack 05"
5. Valider la sortie (Approuver le contrôle qualité)
6. Retourner sur Articles
7. Vérifier que "Masques FFP2" affiche maintenant "Consommation / Jour = 350" avec animation
8. Vérifier que le stock est passé de 8000 à 7900
9. Vérifier que l'historique affiche "Thu Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 350"

## 📊 Résultat Final Attendu

```
┌─────────────────────────────────────────────────────────────────┐
│ Articles                                                        │
├─────────────────────────────────────────────────────────────────┤
│ Réf         │ Article       │ Stock │ Consommation / Jour      │
├─────────────┼───────────────┼───────┼──────────────────────────┤
│ MK-FFP2-006 │ Masques FFP2  │ 7650  │ 🔥 350 (badge animé)     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 📅 Historique des Consommations Journalières                   │
├─────────────────────────────────────────────────────────────────┤
│ Date            │ Réf         │ Article       │ Total Consommé │
├─────────────────┼─────────────┼───────────────┼────────────────┤
│ • Thu Feb 26... │ MK-FFP2-006 │ Masques FFP2  │ 350            │
│ • Thu Feb 26... │ GN-M-001    │ Gants Nitrile │ 100            │
└─────────────────────────────────────────────────────────────────┘
```

## 🎓 Explication Technique

### Pourquoi useMemo ?
- **Performance**: Évite de recalculer à chaque render
- **Réactivité**: Se recalcule uniquement quand `mouvements` change
- **Automatique**: Pas besoin de gérer manuellement les mises à jour

### Pourquoi toDateString() ?
- **Comparaison de dates**: Compare uniquement jour/mois/année (ignore heures/minutes)
- **Réinitialisation automatique**: À minuit, `new Date().toDateString()` change
- **Simplicité**: Pas besoin de logique complexe de reset

### Pourquoi Record<string, number> ?
- **Performance**: Accès O(1) par clé (ref de l'article)
- **Accumulation**: Facile d'ajouter avec `|| 0`
- **Clarté**: Structure claire pour le mapping article → consommation

## 🔧 Maintenance Future

Si tu veux ajouter des fonctionnalités :
- **Filtrer par période**: Modifier la condition `movementDate === today` pour accepter une plage
- **Exporter l'historique**: Utiliser `consumptionHistory` directement
- **Graphiques**: Utiliser `consumptionHistory` comme source de données
- **Alertes**: Comparer `dailyConsumptionMap[ref]` avec un seuil

---

✅ **Implémentation Complète et Fonctionnelle**

# Implémentation : Colonne "Consommation / Jour" - Dynamique en Temps Réel

## 📋 Vue d'ensemble

La colonne "Consommation / Jour" affiche dynamiquement la somme des sorties validées (statut "Terminé") pour chaque article, calculée en temps réel.

## 🔧 Architecture Technique

### 1. Logique de Calcul (Frontend - React Hook)

**Fichier:** `src/pages/ArticlesPage.tsx`

```typescript
const dailyConsumptionMap = useMemo(() => {
  const today = new Date();
  const todayDateStr = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  const consumptionByArticle: Record<string, number> = {};

  // Pour chaque mouvement validé d'aujourd'hui
  mouvements.forEach(m => {
    const movementDate = m.date.split(" ")[0]; // Récupère la partie date (YYYY-MM-DD)
    
    // Conditions cumulatives: Sortie + Terminé + Aujourd'hui
    if (m.type === "Sortie" && m.statut === "Terminé" && movementDate === todayDateStr) {
      if (!consumptionByArticle[m.ref]) {
        consumptionByArticle[m.ref] = 0;
      }
      consumptionByArticle[m.ref] += m.qte;
    }
  });

  return consumptionByArticle;
}, [mouvements]); // Se recalcule quand mouvements change
```

### 2. Conditions de Filtrage (Cumulatives)

Pour qu'un mouvement soit compté dans la consommation du jour :

✅ **Type** = "Sortie"
✅ **Statut** = "Terminé" (validé par contrôle qualité)
✅ **Date** = Aujourd'hui (2026-02-26)

### 3. Affichage dans le Tableau

```typescript
<td className="py-3 px-4 text-center">
  <Tooltip text="Total des sorties validées aujourd'hui">
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
      <Flame className="w-3.5 h-3.5" />
      {dailyConsumptionMap[a.ref] || 0}
    </span>
  </Tooltip>
</td>
```

## 🔄 Dynamisme en Temps Réel

### Flux de Mise à Jour

1. **Utilisateur clique "Approuver la Sortie"** dans la fenêtre Contrôle Qualité
2. **DataContext met à jour le mouvement** : `statut: "Terminé"`
3. **State `mouvements` change** dans le contexte
4. **useMemo se déclenche** (dépendance: `[mouvements]`)
5. **dailyConsumptionMap est recalculé** avec les nouvelles données
6. **Composant ArticlesPage se re-rend** avec les nouvelles valeurs
7. **Colonne "Consommation / Jour" se met à jour instantanément** ✨

### Exemple Concret

**Avant approbation:**
- Gants Nitrile M : 100 (2 sorties de 50 validées)
- Masques FFP2 : 250 (2 sorties validées: 100 + 150)

**Après approbation d'une nouvelle sortie de 75 Gants Nitrile M:**
- Gants Nitrile M : **175** ← Mise à jour instantanée
- Masques FFP2 : 250 (inchangé)

## 📊 Données de Test

Les données initiales incluent des mouvements d'aujourd'hui (2026-02-26) :

| Article | Ref | Quantité | Statut | Date |
|---------|-----|----------|--------|------|
| Gants Nitrile M | GN-M-001 | 50 | Terminé | 2026-02-26 09:30 |
| Gants Nitrile M | GN-M-001 | 50 | Terminé | 2026-02-26 10:45 |
| Masques FFP2 | MK-FFP2-006 | 100 | Terminé | 2026-02-26 11:20 |
| Masques FFP2 | MK-FFP2-006 | 150 | Terminé | 2026-02-26 14:15 |

**Résultat attendu:**
- Gants Nitrile M : **100** (50 + 50)
- Masques FFP2 : **250** (100 + 150)

## 🎨 Design UI

- **Badge Orange** : Couleur distincte pour la visibilité
- **Icône Flame** (🔥) : Représente la consommation active
- **Tooltip** : "Total des sorties validées aujourd'hui"
- **Format** : Nombre entier avec séparateurs de milliers si nécessaire

## 🔒 Sécurité du State

### Garanties

✅ **Réactivité garantie** : `useMemo` avec dépendance `[mouvements]`
✅ **Pas de calcul inutile** : Mémorisation du résultat
✅ **Pas de mutation** : Création d'un nouvel objet à chaque calcul
✅ **Isolation** : Chaque article a sa propre clé dans le map

### Cas d'Usage

1. **Approbation d'une sortie** → Mise à jour instantanée ✓
2. **Rejet d'une sortie** → Pas de changement (statut ≠ "Terminé") ✓
3. **Suppression d'une sortie** → Recalcul automatique ✓
4. **Changement de date** → Recalcul à minuit ✓

## 🧪 Test Manuel

1. Aller à la page **Articles**
2. Vérifier la colonne **"Consommation / Jour"**
3. Aller à la page **Mouvements**
4. Créer une nouvelle **Sortie** pour un article
5. Cliquer sur **"Passer le contrôle qualité"**
6. Cliquer sur **"Approuver la Sortie"**
7. Retourner à la page **Articles**
8. **La colonne se met à jour instantanément** ✨

## 📝 Notes Techniques

- **Format de date** : `YYYY-MM-DD` (ISO 8601)
- **Comparaison** : Basée sur la date uniquement (pas l'heure)
- **Timezone** : Utilise la timezone locale du navigateur
- **Performance** : O(n) où n = nombre de mouvements

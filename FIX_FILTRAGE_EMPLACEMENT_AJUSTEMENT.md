# Correction - Filtrage Intelligent des Emplacements (Ajustement)

## 🐛 Problème Identifié

Le dropdown "Emplacement" dans le formulaire d'ajustement affichait **tous les emplacements de l'entrepôt**, ce qui était une erreur de logique métier.

### Problèmes
1. ❌ Liste globale non filtrée par article
2. ❌ Possibilité de sélectionner un emplacement sans rapport avec l'article
3. ❌ Pas de dépendance entre "Article" et "Emplacement"
4. ❌ Dropdown actif même sans article sélectionné

---

## ✅ Solution Implémentée

### 1. Filtrage Basé sur l'Article Sélectionné

Le dropdown d'emplacement est maintenant **dépendant de l'article sélectionné** et utilise uniquement `article.locations` au lieu de la liste globale `emplacements`.

#### Pour Manquant (Retirer)
```typescript
// Affiche UNIQUEMENT les emplacements où l'article existe avec stock > 0
articleLocations.map((loc, idx) => (
  <option key={idx} value={loc.emplacementNom}>
    {loc.emplacementNom} - {loc.quantite.toLocaleString()} {selectedArticle.unite}
  </option>
))
```

#### Pour Surplus (Ajouter)
```typescript
// Privilégie les emplacements existants de l'article
articleLocations.length > 0 ? (
  <>
    {/* Emplacements existants en priorité */}
    {articleLocations.map((loc, idx) => (
      <option key={`existing-${idx}`} value={loc.emplacementNom}>
        {loc.emplacementNom} - {loc.quantite} (Existant)
      </option>
    ))}
    <option disabled>──────────</option>
    {/* Nouveaux emplacements possibles */}
    {emplacements
      .filter(e => !articleLocations.some(loc => loc.emplacementNom === e.nom))
      .map(e => (
        <option key={`new-${e.id}`} value={e.nom}>
          {e.nom} - Nouvel emplacement
        </option>
      ))}
  </>
) : (
  // Si l'article n'a pas encore d'emplacement
  emplacements.map(e => (
    <option key={e.id} value={e.nom}>
      {e.nom} ({e.code})
    </option>
  ))
)
```

---

### 2. Dropdown Désactivé Sans Article

```typescript
<select
  value={formData.emplacementSource}
  onChange={(e) => setFormData({ ...formData, emplacementSource: e.target.value })}
  disabled={!selectedArticle}  // ← Désactivé si pas d'article
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  <option value="">
    {!selectedArticle 
      ? "Veuillez d'abord choisir un article"  // ← Message clair
      : "Sélectionner un emplacement"}
  </option>
  ...
</select>
```

---

### 3. Textes d'Aide Contextuels

Les messages d'aide s'adaptent à la situation :

#### Sans Article Sélectionné
```
"Sélectionnez d'abord un article pour voir les emplacements disponibles."
```

#### Surplus avec Emplacements Existants
```
"Choisir l'emplacement où ajouter le stock trouvé. 
Les emplacements existants sont privilégiés."
```

#### Surplus sans Emplacements Existants
```
"Choisir l'emplacement où ajouter le stock trouvé."
```

#### Manquant avec Stock Disponible
```
"Choisir l'emplacement où le stock est manquant. 
Stock disponible : 1,500 paires"
```

#### Manquant sans Stock
```
"Cet article n'a pas de stock dans aucun emplacement."
```

---

### 4. Validations Renforcées

```typescript
if (formData.type === "Ajustement") {
  // 1. Vérifier qu'un article est sélectionné
  if (!selectedArticle) {
    setToast({ message: "Veuillez d'abord sélectionner un article", type: "error" });
    return;
  }
  
  // 2. Vérifier qu'un emplacement est sélectionné
  if (!formData.emplacementSource) {
    setToast({ message: "Veuillez sélectionner un emplacement", type: "error" });
    return;
  }
  
  // 3. Pour Manquant : vérifier que l'article a du stock
  if (formData.typeAjustement === "Manquant") {
    if (articleLocations.length === 0) {
      setToast({ message: "Cet article n'a pas de stock dans aucun emplacement", type: "error" });
      return;
    }
    if (formData.qte > sourceStockAvailable) {
      setToast({ message: `La quantité dépasse le stock disponible. Disponible: ${sourceStockAvailable}`, type: "error" });
      return;
    }
  }
}
```

---

## 📊 Comparaison Avant/Après

### ❌ AVANT : Liste Globale Non Filtrée

```
Article: Gants Nitrile M
Emplacement: [Dropdown]
  ├─ Zone A - Rack 12  ← Article existe ici ✓
  ├─ Zone B - Rack 03  ← Article existe ici ✓
  ├─ Zone C - Rack 01  ← Article N'existe PAS ici ✗
  ├─ Zone D - Rack 05  ← Article N'existe PAS ici ✗
  └─ Zone E - Quarantaine  ← Article N'existe PAS ici ✗

❌ Problème : Peut sélectionner un emplacement sans l'article !
```

### ✅ APRÈS : Liste Filtrée par Article

#### Manquant (Retirer)
```
Article: Gants Nitrile M
Emplacement Source: [Dropdown]
  ├─ Zone A - Rack 12 - 1,500 paires  ← Seulement où l'article existe
  └─ Zone B - Rack 03 - 1,000 paires  ← Seulement où l'article existe

✅ Impossible de sélectionner un emplacement sans l'article !
```

#### Surplus (Ajouter)
```
Article: Gants Nitrile M
Emplacement de Destination: [Dropdown]
  ├─ Zone A - Rack 12 - 1,500 paires (Existant)  ← Priorité
  ├─ Zone B - Rack 03 - 1,000 paires (Existant)  ← Priorité
  ├─ ──────────
  ├─ Zone C - Rack 01 - Nouvel emplacement  ← Possible
  ├─ Zone D - Rack 05 - Nouvel emplacement  ← Possible
  └─ Zone E - Quarantaine - Nouvel emplacement  ← Possible

✅ Emplacements existants en priorité, nouveaux possibles !
```

---

## 🎯 Logique Métier Corrigée

### Règles Implémentées

| Type | Règle | Filtrage |
|------|-------|----------|
| **Manquant** | Retirer du stock existant | Uniquement emplacements avec `article.locations` et `quantite > 0` |
| **Surplus** | Ajouter au stock | Priorité aux emplacements existants, puis nouveaux emplacements possibles |

### Dépendances

```
Article Sélectionné
    ↓
    ├─ articleLocations calculé
    ↓
Dropdown Emplacement Activé
    ↓
    ├─ Manquant → Filtré par articleLocations
    └─ Surplus → Priorité articleLocations + nouveaux possibles
```

---

## 🔒 Sécurité et Cohérence

### Avant
- ⚠️ Risque de sélectionner un emplacement incorrect
- ⚠️ Pas de validation de l'existence de l'article
- ⚠️ Confusion possible pour l'utilisateur

### Après
- ✅ Impossible de sélectionner un emplacement sans l'article (Manquant)
- ✅ Validation stricte de l'existence du stock
- ✅ Interface claire et guidée
- ✅ Emplacements existants privilégiés (Surplus)

---

## 📝 Messages d'Erreur Améliorés

### Nouveaux Messages
1. "Veuillez d'abord sélectionner un article"
2. "Cet article n'a pas de stock dans aucun emplacement"
3. "Aucun emplacement avec stock disponible" (dans le dropdown)

### Messages Existants Conservés
1. "Veuillez sélectionner un emplacement"
2. "La quantité dépasse le stock disponible dans cette zone. Disponible: X"

---

## ✅ Tests et Validation

### Build
```bash
npm run build
✓ built in 7.61s
```

### Diagnostics TypeScript
```
src/pages/MouvementsPage.tsx: No diagnostics found
```

### Scénarios de Test

#### Test 1 : Sans Article
1. Ouvrir formulaire Ajustement
2. Ne pas sélectionner d'article
3. ✅ Dropdown emplacement désactivé
4. ✅ Message : "Veuillez d'abord choisir un article"

#### Test 2 : Manquant avec Stock
1. Sélectionner article avec stock
2. Choisir "Manquant"
3. ✅ Dropdown affiche uniquement emplacements avec stock
4. ✅ Quantités affichées

#### Test 3 : Manquant sans Stock
1. Sélectionner article sans stock
2. Choisir "Manquant"
3. ✅ Dropdown affiche "Aucun emplacement avec stock disponible"
4. ✅ Message d'aide approprié

#### Test 4 : Surplus avec Emplacements Existants
1. Sélectionner article avec emplacements
2. Choisir "Surplus"
3. ✅ Emplacements existants en haut (marqués "Existant")
4. ✅ Séparateur visuel
5. ✅ Nouveaux emplacements en bas (marqués "Nouvel emplacement")

#### Test 5 : Surplus sans Emplacements Existants
1. Sélectionner article sans emplacement
2. Choisir "Surplus"
3. ✅ Tous les emplacements disponibles
4. ✅ Pas de séparateur

---

## 🎯 Objectifs Atteints

✅ Filtrage intelligent basé sur l'article sélectionné
✅ Dropdown désactivé sans article
✅ Impossible de sélectionner un emplacement incorrect
✅ Emplacements existants privilégiés pour Surplus
✅ Validation stricte pour Manquant
✅ Messages d'aide contextuels et clairs
✅ Cohérence avec la logique métier

---

## 📚 Documentation Mise à Jour

Cette correction améliore significativement la cohérence et la sécurité du module d'ajustement d'inventaire en s'assurant que les emplacements proposés sont toujours pertinents pour l'article sélectionné.

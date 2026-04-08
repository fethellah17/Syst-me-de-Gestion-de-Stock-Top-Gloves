# Correction Interface de Sortie - Emplacement Source Dynamique

## Résumé des modifications

L'interface de Sortie a été corrigée pour gérer correctement les articles présents dans plusieurs emplacements. Le système sait maintenant exactement d'où provient la marchandise.

## Modifications apportées

### 1. Réactivation de 'Emplacement Source' (Dynamique)

**Avant :** Les sorties n'avaient pas de sélection d'emplacement source.

**Après :** 
- Dès que l'utilisateur sélectionne un Article pour une Sortie, un champ de sélection (Dropdown) nommé **'Choisir l'Emplacement Source'** s'affiche
- Ce menu déroulant liste **uniquement les emplacements où cet article possède du stock**
- À côté de chaque emplacement, la **quantité disponible est affichée** (ex: Zone D - 5000 unités)

```typescript
{/* Sortie: Emplacement Source (Dynamique) */}
{formData.type === "Sortie" && selectedArticle && (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">
      Choisir l'Emplacement Source
    </label>
    <select
      value={formData.emplacementSource}
      onChange={(e) => setFormData({ ...formData, emplacementSource: e.target.value })}
      className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <option value="">Sélectionner un emplacement</option>
      {articleLocations.map((loc, idx) => (
        <option key={idx} value={loc.emplacementNom}>
          {loc.emplacementNom} - {loc.quantite.toLocaleString()} {selectedArticle.unite}
        </option>
      ))}
    </select>
```

### 2. Affichage du Stock Local

Une fois que l'utilisateur a choisi un emplacement source, le message suivant s'affiche clairement :

**"Stock disponible dans cette zone : [Quantité] unités"**

```typescript
{formData.emplacementSource && (
  <p className="text-xs text-muted-foreground mt-1">
    Stock disponible dans cette zone : {sourceStockAvailable.toLocaleString()} {selectedArticle.unite}
  </p>
)}
```

### 3. Validation de Quantité

L'enregistrement est maintenant bloqué si la quantité saisie dépasse le stock disponible **dans l'emplacement source sélectionné** (et non pas le stock total de l'article).

Message d'erreur affiché :
**"La quantité dépasse le stock disponible dans cette zone. Disponible: [Quantité]"**

```typescript
if (formData.type === "Sortie") {
  if (!formData.emplacementSource) {
    setToast({ message: "Veuillez sélectionner un emplacement source", type: "error" });
    return;
  }
  if (!formData.emplacementDestination) {
    setToast({ message: "Veuillez sélectionner une destination/utilisation", type: "error" });
    return;
  }
  // Valider que la quantité ne dépasse pas le stock disponible dans l'emplacement source
  if (formData.qte > sourceStockAvailable) {
    setToast({ message: `La quantité dépasse le stock disponible dans cette zone. Disponible: ${sourceStockAvailable}`, type: "error" });
    return;
  }
}
```

### 4. Logique de Calcul (Enregistrement)

Lors du clic sur 'Enregistrer' (après validation qualité) :

- ✅ La quantité est déduite **uniquement de l'Emplacement Source choisi**
- ✅ La barre d'Occupation de cet emplacement spécifique est mise à jour dynamiquement dans la page Emplacements
- ✅ Le stock total de l'article est mis à jour dans la page Articles

Cette logique est déjà implémentée dans la fonction `approveQualityControl` du DataContext :

```typescript
const approveQualityControl = (id: number, controleur: string, etatArticles: "Conforme" | "Non-conforme", unitesDefectueuses: number = 0) => {
  const mouvement = mouvements.find(m => m.id === id);
  if (!mouvement || mouvement.type !== "Sortie") return;

  // Mettre à jour le mouvement avec le statut "Terminé"
  setMouvements(mouvements.map(m => 
    m.id === id 
      ? { 
          ...m, 
          statut: "Terminé" as const,
          controleur,
          etatArticles,
          unitesDefectueuses
        }
      : m
  ));

  // Déduire le stock maintenant que le contrôle est approuvé
  const article = articles.find(a => a.ref === mouvement.ref);
  if (article && mouvement.emplacementSource) {
    const updatedLocations = article.locations.map(loc => {
      if (loc.emplacementNom === mouvement.emplacementSource) {
        return { ...loc, quantite: Math.max(0, loc.quantite - mouvement.qte) };
      }
      return loc;
    }).filter(l => l.quantite > 0);
    
    updateArticle(article.id, { 
      stock: Math.max(0, article.stock - mouvement.qte),
      locations: updatedLocations 
    });
    
    // Mettre à jour l'occupation de l'emplacement source
    const sourceEmplacement = emplacements.find(e => e.nom === mouvement.emplacementSource);
    if (sourceEmplacement) {
      const newOccupancy = articles
        .reduce((sum, a) => {
          const loc = a.locations.find(l => l.emplacementNom === mouvement.emplacementSource);
          return sum + (loc?.quantite || 0);
        }, 0) - mouvement.qte;
      
      updateEmplacement(sourceEmplacement.id, { occupe: Math.max(0, newOccupancy) });
    }
  }
};
```

## Flux utilisateur (Logique)

1. **Choisir l'article** → Affiche les emplacements disponibles
2. **Choisir d'où il sort** → Affiche le stock disponible dans cette zone
3. **Saisir la quantité** → Valide contre le stock de l'emplacement source

## Fichiers modifiés

- `src/pages/MouvementsPage.tsx` : Ajout du dropdown d'emplacement source pour les sorties + validation

## Fichiers existants (inchangés mais importants)

- `src/contexts/DataContext.tsx` : Contient la logique `approveQualityControl` qui déduit le stock de l'emplacement source
- `src/pages/EmplacementsPage.tsx` : Affiche les occupations mises à jour
- `src/pages/ArticlesPage.tsx` : Affiche les stocks mis à jour

## Résultat

✅ L'interface de Sortie gère maintenant correctement les articles multi-emplacements
✅ Le système sait exactement d'où provient la marchandise
✅ Les validations empêchent les erreurs de stock
✅ Les mises à jour sont cohérentes et traçables

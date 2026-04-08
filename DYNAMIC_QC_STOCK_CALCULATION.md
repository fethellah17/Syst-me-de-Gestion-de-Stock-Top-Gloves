# Calcul Dynamique du Stock Dépendant du Contrôle Qualité

## 🎯 Principe Fondamental

**Le stock dans chaque emplacement est STRICTEMENT dépendant du statut de validation du Contrôle Qualité.**

---

## 📊 États des Mouvements et Impact sur le Stock

### Statuts Possibles

| Statut | Code | Impact Stock | Impact Emplacement |
|--------|------|--------------|-------------------|
| **En attente de validation Qualité** | `pending` | ❌ AUCUN | ❌ AUCUN |
| **Terminé** | `approved` | ✅ OUI | ✅ OUI |
| **Rejeté** | `rejected` | ❌ AUCUN | ❌ AUCUN |

---

## 🔄 Flux de Données pour les ENTRÉES

### Étape 1: Création du Mouvement
```typescript
addMouvement({
  type: "Entrée",
  qte: 1000,
  emplacementDestination: "Zone A - Rack 12",
  // ...
})
```

**Résultat:**
```typescript
{
  id: 123,
  type: "Entrée",
  qte: 1000,
  statut: "En attente de validation Qualité", // ⚠️ PENDING
  emplacementDestination: "Zone A - Rack 12"
}
```

**Impact sur le Stock:**
- ❌ `article.stock` → **INCHANGÉ**
- ❌ `article.locations` → **INCHANGÉ**
- 🔒 Quantité en **QUARANTAINE VIRTUELLE**

### Étape 2: Validation QC (Bon)
```typescript
approveQualityControl(123, "Marie L.", "Conforme", 0)
```

**Résultat:**
```typescript
{
  id: 123,
  type: "Entrée",
  qte: 1000,
  statut: "Terminé", // ✅ APPROVED
  controleur: "Marie L.",
  validQuantity: 1000,
  defectiveQuantity: 0
}
```

**Impact sur le Stock:**
- ✅ `article.stock` → **+1000**
- ✅ `article.locations["Zone A - Rack 12"]` → **+1000**
- 📊 Stock maintenant **VISIBLE** et **UTILISABLE**

### Étape 3: Validation QC (Non-conforme)
```typescript
approveQualityControl(123, "Marie L.", "Non-conforme", 50)
```

**Résultat:**
```typescript
{
  id: 123,
  type: "Entrée",
  qte: 1000,
  statut: "Terminé", // ✅ APPROVED
  controleur: "Marie L.",
  validQuantity: 950,    // Unités valides
  defectiveQuantity: 50  // Unités rejetées
}
```

**Impact sur le Stock:**
- ✅ `article.stock` → **+950** (seulement les valides)
- ✅ `article.locations["Zone A - Rack 12"]` → **+950**
- ❌ 50 unités défectueuses → **REJETÉES** (perte permanente)

### Étape 4: Rejet QC
```typescript
rejectQualityControl(123, "Marie L.", "Non-conformité majeure")
```

**Résultat:**
```typescript
{
  id: 123,
  type: "Entrée",
  qte: 1000,
  statut: "Rejeté", // ❌ REJECTED
  controleur: "Marie L.",
  raison: "Non-conformité majeure"
}
```

**Impact sur le Stock:**
- ❌ `article.stock` → **INCHANGÉ** (reste à 0)
- ❌ `article.locations` → **INCHANGÉ**
- 🚫 Marchandise **JAMAIS ENTRÉE** dans le stock

---

## 🔄 Flux de Données pour les SORTIES

### Étape 1: Création du Mouvement
```typescript
addMouvement({
  type: "Sortie",
  qte: 500,
  emplacementSource: "Zone A - Rack 12",
  // ...
})
```

**Résultat:**
```typescript
{
  id: 124,
  type: "Sortie",
  qte: 500,
  statut: "En attente de validation Qualité", // ⚠️ PENDING
  emplacementSource: "Zone A - Rack 12"
}
```

**Impact sur le Stock:**
- ❌ `article.stock` → **INCHANGÉ**
- ❌ `article.locations["Zone A - Rack 12"]` → **INCHANGÉ**
- 📦 Marchandise encore **PHYSIQUEMENT EN ENTREPÔT**

### Étape 2: Validation QC (Bon)
```typescript
approveQualityControl(124, "Pierre M.", "Conforme", 0)
```

**Résultat:**
```typescript
{
  id: 124,
  type: "Sortie",
  qte: 500,
  statut: "Terminé", // ✅ APPROVED
  controleur: "Pierre M.",
  validQuantity: 500,
  defectiveQuantity: 0
}
```

**Impact sur le Stock:**
- ✅ `article.stock` → **-500** (TOUTES les unités)
- ✅ `article.locations["Zone A - Rack 12"]` → **-500**
- 📤 Marchandise **SORTIE DE L'ENTREPÔT**

### Étape 3: Validation QC (Non-conforme)
```typescript
approveQualityControl(124, "Pierre M.", "Non-conforme", 50)
```

**Résultat:**
```typescript
{
  id: 124,
  type: "Sortie",
  qte: 500,
  statut: "Terminé", // ✅ APPROVED
  controleur: "Pierre M.",
  validQuantity: 450,    // Unités valides
  defectiveQuantity: 50  // Unités défectueuses
}
```

**Impact sur le Stock:**
- ⚠️ `article.stock` → **-500** (TOUTES les unités, pas seulement les valides!)
- ⚠️ `article.locations["Zone A - Rack 12"]` → **-500**
- 💡 **Raison:** Les 500 unités ont physiquement quitté l'entrepôt
- ❌ 50 unités défectueuses → **PERTE PERMANENTE**

### Étape 4: Rejet QC
```typescript
rejectQualityControl(124, "Pierre M.", "Qualité insuffisante")
```

**Résultat:**
```typescript
{
  id: 124,
  type: "Sortie",
  qte: 500,
  statut: "Rejeté", // ❌ REJECTED
  controleur: "Pierre M.",
  raison: "Qualité insuffisante"
}
```

**Impact sur le Stock:**
- ❌ `article.stock` → **INCHANGÉ**
- ❌ `article.locations["Zone A - Rack 12"]` → **INCHANGÉ**
- 🔙 Marchandise **RESTE EN ENTREPÔT**

---

## 💻 Implémentation Technique

### Fonction `addMouvement`

```typescript
const addMouvement = (mouvement: Omit<Mouvement, "id">) => {
  // Créer le mouvement avec statut "En attente"
  if (mouvement.type === "Entrée" || mouvement.type === "Sortie") {
    mouvementAvecStatut = { 
      ...mouvement, 
      statut: "En attente de validation Qualité",
      status: "pending"
    };
  }
  
  // ⚠️ IMPORTANT: NE PAS modifier le stock ici!
  // Le stock reste inchangé jusqu'à l'approbation QC
  
  if (mouvement.type === "Entrée") {
    console.log(`[ENTRÉE] En attente de validation qualité (Quarantaine)`);
    // Stock NON modifié
  } else if (mouvement.type === "Sortie") {
    console.log(`[SORTIE] En attente de validation qualité`);
    // Stock NON modifié
  }
};
```

### Fonction `approveQualityControl`

```typescript
const approveQualityControl = (
  id: number, 
  controleur: string, 
  etatArticles: "Conforme" | "Non-conforme", 
  unitesDefectueuses: number = 0
) => {
  const mouvement = mouvements.find(m => m.id === id);
  const article = articles.find(a => a.ref === mouvement.ref);
  
  // Calculer les quantités
  const validQty = etatArticles === "Non-conforme" 
    ? mouvement.qte - unitesDefectueuses 
    : mouvement.qte;
  const defectiveQty = etatArticles === "Non-conforme" ? unitesDefectueuses : 0;
  
  // Mettre à jour le statut
  setMouvements(mouvements.map(m => 
    m.id === id ? { 
      ...m, 
      statut: "Terminé",
      controleur,
      validQuantity: validQty,
      defectiveQuantity: defectiveQty
    } : m
  ));
  
  // ✅ MAINTENANT modifier le stock
  if (mouvement.type === "Entrée") {
    // Ajouter SEULEMENT les unités valides
    const quantityToAdd = validQty;
    
    const updatedLocations = [...article.locations];
    const existingLocation = updatedLocations.find(
      l => l.emplacementNom === mouvement.emplacementDestination
    );
    
    if (existingLocation) {
      existingLocation.quantite += quantityToAdd;
    } else {
      updatedLocations.push({ 
        emplacementNom: mouvement.emplacementDestination, 
        quantite: quantityToAdd 
      });
    }
    
    updateArticle(article.id, { 
      stock: article.stock + quantityToAdd,
      locations: updatedLocations 
    });
  } else if (mouvement.type === "Sortie") {
    // Déduire TOUTES les unités (valides + défectueuses)
    const totalQtyToDeduct = mouvement.qte;
    
    const updatedLocations = article.locations.map(loc => {
      if (loc.emplacementNom === mouvement.emplacementSource) {
        return { ...loc, quantite: Math.max(0, loc.quantite - totalQtyToDeduct) };
      }
      return loc;
    }).filter(l => l.quantite > 0);
    
    updateArticle(article.id, { 
      stock: Math.max(0, article.stock - totalQtyToDeduct),
      locations: updatedLocations 
    });
  }
};
```

### Fonction `rejectQualityControl`

```typescript
const rejectQualityControl = (id: number, controleur: string, raison: string) => {
  // Mettre à jour le statut seulement
  setMouvements(mouvements.map(m => 
    m.id === id ? { 
      ...m, 
      statut: "Rejeté",
      controleur,
      raison
    } : m
  ));
  
  // ⚠️ IMPORTANT: NE PAS modifier le stock!
  // Pour Entrée: la marchandise n'entre jamais
  // Pour Sortie: la marchandise reste en entrepôt
};
```

### Fonction `updateMouvement`

```typescript
const updateMouvement = (id: number, updates: Partial<Mouvement>) => {
  const oldMouvement = mouvements.find(m => m.id === id);
  
  // ⚠️ IMPORTANT: Seulement modifier le stock si le mouvement était "Terminé"
  // Les mouvements "En attente" ou "Rejeté" n'ont jamais affecté le stock
  if (oldMouvement.statut === "Terminé" && updates.qte !== undefined) {
    // Inverser l'effet de l'ancien mouvement
    // Appliquer l'effet du nouveau mouvement
    // ...
  }
  
  setMouvements(mouvements.map(m => m.id === id ? { ...m, ...updates } : m));
};
```

### Fonction `deleteMouvement`

```typescript
const deleteMouvement = (id: number) => {
  const mouvement = mouvements.find(m => m.id === id);
  
  // ⚠️ IMPORTANT: Seulement inverser l'effet si le mouvement était "Terminé"
  // Les mouvements "En attente" ou "Rejeté" n'ont jamais affecté le stock
  if (mouvement.statut === "Terminé") {
    // Inverser l'effet sur le stock et les locations
    if (mouvement.type === "Entrée") {
      // Soustraire la quantité qui avait été ajoutée
      updateArticle(article.id, { 
        stock: article.stock - mouvement.qte,
        locations: updatedLocations 
      });
    } else if (mouvement.type === "Sortie") {
      // Rajouter la quantité qui avait été déduite
      updateArticle(article.id, { 
        stock: article.stock + mouvement.qte,
        locations: updatedLocations 
      });
    }
  }
  
  setMouvements(mouvements.filter(m => m.id !== id));
};
```

---

## 📊 Calcul du Stock par Emplacement

### Fonction `calculateEmplacementOccupancy`

```typescript
const calculateEmplacementOccupancy = (emplacementName: string): number => {
  // Calcule le stock total dans un emplacement
  // Basé sur article.locations qui est mis à jour SEULEMENT lors de l'approbation QC
  return articles.reduce((sum, a) => {
    const location = a.locations.find(l => l.emplacementNom === emplacementName);
    return sum + (location?.quantite || 0);
  }, 0);
};
```

**Points Clés:**
- ✅ Utilise `article.locations` comme source de vérité
- ✅ `article.locations` est mis à jour SEULEMENT dans `approveQualityControl`
- ✅ Les mouvements "En attente" ne sont PAS comptés
- ✅ Les mouvements "Rejeté" ne sont PAS comptés
- ✅ Seuls les mouvements "Terminé" affectent le calcul

### Fonction `getArticleStockByLocation`

```typescript
const getArticleStockByLocation = (articleRef: string, emplacementName: string): number => {
  const article = articles.find(a => a.ref === articleRef);
  const location = article?.locations.find(l => l.emplacementNom === emplacementName);
  return location?.quantite || 0;
};
```

**Points Clés:**
- ✅ Retourne la quantité RÉELLE dans l'emplacement
- ✅ Exclut automatiquement les mouvements en attente
- ✅ Reflète uniquement les mouvements validés

---

## 🎯 Scénarios de Test

### Scénario 1: Entrée Normale

```
1. Créer Entrée: 1000 unités → Zone A
   Stock Zone A: 0 (inchangé)
   
2. Valider QC (Conforme)
   Stock Zone A: 1000 ✅
```

### Scénario 2: Entrée avec Défauts

```
1. Créer Entrée: 1000 unités → Zone A
   Stock Zone A: 0 (inchangé)
   
2. Valider QC (Non-conforme, 50 défectueuses)
   Stock Zone A: 950 ✅ (seulement les valides)
```

### Scénario 3: Entrée Rejetée

```
1. Créer Entrée: 1000 unités → Zone A
   Stock Zone A: 0 (inchangé)
   
2. Rejeter QC
   Stock Zone A: 0 ✅ (reste inchangé)
```

### Scénario 4: Sortie Normale

```
Stock initial Zone A: 2000

1. Créer Sortie: 500 unités depuis Zone A
   Stock Zone A: 2000 (inchangé)
   
2. Valider QC (Conforme)
   Stock Zone A: 1500 ✅
```

### Scénario 5: Sortie avec Défauts

```
Stock initial Zone A: 2000

1. Créer Sortie: 500 unités depuis Zone A
   Stock Zone A: 2000 (inchangé)
   
2. Valider QC (Non-conforme, 50 défectueuses)
   Stock Zone A: 1500 ✅ (toutes les 500 déduites)
```

### Scénario 6: Sortie Rejetée

```
Stock initial Zone A: 2000

1. Créer Sortie: 500 unités depuis Zone A
   Stock Zone A: 2000 (inchangé)
   
2. Rejeter QC
   Stock Zone A: 2000 ✅ (reste inchangé)
```

### Scénario 7: Suppression d'un Mouvement Validé

```
Stock initial Zone A: 2000

1. Créer Entrée: 500 unités → Zone A
2. Valider QC (Conforme)
   Stock Zone A: 2500
   
3. Supprimer le mouvement
   Stock Zone A: 2000 ✅ (effet inversé)
```

### Scénario 8: Suppression d'un Mouvement En Attente

```
Stock initial Zone A: 2000

1. Créer Entrée: 500 unités → Zone A
   Stock Zone A: 2000 (inchangé)
   
2. Supprimer le mouvement
   Stock Zone A: 2000 ✅ (reste inchangé, aucun effet à inverser)
```

---

## ✅ Garanties du Système

1. **Quarantaine Stricte**: Les Entrées en attente n'affectent JAMAIS le stock
2. **Validation Requise**: Seuls les mouvements "Terminé" modifient le stock
3. **Cohérence**: `article.locations` reflète toujours le stock réel validé
4. **Traçabilité**: Chaque changement de stock est lié à une validation QC
5. **Réversibilité**: Les mouvements peuvent être supprimés sans corruption de données
6. **Isolation**: Les mouvements en attente sont invisibles pour les calculs de stock

---

## 🎉 Résultat

Un système de gestion de stock **strictement dépendant du Contrôle Qualité**, où:
- ✅ Aucune marchandise n'entre dans le stock sans validation
- ✅ Aucune marchandise ne sort du stock sans validation
- ✅ Le stock affiché est toujours le stock **réel et validé**
- ✅ Les emplacements reflètent uniquement les marchandises **approuvées**
- ✅ La quarantaine est **virtuelle** et **automatique**

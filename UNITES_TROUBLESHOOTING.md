# Guide de Dépannage - Unités de Mesure

## Problème : Le bouton "Ajouter" ne fonctionne pas

### Solutions vérifiées ✅

1. **Input Binding** : L'input est correctement lié à l'état React
   ```tsx
   value={newUnit}
   onChange={(e) => setNewUnit(e.target.value)}
   ```

2. **Form Submit** : Le bouton est dans un `<form>` avec `onSubmit={handleAddUnit}`
   ```tsx
   <form onSubmit={handleAddUnit}>
     <button type="submit">Ajouter</button>
   </form>
   ```

3. **Event Prevention** : `e.preventDefault()` empêche le rechargement de la page

4. **State Update** : Après ajout, l'état est mis à jour avec `loadUnits()`

5. **Input Clear** : L'input est vidé avec `setNewUnit("")`

6. **LocalStorage** : Les données sont sauvegardées dans localStorage

### Comment vérifier que ça fonctionne

1. **Ouvrir la console du navigateur** (F12)
2. **Aller dans "Unités de Mesure"**
3. **Taper "Test" dans l'input**
4. **Cliquer sur "Ajouter"**
5. **Vérifier les logs dans la console** :
   ```
   Attempting to add unit: Test
   addUnit - current units: [...]
   addUnit - adding unit: Test
   addUnit - updated units: [...]
   addUnit - saved to localStorage
   Add unit result: true
   Loaded units: [...]
   ```
6. **Vérifier le toast** : Un message vert "Unité 'Test' ajoutée avec succès" doit apparaître
7. **Vérifier la table** : "Test" doit apparaître dans la liste
8. **Vérifier localStorage** :
   - Onglet "Application" > "Local Storage"
   - Clé `topgloves_units`
   - Doit contenir `["Paire","Unité","Boîte","Kg","Litre","Pièce","Test"]`

## Problème : Le bouton de suppression ne fonctionne pas

### Solutions vérifiées ✅

1. **Click Handler** : Chaque bouton a un `onClick={() => handleDeleteUnit(unit)}`

2. **Confirmation** : Une boîte de dialogue de confirmation s'affiche

3. **State Update** : Après suppression, l'état est mis à jour avec `loadUnits()`

4. **LocalStorage** : Les données sont mises à jour dans localStorage

### Comment vérifier que ça fonctionne

1. **Cliquer sur l'icône poubelle** à côté d'une unité
2. **Confirmer** dans la boîte de dialogue
3. **Vérifier les logs dans la console** :
   ```
   Attempting to delete unit: Test
   deleteUnit - current units: [...]
   deleteUnit - deleting unit: Test
   deleteUnit - updated units: [...]
   deleteUnit - saved to localStorage
   Delete unit result: true
   Loaded units: [...]
   ```
4. **Vérifier le toast** : Un message vert "Unité 'Test' supprimée avec succès" doit apparaître
5. **Vérifier la table** : "Test" doit disparaître de la liste

## Problème : Les unités ne persistent pas après rafraîchissement

### Solution

Vérifier que localStorage fonctionne :
1. Ouvrir la console
2. Taper : `localStorage.getItem('topgloves_units')`
3. Doit retourner : `"[\"Paire\",\"Unité\",\"Boîte\",\"Kg\",\"Litre\",\"Pièce\"]"`

Si localStorage ne fonctionne pas :
- Vérifier que le navigateur autorise localStorage
- Vérifier que vous n'êtes pas en mode navigation privée
- Vider le cache et réessayer

## Problème : Impossible d'ajouter une unité

### Causes possibles

1. **Unité vide** : Vous essayez d'ajouter une unité vide
   - Solution : Entrer du texte dans l'input

2. **Doublon** : L'unité existe déjà (insensible à la casse)
   - Solution : Vérifier la liste des unités existantes
   - Exemple : "kg" et "Kg" sont considérés comme identiques

3. **Erreur localStorage** : Le navigateur bloque localStorage
   - Solution : Vérifier les paramètres du navigateur

## Problème : Impossible de supprimer une unité

### Cause

Protection contre la suppression de la dernière unité.

### Solution

Vous devez toujours avoir au moins une unité dans le système. Ajoutez d'abord une nouvelle unité avant de supprimer la dernière.

## Problème : Les unités n'apparaissent pas dans le formulaire d'article

### Solution

1. **Rafraîchir la page** : Les unités sont chargées au montage du composant
2. **Ouvrir/fermer le modal** : Les unités sont rechargées à chaque ouverture
3. **Vérifier localStorage** : Les unités doivent être présentes dans localStorage

## Commandes de débogage utiles

### Dans la console du navigateur

```javascript
// Voir toutes les unités
JSON.parse(localStorage.getItem('topgloves_units'))

// Ajouter une unité manuellement
let units = JSON.parse(localStorage.getItem('topgloves_units'))
units.push('Nouvelle Unité')
localStorage.setItem('topgloves_units', JSON.stringify(units))

// Réinitialiser aux valeurs par défaut
localStorage.setItem('topgloves_units', JSON.stringify(['Paire', 'Unité', 'Boîte', 'Kg', 'Litre', 'Pièce']))

// Supprimer toutes les unités (puis rafraîchir pour réinitialiser)
localStorage.removeItem('topgloves_units')
```

## Support

Si le problème persiste :
1. Vérifier les logs de la console
2. Vérifier l'onglet "Network" pour les erreurs
3. Vérifier l'onglet "Application" > "Local Storage"
4. Essayer en mode navigation privée
5. Essayer dans un autre navigateur

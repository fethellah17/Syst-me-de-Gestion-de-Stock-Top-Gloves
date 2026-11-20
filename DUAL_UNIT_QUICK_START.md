# Guide Rapide - Système de Double Unité

## Configuration d'un article avec double unité

### Étape 1 : Aller dans "Articles"
Cliquez sur le bouton "Ajouter" pour créer un nouvel article.

### Étape 2 : Remplir les informations de base
- **Référence** : Code unique (ex: MAT-001)
- **Nom** : Nom de l'article (ex: Poudre de Nitrile)
- **Catégorie** : Sélectionner dans la liste

### Étape 3 : Configurer les unités

#### Unité d'Entrée (Achat)
- Sélectionner l'unité utilisée lors des achats
- Exemples : Tonne, Carton, Boîte, Palette

#### Unité de Sortie (Consommation)
- Sélectionner l'unité utilisée lors des consommations
- Exemples : Kg, Unité, Paire, Litre

#### Facteur de Conversion
- Entrer le nombre d'unités de sortie dans 1 unité d'entrée
- Le système affiche automatiquement : "1 [Entrée] = X [Sortie]"

### Exemples de configuration

#### Exemple 1 : Matière première
```
Unité d'Entrée: Tonne
Unité de Sortie: Kg
Facteur: 1000
→ 1 Tonne = 1000 Kg
```

#### Exemple 2 : Gants en boîtes
```
Unité d'Entrée: Boîte
Unité de Sortie: Paire
Facteur: 100
→ 1 Boîte = 100 Paires
```

#### Exemple 3 : Masques en cartons
```
Unité d'Entrée: Carton
Unité de Sortie: Unité
Facteur: 1000
→ 1 Carton = 1000 Unités
```

#### Exemple 4 : Sans conversion
```
Unité d'Entrée: Paire
Unité de Sortie: Paire
Facteur: 1
→ 1 Paire = 1 Paire
```

## Utilisation quotidienne

### Lors d'une réception (Entrée)
1. Créer un mouvement "Entrée"
2. Saisir la quantité en **unité d'entrée**
   - Ex: 5 Tonnes
3. Le système convertit automatiquement
   - Stock += 5000 Kg

### Lors d'une consommation (Sortie)
1. Créer un mouvement "Sortie"
2. Saisir la quantité en **unité de sortie**
   - Ex: 250 Kg
3. Le stock est directement déduit
   - Stock -= 250 Kg

### Lecture du stock
Le stock est toujours affiché en **unité de sortie** (la plus petite).

Dans le tableau des articles, vous verrez :
```
Entrée: Tonne
Sortie: Kg
1:1000
Stock: 4750 Kg
```

Pour connaître le stock en unité d'entrée :
- 4750 Kg ÷ 1000 = 4.75 Tonnes

## Cas d'usage typiques

### Cas 1 : Achat en gros, consommation en détail
**Problème** : J'achète des gants par boîtes de 100, mais je consomme à la paire.

**Solution** :
- Unité d'Entrée: Boîte
- Unité de Sortie: Paire
- Facteur: 100

**Résultat** :
- Réception de 50 boîtes → Stock = 5000 paires
- Consommation de 75 paires → Stock = 4925 paires
- Stock restant = 49.25 boîtes

### Cas 2 : Matières premières industrielles
**Problème** : J'achète de la poudre par tonnes, mais je consomme en kg.

**Solution** :
- Unité d'Entrée: Tonne
- Unité de Sortie: Kg
- Facteur: 1000

**Résultat** :
- Réception de 3 tonnes → Stock = 3000 kg
- Consommation de 125 kg → Stock = 2875 kg
- Stock restant = 2.875 tonnes

### Cas 3 : Produits sans conversion
**Problème** : J'achète et consomme dans la même unité.

**Solution** :
- Unité d'Entrée: Paire
- Unité de Sortie: Paire
- Facteur: 1

**Résultat** :
- Réception de 100 paires → Stock = 100 paires
- Consommation de 15 paires → Stock = 85 paires
- Pas de conversion nécessaire

## Avantages

✅ **Précision** : Le stock est toujours exact en unité de sortie
✅ **Automatique** : Conversion automatique lors des entrées
✅ **Flexible** : Supporte tous types d'unités
✅ **Clair** : Affichage des deux unités dans le tableau
✅ **Simple** : Pas de calcul manuel nécessaire

## Questions fréquentes

### Q: Puis-je changer le facteur de conversion après création ?
**R:** Oui, mais cela n'affecte que les nouveaux mouvements. Le stock existant reste inchangé.

### Q: Que se passe-t-il si je mets un facteur de 1 ?
**R:** Les deux unités sont identiques, pas de conversion. C'est parfait pour les articles sans conversion.

### Q: Puis-je utiliser des décimales dans le facteur ?
**R:** Oui ! Par exemple, 0.001 pour convertir mg → g.

### Q: Le stock est affiché dans quelle unité ?
**R:** Toujours en unité de sortie (la plus petite) pour plus de précision.

### Q: Comment voir le stock en unité d'entrée ?
**R:** Divisez le stock affiché par le facteur de conversion.
   - Exemple : 2500 Kg ÷ 1000 = 2.5 Tonnes

### Q: Dois-je créer les unités avant ?
**R:** Oui, allez dans "Unités de Mesure" pour créer vos unités personnalisées.

## Checklist de configuration

Avant de créer un article avec double unité :

- [ ] Les unités sont créées dans "Unités de Mesure"
- [ ] J'ai identifié l'unité d'achat (entrée)
- [ ] J'ai identifié l'unité de consommation (sortie)
- [ ] J'ai calculé le facteur de conversion
- [ ] J'ai vérifié le calcul : 1 [Entrée] = X [Sortie]
- [ ] J'ai testé avec un exemple de calcul

## Support

Si vous avez des questions :
1. Consultez la documentation complète : `DUAL_UNIT_SYSTEM_IMPLEMENTATION.md`
2. Testez avec un article de démonstration
3. Vérifiez les exemples de configuration ci-dessus

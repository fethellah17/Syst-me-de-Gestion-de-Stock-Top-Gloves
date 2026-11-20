# Guide d'Utilisation - Ajustement d'Inventaire (Bi-directionnel)

## Vue d'ensemble

La fonctionnalité **Ajustement d'Inventaire** permet de gérer les écarts d'inventaire de manière bi-directionnelle sans passer par le processus de contrôle qualité. Cette fonctionnalité est conçue pour refléter rapidement la réalité du terrain lors de situations comme :

### Surplus (Ajouter au stock)
- Articles trouvés lors d'un inventaire physique
- Erreur de comptage en moins
- Marchandise non enregistrée précédemment

### Manquant (Retirer du stock)
- Casse de marchandise
- Perte d'articles
- Vol ou détérioration
- Erreur de comptage en plus
- Autres écarts physiques négatifs

## Caractéristiques Principales

### 1. Ajustement Bi-directionnel
L'ajustement peut maintenant :
- ✅ **Ajouter du stock** (Surplus) : Comme une entrée sans fournisseur
- ✅ **Retirer du stock** (Manquant) : Comme une sortie sans destination

### 2. Bypass du Contrôle Qualité
Contrairement aux sorties classiques qui nécessitent une validation qualité, les ajustements d'inventaire :
- ✅ Sont **automatiquement approuvés** dès la soumission
- ✅ Mettent à jour le **stock immédiatement**
- ✅ Ont le statut **"Terminé"** dès leur création
- ✅ Ne nécessitent **aucune validation** supplémentaire

### 3. Traçabilité Complète
Chaque ajustement est enregistré avec :
- Date et heure précises
- Article concerné
- Type d'ajustement (Surplus ou Manquant)
- Quantité ajustée
- Emplacement concerné
- Opérateur responsable
- Motif de l'ajustement (optionnel)

## Comment Utiliser

### Étape 1 : Créer un Ajustement

1. Cliquez sur **"Nouveau Mouvement"** dans la page Mouvements
2. Sélectionnez l'**article** concerné
3. Choisissez le type **"Ajustement"** (bouton violet)

### Étape 2 : Choisir le Type d'Ajustement

**Deux options disponibles :**

#### Option A : Surplus (Ajouter au stock)
- Bouton vert avec "+"
- Utilisé quand vous trouvez plus de stock que prévu
- Ajoute la quantité au stock de l'emplacement sélectionné

#### Option B : Manquant (Retirer du stock)
- Bouton rouge avec "-"
- Utilisé quand il manque du stock
- Retire la quantité du stock de l'emplacement sélectionné

### Étape 3 : Remplir les Informations

**Champs obligatoires :**
- **Article** : Sélectionnez l'article à ajuster
- **Type d'Ajustement** : Surplus ou Manquant
- **Quantité** : Indiquez la quantité à ajouter ou retirer
- **Emplacement** : 
  - Pour Surplus : **"Emplacement de Destination"** - Choisissez où ajouter le stock trouvé
  - Pour Manquant : **"Emplacement Source"** - Choisissez où le stock est manquant
- **Opérateur** : Nom de la personne effectuant l'ajustement

**Champ optionnel :**
- **Motif** : Raison de l'écart
  - Surplus : "Inventaire réel", "Erreur de comptage"
  - Manquant : "Casse", "Perte", "Vol", "Erreur de comptage"

**Textes d'aide dynamiques :**
- Surplus : "Choisir l'emplacement où ajouter le stock trouvé."
- Manquant : "Choisir l'emplacement où le stock est manquant. Stock disponible : X unités"

### Étape 4 : Validation

Un message d'avertissement s'affiche pour confirmer que :
> ⚠️ Ajustement d'Inventaire - Bypass du Contrôle Qualité
> Le stock sera mis à jour immédiatement sans validation qualité.

Cliquez sur **"Enregistrer"** pour finaliser l'ajustement.

## Validation et Contrôles

Le système effectue automatiquement les vérifications suivantes :

### Pour les Surplus
1. **Emplacement valide** : Un emplacement doit être sélectionné
2. **Mise à jour immédiate** : Le stock est ajouté instantanément
3. **Recalcul des occupations** : Les capacités des emplacements sont recalculées

### Pour les Manquants
1. **Vérification du stock disponible** : La quantité ne peut pas dépasser le stock présent dans l'emplacement
2. **Mise à jour immédiate** : Le stock est déduit instantanément
3. **Recalcul des occupations** : Les capacités des emplacements sont recalculées

## Affichage dans l'Interface

### Badge de Type
Les ajustements sont identifiés par :
- **Icône** : 📝 (FileEdit)
- **Couleur** : Violet (bg-purple-100 text-purple-800)
- **Label** : 
  - "Ajustement (+)" pour un surplus
  - "Ajustement (-)" pour un manquant

### Badge de Statut
- **Statut** : "Terminé" (vert)
- **Icône** : ✓ (CheckCircle2)

### Détails
Le label affiche :
```
Surplus ajouté - [Emplacement] - [Motif]
ou
Manquant retiré - [Emplacement] - [Motif]
```

## Exemples d'Utilisation

### Exemple 1 : Surplus trouvé lors d'un inventaire
```
Article : Gants Nitrile M
Type d'Ajustement : Surplus (Ajouter)
Quantité : 100
Emplacement : Zone A - Rack 12
Motif : Inventaire réel supérieur au stock théorique
Opérateur : Marie L.
```
**Résultat** : +100 unités ajoutées au stock

### Exemple 2 : Casse de Marchandise
```
Article : Masques FFP2
Type d'Ajustement : Manquant (Retirer)
Quantité : 50
Emplacement : Zone D - Rack 05
Motif : Casse lors de la manutention
Opérateur : Jean D.
```
**Résultat** : -50 unités retirées du stock

### Exemple 3 : Erreur de comptage (en moins)
```
Article : Gants Latex S
Type d'Ajustement : Surplus (Ajouter)
Quantité : 25
Emplacement : Zone A - Rack 12
Motif : Erreur de comptage - stock réel supérieur
Opérateur : Pierre M.
```
**Résultat** : +25 unités ajoutées au stock

## Différences avec les Mouvements Classiques

| Caractéristique | Entrée | Sortie | Ajustement Surplus | Ajustement Manquant |
|----------------|--------|--------|-------------------|---------------------|
| Validation Qualité | Non | ✅ Obligatoire | ❌ Bypass | ❌ Bypass |
| Statut initial | Terminé | En attente | Terminé | Terminé |
| Mise à jour stock | Immédiate | Après validation | Immédiate | Immédiate |
| Fournisseur/Destination | Oui | Oui | Non | Non |
| Motif | Non | Non | Oui (optionnel) | Oui (optionnel) |
| Direction | Ajoute | Retire | Ajoute | Retire |

## Filtrage

Les ajustements peuvent être filtrés dans la page Mouvements :
- Utilisez le filtre **"Ajustement"** pour voir uniquement les ajustements (+ et -)
- Utilisez le filtre **"Tous"** pour voir tous les types de mouvements

## Bonnes Pratiques

1. **Toujours renseigner le motif** : Même si optionnel, le motif aide à la traçabilité
2. **Vérifier le type d'ajustement** : Assurez-vous de choisir Surplus ou Manquant correctement
3. **Vérifier le stock disponible** : Pour les manquants, assurez-vous que la quantité est correcte
4. **Documenter les écarts importants** : Pour les ajustements significatifs, ajoutez un commentaire détaillé
5. **Utiliser avec parcimonie** : Les ajustements doivent rester exceptionnels

## Impact sur le Système

### Ajustement Surplus
1. **Mise à jour du stock article** : Addition immédiate de la quantité
2. **Mise à jour des locations** : Ajout de la quantité dans l'emplacement
3. **Recalcul des occupations** : Mise à jour de l'occupation de l'emplacement
4. **Enregistrement dans l'historique** : Traçabilité complète du mouvement

### Ajustement Manquant
1. **Mise à jour du stock article** : Déduction immédiate de la quantité
2. **Mise à jour des locations** : Suppression de la quantité dans l'emplacement
3. **Recalcul des occupations** : Mise à jour de l'occupation de l'emplacement
4. **Enregistrement dans l'historique** : Traçabilité complète du mouvement

## Sécurité et Permissions

⚠️ **Important** : Cette fonctionnalité bypass le contrôle qualité et met à jour le stock immédiatement dans les deux sens. Elle doit être utilisée uniquement par des opérateurs autorisés et formés.

## Support

Pour toute question ou problème concernant les ajustements d'inventaire, contactez l'équipe de gestion des stocks.

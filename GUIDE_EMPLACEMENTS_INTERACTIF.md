# Guide - Page Emplacements Interactive

## Vue d'ensemble
La page Emplacements a été améliorée pour offrir une vue détaillée et interactive des stocks par zone. Chaque zone est maintenant cliquable et affiche le contenu exact en temps réel.

## Fonctionnalités

### 1. Interaction au Clic
- **Cliquez sur une carte d'emplacement** (Zone A, B, C, etc.) pour ouvrir un tiroir latéral
- Le tiroir affiche le titre : "Contenu de [Nom de la Zone]"
- Un bouton **Fermer** ou une **croix (X)** permet de quitter la vue détaillée
- Cliquez sur l'overlay noir pour fermer le tiroir

### 2. Affichage Dynamique du Détail
Le tiroir affiche :

#### Résumé en haut
- **Total d'articles différents** : nombre d'articles uniques dans cette zone
- **Unités totales** : somme de toutes les quantités

#### Tableau des articles
Colonnes :
- **Référence** : code unique de l'article (ex: GN-M-001)
- **Désignation de l'Article** : nom complet de l'article
- **Quantité présente** : quantité dans cette zone spécifique avec l'unité

### 3. Synchronisation en Temps Réel (Crucial)
✅ **Synchronisation automatique** : Le contenu du tableau se met à jour instantanément sans recharger la page

**Scénarios de synchronisation :**
- **Transfert** : Si vous transférez un article d'une zone à une autre via la page Mouvements, les deux zones se mettent à jour immédiatement
- **Sortie approuvée** : Après approbation du contrôle qualité, l'article disparaît de la zone source
- **Entrée** : Un nouvel article apparaît immédiatement dans la zone de destination
- **Quantité zéro** : Si un article atteint 0 unités après un mouvement, il disparaît automatiquement de la liste

### 4. Design et UI
- Design épuré et cohérent avec le reste de l'application
- Couleurs bleu-vert (accent) et badges de statut
- Cartes cliquables avec effet hover
- Drawer fluide avec animation slide-in
- Tableau lisible avec alternance de couleurs

## Exemple d'utilisation

1. **Ouvrir la page Emplacements**
2. **Cliquer sur "Zone A - Rack 12"**
   - Le tiroir s'ouvre à droite
   - Affiche : "Total d'articles différents : 2"
   - Affiche : "Unités totales : 3300"
   - Tableau avec Gants Nitrile M (1500 paires) et Gants Latex S (1800 paires)

3. **Effectuer un transfert depuis la page Mouvements**
   - Transférer 500 Gants Nitrile M de Zone A vers Zone B
   - Le tiroir se met à jour automatiquement
   - Zone A affiche maintenant 1000 Gants Nitrile M
   - Zone B affiche maintenant 1500 Gants Nitrile M

4. **Effectuer une sortie approuvée**
   - Sortir 200 Gants Latex S de Zone A
   - Approuver le contrôle qualité
   - Zone A affiche maintenant 1600 Gants Latex S

## Points techniques

### Mise à jour en temps réel
- Le contexte DataContext gère l'état centralisé des articles et leurs locations
- Chaque mouvement met à jour les `locations` de l'article
- Le drawer se re-rend automatiquement quand les données changent
- Intervalle de synchronisation : 500ms

### Suppression automatique
- Les articles avec quantité 0 sont filtrés automatiquement
- Aucune action manuelle requise

### Performance
- Calculs optimisés pour les grandes quantités
- Pas de rechargement de page
- Synchronisation légère et rapide

## Troubleshooting

**Le tiroir ne s'ouvre pas ?**
- Vérifiez que vous cliquez bien sur la carte (pas sur les boutons Éditer/Supprimer)

**Les données ne se mettent pas à jour ?**
- Attendez 500ms (intervalle de synchronisation)
- Vérifiez que le mouvement a été créé avec succès

**Un article n'apparaît pas ?**
- Vérifiez que sa quantité est > 0 dans cette zone
- Vérifiez que le mouvement a été approuvé (pour les sorties)


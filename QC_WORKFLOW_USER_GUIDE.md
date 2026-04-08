# Guide d'Utilisation - Workflow de Contrôle Qualité

## Vue d'ensemble
Ce guide explique comment utiliser le nouveau système de rejet de mouvements avec génération automatique de rapports PDF.

## Fonctionnalités

### 1. Rejeter un Mouvement

#### Étape 1: Identifier le mouvement à rejeter
- Accédez à la page **Mouvements**
- Recherchez un mouvement avec le statut **"En attente"** (badge orange)
- Ces mouvements sont en attente de validation qualité

#### Étape 2: Ouvrir le modal de rejet
- Cliquez sur le bouton rouge avec l'icône **X** dans la colonne "Actions"
- Le modal "Rejeter le Mouvement" s'ouvre

#### Étape 3: Remplir les informations
Le modal affiche:
- **Informations du mouvement**: Article, quantité, opérateur, date
- **Avertissement**: Le rejet annulera le mouvement sans modifier le stock

Remplissez les champs obligatoires:
1. **Nom du Contrôleur** (requis)
   - Entrez votre nom complet
   - Exemple: "Marie Lefebvre"

2. **Raison du Rejet** (requis)
   - Décrivez en détail pourquoi le mouvement est rejeté
   - Exemples:
     - "Non-conformité qualité: emballage endommagé"
     - "Documentation manquante: certificat de conformité absent"
     - "Erreur de référence: mauvais numéro de lot"
     - "Produit périmé: date de lot dépassée"

#### Étape 4: Confirmer le rejet
- Cliquez sur **"Confirmer le Rejet"**
- Un message de confirmation apparaît
- Le mouvement passe au statut **"Rejeté"** (badge rouge)

### 2. Générer un Rapport PDF de Rejet

#### Étape 1: Localiser un mouvement rejeté
- Dans la table des mouvements
- Recherchez les mouvements avec le badge rouge **"Rejeté"**

#### Étape 2: Télécharger le rapport
- Cliquez sur l'icône bleue **document** (📄) dans la colonne "Actions"
- Le rapport PDF se génère automatiquement
- Le fichier se télécharge: `Rejection_Report_[ID].pdf`

#### Contenu du rapport PDF:
1. **En-tête**
   - Nom de l'entreprise: Top Gloves Inventory Hub
   - Emplacement pour logo
   - Titre: "Rapport de Rejet de Mouvement"
   - Date et heure de génération du rapport

2. **Détails du Mouvement**
   - ID du mouvement
   - Date et heure du mouvement
   - Article (nom et référence)
   - Type de mouvement
   - Quantité
   - Numéro de lot
   - Date du lot
   - Emplacement source
   - Destination
   - Nom de l'opérateur
   - Nom du contrôleur qualité

3. **Raison du Rejet**
   - Texte complet de la raison fournie
   - Formaté avec retour à la ligne automatique

4. **Pied de page**
   - Ligne de signature pour le Contrôleur Qualité

## Cas d'Usage

### Cas 1: Emballage Endommagé
```
Situation: Une sortie de 100 gants est en attente de validation, 
           mais l'emballage est endommagé.

Actions:
1. Cliquer sur le bouton "Rejeter" (X rouge)
2. Entrer: Contrôleur = "Sophie Martin"
3. Entrer: Raison = "Non-conformité qualité: emballage extérieur 
   déchiré sur 3 boîtes. Risque de contamination. Retour fournisseur requis."
4. Confirmer le rejet
5. Télécharger le PDF pour archivage
6. Envoyer le PDF au fournisseur
```

### Cas 2: Documentation Manquante
```
Situation: Une entrée de stock manque de certificat de conformité.

Actions:
1. Cliquer sur le bouton "Rejeter" (X rouge)
2. Entrer: Contrôleur = "Jean Dupont"
3. Entrer: Raison = "Documentation manquante: certificat de 
   conformité CE non fourni. Lot mis en quarantaine jusqu'à 
   réception des documents."
4. Confirmer le rejet
5. Générer le PDF
6. Archiver dans le dossier qualité
```

### Cas 3: Erreur de Lot
```
Situation: Le numéro de lot ne correspond pas à la commande.

Actions:
1. Cliquer sur le bouton "Rejeter" (X rouge)
2. Entrer: Contrôleur = "Marie Lefebvre"
3. Entrer: Raison = "Erreur de référence: numéro de lot 
   LOT-2026-02-015 ne correspond pas à la commande. 
   Lot attendu: LOT-2026-02-018. Vérification fournisseur nécessaire."
4. Confirmer le rejet
5. Télécharger le rapport PDF
6. Contacter le fournisseur avec le rapport
```

## Indicateurs Visuels

### Boutons d'Action
| Icône | Couleur | Action | Quand visible |
|-------|---------|--------|---------------|
| 🛡️ (Shield) | Orange | Contrôle Qualité | Mouvements en attente |
| ❌ (X) | Rouge | Rejeter | Mouvements en attente |
| 📄 (Document) | Bleu | Télécharger PDF | Mouvements rejetés |
| ✏️ (Pencil) | Gris | Modifier | Tous les mouvements |
| 🗑️ (Trash) | Gris | Supprimer | Tous les mouvements |

### Badges de Statut
| Badge | Couleur | Signification |
|-------|---------|---------------|
| En attente | Orange | En attente de validation qualité |
| Terminé | Vert | Approuvé et stock mis à jour |
| Rejeté | Rouge | Rejeté, stock non modifié |

## Bonnes Pratiques

### Rédaction des Raisons de Rejet
✅ **BON**:
- "Non-conformité qualité: 15 unités présentent des défauts de fabrication (déchirures). Lot retourné au fournisseur pour remplacement."
- "Documentation manquante: certificat d'analyse du lot absent. Produit mis en quarantaine jusqu'à réception du document."
- "Erreur de commande: référence GN-M-001 reçue au lieu de GN-L-001. Retour fournisseur initié."

❌ **MAUVAIS**:
- "Pas bon" (trop vague)
- "Problème" (pas assez détaillé)
- "Voir avec le chef" (pas d'information utile)

### Archivage des Rapports PDF
1. Télécharger le PDF immédiatement après le rejet
2. Renommer si nécessaire: `Rejet_[Date]_[Article]_[ID].pdf`
3. Archiver dans le dossier qualité approprié
4. Conserver pour audit et traçabilité
5. Joindre aux communications avec les fournisseurs si nécessaire

## Questions Fréquentes

**Q: Que se passe-t-il avec le stock quand je rejette un mouvement?**
R: Le stock n'est PAS modifié. Le mouvement est simplement marqué comme rejeté et aucune déduction n'est effectuée.

**Q: Puis-je modifier un mouvement après l'avoir rejeté?**
R: Non, mais vous pouvez le supprimer et créer un nouveau mouvement si nécessaire.

**Q: Le PDF est-il automatiquement envoyé quelque part?**
R: Non, le PDF est téléchargé sur votre ordinateur. Vous devez l'archiver ou l'envoyer manuellement.

**Q: Puis-je rejeter un mouvement déjà approuvé?**
R: Non, seuls les mouvements "En attente de validation Qualité" peuvent être rejetés.

**Q: La raison du rejet est-elle obligatoire?**
R: Oui, c'est un champ obligatoire pour assurer la traçabilité et la conformité.

**Q: Puis-je télécharger le PDF plusieurs fois?**
R: Oui, vous pouvez cliquer sur l'icône PDF autant de fois que nécessaire.

## Support Technique

Pour toute question ou problème:
1. Vérifiez que tous les champs obligatoires sont remplis
2. Assurez-vous que votre navigateur autorise les téléchargements
3. Consultez la console du navigateur pour les erreurs
4. Contactez l'administrateur système si le problème persiste

## Conformité et Audit

Ce système de rejet avec génération de PDF répond aux exigences de:
- ✅ Traçabilité complète des décisions qualité
- ✅ Documentation des raisons de rejet
- ✅ Identification du contrôleur responsable
- ✅ Génération de rapports formels
- ✅ Conservation des informations de lot/batch
- ✅ Audit trail complet pour conformité réglementaire

# 🚀 Guide Rapide - Test de la Consommation / Jour

## ⚡ Démarrage Rapide

### 1. Lancer l'Application
```bash
npm run dev
# ou
yarn dev
```

### 2. Accéder à la Page Articles
```
http://localhost:5173/articles
```

---

## 📊 Vérifications Immédiates

### ✅ Colonne "Consommation / Jour"
Vous devez voir :
- **GN-M-001** (Gants Nitrile M) : **100** 🔥
- **MK-FFP2-006** (Masques FFP2) : **250** 🔥

### ✅ Historique des Consommations
Vous devez voir un tableau avec :
```
Date                | Référence      | Article           | Total Consommé
Mon Feb 26 2026     | GN-M-001       | Gants Nitrile M   | 100
Mon Feb 26 2026     | MK-FFP2-006    | Masques FFP2      | 250
```

---

## 🧪 Test Interactif

### Créer une Nouvelle Sortie
1. Aller à la page **Mouvements**
2. Cliquer sur **"Ajouter un Mouvement"**
3. Remplir le formulaire :
   - Type : **Sortie**
   - Article : **Masques FFP2** (MK-FFP2-006)
   - Quantité : **100**
   - Emplacement Source : **Zone D - Rack 05**
   - Emplacement Destination : **Département Production**
4. Cliquer sur **"Ajouter"**

### Approuver le Contrôle Qualité
1. Aller à la page **Contrôle Qualité**
2. Trouver le mouvement que vous venez de créer
3. Cliquer sur **"Approuver"**
4. Remplir le formulaire :
   - État des Articles : **Conforme**
5. Cliquer sur **"Approuver"**

### Observer les Changements
1. Retourner à la page **Articles**
2. Vérifier que :
   - ✅ La consommation de **Masques FFP2** est passée de **250** à **350**
   - ✅ Le badge s'est agrandi avec animation
   - ✅ L'historique affiche maintenant **350** au lieu de **250**

---

## 🎯 Cas de Test Spécifique : 8000 Masques

### État Initial
```
Stock: 8000
Consommation / Jour: 250 (100 + 150 des mouvements existants)
```

### Ajouter une Sortie de 250
1. Créer une sortie de **250** masques
2. Approuver le contrôle qualité
3. Vérifier :
   - Stock : **7500** (8000 - 250 - 250)
   - Consommation : **500** (250 + 250)

### Ajouter une Sortie de 100
1. Créer une sortie de **100** masques
2. Approuver le contrôle qualité
3. Vérifier :
   - Stock : **7400** (7500 - 100)
   - Consommation : **600** (500 + 100)

---

## 🔍 Vérifications Détaillées

### Animation du Badge
- Quand la consommation augmente, le badge doit :
  - ✅ S'agrandir (scale-110)
  - ✅ Afficher une ombre orange
  - ✅ L'icône 🔥 pulse
  - ✅ Revenir à la normale après 600ms

### Historique
- Doit afficher les entrées triées par date décroissante
- Aujourd'hui doit avoir un fond orange clair
- Doit afficher un point orange à côté de la date d'aujourd'hui

### Réinitialisation
- À minuit, la consommation doit redevenir 0
- L'historique doit conserver les données des jours précédents

---

## 🐛 Dépannage

### La consommation n'augmente pas
- [ ] Vérifier que le mouvement a le statut **"Terminé"**
- [ ] Vérifier que le type est **"Sortie"**
- [ ] Vérifier que la date est **aujourd'hui**

### L'historique est vide
- [ ] Vérifier qu'il y a au moins un mouvement de sortie validé
- [ ] Vérifier que le statut est **"Terminé"**

### L'animation ne s'affiche pas
- [ ] Vérifier que le CSS est chargé
- [ ] Vérifier que la consommation a réellement changé

---

## 📝 Notes Importantes

- Les données de test sont dans `src/contexts/DataContext.tsx`
- Les mouvements d'aujourd'hui (26 février 2026) sont les ID 3, 4, 5, 6
- La consommation se recalcule automatiquement quand un mouvement change de statut
- Pas de rechargement de page nécessaire

---

## ✨ Résultat Attendu

Après avoir suivi ce guide, vous devez voir :

```
📊 Page Articles
├── Tableau des Articles
│   ├── GN-M-001 | Gants Nitrile M | Stock: 2500 | Consommation: 100 🔥
│   ├── MK-FFP2-006 | Masques FFP2 | Stock: 7750 | Consommation: 250 🔥
│   └── ...
│
└── 📅 Historique des Consommations Journalières (2 entrées)
    ├── Mon Feb 26 2026 | GN-M-001 | Gants Nitrile M | 100
    └── Mon Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 250
```

---

## 🎉 Succès !

Si vous voyez cela, l'implémentation est correcte et fonctionnelle.


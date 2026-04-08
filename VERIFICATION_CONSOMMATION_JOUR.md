# ✅ Vérification - Consommation / Jour

## 📋 Données de Test Actuelles

### Articles
```
1. GN-M-001 | Gants Nitrile M | Stock: 2500
2. GL-S-002 | Gants Latex S | Stock: 1800
3. GV-L-003 | Gants Vinyle L | Stock: 3200
4. GN-XL-004 | Gants Nitrile XL | Stock: 45
5. SG-PE-005 | Sur-gants PE | Stock: 120
6. MK-FFP2-006 | Masques FFP2 | Stock: 8000 ⭐
```

### Mouvements d'Aujourd'hui (26 février 2026)
```
ID 3: 09:30 | GN-M-001 | Sortie | 50 | Terminé ✅
ID 4: 10:45 | GN-M-001 | Sortie | 50 | Terminé ✅
ID 5: 11:20 | MK-FFP2-006 | Sortie | 100 | Terminé ✅
ID 6: 14:15 | MK-FFP2-006 | Sortie | 150 | Terminé ✅
```

---

## 🧪 Cas de Test 1 : Gants Nitrile M (GN-M-001)

### Calcul Attendu
```
Mouvements d'aujourd'hui (26 février 2026):
  - Mouvement 3: Type=Sortie, Statut=Terminé, Qte=50 ✅
  - Mouvement 4: Type=Sortie, Statut=Terminé, Qte=50 ✅

Consommation / Jour = 50 + 50 = 100 ✅
```

### Vérification dans l'UI
- [ ] Colonne "Consommation / Jour" affiche **100**
- [ ] Badge orange avec icône 🔥
- [ ] Historique contient une ligne : "Mon Feb 26 2026 | GN-M-001 | Gants Nitrile M | 100"

---

## 🧪 Cas de Test 2 : Masques FFP2 (MK-FFP2-006) ⭐

### Calcul Attendu
```
Mouvements d'aujourd'hui (26 février 2026):
  - Mouvement 5: Type=Sortie, Statut=Terminé, Qte=100 ✅
  - Mouvement 6: Type=Sortie, Statut=Terminé, Qte=150 ✅

Consommation / Jour = 100 + 150 = 250 ✅

Stock Attendu:
  - Stock initial: 8000
  - Après sortie 1 (100): 7900
  - Après sortie 2 (150): 7750 ✅
```

### Vérification dans l'UI
- [ ] Colonne "Consommation / Jour" affiche **250**
- [ ] Badge orange avec icône 🔥
- [ ] Stock affiche **7750**
- [ ] Historique contient une ligne : "Mon Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 250"

---

## 🧪 Cas de Test 3 : Réinitialisation à Minuit

### Scénario
```
Jour 1 (26 février 2026):
  - Consommation / Jour (GN-M-001): 100
  - Consommation / Jour (MK-FFP2-006): 250

Jour 2 (27 février 2026):
  - Consommation / Jour (GN-M-001): 0 (réinitialisé)
  - Consommation / Jour (MK-FFP2-006): 0 (réinitialisé)
  - Historique: Toujours affiche les données du 26 février
```

### Vérification
- [ ] À minuit, la consommation repart de 0
- [ ] L'historique conserve les données des jours précédents
- [ ] Les nouvelles sorties du jour 2 s'ajoutent à la consommation

---

## 🧪 Cas de Test 4 : Mouvements Non-Validés

### Scénario
```
Mouvement 7: 15:00 | GN-M-001 | Sortie | 75 | En attente de validation Qualité ❌

Consommation / Jour (GN-M-001):
  - Avant approbation: 100 (ne compte pas le mouvement 7)
  - Après approbation: 175 (100 + 75)
```

### Vérification
- [ ] Les sorties "En attente" ne sont pas comptabilisées
- [ ] Les sorties "Rejetées" ne sont pas comptabilisées
- [ ] Seules les sorties "Terminées" sont comptabilisées

---

## 🧪 Cas de Test 5 : Animation du Badge

### Scénario
```
État initial: Consommation = 100

Approbation d'une nouvelle sortie de 50:
  - Consommation passe à 150
  - Badge s'agrandit (scale-110)
  - Ombre orange apparaît
  - Icône 🔥 pulse
  - Animation dure 600ms
```

### Vérification
- [ ] Badge s'agrandit lors d'une augmentation
- [ ] Ombre orange visible
- [ ] Icône pulse
- [ ] Animation disparaît après 600ms

---

## 🧪 Cas de Test 6 : Historique Trié

### Scénario
```
Mouvements:
  - 24 février: 200 masques
  - 25 février: 150 masques
  - 26 février: 250 masques

Historique affiché (du plus récent au plus ancien):
  1. Mon Feb 26 2026 | MK-FFP2-006 | Masques FFP2 | 250 (aujourd'hui - fond orange)
  2. Tue Feb 25 2026 | MK-FFP2-006 | Masques FFP2 | 150 (fond normal)
  3. Mon Feb 24 2026 | MK-FFP2-006 | Masques FFP2 | 200 (fond normal)
```

### Vérification
- [ ] Historique trié par date décroissante
- [ ] Aujourd'hui en haut avec indicateur visuel
- [ ] Compteur affiche "3 entrées"

---

## 🧪 Cas de Test 7 : Historique Vide

### Scénario
```
Aucun mouvement de sortie validé

Historique:
  - Message: "Aucune consommation enregistrée pour le moment."
  - Compteur: "0 entrées"
```

### Vérification
- [ ] Message vide affiché
- [ ] Pas de tableau
- [ ] Compteur à 0

---

## 📊 Résumé des Vérifications

| Cas | Description | Statut |
|-----|-------------|--------|
| 1 | Gants Nitrile M (100) | ⏳ À vérifier |
| 2 | Masques FFP2 (250) | ⏳ À vérifier |
| 3 | Réinitialisation à minuit | ⏳ À vérifier |
| 4 | Mouvements non-validés | ⏳ À vérifier |
| 5 | Animation du badge | ⏳ À vérifier |
| 6 | Historique trié | ⏳ À vérifier |
| 7 | Historique vide | ⏳ À vérifier |

---

## 🚀 Instructions de Test

1. **Ouvrir la page Articles**
   ```
   http://localhost:5173/articles
   ```

2. **Vérifier la colonne "Consommation / Jour"**
   - GN-M-001 doit afficher 100
   - MK-FFP2-006 doit afficher 250

3. **Vérifier l'Historique**
   - Doit afficher 2 lignes (une pour chaque article)
   - Triées par date décroissante
   - Avec indicateur visuel pour aujourd'hui

4. **Tester l'Animation**
   - Aller à la page Mouvements
   - Créer une nouvelle sortie
   - Approuver le contrôle qualité
   - Observer l'animation du badge

5. **Tester la Réinitialisation**
   - Attendre minuit (ou modifier la date système)
   - Vérifier que la consommation repart de 0
   - Vérifier que l'historique conserve les données

---

## 📝 Notes

- Les données de test sont dans `src/contexts/DataContext.tsx`
- Les mouvements d'aujourd'hui sont les ID 3, 4, 5, 6
- La date d'aujourd'hui est le 26 février 2026
- Les mouvements du 24 février sont les ID 1, 2

---

## ✅ Checklist Finale

- [x] Logique de calcul implémentée
- [x] Historique implémenté
- [x] Animation du badge implémentée
- [x] Indicateur visuel pour aujourd'hui implémenté
- [x] Pas de fichiers de test créés
- [x] Code compilé sans erreurs
- [ ] Tests manuels effectués
- [ ] Déploiement en production


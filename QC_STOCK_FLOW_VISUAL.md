# Flux Visuel du Stock avec Contrôle Qualité

## 📥 ENTRÉE - Flux Complet

### Scénario: Réception de 1000 Gants Nitrile M

```
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAT INITIAL                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Article: Gants Nitrile M                                        │
│ Stock Total: 2500 Paires                                        │
│ Zone A - Rack 12: 1500 Paires                                   │
│ Zone B - Rack 03: 1000 Paires                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 1: Création de l'Entrée
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Nouveau Mouvement                                       │
├─────────────────────────────────────────────────────────────────┤
│ Type: Entrée                                                    │
│ Quantité: 1000 Paires                                           │
│ Destination: Zone A - Rack 12                                   │
│ Lot: LOT-2026-03-100                                            │
│ Opérateur: Karim B.                                             │
│                                                                 │
│ ⚡ ENREGISTRER                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Mouvement Créé                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: 🟠 En attente de validation Qualité                     │
│                                                                 │
│ ⚠️ STOCK NON MODIFIÉ                                            │
│ Stock Total: 2500 Paires (inchangé)                             │
│ Zone A - Rack 12: 1500 Paires (inchangé)                        │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 🔒 1000 Paires en QUARANTAINE VIRTUELLE                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2a: Validation QC - Conforme
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Contrôle Qualité                                        │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Marie L.                                            │
│ État: ✅ Conforme                                                │
│ Unités défectueuses: 0                                          │
│                                                                 │
│ ⚡ VALIDER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Entrée Validée                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ✅ Terminé                                               │
│ Approuvé par: Marie L.                                          │
│                                                                 │
│ ✅ STOCK MODIFIÉ                                                 │
│ Stock Total: 3500 Paires (+1000)                                │
│ Zone A - Rack 12: 2500 Paires (+1000) ✨                        │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 📊 1000 Paires maintenant UTILISABLES                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2b: Validation QC - Non-conforme
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Contrôle Qualité                                        │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Marie L.                                            │
│ État: ⚠️ Non-conforme                                            │
│ Unités défectueuses: 50                                         │
│                                                                 │
│ ⚡ VALIDER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Entrée Validée (Partielle)                            │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ✅ Terminé                                               │
│ Approuvé par: Marie L.                                          │
│ Qté Valide: 950 Paires                                          │
│ Qté Défect.: 50 Paires                                          │
│                                                                 │
│ ✅ STOCK MODIFIÉ (Partiellement)                                 │
│ Stock Total: 3450 Paires (+950)                                 │
│ Zone A - Rack 12: 2450 Paires (+950) ✨                         │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 📊 950 Paires UTILISABLES                                        │
│ ❌ 50 Paires REJETÉES (perte permanente)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2c: Rejet QC
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Rejet du Mouvement                                      │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Marie L.                                            │
│ Raison: Non-conformité majeure - Emballage endommagé            │
│                                                                 │
│ ⚡ REJETER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Entrée Rejetée                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ❌ Rejeté                                                │
│ Contrôleur: Marie L.                                            │
│                                                                 │
│ ⚠️ STOCK NON MODIFIÉ                                             │
│ Stock Total: 2500 Paires (reste inchangé)                       │
│ Zone A - Rack 12: 1500 Paires (reste inchangé)                  │
│ Zone B - Rack 03: 1000 Paires (reste inchangé)                  │
│                                                                 │
│ 🚫 1000 Paires JAMAIS ENTRÉES dans le stock                      │
│ 📄 PDF de rejet généré                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📤 SORTIE - Flux Complet

### Scénario: Sortie de 500 Gants Nitrile M

```
┌─────────────────────────────────────────────────────────────────┐
│ ÉTAT INITIAL                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Article: Gants Nitrile M                                        │
│ Stock Total: 2500 Paires                                        │
│ Zone A - Rack 12: 1500 Paires                                   │
│ Zone B - Rack 03: 1000 Paires                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 1: Création de la Sortie
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Nouveau Mouvement                                       │
├─────────────────────────────────────────────────────────────────┤
│ Type: Sortie                                                    │
│ Quantité: 500 Paires                                            │
│ Source: Zone A - Rack 12                                        │
│ Destination: Département Production                             │
│ Lot: LOT-2026-03-101                                            │
│ Opérateur: Jean D.                                              │
│                                                                 │
│ ⚡ ENREGISTRER                                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Mouvement Créé                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: 🟠 En attente de validation Qualité                     │
│                                                                 │
│ ⚠️ STOCK NON MODIFIÉ                                            │
│ Stock Total: 2500 Paires (inchangé)                             │
│ Zone A - Rack 12: 1500 Paires (inchangé)                        │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 📦 500 Paires encore PHYSIQUEMENT EN ENTREPÔT                    │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2a: Validation QC - Conforme
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Contrôle Qualité                                        │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Pierre M.                                           │
│ État: ✅ Conforme                                                │
│ Unités défectueuses: 0                                          │
│                                                                 │
│ ⚡ VALIDER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Sortie Validée                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ✅ Terminé                                               │
│ Approuvé par: Pierre M.                                         │
│                                                                 │
│ ✅ STOCK MODIFIÉ                                                 │
│ Stock Total: 2000 Paires (-500)                                 │
│ Zone A - Rack 12: 1000 Paires (-500) ✨                         │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 📤 500 Paires SORTIES de l'entrepôt                              │
│ 📄 Bon de Sortie PDF généré                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2b: Validation QC - Non-conforme
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Contrôle Qualité                                        │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Pierre M.                                           │
│ État: ⚠️ Non-conforme                                            │
│ Unités défectueuses: 50                                         │
│                                                                 │
│ ⚡ VALIDER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Sortie Validée (avec défauts)                         │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ✅ Terminé                                               │
│ Approuvé par: Pierre M.                                         │
│ Qté Valide: 450 Paires                                          │
│ Qté Défect.: 50 Paires                                          │
│                                                                 │
│ ⚠️ STOCK MODIFIÉ (TOTAL déduit)                                 │
│ Stock Total: 2000 Paires (-500) ⚠️                              │
│ Zone A - Rack 12: 1000 Paires (-500) ✨                         │
│ Zone B - Rack 03: 1000 Paires (inchangé)                        │
│                                                                 │
│ 📤 TOUTES les 500 Paires SORTIES de l'entrepôt                  │
│ 💡 Raison: Elles ont physiquement quitté l'entrepôt             │
│ ✅ 450 Paires utilisables                                        │
│ ❌ 50 Paires défectueuses (perte permanente)                     │
│ 📄 Bon de Sortie PDF généré                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Étape 2c: Rejet QC
```
┌─────────────────────────────────────────────────────────────────┐
│ ACTION: Rejet du Mouvement                                      │
├─────────────────────────────────────────────────────────────────┤
│ Contrôleur: Pierre M.                                           │
│ Raison: Qualité insuffisante pour utilisation                   │
│                                                                 │
│ ⚡ REJETER                                                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ RÉSULTAT: Sortie Rejetée                                        │
├─────────────────────────────────────────────────────────────────┤
│ Statut: ❌ Rejeté                                                │
│ Contrôleur: Pierre M.                                           │
│                                                                 │
│ ⚠️ STOCK NON MODIFIÉ                                             │
│ Stock Total: 2500 Paires (reste inchangé)                       │
│ Zone A - Rack 12: 1500 Paires (reste inchangé)                  │
│ Zone B - Rack 03: 1000 Paires (reste inchangé)                  │
│                                                                 │
│ 🔙 500 Paires RESTENT dans l'entrepôt                            │
│ 📄 PDF de rejet généré                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Tableau Récapitulatif

### Impact sur le Stock selon le Statut

| Type | Statut | Stock Total | Emplacement | Remarque |
|------|--------|-------------|-------------|----------|
| **Entrée** | En attente | ❌ Inchangé | ❌ Inchangé | Quarantaine virtuelle |
| **Entrée** | Terminé (Conforme) | ✅ +Quantité | ✅ +Quantité | Toutes les unités ajoutées |
| **Entrée** | Terminé (Non-conforme) | ✅ +Valides | ✅ +Valides | Défectueuses rejetées |
| **Entrée** | Rejeté | ❌ Inchangé | ❌ Inchangé | Jamais entré dans le stock |
| **Sortie** | En attente | ❌ Inchangé | ❌ Inchangé | Encore en entrepôt |
| **Sortie** | Terminé (Conforme) | ✅ -Quantité | ✅ -Quantité | Toutes les unités sorties |
| **Sortie** | Terminé (Non-conforme) | ⚠️ -Total | ⚠️ -Total | Toutes sorties (valides + défectueuses) |
| **Sortie** | Rejeté | ❌ Inchangé | ❌ Inchangé | Reste en entrepôt |

---

## 🎯 Points Clés Visuels

### Entrée - Quarantaine
```
┌──────────────┐
│   RÉCEPTION  │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ⚠️ Stock = 0
│ EN ATTENTE   │     🔒 Quarantaine
└──────┬───────┘
       │
       ▼
┌──────────────┐     ✅ Stock = +Valides
│   VALIDÉ     │     ❌ Défectueuses rejetées
└──────────────┘
```

### Sortie - Validation
```
┌──────────────┐
│   DEMANDE    │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ⚠️ Stock inchangé
│ EN ATTENTE   │     📦 Encore en entrepôt
└──────┬───────┘
       │
       ▼
┌──────────────┐     ✅ Stock = -Total
│   VALIDÉ     │     📤 Toutes sorties
└──────────────┘
```

### Rejet - Annulation
```
┌──────────────┐
│  MOUVEMENT   │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ⚠️ Stock inchangé
│ EN ATTENTE   │     
└──────┬───────┘
       │
       ▼
┌──────────────┐     ❌ Stock inchangé
│   REJETÉ     │     🚫 Opération annulée
└──────────────┘
```

---

## 🎉 Conclusion

Le système garantit que:
- ✅ **Entrées**: Seules les unités validées entrent dans le stock
- ✅ **Sorties**: Toutes les unités (valides + défectueuses) sortent du stock
- ✅ **Quarantaine**: Automatique et virtuelle pour les entrées
- ✅ **Validation**: Obligatoire avant tout impact sur le stock
- ✅ **Traçabilité**: Complète avec contrôleur et décision
- ✅ **Cohérence**: Le stock affiché = stock réel validé

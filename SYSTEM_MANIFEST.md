# SYSTEM MANIFEST - Top Gloves Gestion de Stock

> Document de référence complet du système pour l'implémentation d'un contrôle d'accès par rôle (Admin vs Utilisateur)

**Date de génération:** 27 février 2026  
**Version:** 1.0.0  
**Technologie:** React + TypeScript + Vite

---

## 📋 TABLE DES MATIÈRES

1. [Architecture Générale](#architecture-générale)
2. [Pages et Composants](#pages-et-composants)
3. [Modèles de Données](#modèles-de-données)
4. [Fonctions Critiques](#fonctions-critiques)
5. [Routes et Navigation](#routes-et-navigation)
6. [Contextes et États](#contextes-et-états)
7. [Recommandations pour le Contrôle d'Accès](#recommandations-pour-le-contrôle-daccès)

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### Stack Technique
- **Frontend:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 5.4.19
- **Routing:** React Router DOM 6.30.1
- **UI Components:** Radix UI + Tailwind CSS
- **State Management:** React Context API
- **Charts:** Recharts 2.15.4
- **Testing:** Vitest 3.2.4

### Structure des Dossiers
```
src/
├── assets/          # Images et ressources statiques
├── components/      # Composants réutilisables
│   └── ui/         # Composants UI de base (Radix)
├── config/         # Fichiers de configuration
├── contexts/       # Contextes React (Auth, Data)
├── hooks/          # Hooks personnalisés
├── lib/            # Utilitaires et fonctions helpers
├── pages/          # Pages de l'application
├── styles/         # Styles CSS personnalisés
└── test/           # Tests unitaires
```

---

## 📄 PAGES ET COMPOSANTS

### Pages Principales

#### 1. **LoginPage** (`src/pages/LoginPage.tsx`)
- **Fonction:** Page d'authentification
- **Accès:** Public (non authentifié)
- **Fonctionnalités:**
  - Formulaire de connexion (ID + mot de passe)
  - Validation des credentials
  - Redirection vers Dashboard après connexion

#### 2. **Dashboard** (`src/pages/Dashboard.tsx`)
- **Fonction:** Tableau de bord principal avec vue d'ensemble
- **Accès:** Utilisateur + Admin
- **Fonctionnalités:**
  - Statistiques en temps réel (Stock total, Entrées/Sorties/Transferts du jour)
  - Graphique des mouvements de la semaine (Recharts)
  - Tableau des 5 derniers mouvements
  - Système de stock prédictif (StockDashboard)
  - Alertes critiques et warnings

#### 3. **ArticlesPage** (`src/pages/ArticlesPage.tsx`)
- **Fonction:** Gestion complète des articles
- **Accès:** Utilisateur (lecture) + Admin (CRUD complet)
- **Fonctionnalités:**
  - Liste des articles avec recherche
  - Affichage du stock, seuil, autonomie, statut
  - Localisation multi-emplacements
  - Historique des consommations journalières
  - CRUD: Ajouter, Modifier, Supprimer articles
  - Calcul automatique de l'autonomie et du statut

#### 4. **CategoriesPage** (`src/pages/CategoriesPage.tsx`)
- **Fonction:** Gestion des catégories d'articles
- **Accès:** Admin uniquement
- **Fonctionnalités:**
  - Liste des catégories en cartes
  - CRUD: Ajouter, Modifier, Supprimer catégories
  - Compteur d'articles par catégorie

#### 5. **EmplacementsPage** (`src/pages/EmplacementsPage.tsx`)
- **Fonction:** Gestion des emplacements de stockage
- **Accès:** Utilisateur (lecture) + Admin (CRUD)
- **Fonctionnalités:**
  - Liste des emplacements avec taux d'occupation
  - Visualisation interactive du contenu (drawer)
  - Calcul automatique de l'occupation
  - CRUD: Ajouter, Modifier, Supprimer emplacements
  - Alertes de capacité (>90% critique, >70% warning)

#### 6. **MouvementsPage** (`src/pages/MouvementsPage.tsx`)
- **Fonction:** Gestion des mouvements de stock
- **Accès:** Utilisateur + Admin
- **Fonctionnalités:**
  - 4 types de mouvements: Entrée, Sortie, Transfert, Ajustement
  - Filtrage par type et recherche
  - Contrôle qualité pour les sorties
  - Validation des quantités disponibles
  - Gestion des emplacements source/destination
  - CRUD: Ajouter, Modifier, Supprimer mouvements
  - Workflow de validation qualité

#### 7. **InventairePage** (`src/pages/InventairePage.tsx`)
- **Fonction:** Inventaire quotidien et historique
- **Accès:** Utilisateur + Admin
- **Fonctionnalités:**
  - Saisie du stock physique vs théorique
  - Calcul automatique des écarts
  - Validation ligne par ligne
  - Historique complet des inventaires
  - Réinitialisation pour nouvelle session

#### 8. **AdminPage** (`src/pages/AdminPage.tsx`)
- **Fonction:** Zone d'administration avancée
- **Accès:** Admin uniquement (avec mot de passe)
- **Fonctionnalités:**
  - Authentification admin séparée
  - Journal d'audit des actions
  - Modules: Paramètres, Utilisateurs, Historique, Import/Export
  - Export/Import CSV

#### 9. **NotFound** (`src/pages/NotFound.tsx`)
- **Fonction:** Page 404
- **Accès:** Public

---

### Composants Réutilisables

#### Composants Métier

1. **AppLayout** (`src/components/AppLayout.tsx`)
   - Layout principal avec sidebar et header
   - Navigation responsive (mobile + desktop)
   - Affichage utilisateur connecté
   - Bouton déconnexion

2. **StockDashboard** (`src/components/StockDashboard.tsx`)
   - Dashboard de stock prédictif
   - Cartes de résumé (Critiques, Attention, Sécurisés)
   - Tableaux détaillés par niveau de criticité

3. **MovementTable** (`src/components/MovementTable.tsx`)
   - Tableau des mouvements (version compacte et complète)
   - Actions: Éditer, Supprimer, Contrôle Qualité
   - Badges de statut et type

4. **StockStatusBadge** (`src/components/StockStatusBadge.tsx`)
   - Badge de statut (Critique, Attention, Sécurisé)
   - Calcul basé sur autonomie et seuil

5. **AutonomyBadge** (`src/components/AutonomyBadge.tsx`)
   - Badge d'autonomie (jours/heures restants)
   - Indicateur visuel de criticité

6. **Modal** (`src/components/Modal.tsx`)
   - Modal réutilisable pour formulaires

7. **Toast** (`src/components/Toast.tsx`)
   - Notifications toast (succès/erreur)

#### Composants UI (Radix)
- 50+ composants UI de base dans `src/components/ui/`
- Accordion, Alert, Badge, Button, Card, Checkbox, Dialog, Dropdown, Form, Input, Label, Select, Table, Tabs, Tooltip, etc.

---

## 📊 MODÈLES DE DONNÉES

### Types TypeScript (DataContext)

#### 1. **Article**
```typescript
interface Article {
  id: number;
  ref: string;                      // Référence unique (ex: GN-M-001)
  nom: string;                      // Nom de l'article
  categorie: string;                // Catégorie
  stock: number;                    // Stock total actuel
  seuil: number;                    // Seuil d'alerte
  unite: string;                    // Unité (paire, unité, boîte)
  consommationParInventaire: number; // Écart dernier inventaire
  consommationJournaliere: number;  // CJE (Consommation Journalière Estimée)
  locations: ArticleLocation[];     // Emplacements multi-zones
}
```

#### 2. **ArticleLocation**
```typescript
interface ArticleLocation {
  emplacementNom: string;  // Nom de l'emplacement
  quantite: number;        // Quantité dans cet emplacement
}
```

#### 3. **Categorie**
```typescript
interface Categorie {
  id: number;
  nom: string;
  description: string;
  articles: number;  // Nombre d'articles
  stock: number;     // Stock total de la catégorie
}
```

#### 4. **Emplacement**
```typescript
interface Emplacement {
  id: number;
  code: string;      // Code court (ex: A-12)
  nom: string;       // Nom complet (ex: Zone A - Rack 12)
  type: string;      // Type (Stockage, Quarantaine, Expédition)
  capacite: number;  // Capacité maximale
  occupe: number;    // Quantité occupée (calculée automatiquement)
}
```

#### 5. **Mouvement**
```typescript
interface Mouvement {
  id: number;
  date: string;                                    // Format: YYYY-MM-DD HH:MM:SS
  article: string;                                 // Nom de l'article
  ref: string;                                     // Référence de l'article
  type: "Entrée" | "Sortie" | "Transfert" | "Ajustement";
  qte: number;                                     // Quantité
  emplacementSource?: string;                      // Emplacement source (Sortie, Transfert, Ajustement)
  emplacementDestination: string;                  // Emplacement destination
  operateur: string;                               // Nom de l'opérateur
  statut?: "En attente de validation Qualité" | "Terminé" | "Rejeté";
  controleur?: string;                             // Nom du contrôleur qualité
  etatArticles?: "Conforme" | "Non-conforme";     // État après contrôle
  unitesDefectueuses?: number;                     // Nombre d'unités défectueuses
  raison?: string;                                 // Raison du rejet
  motif?: string;                                  // Motif de l'ajustement
  typeAjustement?: "Surplus" | "Manquant";         // Type d'ajustement
}
```

#### 6. **InventoryRecord**
```typescript
interface InventoryRecord {
  id: number;
  dateHeure: string;       // Format: YYYY-MM-DD HH:MM
  article: string;         // Nom de l'article
  stockTheorique: number;  // Stock théorique
  stockPhysique: number;   // Stock physique compté
  ecart: number;           // Écart (physique - théorique)
}
```

---

## ⚙️ FONCTIONS CRITIQUES

### DataContext (`src/contexts/DataContext.tsx`)

#### Gestion des Articles
- `addArticle(article)` - Ajouter un article
- `updateArticle(id, updates)` - Modifier un article
- `deleteArticle(id)` - Supprimer un article
- `getArticleLocations(ref)` - Récupérer les emplacements d'un article
- `getArticleStockByLocation(ref, emplacement)` - Stock d'un article dans un emplacement
- `getArticleCurrentLocation(ref)` - Dernier emplacement connu

#### Gestion des Catégories
- `addCategorie(categorie)` - Ajouter une catégorie
- `updateCategorie(id, updates)` - Modifier une catégorie
- `deleteCategorie(id)` - Supprimer une catégorie

#### Gestion des Emplacements
- `addEmplacement(emplacement)` - Ajouter un emplacement
- `updateEmplacement(id, updates)` - Modifier un emplacement
- `deleteEmplacement(id)` - Supprimer un emplacement
- `calculateEmplacementOccupancy(nom)` - Calculer l'occupation d'un emplacement
- `recalculateAllOccupancies()` - Recalculer toutes les occupations

#### Gestion des Mouvements
- `addMouvement(mouvement)` - Ajouter un mouvement
  - **Entrée:** Ajoute au stock et à l'emplacement destination
  - **Sortie:** Crée le mouvement en attente de validation qualité
  - **Transfert:** Déplace entre emplacements (via processTransfer)
  - **Ajustement:** Ajoute (Surplus) ou retire (Manquant) immédiatement
- `updateMouvement(id, updates)` - Modifier un mouvement
- `deleteMouvement(id)` - Supprimer un mouvement (inverse l'effet sur le stock)
- `processTransfer(ref, source, qte, destination)` - Traiter un transfert
  - Valide la quantité disponible
  - Met à jour les locations de l'article
  - Recalcule les occupations

#### Contrôle Qualité
- `approveQualityControl(id, controleur, etat, defectueuses)` - Approuver une sortie
  - Déduit le stock de l'emplacement source
  - Met à jour le statut à "Terminé"
  - Enregistre le contrôleur et l'état
- `rejectQualityControl(id, controleur, raison)` - Rejeter une sortie
  - Annule l'opération
  - Met à jour le statut à "Rejeté"

#### Inventaire
- `addInventoryRecord(record)` - Ajouter un enregistrement d'inventaire
  - Enregistre l'écart
  - Met à jour `consommationParInventaire` de l'article

---

### Stock Utils (`src/lib/stock-utils.ts`)

#### Calculs de Stock Prédictif

1. **calculateAutonomy(stock, dailyConsumption)**
   - Calcule l'autonomie en jours et heures
   - Retourne: `{ days, hours, label, isLow }`
   - Formule: `totalHours = (stock / dailyConsumption) * 24`

2. **getStockStatus(stock, seuil, dailyConsumption)**
   - Détermine le statut du stock
   - Retourne: `{ level, label, color, bgColor, icon }`
   - Logique:
     - **CRITIQUE:** stock ≤ seuil OU autonomie ≤ 3 jours (72h)
     - **ATTENTION:** autonomie entre 4-7 jours (72h-168h)
     - **SÉCURISÉ:** autonomie > 7 jours

---

### AuthContext (`src/contexts/AuthContext.tsx`)

#### Authentification

1. **login(id, password)**
   - Authentification utilisateur
   - Retourne: `boolean`
   - Définit: `isAuthenticated`, `user`

2. **adminLogin(password)**
   - Authentification admin (mot de passe: "admin")
   - Retourne: `boolean`
   - Définit: `isAdmin`

3. **logout()**
   - Déconnexion complète
   - Réinitialise: `isAuthenticated`, `isAdmin`, `user`

4. **logoutAdmin()**
   - Déconnexion admin uniquement
   - Réinitialise: `isAdmin`

---

## 🗺️ ROUTES ET NAVIGATION

### Structure des Routes (`src/App.tsx`)

```typescript
<Routes>
  <Route path="/" element={<LoginRoute />} />
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="/articles" element={<ProtectedRoute><ArticlesPage /></ProtectedRoute>} />
  <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
  <Route path="/emplacements" element={<ProtectedRoute><EmplacementsPage /></ProtectedRoute>} />
  <Route path="/mouvements" element={<ProtectedRoute><MouvementsPage /></ProtectedRoute>} />
  <Route path="/inventaire" element={<ProtectedRoute><InventairePage /></ProtectedRoute>} />
  <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Navigation Sidebar (`src/components/AppLayout.tsx`)

```typescript
const navItems = [
  { to: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
  { to: "/articles", label: "Articles", icon: Package },
  { to: "/categories", label: "Catégories", icon: Tags },
  { to: "/emplacements", label: "Emplacements", icon: MapPin },
  { to: "/mouvements", label: "Mouvements", icon: ArrowLeftRight },
  { to: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
];
```

### Protection des Routes

- **ProtectedRoute:** Vérifie `isAuthenticated`
- **LoginRoute:** Redirige vers `/dashboard` si déjà authentifié
- **AdminPage:** Vérifie `isAdmin` en interne (double authentification)

---

## 🔐 CONTEXTES ET ÉTATS

### AuthContext

**État:**
```typescript
{
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: { name: string; role: string } | null;
}
```

**Méthodes:**
- `login(id, password)` - Connexion utilisateur
- `adminLogin(password)` - Connexion admin
- `logout()` - Déconnexion complète
- `logoutAdmin()` - Déconnexion admin

---

### DataContext

**État:**
```typescript
{
  articles: Article[];
  categories: Categorie[];
  emplacements: Emplacement[];
  mouvements: Mouvement[];
  inventoryHistory: InventoryRecord[];
}
```

**Méthodes:** (voir section Fonctions Critiques)

---

## 🎯 RECOMMANDATIONS POUR LE CONTRÔLE D'ACCÈS

### Matrice des Permissions

| Page/Fonctionnalité | Utilisateur | Admin |
|---------------------|-------------|-------|
| **LoginPage** | ✅ Public | ✅ Public |
| **Dashboard** | ✅ Lecture | ✅ Lecture |
| **Articles** | ✅ Lecture | ✅ CRUD |
| **Catégories** | ❌ Aucun accès | ✅ CRUD |
| **Emplacements** | ✅ Lecture | ✅ CRUD |
| **Mouvements** | ✅ Créer/Lire | ✅ CRUD + Validation |
| **Inventaire** | ✅ Saisie/Lecture | ✅ Saisie/Lecture/Export |
| **AdminPage** | ❌ Aucun accès | ✅ Accès complet |

---

### Implémentation Suggérée

#### 1. Créer un Hook de Permission

```typescript
// src/hooks/usePermissions.ts
import { useAuth } from "@/contexts/AuthContext";

export const usePermissions = () => {
  const { isAdmin, user } = useAuth();

  return {
    canCreateArticle: isAdmin,
    canEditArticle: isAdmin,
    canDeleteArticle: isAdmin,
    canViewArticles: true,
    
    canManageCategories: isAdmin,
    
    canCreateEmplacement: isAdmin,
    canEditEmplacement: isAdmin,
    canDeleteEmplacement: isAdmin,
    canViewEmplacements: true,
    
    canCreateMouvement: true,
    canEditMouvement: isAdmin,
    canDeleteMouvement: isAdmin,
    canApproveQualityControl: isAdmin,
    
    canAccessAdmin: isAdmin,
    canExportData: isAdmin,
    canImportData: isAdmin,
  };
};
```

#### 2. Protéger les Composants

```typescript
// Exemple dans ArticlesPage.tsx
const { canCreateArticle, canEditArticle, canDeleteArticle } = usePermissions();

// Masquer le bouton "Ajouter" pour les utilisateurs
{canCreateArticle && (
  <button onClick={() => handleOpenModal()}>
    <Plus className="w-4 h-4" />
    Ajouter
  </button>
)}

// Désactiver les actions d'édition/suppression
<button
  onClick={() => handleOpenModal(article)}
  disabled={!canEditArticle}
  className={!canEditArticle ? "opacity-50 cursor-not-allowed" : ""}
>
  <Edit className="w-3.5 h-3.5" />
</button>
```

#### 3. Protéger les Routes Sensibles

```typescript
// src/components/AdminRoute.tsx
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Dans App.tsx
<Route path="/categories" element={<AdminRoute><CategoriesPage /></AdminRoute>} />
<Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
```

#### 4. Ajouter des Rôles Utilisateur

```typescript
// Étendre AuthContext
interface User {
  id: string;
  name: string;
  role: "admin" | "operator" | "viewer";
  permissions: string[];
}

// Définir les permissions par rôle
const ROLE_PERMISSIONS = {
  admin: ["*"], // Toutes les permissions
  operator: [
    "articles:read",
    "emplacements:read",
    "mouvements:create",
    "mouvements:read",
    "inventaire:write",
  ],
  viewer: [
    "articles:read",
    "emplacements:read",
    "mouvements:read",
    "inventaire:read",
  ],
};
```

#### 5. Audit Trail

```typescript
// Ajouter un système de logs pour les actions sensibles
interface AuditLog {
  id: number;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
}

// Exemple d'utilisation
const logAction = (action: string, resource: string, details: string) => {
  addAuditLog({
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action,
    resource,
    details,
  });
};

// Dans les fonctions critiques
const deleteArticle = (id: number) => {
  const article = articles.find(a => a.id === id);
  logAction("DELETE", "Article", `Suppression de ${article.nom} (${article.ref})`);
  // ... reste de la logique
};
```

---

### Actions Critiques à Protéger

#### Niveau ADMIN Uniquement

1. **Gestion des Catégories**
   - Créer, modifier, supprimer des catégories
   - Impact: Organisation globale du système

2. **Gestion des Emplacements**
   - Créer, modifier, supprimer des emplacements
   - Impact: Structure physique du stockage

3. **Gestion des Articles**
   - Créer, modifier, supprimer des articles
   - Modifier les seuils et CJE
   - Impact: Base de données produits

4. **Validation Qualité**
   - Approuver/Rejeter les sorties
   - Impact: Déduction du stock réel

5. **Suppression de Mouvements**
   - Supprimer des mouvements historiques
   - Impact: Intégrité de l'historique

6. **Export/Import de Données**
   - Exporter en CSV
   - Importer des données en masse
   - Impact: Sécurité et intégrité des données

#### Niveau UTILISATEUR (Opérateur)

1. **Consultation**
   - Voir tous les articles, emplacements, mouvements
   - Consulter le dashboard et les statistiques

2. **Mouvements**
   - Créer des entrées, sorties, transferts
   - Créer des ajustements d'inventaire
   - Modifier ses propres mouvements (dans un délai limité)

3. **Inventaire**
   - Saisir les stocks physiques
   - Consulter l'historique des inventaires

---

## 📦 DONNÉES INITIALES

### Articles (6 articles de démonstration)
- Gants Nitrile M (GN-M-001) - 2500 unités
- Gants Latex S (GL-S-002) - 1800 unités
- Gants Vinyle L (GV-L-003) - 3200 unités
- Gants Nitrile XL (GN-XL-004) - 45 unités (CRITIQUE)
- Sur-gants PE (SG-PE-005) - 120 unités (CRITIQUE)
- Masques FFP2 (MK-FFP2-006) - 8000 unités

### Catégories (6 catégories)
- Gants Nitrile
- Gants Latex
- Gants Vinyle
- Sur-gants
- Masques
- Accessoires

### Emplacements (6 zones)
- Zone A - Rack 12 (A-12)
- Zone B - Rack 03 (B-03)
- Zone A - Rack 08 (A-08)
- Zone C - Rack 01 (C-01)
- Zone D - Rack 05 (D-05)
- Zone E - Quarantaine (E-02)

### Mouvements (6 mouvements de démonstration)
- Entrées, Sorties, Transferts avec différents statuts

---

## 🔧 CONFIGURATION

### Seuils de Stock (`src/config/stock-thresholds.ts`)

```typescript
export const STOCK_THRESHOLDS = {
  CRITICAL_AUTONOMY_HOURS: 72,   // 3 jours
  WARNING_AUTONOMY_HOURS: 168,   // 7 jours
  
  COLORS: {
    CRITICAL: { bg: "bg-red-50", border: "border-red-200", text: "text-red-600", icon: "🔴" },
    WARNING: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-600", icon: "🟠" },
    SECURE: { bg: "bg-green-50", border: "border-green-200", text: "text-green-600", icon: "🟢" },
  },
  
  MESSAGES: {
    CRITICAL: "Action urgente requise - Commande immédiate",
    WARNING: "Prévoir une commande dans les prochains jours",
    SECURE: "Stock sécurisé - Aucune action requise",
  },
};
```

---

## 🧪 TESTS

### Fichiers de Tests
- `src/lib/stock-utils.test.ts` - Tests des calculs de stock
- `src/lib/daily-consumption.test.ts` - Tests de consommation journalière
- `src/test/occupancy.test.ts` - Tests d'occupation des emplacements
- `src/test/example.test.ts` - Tests d'exemple

### Commandes
```bash
npm run test        # Exécuter les tests une fois
npm run test:watch  # Mode watch
```

---

## 📝 NOTES IMPORTANTES

### Logique Métier Critique

1. **Système Multi-Emplacements**
   - Un article peut être stocké dans plusieurs emplacements
   - `article.locations[]` contient la répartition
   - `article.stock` = somme de toutes les locations

2. **Workflow des Sorties**
   - Création → Statut "En attente de validation Qualité"
   - Validation → Déduction du stock + Statut "Terminé"
   - Rejet → Annulation + Statut "Rejeté"

3. **Ajustements d'Inventaire**
   - **Surplus:** Ajoute au stock immédiatement (bypass qualité)
   - **Manquant:** Retire du stock immédiatement (bypass qualité)
   - Utilisé pour corriger les écarts d'inventaire

4. **Calcul d'Occupation**
   - Recalculé automatiquement après chaque mouvement
   - Basé sur la somme des `article.locations[].quantite`
   - Fonction: `recalculateAllOccupancies()`

5. **Stock Prédictif**
   - Autonomie = (Stock / CJE) × 24 heures
   - Statut basé sur autonomie ET seuil
   - Alertes visuelles sur Dashboard et Articles

---

## 🚀 PROCHAINES ÉTAPES SUGGÉRÉES

### Phase 1: Système de Rôles
1. Créer le hook `usePermissions`
2. Ajouter les rôles dans `AuthContext`
3. Protéger les boutons d'action
4. Créer `AdminRoute` pour les routes sensibles

### Phase 2: Gestion des Utilisateurs
1. Créer une page de gestion des utilisateurs (AdminPage)
2. CRUD utilisateurs avec rôles
3. Système de permissions granulaires

### Phase 3: Audit et Sécurité
1. Implémenter le système d'audit trail
2. Logger toutes les actions critiques
3. Afficher les logs dans AdminPage

### Phase 4: Backend (Optionnel)
1. Intégrer Supabase pour la persistance
2. Authentification JWT
3. API REST pour les opérations CRUD
4. Synchronisation temps réel

---

## 📞 CONTACT ET SUPPORT

**Projet:** Top Gloves - Gestion de Stock  
**Version:** 1.0.0  
**Date:** 27 février 2026

---

**FIN DU MANIFEST**

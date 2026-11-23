export interface PermissionDef {
  id: string;
  label: string;
  description: string;
  group: string;
  action: "view" | "create" | "edit" | "delete" | "special";
}

export const PERMISSION_GROUPS = [
  { key: "general", label: "Général" },
  { key: "articles", label: "Articles" },
  { key: "categories", label: "Catégories" },
  { key: "emplacements", label: "Emplacements" },
  { key: "fournisseurs", label: "Fournisseurs" },
  { key: "destinations", label: "Destinations" },
  { key: "unites", label: "Unités" },
  { key: "mouvements", label: "Mouvements" },
  { key: "inventaire", label: "Inventaire" },
  { key: "administration", label: "Administration" },
] as const;

export const PERMISSIONS: PermissionDef[] = [
  // Général
  { id: "dashboard", label: "Tableau de Bord", description: "Accès au tableau de bord", group: "general", action: "view" },

  // Articles
  { id: "articles", label: "Voir Articles", description: "Consulter la liste des articles", group: "articles", action: "view" },
  { id: "articles.create", label: "Créer Articles", description: "Créer de nouveaux articles", group: "articles", action: "create" },
  { id: "articles.edit", label: "Modifier Articles", description: "Modifier les articles existants", group: "articles", action: "edit" },
  { id: "articles.delete", label: "Supprimer Articles", description: "Supprimer des articles", group: "articles", action: "delete" },
  { id: "articles.export", label: "Exporter Articles", description: "Exporter les articles en CSV/Excel", group: "articles", action: "special" },

  // Catégories
  { id: "categories", label: "Voir Catégories", description: "Consulter les catégories", group: "categories", action: "view" },
  { id: "categories.create", label: "Créer Catégories", description: "Créer de nouvelles catégories", group: "categories", action: "create" },
  { id: "categories.edit", label: "Modifier Catégories", description: "Modifier les catégories existantes", group: "categories", action: "edit" },
  { id: "categories.delete", label: "Supprimer Catégories", description: "Supprimer des catégories", group: "categories", action: "delete" },

  // Emplacements
  { id: "emplacements", label: "Voir Emplacements", description: "Consulter les emplacements", group: "emplacements", action: "view" },
  { id: "emplacements.create", label: "Créer Emplacements", description: "Créer de nouveaux emplacements", group: "emplacements", action: "create" },
  { id: "emplacements.edit", label: "Modifier Emplacements", description: "Modifier les emplacements existants", group: "emplacements", action: "edit" },
  { id: "emplacements.delete", label: "Supprimer Emplacements", description: "Supprimer des emplacements", group: "emplacements", action: "delete" },

  // Fournisseurs
  { id: "fournisseurs", label: "Voir Fournisseurs", description: "Consulter les fournisseurs", group: "fournisseurs", action: "view" },
  { id: "fournisseurs.create", label: "Créer Fournisseurs", description: "Créer de nouveaux fournisseurs", group: "fournisseurs", action: "create" },
  { id: "fournisseurs.edit", label: "Modifier Fournisseurs", description: "Modifier les fournisseurs existants", group: "fournisseurs", action: "edit" },
  { id: "fournisseurs.delete", label: "Supprimer Fournisseurs", description: "Supprimer des fournisseurs", group: "fournisseurs", action: "delete" },

  // Destinations
  { id: "destinations", label: "Voir Destinations", description: "Consulter les destinations", group: "destinations", action: "view" },
  { id: "destinations.create", label: "Créer Destinations", description: "Créer de nouvelles destinations", group: "destinations", action: "create" },
  { id: "destinations.edit", label: "Modifier Destinations", description: "Modifier les destinations existantes", group: "destinations", action: "edit" },
  { id: "destinations.delete", label: "Supprimer Destinations", description: "Supprimer des destinations", group: "destinations", action: "delete" },

  // Unités
  { id: "unites", label: "Voir Unités", description: "Consulter les unités de mesure", group: "unites", action: "view" },
  { id: "unites.create", label: "Créer Unités", description: "Créer de nouvelles unités", group: "unites", action: "create" },
  { id: "unites.edit", label: "Modifier Unités", description: "Modifier les unités existantes", group: "unites", action: "edit" },
  { id: "unites.delete", label: "Supprimer Unités", description: "Supprimer des unités", group: "unites", action: "delete" },

  // Mouvements
  { id: "mouvements", label: "Voir Mouvements", description: "Consulter les mouvements de stock", group: "mouvements", action: "view" },
  { id: "mouvements.create", label: "Créer Mouvements", description: "Créer des mouvements", group: "mouvements", action: "create" },
  { id: "mouvements.edit", label: "Modifier Mouvements", description: "Modifier les mouvements", group: "mouvements", action: "edit" },
  { id: "mouvements.delete", label: "Supprimer Mouvements", description: "Supprimer des mouvements", group: "mouvements", action: "delete" },
  { id: "mouvements.submit", label: "Soumettre Mouvements", description: "Soumettre des mouvements pour validation", group: "mouvements", action: "special" },
  { id: "mouvements.validate", label: "Valider Mouvements", description: "Valider les mouvements soumis", group: "mouvements", action: "special" },
  { id: "mouvements.qc", label: "Contrôle Qualité", description: "Valider les sorties QC", group: "mouvements", action: "special" },
  { id: "mouvements.revert", label: "Annuler Mouvements", description: "Annuler des mouvements validés", group: "mouvements", action: "special" },
  { id: "mouvements.pdf", label: "Générer PDF Mouvements", description: "Générer des bons de sortie/entrée en PDF", group: "mouvements", action: "special" },

  // Inventaire
  { id: "inventaire", label: "Voir Inventaire", description: "Accès à l'inventaire", group: "inventaire", action: "view" },
  { id: "inventaire.create", label: "Créer Inventaire", description: "Créer des inventaires", group: "inventaire", action: "create" },
  { id: "inventaire.adjust", label: "Ajuster Inventaire", description: "Effectuer des ajustements", group: "inventaire", action: "special" },
  { id: "inventaire.pdf", label: "Générer PDF Inventaire", description: "Générer des rapports d'inventaire en PDF", group: "inventaire", action: "special" },

  // Administration
  { id: "admin", label: "Administration", description: "Accès complet à l'administration", group: "administration", action: "special" },
  { id: "staff", label: "Voir Personnel", description: "Consulter le personnel", group: "administration", action: "view" },
  { id: "staff.create", label: "Créer Personnel", description: "Ajouter des membres du personnel", group: "administration", action: "create" },
  { id: "staff.edit", label: "Modifier Personnel", description: "Modifier les membres du personnel", group: "administration", action: "edit" },
  { id: "staff.delete", label: "Supprimer Personnel", description: "Supprimer des membres du personnel", group: "administration", action: "delete" },
];

export type RoleName = "Administrateur" | "Gestionnaire" | "Contrôleur Qualité" | "Opérateur" | "Magasinier";

export const ROLES: RoleName[] = [
  "Administrateur",
  "Gestionnaire",
  "Contrôleur Qualité",
  "Opérateur",
  "Magasinier",
];

const ALL_PERMISSION_IDS = PERMISSIONS.map(p => p.id);

export const ROLE_TEMPLATES: Record<RoleName, string[]> = {
  "Administrateur": ALL_PERMISSION_IDS,
  
  "Gestionnaire": ALL_PERMISSION_IDS.filter(id => 
    id !== "admin" && 
    !id.startsWith("staff") &&
    id !== "categories.delete" &&
    id !== "emplacements.delete" &&
    id !== "fournisseurs.delete" &&
    id !== "destinations.delete" &&
    id !== "unites.delete"
  ),
  
  "Contrôleur Qualité": [
    "dashboard",
    "articles",
    "mouvements",
    "mouvements.qc",
    "mouvements.revert",
    "mouvements.pdf",
  ],
  
  "Opérateur": [
    "dashboard",
    "articles",
    "mouvements",
    "mouvements.create",
    "mouvements.submit",
    "inventaire",
  ],
  
  "Magasinier": [
    "dashboard",
    "articles",
    "emplacements",
    "mouvements",
    "mouvements.create",
    "mouvements.submit",
    "inventaire",
    "inventaire.create",
    "inventaire.adjust",
  ],
};

export function getRoleTemplate(role: string): string[] {
  const template = ROLE_TEMPLATES[role as RoleName];
  return template ? [...template] : [];
}

export function isCustomized(role: string, selected: string[]): boolean {
  const template = ROLE_TEMPLATES[role as RoleName];
  if (!template) return selected.length > 0;
  
  const templateSet = new Set(template);
  const selectedSet = new Set(selected);
  
  if (templateSet.size !== selectedSet.size) return true;
  
  for (const id of templateSet) {
    if (!selectedSet.has(id)) return true;
  }
  
  return false;
}

export function normalizePermissions(ids: string[]): string[] {
  const validIds = new Set(PERMISSIONS.map(p => p.id));
  const seen = new Set<string>();
  const result: string[] = [];
  
  for (const permission of PERMISSIONS) {
    if (ids.includes(permission.id) && !seen.has(permission.id)) {
      seen.add(permission.id);
      result.push(permission.id);
    }
  }
  
  return result;
}

export function withViewDependency(selected: string[], id: string, checked: boolean): string[] {
  const updatedSet = new Set(selected);
  
  if (checked) {
    updatedSet.add(id);
    
    // Add view dependency if checking a non-view permission
    if (id.includes(".")) {
      const baseId = id.split(".")[0];
      if (PERMISSIONS.find(p => p.id === baseId)) {
        updatedSet.add(baseId);
      }
    }
  } else {
    updatedSet.delete(id);
    
    // Remove all dependent permissions if unchecking a view permission
    if (!id.includes(".")) {
      const prefix = id + ".";
      for (const selectedId of Array.from(updatedSet)) {
        if (selectedId.startsWith(prefix)) {
          updatedSet.delete(selectedId);
        }
      }
    }
  }
  
  return normalizePermissions(Array.from(updatedSet));
}

export interface PermissionMatrixRow {
  group: string;
  label: string;
  view?: PermissionDef;
  create?: PermissionDef;
  edit?: PermissionDef;
  delete?: PermissionDef;
  specials: PermissionDef[];
}

export function getPermissionMatrix(): PermissionMatrixRow[] {
  const rows: PermissionMatrixRow[] = [];
  
  for (const group of PERMISSION_GROUPS) {
    const groupPermissions = PERMISSIONS.filter(p => p.group === group.key);
    
    const row: PermissionMatrixRow = {
      group: group.key,
      label: group.label,
      specials: [],
    };
    
    for (const perm of groupPermissions) {
      if (perm.action === "view") {
        row.view = perm;
      } else if (perm.action === "create") {
        row.create = perm;
      } else if (perm.action === "edit") {
        row.edit = perm;
      } else if (perm.action === "delete") {
        row.delete = perm;
      } else if (perm.action === "special") {
        row.specials.push(perm);
      }
    }
    
    rows.push(row);
  }
  
  return rows;
}

import { describe, it, expect } from "vitest";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_TEMPLATES,
  ROLES,
  getRoleTemplate,
  isCustomized,
  normalizePermissions,
  withViewDependency,
  getPermissionMatrix,
} from "./permissions";

describe("Permissions Data Layer", () => {
  const LEGACY_IDS = [
    "dashboard",
    "articles",
    "articles.create",
    "articles.edit",
    "articles.delete",
    "categories",
    "emplacements",
    "mouvements",
    "mouvements.create",
    "mouvements.edit",
    "mouvements.delete",
    "mouvements.qc",
    "inventaire",
    "inventaire.adjust",
    "staff",
    "admin",
  ];

  describe("PERMISSIONS constant", () => {
    it("should contain all 16 legacy permission ids", () => {
      const permissionIds = PERMISSIONS.map((p) => p.id);
      for (const legacyId of LEGACY_IDS) {
        expect(permissionIds).toContain(legacyId);
      }
    });

    it("should have unique ids", () => {
      const ids = PERMISSIONS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid group references", () => {
      const validGroups = new Set(PERMISSION_GROUPS.map((g) => g.key));
      for (const perm of PERMISSIONS) {
        expect(validGroups.has(perm.group)).toBe(true);
      }
    });
  });

  describe("ROLE_TEMPLATES", () => {
    it("should have all permission ids valid", () => {
      const validIds = new Set(PERMISSIONS.map((p) => p.id));
      
      for (const role of ROLES) {
        const template = ROLE_TEMPLATES[role];
        for (const id of template) {
          expect(validIds.has(id)).toBe(true);
        }
      }
    });

    it("Administrateur should have all permissions", () => {
      const allIds = PERMISSIONS.map((p) => p.id);
      const adminTemplate = ROLE_TEMPLATES["Administrateur"];
      
      expect(adminTemplate.length).toBe(allIds.length);
      
      for (const id of allIds) {
        expect(adminTemplate).toContain(id);
      }
    });

    it("Gestionnaire should not have admin, staff.*, and specific delete permissions", () => {
      const template = ROLE_TEMPLATES["Gestionnaire"];
      
      expect(template).not.toContain("admin");
      expect(template).not.toContain("staff");
      expect(template).not.toContain("staff.create");
      expect(template).not.toContain("staff.edit");
      expect(template).not.toContain("staff.delete");
      expect(template).not.toContain("categories.delete");
      expect(template).not.toContain("emplacements.delete");
      expect(template).not.toContain("fournisseurs.delete");
      expect(template).not.toContain("destinations.delete");
      expect(template).not.toContain("unites.delete");
    });

    it("Opérateur should not have mouvements.validate or mouvements.qc", () => {
      const template = ROLE_TEMPLATES["Opérateur"];
      
      expect(template).not.toContain("mouvements.validate");
      expect(template).not.toContain("mouvements.qc");
    });

    it("Contrôleur Qualité should have specific permissions only", () => {
      const template = ROLE_TEMPLATES["Contrôleur Qualité"];
      
      expect(template).toContain("dashboard");
      expect(template).toContain("articles");
      expect(template).toContain("mouvements");
      expect(template).toContain("mouvements.qc");
      expect(template).toContain("mouvements.revert");
      expect(template).toContain("mouvements.pdf");
      
      expect(template).not.toContain("mouvements.create");
      expect(template).not.toContain("admin");
    });

    it("Magasinier should have inventory and emplacement permissions", () => {
      const template = ROLE_TEMPLATES["Magasinier"];
      
      expect(template).toContain("dashboard");
      expect(template).toContain("articles");
      expect(template).toContain("emplacements");
      expect(template).toContain("mouvements");
      expect(template).toContain("mouvements.create");
      expect(template).toContain("mouvements.submit");
      expect(template).toContain("inventaire");
      expect(template).toContain("inventaire.create");
      expect(template).toContain("inventaire.adjust");
    });
  });

  describe("getRoleTemplate", () => {
    it("should return a copy of the template array", () => {
      const template1 = getRoleTemplate("Administrateur");
      const template2 = getRoleTemplate("Administrateur");
      
      expect(template1).toEqual(template2);
      expect(template1).not.toBe(template2);
      
      template1.push("fake-permission");
      expect(template2).not.toContain("fake-permission");
      expect(getRoleTemplate("Administrateur")).not.toContain("fake-permission");
    });

    it("should return empty array for unknown role", () => {
      expect(getRoleTemplate("InvalidRole")).toEqual([]);
      expect(getRoleTemplate("")).toEqual([]);
    });

    it("should return correct template for valid roles", () => {
      for (const role of ROLES) {
        const template = getRoleTemplate(role);
        expect(template).toEqual(ROLE_TEMPLATES[role]);
      }
    });
  });

  describe("isCustomized", () => {
    it("should return false when selected matches template exactly", () => {
      const template = getRoleTemplate("Gestionnaire");
      expect(isCustomized("Gestionnaire", template)).toBe(false);
    });

    it("should return false when selected matches template in different order", () => {
      const template = getRoleTemplate("Opérateur");
      const shuffled = [...template].reverse();
      expect(isCustomized("Opérateur", shuffled)).toBe(false);
    });

    it("should return true when selected has extra permissions", () => {
      const template = getRoleTemplate("Opérateur");
      const withExtra = [...template, "admin"];
      expect(isCustomized("Opérateur", withExtra)).toBe(true);
    });

    it("should return true when selected has fewer permissions", () => {
      const template = getRoleTemplate("Gestionnaire");
      const withLess = template.slice(0, template.length - 1);
      expect(isCustomized("Gestionnaire", withLess)).toBe(true);
    });

    it("should return true when selected has different permissions", () => {
      const template = getRoleTemplate("Opérateur");
      const different = [...template.slice(0, -1), "admin"];
      expect(isCustomized("Opérateur", different)).toBe(true);
    });

    it("should return selected.length > 0 for unknown role", () => {
      expect(isCustomized("InvalidRole", [])).toBe(false);
      expect(isCustomized("InvalidRole", ["dashboard"])).toBe(true);
    });
  });

  describe("normalizePermissions", () => {
    it("should remove unknown permission ids", () => {
      const input = ["dashboard", "unknown-permission", "articles"];
      const result = normalizePermissions(input);
      
      expect(result).toContain("dashboard");
      expect(result).toContain("articles");
      expect(result).not.toContain("unknown-permission");
    });

    it("should remove duplicate ids", () => {
      const input = ["dashboard", "articles", "dashboard", "articles.create"];
      const result = normalizePermissions(input);
      
      expect(result).toEqual(["dashboard", "articles", "articles.create"]);
    });

    it("should maintain PERMISSIONS order", () => {
      const input = ["mouvements", "articles", "dashboard"];
      const result = normalizePermissions(input);
      
      expect(result).toEqual(["dashboard", "articles", "mouvements"]);
    });

    it("should handle empty array", () => {
      expect(normalizePermissions([])).toEqual([]);
    });

    it("should handle all unknown ids", () => {
      const input = ["fake1", "fake2", "fake3"];
      expect(normalizePermissions(input)).toEqual([]);
    });
  });

  describe("withViewDependency", () => {
    it("should add view permission when checking a child permission", () => {
      const result = withViewDependency([], "articles.create", true);
      
      expect(result).toContain("articles");
      expect(result).toContain("articles.create");
    });

    it("should not add view if already present", () => {
      const result = withViewDependency(["articles"], "articles.create", true);
      
      expect(result).toContain("articles");
      expect(result).toContain("articles.create");
      expect(result.filter(id => id === "articles").length).toBe(1);
    });

    it("should remove all child permissions when unchecking view", () => {
      const selected = ["articles", "articles.create", "articles.edit", "articles.delete"];
      const result = withViewDependency(selected, "articles", false);
      
      expect(result).not.toContain("articles");
      expect(result).not.toContain("articles.create");
      expect(result).not.toContain("articles.edit");
      expect(result).not.toContain("articles.delete");
    });

    it("should not affect other pages when unchecking view", () => {
      const selected = ["articles", "articles.create", "mouvements", "mouvements.create"];
      const result = withViewDependency(selected, "articles", false);
      
      expect(result).not.toContain("articles");
      expect(result).not.toContain("articles.create");
      expect(result).toContain("mouvements");
      expect(result).toContain("mouvements.create");
    });

    it("should handle checking a base permission", () => {
      const result = withViewDependency([], "dashboard", true);
      
      expect(result).toEqual(["dashboard"]);
    });

    it("should handle unchecking a child permission", () => {
      const selected = ["articles", "articles.create"];
      const result = withViewDependency(selected, "articles.create", false);
      
      expect(result).toContain("articles");
      expect(result).not.toContain("articles.create");
    });

    it("should return normalized result", () => {
      const selected = ["mouvements", "articles", "dashboard"];
      const result = withViewDependency(selected, "articles.create", true);
      
      expect(result[0]).toBe("dashboard");
      expect(result[1]).toBe("articles");
      expect(result[2]).toBe("articles.create");
    });
  });

  describe("getPermissionMatrix", () => {
    it("should return one row per group", () => {
      const matrix = getPermissionMatrix();
      
      expect(matrix.length).toBe(PERMISSION_GROUPS.length);
      
      for (let i = 0; i < PERMISSION_GROUPS.length; i++) {
        expect(matrix[i].group).toBe(PERMISSION_GROUPS[i].key);
        expect(matrix[i].label).toBe(PERMISSION_GROUPS[i].label);
      }
    });

    it("should include every permission id exactly once", () => {
      const matrix = getPermissionMatrix();
      const foundIds = new Set<string>();
      
      for (const row of matrix) {
        if (row.view) foundIds.add(row.view.id);
        if (row.create) foundIds.add(row.create.id);
        if (row.edit) foundIds.add(row.edit.id);
        if (row.delete) foundIds.add(row.delete.id);
        for (const special of row.specials) {
          foundIds.add(special.id);
        }
      }
      
      const allIds = new Set(PERMISSIONS.map(p => p.id));
      expect(foundIds.size).toBe(allIds.size);
      
      for (const id of allIds) {
        expect(foundIds.has(id)).toBe(true);
      }
    });

    it("should categorize permissions by action type", () => {
      const matrix = getPermissionMatrix();
      
      const articlesRow = matrix.find(r => r.group === "articles");
      expect(articlesRow).toBeDefined();
      expect(articlesRow!.view?.id).toBe("articles");
      expect(articlesRow!.create?.id).toBe("articles.create");
      expect(articlesRow!.edit?.id).toBe("articles.edit");
      expect(articlesRow!.delete?.id).toBe("articles.delete");
      expect(articlesRow!.specials.length).toBe(1);
      expect(articlesRow!.specials[0].id).toBe("articles.export");
    });

    it("should handle groups with only view permissions", () => {
      const matrix = getPermissionMatrix();
      
      const generalRow = matrix.find(r => r.group === "general");
      expect(generalRow).toBeDefined();
      expect(generalRow!.view?.id).toBe("dashboard");
      expect(generalRow!.create).toBeUndefined();
      expect(generalRow!.edit).toBeUndefined();
      expect(generalRow!.delete).toBeUndefined();
      expect(generalRow!.specials.length).toBe(0);
    });

    it("should handle groups with special permissions", () => {
      const matrix = getPermissionMatrix();
      
      const mouvementsRow = matrix.find(r => r.group === "mouvements");
      expect(mouvementsRow).toBeDefined();
      expect(mouvementsRow!.specials.length).toBeGreaterThan(0);
      
      const specialIds = mouvementsRow!.specials.map(s => s.id);
      expect(specialIds).toContain("mouvements.qc");
      expect(specialIds).toContain("mouvements.submit");
      expect(specialIds).toContain("mouvements.validate");
    });
  });
});

import { describe, it, expect } from "vitest";
import { parseMovementDate, formatMovementDateTime, getRecentMovements } from "./dashboard-utils";

describe("Dashboard Utils", () => {
  describe("parseMovementDate", () => {
    it("should parse valid datetime with local components", () => {
      const date = parseMovementDate("2026-03-15 14:30:45");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2026);
      expect(date!.getMonth()).toBe(2); // March = 2 (0-indexed)
      expect(date!.getDate()).toBe(15);
      expect(date!.getHours()).toBe(14);
      expect(date!.getMinutes()).toBe(30);
      expect(date!.getSeconds()).toBe(45);
    });

    it("should parse date-only format with default time", () => {
      const date = parseMovementDate("2026-11-23");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2026);
      expect(date!.getMonth()).toBe(10); // November = 10
      expect(date!.getDate()).toBe(23);
      expect(date!.getHours()).toBe(0);
      expect(date!.getMinutes()).toBe(0);
      expect(date!.getSeconds()).toBe(0);
    });

    it("should parse datetime with HH:MM format", () => {
      const date = parseMovementDate("2026-01-01 09:15");
      expect(date).not.toBeNull();
      expect(date!.getHours()).toBe(9);
      expect(date!.getMinutes()).toBe(15);
      expect(date!.getSeconds()).toBe(0);
    });

    it("should return null for invalid date string", () => {
      expect(parseMovementDate("invalid")).toBeNull();
      expect(parseMovementDate("2026-13-01 10:00:00")).toBeNull(); // Invalid month
      expect(parseMovementDate("2026-02-30 10:00:00")).toBeNull(); // Invalid day
      expect(parseMovementDate("2026-01-01 25:00:00")).toBeNull(); // Invalid hour
      expect(parseMovementDate("2026-01-01 10:60:00")).toBeNull(); // Invalid minute
      expect(parseMovementDate("")).toBeNull();
    });

    it("should return null for null/undefined input", () => {
      expect(parseMovementDate(null as any)).toBeNull();
      expect(parseMovementDate(undefined as any)).toBeNull();
    });
  });

  describe("formatMovementDateTime", () => {
    it("should format valid datetime as DD/MM/YYYY HH:MM", () => {
      expect(formatMovementDateTime("2026-03-15 14:30:45")).toBe("15/03/2026 14:30");
      expect(formatMovementDateTime("2026-11-23 09:05:00")).toBe("23/11/2026 09:05");
    });

    it("should format date-only with default time", () => {
      expect(formatMovementDateTime("2026-12-31")).toBe("31/12/2026 00:00");
    });

    it("should return '—' for invalid date", () => {
      expect(formatMovementDateTime("invalid")).toBe("—");
      expect(formatMovementDateTime("2026-13-01 10:00:00")).toBe("—");
      expect(formatMovementDateTime("")).toBe("—");
    });
  });

  describe("getRecentMovements", () => {
    it("should sort movements by date descending", () => {
      const movements = [
        { id: "1", date: "2026-03-01 10:00:00", article: "A" },
        { id: "2", date: "2026-03-03 10:00:00", article: "B" },
        { id: "3", date: "2026-03-02 10:00:00", article: "C" },
      ];

      const result = getRecentMovements(movements, 10);

      expect(result[0].id).toBe("2"); // Most recent
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1"); // Oldest
    });

    it("should place invalid dates last", () => {
      const movements = [
        { id: "1", date: "2026-03-01 10:00:00", article: "A" },
        { id: "2", date: "invalid", article: "B" },
        { id: "3", date: "2026-03-02 10:00:00", article: "C" },
      ];

      const result = getRecentMovements(movements, 10);

      expect(result[0].id).toBe("3"); // Most recent valid
      expect(result[1].id).toBe("1");
      expect(result[2].id).toBe("2"); // Invalid last
    });

    it("should respect limit parameter", () => {
      const movements = [
        { id: "1", date: "2026-03-01 10:00:00", article: "A" },
        { id: "2", date: "2026-03-02 10:00:00", article: "B" },
        { id: "3", date: "2026-03-03 10:00:00", article: "C" },
        { id: "4", date: "2026-03-04 10:00:00", article: "D" },
      ];

      const result = getRecentMovements(movements, 2);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe("4"); // Most recent
      expect(result[1].id).toBe("3");
    });

    it("should not mutate input array", () => {
      const movements = [
        { id: "1", date: "2026-03-01 10:00:00", article: "A" },
        { id: "2", date: "2026-03-02 10:00:00", article: "B" },
      ];

      const original = [...movements];
      getRecentMovements(movements, 10);

      expect(movements).toEqual(original);
      expect(movements[0].id).toBe("1"); // Order unchanged
    });

    it("should handle empty array", () => {
      const result = getRecentMovements([], 10);
      expect(result).toEqual([]);
    });

    it("should handle limit larger than array length", () => {
      const movements = [
        { id: "1", date: "2026-03-01 10:00:00", article: "A" },
      ];

      const result = getRecentMovements(movements, 10);
      expect(result.length).toBe(1);
    });
  });
});

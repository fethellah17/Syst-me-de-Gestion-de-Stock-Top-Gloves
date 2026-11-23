import { describe, it, expect } from "vitest";
import { buildLoginEvent, sortEventsDesc, type LoginEvent } from "./login-history";

describe("Login History", () => {
  describe("buildLoginEvent", () => {
    it("should trim user name", () => {
      const event = buildLoginEvent({
        user: "  John Doe  ",
        role: "Opérateur",
        type: "login",
      });
      
      expect(event.user).toBe("John Doe");
    });

    it("should use provided date if given", () => {
      const fixedDate = new Date("2026-02-24T10:30:00Z");
      const event = buildLoginEvent({
        user: "John",
        role: "Opérateur",
        type: "login",
        now: fixedDate,
      });
      
      expect(event.date).toBe(fixedDate.toISOString());
    });

    it("should use current date if not provided", () => {
      const before = new Date();
      const event = buildLoginEvent({
        user: "John",
        role: "Opérateur",
        type: "login",
      });
      const after = new Date();
      
      const eventDate = new Date(event.date);
      expect(eventDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(eventDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should use provided id if given", () => {
      const event = buildLoginEvent({
        user: "John",
        role: "Opérateur",
        type: "login",
        id: "custom-id-123",
      });
      
      expect(event.id).toBe("custom-id-123");
    });

    it("should generate id with fallback if crypto.randomUUID not available", () => {
      const event = buildLoginEvent({
        user: "John",
        role: "Opérateur",
        type: "login",
      });
      
      expect(event.id).toBeTruthy();
      expect(typeof event.id).toBe("string");
      expect(event.id.length).toBeGreaterThan(0);
    });

    it("should create login event", () => {
      const event = buildLoginEvent({
        user: "John",
        role: "Administrateur",
        type: "login",
      });
      
      expect(event.type).toBe("login");
      expect(event.role).toBe("Administrateur");
    });

    it("should create logout event", () => {
      const event = buildLoginEvent({
        user: "John",
        role: "Gestionnaire",
        type: "logout",
      });
      
      expect(event.type).toBe("logout");
      expect(event.role).toBe("Gestionnaire");
    });
  });

  describe("sortEventsDesc", () => {
    it("should sort events by date descending (newest first)", () => {
      const events: LoginEvent[] = [
        buildLoginEvent({ user: "A", role: "Opérateur", type: "login", now: new Date("2026-02-24T10:00:00Z"), id: "1" }),
        buildLoginEvent({ user: "B", role: "Opérateur", type: "login", now: new Date("2026-02-24T12:00:00Z"), id: "2" }),
        buildLoginEvent({ user: "C", role: "Opérateur", type: "login", now: new Date("2026-02-24T11:00:00Z"), id: "3" }),
      ];
      
      const sorted = sortEventsDesc(events);
      
      expect(sorted[0].id).toBe("2"); // 12:00 - newest
      expect(sorted[1].id).toBe("3"); // 11:00
      expect(sorted[2].id).toBe("1"); // 10:00 - oldest
    });

    it("should not mutate the original array", () => {
      const events: LoginEvent[] = [
        buildLoginEvent({ user: "A", role: "Opérateur", type: "login", now: new Date("2026-02-24T10:00:00Z"), id: "1" }),
        buildLoginEvent({ user: "B", role: "Opérateur", type: "login", now: new Date("2026-02-24T12:00:00Z"), id: "2" }),
      ];
      
      const originalOrder = events.map(e => e.id);
      const sorted = sortEventsDesc(events);
      
      expect(events.map(e => e.id)).toEqual(originalOrder);
      expect(sorted).not.toBe(events);
    });

    it("should handle empty array", () => {
      const sorted = sortEventsDesc([]);
      expect(sorted).toEqual([]);
    });

    it("should handle single event", () => {
      const events = [
        buildLoginEvent({ user: "A", role: "Opérateur", type: "login", id: "1" }),
      ];
      
      const sorted = sortEventsDesc(events);
      expect(sorted.length).toBe(1);
      expect(sorted[0].id).toBe("1");
    });
  });
});

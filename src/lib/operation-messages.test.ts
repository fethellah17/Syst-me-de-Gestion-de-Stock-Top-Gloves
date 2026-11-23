import { describe, it, expect } from "vitest";
import {
  buildOperationMessage,
  sortMessagesAsc,
  redoMessage,
  AUTO_MESSAGES,
  type OperationMessage,
} from "./operation-messages";

describe("operation-messages", () => {
  describe("buildOperationMessage", () => {
    it("should return null for empty text", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "",
      });
      expect(result).toBeNull();
    });

    it("should return null for whitespace-only text", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "   \n\t  ",
      });
      expect(result).toBeNull();
    });

    it("should use 'Gestionnaire' as default author", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
      });
      expect(result).not.toBeNull();
      expect(result?.author).toBe("Gestionnaire");
    });

    it("should use provided author", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
        author: "John Doe",
      });
      expect(result).not.toBeNull();
      expect(result?.author).toBe("John Doe");
    });

    it("should trim author and fallback to 'Gestionnaire' if empty after trim", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
        author: "   ",
      });
      expect(result).not.toBeNull();
      expect(result?.author).toBe("Gestionnaire");
    });

    it("should default kind to 'note'", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
      });
      expect(result).not.toBeNull();
      expect(result?.kind).toBe("note");
    });

    it("should use provided kind", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
        kind: "auto",
      });
      expect(result).not.toBeNull();
      expect(result?.kind).toBe("auto");
    });

    it("should use explicit now date", () => {
      const testDate = new Date("2026-03-15T10:30:00.000Z");
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
        now: testDate,
      });
      expect(result).not.toBeNull();
      expect(result?.date).toBe("2026-03-15T10:30:00.000Z");
    });

    it("should trim text", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "  Test message  ",
      });
      expect(result).not.toBeNull();
      expect(result?.text).toBe("Test message");
    });

    it("should use provided id", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
        id: "custom-id-123",
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe("custom-id-123");
    });

    it("should generate id when not provided", () => {
      const result = buildOperationMessage({
        operationId: 1,
        text: "Test message",
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBeTruthy();
      expect(typeof result?.id).toBe("string");
    });
  });

  describe("sortMessagesAsc", () => {
    it("should sort messages oldest to newest", () => {
      const messages: OperationMessage[] = [
        {
          id: "1",
          operationId: 1,
          author: "User A",
          text: "Message 1",
          date: "2026-03-15T12:00:00.000Z",
          kind: "note",
        },
        {
          id: "2",
          operationId: 1,
          author: "User B",
          text: "Message 2",
          date: "2026-03-15T10:00:00.000Z",
          kind: "note",
        },
        {
          id: "3",
          operationId: 1,
          author: "User C",
          text: "Message 3",
          date: "2026-03-15T14:00:00.000Z",
          kind: "note",
        },
      ];

      const sorted = sortMessagesAsc(messages);
      expect(sorted[0].id).toBe("2"); // 10:00
      expect(sorted[1].id).toBe("1"); // 12:00
      expect(sorted[2].id).toBe("3"); // 14:00
    });

    it("should not mutate the input array", () => {
      const messages: OperationMessage[] = [
        {
          id: "1",
          operationId: 1,
          author: "User A",
          text: "Message 1",
          date: "2026-03-15T12:00:00.000Z",
          kind: "note",
        },
        {
          id: "2",
          operationId: 1,
          author: "User B",
          text: "Message 2",
          date: "2026-03-15T10:00:00.000Z",
          kind: "note",
        },
      ];

      const original = [...messages];
      sortMessagesAsc(messages);
      
      expect(messages).toEqual(original);
      expect(messages[0].id).toBe("1");
    });

    it("should handle empty array", () => {
      const sorted = sortMessagesAsc([]);
      expect(sorted).toEqual([]);
    });

    it("should handle single message", () => {
      const messages: OperationMessage[] = [
        {
          id: "1",
          operationId: 1,
          author: "User A",
          text: "Message 1",
          date: "2026-03-15T12:00:00.000Z",
          kind: "note",
        },
      ];

      const sorted = sortMessagesAsc(messages);
      expect(sorted).toEqual(messages);
    });
  });

  describe("redoMessage", () => {
    it("should format message correctly", () => {
      expect(redoMessage("Gants Nitrile M")).toBe("Contrôle refait: Gants Nitrile M");
      expect(redoMessage("Article XYZ")).toBe("Contrôle refait: Article XYZ");
    });
  });

  describe("AUTO_MESSAGES", () => {
    it("should have all expected messages", () => {
      expect(AUTO_MESSAGES.submitted).toBe("Opération soumise pour inspection");
      expect(AUTO_MESSAGES.sentToManager).toBe("Opération transmise au gestionnaire");
      expect(AUTO_MESSAGES.validated).toBe("Opération validée");
      expect(AUTO_MESSAGES.revertedToDraft).toBe("Retour au brouillon");
      expect(AUTO_MESSAGES.revertedToInspection).toBe("Retour en inspection");
    });
  });
});

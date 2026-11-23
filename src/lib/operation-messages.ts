export type OperationMessageKind = "auto" | "note";

export interface OperationMessage {
  id: string;
  operationId: number;
  author: string;
  text: string;
  date: string; // ISO
  kind: OperationMessageKind;
}

export function buildOperationMessage(input: {
  operationId: number;
  author?: string;
  text: string;
  kind?: OperationMessageKind;
  now?: Date;
  id?: string;
}): OperationMessage | null {
  const trimmedText = input.text.trim();
  
  if (trimmedText === "") {
    return null;
  }

  const author = (input.author?.trim() || "Gestionnaire");
  const kind = input.kind ?? "note";
  const date = (input.now ?? new Date()).toISOString();
  
  // Safe fallback for crypto.randomUUID
  let id: string;
  if (input.id) {
    id = input.id;
  } else if (typeof crypto !== "undefined" && crypto.randomUUID) {
    id = crypto.randomUUID();
  } else {
    // Fallback UUID v4-like generation
    id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  return {
    id,
    operationId: input.operationId,
    author,
    text: trimmedText,
    date,
    kind,
  };
}

export function sortMessagesAsc(messages: OperationMessage[]): OperationMessage[] {
  return [...messages].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });
}

export const AUTO_MESSAGES = {
  submitted: "Opération soumise pour inspection",
  sentToManager: "Opération transmise au gestionnaire",
  validated: "Opération validée",
  revertedToDraft: "Retour au brouillon",
  revertedToInspection: "Retour en inspection",
} as const;

export function redoMessage(articleName: string): string {
  return `Contrôle refait: ${articleName}`;
}

export interface LoginEvent {
  id: string;
  user: string;
  role: string;
  type: "login" | "logout";
  date: string; // ISO format
}

export function buildLoginEvent(input: {
  user: string;
  role: string;
  type: "login" | "logout";
  now?: Date;
  id?: string;
}): LoginEvent {
  let eventId: string;
  
  if (input.id) {
    eventId = input.id;
  } else {
    try {
      eventId = crypto.randomUUID();
    } catch {
      // Fallback for environments without crypto.randomUUID
      eventId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  const eventDate = input.now || new Date();
  
  return {
    id: eventId,
    user: input.user.trim(),
    role: input.role,
    type: input.type,
    date: eventDate.toISOString(),
  };
}

export function sortEventsDesc(events: LoginEvent[]): LoginEvent[] {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA; // Newest first
  });
}

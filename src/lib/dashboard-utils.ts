/**
 * Parse movement date string into a Date object using LOCAL time components
 * @param dateStr Date string in format "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
 * @returns Date object or null if invalid
 */
export function parseMovementDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }

  // Split on space to separate date and time
  const parts = dateStr.trim().split(" ");
  if (parts.length === 0 || parts.length > 2) {
    return null;
  }

  const datePart = parts[0];
  const timePart = parts[1] || "00:00:00";

  // Parse date: YYYY-MM-DD
  const dateComponents = datePart.split("-");
  if (dateComponents.length !== 3) {
    return null;
  }

  const year = parseInt(dateComponents[0], 10);
  const month = parseInt(dateComponents[1], 10);
  const day = parseInt(dateComponents[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  // Validate month and day ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // Parse time: HH:MM:SS (allow HH:MM)
  const timeComponents = timePart.split(":");
  if (timeComponents.length < 2 || timeComponents.length > 3) {
    return null;
  }

  const hours = parseInt(timeComponents[0], 10);
  const minutes = parseInt(timeComponents[1], 10);
  const seconds = timeComponents[2] ? parseInt(timeComponents[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    return null;
  }

  // Validate time ranges
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return null;
  }

  // Create Date with local time components (month is 0-indexed in Date constructor)
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  // Verify the date is valid (handles invalid dates like Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Format movement date string for display
 * @param dateStr Date string in format "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD"
 * @returns Formatted string "DD/MM/YYYY HH:MM" or "—" if invalid
 */
export function formatMovementDateTime(dateStr: string): string {
  const date = parseMovementDate(dateStr);
  if (!date) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Get recent movements sorted by date descending
 * @param items Array of items with date property
 * @param limit Maximum number of items to return
 * @returns New array sorted by date (most recent first), invalid dates last
 */
export function getRecentMovements<T extends { date: string }>(
  items: T[],
  limit: number
): T[] {
  // Create a copy to avoid mutating input
  const sortedItems = [...items].sort((a, b) => {
    const dateA = parseMovementDate(a.date);
    const dateB = parseMovementDate(b.date);

    // Invalid dates go to the end
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Sort by date descending (most recent first)
    return dateB.getTime() - dateA.getTime();
  });

  return sortedItems.slice(0, limit);
}

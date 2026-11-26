import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parse date representations (Date object, ISO string, MySQL datetime string)
 * into a Date object normalized to UTC literal to prevent timezone shifting.
 */
export function parseDateSafe(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  let str = String(date).trim();
  if (!str) return null;
  // If format is "YYYY-MM-DD HH:mm:ss", convert to ISO format
  if (str.includes(" ") && !str.includes("T")) {
    str = str.replace(" ", "T");
  }
  // If without timezone offset or Z, append Z to treat as literal UTC
  if (!str.endsWith("Z") && !str.includes("+") && !str.match(/-\d{2}:\d{2}$/)) {
    str = str + "Z";
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date using UTC timezone so that what is stored in the database
 * (e.g. 16:00) displays exactly as 16.00 regardless of the client or server timezone.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  const d = parseDateSafe(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

export function formatDate(date: Date | string | null | undefined): string {
  const d = parseDateSafe(date);
  if (!d) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

/**
 * Converts a date or date-string into "YYYY-MM-DDTHH:mm" format suitable
 * for <input type="datetime-local" /> value attribute.
 */
export function toDateTimeLocalString(date: Date | string | null | undefined): string {
  const d = parseDateSafe(date);
  if (!d) return "";
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hours = String(d.getUTCHours()).padStart(2, "0");
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Gets the current wall-clock time in Indonesia (WIB - Asia/Jakarta)
 * constructed as a UTC Date for exact comparison against database deadline literals.
 */
export function getNowInJakarta(): Date {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  return new Date(
    Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      parseInt(map.hour, 10),
      parseInt(map.minute, 10),
      parseInt(map.second, 10)
    )
  );
}

/**
 * Evaluates whether a deadline has passed based on Indonesian Western Time (WIB).
 */
export function isPastDeadline(dueDate: Date | string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = parseDateSafe(dueDate);
  if (!due) return false;
  const nowJakarta = getNowInJakarta();
  return nowJakarta.getTime() > due.getTime();
}

/**
 * Evaluates whether a deadline is approaching within the given hours window.
 */
export function isDeadlineApproaching(
  dueDate: Date | string | null | undefined,
  hoursAhead = 72
): boolean {
  if (!dueDate) return false;
  const due = parseDateSafe(dueDate);
  if (!due) return false;
  const nowJakarta = getNowInJakarta();
  const diffMs = due.getTime() - nowJakarta.getTime();
  return diffMs > 0 && diffMs <= hoursAhead * 60 * 60 * 1000;
}

export function formatDecimal(val: number | string | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || val === "") return "—";
  const num = typeof val === "string" ? parseFloat(val) : val;
  if (isNaN(num)) return "—";
  return num.toFixed(decimals);
}

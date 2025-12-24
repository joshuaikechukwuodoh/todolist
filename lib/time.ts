// Date and time utility functions

/**
 * Get the start of the current day (00:00:00)
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get the end of the current day (23:59:59)
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Get the start of today
 */
export function getStartOfToday(): Date {
  return getStartOfDay(new Date());
}

/**
 * Get the end of today
 */
export function getEndOfToday(): Date {
  return getEndOfDay(new Date());
}

/**
 * Check if a task is overdue
 */
export function isTaskOverdue(endTime: Date): boolean {
  return new Date() > new Date(endTime);
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  const checkDate = new Date(date);

  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a task is active (not past end time)
 */
export function isTaskActive(endTime: Date): boolean {
  return new Date() <= new Date(endTime);
}

/**
 * Format a timestamp to a readable string
 */
export function formatTimestamp(date: Date): string {
  return new Date(date).toLocaleString();
}

/**
 * Get hours remaining until deadline
 */
export function getHoursRemaining(endTime: Date): number {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

/**
 * Get minutes remaining until deadline
 */
export function getMinutesRemaining(endTime: Date): number {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60)));
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

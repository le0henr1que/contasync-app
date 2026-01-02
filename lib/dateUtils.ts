/**
 * Creates a Date object at noon local time from a date string (yyyy-MM-dd)
 * This avoids timezone issues when converting to ISO string
 *
 * @param dateString - Date in format 'yyyy-MM-dd'
 * @returns ISO string of the date at noon local time
 */
export function createLocalDateISO(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}

/**
 * Formats a date for display in pt-BR locale
 */
export function formatDateBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

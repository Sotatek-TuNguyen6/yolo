/**
 * Format a date to a localized string
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'vi-VN')
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale = 'vi-VN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format a date to a short date string (without time)
 * @param date - The date to format
 * @param locale - The locale to use for formatting (default: 'vi-VN')
 * @returns Formatted short date string
 */
export function formatShortDate(date: Date, locale = 'vi-VN'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format a date to ISO format (YYYY-MM-DD)
 * @param date - The date to format
 * @returns ISO format date string
 */
export function formatISODate(date: Date): string {
  return date.toISOString().split('T')[0];
} 
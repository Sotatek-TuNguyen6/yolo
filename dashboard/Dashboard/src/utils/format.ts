/**
 * Format a price value to a localized string with currency
 * @param price - The price to format
 * @param locale - The locale to use for formatting (default: 'vi-VN')
 * @param currency - The currency to display (default: 'VND')
 * @returns Formatted price string
 */
export function formatPrice(price: number, locale = 'vi-VN', currency = 'VND'): string {
  return `${price.toLocaleString(locale)} ${currency}`;
}

/**
 * Format a percentage value
 * @param value - The value to format as percentage
 * @returns Formatted percentage string
 */
export function formatPercent(value: number): string {
  return `${value}%`;
}

/**
 * Format a phone number to a readable format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Basic formatting for Vietnamese numbers
  if (phone.length === 10) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7, 10)}`;
  }
  
  return phone;
}

/**
 * Format an address
 * @param address - Address components
 * @returns Formatted address string
 */
export function formatAddress(
  street: string,
  ward?: string,
  district?: string,
  city?: string
): string {
  const parts = [street, ward, district, city].filter(Boolean);
  return parts.join(', ');
} 
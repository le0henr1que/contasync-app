/**
 * Format a number as BRL currency
 * @param value - The numeric value
 * @returns Formatted currency string (e.g., "R$ 1.234,56")
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Parse BRL currency string to number
 * @param value - Currency string (e.g., "R$ 1.234,56" or "1234,56")
 * @returns Numeric value
 */
export function parseCurrency(value: string): number {
  const cleanValue = value
    .replace(/[R$\s]/g, '') // Remove R$ and spaces
    .replace(/\./g, '') // Remove thousand separators
    .replace(',', '.'); // Replace decimal comma with dot

  return parseFloat(cleanValue) || 0;
}

/**
 * Apply BRL currency mask to input
 * @param value - Current input value
 * @returns Masked value
 */
export function applyCurrencyMask(value: string): string {
  // Remove all non-numeric characters (including commas and dots)
  let numericValue = value.replace(/\D/g, '');

  // If empty, return 0,00
  if (numericValue === '' || numericValue === '0') {
    return '0,00';
  }

  // Remove leading zeros
  numericValue = numericValue.replace(/^0+/, '');

  // If empty after removing zeros, return 0,00
  if (numericValue === '') {
    return '0,00';
  }

  // Ensure we have at least 2 decimal places
  while (numericValue.length < 3) {
    numericValue = '0' + numericValue;
  }

  // Insert comma before last 2 digits
  const decimals = numericValue.slice(-2);
  let integers = numericValue.slice(0, -2);

  // Add thousand separators
  integers = integers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${integers},${decimals}`;
}

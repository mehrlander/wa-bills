/**
 * Text processing utilities for WA budget bill parsing
 */

/**
 * Parse dollar amounts from text
 * Handles formats like: "$1,234,567", "$1.2 million", "1234567"
 * Returns amount in cents to avoid floating point issues
 */
export function parseAmount(text) {
  if (!text) return 0;

  // Remove dollar signs, commas, and whitespace
  let cleaned = text.toString().replace(/[$,\s]/g, '');

  // Handle "million" and "billion" suffixes
  const millionMatch = cleaned.match(/([\d.]+)\s*million/i);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1]) * 1000000 * 100);
  }

  const billionMatch = cleaned.match(/([\d.]+)\s*billion/i);
  if (billionMatch) {
    return Math.round(parseFloat(billionMatch[1]) * 1000000000 * 100);
  }

  // Parse as regular number and convert to cents
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.round(amount * 100);
}

/**
 * Extract agency code from text
 * WA agencies often have numeric codes like "027", "070"
 */
export function extractAgencyCode(text) {
  const match = text.match(/\b(\d{3})\b/);
  return match ? match[1] : null;
}

/**
 * Normalize section references
 * Converts various formats to standardized form
 */
export function normalizeSection(sectionText) {
  if (!sectionText) return null;

  // Remove extra whitespace
  let normalized = sectionText.trim().replace(/\s+/g, ' ');

  // Standardize section references
  normalized = normalized.replace(/Section\s+/i, 'Sec. ');
  normalized = normalized.replace(/§\s*/g, 'Sec. ');

  return normalized;
}

/**
 * Extract fiscal years from biennium text
 * e.g., "2025-27" -> [2025, 2026, 2027]
 */
export function extractFiscalYears(bienniumText) {
  const match = bienniumText.match(/(\d{4})-(\d{2,4})/);
  if (!match) return [];

  const startYear = parseInt(match[1]);
  let endYear = parseInt(match[2]);

  // Handle 2-digit year format
  if (endYear < 100) {
    endYear = Math.floor(startYear / 100) * 100 + endYear;
  }

  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }

  return years;
}

/**
 * Clean and normalize text content
 */
export function cleanText(text) {
  if (!text) return '';

  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .replace(/\n\s*\n/g, '\n')  // Remove excess line breaks
    .trim();
}

/**
 * Detect proviso type from text content
 */
export function classifyProviso(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('shall report') || lowerText.includes('must report')) {
    return 'Reporting';
  }
  if (lowerText.includes('is provided solely') || lowerText.includes('may be used only')) {
    return 'Restriction';
  }
  if (lowerText.includes('shall') || lowerText.includes('must') || lowerText.includes('will')) {
    return 'Directive';
  }
  if (lowerText.includes('intent of the legislature') || lowerText.includes('legislative intent')) {
    return 'Intent';
  }

  return 'General';
}

/**
 * Extract account type from account name
 */
export function extractAccountType(accountName) {
  const lowerName = accountName.toLowerCase();

  if (lowerName.includes('federal')) return 'Federal';
  if (lowerName.includes('private') || lowerName.includes('local')) return 'Private/Local';
  if (lowerName.includes('state')) return 'State';

  return null;
}

/**
 * Extract fund type from account name
 */
export function extractFundType(accountName) {
  const lowerName = accountName.toLowerCase();

  if (lowerName.includes('general fund')) return 'General Fund';
  if (lowerName.includes('trust')) return 'Trust Fund';

  return 'Special Fund';
}

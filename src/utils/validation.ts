/**
 * Shared validators for customer-entered contact details.
 * Dependency-free so they can be reused by any form (public booking, admin, etc.).
 */

// Pragmatic email shape: something@domain.tld with a TLD of 2+ characters.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Checks whether an email address is well-formed (e.g. name@example.com). */
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length > 0 && EMAIL_PATTERN.test(email);
}

/**
 * Strips everything except digits, e.g. "(555) 123-4567" -> "5551234567".
 * Mirrors the digit normalization used by the WhatsApp notification Edge Function.
 */
export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validates a mobile/phone number entered in free format.
 * Accepts an optional leading "+", digits, spaces, dots, dashes and parentheses.
 * Requires 7-15 digits total (E.164 range) so international numbers with a
 * country code pass, while letters or too-short entries fail.
 */
export function isValidMobileNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return false; // only allowed characters
  // Parentheses must appear as a single balanced pair, e.g. "(555) 000-0000"
  const openCount = (trimmed.match(/\(/g) ?? []).length;
  const closeCount = (trimmed.match(/\)/g) ?? []).length;
  if (openCount !== closeCount || openCount > 1) return false;
  const digits = normalizePhoneDigits(trimmed);
  return digits.length >= 7 && digits.length <= 15;
}
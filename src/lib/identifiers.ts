/**
 * Identifier type classifier.
 *
 * Classifies a raw string into one of five identifier categories.
 * Used by the pipeline to decide which delivery strategy to apply.
 */

export type IdentifierType = 'name' | 'phone' | 'pincode' | 'otp' | 'orderId' | 'unknown'

// Indian phone: optional +91 or 0 prefix, then 10 digits starting with 6-9
const PHONE_RE = /^(\+91|0)?[6-9]\d{9}$/

// Indian pincode: exactly 6 digits, first digit 1-9 (Indian postal codes)
const PINCODE_RE = /^[1-9]\d{5}$/

// OTP: 4–5 digits only (6 digits would be a pincode)
const OTP_RE = /^\d{4,5}$/

// Order ID: alphanumeric, at least one letter and one digit, 4–20 chars
const ORDER_ID_RE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,20}$/

export function classifyIdentifier(value: string): IdentifierType {
  const trimmed = value.trim()

  // Phone check first (most specific pattern)
  if (PHONE_RE.test(trimmed)) return 'phone'
  // OTP before pincode — 4-5 digits; 6-digit strings with 1-9 start are pincodes
  if (OTP_RE.test(trimmed)) return 'otp'
  if (PINCODE_RE.test(trimmed)) return 'pincode'
  if (ORDER_ID_RE.test(trimmed)) return 'orderId'

  // Default: treat as a name if it's a non-empty string with letters
  if (/[A-Za-z]/.test(trimmed) && trimmed.length > 0) return 'name'

  return 'unknown'
}

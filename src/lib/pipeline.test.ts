import { describe, it, expect } from 'vitest'
import { classifyIdentifier } from './identifiers'
import { applyPipeline, buildPair, _formatters } from './pipeline'

// ---------------------------------------------------------------------------
// Classifier tests
// ---------------------------------------------------------------------------

describe('classifyIdentifier', () => {
  it('classifies Indian phone numbers', () => {
    expect(classifyIdentifier('+919876543210')).toBe('phone')
    expect(classifyIdentifier('9876543210')).toBe('phone')
    expect(classifyIdentifier('09876543210')).toBe('phone')
  })

  it('classifies 6-digit pincodes', () => {
    expect(classifyIdentifier('110001')).toBe('pincode')
    expect(classifyIdentifier('400001')).toBe('pincode')
    // Starts with non-zero so it's a valid pincode
    expect(classifyIdentifier('482135')).toBe('pincode')
  })

  it('classifies 4-5 digit OTPs', () => {
    expect(classifyIdentifier('4821')).toBe('otp')
    expect(classifyIdentifier('48213')).toBe('otp')
  })

  it('classifies alphanumeric order IDs', () => {
    expect(classifyIdentifier('PRM423GDD')).toBe('orderId')
    expect(classifyIdentifier('ORD7891AB')).toBe('orderId')
    expect(classifyIdentifier('SHP001X')).toBe('orderId')
  })

  it('classifies names', () => {
    expect(classifyIdentifier('Subramanian')).toBe('name')
    expect(classifyIdentifier('Bhattacharya')).toBe('name')
    expect(classifyIdentifier('Krishnamurthy')).toBe('name')
  })

  it('does not confuse 7-digit numbers as pincodes', () => {
    // 7 digits: not a valid 6-digit pincode
    expect(classifyIdentifier('1100011')).not.toBe('pincode')
  })
})

// ---------------------------------------------------------------------------
// Tuned formatter tests
// ---------------------------------------------------------------------------

describe('tuned formatters', () => {
  it('wraps phone in spell() with pauses', () => {
    const result = _formatters.tunedPhone('+919876543210')
    expect(result).toContain('spell(+919876543210)')
    expect(result).toContain('<')
  })

  it('wraps pincode in spell() with repeat', () => {
    const result = _formatters.tunedPincode('110001')
    expect(result).toContain('spell(110001)')
    expect(result.indexOf('spell(110001)')).not.toBe(result.lastIndexOf('spell(110001)'))
  })

  it('wraps OTP in spell() with repeat', () => {
    const result = _formatters.tunedOtp('482135')
    expect(result).toContain('spell(482135)')
    expect(result.indexOf('spell(482135)')).not.toBe(result.lastIndexOf('spell(482135)'))
  })

  it('wraps order ID in spell()', () => {
    const result = _formatters.tunedOrderId('PRM423GDD')
    expect(result).toContain('spell(PRM423GDD)')
  })

  it('spell-it-out wraps any value in spell()', () => {
    expect(_formatters.spelledOut('Subramanian')).toBe('spell(Subramanian)')
    expect(_formatters.spelledOut('482135')).toBe('spell(482135)')
  })
})

// ---------------------------------------------------------------------------
// Pipeline integration tests
// ---------------------------------------------------------------------------

describe('applyPipeline', () => {
  const rawSentence = 'Your OTP is 482135. Please note it down.'

  it('naive mode returns raw sentence unchanged', () => {
    const result = applyPipeline(rawSentence, '482135', 'naive')
    expect(result.text).toBe(rawSentence)
    expect(result.speedAlpha).toBe(1.0)
    expect(result.pauseBetweenBrackets).toBe(false)
  })

  it('tuned mode replaces identifier with spell() + pauses', () => {
    const result = applyPipeline(rawSentence, '482135', 'tuned')
    expect(result.text).toContain('spell(482135)')
    expect(result.pauseBetweenBrackets).toBe(true)
    expect(result.speedAlpha).toBe(1.0)
  })

  it('slower mode uses higher speedAlpha (Mist v2: > 1.0 = slower)', () => {
    const result = applyPipeline(rawSentence, '482135', 'slower')
    expect(result.speedAlpha).toBeGreaterThan(1.0)
  })

  it('spelled mode wraps identifier in spell()', () => {
    const result = applyPipeline(rawSentence, '482135', 'spelled')
    expect(result.text).toContain('spell(482135)')
  })

  it('tuned mode with custom phoneme sets phonemizeBetweenBrackets', () => {
    const nameSentence = 'Calling for Subramanian.'
    const result = applyPipeline(nameSentence, 'Subramanian', 'tuned', 's2ubr0am1any0an')
    expect(result.text).toContain('{s2ubr0am1any0an}')
    expect(result.phonemizeBetweenBrackets).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// buildPair convenience tests
// ---------------------------------------------------------------------------

describe('buildPair', () => {
  it('returns both naive and tuned results', () => {
    const sentence = 'Your pincode is 110001.'
    const { naive, tuned } = buildPair(sentence, '110001')
    expect(naive.text).toBe(sentence)
    expect(tuned.text).toContain('spell(110001)')
    expect(naive.mode).toBe('naive')
    expect(tuned.mode).toBe('tuned')
  })
})

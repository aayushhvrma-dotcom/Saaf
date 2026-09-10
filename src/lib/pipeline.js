/**
 * Controlled-delivery pipeline.
 *
 * Two modes for each identifier type:
 *   - NAIVE:  raw string dropped into the sentence as-is
 *   - TUNED:  controlled delivery using spell(), custom pauses,
 *             and phoneme overrides (for names — applied at synthesis time)
 *
 * Key API facts verified against Rime docs (September 2026):
 *   - spell() is a Mist-family feature; handles digit, letter, and mixed sequences
 *   - <N> inserts N-millisecond pause; requires pauseBetweenBrackets: true in request
 *   - {phonemes} enables custom pronunciation; requires phonemizeBetweenBrackets: true
 *   - speedAlpha on Mist v2: > 1.0 = SLOWER, < 1.0 = FASTER (inverted vs Coda/Mist v3)
 */
import { classifyIdentifier } from './identifiers';
// ---------------------------------------------------------------------------
// Per-type naive formatters
// ---------------------------------------------------------------------------
function naiveName(name) {
    return name;
}
function naivePhone(phone) {
    return phone;
}
function naivePincode(pincode) {
    return pincode;
}
function naiveOtp(otp) {
    return otp;
}
function naiveOrderId(orderId) {
    return orderId;
}
// ---------------------------------------------------------------------------
// Per-type tuned formatters (using spell() and pauses)
// ---------------------------------------------------------------------------
/** Names: wrap in spell() for letter-by-letter on "spell it out" path.
 *  For the normal tuned path we still send as-is (OOV check + phoneme override
 *  happens at synthesis time via phonemizeBetweenBrackets). */
function tunedName(name) {
    // Normal tuned: send as plain text — phoneme override applied at synthesis if OOV
    return name;
}
function tunedPhone(phone) {
    // spell() handles +91 prefix and all digits with naturalistic pause grouping
    return `<200> spell(${phone}) <300>`;
}
function tunedPincode(pincode) {
    return `<200> spell(${pincode}) <400> I repeat, <200> spell(${pincode})`;
}
function tunedOtp(otp) {
    return `<200> spell(${otp}) <400> Once again, <200> spell(${otp})`;
}
function tunedOrderId(orderId) {
    // spell() handles mixed alphanumeric with automatic pause grouping
    return `<200> spell(${orderId})`;
}
// ---------------------------------------------------------------------------
// Spell-it-out formatters (always letter/digit-by-digit, regardless of type)
// ---------------------------------------------------------------------------
function spelledOut(value) {
    return `spell(${value})`;
}
// ---------------------------------------------------------------------------
// Main pipeline entry point
// ---------------------------------------------------------------------------
/**
 * Given a raw sentence (from scenario's buildScript) and the identifier value,
 * returns the formatted text for Rime TTS with correct Rime syntax.
 *
 * @param rawSentence  - The full sentence with the raw identifier embedded
 * @param identifier   - The specific identifier string to format
 * @param mode         - Which delivery mode to apply
 * @param customPhoneme - Optional pre-computed phoneme string for OOV names
 */
export function applyPipeline(rawSentence, identifier, mode, customPhoneme) {
    const identifierType = classifyIdentifier(identifier);
    if (mode === 'naive') {
        return {
            text: rawSentence,
            mode,
            identifierType,
            speedAlpha: 1.0,
            phonemizeBetweenBrackets: false,
            pauseBetweenBrackets: false,
        };
    }
    if (mode === 'spelled') {
        const spelledId = spelledOut(identifier);
        const text = rawSentence.replace(identifier, spelledId);
        return {
            text,
            mode,
            identifierType,
            speedAlpha: 1.0,
            phonemizeBetweenBrackets: false,
            pauseBetweenBrackets: true,
        };
    }
    // tuned or slower — build the formatted identifier
    let formattedId;
    if (identifierType === 'name') {
        if (customPhoneme) {
            // OOV name with a known phoneme string
            formattedId = `{${customPhoneme}}`;
        }
        else {
            formattedId = tunedName(identifier);
        }
    }
    else if (identifierType === 'phone') {
        formattedId = tunedPhone(identifier);
    }
    else if (identifierType === 'pincode') {
        formattedId = tunedPincode(identifier);
    }
    else if (identifierType === 'otp') {
        formattedId = tunedOtp(identifier);
    }
    else if (identifierType === 'orderId') {
        formattedId = tunedOrderId(identifier);
    }
    else {
        // Unknown: best-effort — wrap in spell()
        formattedId = spelledOut(identifier);
    }
    const text = rawSentence.replace(identifier, formattedId);
    return {
        text,
        mode,
        identifierType,
        // Mist v2: > 1.0 = slower, 1.0 = normal
        speedAlpha: mode === 'slower' ? 1.35 : 1.0,
        // Names with phoneme overrides need phonemizeBetweenBrackets
        phonemizeBetweenBrackets: identifierType === 'name' && !!customPhoneme,
        pauseBetweenBrackets: identifierType !== 'name' || !!customPhoneme ? true : false,
    };
}
// ---------------------------------------------------------------------------
// Convenience: generate both naive and tuned from a raw sentence
// ---------------------------------------------------------------------------
export function buildPair(rawSentence, identifier, customPhoneme) {
    return {
        naive: applyPipeline(rawSentence, identifier, 'naive'),
        tuned: applyPipeline(rawSentence, identifier, 'tuned', customPhoneme),
    };
}
// ---------------------------------------------------------------------------
// Expose individual formatters for unit testing
// ---------------------------------------------------------------------------
export const _formatters = {
    naiveName, naivePhone, naivePincode, naiveOtp, naiveOrderId,
    tunedName, tunedPhone, tunedPincode, tunedOtp, tunedOrderId,
    spelledOut,
};

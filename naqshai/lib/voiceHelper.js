/**
 * Voice Assistant Helper (Speech-to-Text & Text-to-Speech)
 * Provides browser API compatibility, natural speech cleaning, South Asian voice mapping, and dynamic language configuration.
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Clean markdown symbols, asterisks, bullet markers, and code blocks for natural speech delivery
 */
export function cleanTextForSpeech(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1') // remove inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
    .replace(/\*([^*]+)\*/g, '$1') // remove italic
    .replace(/#{1,6}\s+/g, '') // remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links, keep text
    .replace(/[-*•]\s+/g, '') // remove bullet points
    .replace(/\n+/g, '. ') // replace newlines with pauses
    .trim();
}

/**
 * Intelligently select the best voice available in the browser.
 * For Urdu and Roman Urdu, South Asian voices (ur-PK, hi-IN, en-IN) are prioritized
 * so terminology like Marla, Kanal, Lakh, Crore, and Roman Urdu phrases sound natural.
 */
export function getBestVoiceForLanguage(langCode, isUrduOrRoman = false) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  if (isUrduOrRoman || (langCode && langCode.toLowerCase().startsWith('ur'))) {
    // 1. Direct Urdu voices (e.g. ur-PK, ur-IN, ur)
    const urduVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('ur'));
    if (urduVoice) return urduVoice;

    // 2. Hindi voices (e.g. hi-IN, hi) - Shares identical South Asian phonetics and cadence for Roman Urdu & Urdu
    const hindiVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('hi'));
    if (hindiVoice) return hindiVoice;

    // 3. South Asian English voices (en-IN)
    const southAsianVoice = voices.find(
      (v) => v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en-in'))
    );
    if (southAsianVoice) return southAsianVoice;
  }

  // Standard language match
  if (langCode) {
    const exactMatch = voices.find((v) => v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
    if (exactMatch) return exactMatch;

    const prefixMatch = voices.find(
      (v) => v.lang && v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase())
    );
    if (prefixMatch) return prefixMatch;
  }

  // Default fallback
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Text-to-Speech playback using SpeechSynthesis with South Asian voice enhancement
 */
export function speakText(text, options = {}) {
  if (!isSpeechSynthesisSupported()) {
    if (options.onError) options.onError(new Error('Speech synthesis not supported'));
    return null;
  }

  // Cancel any ongoing speech
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (options.onEnd) options.onEnd();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(cleaned);

  // Dynamic Language & Script Detection
  const hasUrduScript = /[\u0600-\u06FF]/.test(cleaned);
  const isUrduContext =
    options.isUrduOrRoman ||
    hasUrduScript ||
    options.lang === 'ur-PK' ||
    options.lang === 'RO' ||
    options.lang === 'UR';

  let targetLang = options.lang;
  if (!targetLang) {
    targetLang = isUrduContext ? 'ur-PK' : 'en-US';
  } else if (targetLang === 'UR' || targetLang === 'RO') {
    targetLang = 'ur-PK';
  }

  // Find optimal voice
  const bestVoice = getBestVoiceForLanguage(targetLang, isUrduContext);
  if (bestVoice) {
    utterance.voice = bestVoice;
    utterance.lang = bestVoice.lang || targetLang;
  } else {
    utterance.lang = targetLang;
  }

  // Natural pacing for South Asian terminology
  utterance.rate = options.rate || (isUrduContext ? 0.92 : 1.0);
  utterance.pitch = options.pitch || 1.0;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (err) => {
    // Treat canceled/interrupted events gracefully
    if (err.error === 'canceled' || err.error === 'interrupted') {
      if (options.onEnd) options.onEnd();
      return;
    }
    if (options.onError) options.onError(err);
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Stop active speech synthesis
 */
export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('speechSynthesis.cancel notice:', e);
    }
  }
}

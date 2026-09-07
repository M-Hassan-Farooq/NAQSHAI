/**
 * Helper for zero-delay fast path conversational responses.
 * Detects casual pleasantries, greetings, and chitchat and provides
 * concise, punchy (1 short sentence max) responses in English, Urdu, or Roman Urdu.
 */
export function getFastConversationalReply(query, language = 'Auto') {
  if (!query || typeof query !== 'string') return null;

  const normalized = query
    .trim()
    .toLowerCase()
    .replace(/[?!.,;:_]/g, '')
    .replace(/\s+/g, ' ');

  const isUrdu = language === 'UR';
  const isRoman = language === 'RO';

  // 1. "How are you" / "Kya hal hai"
  if (/\b(how are you|how r u|how are u|how do you do|hows it going|kya hal|kya haal|kese ho|kaisay ho|sab theek)\b/i.test(normalized)) {
    if (isUrdu) return "میں بالکل ٹھیک ہوں، شکریہ! نقشائی (NAQSHAI) میں خوش آمدید۔ بتائیے آپ کو اسلام آباد یا راولپنڈی میں کس قسم کے پلاٹ کی تلاش ہے؟";
    if (isRoman) return "Main bilkul theek hoon, shukriya! NAQSHAI me khush aamdeed. Aap ko Islamabad ya Rawalpindi me kis budget ka plot chahiye?";
    return "I'm doing well, thank you! Welcome to NAQSHAI. How can I help you find plots or real estate in Islamabad and Rawalpindi today?";
  }

  // 2. Greetings: "Hello", "Hi", "Hey", "Salam", "AOA", "Hi there", "Hey there"
  const isGreeting = /\b(hello|hi|hey|salam|assalam|aoa|greetings|good morning|good afternoon|good evening)\b/i.test(normalized);
  const isSpecificSearch = /\b(plot|plots|property|properties|buy|sell|price|inventory|search|find|marla|kanal|dha|bahria|gulberg|b-17|f-6|g-11|rawalpindi|islamabad)\b/i.test(normalized);

  if (isGreeting && !isSpecificSearch) {
    if (isUrdu) return "السلام علیکم! نقشائی (NAQSHAI) میں خوش آمدید! میں اسلام آباد اور راولپنڈی میں جائیداد کی تلاش اور پلاٹس کے انتخاب میں آپ کی کیا مدد کر سکتا ہوں؟";
    if (isRoman) return "Salam! NAQSHAI me khush aamdeed! Main Islamabad aur Rawalpindi me verified plots aur real estate search me aap ki kya madad kar sakta hoon?";
    return "Hello and welcome to NAQSHAI! How can I help you find plots or real estate across Islamabad and Rawalpindi today?";
  }

  // 3. Identity: "Who are you", "What can you do"
  if (/^(who are you|who r u|what are you|what is naqshai|what can you do|ap kon ho|tum kon ho|aap kon hain)$/i.test(normalized)) {
    if (isUrdu) return "میں نقشائی کا اے آئی پراپرٹی مشیر ہوں، اسلام آباد اور راولپنڈی کے تصدیق شدہ پلاٹس میں رہنمائی کے لیے۔";
    if (isRoman) return "Main NAQSHAI ka AI property advisor hoon, verified plots aur investment guidance ke liye.";
    return "I am NAQSHAI AI, your property advisor for verified plot listings and risk intelligence in Islamabad and Rawalpindi.";
  }

  // 4. Gratitude: "Thank you", "Thanks", "Shukriya"
  if (/^(thank you|thanks|thx|thank u|shukriya|shukria|jazakallah|meharbani|bohat shukriya)$/i.test(normalized)) {
    if (isUrdu) return "آپ کا خیر مقدم ہے! اگر مزید کوئی سوال ہو تو ضرور پوچھیے۔";
    if (isRoman) return "Aap ka shukriya! Agar mazeed koi sawal ho tou zaroor poochiye.";
    return "You're welcome! Let me know if you have any other questions.";
  }

  // 5. Farewell: "Bye", "Goodbye", "Allah Hafiz"
  if (/^(bye|goodbye|cya|allah hafiz|khuda hafiz|fee amanillah)$/i.test(normalized)) {
    if (isUrdu) return "اللہ حافظ! جب بھی پلاٹس یا سرمایہ کاری سے متعلق رہنمائی چاہیے ہو، رجوع کیجیے۔";
    if (isRoman) return "Allah Hafiz! Jab bhi property advice chahiye ho, rabta karein.";
    return "Goodbye! Feel free to return anytime you need property advice.";
  }

  return null;
}

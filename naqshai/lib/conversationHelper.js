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
  if (/^(how are you|how r u|how are u|how do you do|how are things|hows it going|kya hal|kya haal|kya hal hai|kya haal hai|kese ho|kaisay ho|hal kaisa hai|sab theek)$/i.test(normalized)) {
    if (isUrdu) return "میں بالکل ٹھیک ہوں، شکریہ! بتائیے آپ کو اسلام آباد یا راولپنڈی میں کس قسم کے پلاٹ کی تلاش ہے؟";
    if (isRoman) return "Main bilkul theek hoon, shukriya! Aap ko Islamabad ya Rawalpindi me kis budget ka plot chahiye?";
    return "I'm doing well, thank you! What plot size or location are you looking for in Islamabad or Rawalpindi?";
  }

  // 2. Greetings: "Hello", "Hi", "Salam", "AOA"
  if (/^(hello|hi|hey|salam|assalam|assalam o alaikum|assalam-o-alaikum|aoa|good morning|good afternoon|good evening)$/i.test(normalized)) {
    if (isUrdu) return "السلام علیکم! اسلام آباد اور راولپنڈی میں جائیداد کی تلاش میں آپ کی کیا مدد کر سکتا ہوں؟";
    if (isRoman) return "Salam! Property search ya real estate me aap ki kya madad kar sakta hoon?";
    return "Hello! How can I assist with your property search or investment today?";
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

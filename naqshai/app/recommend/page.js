'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bot,
    Send,
    Sparkles,
    MapPin,
    ShieldCheck,
    ExternalLink,
    ArrowRight,
    RefreshCw
} from 'lucide-react';

const QUICK_QUESTIONS = {
    Auto: [
        "I need a 10 Marla plot in Islamabad under 2 Crore",
        "Looking for 1 Kanal in Gulberg Greens for investment",
        "Show me residential plots in DHA Phase 1",
        "I want a plot with low flood risk in Rawalpindi"
    ],
    EN: [
        "I need a 10 Marla plot in Islamabad under 2 Crore",
        "Looking for 1 Kanal in Gulberg Greens for investment",
        "Show me residential plots in DHA Phase 1",
        "I want a plot with low flood risk in Rawalpindi"
    ],
    RO: [
        "Islamabad me 10 Marla ka plot chahiye under 2 Crore",
        "Gulberg Greens me 1 Kanal investment ke liye dikhayen",
        "DHA Phase 1 me residential plot dikhayen",
        "Rawalpindi me low flood risk wala plot chahiye"
    ],
    UR: [
        "مجھے اسلام آباد میں 2 کروڑ کے اندر 10 مرلہ کا پلاٹ چاہیے",
        "گلبرگ گرینز میں انویسٹمنٹ کے لیے 1 کنال کا پلاٹ دکھائیں",
        "ڈی ایچ اے فیز 1 میں رہائشی پلاٹ دکھائیں",
        "راولپنڈی میں کم سیلاب کے خطرے والا پلاٹ چاہیے"
    ]
};

const GREETINGS = {
    Auto: "Hello! I am NAQSHAI AI, your expert land recommendation chatbot for real estate in Pakistan. To provide you with the best plot recommendations, could you please tell me which city you are interested in, your budget, and your preferred plot size (e.g., 5 Marla, 10 Marla, or 1 Kanal)?",
    EN: "Hello! I am NAQSHAI AI, your expert land recommendation chatbot for real estate in Pakistan. To provide you with the best plot recommendations, could you please tell me which city you are interested in, your budget, and your preferred plot size (e.g., 5 Marla, 10 Marla, or 1 Kanal)?",
    RO: "Assalam-o-Alaikum! Main NAQSHAI AI Advisor hoon. Main aapko aapki zaroorat aur budget ke mutabiq best plot dhoondne me madad karunga.\n\nAap kis city/society me, kitne budget aur size (Marla/Kanal) ka plot dekh rahe hain?",
    UR: "السلام علیکم! میں نقشئی اے آئی ایڈوائزر ہوں۔ میں آپ کو آپ کی ضرورت اور بجٹ کے مطابق بہترین پلاٹ تلاش کرنے میں مدد کروں گا۔\n\nآپ کس شہر/سوسائٹی میں، کتنے بجٹ اور سائز (مرلہ/کنال) کا پلاٹ دیکھ رہے ہیں؟"
};

export default function RecommendPage() {
    const router = useRouter();
    const [language, setLanguage] = useState('Auto');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: GREETINGS.Auto,
            recommendedPlots: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const handleLanguageChange = (langOption) => {
        setLanguage(langOption);
        setMessages((prev) => {
            if (prev.length === 1) {
                return [
                    {
                        ...prev[0],
                        content: GREETINGS[langOption] || GREETINGS.Auto
                    }
                ];
            }
            return prev;
        });
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim() || loading) return;

        const userMsg = { role: 'user', content: query };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages, language: language }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.reply || 'Maazrat, koi reply nahi mil saka.',
                    recommendedPlots: data.recommendedPlots || []
                }
            ]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Maazrat, request process karne me masla aya. Dobara koshish karein.',
                    recommendedPlots: []
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-200 text-slate-800">
            {/* Top Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-base text-slate-900">NAQSHAI Smart Match</h1>
                        <p className="text-xs text-slate-500">Multilingual AI Plot Discovery (English / اردو / Roman Urdu)</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Language Toggle Group */}
                    <div className="flex items-center p-1 bg-slate-200/80 border border-slate-300/80 rounded-xl text-xs font-medium">
                        {['Auto', 'EN', 'UR', 'RO'].map((langOption) => (
                            <button
                                key={langOption}
                                type="button"
                                onClick={() => handleLanguageChange(langOption)}
                                className={`px-2.5 py-1 rounded-lg transition-all ${
                                    language === langOption
                                        ? 'bg-emerald-700 text-white shadow-sm font-semibold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                                }`}
                            >
                                {langOption}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/explore')}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 transition shrink-0 shadow-sm"
                    >
                        Explore Full Map <ArrowRight className="w-4 h-4 text-emerald-700" />
                    </button>
                </div>
            </header>

            {/* Chat Canvas */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-sm">
                                <Bot className="w-4 h-4" />
                            </div>
                        )}

                        <div className={`max-w-[85%] md:max-w-[75%] space-y-3`}>
                            <div
                                dir="auto"
                                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {/* Recommended Plot Cards */}
                            {msg.recommendedPlots?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {msg.recommendedPlots.map((plot) => {
                                        const isLowRisk = plot.floodRisk?.toLowerCase().includes('low');
                                        const isModerateRisk = plot.floodRisk?.toLowerCase().includes('moderate') || plot.floodRisk?.toLowerCase().includes('medium');

                                        return (
                                            <div
                                                key={plot.id}
                                                className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between"
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                                                {plot.id}
                                                            </span>
                                                            <h4 className="font-semibold text-sm mt-1 text-slate-900">{plot.title}</h4>
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                                            {plot.price}
                                                        </span>
                                                    </div>

                                                    <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                                                        <p className="flex items-center gap-1 text-slate-600">
                                                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span>{plot.society}, {plot.city} • <strong className="text-slate-800">{plot.size}</strong></span>
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border ${
                                                                isLowRisk
                                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                    : isModerateRisk
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}>
                                                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                                Flood Risk: {plot.floodRisk}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                                                Noise: {plot.noiseLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => router.push(`/explore?plot=${plot.id}`)}
                                                    className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition shadow-sm"
                                                >
                                                    Inspect on 3D Map <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Conditional Quick Questions cluster (only show when messages.length === 1) */}
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 ml-11 max-w-[85%] md:max-w-[75%]">
                        {(QUICK_QUESTIONS[language] || QUICK_QUESTIONS.Auto).map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSend(item)}
                                className="text-xs shrink-0 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition shadow-sm"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-3 text-slate-500 text-xs italic ml-11">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                        NAQSHAI is analyzing land data & risk metrics...
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            {/* Input Form */}
            <footer className="p-4 border-t border-slate-200 bg-white">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="max-w-4xl mx-auto flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type in English, Roman Urdu (e.g. 10 Marla plot chahiye), or اردو..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
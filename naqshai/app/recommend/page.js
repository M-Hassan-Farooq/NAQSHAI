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

const QUICK_QUESTIONS = [
    "Islamabad me 10 Marla ka plot chahiye under 2 Crore",
    "Looking for 1 Kanal in Gulberg Greens for investment",
    "DHA Phase 1 me residential plot dikhayen",
    "Low flood risk wala plot chahiye Rawalpindi me"
];

export default function RecommendPage() {
    const router = useRouter();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Assalam-o-Alaikum! Main NAQSHAI AI Advisor hoon. Main aapko aapki zaroorat aur budget ke mutabiq best plot dhoondne me madad karunga.\n\nAap kis city/society me, kitne budget aur size (Marla/Kanal) ka plot dekh rahe hain?',
            recommendedPlots: []
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

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
                body: JSON.stringify({ messages: updatedMessages }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: data.reply,
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
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
            {/* Top Navbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-base">NAQSHAI Smart Match</h1>
                        <p className="text-xs text-slate-400">Multilingual AI Plot Discovery (English / اردو / Roman Urdu)</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/explore')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                >
                    Explore Full Map <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            {/* Chat Canvas */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                                <Bot className="w-4 h-4" />
                            </div>
                        )}

                        <div className={`max-w-[85%] md:max-w-[75%] space-y-3`}>
                            <div
                                dir="auto"
                                className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-emerald-600 text-white rounded-br-none'
                                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {/* Recommended Plot Cards */}
                            {msg.recommendedPlots?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {msg.recommendedPlots.map((plot) => (
                                        <div
                                            key={plot.id}
                                            className="p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl space-y-3 hover:border-emerald-500 transition shadow-lg flex flex-col justify-between"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                            {plot.id}
                                                        </span>
                                                        <h4 className="font-semibold text-sm mt-1 text-slate-100">{plot.title}</h4>
                                                    </div>
                                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/40">
                                                        {plot.price}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                                                    <p className="flex items-center gap-1 text-slate-300">
                                                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                        <span>{plot.society}, {plot.city} • <strong className="text-slate-200">{plot.size}</strong></span>
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                                            Flood Risk: {plot.floodRisk}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                                            Noise: {plot.noiseLevel}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => router.push(`/explore?plot=${plot.id}`)}
                                                className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition shadow-md hover:shadow-emerald-900/40"
                                            >
                                                Inspect on 3D Map <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-3 text-slate-400 text-xs italic">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        NAQSHAI is analyzing land data & risk metrics...
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            {/* Suggested Quick Queries */}
            <div className="max-w-4xl mx-auto w-full px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {QUICK_QUESTIONS.map((item, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(item)}
                            className="text-xs shrink-0 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition"
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Form */}
            <footer className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur">
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
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}
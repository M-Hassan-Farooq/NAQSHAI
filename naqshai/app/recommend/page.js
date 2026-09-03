'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import {
    Bot,
    Send,
    Sparkles,
    MapPin,
    ShieldCheck,
    ExternalLink,
    ArrowRight,
    RefreshCw,
    Phone,
    CheckCircle2,
    User,
    LogOut,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    AlertCircle
} from 'lucide-react';
import {
    speakText,
    stopSpeaking,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported
} from '@/lib/voiceHelper';
import { getFastConversationalReply } from '@/lib/conversationHelper';

const QUICK_QUESTIONS = {
    Auto: [
        "What plots are available in Islamabad right now?",
        "Show me plots in Rawalpindi with low flood risk",
        "I need a 5 Marla plot under 1.5 Crore",
        "Which plots have verified seller contact numbers?"
    ],
    EN: [
        "What plots are available in Islamabad right now?",
        "Show me plots in Rawalpindi with low flood risk",
        "I need a 5 Marla plot under 1.5 Crore",
        "Which plots have verified seller contact numbers?"
    ],
    RO: [
        "Islamabad me abhi konse plots available hain?",
        "Rawalpindi me low flood risk wale plots dikhayen",
        "Mujhe 1.5 Crore ke andar 5 Marla plot chahiye",
        "Konse plots ke verified seller numbers available hain?"
    ],
    UR: [
        "اسلام آباد میں اس وقت کون سے پلاٹس دستیاب ہیں؟",
        "راولپنڈی میں کم سیلاب کے خطرے والے پلاٹس دکھائیں",
        "مجھے 1.5 کروڑ کے اندر 5 مرلہ کا پلاٹ چاہیے",
        "کن پلاٹس کے تصدیق شدہ رابطہ نمبر دستیاب ہیں؟"
    ]
};

const GREETINGS = {
    Auto: "Hello! Which city, budget range, or plot size (e.g. 5 Marla, 10 Marla, 1 Kanal) are you looking for today?",
    EN: "Hello! Which city, budget range, or plot size (e.g. 5 Marla, 10 Marla, 1 Kanal) are you looking for today?",
    RO: "Salam! Aap Islamabad ya Rawalpindi me kis budget ya plot size (5 Marla, 10 Marla, 1 Kanal) me search kar rahe hain?",
    UR: "السلام علیکم! آپ کس شہر، بجٹ یا سائز (5 مرلہ، 10 مرلہ، 1 کنال) میں پلاٹ تلاش کر رہے ہیں؟"
};

function ChatInterface() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contextPlotId = searchParams.get('context');

    const [session, setSession] = useState(null);
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
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState('');
    const [speakingIdx, setSpeakingIdx] = useState(null);

    const chatEndRef = useRef(null);
    const didAutoTriggerRef = useRef(false);
    const recognitionRef = useRef(null);
    const wasVoiceInputRef = useRef(false);

    // Stop speaking and speech recognition on unmount
    useEffect(() => {
        return () => {
            stopSpeaking();
            recognitionRef.current?.stop();
        };
    }, []);

    const toggleListening = () => {
        setVoiceError('');
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
        if (!SpeechRecognition) {
            setVoiceError('Speech recognition is not supported in this browser. Please try Google Chrome or Microsoft Edge.');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = false;
            recognition.interimResults = true;

            // Strictly locked to English (en-US) to capture clean speech without script-mangling bugs
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                wasVoiceInputRef.current = true;
            };

            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map((res) => res[0].transcript)
                    .join('');
                setInput(transcript);
                wasVoiceInputRef.current = true;
            };

            recognition.onerror = (event) => {
                console.warn('SpeechRecognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
                } else if (event.error !== 'no-speech') {
                    setVoiceError(`Voice input error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setVoiceError('Failed to activate microphone. Please check device permissions.');
            setIsListening(false);
        }
    };

    const handleToggleSpeak = (textToSpeak, idx) => {
        if (speakingIdx === idx) {
            stopSpeaking();
            setSpeakingIdx(null);
            return;
        }

        const isUrduOrRoman = language === 'UR' || language === 'RO' || /[\u0600-\u06FF]/.test(textToSpeak);
        const langCode = (language === 'UR' || language === 'RO') ? 'ur-PK' : 'en-US';

        speakText(textToSpeak, {
            lang: langCode,
            isUrduOrRoman: isUrduOrRoman,
            onStart: () => setSpeakingIdx(idx),
            onEnd: () => setSpeakingIdx(null),
            onError: (err) => {
                console.warn('Text-to-speech notice:', err);
                setSpeakingIdx(null);
            }
        });
    };

    useEffect(() => {
        let isMounted = true;
        async function fetchSession() {
            try {
                const { data: { session: activeSession } } = await supabase.auth.getSession();
                if (isMounted) setSession(activeSession);
            } catch (err) {
                console.error('Session error on Recommend page:', err);
            }
        }
        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            if (isMounted) setSession(currentSession);
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
        await supabase.auth.signOut();
        setSession(null);
        router.refresh();
    };

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

    // Handle deep-linked context from 3D Map "Discuss with AI"
    useEffect(() => {
        if (contextPlotId && !didAutoTriggerRef.current) {
            didAutoTriggerRef.current = true;
            const prompt = `Tell me about plot ${contextPlotId} in detail, including its risk assessment and pricing.`;
            handleSend(prompt);
        }
    }, [contextPlotId]);

    const handleSend = async (textToSend) => {
        const query = textToSend || input;
        if (!query.trim() || loading) return;

        // 1. Zero-Delay Fast Path for Casual Queries:
        // Purely conversational inputs, greetings, or pleasantries bypass all vector search, DB queries, and fake loading spinners entirely.
        const fastReply = getFastConversationalReply(query, language);
        if (fastReply) {
            const userMsg = { role: 'user', content: query };
            const assistantMsg = { role: 'assistant', content: fastReply, recommendedPlots: [] };
            const nextMessages = [...messages, userMsg, assistantMsg];
            setMessages(nextMessages);
            setInput('');

            if (wasVoiceInputRef.current) {
                wasVoiceInputRef.current = false;
                const assistantIndex = nextMessages.length - 1;
                setTimeout(() => {
                    handleToggleSpeak(fastReply, assistantIndex);
                }, 200);
            }
            return;
        }

        const userMsg = { role: 'user', content: query };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages, language: language }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const safeReply = errorData.reply || 'Maazrat, request process karne me masla aya. Dobara koshish karein.';
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: safeReply,
                        recommendedPlots: []
                    }
                ]);
                setLoading(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            // Add placeholder assistant message
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: '',
                    recommendedPlots: []
                }
            ]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    accumulatedText += decoder.decode(value, { stream: true });

                    // Stream parsing: try parsing JSON as tokens accumulate
                    let cleanText = accumulatedText.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
                    let replyContent = cleanText;
                    let plotsList = [];

                    try {
                        const parsed = JSON.parse(cleanText);
                        if (parsed && typeof parsed === 'object') {
                            replyContent = parsed.reply || cleanText;
                            if (Array.isArray(parsed.recommendedPlots)) {
                                plotsList = parsed.recommendedPlots;
                            }
                        }
                    } catch (_) {
                        // Partial JSON chunk while streaming
                        const replyMatch = cleanText.match(/"reply"\s*:\s*"([^"]*)/);
                        if (replyMatch && replyMatch[1]) {
                            replyContent = replyMatch[1];
                        }
                    }

                    setMessages((prev) => {
                        const next = [...prev];
                        const lastIdx = next.length - 1;
                        if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
                            next[lastIdx] = {
                                ...next[lastIdx],
                                content: replyContent,
                                recommendedPlots: plotsList.length > 0 ? plotsList : next[lastIdx].recommendedPlots
                            };
                        }
                        return next;
                    });
                }

                // Final Parse when stream ends
                let cleanText = accumulatedText.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
                let parsedData = null;
                try {
                    parsedData = JSON.parse(cleanText);
                } catch (_) {
                    parsedData = { reply: cleanText, recommendedPlots: [] };
                }

                const finalReply = parsedData?.reply || cleanText || 'Maazrat, koi reply nahi mil saka.';
                const finalPlots = parsedData?.recommendedPlots || [];

                setMessages((prev) => {
                    const next = [...prev];
                    const lastIdx = next.length - 1;
                    if (lastIdx >= 0 && next[lastIdx].role === 'assistant') {
                        next[lastIdx] = {
                            role: 'assistant',
                            content: finalReply,
                            recommendedPlots: finalPlots
                        };
                    }
                    return next;
                });

                // Auto-Trigger Voice Output on Voice Input:
                // Automatically triggers TTS read aloud if user inputted via microphone
                if (wasVoiceInputRef.current && finalReply) {
                    wasVoiceInputRef.current = false;
                    const assistantIndex = updatedMessages.length;
                    setTimeout(() => {
                        handleToggleSpeak(finalReply, assistantIndex);
                    }, 350);
                }
            }
        } catch (err) {
            console.error('[ChatInterface] fetch error:', err);
            const fallbackReply = 'Maazrat, request process karne me masla aya. Dobara koshish karein.';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: fallbackReply,
                    recommendedPlots: []
                }
            ]);

            if (wasVoiceInputRef.current) {
                wasVoiceInputRef.current = false;
                const assistantIndex = updatedMessages.length;
                setTimeout(() => {
                    handleToggleSpeak(fallbackReply, assistantIndex);
                }, 350);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-slate-100 text-slate-800 font-sans">
            {/* Top Navbar */}
            <header className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-base text-slate-900">NAQSHAI Smart Match</h1>
                            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                                Live Database
                            </span>
                        </div>
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
                        onClick={() => router.push('/sell')}
                        className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shrink-0 shadow-sm"
                    >
                        List Your Plot
                    </button>

                    <button
                        onClick={() => router.push('/explore')}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition shrink-0 shadow-sm"
                    >
                        Explore 3D Map <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                    </button>

                    <div className="border-l border-slate-200 pl-2">
                        <UserNav
                            session={session}
                            onSignOut={handleSignOut}
                        />
                    </div>
                </div>
            </header>

            {/* Chat Canvas (Scrollbar anchored to extreme right edge of screen) */}
            <main className="flex-1 overflow-y-auto w-full relative">
                {/* Left Side Mascot Decoration (Subtle Watermark on Wide Screens) */}
                <div 
                    aria-hidden="true" 
                    className="hidden xl:flex pointer-events-none fixed left-4 2xl:left-10 top-1/2 -translate-y-1/2 z-0 select-none opacity-15 transition-opacity"
                >
                    <img
                        src="/mascot.png"
                        alt=""
                        className="w-32 xl:w-40 2xl:w-52 h-auto object-contain drop-shadow-sm"
                        draggable={false}
                    />
                </div>

                {/* Right Side Mascot Decoration (Subtle Watermark on Wide Screens - mirrored) */}
                <div 
                    aria-hidden="true" 
                    className="hidden xl:flex pointer-events-none fixed right-6 2xl:right-12 top-1/2 -translate-y-1/2 z-0 select-none opacity-15 transition-opacity scale-x-[-1]"
                >
                    <img
                        src="/mascot.png"
                        alt=""
                        className="w-32 xl:w-40 2xl:w-52 h-auto object-contain drop-shadow-sm"
                        draggable={false}
                    />
                </div>

                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 w-full relative z-10">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-sm mt-0.5">
                                    <Bot className="w-4 h-4" />
                                </div>
                            )}

                            <div className="max-w-[88%] md:max-w-[78%] space-y-3">
                                <div
                                    dir="auto"
                                    className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line relative group ${
                                        msg.role === 'user'
                                            ? 'bg-emerald-700 text-white rounded-br-none shadow-sm'
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                    }`}
                                >
                                    <div>{msg.content}</div>

                                    {/* Text-to-Speech (Audio Output) Speaker Button */}
                                    {msg.role === 'assistant' && msg.content && (
                                        <div className="flex items-center justify-end mt-2 pt-1 border-t border-slate-100/80">
                                            <button
                                                type="button"
                                                onClick={() => handleToggleSpeak(msg.content, idx)}
                                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                                                    speakingIdx === idx
                                                        ? 'bg-emerald-100 text-emerald-800 font-semibold'
                                                        : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                                                }`}
                                                title={speakingIdx === idx ? 'Stop reading aloud' : 'Listen to message (Text-to-Speech)'}
                                            >
                                                {speakingIdx === idx ? (
                                                    <>
                                                        <VolumeX className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
                                                        <span>Stop Reading</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                        <span>Read Aloud</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Recommended Plot Cards (Only rendered when matching live database plots exist) */}
                                {msg.recommendedPlots?.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                                        {msg.recommendedPlots.map((plot) => {
                                            const isLowRisk = plot.floodRisk?.toLowerCase().includes('low');
                                            const isModerateRisk =
                                                plot.floodRisk?.toLowerCase().includes('moderate') ||
                                                plot.floodRisk?.toLowerCase().includes('medium');

                                            return (
                                                <div
                                                    key={plot.id}
                                                    className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between"
                                                >
                                                    <div className="space-y-2.5">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                                                        {plot.id}
                                                                    </span>
                                                                    {plot.isVerified && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                            Verified
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h4 className="font-semibold text-sm mt-1.5 text-slate-900 leading-snug">
                                                                    {plot.title}
                                                                </h4>
                                                            </div>
                                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 whitespace-nowrap shrink-0">
                                                                {plot.price}
                                                            </span>
                                                        </div>

                                                    <div className="text-xs text-slate-500 space-y-1.5 pt-0.5">
                                                        <p className="flex items-center gap-1.5 text-slate-600">
                                                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span>
                                                                {plot.society ? `${plot.society}, ` : ''}
                                                                {plot.city} • <strong className="text-slate-800">{plot.size}</strong>
                                                            </span>
                                                        </p>

                                                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                            <span
                                                                className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-medium ${
                                                                    isLowRisk
                                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                                        : isModerateRisk
                                                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                                                }`}
                                                            >
                                                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                                                Flood: {plot.floodRisk}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                                Noise: {plot.noiseLevel}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-2 flex flex-col gap-2">
                                                    {plot.sellerPhone && (
                                                        <a
                                                            href={`https://wa.me/${plot.sellerPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20saw%20${encodeURIComponent(plot.id)}%20on%20NAQSHAI`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium transition shadow-sm"
                                                        >
                                                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                                            <span>Contact Seller ({plot.sellerRole || 'Owner'})</span>
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => router.push(`/explore?plot=${plot.id}`)}
                                                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition shadow-sm"
                                                    >
                                                        <span>Inspect on 3D Map</span>
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Quick Prompts Cluster (Only visible on initial message) */}
                {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 mt-4 ml-11 max-w-[88%] md:max-w-[78%]">
                        {(QUICK_QUESTIONS[language] || QUICK_QUESTIONS.Auto).map((item, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSend(item)}
                                className="text-xs shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition shadow-sm"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex items-center gap-2.5 text-slate-500 text-xs italic ml-11 py-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
                        NAQSHAI Advisor is thinking...
                    </div>
                )}
                <div ref={chatEndRef} />
                </div>
            </main>

            {/* Input Form */}
            <footer className="p-4 border-t border-slate-200 bg-white shrink-0">
                {/* Subtle Inline Voice Error Banner */}
                {voiceError && (
                    <div className="max-w-4xl mx-auto mb-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                            <span>{voiceError}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setVoiceError('')}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-0.5 cursor-pointer"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Model Loading State Banner */}
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
                        onChange={(e) => {
                            setInput(e.target.value);
                            wasVoiceInputRef.current = false;
                        }}
                        placeholder={
                            isListening
                                ? "Listening... Speak in English now"
                                : "Type in English, Roman Urdu (e.g. Islamabad me plot chahiye), or اردو..."
                        }
                        className={`flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition text-slate-800 placeholder:text-slate-400 ${
                            isListening
                                ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                                : 'border-slate-200 focus:border-emerald-500'
                        }`}
                    />

                    {/* Speech-to-Text Microphone Input Button (English en-US) */}
                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center relative ${
                            isListening
                                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100 animate-pulse'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:text-emerald-700'
                        }`}
                        title={
                            isListening
                                ? 'Stop listening'
                                : 'Voice Input (English - Speech to Text)'
                        }
                    >
                        {isListening ? (
                            <MicOff className="w-4 h-4" />
                        ) : (
                            <Mic className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="p-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm cursor-pointer"
                        title="Send Message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </footer>
        </div>
    );
}

export default function RecommendPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-400 text-sm">Loading AI Advisor...</div>}>
            <ChatInterface />
        </Suspense>
    );
}
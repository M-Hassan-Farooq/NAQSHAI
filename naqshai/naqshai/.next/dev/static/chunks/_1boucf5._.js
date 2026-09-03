(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/recommend/page.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RecommendPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserNav$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserNav.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bot.mjs [app-client] (ecmascript) <export default as Bot>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.mjs [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.mjs [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.mjs [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.mjs [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.mjs [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.mjs [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.mjs [app-client] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic-off.mjs [app-client] (ecmascript) <export default as MicOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.mjs [app-client] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-x.mjs [app-client] (ecmascript) <export default as VolumeX>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.mjs [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voiceHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/voiceHelper.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversationHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/conversationHelper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
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
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const contextPlotId = searchParams.get('context');
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [language, setLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Auto');
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            role: 'assistant',
            content: GREETINGS.Auto,
            recommendedPlots: []
        }
    ]);
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [voiceError, setVoiceError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [speakingIdx, setSpeakingIdx] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const chatEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const didAutoTriggerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const wasVoiceInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Stop speaking and speech recognition on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            return ({
                "ChatInterface.useEffect": ()=>{
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voiceHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stopSpeaking"])();
                    recognitionRef.current?.stop();
                }
            })["ChatInterface.useEffect"];
        }
    }["ChatInterface.useEffect"], []);
    const toggleListening = ()=>{
        setVoiceError('');
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }
        const SpeechRecognition = ("TURBOPACK compile-time value", "object") !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
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
            recognition.onstart = ()=>{
                setIsListening(true);
                wasVoiceInputRef.current = true;
            };
            recognition.onresult = (event)=>{
                const transcript = Array.from(event.results).map((res)=>res[0].transcript).join('');
                setInput(transcript);
                wasVoiceInputRef.current = true;
            };
            recognition.onerror = (event)=>{
                console.warn('SpeechRecognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setVoiceError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
                } else if (event.error !== 'no-speech') {
                    setVoiceError(`Voice input error: ${event.error}`);
                }
                setIsListening(false);
            };
            recognition.onend = ()=>{
                setIsListening(false);
            };
            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setVoiceError('Failed to activate microphone. Please check device permissions.');
            setIsListening(false);
        }
    };
    const handleToggleSpeak = (textToSpeak, idx)=>{
        if (speakingIdx === idx) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voiceHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["stopSpeaking"])();
            setSpeakingIdx(null);
            return;
        }
        const isUrduOrRoman = language === 'UR' || language === 'RO' || /[\u0600-\u06FF]/.test(textToSpeak);
        const langCode = language === 'UR' || language === 'RO' ? 'ur-PK' : 'en-US';
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$voiceHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["speakText"])(textToSpeak, {
            lang: langCode,
            isUrduOrRoman: isUrduOrRoman,
            onStart: ()=>setSpeakingIdx(idx),
            onEnd: ()=>setSpeakingIdx(null),
            onError: (err)=>{
                console.warn('Text-to-speech notice:', err);
                setSpeakingIdx(null);
            }
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            let isMounted = true;
            async function fetchSession() {
                try {
                    const { data: { session: activeSession } } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.getSession();
                    if (isMounted) setSession(activeSession);
                } catch (err) {
                    console.error('Session error on Recommend page:', err);
                }
            }
            fetchSession();
            const { data: { subscription } } = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.onAuthStateChange({
                "ChatInterface.useEffect": (_event, currentSession)=>{
                    if (isMounted) setSession(currentSession);
                }
            }["ChatInterface.useEffect"]);
            return ({
                "ChatInterface.useEffect": ()=>{
                    isMounted = false;
                    subscription?.unsubscribe();
                }
            })["ChatInterface.useEffect"];
        }
    }["ChatInterface.useEffect"], []);
    const handleSignOut = async ()=>{
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
        setSession(null);
        router.refresh();
    };
    const handleLanguageChange = (langOption)=>{
        setLanguage(langOption);
        setMessages((prev)=>{
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
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            chatEndRef.current?.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }["ChatInterface.useEffect"], [
        messages,
        loading
    ]);
    // Handle deep-linked context from 3D Map "Discuss with AI"
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatInterface.useEffect": ()=>{
            if (contextPlotId && !didAutoTriggerRef.current) {
                didAutoTriggerRef.current = true;
                const prompt = `Tell me about plot ${contextPlotId} in detail, including its risk assessment and pricing.`;
                handleSend(prompt);
            }
        }
    }["ChatInterface.useEffect"], [
        contextPlotId
    ]);
    const handleSend = async (textToSend)=>{
        const query = textToSend || input;
        if (!query.trim() || loading) return;
        // 1. Zero-Delay Fast Path for Casual Queries:
        // Purely conversational inputs, greetings, or pleasantries bypass all vector search, DB queries, and fake loading spinners entirely.
        const fastReply = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$conversationHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFastConversationalReply"])(query, language);
        if (fastReply) {
            const userMsg = {
                role: 'user',
                content: query
            };
            const assistantMsg = {
                role: 'assistant',
                content: fastReply,
                recommendedPlots: []
            };
            const nextMessages = [
                ...messages,
                userMsg,
                assistantMsg
            ];
            setMessages(nextMessages);
            setInput('');
            if (wasVoiceInputRef.current) {
                wasVoiceInputRef.current = false;
                const assistantIndex = nextMessages.length - 1;
                setTimeout(()=>{
                    handleToggleSpeak(fastReply, assistantIndex);
                }, 200);
            }
            return;
        }
        const userMsg = {
            role: 'user',
            content: query
        };
        const updatedMessages = [
            ...messages,
            userMsg
        ];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: updatedMessages,
                    language: language
                })
            });
            if (!res.ok) {
                const errorData = await res.json().catch(()=>({}));
                const safeReply = errorData.reply || 'Maazrat, request process karne me masla aya. Dobara koshish karein.';
                setMessages((prev)=>[
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
            setMessages((prev)=>[
                    ...prev,
                    {
                        role: 'assistant',
                        content: '',
                        recommendedPlots: []
                    }
                ]);
            if (reader) {
                while(true){
                    const { done, value } = await reader.read();
                    if (done) break;
                    accumulatedText += decoder.decode(value, {
                        stream: true
                    });
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
                    setMessages((prev)=>{
                        const next = [
                            ...prev
                        ];
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
                    parsedData = {
                        reply: cleanText,
                        recommendedPlots: []
                    };
                }
                const finalReply = parsedData?.reply || cleanText || 'Maazrat, koi reply nahi mil saka.';
                const finalPlots = parsedData?.recommendedPlots || [];
                setMessages((prev)=>{
                    const next = [
                        ...prev
                    ];
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
                    setTimeout(()=>{
                        handleToggleSpeak(finalReply, assistantIndex);
                    }, 350);
                }
            }
        } catch (err) {
            console.error('[ChatInterface] fetch error:', err);
            const fallbackReply = 'Maazrat, request process karne me masla aya. Dobara koshish karein.';
            setMessages((prev)=>[
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
                setTimeout(()=>{
                    handleToggleSpeak(fallbackReply, assistantIndex);
                }, 350);
            }
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col h-screen w-full overflow-hidden bg-slate-100 text-slate-800 font-sans",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white shadow-sm shrink-0",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative w-9 h-9 overflow-hidden rounded-xl border border-emerald-500/20 shadow-sm shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    alt: "NAQSHAI Mascot Logo",
                                    className: "object-cover",
                                    fill: true,
                                    src: "/Masaod.jpeg"
                                }, void 0, false, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 414,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 413,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "font-bold text-base text-slate-900",
                                                children: "NAQSHAI Smart Match"
                                            }, void 0, false, {
                                                fileName: "[project]/app/recommend/page.js",
                                                lineNumber: 418,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full",
                                                children: "Live Database"
                                            }, void 0, false, {
                                                fileName: "[project]/app/recommend/page.js",
                                                lineNumber: 419,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 417,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-slate-500",
                                        children: "Multilingual AI Plot Discovery (English / اردو / Roman Urdu)"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 423,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 416,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 412,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center p-1 bg-slate-200/80 border border-slate-300/80 rounded-xl text-xs font-medium",
                                children: [
                                    'Auto',
                                    'EN',
                                    'UR',
                                    'RO'
                                ].map((langOption)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleLanguageChange(langOption),
                                        className: `px-2.5 py-1 rounded-lg transition-all ${language === langOption ? 'bg-emerald-700 text-white shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'}`,
                                        children: langOption
                                    }, langOption, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 431,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 429,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: "/",
                                className: "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shrink-0 shadow-sm flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                                        className: "w-3.5 h-3.5 text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 450,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Home"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 451,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 446,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/sell'),
                                className: "bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shrink-0 shadow-sm",
                                children: "List Your Plot"
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 454,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>router.push('/explore'),
                                className: "flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition shrink-0 shadow-sm",
                                children: [
                                    "Explore 3D Map ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                        className: "w-3.5 h-3.5 text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 465,
                                        columnNumber: 40
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 461,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-l border-slate-200 pl-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserNav$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    session: session,
                                    onSignOut: handleSignOut
                                }, void 0, false, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 469,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 468,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 427,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/recommend/page.js",
                lineNumber: 411,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 overflow-y-auto w-full relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": "true",
                        className: "hidden xl:flex pointer-events-none fixed left-4 2xl:left-10 top-1/2 -translate-y-1/2 z-0 select-none opacity-15 transition-opacity",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/mascot.png",
                            alt: "",
                            className: "w-32 xl:w-40 2xl:w-52 h-auto object-contain drop-shadow-sm",
                            draggable: false
                        }, void 0, false, {
                            fileName: "[project]/app/recommend/page.js",
                            lineNumber: 484,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 480,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        "aria-hidden": "true",
                        className: "hidden xl:flex pointer-events-none fixed right-6 2xl:right-12 top-1/2 -translate-y-1/2 z-0 select-none opacity-15 transition-opacity scale-x-[-1]",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                            src: "/mascot.png",
                            alt: "",
                            className: "w-32 xl:w-40 2xl:w-52 h-auto object-contain drop-shadow-sm",
                            draggable: false
                        }, void 0, false, {
                            fileName: "[project]/app/recommend/page.js",
                            lineNumber: 497,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 493,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-4xl mx-auto p-4 md:p-6 space-y-6 w-full relative z-10",
                        children: [
                            messages.map((msg, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                    children: [
                                        msg.role === 'assistant' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700 shadow-sm mt-0.5",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bot$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bot$3e$__["Bot"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/app/recommend/page.js",
                                                lineNumber: 513,
                                                columnNumber: 37
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/recommend/page.js",
                                            lineNumber: 512,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "max-w-[88%] md:max-w-[78%] space-y-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    dir: "auto",
                                                    className: `p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line relative group ${msg.role === 'user' ? 'bg-emerald-700 text-white rounded-br-none shadow-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: msg.content
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/recommend/page.js",
                                                            lineNumber: 526,
                                                            columnNumber: 37
                                                        }, this),
                                                        msg.role === 'assistant' && msg.content && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-end mt-2 pt-1 border-t border-slate-100/80",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>handleToggleSpeak(msg.content, idx),
                                                                className: `inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg transition-all cursor-pointer ${speakingIdx === idx ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'}`,
                                                                title: speakingIdx === idx ? 'Stop reading aloud' : 'Listen to message (Text-to-Speech)',
                                                                children: speakingIdx === idx ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$x$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__VolumeX$3e$__["VolumeX"], {
                                                                            className: "w-3.5 h-3.5 text-emerald-700 animate-pulse"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 543,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Stop Reading"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 544,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/recommend/page.js",
                                                                    lineNumber: 542,
                                                                    columnNumber: 53
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"], {
                                                                            className: "w-3.5 h-3.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 548,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: "Read Aloud"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 549,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/recommend/page.js",
                                                                    lineNumber: 547,
                                                                    columnNumber: 53
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/recommend/page.js",
                                                                lineNumber: 531,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/recommend/page.js",
                                                            lineNumber: 530,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/recommend/page.js",
                                                    lineNumber: 518,
                                                    columnNumber: 33
                                                }, this),
                                                msg.recommendedPlots?.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1",
                                                    children: msg.recommendedPlots.map((plot)=>{
                                                        const isLowRisk = plot.floodRisk?.toLowerCase().includes('low');
                                                        const isModerateRisk = plot.floodRisk?.toLowerCase().includes('moderate') || plot.floodRisk?.toLowerCase().includes('medium');
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "p-4 bg-white border border-slate-200 rounded-2xl space-y-3 hover:border-emerald-300 transition shadow-sm flex flex-col justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-2.5",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex justify-between items-start gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                            className: "flex items-center gap-1.5",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono",
                                                                                                    children: plot.id
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                                    lineNumber: 575,
                                                                                                    columnNumber: 69
                                                                                                }, this),
                                                                                                plot.isVerified && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded",
                                                                                                    children: [
                                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                                                            className: "w-3 h-3 text-emerald-600"
                                                                                                        }, void 0, false, {
                                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                                            lineNumber: 580,
                                                                                                            columnNumber: 77
                                                                                                        }, this),
                                                                                                        "Verified"
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                                    lineNumber: 579,
                                                                                                    columnNumber: 73
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 574,
                                                                                            columnNumber: 65
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                            className: "font-semibold text-sm mt-1.5 text-slate-900 leading-snug",
                                                                                            children: plot.title
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 585,
                                                                                            columnNumber: 65
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 573,
                                                                                    columnNumber: 61
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 whitespace-nowrap shrink-0",
                                                                                    children: plot.price
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 589,
                                                                                    columnNumber: 61
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 572,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-xs text-slate-500 space-y-1.5 pt-0.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "flex items-center gap-1.5 text-slate-600",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                                                            className: "w-3.5 h-3.5 text-emerald-600 shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 596,
                                                                                            columnNumber: 61
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            children: [
                                                                                                plot.society ? `${plot.society}, ` : '',
                                                                                                plot.city,
                                                                                                " • ",
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                                    className: "text-slate-800",
                                                                                                    children: plot.size
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                                    lineNumber: 599,
                                                                                                    columnNumber: 79
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 597,
                                                                                            columnNumber: 61
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 595,
                                                                                    columnNumber: 57
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "flex flex-wrap items-center gap-1.5 pt-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: `inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-medium ${isLowRisk ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : isModerateRisk ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`,
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                                                                    className: "w-3 h-3 text-emerald-600"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                                    lineNumber: 613,
                                                                                                    columnNumber: 65
                                                                                                }, this),
                                                                                                "Flood: ",
                                                                                                plot.floodRisk
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 604,
                                                                                            columnNumber: 61
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200",
                                                                                            children: [
                                                                                                "Noise: ",
                                                                                                plot.noiseLevel
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/app/recommend/page.js",
                                                                                            lineNumber: 616,
                                                                                            columnNumber: 61
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 603,
                                                                                    columnNumber: 57
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 594,
                                                                            columnNumber: 53
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/recommend/page.js",
                                                                    lineNumber: 571,
                                                                    columnNumber: 53
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "pt-2 flex flex-col gap-2",
                                                                    children: [
                                                                        plot.sellerPhone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                                            href: `https://wa.me/${plot.sellerPhone.replace(/[^0-9]/g, '')}?text=Hi,%20I%20saw%20${encodeURIComponent(plot.id)}%20on%20NAQSHAI`,
                                                                            target: "_blank",
                                                                            rel: "noopener noreferrer",
                                                                            className: "w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium transition shadow-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                                                                    className: "w-3.5 h-3.5 text-emerald-600"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 631,
                                                                                    columnNumber: 61
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: [
                                                                                        "Contact Seller (",
                                                                                        plot.sellerRole || 'Owner',
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 632,
                                                                                    columnNumber: 61
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 625,
                                                                            columnNumber: 57
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>router.push(`/explore?plot=${plot.id}`),
                                                                            className: "w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition shadow-sm",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    children: "Inspect on 3D Map"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 640,
                                                                                    columnNumber: 57
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                                    className: "w-3.5 h-3.5"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/app/recommend/page.js",
                                                                                    lineNumber: 641,
                                                                                    columnNumber: 57
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/recommend/page.js",
                                                                            lineNumber: 636,
                                                                            columnNumber: 53
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/recommend/page.js",
                                                                    lineNumber: 623,
                                                                    columnNumber: 49
                                                                }, this)
                                                            ]
                                                        }, plot.id, true, {
                                                            fileName: "[project]/app/recommend/page.js",
                                                            lineNumber: 567,
                                                            columnNumber: 49
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/recommend/page.js",
                                                    lineNumber: 559,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/recommend/page.js",
                                            lineNumber: 517,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, idx, true, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 507,
                                    columnNumber: 25
                                }, this)),
                            messages.length === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 mt-4 ml-11 max-w-[88%] md:max-w-[78%]",
                                children: (QUICK_QUESTIONS[language] || QUICK_QUESTIONS.Auto).map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleSend(item),
                                        className: "text-xs shrink-0 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-700 transition shadow-sm",
                                        children: item
                                    }, i, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 657,
                                        columnNumber: 29
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 655,
                                columnNumber: 21
                            }, this),
                            loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2.5 text-slate-500 text-xs italic ml-11 py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                        className: "w-4 h-4 animate-spin text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 671,
                                        columnNumber: 25
                                    }, this),
                                    "NAQSHAI Advisor is thinking..."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 670,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                ref: chatEndRef
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 675,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 505,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/recommend/page.js",
                lineNumber: 478,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "p-4 border-t border-slate-200 bg-white shrink-0",
                children: [
                    voiceError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-4xl mx-auto mb-2 px-3.5 py-2 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-in fade-in",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        className: "w-4 h-4 shrink-0 text-red-600"
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 685,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: voiceError
                                    }, void 0, false, {
                                        fileName: "[project]/app/recommend/page.js",
                                        lineNumber: 686,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 684,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setVoiceError(''),
                                className: "text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-0.5 cursor-pointer",
                                children: "Dismiss"
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 688,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 683,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: (e)=>{
                            e.preventDefault();
                            handleSend();
                        },
                        className: "max-w-4xl mx-auto flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                value: input,
                                onChange: (e)=>{
                                    setInput(e.target.value);
                                    wasVoiceInputRef.current = false;
                                },
                                placeholder: isListening ? "Listening... Speak in English now" : "Type in English, Roman Urdu (e.g. Islamabad me plot chahiye), or اردو...",
                                className: `flex-1 bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition text-slate-800 placeholder:text-slate-400 ${isListening ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20' : 'border-slate-200 focus:border-emerald-500'}`
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 706,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: toggleListening,
                                className: `p-3 rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center relative ${isListening ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-100 animate-pulse' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:text-emerald-700'}`,
                                title: isListening ? 'Stop listening' : 'Voice Input (English - Speech to Text)',
                                children: isListening ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2d$off$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MicOff$3e$__["MicOff"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 741,
                                    columnNumber: 29
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 743,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 726,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                disabled: loading || !input.trim(),
                                className: "p-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm cursor-pointer",
                                title: "Send Message",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/app/recommend/page.js",
                                    lineNumber: 753,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/recommend/page.js",
                                lineNumber: 747,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/recommend/page.js",
                        lineNumber: 699,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/recommend/page.js",
                lineNumber: 680,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/recommend/page.js",
        lineNumber: 409,
        columnNumber: 9
    }, this);
}
_s(ChatInterface, "RMZgrXN2K+tBDOo9Ekvp/sOq46U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = ChatInterface;
function RecommendPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-screen items-center justify-center text-slate-400 text-sm",
            children: "Loading AI Advisor..."
        }, void 0, false, {
            fileName: "[project]/app/recommend/page.js",
            lineNumber: 763,
            columnNumber: 29
        }, this),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatInterface, {}, void 0, false, {
            fileName: "[project]/app/recommend/page.js",
            lineNumber: 764,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/recommend/page.js",
        lineNumber: 763,
        columnNumber: 9
    }, this);
}
_c1 = RecommendPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "ChatInterface");
__turbopack_context__.k.register(_c1, "RecommendPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UserAvatar.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ProfileContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profileHelper.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function UserAvatar({ user, profile: propProfile, className = '' }) {
    _s();
    const { profile: contextProfile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    if (!user) return null;
    const localCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalCachedProfile"])(user.id);
    const userMeta = user.user_metadata || {};
    const activeProfile = propProfile || contextProfile || localCache;
    const avatarUrl = activeProfile?.avatar_url || userMeta.avatar_url || userMeta.picture || null;
    const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || user.email || 'User';
    const initial = displayName.trim().charAt(0).toUpperCase() || 'U';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-2 ${className}`,
        children: [
            avatarUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                src: avatarUrl,
                alt: displayName,
                title: displayName,
                className: "w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 23,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                title: displayName,
                className: "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center border border-emerald-800 shadow-sm shrink-0",
                children: initial
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 30,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs font-semibold text-slate-700 hidden lg:inline-block max-w-[120px] truncate",
                children: displayName
            }, void 0, false, {
                fileName: "[project]/components/UserAvatar.js",
                lineNumber: 37,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/UserAvatar.js",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(UserAvatar, "HuCLXjc09z3zPzAxOJOWdo/XnWc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"]
    ];
});
_c = UserAvatar;
var _c;
__turbopack_context__.k.register(_c, "UserAvatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/UserNav.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>UserNav
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserAvatar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/UserAvatar.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.mjs [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-client] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.mjs [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.mjs [app-client] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user-plus.mjs [app-client] (ecmascript) <export default as UserPlus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.mjs [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.mjs [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ProfileContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/FavoritesContext.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/profileHelper.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabaseClient.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
function UserNav({ session, onSignOut, className = '' }) {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const [isDropdownOpen, setIsDropdownOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [signingOut, setSigningOut] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const dropdownRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { user: contextUser, profile: contextProfile, loading: profileLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"])();
    const { count: favoritesCount } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"])();
    const activeUser = session?.user || contextUser;
    // Click-outside listener to close dropdown automatically
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "UserNav.useEffect": ()=>{
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            return ({
                "UserNav.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                    document.removeEventListener('touchstart', handleClickOutside);
                }
            })["UserNav.useEffect"];
        }
    }["UserNav.useEffect"], []);
    const handleSignOutClick = async ()=>{
        setIsDropdownOpen(false);
        const confirmed = window.confirm('Are you sure you want to sign out?');
        if (!confirmed) return;
        setSigningOut(true);
        try {
            if (onSignOut) {
                await onSignOut();
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabaseClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].auth.signOut();
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            console.error('Sign out error:', err);
        } finally{
            setSigningOut(false);
        }
    };
    const handleGoToSettings = ()=>{
        setIsDropdownOpen(false);
        router.push('/settings');
    };
    // Loading state skeleton
    if (profileLoading && !session && !contextUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 ${className}`,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-8 h-8 rounded-full bg-slate-200 animate-pulse"
            }, void 0, false, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/UserNav.js",
            lineNumber: 69,
            columnNumber: 7
        }, this);
    }
    // -------------------------------------------------------------
    // GUEST STATE (Unauthenticated User)
    // -------------------------------------------------------------
    if (!activeUser) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `flex items-center gap-2 ${className}`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login",
                    className: "flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"], {
                            className: "w-3.5 h-3.5 text-emerald-700"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 85,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Sign In"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/UserNav.js",
                    lineNumber: 81,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    href: "/login?signup=true",
                    className: "hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl shadow-xs transition",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2d$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__UserPlus$3e$__["UserPlus"], {
                            className: "w-3.5 h-3.5 text-emerald-100"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 92,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: "Sign Up"
                        }, void 0, false, {
                            fileName: "[project]/components/UserNav.js",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/UserNav.js",
                    lineNumber: 88,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/UserNav.js",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    // -------------------------------------------------------------
    // AUTHENTICATED STATE (Logged In User)
    // -------------------------------------------------------------
    const localCache = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$profileHelper$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getLocalCachedProfile"])(activeUser.id);
    const userMeta = activeUser.user_metadata || {};
    const activeProfile = contextProfile || localCache;
    const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || activeUser.email || 'Account';
    const phoneNumber = activeProfile?.phone_number || userMeta.phone_number || activeUser.phone;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `relative inline-block text-left ${className}`,
        ref: dropdownRef,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setIsDropdownOpen((prev)=>!prev),
                disabled: signingOut,
                className: "flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100/80 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50",
                "aria-expanded": isDropdownOpen,
                "aria-haspopup": "true",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$UserAvatar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        user: activeUser,
                        profile: activeProfile
                    }, void 0, false, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: `w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-emerald-700' : ''}`
                    }, void 0, false, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            isDropdownOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-slate-900 truncate",
                                children: displayName
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 133,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-slate-500 truncate",
                                children: activeUser.email
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 134,
                                columnNumber: 13
                            }, this),
                            phoneNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1 text-[10px] text-emerald-700 mt-1 font-mono font-medium",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"], {
                                        className: "w-3 h-3 text-emerald-600 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "truncate",
                                        children: phoneNumber
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 138,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 136,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 132,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-0.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    setIsDropdownOpen(false);
                                    router.push('/favorites');
                                },
                                className: "w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"], {
                                                className: "w-4 h-4 text-rose-500 fill-rose-500/20"
                                            }, void 0, false, {
                                                fileName: "[project]/components/UserNav.js",
                                                lineNumber: 154,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "My Favorites"
                                            }, void 0, false, {
                                                fileName: "[project]/components/UserNav.js",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this),
                                    favoritesCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                                        children: favoritesCount
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 158,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 145,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleGoToSettings,
                                className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-4 h-4 text-emerald-700"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "Account Settings"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-slate-100 my-1"
                            }, void 0, false, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 173,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: handleSignOutClick,
                                disabled: signingOut,
                                className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50",
                                children: [
                                    signingOut ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                        className: "w-4 h-4 text-slate-400 animate-spin"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                        className: "w-4 h-4 text-red-500"
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 184,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: signingOut ? 'Signing out...' : 'Sign Out'
                                    }, void 0, false, {
                                        fileName: "[project]/components/UserNav.js",
                                        lineNumber: 186,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/UserNav.js",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/UserNav.js",
                        lineNumber: 144,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/UserNav.js",
                lineNumber: 129,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/UserNav.js",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
_s(UserNav, "GOqJSExFz4aLnJd+R7Wjaiy31VA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ProfileContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useProfile"],
        __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$FavoritesContext$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useFavorites"]
    ];
});
_c = UserNav;
var _c;
__turbopack_context__.k.register(_c, "UserNav");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/conversationHelper.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Helper for zero-delay fast path conversational responses.
 * Detects casual pleasantries, greetings, and chitchat and provides
 * concise, punchy (1 short sentence max) responses in English, Urdu, or Roman Urdu.
 */ __turbopack_context__.s([
    "getFastConversationalReply",
    ()=>getFastConversationalReply
]);
function getFastConversationalReply(query, language = 'Auto') {
    if (!query || typeof query !== 'string') return null;
    const normalized = query.trim().toLowerCase().replace(/[?!.,;:_]/g, '').replace(/\s+/g, ' ');
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/voiceHelper.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Voice Assistant Helper (Speech-to-Text & Text-to-Speech)
 * Provides browser API compatibility, natural speech cleaning, South Asian voice mapping, and dynamic language configuration.
 */ __turbopack_context__.s([
    "cleanTextForSpeech",
    ()=>cleanTextForSpeech,
    "getBestVoiceForLanguage",
    ()=>getBestVoiceForLanguage,
    "isSpeechRecognitionSupported",
    ()=>isSpeechRecognitionSupported,
    "isSpeechSynthesisSupported",
    ()=>isSpeechSynthesisSupported,
    "speakText",
    ()=>speakText,
    "stopSpeaking",
    ()=>stopSpeaking
]);
function isSpeechRecognitionSupported() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
function isSpeechSynthesisSupported() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}
function cleanTextForSpeech(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    return rawText.replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1') // remove inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold
    .replace(/\*([^*]+)\*/g, '$1') // remove italic
    .replace(/#{1,6}\s+/g, '') // remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links, keep text
    .replace(/[-*•]\s+/g, '') // remove bullet points
    .replace(/\n+/g, '. ') // replace newlines with pauses
    .trim();
}
function getBestVoiceForLanguage(langCode, isUrduOrRoman = false) {
    if (("TURBOPACK compile-time value", "object") === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    if (isUrduOrRoman || langCode && langCode.toLowerCase().startsWith('ur')) {
        // 1. Direct Urdu voices (e.g. ur-PK, ur-IN, ur)
        const urduVoice = voices.find((v)=>v.lang && v.lang.toLowerCase().startsWith('ur'));
        if (urduVoice) return urduVoice;
        // 2. Hindi voices (e.g. hi-IN, hi) - Shares identical South Asian phonetics and cadence for Roman Urdu & Urdu
        const hindiVoice = voices.find((v)=>v.lang && v.lang.toLowerCase().startsWith('hi'));
        if (hindiVoice) return hindiVoice;
        // 3. South Asian English voices (en-IN)
        const southAsianVoice = voices.find((v)=>v.lang && (v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().startsWith('en-in')));
        if (southAsianVoice) return southAsianVoice;
    }
    // Standard language match
    if (langCode) {
        const exactMatch = voices.find((v)=>v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
        if (exactMatch) return exactMatch;
        const prefixMatch = voices.find((v)=>v.lang && v.lang.toLowerCase().startsWith(langCode.slice(0, 2).toLowerCase()));
        if (prefixMatch) return prefixMatch;
    }
    // Default fallback
    return voices.find((v)=>v.default) || voices[0] || null;
}
function speakText(text, options = {}) {
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
    const isUrduContext = options.isUrduOrRoman || hasUrduScript || options.lang === 'ur-PK' || options.lang === 'RO' || options.lang === 'UR';
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
    utterance.onstart = ()=>{
        if (options.onStart) options.onStart();
    };
    utterance.onend = ()=>{
        if (options.onEnd) options.onEnd();
    };
    utterance.onerror = (err)=>{
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
function stopSpeaking() {
    if (isSpeechSynthesisSupported()) {
        try {
            window.speechSynthesis.cancel();
        } catch (e) {
            console.warn('speechSynthesis.cancel notice:', e);
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1boucf5._.js.map
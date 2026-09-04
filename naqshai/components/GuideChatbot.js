'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  X,
  Send,
  ChevronDown,
  ArrowRight,
  MapPin,
  ShieldCheck,
  PlusCircle,
  Languages,
  RotateCcw,
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

const QUICK_QUESTIONS = [
  {
    id: '3d-map',
    label: 'How do I inspect 3D terrain?',
    query: 'How do I inspect 3D terrain?',
  },
  {
    id: 'flood-risk',
    label: 'What is flood risk analysis?',
    query: 'What is flood risk analysis?',
  },
  {
    id: 'list-plot',
    label: 'How do I list a plot?',
    query: 'How do I list a plot?',
  },
  {
    id: 'multilingual-ai',
    label: 'How does multilingual AI chat work?',
    query: 'How does the multilingual AI chat work?',
  },
  {
    id: 'societies',
    label: 'What societies are covered?',
    query: 'Which societies in Islamabad & Rawalpindi are covered?',
  },
];

const BUILT_IN_ANSWERS = {
  '3d-map': {
    reply:
      'You can inspect 3D elevation, contours, and slope angles by navigating to the 3D Map Explorer. You can tilt and rotate the camera, switch between Satellite and Hybrid terrain layers, and click on any plot boundary to examine slope gradients and surrounding terrain.',
    action: {
      label: 'Open 3D Map Explorer',
      href: '/explore',
      icon: MapPin,
    },
  },
  'flood-risk': {
    reply:
      'NAQSHAI analyzes monsoon rainfall trends, river runoff catchment, elevation profiles, and proximity to natural waterways/nullahs across Islamabad & Rawalpindi to generate a verified Flood Risk Index (Low, Moderate, High) before you invest.',
    action: {
      label: 'Explore Risk Intelligence',
      href: '#risk-intelligence',
      icon: ShieldCheck,
      isScroll: true,
    },
  },
  'list-plot': {
    reply:
      'Direct owners and authorized agencies can list plots in minutes by clicking "List Your Plot". Enter the plot dimensions, society (e.g. DHA, Bahria Town, CDA sectors), asking price, and elevation details to reach qualified buyers.',
    action: {
      label: 'List Your Plot Now',
      href: '/sell',
      icon: PlusCircle,
    },
  },
  'multilingual-ai': {
    reply:
      'Our AI Plot Advisor is built on Google Gemini and natively supports English, Roman Urdu (e.g. "Mujhe 10 Marla plot chahiye safe zone mein"), and Nastaliq Urdu script (اردو). You can ask questions in your preferred language and get tailored recommendations.',
    action: {
      label: 'Launch AI Plot Advisor',
      href: '/recommend',
      icon: Sparkles,
    },
  },
  'societies': {
    reply:
      'NAQSHAI currently features comprehensive geospatial intelligence for Islamabad and Rawalpindi, including DHA Phases 1–5, Bahria Town, Park View City, B-17 Multi Gardens, Gulberg Greens, Top City-1, Mumtaz City, and CDA Sectors (F, G, I).',
    action: {
      label: 'Inspect 3D Map',
      href: '/explore',
      icon: MapPin,
    },
  },
};

export default function GuideChatbot() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Hello! Welcome to NAQSHAI. I am your platform guide. How can I help you explore verified plots, 3D terrain, and flood risk analysis today?',
      actions: [
        { label: 'Inspect 3D Map', href: '/explore' },
        { label: 'AI Plot Advisor', href: '/recommend' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [speakingId, setSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Stop active speech and listening on unmount
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
      setVoiceError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((res) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access in your browser settings.');
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
      console.error('Speech recognition error:', err);
      setVoiceError('Failed to activate microphone.');
      setIsListening(false);
    }
  };

  const handleToggleSpeak = (textToSpeak, msgId) => {
    if (speakingId === msgId) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }

    speakText(textToSpeak, {
      onStart: () => setSpeakingId(msgId),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleActionClick = (action) => {
    if (action.isScroll && action.href.startsWith('#')) {
      const element = document.querySelector(action.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    router.push(action.href);
  };

  const handleSendQuery = async (queryText) => {
    const trimmed = (queryText || inputText).trim();
    if (!trimmed || loading) return;

    const userMessageId = `user-${Date.now()}`;
    const newMessages = [
      ...messages,
      { id: userMessageId, role: 'user', content: trimmed },
    ];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    // 1. Check for quick question match
    const lower = trimmed.toLowerCase();
    let matchedKey = null;

    if (lower.includes('3d') || lower.includes('terrain') || lower.includes('contour') || lower.includes('elevation')) {
      matchedKey = '3d-map';
    } else if (lower.includes('flood') || lower.includes('risk') || lower.includes('water') || lower.includes('nullah')) {
      matchedKey = 'flood-risk';
    } else if (lower.includes('list') || lower.includes('sell') || lower.includes('post plot')) {
      matchedKey = 'list-plot';
    } else if (lower.includes('urdu') || lower.includes('roman') || lower.includes('multilingual') || lower.includes('language') || lower.includes('chat')) {
      matchedKey = 'multilingual-ai';
    } else if (lower.includes('society') || lower.includes('societies') || lower.includes('islamabad') || lower.includes('rawalpindi') || lower.includes('area')) {
      matchedKey = 'societies';
    }

    if (matchedKey && BUILT_IN_ANSWERS[matchedKey]) {
      const answer = BUILT_IN_ANSWERS[matchedKey];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: answer.reply,
            actions: answer.action ? [answer.action] : [],
          },
        ]);
        setLoading(false);
      }, 400);
      return;
    }

    // 2. Query /api/chat with Gemini for custom questions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const chatPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatPayload,
          language: 'English',
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            recommendedPlots: data.recommendedPlots || [],
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content:
              'NAQSHAI provides geospatial intelligence, verified plot listings, and 3D terrain elevation across Islamabad and Rawalpindi. You can explore the 3D map or launch the AI Plot Advisor for detailed plot queries.',
            actions: [
              { label: '3D Map Explorer', href: '/explore' },
              { label: 'AI Advisor', href: '/recommend' },
            ],
          },
        ]);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError';
      console.warn('Guide chat API notice:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: isTimeout
            ? 'Request timed out due to network delay. Please check your connection and click Retry below.'
            : 'I am here to guide you through NAQSHAI! Use the 3D Map to inspect plot elevations, or the AI Advisor to find plots tailored to your budget and risk preferences.',
          actions: [
            { label: 'Open 3D Map', href: '/explore' },
            { label: 'AI Advisor', href: '/recommend' },
          ],
          showRetry: true,
          lastQuery: trimmed
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content:
          'Chat reset! Ask me anything about navigating NAQSHAI, flood risk analysis, 3D terrain inspection, or listing your plot.',
        actions: [
          { label: 'Inspect 3D Map', href: '/explore' },
          { label: 'AI Plot Advisor', href: '/recommend' },
        ],
      },
    ]);
  };

  return (
    <>
      {/* 1. Floating Collapsible Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 hover:text-emerald-800 text-xs font-semibold rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need Help? Ask Guide</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative p-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 cursor-pointer"
          aria-label={isOpen ? 'Close Guide Chat' : 'Open Platform Guide Chat'}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform duration-200 rotate-90 animate-in" />
          ) : (
            <div className="relative">
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 border-2 border-emerald-700 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 border-2 border-emerald-700 rounded-full" />
            </div>
          )}
        </button>
      </div>

      {/* 2. Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[560px] h-[520px] bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
          role="dialog"
          aria-labelledby="guide-chatbot-title"
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 id="guide-chatbot-title" className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>NAQSHAI Platform Guide</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </h2>
                <p className="text-[10px] text-slate-500">Live AI Onboarding Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat window"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Question Chips Banner */}
          <div className="px-3 py-2 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
              Quick:
            </span>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSendQuery(q.query)}
                className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 rounded-full transition whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Scrollable Message History */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs leading-relaxed">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Interactive Action Deep Links */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-300 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recommended Plots Preview (if returned by AI) */}
                  {msg.recommendedPlots && msg.recommendedPlots.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Matched Plots:
                      </p>
                      {msg.recommendedPlots.map((plot) => (
                        <div
                          key={plot.id}
                          onClick={() => router.push(`/explore?plot=${plot.id}`)}
                          className="p-2 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition cursor-pointer"
                        >
                          <p className="font-bold text-[11px] text-slate-900 truncate">
                            {plot.title}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>{plot.size} • {plot.city}</span>
                            <span className="font-semibold text-emerald-700">{plot.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text-to-Speech Speaker Button & Retry Action */}
                  {msg.role === 'assistant' && (msg.content || msg.showRetry) && (
                    <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      {msg.showRetry ? (
                        <button
                          type="button"
                          onClick={() => handleSendQuery(msg.lastQuery)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white px-2 py-0.5 rounded-md transition cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retry</span>
                        </button>
                      ) : <div />}

                      {msg.content && (
                        <button
                          type="button"
                          onClick={() => handleToggleSpeak(msg.content, msg.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md transition cursor-pointer ${
                            speakingId === msg.id
                              ? 'bg-emerald-100 text-emerald-800 font-semibold'
                              : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-200/50'
                          }`}
                          title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-emerald-700 animate-pulse" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-xs px-3.5 py-2.5 shadow-2xs flex items-center gap-1.5 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" />
                  <span className="text-[11px] font-medium text-slate-500 ml-1">Assistant is answering...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Inline Voice Error Banner */}
          {voiceError && (
            <div className="px-3 py-1.5 bg-red-50 border-t border-red-200 flex items-center justify-between text-[11px] text-red-700">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
                <span className="truncate max-w-[240px]">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceError('')}
                aria-label="Dismiss error notice"
                className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? "Listening... speak now"
                  : "Ask about 3D map, flood risk, or plots..."
              }
              aria-label="Ask AI Assistant a question"
              className={`flex-1 bg-white border rounded-xl px-3 py-2 text-xs focus:outline-none transition text-slate-800 placeholder-slate-400 ${
                isListening
                  ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                  : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
              }`}
            />

            {/* Microphone Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl transition shadow-sm flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-200 animate-pulse'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 hover:text-emerald-700'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your query (Speech to Text)'}
              aria-label={isListening ? 'Stop speech recognition' : 'Activate speech recognition'}
            >
              {isListening ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl shadow-sm transition flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
              title="Send Message"
              aria-label="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

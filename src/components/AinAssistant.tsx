import React, { useState, useRef, useEffect } from 'react';
import { Network, Search, Send, Cpu, Trash2, ArrowLeft, Terminal, Copy, RotateCw, StopCircle, HelpCircle, ShieldAlert } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ain';
  text: string;
  gatekeeper?: {
    type: string;
    extractedFilters: string[];
  };
  planner?: {
    sql: string;
    rationale: string;
  };
  hasDownTrigger?: boolean;
}

interface AinAssistantProps {
  onHighlightRegion: (region: any) => void;
}

export default function AinAssistant({ onHighlightRegion }: AinAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-start',
      sender: 'ain',
      text: 'أهلاً بك يا مهندس عزام في منصة **عَين v2** المحلية للذكاء الاصطناعي.\n\nأنا أعمل بالكامل **داخل بيبر السيرفر المغلق (Offline LAN)** عبر Ollama مدمج، ولدي صلاحيات قراءة آمنة فقط (Read-only SQL Sandbox) لتفقد مقاييس الأجهزة وحركة الباندويث.\n\nبإمكانك كتابة سؤالك بالعربية الفصحى أو بلهجتنا السعودية المريحة، وسأقوم بتحويله فوراً لاستعلامات بروتوكولية ذكية!',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<'idle' | 'gatekeeper' | 'planning' | 'narrating'>('idle');
  const [activePlanSql, setActivePlanSql] = useState('');
  const [activeGatekeeperLogs, setActiveGatekeeperLogs] = useState<string[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pipelineStep]);

  // Quick prompt pills list
  const samplePrompts = [
    { text: 'كم جهاز طافي عندي بالكامل؟', value: 'كم جهاز DOWN حالياً في الشبكة؟' },
    { text: 'وش حالة أجهزة الرياض والوسطى؟', value: 'اعطني حالة الأجهزة في الرياض' },
    { text: 'عندي كم إنذار نشط الآن بالمنشأة؟', value: 'وش الإنذارات المشتعلة حالياً بالمنشأة؟' },
    { text: 'أعطني تفاصيل interfaces خادم قاعدة البيانات', value: 'اعطني واجهات srv-med-database02' }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTalking) return;

    // Append user message
    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTalking(true);
    
    // Init Abort Controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Start pipeline animations
    setPipelineStep('gatekeeper');
    setActiveGatekeeperLogs(['تحليل الكلمات الدلالية وتصنيف حقل السؤال...', 'استخراج الكيانات الجغرافية وعناوين الـ IP...']);
    
    try {
      // Create context history out of last 5 messages
      const ctx = messages.slice(-5).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

      // Trigger Gatekeeper to Planner delay
      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 800);
        controller.signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new Error('ABORTED'));
        });
      });

      setPipelineStep('planning');
      setActiveGatekeeperLogs(p => [...p, 'تم تحديد النطاق: SQL Query Sandbox Authorized.']);
      
      // Hit Express server-side /api/chat route (built meticulously with gemini-3.5-flash)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          previousMessages: ctx
        }),
        signal: controller.signal
      });

      if (!res.ok) {
        throw new Error('Failed to reach local AI service');
      }

      const parsedJSON = await res.json();
      
      setPipelineStep('narrating');
      if (parsedJSON.planner && parsedJSON.planner.sql) {
        setActivePlanSql(parsedJSON.planner.sql);
      }

      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, 900);
        controller.signal.addEventListener('abort', () => {
          clearTimeout(t);
          reject(new Error('ABORTED'));
        });
      });

      // Build answer from response
      const serverText = parsedJSON.narrator?.text || 'خطأ غير معروف في ترجمة السجل الفوري.';
      
      // Highlight region if extracted by Gatekeeper
      if (parsedJSON.gatekeeper?.extractedFilters && parsedJSON.gatekeeper.extractedFilters.length > 0) {
        const firstFilter = parsedJSON.gatekeeper.extractedFilters[0];
        // If it looks like Saudi Region, trigger map callback
        if (firstFilter.includes('الرياض') || firstFilter.includes('مكة') || firstFilter.includes('الشرقية') || firstFilter.includes('عسير')) {
          onHighlightRegion(firstFilter);
        }
      }

      // Check if response contains indicators of DOWN or offline systems to trigger tremors
      const containsDown = textToSend.includes('down') || textToSend.includes('طافي') || textToSend.includes('متوقف') || textToSend.includes('مشكلة') || serverText.includes('طافية') || serverText.includes('Offline');

      const ainMsg: ChatMessage = {
        id: `ain-${Date.now()}`,
        sender: 'ain',
        text: serverText,
        gatekeeper: parsedJSON.gatekeeper,
        planner: parsedJSON.planner,
        hasDownTrigger: containsDown
      };

      setMessages(prev => [...prev, ainMsg]);

    } catch (err: any) {
      if (err.name === 'AbortError' || err.message === 'ABORTED') {
        setMessages(prev => [...prev, {
          id: `abort-${Date.now()}`,
          sender: 'ain',
          text: '🛑 تم إيقاف توليد الإجابة والاستعلام بناءً على طلب المهندس.'
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`,
          sender: 'ain',
          text: `⚠️ عذراً يا مهندس عزام، طرأ خطأ أثناء المحادثة المحلية: ${err.message || 'Error connecting to Ollama/Gemini server'}`
        }]);
      }
    } finally {
      setIsTalking(false);
      setPipelineStep('idle');
      setActivePlanSql('');
      setActiveGatekeeperLogs([]);
      abortControllerRef.current = null;
    }
  };

  const handleStopRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    alert('تم نسخ الرد العربي السحابي للجهاز الحافظة بنجاح!');
  };

  const clearHistory = () => {
    setMessages([
      {
        id: 'msg-clear',
        sender: 'ain',
        text: 'تمت تصفية الجلسة المحلية بنجاح. أهلاً بك مجدداً، سأنسى آخر 5 رسائل مسترجعة للبدء بسياقات معزولة جديدة.'
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Pipeline agents Sidebar */}
      <div className="lg:col-span-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[580px]">
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Terminal className="text-emerald-500 h-4 w-4" />
              سلسلة معالجة الذكاء الاصطناعي (Multi-Turn Agents)
            </h4>
            <p className="text-[10px] text-slate-500">مراقبة تفصيلية لـ 3 وكلاء يعالجون طلبك في النطاق المعزول</p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Step 1: Gatekeeper */}
            <div className={`p-2.5 rounded-xl border transition-all ${pipelineStep === 'gatekeeper' ? 'bg-blue-950/20 border-blue-500 shadow-sm' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-blue-400">1. البوّابة الأمنية (Gatekeeper)</span>
                {pipelineStep === 'gatekeeper' && <span className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-ping"></span>}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">يعمل على تصنيف محتوى السؤال واستخلاص الـ IPs والمدن لمنع تسريبات الاستعلام.</p>
              {pipelineStep === 'gatekeeper' && activeGatekeeperLogs.length > 0 && (
                <div className="mt-2 bg-slate-950 p-1.5 rounded font-mono text-[9px] text-slate-400 space-y-1">
                  {activeGatekeeperLogs.map((log, i) => (
                    <div key={i}>🠚 {log}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: SQL Planner */}
            <div className={`p-2.5 rounded-xl border transition-all ${pipelineStep === 'planning' ? 'bg-indigo-950/20 border-indigo-500 shadow-sm' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-indigo-400">2. مخطط الروابط والاستخراج (SQL Planner)</span>
                {pipelineStep === 'planning' && <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping"></span>}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">يبني استعلامات فك الرموز SQL المُحكمة للمسح السريع في الساند بوكس الآمن.</p>
              {pipelineStep === 'planning' && (
                <div className="mt-2 bg-slate-950 p-2 rounded font-mono text-[9px] text-yellow-500 border border-indigo-900/40">
                  {activePlanSql || 'Building SQL SELECT parameter loop...'}
                  <span className="inline-block h-3 w-1 bg-yellow-500 ml-1 animate-pulse"></span>
                </div>
              )}
            </div>

            {/* Step 3: Narrator */}
            <div className={`p-2.5 rounded-xl border transition-all ${pipelineStep === 'narrating' ? 'bg-emerald-950/20 border-emerald-500 shadow-sm' : 'bg-slate-950/40 border-slate-900 opacity-60'}`}>
              <div className="flex justify-between items-center font-semibold text-[11px]">
                <span className="text-emerald-400">3. المفسّر والمنبّئ (Narrator Dialog)</span>
                {pipelineStep === 'narrating' && <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>}
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">يحوّل مصفوفات الأداء والإنذارات الخام إلى ردود عربية مرحة وسياقية.</p>
            </div>
          </div>
        </div>

        {/* Validation Box */}
        <div className="bg-slate-950/80 p-3 border border-slate-800 rounded-xl space-y-1.5 text-[10px] text-slate-500 leading-relaxed font-mono">
          <div className="font-bold font-sans text-slate-400">🛡️ بيئة Sandbox Security SQL:</div>
          <div>- الصلاحيات: للقراءة فقط (Read-only)</div>
          <div>- الحد الأقصى للاستجابة: 5 ثوانٍ</div>
          <div>- معزول بالكامل: لا يتم تصدير حزمة واحدة للإنترنت</div>
        </div>
      </div>

      {/* Main Chat Interface Screen */}
      <div className={`lg:col-span-8 bg-slate-900/40 border rounded-2xl p-4 flex flex-col h-[580px] justify-between relative transition-all duration-300 ${isTalking ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)]' : 'border-slate-800'}`}>
        {/* Chat header panel */}
        <div className="border-b border-slate-800 pb-2.5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-950 text-emerald-400 rounded-lg">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm md:text-base flex items-center gap-1.5">
                مساعد الشبكة الإداري الذكي « عـَـيْـن »
              </h4>
              <p className="text-[11px] text-emerald-500 flex items-center gap-1 font-mono">
                ● متصل ومستقر (Local LLM Instance via Ollama)
              </p>
            </div>
          </div>

          <button 
            onClick={clearHistory}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-950 border border-transparent hover:border-slate-800 rounded-lg transition-all cursor-pointer"
            title="مسح السجل التاريخي"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Message Feed Container */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col gap-1.5 ${msg.sender === 'user' ? 'items-start pl-8' : 'items-end pr-8'}`}
            >
              {/* Sender signature label */}
              <span className="text-[9px] text-slate-500 font-mono tracking-wide">
                {msg.sender === 'user' ? 'ME_NOC_ADMIN_HQ' : 'AIN_LOCAL_AGENT'}
              </span>

              {/* Message text bubble */}
              <div 
                className={`p-3.5 rounded-2xl text-xs md:text-[13px] leading-relaxed relative ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-950 text-slate-100 rounded-tl-none border border-slate-800/80'
                } ${msg.hasDownTrigger ? 'border-red-500/40 animate-shake glow-red' : ''}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {/* Text formatting simulation */}
                {msg.text}

                {/* Optional SQL sandbox attachment display */}
                {msg.planner && msg.planner.sql && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 font-mono text-[10px] text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-1 text-slate-400 font-sans">
                      <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                      <span>قناة استعلام الـ SQL المفرزة محلياً (SQL Sandbox Preview):</span>
                    </div>
                    <div className="bg-slate-900/90 p-2 rounded-lg text-emerald-400 text-[10.5px] border border-slate-800 break-all select-all">
                      {msg.planner.sql}
                    </div>
                    <div className="text-[9.5px] text-slate-600 font-sans">
                      مسبّب الإستدعاء: {msg.planner.rationale}
                    </div>
                  </div>
                )}

                {/* Interactive map helper if region scope is isolated */}
                {msg.gatekeeper?.extractedFilters && msg.gatekeeper.extractedFilters.length > 0 && (
                  <div className="mt-2 text-[10px] text-blue-400 font-semibold font-sans">
                    🠚 تم تطبيق فلترة الخريطة التفاعلية استناداً على حيز: {msg.gatekeeper.extractedFilters.join('، ')}
                  </div>
                )}

                {/* Utility hover buttons */}
                {msg.sender === 'ain' && (
                  <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 group-hover:opacity-100 flex items-center gap-1">
                    <button 
                      onClick={() => handleCopy(msg.text)}
                      className="p-1 bg-slate-900 text-slate-400 hover:text-white rounded border border-slate-800 transition-all"
                      title="نسخ النص"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Inline pipeline step loaders */}
          {isTalking && (
            <div className="flex flex-col gap-1 items-end pr-8">
              <span className="text-[9px] text-slate-500 font-mono">AIN_LOCAL_AGENT</span>
              <div className="bg-slate-950 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 flex items-center gap-3">
                <div className="flex space-x-1.5 space-x-reverse">
                  <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce delay-100"></span>
                  <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce delay-200"></span>
                </div>
                <span className="text-xs text-slate-400 font-sans">
                  {pipelineStep === 'gatekeeper' && 'البوابة تفرز الكيانات الكودية...'}
                  {pipelineStep === 'planning' && 'المخطط يزن معادلة SQL...'}
                  {pipelineStep === 'narrating' && 'المتحدث يكتب الرد العربي...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Action pills for swift testing inside the iframe */}
        <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
          {samplePrompts.map((p) => (
            <button 
              key={p.text}
              onClick={() => handleSend(p.value)}
              disabled={isTalking}
              className="px-2.5 py-1.5 bg-slate-950/80 hover:bg-slate-900 text-[10px] text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer font-sans disabled:opacity-50"
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Form panel input values */}
        <div className="flex gap-2.5">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
            placeholder="اسأل عَين e.g: وش الأجهزة المتوقفة في الشرقية؟"
            className="flex-1 px-4 py-2.5 bg-slate-950 text-white text-xs md:text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 rounded-xl border border-slate-800/80 transition-colors"
            disabled={isTalking}
          />
          {isTalking ? (
            <button 
              onClick={handleStopRequest}
              className="px-4 py-2.5 bg-red-950/60 border border-red-900/40 text-red-400 font-bold hover:text-white hover:bg-red-900/40 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <StopCircle className="h-4 w-4" /> إيقاف
            </button>
          ) : (
            <button 
              onClick={() => handleSend(inputValue)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              إرسال <Send className="h-3.5 w-3.5 transform rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Adding shake animations to system for outage tremors */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

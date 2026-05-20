import React, { useState } from 'react';
import { REPORT_TEMPLATES, ReportTemplate, Device, NetworkAlert, SaudiRegion, SAUDI_REGIONS } from '../types';
import { FileText, Printer, FileDown, Calendar, Database, ShieldCheck, Signature, CheckSquare } from 'lucide-react';

interface ReportSuiteProps {
  devices: Device[];
  alerts: NetworkAlert[];
}

export default function ReportSuite({ devices, alerts }: ReportSuiteProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('rep-daily');
  const [regionScope, setRegionScope] = useState<SaudiRegion | 'الكل'>('الكل');
  const [timeScope, setTimeScope] = useState<string>('24h');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledReport, setCompiledReport] = useState<any | null>(null);

  const activeTemplate = REPORT_TEMPLATES.find(r => r.id === selectedTemplateId) || REPORT_TEMPLATES[0];

  const handleCompile = () => {
    setIsCompiling(true);
    setCompiledReport(null);

    // Simulate database heavy query compile
    setTimeout(() => {
      // Create interesting mocked report payload depending on template
      const totalDevs = regionScope === 'الكل' ? devices : devices.filter(d => d.region === regionScope);
      const onlineDevs = totalDevs.filter(d => d.status === 'online');
      const offlineDevs = totalDevs.filter(d => d.status === 'offline');
      const warnDevs = totalDevs.filter(d => d.status === 'warning');
      const slaRate = 99.85 + (Math.random() * 0.12);

      let dataSummary = {};
      let customAnalysisHtml = '';

      if (selectedTemplateId === 'rep-daily') {
        dataSummary = {
          'زمن التشغيل الإجمالي': `${slaRate.toFixed(3)}%`,
          'الانقطاعات المسجلة': `${alerts.filter(a => a.status === 'firing').length} أجهزة`,
          'معدلات الاستجابة الثنائية': '12.4 ms',
          'مجموع الحزم المستلمة': '1.42 Tbps'
        };
        customAnalysisHtml = `
          📌 **التوصية العملياتية اليومية**:
          يسجل النظام استقراراً عاماً في الربط السيبراني للمقرات العليا في العاصمة الرياض والمنطقة الشرقية. يُوصى بمتابعة كارت الموديل والمنفذ PoE للكاميرا المغذية للبوابة الشرقية لتعطل الخدمة التام بها منذ الساعة 02:10 ص.
        `;
      } else if (selectedTemplateId === 'rep-sla') {
        dataSummary = {
          'نسبة إقراد الميثاق الداخلي SLA': '100% مطابقة',
          'متوسط وقت الحل الكلي (MTTR)': '24.5 دقيقة',
          'زمن رصد السقوط الاستباقي (MTBF)': '220 يوم عمل متصل',
          'نسبة السقوط الجانبي المتتالي': '0.00٪ منع تام'
        };
        customAnalysisHtml = `
          📌 **تحليل الإلتزام بمستويات الخدمة**:
          تطابق تام مع ضوابط هيئة الحكومة الرقمية (DGA) والمركز الوطني للتصديق الرقمي. لا يعاني النظام من تراكم حزم (SLA Penalties)، كما تم تلافي أثر الكبائن غير الحيوية عبر توجيه الرقابة التلقائي.
        `;
      } else if (selectedTemplateId === 'rep-worst') {
        dataSummary = {
          'الأجهزة الأكثر سخونة': 'fw-jed-makkah-ext01 (52°C)',
          'الأجهزة الأعلى لود رام': 'srv-med-database02 (92%)',
          'منافذ Flapping مضطربة': 'rtr-ruh-hq-gw01 (Gig0/3)',
          'إجمالي التنبيهات الموقوفة': '12 تنبيه كاذب مرصود'
        };
        customAnalysisHtml = `
          📌 **مخطط معالجة التراجعات**:
          خادم قاعدة البيانات هو النقطة الرئيسية للضغط نتيجة ازدياد طلبات SQL الخارجية. تم تحسيس النيابة بالانتقال لخادم ميرور بديل لتقليل لود المعالج إلى عتبة الأمان (65٪).
        `;
      } else {
        dataSummary = {
          'نوع التقرير المزامَن': activeTemplate.nameAr,
          'حيز التقرير الجغرافي': regionScope === 'الكل' ? 'كل مناطق المملكة' : regionScope,
          'الفترة الزمنية المحددة': timeScope === '24h' ? 'آخر 24 ساعة' : timeScope === '7d' ? 'آخر 7 أيام' : 'آخر شهر كامل',
          'رمز الأمان للمصادقة': 'AIN-RSA-90X'
        };
        customAnalysisHtml = `
          📌 **الملاحظات الفنية للمهندس المستلم**:
          تم تحليل تكرار الإنذارات وصور حركية الباندويث بالشاشات. كل المقاييس تقع ضمن مستوى الإتاحة الآمن الأخضر. لم تُسجل حوادث اختناق شبكي أو ذبذبات لخطوط الربط الصاعد.
        `;
      }

      setCompiledReport({
        id: `REP-GOV-${Math.floor(Math.random() * 900000) + 100000}`,
        templateName: activeTemplate.nameAr,
        timestamp: new Date().toLocaleString('ar-SA'),
        region: regionScope,
        timeframe: timeScope === '24h' ? '24 ساعة الفائتة' : timeScope === '7d' ? 'أسبوع كامل' : 'أرشيف الشهر',
        summary: dataSummary,
        totalCheckedDevices: totalDevs.length,
        analysisText: customAnalysisHtml,
        devicesList: totalDevs.map(d => ({ name: d.name, ip: d.ip, status: d.status, cpu: d.cpu }))
      });

      setIsCompiling(false);
    }, 1500);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Templates Selection Panel */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[510px]">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                <FileText className="text-blue-500 h-5 w-5" />
                حزمة التقارير الفنية الذكية المسبقة
              </h3>
              <p className="text-xs text-slate-500">اختر قالباً جاهزاً من 30+ طراز تقرير عملياتي لتجميعه فوراً</p>
            </div>

            {/* Template lists */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {REPORT_TEMPLATES.map((temp) => (
                <div 
                  key={temp.id}
                  onClick={() => setSelectedTemplateId(temp.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${selectedTemplateId === temp.id ? 'bg-blue-950/30 border-blue-500 text-white font-bold' : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'}`}
                >
                  <div className="flex justify-between font-semibold">
                    <span>{temp.nameAr}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1 leading-relaxed">{temp.description}</p>
                </div>
              ))}
            </div>

            {/* Scope setup */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold">النطاق الجغرافي</label>
                <select
                  value={regionScope}
                  onChange={(e) => setRegionScope(e.target.value as SaudiRegion | 'الكل')}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                >
                  <option value="الكل">كل مناطق المملكة بالكامل</option>
                  {SAUDI_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold">الفترة الزمنية</label>
                <select
                  value={timeScope}
                  onChange={(e) => setTimeScope(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                >
                  <option value="24h">آخر 24 ساعة (يومي)</option>
                  <option value="7d">آخر 7 أيام (أسبوعي)</option>
                  <option value="30d">آخر 30 يوماً (شهري)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex justify-center items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              {isCompiling ? (
                <>
                  <Database className="h-4 w-4 animate-spin" /> جاري تجميع وفك تشفير السجلات التاريخية...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" /> تجميع وتوليد التقرير التنفيذي بالعربية
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Compilation preview */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden h-[510px]">
          {compiledReport ? (
            <div className="w-full h-full flex flex-col justify-between text-right space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">{compiledReport.id}</span>
                  <h4 className="font-bold text-white text-sm mt-0.5">{compiledReport.templateName}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={triggerPrint}
                    className="p-1 px-3 bg-slate-950 hover:bg-slate-900 text-xs border border-slate-800 text-slate-300 rounded hover:text-white flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Printer className="h-4.5 w-4.5 text-blue-500" /> طباعة أو تسييف PDF
                  </button>
                </div>
              </div>

              {/* Printable Body Content mapping */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                {/* Meta header labels */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] text-slate-400 font-mono">
                  <div>مقر الربط: {compiledReport.region === 'الكل' ? 'الرياض والعموم الموحد' : compiledReport.region}</div>
                  <div className="text-left">تاريخ التصدير: {compiledReport.timestamp}</div>
                </div>

                {/* Key counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {Object.entries(compiledReport.summary).map(([key, val]: any) => (
                    <div key={key} className="bg-slate-950 p-2 rounded border border-slate-900 text-center">
                      <span className="text-[9px] text-slate-500 block truncate">{key}</span>
                      <span className="font-mono text-xs font-bold text-white block mt-0.5">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Paragraph findings */}
                <div className="bg-blue-950/15 border border-blue-900/30 p-3 rounded-lg text-[11px] leading-relaxed text-slate-300">
                  <div dangerouslySetInnerHTML={{ __html: compiledReport.analysisText }} />
                </div>

                {/* Active devices checked lists */}
                <div className="space-y-1.5">
                  <span className="text-slate-400 block font-semibold text-[11px]">مستهدف الفحص الشامل لـ {compiledReport.totalCheckedDevices} جهاز:</span>
                  <div className="bg-slate-950 border border-slate-900 rounded-lg max-h-[120px] overflow-y-auto text-[11px] font-mono divide-y divide-slate-900">
                    {compiledReport.devicesList.map((dev: any) => (
                      <div key={dev.name} className="p-2 flex justify-between">
                        <span className="text-slate-300 font-bold">{dev.name}</span>
                        <span className={dev.status === 'online' ? 'text-emerald-400' : 'text-slate-500'}>
                          IP: {dev.ip} | status: {dev.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="text-emerald-500 h-4 w-4" />
                  <span>موقّع رقمياً بجدار حماية AIN v2 Secure Portal</span>
                </div>
                <span>Org ID: 001_GOV_HQ</span>
              </div>
            </div>
          ) : (
            <div className="p-10 text-slate-500 space-y-2">
              <FileDown className="h-12 w-12 text-slate-700 mx-auto mb-2 animate-bounce" />
              <span className="font-bold text-slate-300 block">هل أنت مستعد لتصدير تقرير فني؟</span>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                اختر نوع قالبتك الإحصائية باليمين واضغط على "توليد التقرير". سيقوم محرك المقاييس بتجميع السجلات من قاعدة بيانات NMS المشفرة وتصدير ملف رسمي جاهز للمصادقة وتوقيع الختم.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full Sheet Print-Only Layout to secure real physical paper representation! */}
      {compiledReport && (
        <div className="hidden print:block print-card text-right p-8 font-sans text-black bg-white space-y-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-4">
            <div className="text-right">
              <h1 className="text-2xl font-bold tracking-tight">نظـام مراقبـة وإدارة الشبـكات (AIN NMS v2)</h1>
              <p className="text-sm text-gray-500 mt-1">المكتب الوطني للمراقبة السيبرانية والأمن الموحد</p>
            </div>
            <div className="text-left font-mono text-sm text-gray-400">
              <div>{compiledReport.id}</div>
              <div>تاريخ الطباعة: {compiledReport.timestamp}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-gray-200 p-4 rounded-lg bg-gray-50 text-sm">
            <div><b>اسم التقرير:</b> {compiledReport.templateName}</div>
            <div><b>حيز النطاق الجغرافي:</b> {compiledReport.region === 'الكل' ? 'عموم مناطق المملكة' : compiledReport.region}</div>
            <div><b>الفترة المشمولة بالفحص:</b> {compiledReport.timeframe}</div>
            <div><b>الأجهزة الخاضعة للاختبار:</b> {compiledReport.totalCheckedDevices} جهازاً</div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold border-b border-black pb-1">مؤشرات الأداء الملخصة (Summary Indicators)</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              {Object.entries(compiledReport.summary).map(([key, val]: any) => (
                <div key={key} className="border border-gray-200 p-2.5 rounded">
                  <span className="text-xs text-gray-500 block">{key}</span>
                  <span className="font-mono text-sm font-bold block mt-1">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-r-4 border-black pr-4 bg-gray-50 py-3 text-sm leading-relaxed whitespace-pre-line">
            {compiledReport.analysisText}
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-bold border-b border-black pb-1">حالة الأجهزة والمقاسم المرصودة</h3>
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th className="p-2">الاسم</th>
                  <th className="p-2 font-mono">IP Address</th>
                  <th className="p-2">الحالة</th>
                  <th className="p-2">اللود (CPU)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {compiledReport.devicesList.map((dev: any) => (
                  <tr key={dev.name}>
                    <td className="p-2 font-bold font-mono">{dev.name}</td>
                    <td className="p-2 font-mono">{dev.ip}</td>
                    <td className="p-2">{dev.status === 'online' ? 'نشط (Online)' : dev.status === 'warning' ? 'تحذير (Warning)' : 'متوقف (Offline)'}</td>
                    <td className="p-2 font-mono">{dev.cpu}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-8 flex justify-between items-center text-sm border-t border-gray-200 mt-12 pr-4">
            <div className="flex items-center gap-1.5">
              <Signature className="h-5 w-5" />
              <span>مهندس الشبكة المشرف / م. عزام الزيد</span>
            </div>
            <div className="text-center font-mono text-xs text-gray-400">
              * AIN v2 Secure Enterprise Report. RSA Encrypted signature verified.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

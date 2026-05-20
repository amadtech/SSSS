import React, { useState, useEffect } from 'react';
import { Device, NetworkAlert, SaudiRegion, SAUDI_REGIONS } from '../types';
import { Network, ShieldAlert, Cpu, Activity, ArrowUpRight, ArrowDownLeft, MapPin, Search, AlertCircle, RefreshCw, Layers } from 'lucide-react';

interface NocDashboardProps {
  devices: Device[];
  alerts: NetworkAlert[];
  selectedRegion: SaudiRegion | 'الكل';
  onSelectRegion: (region: SaudiRegion | 'الكل') => void;
  onAckAlert: (id: string) => void;
}

export default function NocDashboard({
  devices,
  alerts,
  selectedRegion,
  onSelectRegion,
  onAckAlert
}: NocDashboardProps) {
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString('ar-SA'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  // Saudi regions coordinate map for custom schematic view
  const regionCoordinates: Record<SaudiRegion, { x: number; y: number; labelOffset: 'top' | 'bottom' | 'left' | 'right' }> = {
    'الرياض': { x: 220, y: 160, labelOffset: 'right' },
    'الشرقية': { x: 310, y: 120, labelOffset: 'right' },
    'مكة المكرمة': { x: 120, y: 200, labelOffset: 'left' },
    'المدينة المنورة': { x: 110, y: 130, labelOffset: 'left' },
    'تبوك': { x: 70, y: 70, labelOffset: 'left' },
    'عسير': { x: 130, y: 250, labelOffset: 'right' },
    'جازان': { x: 120, y: 290, labelOffset: 'bottom' },
    'نجران': { x: 180, y: 270, labelOffset: 'bottom' },
    'الباحة': { x: 110, y: 230, labelOffset: 'left' },
    'القصيم': { x: 180, y: 110, labelOffset: 'top' },
    'حائل': { x: 140, y: 90, labelOffset: 'top' },
    'الجوف': { x: 100, y: 50, labelOffset: 'top' },
    'الحدود الشمالية': { x: 160, y: 35, labelOffset: 'top' }
  };

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ar-SA'));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const filteredDevices = devices.filter(d => {
    const matchesRegion = selectedRegion === 'الكل' || d.region === selectedRegion;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip.includes(searchTerm);
    return matchesRegion && matchesSearch;
  });

  const activeAlerts = alerts.filter(a => {
    const matchesRegion = selectedRegion === 'الكل' || a.region === selectedRegion;
    return matchesRegion && a.status === 'firing';
  });

  useEffect(() => {
    setActiveAlertCount(activeAlerts.length);
  }, [activeAlerts.length]);

  // Compute stats
  const totalCount = filteredDevices.length;
  const onlineCount = filteredDevices.filter(d => d.status === 'online').length;
  const offlineCount = filteredDevices.filter(d => d.status === 'offline').length;
  const warningCount = filteredDevices.filter(d => d.status === 'warning').length;

  const totalTrafficIn = filteredDevices.reduce((sum, d) => sum + d.interfaces.reduce((is, i) => is + (i.status === 'up' ? i.trafficIn : 0), 0), 0);
  const totalTrafficOut = filteredDevices.reduce((sum, d) => sum + d.interfaces.reduce((is, i) => is + (i.status === 'up' ? i.trafficOut : 0), 0), 0);

  // Average CPU
  const avgCpu = totalCount > 0 ? Math.round(filteredDevices.reduce((sum, d) => sum + d.cpu, 0) / totalCount) : 0;

  // Render SVG Sparkline for simulated bandwidth
  const bandwidthPoints = [30, 45, 35, 60, 52, 75, 48, 80, 72, 95, 88, 110, 85, 98];

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-blue-500 h-5 w-5" />
            مركز المراقبة الوطني الموحد (NOC)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            البنية التحتية لحكومة المملكة الرقمية — بيئة معزولة ونشطة بالكامل Offline Security Grid
          </p>
        </div>
        <div className="flex items-center gap-4 self-stretch md:self-auto justify-between bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">الوقت المزامَن بتوقيت أم القرى</span>
            <span className="text-sm font-mono text-emerald-400 font-bold tracking-widest">{currentTime}</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-left font-mono text-xs text-slate-500">
            <div>2026-05-20</div>
            <div className="text-emerald-500">Org: 001_GOV</div>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Device Health Status */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400">إجمالي الأجهزة</span>
            <Network className="text-blue-500 h-5 w-5" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">{totalCount}</span>
            <span className="text-xs text-slate-500">نظام فرعي</span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-1 text-center text-xs">
            <div className="bg-emerald-950/30 p-1 rounded border border-emerald-900/50">
              <span className="text-emerald-400 font-mono block font-bold">{onlineCount}</span>
              <span className="text-slate-500 scale-90 block">متصل</span>
            </div>
            <div className="bg-amber-950/30 p-1 rounded border border-amber-900/50">
              <span className="text-amber-400 font-mono block font-bold">{warningCount}</span>
              <span className="text-slate-500 scale-90 block">إنذار</span>
            </div>
            <div className="bg-red-950/30 p-1 rounded border border-red-900/50">
              <span className="text-red-400 font-mono block font-bold">{offlineCount}</span>
              <span className="text-slate-500 scale-90 block">متوقف</span>
            </div>
          </div>
        </div>

        {/* Firing Alerts */}
        <div className={`p-4 border rounded-xl relative overflow-hidden transition-all duration-300 ${activeAlertCount > 0 ? 'bg-red-950/20 border-red-900/40 glow-red' : 'bg-slate-900/50 border-slate-800'}`}>
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400">الإنذارات النشطة</span>
            <ShieldAlert className={`${activeAlertCount > 0 ? 'text-red-500 animate-pulse' : 'text-slate-500'} h-5 w-5`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-3xl font-mono font-bold ${activeAlertCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>{activeAlertCount}</span>
            <span className="text-xs text-slate-500">نشط الآن</span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            {activeAlertCount > 0 ? 'حالات حرجة تتطلب مراجعة المنفذ أو السقوط المفاجئ' : 'كل المؤشرات والترابطات السيبرانية آمنة.'}
          </p>
          {activeAlertCount > 0 && <span className="absolute top-0 right-0 h-1.5 w-1.5 bg-red-500 rounded-full animate-ping"></span>}
        </div>

        {/* Bandwidth Usage */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400">حركة الباندويث الإجمالية</span>
            <Activity className="text-emerald-500 h-5 w-5" />
          </div>
          <div className="mt-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ArrowDownLeft className="text-emerald-500 h-4 w-4" />
              <span className="text-sm text-slate-500">الوارد:</span>
              <span className="font-mono font-bold text-white">{(totalTrafficIn / 1000).toFixed(2)} Gbps</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <ArrowUpRight className="text-blue-500 h-4 w-4" />
              <span className="text-sm text-slate-500">الصادر:</span>
              <span className="font-mono font-bold text-white">{(totalTrafficOut / 1000).toFixed(2)} Gbps</span>
            </div>
          </div>
          <div className="mt-2 h-6">
            <svg viewBox="0 0 100 25" className="w-full h-full stroke-emerald-500 fill-none stroke-1">
              <path d={bandwidthPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${i * 7} ${25 - (p / 5)}`, '')} />
            </svg>
          </div>
        </div>

        {/* Host Usage Level Gauge */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-xl">
          <div className="flex justify-between items-start">
            <span className="text-sm text-slate-400">متوسط الأداء الإجمالي</span>
            <Cpu className="text-amber-500 h-5 w-5" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-white">{avgCpu}%</span>
            <span className="text-xs text-slate-500">متوسط المعالج</span>
          </div>
          <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${avgCpu > 80 ? 'bg-red-500' : avgCpu > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${avgCpu}%` }}
            ></div>
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
            <span>مستقر</span>
            <span>الأقصى</span>
          </div>
        </div>
      </div>

      {/* Middle Section: interactive Saudi Region Map & quick filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Schematic Geographic Map Block */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl lg:col-span-8 cyber-grid flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="text-emerald-500 h-5 w-5" />
                خريطة التوزيع الجغرافي والربط السيبراني (13 منطقة سعودية)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توبولوجيا سحابية محلية بالكامل — انقر على العقد والمحافظات لتصفية الأجهزة والإنذارات
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onSelectRegion('الكل')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedRegion === 'الكل' ? 'bg-emerald-500 text-slate-950 border-emerald-400 glow-green' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'}`}
              >
                المملكة بالكامل (الكل)
              </button>
            </div>
          </div>

          {/* Map area */}
          <div className="relative flex justify-center items-center py-6 h-[400px] overflow-hidden my-4">
            <svg 
              viewBox="0 0 400 320" 
              className="w-full max-w-[440px] h-full object-contain"
            >
              <defs>
                <radialGradient id="glowG" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="glowR" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Draw schematic data link connections back to HQ (Riyadh) */}
              {SAUDI_REGIONS.map((region) => {
                if (region === 'الرياض') return null;
                const rCoords = regionCoordinates[region];
                const hCoords = regionCoordinates['الرياض'];
                if (!rCoords || !hCoords) return null;
                
                // Determine if this region has an offline device
                const hasOffline = devices.some(d => d.region === region && d.status === 'offline');
                const lineColor = hasOffline ? '#ef4444' : '#3b82f6';
                const opacity = selectedRegion === 'الكل' || selectedRegion === region ? '0.2' : '0.05';
                const dashArray = hasOffline ? '2,2' : '4,4';
                
                return (
                  <g key={`link-${region}`}>
                    <line 
                      x1={rCoords.x} 
                      y1={rCoords.y} 
                      x2={hCoords.x} 
                      y2={hCoords.y} 
                      stroke={lineColor} 
                      strokeWidth="1.5" 
                      strokeOpacity={opacity}
                      strokeDasharray={dashArray}
                    />
                    {/* Pulsing signal bullet along the line */}
                    {!hasOffline && (selectedRegion === 'الكل' || selectedRegion === region) && (
                      <circle r="2.5" fill="#10b981">
                        <animateMotion 
                          dur={`${Math.random() * 2 + 2}s`} 
                          repeatCount="indefinite"
                          path={`M ${rCoords.x} ${rCoords.y} L ${hCoords.x} ${hCoords.y}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Draw Region Nodes */}
              {SAUDI_REGIONS.map((region) => {
                const coords = regionCoordinates[region];
                if (!coords) return null;

                const regionDevices = devices.filter(d => d.region === region);
                const hasOffline = regionDevices.some(d => d.status === 'offline');
                const hasWarning = regionDevices.some(d => d.status === 'warning');
                const isCurrent = selectedRegion === region;

                // Color coding
                const nodeColor = hasOffline 
                  ? '#ef4444' 
                  : hasWarning 
                    ? '#f59e0b' 
                    : '#10b981';

                return (
                  <g 
                    key={region} 
                    transform={`translate(${coords.x}, ${coords.y})`}
                    className="cursor-pointer group"
                    onClick={() => onSelectRegion(region)}
                  >
                    {/* Ring glow */}
                    <circle 
                      r={isCurrent ? 24 : 16} 
                      fill={hasOffline ? 'url(#glowR)' : 'url(#glowG)'} 
                      className={isCurrent ? 'animate-pulse' : 'hidden group-hover:block'} 
                    />
                    
                    {/* Small map anchor circle */}
                    <circle 
                      r={isCurrent ? 7 : 5} 
                      fill={nodeColor} 
                      stroke="#020617" 
                      strokeWidth="2" 
                      className={`transition-all duration-300 ${hasOffline ? 'animate-ping' : ''}`}
                    />
                    
                    {/* Core node */}
                    <circle 
                      r={isCurrent ? 4.5 : 3.5} 
                      fill={nodeColor}
                    />

                    {/* Region Label text */}
                    <text
                      y={coords.labelOffset === 'top' ? -12 : coords.labelOffset === 'bottom' ? 18 : 3}
                      x={coords.labelOffset === 'left' ? -14 : coords.labelOffset === 'right' ? 14 : 0}
                      textAnchor={
                        coords.labelOffset === 'left' 
                          ? 'end' 
                          : coords.labelOffset === 'right' 
                            ? 'start' 
                            : 'middle'
                      }
                      fill={isCurrent ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontWeight={isCurrent ? '700' : '500'}
                      className="transition-colors pointer-events-none select-none font-sans"
                    >
                      {region} 
                      <tspan fill="#64748b" fontSize="8" dx="2">
                        ({regionDevices.length})
                      </tspan>
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Float Legends overlay */}
            <div className="absolute bottom-1 right-2 bg-slate-950/90 border border-slate-800 p-2 rounded-lg text-[10px] space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>متصل ومستقر بالكامل</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>تحذير / أداء مستهلك</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block animate-pulse"></span>
                <span>طافي / مقطوع الاتصال</span>
              </div>
            </div>
          </div>

          {/* Quick Filter Info Panel */}
          <div className="bg-slate-950/80 p-3 border border-slate-800/80 rounded-xl flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
            <span>المنطقة المختارة حالياً: <b className="text-white text-sm">{selectedRegion}</b></span>
            {selectedRegion !== 'الكل' && (
              <button 
                onClick={() => onSelectRegion('الكل')}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                إلغاء التصفية الجغرافية <RefreshCw h-3 w-3 />
              </button>
            )}
          </div>
        </div>

        {/* Live Active Alarms Screen */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl lg:col-span-4 flex flex-col h-[544px]">
          <div className="border-b border-slate-800/85 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
                <AlertCircle className="text-red-500 h-4 w-4" />
                سجل التنبيهات الفورية الفعالة
              </h3>
              <p className="text-[11px] text-slate-500">موجز الإنذارات النشطة المفتوحة (Firing Rooms)</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-950/80 border border-red-800/80 text-red-500 rounded-full font-mono">
              REALTIME
            </span>
          </div>

          {/* Alerts scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-3 mt-4 pr-1">
            {activeAlerts.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-4">
                <span className="text-4xl">☘️</span>
                <span className="font-bold text-slate-300 mt-2 block">الشبكة ممتازة وخالية من الأعطال</span>
                <span className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                  لا توجد أي إنذارات نشطة حالياً، كل الأجهزة مسقوفة ضمن الأوقات القياسية.
                </span>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={`p-3 rounded-xl border transition-all text-xs relative ${
                    alert.severity === 'critical'
                      ? 'bg-red-950/20 border-red-900/50 hover:bg-red-950/30 glow-red'
                      : alert.severity === 'error'
                        ? 'bg-orange-950/15 border-orange-900/40 hover:bg-orange-950/20'
                        : 'bg-amber-950/10 border-amber-900/30 hover:bg-amber-950/15'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-bold text-white font-mono break-all">{alert.deviceName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      alert.severity === 'critical'
                        ? 'bg-red-900/40 text-red-400'
                        : alert.severity === 'error'
                          ? 'bg-orange-900/40 text-orange-400'
                          : 'bg-amber-900/40 text-amber-400'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-slate-300 mt-1.5 leading-relaxed text-[11px]">
                    {alert.message}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-500 flex justify-between items-center font-mono">
                    <span>IP: {alert.deviceIp} | {alert.region}</span>
                    <span>{alert.metric}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                    <button
                      onClick={() => onAckAlert(alert.id)}
                      className="px-2 py-0.5 text-[10px] bg-slate-950 border border-slate-800 text-emerald-400 font-sans hover:border-emerald-500 hover:text-white rounded-md transition-all cursor-pointer"
                    >
                      إقرار واستلام (Ack)
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SLA Metrics summary row */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="text-xs font-bold text-slate-500 block">متوسط زمن الاستجابة (ICMP Latency)</h4>
          <span className="text-2xl font-mono text-emerald-400 block mt-1 font-bold">12.4 ms</span>
          <p className="text-[10px] text-slate-500 mt-1">تأخر الحزم الكلي على كبائن الأقسام والمحافظات</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-500 block">نسبة كفاءة الإتاحة السنوية (SLA Target)</h4>
          <span className="text-2xl font-mono text-white block mt-1 font-bold">99.985%</span>
          <p className="text-[10px] text-slate-500 mt-1">مطابق للائحة هيئة الحكومة الرقمية (DGA)</p>
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-500 block">معدل تكرار الإنذارات الكاذبة (False Positive)</h4>
          <span className="text-2xl font-mono text-blue-400 block mt-1 font-bold">0.82%</span>
          <p className="text-[10px] text-slate-500 mt-1">انخفاض مميز بفعل خوارزميات التصفية الذاتية للمنصة</p>
        </div>
      </div>
    </div>
  );
}

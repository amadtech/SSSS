import React, { useState, useEffect } from 'react';
import { NetFlowRecord, INITIAL_NETFLOW } from '../types';
import { Activity, ArrowRightLeft, ShieldAlert, Cpu, Filter, Server, CircleDot, RefreshCw, BarChart } from 'lucide-react';

interface TrafficAnalyzerProps {
  devices: any[];
}

export default function TrafficAnalyzer({ devices }: TrafficAnalyzerProps) {
  const [activeFlows, setActiveFlows] = useState<NetFlowRecord[]>(INITIAL_NETFLOW);
  const [deviceFilter, setDeviceFilter] = useState<string>('الكل');
  const [protocolFilter, setProtocolFilter] = useState<string>('الكل');
  const [isCapturing, setIsCapturing] = useState(true);

  // Auto simulate scrolling real-time NetFlow data ingestion
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      setActiveFlows(prev => {
        // Generate new random mock flow packet
        const srcIps = ['10.10.1.100', '10.20.1.52', '10.10.10.5', '10.30.2.14', '10.40.12.5', '192.168.12.80', '10.50.4.40', '10.10.1.12'];
        const dstIps = ['10.10.1.10', '185.12.5.4', '10.10.1.55', '10.30.1.200', '10.1.50.15', '192.168.100.50'];
        const protocols = ['HTTPS', 'SSH', 'LDAP', 'PostgreSQL', 'Syslog', 'SNMP', 'DNS'];
        const portsMap: Record<string, number> = { HTTPS: 443, SSH: 22, LDAP: 389, PostgreSQL: 5432, Syslog: 514, SNMP: 161, DNS: 53 };
        
        const selectedProto = protocols[Math.floor(Math.random() * protocols.length)];
        const newFlow: NetFlowRecord = {
          id: `flow-${Date.now()}`,
          srcIp: srcIps[Math.floor(Math.random() * srcIps.length)],
          srcPort: Math.floor(Math.random() * 64000) + 1024,
          dstIp: dstIps[Math.floor(Math.random() * dstIps.length)],
          dstPort: portsMap[selectedProto] || 80,
          protocol: selectedProto,
          bytes: Math.floor(Math.random() * 8500000) + 500000,
          packets: Math.floor(Math.random() * 6000) + 200,
          device: devices[Math.floor(Math.random() * devices.length)].name,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        };

        // Keep last 15 flows
        return [newFlow, ...prev.slice(0, 14)];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isCapturing, devices]);

  // Filters
  const filteredFlows = activeFlows.filter(flow => {
    const matchesDevice = deviceFilter === 'الكل' || flow.device === deviceFilter;
    const matchesProto = protocolFilter === 'الكل' || flow.protocol === protocolFilter;
    return matchesDevice && matchesProto;
  });

  // Protocol distribution count for chart
  const protocolStats = activeFlows.reduce((acc, f) => {
    acc[f.protocol] = (acc[f.protocol] || 0) + f.bytes;
    return acc;
  }, {} as Record<string, number>);

  const totalBytesSum: number = (Object.values(protocolStats) as number[]).reduce((sum: number, v: number) => sum + v, 0);

  // Top talker sorting
  const hostStats = activeFlows.reduce((acc, f) => {
    acc[f.srcIp] = (acc[f.srcIp] || 0) + f.bytes;
    return acc;
  }, {} as Record<string, number>);

  const topTalkers = (Object.entries(hostStats) as [string, number][])
    .map(([ip, bytes]) => ({ ip, bytes }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Upper banner controls container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 border border-slate-800 rounded-xl">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <Activity className="text-emerald-500 h-5 w-5" />
            محلّل حركات الباندويث الفوري (NetFlow / sFlow Analyzer)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            مستمع خفّي ومحلل لحزم بروتوكولات IPFIX الجارية عبر منافذ sFlow [2055, 4739, 6343]
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 border border-slate-800 rounded-lg flex items-center gap-1.5">
            <button 
              onClick={() => setIsCapturing(true)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${isCapturing ? 'bg-emerald-600 text-slate-950 font-bold glow-green' : 'text-slate-500 hover:text-slate-300'}`}
            >
              قيد الاستماع (ON)
            </button>
            <button 
              onClick={() => setIsCapturing(false)}
              className={`px-3 py-1 text-xs rounded-md transition-all ${!isCapturing ? 'bg-slate-850 text-white' : 'text-slate-500 hover:text-slate-400'}`}
            >
              مؤقت (PAUSE)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Streaming socket Flow and filter */}
        <div className="lg:col-span-8 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex flex-col h-[520px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-slate-400 font-semibold">حزمة IPFIX الحية (قيد التدفق)</span>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {/* Filter core Devices */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-500">الجهاز المسوّق:</span>
                <select 
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="الكل">الكل</option>
                  {devices.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>

              {/* Protocol filter */}
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[11px]">
                <span className="text-slate-500">البروتوكول:</span>
                <select 
                  value={protocolFilter}
                  onChange={(e) => setProtocolFilter(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer font-semibold"
                >
                  <option value="الكل">كل البروتوكولات</option>
                  <option value="HTTPS">HTTPS (443)</option>
                  <option value="SSH">SSH (22)</option>
                  <option value="LDAP">LDAP (389)</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="Syslog">Syslog (514)</option>
                  <option value="SNMP">SNMP (161)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flows Streaming View */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 pr-1">
            <div className="grid grid-cols-12 text-[10px] text-slate-500 p-2 border-b border-slate-900 font-semibold">
              <div className="col-span-1">الزمن</div>
              <div className="col-span-4">المصدر (Source)</div>
              <div className="col-span-1 text-center">🠚</div>
              <div className="col-span-4">الوجهة (Destination)</div>
              <div className="col-span-1">بروتوكول</div>
              <div className="col-span-1 text-left font-sans">الحجم</div>
            </div>

            <div className="divide-y divide-slate-900">
              {filteredFlows.map((flow) => (
                <div key={flow.id} className="grid grid-cols-12 text-xs font-mono py-2.5 px-2 hover:bg-slate-900/50 items-center">
                  <div className="col-span-1 text-slate-500 font-mono text-[10px]">{flow.timestamp}</div>
                  <div className="col-span-4 text-slate-300 break-all">{flow.srcIp}<span className="text-blue-500 ml-1">:{flow.srcPort}</span></div>
                  <div className="col-span-1 text-center text-[10px] text-slate-600"><ArrowRightLeft className="h-3 w-3 mx-auto" /></div>
                  <div className="col-span-4 text-slate-300 break-all">{flow.dstIp}<span className="text-emerald-500 ml-1">:{flow.dstPort}</span></div>
                  <div className="col-span-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      flow.protocol === 'HTTPS' ? 'bg-blue-950/40 text-blue-400 border border-blue-900/30' :
                      flow.protocol === 'SSH' ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' :
                      flow.protocol === 'PostgreSQL' ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {flow.protocol}
                    </span>
                  </div>
                  <div className="col-span-1 text-left text-[11px] text-slate-400">
                    {(flow.bytes / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Analytics metrics summaries (top talkers, custom SVG donut logic) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Talkers Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <BarChart className="text-indigo-400 h-4 w-4" />
              أكثر العناوين استهلاكاً للباندويث (Top Talkers)
            </h4>

            <div className="space-y-3.5">
              {topTalkers.map(({ ip, bytes }, i) => (
                <div key={ip} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300">{ip}</span>
                    <span className="text-slate-400">{(bytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                    <div 
                      className={`h-full rounded-full ${
                        i === 0 ? 'bg-gradient-to-r from-indigo-500 to-blue-500' :
                        i === 1 ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                      style={{ width: `${(bytes / (topTalkers[0]?.bytes || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Protocols Distribution */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h4 className="font-bold text-white text-xs">توزيع استهلاك حزم البيانات (Protocol Share)</h4>
            
            <div className="space-y-3.5">
              {(Object.entries(protocolStats) as [string, number][]).map(([proto, val]) => {
                const pct = totalBytesSum > 0 ? Math.round((val / totalBytesSum) * 100) : 0;
                return (
                  <div key={proto} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        proto === 'HTTPS' ? 'bg-blue-500' :
                        proto === 'SSH' ? 'bg-purple-500' :
                        proto === 'PostgreSQL' ? 'bg-indigo-400' :
                        proto === 'LDAP' ? 'bg-amber-500' : 'bg-slate-500'
                      }`} />
                      <span className="text-slate-300 font-bold">{proto}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{(val / (1024 * 1024)).toFixed(1)} MB</span>
                      <span className="text-slate-500 font-sans font-bold text-[10px]">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

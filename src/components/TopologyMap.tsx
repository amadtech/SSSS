import React, { useState } from 'react';
import { Device } from '../types';
import { Network, HelpCircle, HardDrive, RefreshCw, Zap, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface TopologyMapProps {
  devices: Device[];
}

export default function TopologyMap({ devices }: TopologyMapProps) {
  const [viewType, setViewType] = useState<'logical' | '3d'>('logical');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('dev-2'); // default to core switch
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Logical coordinates for our hierarchical topology layout
  const topoNodes = [
    { id: 'dev-3', name: 'fw-jed-makkah-ext01', x: 200, y: 50, layer: 'الأمان (Security)', type: 'firewall', label: 'المحيط الأمني' },
    { id: 'dev-1', name: 'rtr-ruh-hq-gw01', x: 200, y: 130, layer: 'التوجيه (Core Gateway)', type: 'router', label: 'العمود الفقري WAN' },
    { id: 'dev-2', name: 'sw-ruh-hq-core01', x: 200, y: 210, layer: 'التوزيع (Core Distribution)', type: 'switch', label: 'المقسّم المركزي' },
    
    // Acc Layer
    { id: 'dev-4', name: 'srv-ruh-active-dir01', x: 60, y: 310, layer: 'الوصول (Access)', type: 'server_win', parent: 'dev-2', label: 'مستضيف النطاق' },
    { id: 'dev-5', name: 'srv-med-database02', x: 130, y: 310, layer: 'الوصول (Access)', type: 'database', parent: 'dev-2', label: 'قاعدة البيانات' },
    { id: 'dev-7', name: 'ups-ruh-datacenter-c1', x: 200, y: 310, layer: 'الوصول (Access)', type: 'ups', parent: 'dev-2', label: 'الطاقة الاحتياطية' },
    { id: 'dev-6', name: 'cam-dam-east-gate2', x: 270, y: 310, layer: 'الوصول (Access)', type: 'camera', parent: 'dev-2', label: 'حراسة البوابة' },
    { id: 'dev-11', name: 'iot-tabuk-temp-sensor', x: 340, y: 310, layer: 'الوصول (Access)', type: 'iot', parent: 'dev-2', label: 'مستشعر الحرارة البيئي' }
  ];

  // 3D Isometric visual coords representation
  const isometricNodes = [
    { id: 'dev-3', name: 'مربع الأمن الساحلي', x: 150, y: 100, z: 80, type: 'firewall' },
    { id: 'dev-1', name: 'مقاطعة النطاق الحكومي', x: 200, y: 140, z: 60, type: 'router' },
    { id: 'dev-2', name: 'مركز بيانات ركن الرديفة', x: 250, y: 180, z: 40, type: 'switch' },
    { id: 'dev-4', name: 'حي الفتح (خادم AD)', x: 100, y: 220, z: 10, type: 'server_win' },
    { id: 'dev-5', name: 'العقدة السكنية (DB)', x: 150, y: 240, z: 10, type: 'database' },
    { id: 'dev-6', name: 'المنفذ الخارجي الكاميرات', x: 280, y: 250, z: 10, type: 'camera' }
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  const getDeviceStatus = (id: string) => {
    const dev = devices.find(d => d.id === id);
    return dev ? dev.status : 'online';
  };

  // Find info about selected node
  const activeNodeInfo = topoNodes.find(n => n.id === selectedNodeId);
  const activeDeviceDetails = devices.find(d => d.id === selectedNodeId);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5">
      {/* Header and Controller */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2 text-base">
            <Network className="text-emerald-500 h-5 w-5" />
            التخطيط التخطيطي للشبكة والروابط (Active Topology Engine)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            تحديد تلقائي للروابط الصاعدة (Uplinks) واكتشاف التبعيات التراكمية في البيئات المجهولة
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggler */}
          <div className="bg-slate-950 p-1 border border-slate-800 rounded-lg flex items-center gap-1">
            <button 
              onClick={() => setViewType('logical')}
              className={`px-3 py-1 text-xs rounded-md font-semibold transition-all ${viewType === 'logical' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              الرسم البياني المنطقي (Logical Diagram)
            </button>
            <button 
              onClick={() => setViewType('3d')}
              className={`px-3 py-1 text-xs rounded-md font-semibold flex items-center gap-1.5 transition-all ${viewType === '3d' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers className="h-3.5 w-3.5" /> الأبعاد الثلاثية للمباني (3D Grid)
            </button>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 px-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} /> 
            {isRefreshing ? 'إعادة الإستكشاف...' : 'إعادة المسح الفوري'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Render Area */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden flex justify-center items-center py-6 h-[460px]">
          {viewType === 'logical' ? (
            <svg viewBox="0 0 400 360" className="w-full h-full object-contain max-w-[480px]">
              {/* Draw Connections with Arrow markers */}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="15" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#101827" strokeWidth="1" />
                </pattern>
                {/* Neon filters */}
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Edge connections */}
              {/* Firewall to Gateway */}
              <line x1="200" y1="50" x2="200" y2="130" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3,3" />
              {/* Gateway to Core Switch */}
              <line x1="200" y1="130" x2="200" y2="210" stroke="#22c55e" strokeWidth="2.5" />
              <circle r="3" fill="#22c55e">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 200 130 L 200 210" />
              </circle>

              {/* Core switch to access endpoints list */}
              {topoNodes.filter(n => n.parent === 'dev-2').map((node, i) => {
                const targetStatus = getDeviceStatus(node.id);
                // Flashing / flapping warning lines
                const isDown = targetStatus === 'offline';
                const isWarn = targetStatus === 'warning';
                
                let strokeColor = '#3b82f6';
                let strokeWidth = '1.5';
                let animateSpeed = `${2 + (i * 0.5)}s`;

                if (isDown) {
                  strokeColor = '#ef4444';
                  strokeWidth = '2';
                  animateSpeed = '0s';
                } else if (isWarn) {
                  strokeColor = '#f59e0b';
                  strokeWidth = '1.8';
                }

                return (
                  <g key={`edge-${node.id}`}>
                    <path 
                      d={`M 200 210 Q ${200 + (node.x - 200)/2} 240 ${node.x} ${node.y}`} 
                      fill="none" 
                      stroke={strokeColor} 
                      strokeWidth={strokeWidth} 
                      strokeOpacity={selectedNodeId === node.id || selectedNodeId === 'dev-2' ? '0.85' : '0.25'}
                      strokeDasharray={isDown ? '2,2' : ''}
                      className={isDown ? 'animate-pulse' : ''}
                    />
                    {/* Pulsing data dots for connected objects */}
                    {!isDown && (selectedNodeId === node.id || selectedNodeId === 'dev-2') && (
                      <circle r="3.5" fill={isWarn ? '#f59e0b' : '#38bdf8'}>
                        <animateMotion 
                          dur={animateSpeed} 
                          repeatCount="indefinite" 
                          path={`M 200 210 Q ${200 + (node.x - 200)/2} 240 ${node.x} ${node.y}`} 
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Draw Nodes */}
              {topoNodes.map(node => {
                const status = getDeviceStatus(node.id);
                const isSelected = selectedNodeId === node.id;
                
                const frameColor = status === 'offline' 
                  ? '#ef4444' 
                  : status === 'warning' 
                    ? '#f59e0b' 
                    : '#10b981';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    {/* Ring selection bounds */}
                    <circle 
                      r="16" 
                      fill="transparent" 
                      stroke={isSelected ? '#3b82f6' : 'transparent'} 
                      strokeWidth="2" 
                      strokeDasharray="3,3" 
                      className={isSelected ? 'animate-spin' : ''}
                      style={{ transformOrigin: 'center' }}
                    />

                    {/* Node Box container */}
                    <rect 
                      x="-11" 
                      y="-11" 
                      width="22" 
                      height="22" 
                      rx="5" 
                      fill="#030712" 
                      stroke={frameColor} 
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className={status === 'offline' ? 'animate-pulse' : ''}
                    />

                    {/* Tiny type indicators inside node */}
                    <text 
                      y="3.5" 
                      textAnchor="middle" 
                      fill="#ffffff" 
                      fontSize="9.5" 
                      fontWeight="bold"
                      className="select-none pointer-events-none font-mono"
                    >
                      {node.type === 'switch' ? 'SW' : node.type === 'router' ? 'RT' : node.type === 'firewall' ? 'FW' : 'SRV'}
                    </text>

                    {/* Hover System label block */}
                    <text 
                      y="24" 
                      textAnchor="middle" 
                      fill={isSelected ? '#ffffff' : '#94a3b8'} 
                      fontSize="7.5" 
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="select-none pointer-events-none font-sans"
                    >
                      {node.name.length > 15 ? `${node.name.substring(0, 13)}...` : node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            /* Isometric 3D city networks style simulation */
            <svg viewBox="0 0 400 360" className="w-full h-full object-contain max-w-[480px]">
              <defs>
                <linearGradient id="wall" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
                </linearGradient>
              </defs>

              <g transform="translate(20, -10)">
                {/* Base Isometric grid platform representing local Ministry layout */}
                <polygon points="200,80 340,160 200,240 60,160" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
                <polygon points="200,120 310,180 200,240 90,180" fill="transparent" stroke="#162e3d" strokeWidth="1" strokeDasharray="2,2" />

                {/* Uplink Laser Beam going isometric-upwards */}
                <line x1="200" y1="160" x2="200" y2="40" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" className="animate-pulse" />
                <text x="200" y="30" fill="#d8b4fe" fontSize="8" textAnchor="middle" className="font-sans">بوابة الرياض الموحدة (Satellite Uplink)</text>

                {/* Draw 3D-like Isometric columns as nodes */}
                {isometricNodes.map((node, idx) => {
                  const devStatus = getDeviceStatus(node.id);
                  const isS = selectedNodeId === node.id;
                  const nodeColor = devStatus === 'offline' ? '#ef4444' : devStatus === 'warning' ? '#f59e0b' : '#3b82f6';
                  
                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      {/* Connection trace to bedrock */}
                      <line x1="0" y1="0" x2="0" y2="-40" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />

                      {/* 3D Column Left polygon */}
                      <polygon points="-12,-40 0,-46 0,-15 -12,-10" fill="url(#wall)" stroke={isS ? '#60a5fa' : '#334155'} strokeWidth="1" />
                      {/* 3D Column Right polygon */}
                      <polygon points="0,-46 12,-40 12,-10 0,-15" fill="#1e293b" stroke={isS ? '#60a5fa' : '#334155'} strokeWidth="1" />
                      {/* Top Isometric CAP showing current active status color */}
                      <polygon points="-12,-40 0,-46 12,-40 0,-34" fill={nodeColor} className="animate-pulse" />

                      {/* Floating Text tag */}
                      <text 
                        y="8" 
                        textAnchor="middle" 
                        fill={isS ? '#ffffff' : '#64748b'} 
                        fontSize="7" 
                        className="font-mono bg-slate-950 px-1 select-none pointer-events-none"
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Quick instructions floating */}
          <div className="absolute top-2 right-2 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded text-[9px] text-slate-500">
            * انقر على العقد والمقاسم لاستعراض تسلسل علاقات التبعية والتفاصيل.
          </div>
        </div>

        {/* Selected host Dependency Details Panel */}
        <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] text-slate-500 font-mono tracking-wider block">OBJECT RESOLVED DETAILS</span>
              <h4 className="font-bold text-white text-sm font-mono mt-0.5">
                {activeDeviceDetails ? activeDeviceDetails.name : 'قيد الانتظار'}
              </h4>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                المنطقة: {activeDeviceDetails ? activeDeviceDetails.region : '—'}
              </p>
            </div>

            {/* Tree dependency analysis description */}
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">الطبقة الهرمية بالشبكة (Network Layer):</span>
                <span className="text-white font-bold block mt-0.5">{activeNodeInfo ? activeNodeInfo.layer : 'Access Layer'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">علاقة التبعية الكودية (Device Dependency Tracking):</span>
                <div className="bg-slate-950 p-2.5 border border-slate-800 rounded-lg font-mono text-[11px] text-slate-300 space-y-1.5 mt-1">
                  {selectedNodeId === 'dev-3' ? (
                    <div className="text-sky-400">🔥 هذا الجهاز يمثل العقدة الخارجية الجذرية (Root Endpoint)</div>
                  ) : selectedNodeId === 'dev-1' ? (
                    <div>جذر التبعية الصاعدة 🠚 <span className="text-blue-400">fw-jed-makkah-ext01</span></div>
                  ) : selectedNodeId === 'dev-2' ? (
                    <div>جذر التبعية الصاعدة 🠚 <span className="text-blue-400">rtr-ruh-hq-gw01</span></div>
                  ) : (
                    <>
                      <div>الجهاز الأب الحاكم 🠚 <span className="text-emerald-400">sw-ruh-hq-core01</span></div>
                      <div className="text-[10px] text-slate-500 leading-relaxed font-sans">
                        ملاحظة: في حال تعطل جهاز السويتش المركزي، سيفقد النظام الاتصال بجميع عقد هذا المستوى تلقائياً. سيقوم محرك التنبيه بفلترة سقوط الأجهزة الفرعية لمنع الإنذارات المكررة الإيجابيات الكاذبة.
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Polled operational parameters */}
              {activeDeviceDetails && activeDeviceDetails.status !== 'offline' && (
                <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 space-y-2 text-[11px]">
                  <h5 className="font-bold text-slate-400">الحالة التشغيلية الفورية:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-900">
                      <span className="text-slate-500 block">المعالج (CPU)</span>
                      <span className="font-mono text-white font-bold">{activeDeviceDetails.cpu}%</span>
                    </div>
                    <div className="p-1.5 bg-slate-950 rounded border border-slate-900">
                      <span className="text-slate-500 block">زمن الاستجابة</span>
                      <span className="font-mono text-emerald-400 font-bold">{activeDeviceDetails.latency} ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-[10px] text-slate-500 text-center font-mono mt-4">
            Topology engine auto-discovery methods: Link Layer Discovery Protocol (LLDP) & CDP protocol.
          </div>
        </div>
      </div>
    </div>
  );
}

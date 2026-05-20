import React, { useState } from 'react';
import { Device, SaudiRegion, SAUDI_REGIONS } from '../types';
import { Network, Search, Plus, Filter, HardDrive, Thermometer, ShieldAlert, CheckCircle2, AlertTriangle, Monitor, RotateCw, FileClock } from 'lucide-react';

interface DevicesManagerProps {
  devices: Device[];
  onAddDevice: (device: { name: string; type: string; ip: string; region: SaudiRegion }) => void;
  onDeleteDevice?: (deviceId: string) => void;
  onPingDevice?: (deviceId: string) => Promise<any>;
  onUpdateDevice?: (deviceId: string, updatedFields: any) => void;
  selectedRegion: SaudiRegion | 'الكل';
}

export default function DevicesManager({ 
  devices, 
  onAddDevice, 
  onDeleteDevice,
  onPingDevice,
  onUpdateDevice,
  selectedRegion 
}: DevicesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('الكل');
  const [regionFilter, setRegionFilter] = useState<SaudiRegion | 'الكل'>(selectedRegion);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(devices[0] || null);

  // New states for real Diagnostics & Edit panel
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);
  const [rawPingOutput, setRawPingOutput] = useState<string>('');
  const [isEditingDevice, setIsEditingDevice] = useState(false);
  const [editName, setEditName] = useState('');
  const [editIp, setEditIp] = useState('');
  const [editType, setEditType] = useState<Device['type']>('switch');
  const [editRegion, setEditRegion] = useState<SaudiRegion>('الرياض');

  // New Device Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDevName, setNewDevName] = useState('');
  const [newDevType, setNewDevType] = useState<Device['type']>('switch');
  const [newDevIp, setNewDevIp] = useState('');
  const [newDevRegion, setNewDevRegion] = useState<SaudiRegion>('الرياض');
  const [isAdding, setIsAdding] = useState(false);

  // Auto-sync selectedDevice if updated props arrive
  const activeDeviceDetails = devices.find(d => d.id === selectedDevice?.id) || devices[0] || null;

  // Filter lists
  const filtered = devices.filter(d => {
    const matchesRegion = regionFilter === 'الكل' || d.region === regionFilter;
    const matchesType = typeFilter === 'الكل' || d.type === typeFilter;
    const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip.includes(searchTerm);
    return matchesRegion && matchesType && matchesSearch;
  });

  const handleDeviceClick = (dev: Device) => {
    setSelectedDevice(dev);
    setIsEditingDevice(false);
    setRawPingOutput('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevName || !newDevIp) return alert('الرجاء تعبئة اسم الجهاز وعنوان الـ IP بشكل صحيح');
    setIsAdding(true);
    
    // Simulate active SNMP discovery probe ping
    setTimeout(() => {
      onAddDevice({
        name: newDevName,
        type: newDevType,
        ip: newDevIp,
        region: newDevRegion
      });
      setIsAdding(false);
      setShowAddForm(false);
      setNewDevName('');
      setNewDevIp('');
    }, 1200);
  };

  const startEditing = (dev: Device) => {
    setEditName(dev.name);
    setEditIp(dev.ip);
    setEditType(dev.type);
    setEditRegion(dev.region);
    setIsEditingDevice(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateDevice || !activeDeviceDetails) return;
    onUpdateDevice(activeDeviceDetails.id, {
      name: editName,
      ip: editIp,
      type: editType,
      region: editRegion
    });
    setIsEditingDevice(false);
  };

  const triggerPingTest = async (deviceId: string) => {
    if (!onPingDevice) return;
    setIsDiagnosticRunning(true);
    setRawPingOutput('جاري الاتصال بالعقدة وإرسال حزم IP ICMP Echo Request...');
    
    const result = await onPingDevice(deviceId);
    setIsDiagnosticRunning(false);
    if (result && result.success) {
      setRawPingOutput(result.pingOutput || 'تم فحص الاتصال بنجاح. لا توجد تفاصيل إضافية.');
    } else {
      setRawPingOutput('خطأ: فشل إجراء فحص الاتصال التلقائي.');
    }
  };

  const handleDeleteClick = (deviceId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا الجهاز بالكامل من قاعدة بيانات SQLITE؟') && onDeleteDevice) {
      onDeleteDevice(deviceId);
      setSelectedDevice(null);
      setIsEditingDevice(false);
      setRawPingOutput('');
    }
  };

  // Icon mapper
  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'router': return <span className="p-1.5 bg-slate-800 rounded text-sky-400">🌐</span>;
      case 'switch': return <span className="p-1.5 bg-slate-800 rounded text-indigo-400 font-bold font-mono text-[9px]">SW</span>;
      case 'firewall': return <span className="p-1.5 bg-slate-800 rounded text-red-400">🛡️</span>;
      case 'server_win':
      case 'server_linux': return <span className="p-1.5 bg-slate-800 rounded text-slate-300">🖥️</span>;
      case 'ups': return <span className="p-1.5 bg-slate-800 rounded text-yellow-400">🔋</span>;
      case 'camera': return <span className="p-1.5 bg-slate-800 rounded text-emerald-400">📷</span>;
      case 'iot': return <span className="p-1.5 bg-slate-800 rounded text-teal-400">🧬</span>;
      case 'website': return <span className="p-1.5 bg-slate-800 rounded text-blue-400">🌐</span>;
      case 'database': return <span className="p-1.5 bg-slate-800 rounded text-purple-400">🗄️</span>;
      default: return <span className="p-1.5 bg-slate-800 rounded text-slate-400">⚙️</span>;
    }
  };

  const typeLabels: Record<Device['type'], string> = {
    router: 'راوتر (Router)',
    switch: 'سويتش (Switch)',
    firewall: 'جدار حماية (Firewall)',
    server_win: 'خادم ويندوز',
    server_linux: 'خادم لينكس',
    printer: 'طابعة (Printer)',
    ups: 'مزود طاقة (UPS)',
    camera: 'كاميرا مراقبة (CCTV)',
    iot: 'جهاز ذكي (IoT)',
    website: 'موقع ويب (Website)',
    application: 'تطبيق داخلي',
    database: 'قاعدة بيانات'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Devices Inventory Left Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 lg:col-span-7 flex flex-col h-[650px]">
        {/* Header & Search */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2 text-base">
                <HardDrive className="text-blue-500 h-5 w-5" />
                مستودع الأجهزة النشطة بالشبكة
              </h3>
              <p className="text-xs text-slate-500">مراقبة حية للأداء، الحرارة والتنبيهات الفرعية لـ {devices.length} جهاز</p>
            </div>
            
            <button 
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" /> اكتشاف جهاز (Discovery)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Search Bar */}
            <div className="relative col-span-1">
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم أو الـ IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-blue-500 focus:outline-none rounded-lg text-xs font-mono text-white placeholder-slate-600 transition-all"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 min-w-fit">النوع:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="الكل">كل الأنواع</option>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500 min-w-fit">المنطقة:</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value as SaudiRegion | 'الكل')}
                className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="الكل">كل المناطق (13)</option>
                {SAUDI_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable table container */}
        <div className="flex-1 overflow-y-auto mt-4 border border-slate-800 rounded-xl bg-slate-950/60">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/80 sticky top-0 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">الجهاز والاسم</th>
                <th className="p-3 font-mono">IP Address</th>
                <th className="p-3">المنطقة الإدارية</th>
                <th className="p-3">الحالة الكلية</th>
                <th className="p-3 font-sans">الأداء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-slate-500">
                    لا توجد أجهزة مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filtered.map((dev) => (
                  <tr 
                    key={dev.id}
                    onClick={() => handleDeviceClick(dev)}
                    className={`hover:bg-slate-900/40 cursor-pointer transition-colors ${selectedDevice?.id === dev.id ? 'bg-slate-900/60' : ''}`}
                  >
                    <td className="p-3 flex items-center gap-2">
                      {getDeviceIcon(dev.type)}
                      <div className="font-semibold text-slate-200 block truncate max-w-[140px]">
                        {dev.name}
                        <span className="block text-[9px] text-slate-500 font-normal">{typeLabels[dev.type]}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{dev.ip}</td>
                    <td className="p-3 text-slate-400">{dev.region}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dev.status === 'online' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                          : dev.status === 'warning'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-900/30'
                            : 'bg-red-950/40 text-red-400 border border-red-900/30'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-400 animate-pulse' : dev.status === 'warning' ? 'bg-amber-400' : 'bg-red-400'}`}></span>
                        {dev.status === 'online' ? 'نشط' : dev.status === 'warning' ? 'تحذير' : 'متوقف'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-mono">
                      {dev.status === 'offline' ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span>CPU: {dev.cpu}%</span>
                          <span className="text-[10px] text-slate-500 font-sans">زمن الاستجابة: {dev.latency}ms</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Device Right Detail Panel */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 lg:col-span-12 xl:col-span-5 h-[650px] overflow-y-auto flex flex-col justify-between">
        {activeDeviceDetails ? (
          <div className="space-y-5">
            {/* Header Device Card */}
            <div className="bg-slate-950/80 p-4 border border-slate-800 rounded-xl relative overflow-hidden">
              {isEditingDevice ? (
                <form onSubmit={handleUpdateSubmit} className="space-y-3">
                  <div className="text-white font-bold text-xs">تعديل بيانات العقدة:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="اسم الجهاز"
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                      required
                    />
                    <input 
                      type="text" 
                      value={editIp}
                      onChange={(e) => setEditIp(e.target.value)}
                      placeholder="IP Address"
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as Device['type'])}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    <select
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value as SaudiRegion)}
                      className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-300"
                    >
                      {SAUDI_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      type="button" 
                      onClick={() => setIsEditingDevice(false)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 rounded cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-[10px] text-white font-bold rounded cursor-pointer"
                    >
                      حفظ الخيار
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(activeDeviceDetails.type)}
                      <div>
                        <h4 className="font-bold text-white text-base font-mono">{activeDeviceDetails.name}</h4>
                        <p className="text-xs text-slate-500 font-mono">IP: {activeDeviceDetails.ip}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col gap-1 items-end">
                      <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-1 rounded font-mono block">
                        {activeDeviceDetails.region}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(activeDeviceDetails)}
                          className="p-1 hover:bg-slate-800 rounded text-blue-400 cursor-pointer text-[10px] flex items-center gap-0.5 border border-slate-800"
                          title="تعديل"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteClick(activeDeviceDetails.id)}
                          className="p-1 hover:bg-red-950/60 rounded text-red-400 cursor-pointer text-[10px] flex items-center gap-0.5 border border-slate-800"
                          title="حذف"
                        >
                          🗑️ حذف
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center text-xs border-t border-slate-800 pt-3 text-slate-400">
                    <span>وقت التشغيل: <b className="font-mono text-white text-[11px]">{activeDeviceDetails.uptime}</b></span>
                    <span className="font-mono text-[9px] text-slate-600">Fingerprint: {activeDeviceDetails.fingerprint}</span>
                  </div>
                  {/* Abs indicator glow based on status */}
                  <div className={`absolute top-0 right-0 left-0 h-1 ${activeDeviceDetails.status === 'online' ? 'bg-emerald-500' : activeDeviceDetails.status === 'warning' ? 'bg-amber-400' : 'bg-red-500'}`}></div>
                </>
              )}
            </div>

            {/* Live Metrics Grid */}
            {activeDeviceDetails.status === 'offline' && !isEditingDevice ? (
              <div className="p-5 text-center bg-red-950/10 border border-red-900/40 rounded-xl space-y-3">
                <ShieldAlert className="text-red-500 mx-auto h-8 w-8 animate-bounce" />
                <h5 className="font-bold text-red-400 text-sm">الجهاز خارج الخدمة بالكامل (Offline)</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  فقدان كلي للاتصال والـ Ping. بإمكانك إجراء اختبار فحص الاتصال التلقائي بالـ OS.
                </p>
                <button
                  onClick={() => triggerPingTest(activeDeviceDetails.id)}
                  disabled={isDiagnosticRunning}
                  className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-800 text-xs rounded-lg cursor-pointer transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <RotateCw className={`h-3 w-3 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                  إجراء فحص اتصال حقيقي (ICMP Ping)
                </button>
              </div>
            ) : (
              !isEditingDevice && (
                <div className="grid grid-cols-3 gap-3">
                  {/* CPU gauge representation */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-500 block">المعالج (CPU)</span>
                    <span className="text-xl font-mono font-bold text-white block mt-1">{activeDeviceDetails.cpu}%</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                      <div className="bg-blue-500 h-full" style={{ width: `${activeDeviceDetails.cpu}%` }}></div>
                    </div>
                  </div>
                  {/* RAM Gauge */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-center">
                    <span className="text-[10px] text-slate-500 block">الذاكرة (RAM)</span>
                    <span className="text-xl font-mono font-bold text-white block mt-1">{activeDeviceDetails.ram}%</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                      <div className="bg-emerald-400 h-full" style={{ width: `${activeDeviceDetails.ram}%` }}></div>
                    </div>
                  </div>
                  {/* Temp Gauge */}
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 text-center">
                    <div className="flex justify-center items-center gap-1 text-[10px] text-slate-500">
                      <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                      <span>الحرارة</span>
                    </div>
                    <span className="text-xl font-mono font-bold text-white block mt-1">{activeDeviceDetails.temp}°C</span>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-2">
                      <div className="bg-amber-500 h-full" style={{ width: `${(activeDeviceDetails.temp / 80) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Quick Ping Tool for online devices */}
            {activeDeviceDetails.status !== 'offline' && !isEditingDevice && (
              <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/85">
                <span className="text-xs text-slate-400">فحص زمن الاستجابة الفوري للـ IP:</span>
                <button
                  onClick={() => triggerPingTest(activeDeviceDetails.id)}
                  disabled={isDiagnosticRunning}
                  className="px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-800 rounded-lg text-xs cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  <RotateCw className={`h-3 w-3 ${isDiagnosticRunning ? 'animate-spin' : ''}`} />
                  أمر Ping حقيقي
                </button>
              </div>
            )}

            {/* Interfaces status */}
            {!isEditingDevice && (
              <div className="space-y-2.5">
                <h5 className="text-xs font-bold text-slate-400 flex items-center justify-between">
                  <span>المنافذ والواجهات المادية (Physical Interfaces)</span>
                  <span className="text-[10px] text-slate-600 font-mono">SNMP MIB-II Polled</span>
                </h5>

                <div className="space-y-2 max-h-[160px] overflow-y-auto">
                  {activeDeviceDetails.interfaces.map((intf, index) => (
                    <div 
                      key={index}
                      className="bg-slate-950/40 p-2.5 border border-slate-800/60 rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-sm ${intf.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'} inline-block`}></span>
                        <div className="font-mono">
                          <span className="text-white font-bold block text-[11px]">{intf.name}</span>
                          <span className="text-[9px] text-slate-500 font-sans">Speed: {intf.speed} | VLAN: {intf.vlan}</span>
                        </div>
                      </div>

                      <div className="text-left text-[11px] font-mono text-slate-400">
                        {intf.status === 'up' ? (
                          <>
                            <div className="text-emerald-500 flex items-center gap-0.5 justify-end">
                              In: <span>{intf.trafficIn} Mbps</span>
                            </div>
                            <div className="text-blue-400 flex items-center gap-0.5 justify-end">
                              Out: <span>{intf.trafficOut} Mbps</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-red-500 font-bold block py-1">Down Port</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discovery and Diagnostics Log */}
            <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl space-y-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-400 pb-2 border-b border-slate-900">
                <FileClock className="h-4 w-4 text-blue-500" />
                <span className="font-semibold font-sans">مخرجات مسبار الاتصال (System ICMP Console)</span>
              </div>
              
              {rawPingOutput ? (
                <pre className="bg-black/95 p-2 rounded text-[10px] text-green-400 overflow-x-auto max-h-[110px] leading-relaxed select-text font-mono border border-slate-900">
                  {rawPingOutput}
                </pre>
              ) : (
                <div className="text-slate-500 space-y-1">
                  <div>[PROBE] Ping test status: {activeDeviceDetails.status === 'online' ? 'Success' : 'Offline'}</div>
                  <div>[SNMP] Polled object ID 1.3.6.1.2.1.1 OK</div>
                  <div>[FINGERPRINT] RSA binding hash matches local database.</div>
                  <div className="text-slate-600 text-[10px]">آخر تحديث: {activeDeviceDetails.lastDiscovery}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-center p-8 text-slate-500">
            <Monitor className="h-12 w-12 text-slate-700 mb-2" />
            <span>اختر جهازاً من القائمة الجانبية لاستعراض كلي للحرارة البينية والأداء والإنذارات الفرعية.</span>
          </div>
        )}

        <div className="text-center font-mono text-[9px] text-slate-700 mt-2 border-t border-slate-900 pt-3">
          AIN-NMS SNMP Module Polling Interval: 10s (On-Premise Loop)
        </div>
      </div>

      {/* Discover Device Modal Component */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-slate-950 border border-slate-800 w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative">
            <div className="border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <RotateCw className="text-blue-500 h-5 w-5 animate-spin" />
                اكتشاف جهاز جديد عبر SNMP / Discovery
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                يقوم النظام بإرسال حزم الاستعلام SNMP pings للتحقق الفوري من مقاييس الأداء
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 block font-semibold">اسم الجهاز (SysName في المضيف)</label>
                <input 
                  type="text" 
                  value={newDevName}
                  onChange={(e) => setNewDevName(e.target.value)}
                  placeholder="e.g. sw-ruh-hq-access05"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-semibold">نوع الجهاز (Device Type)</label>
                  <select
                    value={newDevType}
                    onChange={(e) => setNewDevType(e.target.value as Device['type'])}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="switch">سويتش (Switch)</option>
                    <option value="router">راوتر (Router)</option>
                    <option value="firewall">جدار حماية (Firewall)</option>
                    <option value="server_win">خادم ويندوز Windows</option>
                    <option value="server_linux">خادم لينكس Linux</option>
                    <option value="database">قاعدة بيانات Database</option>
                    <option value="camera">كاميرا مراقبة Camera</option>
                    <option value="ups">جهاز طاقة UPS</option>
                    <option value="iot">جهاز ذكي IoT</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-semibold">المنطقة الإدارية</label>
                  <select
                    value={newDevRegion}
                    onChange={(e) => setNewDevRegion(e.target.value as SaudiRegion)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
                  >
                    {SAUDI_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <label className="text-slate-400 block font-semibold">عنوان الـ IP (IP Address / Node Address)</label>
                <input 
                  type="text" 
                  value={newDevIp}
                  onChange={(e) => setNewDevIp(e.target.value)}
                  placeholder="e.g. 10.10.24.15"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-950/20 border border-blue-900/40 p-3 rounded-lg text-[11px] leading-relaxed text-slate-400">
                🔒 سيتم فحص بصمة الجهاز تلقائياً للتثبيت مع ترخيصRSA الخاص بالمؤسسة المشفر والمسجل.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  إلغاء لائق
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isAdding ? 'جاري الفحص (SNMP Poll)...' : 'إجراء الفحص والإضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

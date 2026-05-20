import React, { useState, useEffect } from 'react';
import { Device, NetworkAlert, LicensingInfo, SaudiRegion } from './types';
import NocDashboard from './components/NocDashboard';
import DevicesManager from './components/DevicesManager';
import TopologyMap from './components/TopologyMap';
import TrafficAnalyzer from './components/TrafficAnalyzer';
import ReportSuite from './components/ReportSuite';
import AinAssistant from './components/AinAssistant';
import LicensePortal from './components/LicensePortal';
import { Network, Monitor, Activity, FileCheck2, Cpu, KeyRound, Radio, Eye, AlertCircle, RefreshCw, Menu, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'noc' | 'devices' | 'topology' | 'netflow' | 'reports' | 'chat' | 'license'>('noc');
  
  // App primary synced states
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [license, setLicense] = useState<LicensingInfo | null>(null);
  
  const [selectedRegion, setSelectedRegion] = useState<SaudiRegion | 'الكل'>('الكل');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hydrate states from server API
  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const [devReq, alertReq, licReq] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/alerts'),
        fetch('/api/license')
      ]);

      if (!devReq.ok || !alertReq.ok || !licReq.ok) {
        throw new Error('فشل جلب البيانات من الخادم المحلي.');
      }

      const devData = await devReq.json();
      const alertData = await alertReq.json();
      const licData = await licReq.json();

      setDevices(devData);
      setAlerts(alertData);
      setLicense(licData);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('تنبيه: تعذر الاتصال بخوادم AIN v2 الموزعة. تأكد من تشغيل منفذ 3000 محلياً.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // REST Callback handlers passing data safely to server-side variables
  const handleAddDevice = async (node: { name: string; type: string; ip: string; region: SaudiRegion }) => {
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(node)
      });
      if (res.ok) {
        const appended = await res.json();
        setDevices(prev => [appended, ...prev]);
      }
    } catch (e) {
      console.error('Error adding device to server:', e);
    }
  };

  const handleAckAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/alerts/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: alertId, user: 'م.عزام الزيد' })
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
      }
    } catch (e) {
      console.error('Error acking alert:', e);
    }
  };

  const handleUpdateLicense = async (licKey: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/license/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licKey })
      });
      if (res.ok) {
        const resData = await res.json();
        if (license) {
          setLicense({ ...license, licenseKey: licKey, status: resData.status });
        }
        return true;
      }
    } catch (e) {
      console.error('License verification failure:', e);
    }
    return false;
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
      }
    } catch (e) {
      console.error('Error deleting device:', e);
    }
  };

  const handlePingDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/ping/${deviceId}`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.device) {
          setDevices(prev => prev.map(d => d.id === deviceId ? data.device : d));
          return data;
        }
      }
    } catch (e) {
      console.error('Error diagnostic ping:', e);
    }
    return null;
  };

  const handleUpdateDevice = async (deviceId: string, updatedFields: any) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.device) {
          setDevices(prev => prev.map(d => d.id === deviceId ? data.device : d));
        }
      }
    } catch (e) {
      console.error('Error updating device:', e);
    }
  };

  // Helper inside AI assistant to trigger physical map filters
  const handleHighlightRegion = (region: any) => {
    setSelectedRegion(region);
  };

  // Compute live flashing total firing alerts count to trigger system notifications
  const totalFiringCount = alerts.filter(a => a.status === 'firing').length;

  if (isLoading && devices.length === 0) {
    return (
      <div className="min-h-screen bg-[#05070a] flex flex-col justify-center items-center text-center p-8 text-slate-400 font-sans">
        <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <h3 className="font-bold text-white text-lg">جاري فحص حالة النواة وربط الخوادم المحلية...</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-sm">
          يتم الآن تفقد خدمات المراقبة الفورية (FastAPI) وقواعد بيانات التراخيص RSA-2048 Bit
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-200 flex h-screen w-screen overflow-hidden font-sans select-none antialiased selection:bg-emerald-500/30">
      {/* Right Sidebar (Navigation) */}
      <aside className={`no-print fixed inset-y-0 right-0 z-50 w-64 border-l border-white/5 bg-[#0a0f18] flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 font-black text-white text-xl">
              ع
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">عين V2</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">نظام مراقبة الشبكات</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 p-1 hover:bg-white/5 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => { setActiveTab('noc'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'noc' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">📊</span> نظرة عامة
          </button>
          
          <button
            onClick={() => { setActiveTab('devices'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'devices' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">🖥️</span> الأجهزة المتصلة
          </button>

          <button
            onClick={() => { setActiveTab('topology'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'topology' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">🕸️</span> توبولوجيا الشبكة
          </button>

          <button
            onClick={() => { setActiveTab('netflow'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'netflow' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">🌊</span> تحليل الحركة (NetFlow)
          </button>

          <button
            onClick={() => { setActiveTab('reports'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'reports' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">📜</span> التقارير الذكية
          </button>

          <button
            onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'chat' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">💬</span> مساعد عَيْن الذكي
            {totalFiringCount > 0 && (
              <span className="mr-auto h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('license'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center px-6 py-3 transition-colors text-right relative cursor-pointer ${activeTab === 'license' ? 'bg-emerald-500/10 text-emerald-400 border-r-4 border-emerald-500 font-bold' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <span className="ml-3 text-lg">⚙️</span> إدارة التراخيص
          </button>
        </nav>

        <div className="p-6 mt-auto">
          <button 
            onClick={() => { setActiveTab('chat'); setIsMobileMenuOpen(false); }}
            className="w-full text-right p-4 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border border-emerald-500/20 cursor-pointer block hover:border-emerald-500/40 transition-all text-gray-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-400">مساعد عَين نشط</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed italic">"جاهز لتحويل أسئلتك إلى استعلامات SQL فورية"</p>
          </button>
        </div>
      </aside>

      {/* Screen Backdrop for Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-screen overflow-hidden min-w-0">
        {/* Top Control Bar Header */}
        <header className="no-print h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 bg-[#0a0f18]/50 backdrop-blur-md">
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            {/* Mobile Hamburger block */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-gray-400 p-2 hover:bg-white/5 rounded-lg shrink-0">
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">الخدمات (7/7):</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-green"></div>
              </div>
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <div className="text-xs text-gray-400 font-mono hidden sm:block">TRX-ID: 8429-AF</div>
          </div>
          
          <div className="flex items-center gap-3 lg:gap-4 shrink-0 font-sans">
            <div className="text-right">
              <p className="text-xs lg:text-sm font-bold text-white leading-tight">مشرف النظام</p>
              <p className="text-[10px] text-emerald-500 font-medium leading-none">صلاحيات كاملة (Enterprise)</p>
            </div>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm lg:text-base">
              👤
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard / Tab Content with modern background spacing */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {errorMsg && (
            <div className="no-print bg-red-950/20 border border-red-900/40 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2 mb-6 shadow-lg shadow-red-900/10">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'noc' && (
            <NocDashboard 
              devices={devices}
              alerts={alerts}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onAckAlert={handleAckAlert}
            />
          )}

          {activeTab === 'devices' && (
            <DevicesManager 
              devices={devices}
              onAddDevice={handleAddDevice}
              onDeleteDevice={handleDeleteDevice}
              onPingDevice={handlePingDevice}
              onUpdateDevice={handleUpdateDevice}
              selectedRegion={selectedRegion}
            />
          )}

          {activeTab === 'topology' && (
            <TopologyMap devices={devices} />
          )}

          {activeTab === 'netflow' && (
            <TrafficAnalyzer devices={devices} />
          )}

          {activeTab === 'reports' && (
            <ReportSuite devices={devices} alerts={alerts} />
          )}

          {activeTab === 'chat' && (
            <AinAssistant onHighlightRegion={handleHighlightRegion} />
          )}

          {activeTab === 'license' && license && (
            <LicensePortal licenseData={license} onUpdateLicense={handleUpdateLicense} />
          )}
        </div>

        {/* Bottom Activity Ticker Footer with combined info */}
        <footer className="no-print h-10 shrink-0 bg-[#0a0f18] border-t border-white/5 flex items-center px-4 lg:px-8 text-[11px] text-gray-400 font-mono overflow-hidden">
          <span className="text-emerald-500 font-bold ml-4 uppercase tracking-tighter shrink-0 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            الأنشطة الحية لموقع عين v2:
          </span>
          <marquee scrollamount="3.5" className="flex-1 text-gray-400">
            [المنافذ المفتوحة: واجهة المنفذ 8765، API المنفذ 8000، NetFlow المنفذ 2055] —- [العمليات الجارية] اكتشاف جهاز جديد في الرياض - تحديث تقارير الأداء الفورية بنجاح - تم استدعاء المساعد الذكي "عَين" بنجاح - فحص تراخيص RSA-2048 مكتمل بنسبة 100%
          </marquee>
        </footer>
      </main>
    </div>
  );
}

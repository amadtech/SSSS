import React, { useState } from 'react';
import { ShieldCheck, Cpu, HardDriveDownload, FileCheck, RefreshCw, Upload, Lock, Clock, CheckCircle } from 'lucide-react';

interface LicensePortalProps {
  licenseData: any;
  onUpdateLicense: (key: string) => Promise<boolean>;
}

export default function LicensePortal({ licenseData, onUpdateLicense }: LicensePortalProps) {
  const [licInput, setLicInput] = useState('');
  const [feedback, setFeedback] = useState<{ status: 'idle' | 'success' | 'err'; msg: string }>({ status: 'idle', msg: '' });
  const [isUpdatingLic, setIsUpdatingLic] = useState(false);
  const [backups, setBackups] = useState<string[]>([
    'db_backup_2026-05-18_0200.tar.gz (Size: 420MB) - Success',
    'db_backup_2026-05-19_0200.tar.gz (Size: 425MB) - Success'
  ]);
  const [isBackupInProcess, setIsBackupInProcess] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [selectedUpdateFile, setSelectedUpdateFile] = useState<string | null>(null);

  const handleLicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licInput.trim()) return;
    setIsUpdatingLic(true);
    setFeedback({ status: 'idle', msg: '' });

    setTimeout(async () => {
      const ok = await onUpdateLicense(licInput.trim());
      if (ok) {
        setFeedback({ status: 'success', msg: '✓ تمت المصادقة بنجاح! تم فك تشفير ترخيص RSA-2048 بنجاح. نوع الترخيص المعتمد: Lifetime (أبدي للمؤسسة).' });
        setLicInput('');
      } else {
        setFeedback({ status: 'err', msg: '❌ فشل فك تشريع التوقيع الرقمي. مفتاح الترخيص غير متوافق مع بصمة الجهاز الحالية.' });
      }
      setIsUpdatingLic(false);
    }, 1500);
  };

  const runBackup = () => {
    setIsBackupInProcess(true);
    setTimeout(() => {
      const now = new Date().toISOString().substring(0, 10);
      const randomWeight = Math.floor(Math.random() * 5) + 424;
      setBackups(prev => [`db_backup_${now}_0222.tar.gz (Size: ${randomWeight}MB) - Success`, ...prev]);
      setIsBackupInProcess(false);
      alert('تم إقران قواعد البيانات بنجاح! تم إنشاء نسخة احتياطية مضغوطة محلياً ودورنتها للأرشيف.');
    }, 2000);
  };

  const handlePackageUpload = (filename: string) => {
    setSelectedUpdateFile(filename);
    setUpdateMsg('جاري فحص التوقيع الرقمي لحزمة .ainpkg...');
    setTimeout(() => {
      setUpdateMsg('✓ تم فحص الحزمة بنجاح! حزمة التحديث موقعة برقم RSA-2048 وحالتها مطابقة لإصدار النواة v2.08.');
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* RSA-2048 License info */}
      <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between h-[520px]">
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm md:text-base">
              <Lock className="text-yellow-500 h-5 w-5" />
              بوابة التراخيص والمصادقة الرقمية (RSA-2048)
            </h3>
            <p className="text-xs text-slate-500">مراقبة توثيق الترخيص وتوقيع العقود على الخادم الوطني المعزول</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 block font-sans">نوع الترخيص النشط:</span>
              <div className="flex items-center gap-1.5 text-yellow-500 font-bold">
                <Clock className="h-4 w-4" />
                <span>LifeTime (ترخيص أبدي ومفتوح)</span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans mt-1">مرتبط بعقد وزارة الداخلية والبلديات الرقمية بالمملكة.</p>
            </div>

            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[10px] text-slate-500 block font-sans">البصمة الجسدية للخادم (Hardware Fingerprint):</span>
              <span className="text-white font-bold block bg-slate-900/80 p-1.5 rounded text-[11px] text-center border border-slate-800 select-all">
                {licenseData.fingerprint}
              </span>
              <span className="text-[9px] text-slate-600 font-sans block text-center">بصمة مشفرة مأخوذة من نواة اللينكس والماك المحلي</span>
            </div>
          </div>

          {/* Form to submit alternative license key */}
          <form onSubmit={handleLicSubmit} className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400">تحديث كود ترخيص RSA-2048 الموقع (.lic):</h4>
            <div className="flex gap-2">
              <input 
                type="text"
                value={licInput}
                onChange={(e) => setLicInput(e.target.value)}
                placeholder="أدخل كود الترخيص e.g. AIN-RSA2048-..."
                className="flex-1 px-4 py-2 bg-slate-950 text-white rounded-lg text-xs md:text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-yellow-500 border border-slate-800"
              />
              <button
                type="submit"
                disabled={isUpdatingLic}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-lg text-xs cursor-pointer transition-colors"
              >
                {isUpdatingLic ? 'جاري التحقق...' : 'تثبيت المفتاح'}
              </button>
            </div>

            {feedback.status !== 'idle' && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed ${feedback.status === 'success' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400' : 'bg-red-950/40 border border-red-900/40 text-red-400'}`}>
                {feedback.msg}
              </div>
            )}
          </form>
        </div>

        <div className="bg-slate-950/40 p-3 border border-slate-805/80 rounded-xl text-[10px] text-slate-500 leading-relaxed font-mono">
          🚨 الترخيص صالح لـ 1500 جهاز فرعي. جميع الاتصالات يتم تشفيرها محلياً بتوقيع بروتوكول RSA-2048 Bit لمنع تزوير سجلات المراقبة الجانبية.
        </div>
      </div>

      {/* Backups & Offline Package Updates */}
      <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-5 h-[520px] flex flex-col justify-between overflow-y-auto">
        {/* Offline updates section */}
        <div className="space-y-4">
          <div className="border-b border-slate-800 pb-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Upload className="text-indigo-400 h-4 w-4" />
              تحديث النظام دون اتصال (Offline Update)
            </h3>
            <p className="text-[10px] text-slate-500">رفع حزم .ainpkg الموقعة رقمياً لمسح وترقية النواة NMS</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handlePackageUpload('ain-update-patch-v2.08.ainpkg')}
                className="p-3 bg-slate-950 hover:bg-slate-900 text-xs text-slate-400 hover:text-white rounded-xl border border-slate-800 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <Cpu className="text-indigo-400 h-5 w-5" />
                <span>ترقية نواة v2.08</span>
              </button>
              
              <button 
                onClick={() => handlePackageUpload('ain-language-pack-ar.ainpkg')}
                className="p-3 bg-slate-950 hover:bg-slate-900 text-xs text-slate-400 hover:text-white rounded-xl border border-slate-800 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1.5"
              >
                <FileCheck className="text-emerald-400 h-5 w-5" />
                <span>حزمة العربية المحدثة</span>
              </button>
            </div>

            {selectedUpdateFile && (
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] font-mono space-y-1">
                <div className="text-slate-400">ملف التحديث المرفوع: <span className="text-indigo-400">{selectedUpdateFile}</span></div>
                <div className="text-emerald-400">{updateMsg}</div>
                {updateMsg.includes('✓') && (
                  <button 
                    onClick={() => {
                      alert('✓ تم تطبيق التحديث بنجاح! تم ريستارت خوادم NMS الداخلية بنجاح.');
                      setSelectedUpdateFile(null);
                      setUpdateMsg('');
                    }}
                    className="mt-2 w-full py-1 text-[10px] bg-indigo-600 text-white rounded font-bold font-sans hover:bg-indigo-505"
                  >
                    تأكيد وتطبيق التحديث على خادم 8765
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Database backup section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <HardDriveDownload className="text-blue-400 h-4 w-4" />
            النسخ الاحتياطي لقاعدة البيانات المحلية
          </h4>

          <div className="space-y-2">
            <button
              onClick={runBackup}
              disabled={isBackupInProcess}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex justify-center items-center gap-1.5 cursor-pointer transition-all"
            >
              {isBackupInProcess ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" /> جاري ضغط وفك تشفير الجداول...
                </>
              ) : (
                <>
                  <HardDriveDownload className="h-4.5 w-4.5" /> أخذ نسخة احتياطية فورية (.tar.gz)
                </>
              )}
            </button>

            <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-500 max-h-[100px] overflow-y-auto">
              {backups.map((bak, i) => (
                <div key={i} className="flex justify-between">
                  <span>{bak}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

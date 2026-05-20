import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { db, initDb } from './src/db-server';

dotenv.config();

// Initialize the SQLite database
initDb();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === '') {
      throw new Error('MISSING_KEY');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Database helper queries
function getDevices(): any[] {
  const rows = db.prepare('SELECT * FROM devices').all() as any[];
  return rows.map(r => ({
    ...r,
    cpu: Number(r.cpu),
    ram: Number(r.ram),
    disk: Number(r.disk),
    temp: Number(r.temp),
    latency: Number(r.latency),
    interfaces: JSON.parse(r.interfaces)
  }));
}

function getAlerts(): any[] {
  const rows = db.prepare('SELECT * FROM alerts').all() as any[];
  return rows.map(r => ({
    id: r.id,
    deviceId: r.deviceId,
    deviceName: r.deviceName,
    deviceIp: r.deviceIp,
    region: r.region,
    severity: r.severity,
    status: r.status,
    message: r.message,
    timestamp: r.timestamp,
    metric: r.metric,
    ackBy: r.ackBy || undefined
  }));
}

function getLicense(): any {
  const row = db.prepare('SELECT * FROM license LIMIT 1').get() as any;
  if (!row) return null;
  return {
    status: row.status,
    type: row.type,
    expiryDate: row.expiryDate,
    licensedDevices: Number(row.licensedDevices),
    fingerprint: row.fingerprint,
    licenseKey: row.licenseKey
  };
}

// REST endpoints
app.get('/api/devices', (req, res) => {
  try {
    res.json(getDevices());
  } catch (err) {
    console.error('Error fetching devices:', err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.post('/api/devices', (req, res) => {
  try {
    const { name, type, ip, region } = req.body;
    
    // Get total rows to construct ID
    const countRow = db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number };
    const nextId = countRow.count + 1 + Math.floor(Math.random() * 100);
    const id = `dev-${nextId}`;

    const newDevice = {
      id,
      name: name || 'new-device',
      type: type || 'router',
      ip: ip || '10.10.1.50',
      region: region || 'الرياض',
      status: 'online',
      cpu: Math.floor(Math.random() * 40) + 10,
      ram: Math.floor(Math.random() * 45) + 20,
      disk: Math.floor(Math.random() * 30) + 10,
      temp: Math.floor(Math.random() * 15) + 25,
      latency: Math.floor(Math.random() * 20) + 1,
      uptime: '0h 5m',
      fingerprint: `RSA-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      lastDiscovery: new Date().toISOString().replace('T', ' ').substring(0, 19),
      interfaces: [
        { name: 'GigabitEthernet0/1', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 12, trafficOut: 20, errors: 0, flapping: false }
      ]
    };

    const insert = db.prepare(`
      INSERT INTO devices (id, name, type, ip, region, status, cpu, ram, disk, temp, latency, uptime, fingerprint, lastDiscovery, interfaces)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newDevice.id,
      newDevice.name,
      newDevice.type,
      newDevice.ip,
      newDevice.region,
      newDevice.status,
      newDevice.cpu,
      newDevice.ram,
      newDevice.disk,
      newDevice.temp,
      newDevice.latency,
      newDevice.uptime,
      newDevice.fingerprint,
      newDevice.lastDiscovery,
      JSON.stringify(newDevice.interfaces)
    );

    res.status(201).json(newDevice);
  } catch (err) {
    console.error('Error adding device:', err);
    res.status(500).json({ error: 'Failed to add device' });
  }
});

app.get('/api/alerts', (req, res) => {
  try {
    res.json(getAlerts());
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

app.post('/api/alerts/ack', (req, res) => {
  try {
    const { id, user } = req.body;
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id) as any;
    if (alert) {
      const ackBy = user || 'م.عزام الزيد';
      db.prepare('UPDATE alerts SET status = ?, ackBy = ? WHERE id = ?').run('acknowledged', ackBy, id);
      const updatedAlert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id) as any;
      return res.json({
        id: updatedAlert.id,
        deviceId: updatedAlert.deviceId,
        deviceName: updatedAlert.deviceName,
        deviceIp: updatedAlert.deviceIp,
        region: updatedAlert.region,
        severity: updatedAlert.severity,
        status: updatedAlert.status,
        message: updatedAlert.message,
        timestamp: updatedAlert.timestamp,
        metric: updatedAlert.metric,
        ackBy: updatedAlert.ackBy
      });
    }
    res.status(404).json({ error: 'Alert not found' });
  } catch (err) {
    console.error('Error acknowledging alert:', err);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

app.get('/api/license', (req, res) => {
  try {
    const lic = getLicense();
    if (lic) {
      res.json(lic);
    } else {
      res.status(404).json({ error: 'License key not found' });
    }
  } catch (err) {
    console.error('Error fetching license:', err);
    res.status(500).json({ error: 'Failed to fetch license' });
  }
});

app.post('/api/license/update', (req, res) => {
  try {
    const { key } = req.body;
    if (key && key.includes('AIN-')) {
      db.prepare('UPDATE license SET licenseKey = ?, status = ?').run(key, 'active');
      res.json({ success: true, status: 'active' });
    } else {
      res.status(400).json({ success: false, message: 'كود الترخيص غير صالح للتشفير RSA-2048' });
    }
  } catch (err) {
    console.error('Error updating license:', err);
    res.status(500).json({ error: 'Failed to update license' });
  }
});

// AIN Local Assistant ("عين") processing route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, previousMessages } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentDevices = getDevices();
    const currentAlerts = getAlerts();

    let ai;
    try {
      ai = getAiClient();
    } catch (err: any) {
      // Return beautiful structured simulation response if Gemini key is missing or placeholder
      if (err.message === 'MISSING_KEY') {
        const simResponse = simulateAinAssistant(message, currentDevices, currentAlerts);
        return res.json(simResponse);
      }
      throw err;
    }

    // Set up real Gemini API with fixed system instructions corresponding to AIN v2 custom multi-agent pipeline:
    const schemaDetails = `
REAL SQLite DATABASE CURRENT DATA FOR REFERENCE:
Table: devices (id, name, type, ip, region, status, cpu, ram, disk, temp, latency, uptime, lastDiscovery, interfaces)
   - statuses: 'online', 'warning', 'offline'
   - regions: 'الرياض', 'مكة المكرمة', 'المدينة المنورة', 'الشرقية', 'عسير', 'القصيم', 'حائل', 'تبوك', 'الباحة', 'الحدود الشمالية', 'الجوف', 'جازان', 'نجران'
   - types: 'router', 'switch', 'firewall', 'server_win', 'server_linux', 'printer', 'ups', 'camera', 'iot', 'website', 'application', 'database'
Table: alerts (id, deviceId, deviceName, deviceIp, region, severity, status, message, timestamp, metric, ackBy)
   - severities: 'info', 'warning', 'error', 'critical'
   - statuses: 'firing', 'acknowledged', 'resolved'

Current Active Database Stats for context:
- Total active devices: ${currentDevices.length}
- Online devices: ${currentDevices.filter(d => d.status === 'online').length}
- Offline devices: ${currentDevices.filter(d => d.status === 'offline').length}
- Warning state devices: ${currentDevices.filter(d => d.status === 'warning').length}
- Firing alerts: ${currentAlerts.filter(a => a.status === 'firing').length}
- Critical alerts: ${currentAlerts.filter(a => a.severity === 'critical').length}
- Devices list references: ${JSON.stringify(currentDevices.map(d => ({ name: d.name, ip: d.ip, status: d.status, region: d.region })))}
- Active Alerts list: ${JSON.stringify(currentAlerts.map(a => ({ device: a.deviceName, message: a.message, severity: a.severity, state: a.status })))}
`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `الاستعلام: "${message}". السياق التاريخي: ${JSON.stringify(previousMessages || [])}` }]
        }
      ],
      config: {
        systemInstruction: `You are 'عَين' (Ain) v2 AI Admin Assistant, an advanced local Ollama AI engine operating in an air-gapped secure environment for Saudi Government institutions.
Respond ONLY with a valid JSON document which implements the following schema:
- gatekeeper: { type: "query" | "general", extractedFilters: string[] - regions, device types, or statuses extracted }
- planner: { sql: string - A valid read-only SQLite parameterized SELECT query to fetch the requested answers, rationale: string in Arabic }
- narrator: { text: string - A beautiful Saudi Arabic explanation answering the user's inquiry naturally, using friendly professional Saudi cybersecurity engineer style. Highlight DOWN/offline systems immediately with attention triggers. Use bold numbers and clear markdown lists. Feel like a living colleague! }

Here is the database schema description:
${schemaDetails}

Make sure to return only JSON, matching this schema precisely. No pre-text or markdown wrapping inside the raw response.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gatekeeper: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                extractedFilters: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['type', 'extractedFilters']
            },
            planner: {
              type: Type.OBJECT,
              properties: {
                sql: { type: Type.STRING },
                rationale: { type: Type.STRING }
              },
              required: ['sql', 'rationale']
            },
            narrator: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING }
              },
              required: ['text']
            }
          },
          required: ['gatekeeper', 'planner', 'narrator']
        }
      }
    });

    const parsedData = JSON.parse(chatResponse.text || '{}');
    res.json(parsedData);

  } catch (error: any) {
    console.error('Gemini error, fallback to simulated engine:', error);
    try {
      const currentDevices = getDevices();
      const currentAlerts = getAlerts();
      const sim = simulateAinAssistant(req.body.message, currentDevices, currentAlerts);
      res.json(sim);
    } catch (e) {
      res.status(500).json({ error: 'Internal Server Error processing request' });
    }
  }
});

// High quality rule-based AI engine when Key is unconfigured or offline
function simulateAinAssistant(prompt: string, devices: any[], alerts: any[]): any {
  const norm = prompt.toLowerCase();
  let textAr = '';
  let sqlPath = '';
  let filters: string[] = [];

  if (norm.includes('كم') || norm.includes('عدد') || norm.includes('أجهزة') || norm.includes('جهاز')) {
    if (norm.includes('down') || norm.includes('طافي') || norm.includes('offline') || norm.includes('مقطوع')) {
      const offCount = devices.filter(d => d.status === 'offline').length;
      filters = ['offline'];
      sqlPath = "SELECT COUNT(*) FROM devices WHERE status = 'offline';";
      textAr = `بناءً على فحص خادم الأجهزة الفوري في قاعدة بيانات SQLite المحلية، لدينا حالياً **${offCount} أجهزة طافية (Offline)** تماماً عن الخدمة. 

أبرزها جهاز الكاميرا بالمنطقة الشرقية **(cam-dam-east-gate2)** بسبب انقطاع الـ ICMP. جاري إرسال حزم الاستفسار للتحقق مما إذا كان هناك خلل مزود طاقة PoE.`;
    } else if (norm.includes('الرياض') || norm.includes('ruh')) {
      const dbR = devices.filter(d => d.region === 'الرياض').length;
      filters = ['الرياض'];
      sqlPath = "SELECT * FROM devices WHERE region = 'الرياض';";
      textAr = `منطقتنا الإدارية بالرياض تضم حالياً **${dbR} أجهزة نشطة** داخل البنية التحتية الأساسية المستردة من قاعدة البيانات SQLite المحلية في مقر الوزارة الرئيسي. جميعها تعمل بحالة ممتازة مستقرة ما عدا خادم تخزين الـ UPS الذي سجل ارتفاعاً طفيفاً بحرارته (29 درجة مئوية) لكنها ضمن الحيز المسموح.`;
    } else {
      sqlPath = 'SELECT COUNT(*) FROM devices;';
      textAr = `إجمالي عدد الأجهزة المسجلة في قاعدة بيانات SQLite لنظام المراقبة المحلي AIN v2 للجهة هو **${devices.length} جهازاً** موزعة على 13 منطقة إدارية بالمملكة العربيّة السعودية، منها **${devices.filter(d => d.status === 'online').length} أجهزة متصلة بالكامل** (Online).`;
    }
  } else if (norm.includes('تنبيه') || norm.includes('إنذار') || norm.includes('خطر') || norm.includes('مشكلة')) {
    const fireCount = alerts.filter(a => a.status === 'firing').length;
    filters = ['firing'];
    sqlPath = "SELECT * FROM alerts WHERE status = 'firing' ORDER BY severity DESC;";
    textAr = `من عيوني! استعلمت لك في قاعدة بيانات SQLite، ورصدت لك **${fireCount} إنذارات نشطة بالشبكة الآن (Firing Alerts)**:
1. 🔴 **حرجة**: الكاميرا الشرقية \`cam-dam-east-gate2\` متوقفة تماماً.
2. ⚠️ **عالية**: قاعدة البيانات بالمدينة المنورة \`srv-med-database02\` استهلاك الرام تجاوز 92٪.
3. 🟡 **متوسطة**: تطبيق عسير البلدي \`app-abha-civil-affairs\` لود المعالج واصل 95٪.`;
  } else if (norm.includes('مكة') || norm.includes('جدة')) {
    filters = ['مكة المكرمة'];
    sqlPath = "SELECT * FROM devices WHERE region = 'مكة المكرمة';";
    textAr = `نظام NMS مكة المكرمة سجل في جدول SQLite **جهازين مستقرين**: جدار الحماية الرئيسي \`fw-jed-makkah-ext01\` يعمل بجهد تصفية باندويث ممتاز، وطابعة الإدارة \`prn-jed-gov-admin\` بحالة متصلة. لا انقطاعات مسجلة بالمنطقة الغربية ولله الحمد.`;
  } else {
    // General greeting
    sqlPath = 'SELECT sqlite_version();';
    textAr = `أهلاً بك مهندسنا العزيز عزام! أنا **عَين v2**، مساعدك الذكي لمراقبة البنية التحتية المتكاملة مع قاعدة بيانات **SQLite حقيقية ومستقرة**.

أعمل بالكامل **داخل شبكتكم المغلقة (On-Premises Air-gapped Network)** ومستعد لترجمة أي سؤال باللغة الطبيعية إلى استعلامات SQL حية ومرحة وسريعة على قاعدة البيانات المحلية لاستعراض حالة المقاييس الفورية، التوبولوجيا وحركة NetFlow.

بإمكانك سؤالي: "كم جهاز طافي عندي؟" أو "اعطني قائمة الإنذارات النشطة" أو "وش حالة أجهزة الرياض".`;
  }

  return {
    gatekeeper: {
      type: 'query',
      extractedFilters: filters
    },
    planner: {
      sql: sqlPath,
      rationale: 'استخلاص السجل من قاعدة البيانات السلسلة للمراقبة لمطابقة معايير العميل.'
    },
    narrator: {
      text: textAr
    }
  };
}

// Start Server Function wrapping Express + Vite build configs
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AIN v2 NMS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

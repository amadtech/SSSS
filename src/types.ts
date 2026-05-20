export interface Device {
  id: string;
  name: string;
  type: 'router' | 'switch' | 'firewall' | 'server_win' | 'server_linux' | 'printer' | 'ups' | 'camera' | 'iot' | 'website' | 'application' | 'database';
  ip: string;
  region: SaudiRegion;
  status: 'online' | 'offline' | 'warning';
  cpu: number; // Percentage
  ram: number; // Percentage
  disk: number; // Percentage
  temp: number; // Celsius
  latency: number; // Milliseconds
  uptime: string;
  fingerprint: string;
  interfaces: NetworkInterface[];
  lastDiscovery: string;
}

export interface NetworkInterface {
  name: string;
  status: 'up' | 'down';
  speed: string;
  vlan: string;
  trafficIn: number; // Mbps
  trafficOut: number; // Mbps
  errors: number;
  flapping: boolean;
}

export interface NetworkAlert {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceIp: string;
  region: SaudiRegion;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'firing' | 'acknowledged' | 'resolved' | 'suppressed' | 'expired';
  message: string;
  timestamp: string;
  metric: string;
  ackBy?: string;
}

export interface NetFlowRecord {
  id: string;
  srcIp: string;
  srcPort: number;
  dstIp: string;
  dstPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  device: string;
  timestamp: string;
}

export type SaudiRegion =
  | 'الرياض'
  | 'مكة المكرمة'
  | 'المدينة المنورة'
  | 'الشرقية'
  | 'عسير'
  | 'القصيم'
  | 'حائل'
  | 'تبوك'
  | 'الباحة'
  | 'الحدود الشمالية'
  | 'الجوف'
  | 'جازان'
  | 'نجران';

export const SAUDI_REGIONS: SaudiRegion[] = [
  'الرياض',
  'مكة المكرمة',
  'المدينة المنورة',
  'الشرقية',
  'عسير',
  'القصيم',
  'حائل',
  'تبوك',
  'الباحة',
  'الحدود الشمالية',
  'الجوف',
  'جازان',
  'نجران'
];

export interface ReportTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  description: string;
  category: 'performance' | 'operations' | 'security' | 'sla';
}

export interface LicensingInfo {
  status: 'active' | 'expired' | 'invalid';
  type: 'monthly' | 'yearly' | 'lifetime';
  expiryDate: string;
  licensedDevices: number;
  fingerprint: string;
  licenseKey: string;
}

export const INITIAL_DEVICES: Device[] = [
  {
    id: 'dev-1',
    name: 'rtr-ruh-hq-gw01',
    type: 'router',
    ip: '10.10.1.1',
    region: 'الرياض',
    status: 'online',
    cpu: 45,
    ram: 62,
    disk: 28,
    temp: 41,
    latency: 12,
    uptime: '143d 12h 4m',
    fingerprint: 'RSA-A90F-23E1',
    lastDiscovery: '2026-05-19 23:15:00',
    interfaces: [
      { name: 'GigabitEthernet0/0 (Uplink)', status: 'up', speed: '10 Gbps', vlan: 'Trunk', trafficIn: 450, trafficOut: 320, errors: 0, flapping: false },
      { name: 'GigabitEthernet0/1 (NOC Local)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 85, trafficOut: 90, errors: 12, flapping: false },
      { name: 'GigabitEthernet0/2 (DMZ)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 100', trafficIn: 220, trafficOut: 180, errors: 0, flapping: false },
      { name: 'GigabitEthernet0/3 (Backup Link)', status: 'down', speed: '1 Gbps', vlan: 'VLAN 999', trafficIn: 0, trafficOut: 0, errors: 412, flapping: true }
    ]
  },
  {
    id: 'dev-2',
    name: 'sw-ruh-hq-core01',
    type: 'switch',
    ip: '10.10.1.10',
    region: 'الرياض',
    status: 'online',
    cpu: 24,
    ram: 45,
    disk: 15,
    temp: 38,
    latency: 2,
    uptime: '280d 5h',
    fingerprint: 'RSA-BD32-11D9',
    lastDiscovery: '2026-05-19 23:14:12',
    interfaces: [
      { name: 'TenGigabitEthernet1/1', status: 'up', speed: '10 Gbps', vlan: 'Trunk', trafficIn: 1200, trafficOut: 980, errors: 0, flapping: false },
      { name: 'GigabitEthernet1/1', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 42, trafficOut: 200, errors: 0, flapping: false },
      { name: 'GigabitEthernet1/2', status: 'up', speed: '1 Gbps', vlan: 'VLAN 20', trafficIn: 140, trafficOut: 85, errors: 0, flapping: false },
      { name: 'GigabitEthernet1/3', status: 'up', speed: '1 Gbps', vlan: 'VLAN 30', trafficIn: 98, trafficOut: 12, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-3',
    name: 'fw-jed-makkah-ext01',
    type: 'firewall',
    ip: '10.20.1.1',
    region: 'مكة المكرمة',
    status: 'online',
    cpu: 68,
    ram: 78,
    disk: 42,
    temp: 52,
    latency: 18,
    uptime: '32d 11h',
    fingerprint: 'RSA-C991-FE21',
    lastDiscovery: '2026-05-19 23:10:05',
    interfaces: [
      { name: 'Outside (Internet)', status: 'up', speed: '1 Gbps', vlan: 'Trunk', trafficIn: 620, trafficOut: 530, errors: 52, flapping: false },
      { name: 'Inside (Corporate)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 200', trafficIn: 480, trafficOut: 590, errors: 0, flapping: false },
      { name: 'DMZ', status: 'up', speed: '100 Mbps', vlan: 'VLAN 300', trafficIn: 12, trafficOut: 9, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-4',
    name: 'srv-ruh-active-dir01',
    type: 'server_win',
    ip: '10.10.10.5',
    region: 'الرياض',
    status: 'online',
    cpu: 18,
    ram: 85,
    disk: 65,
    temp: 24,
    latency: 5,
    uptime: '14d 2h',
    fingerprint: 'RSA-D882-9901',
    lastDiscovery: '2026-05-19 23:12:00',
    interfaces: [
      { name: 'Ethernet1 (LAN)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 8, trafficOut: 34, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-5',
    name: 'srv-med-database02',
    type: 'database',
    ip: '10.30.2.14',
    region: 'المدينة المنورة',
    status: 'warning',
    cpu: 89,
    ram: 92,
    disk: 88,
    temp: 45,
    latency: 22,
    uptime: '45d 8h',
    fingerprint: 'RSA-E123-AA90',
    lastDiscovery: '2026-05-19 23:11:42',
    interfaces: [
      { name: 'eth0', status: 'up', speed: '10 Gbps', vlan: 'VLAN 50', trafficIn: 980, trafficOut: 1120, errors: 4, flapping: false }
    ]
  },
  {
    id: 'dev-6',
    name: 'cam-dam-east-gate2',
    type: 'camera',
    ip: '10.40.12.82',
    region: 'الشرقية',
    status: 'offline',
    cpu: 0,
    ram: 0,
    disk: 0,
    temp: 0,
    latency: 9999,
    uptime: '0s',
    fingerprint: 'RSA-AC01-EE99',
    lastDiscovery: '2026-05-19 23:05:00',
    interfaces: [
      { name: 'Ethernet0 (PoE)', status: 'down', speed: '100 Mbps', vlan: 'VLAN 80', trafficIn: 0, trafficOut: 0, errors: 9901, flapping: false }
    ]
  },
  {
    id: 'dev-7',
    name: 'ups-ruh-datacenter-c1',
    type: 'ups',
    ip: '10.10.99.2',
    region: 'الرياض',
    status: 'online',
    cpu: 5,
    ram: 12,
    disk: 5,
    temp: 29,
    latency: 8,
    uptime: '720d 1h',
    fingerprint: 'RSA-F992-FFEE',
    lastDiscovery: '2026-05-19 23:14:00',
    interfaces: [
      { name: 'SNMP Card Node', status: 'up', speed: '100 Mbps', vlan: 'VLAN 99', trafficIn: 1, trafficOut: 1, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-8',
    name: 'srv-ahsa-linux-web01',
    type: 'server_linux',
    ip: '10.40.3.11',
    region: 'الشرقية',
    status: 'online',
    cpu: 34,
    ram: 51,
    disk: 44,
    temp: 34,
    latency: 14,
    uptime: '99d 12h',
    fingerprint: 'RSA-88AE-F91A',
    lastDiscovery: '2026-05-19 23:14:00',
    interfaces: [
      { name: 'ens18', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 45, trafficOut: 12, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-9',
    name: 'prn-jed-gov-admin',
    type: 'printer',
    ip: '10.20.15.5',
    region: 'مكة المكرمة',
    status: 'online',
    cpu: 10,
    ram: 28,
    disk: 9,
    temp: 22,
    latency: 25,
    uptime: '3d 4h',
    fingerprint: 'RSA-99A1-BB23',
    lastDiscovery: '2026-05-19 22:50:00',
    interfaces: [
      { name: 'LAN NIC', status: 'up', speed: '100 Mbps', vlan: 'VLAN 40', trafficIn: 0.5, trafficOut: 2.1, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-10',
    name: 'portal-moi-internal',
    type: 'website',
    ip: '192.168.100.50',
    region: 'الرياض',
    status: 'online',
    cpu: 12,
    ram: 45,
    disk: 30,
    temp: 20,
    latency: 4,
    uptime: '150d 3h',
    fingerprint: 'RSA-99E1-CD89',
    lastDiscovery: '2026-05-19 23:14:55',
    interfaces: [
      { name: 'HTTP/HTTPS Proxy Int', status: 'up', speed: '1 Gbps', vlan: 'VLAN 100', trafficIn: 88, trafficOut: 112, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-11',
    name: 'iot-tabuk-temp-sensor',
    type: 'iot',
    ip: '10.70.5.9',
    region: 'تبوك',
    status: 'online',
    cpu: 2,
    ram: 8,
    disk: 2,
    temp: 18,
    latency: 45,
    uptime: '22d 1h',
    fingerprint: 'RSA-FF21-9988',
    lastDiscovery: '2026-05-19 23:02:11',
    interfaces: [
      { name: 'Wireless IP Client', status: 'up', speed: '54 Mbps', vlan: 'VLAN 80', trafficIn: 0.1, trafficOut: 0.2, errors: 0, flapping: false }
    ]
  },
  {
    id: 'dev-12',
    name: 'app-abha-civil-affairs',
    type: 'application',
    ip: '10.50.4.40',
    region: 'عسير',
    status: 'warning',
    cpu: 95,
    ram: 88,
    disk: 72,
    temp: 31,
    latency: 15,
    uptime: '9d 21h',
    fingerprint: 'RSA-A41B-EF28',
    lastDiscovery: '2026-05-19 23:13:02',
    interfaces: [
      { name: 'VLAN 20 Local GW', status: 'up', speed: '1 Gbps', vlan: 'VLAN 20', trafficIn: 320, trafficOut: 240, errors: 15, flapping: false }
    ]
  }
];

export const INITIAL_ALERTS: NetworkAlert[] = [
  {
    id: 'alt-1',
    deviceId: 'dev-6',
    deviceName: 'cam-dam-east-gate2',
    deviceIp: '10.40.12.82',
    region: 'الشرقية',
    severity: 'critical',
    status: 'firing',
    message: 'انقطاع الاتصال التام بالجهاز (ICMP Timeout) - يُرجى التحقق من خط التغذية وحالة منفذ الـPoE',
    timestamp: '2026-05-20 02:10:15',
    metric: 'ICMP Loss 100%'
  },
  {
    id: 'alt-2',
    deviceId: 'dev-5',
    deviceName: 'srv-med-database02',
    deviceIp: '10.30.2.14',
    region: 'المدينة المنورة',
    severity: 'error',
    status: 'firing',
    message: 'ارتفاع معدل استهلاك الرام (RAM Utilization) وتجاوز عتبة الـ90٪',
    timestamp: '2026-05-20 01:45:22',
    metric: 'RAM: 92%'
  },
  {
    id: 'alt-3',
    deviceId: 'dev-12',
    deviceName: 'app-abha-civil-affairs',
    deviceIp: '10.50.4.40',
    region: 'عسير',
    severity: 'warning',
    status: 'firing',
    message: 'ارتفاع مستمر في استهلاك المعالج (CPU load spikes) على خدمة الأحوال المدنية',
    timestamp: '2026-05-20 02:02:11',
    metric: 'CPU: 95%'
  },
  {
    id: 'alt-4',
    deviceId: 'dev-3',
    deviceName: 'fw-jed-makkah-ext01',
    deviceIp: '10.20.1.1',
    region: 'مكة المكرمة',
    severity: 'warning',
    status: 'acknowledged',
    message: 'ارتفاع طفيف في درجة حرارة جهاز جدار الحماية الرئيسي بالمنطقة الغربية',
    timestamp: '2026-05-19 19:30:00',
    metric: 'Temp: 52°C',
    ackBy: 'م.عزام الزيد'
  },
  {
    id: 'alt-5',
    deviceId: 'dev-1',
    deviceName: 'rtr-ruh-hq-gw01',
    deviceIp: '10.10.1.1',
    region: 'الرياض',
    severity: 'info',
    status: 'resolved',
    message: 'ذبذبة مؤقتة (Interface Flapping) على المنفذ الفرعي الاحتياطي (GigabitEthernet0/3)',
    timestamp: '2026-05-19 14:12:00',
    metric: 'Link Flapped 4 times'
  }
];

export const INITIAL_NETFLOW: NetFlowRecord[] = [
  { id: 'flow-1', srcIp: '10.10.1.100', srcPort: 49451, dstIp: '10.10.1.10', dstPort: 443, protocol: 'HTTPS', bytes: 14500000, packets: 12000, device: 'sw-ruh-hq-core01', timestamp: '02:20:15' },
  { id: 'flow-2', srcIp: '10.20.1.52', srcPort: 52123, dstIp: '185.12.5.4', dstPort: 443, protocol: 'HTTPS', bytes: 8520000, packets: 7100, device: 'fw-jed-makkah-ext01', timestamp: '02:20:22' },
  { id: 'flow-3', srcIp: '10.10.10.5', srcPort: 389, dstIp: '10.10.1.55', dstPort: 53123, protocol: 'LDAP', bytes: 2450000, packets: 1800, device: 'srv-ruh-active-dir01', timestamp: '02:20:41' },
  { id: 'flow-4', srcIp: '10.30.2.14', srcPort: 5432, dstIp: '10.30.1.200', dstPort: 49911, protocol: 'PostgreSQL', bytes: 21200000, packets: 14200, device: 'srv-med-database02', timestamp: '02:21:02' },
  { id: 'flow-5', srcIp: '10.40.12.5', srcPort: 514, dstIp: '10.10.1.250', dstPort: 514, protocol: 'Syslog', bytes: 512000, packets: 1020, device: 'rtr-ruh-hq-gw01', timestamp: '02:21:18' },
  { id: 'flow-6', srcIp: '10.10.1.1', srcPort: 161, dstIp: '10.10.1.250', dstPort: 161, protocol: 'SNMP', bytes: 124000, packets: 340, device: 'rtr-ruh-hq-gw01', timestamp: '02:21:30' }
];

export const REPORT_TEMPLATES: ReportTemplate[] = [
  { id: 'rep-daily', nameAr: 'الموجز اليومي للعمليات (Daily Briefing)', nameEn: 'Daily Operations Briefing', description: 'ملخص يومي شامل لجميع انقطاعات الشبكة، ومعدلات الإتاحة (SLA)، والأجهزة الأكثر تضرراً وموجز نوبة العمل.', category: 'operations' },
  { id: 'rep-sla', nameAr: 'تقارير الالتزام بمستوى الخدمة (SLA Compliance)', nameEn: 'SLA Compliance Report', description: 'معدلات الإتاحة الإجمالية للأجهزة الحيوية والوزارية وحساب أوقات التوقف الإجمالية MTBF وMTTR.', category: 'sla' },
  { id: 'rep-worst', nameAr: 'الأجهزة الأكثر تراجعاً في الأداء (Worst Performers)', nameEn: 'Top Worst Performers', description: 'تحديد الأجهزة ذات أعلى معدل حرارة، استهلاك ذاكرة، أو انقطاع الحزم للتخطيط لاستبدالها.', category: 'performance' },
  { id: 'rep-capacity', nameAr: 'مؤشرات التخطيط السعوي (Capacity Forecast)', nameEn: 'Capacity Forecast', description: 'تحليل معدل النمو في السعة والتخزين وحركة الباندويث لتوقع الاختناقات المستقبلية خلال 6 أشهر.', category: 'performance' },
  { id: 'rep-handover', nameAr: 'تقرير تسليم الوردية (Shift Handover)', nameEn: 'Shift Handover Report', description: 'موجز تفصيلي لحالة التنبيهات المفتوحة مخصّص للمهندسين المستلمين لتأمين سلاسة الاستمرارية.', category: 'operations' },
  { id: 'rep-false', nameAr: 'تحليل الإنذارات الكاذبة (False Positive Analysis)', nameEn: 'False Positive Analysis', description: 'تصفية وتقصي أثر التنبيهات التي تكررت وتم حلها تلقائياً لدوزنة قيم التنبيهات العتبية.', category: 'security' }
];

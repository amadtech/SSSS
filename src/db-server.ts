import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Resolve database path in the project root
const dbPath = path.join(process.cwd(), 'ainv2.db');

export const db = new Database(dbPath);

// Initialize database schema and insert seed data if empty
export function initDb() {
  console.log('[AIN DB] Initializing SQLite database at:', dbPath);

  // Enable WAL mode for high performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      ip TEXT NOT NULL,
      region TEXT NOT NULL,
      status TEXT NOT NULL,
      cpu INTEGER NOT NULL,
      ram INTEGER NOT NULL,
      disk INTEGER NOT NULL,
      temp INTEGER NOT NULL,
      latency INTEGER NOT NULL,
      uptime TEXT NOT NULL,
      fingerprint TEXT NOT NULL,
      lastDiscovery TEXT NOT NULL,
      interfaces TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      deviceId TEXT NOT NULL,
      deviceName TEXT NOT NULL,
      deviceIp TEXT NOT NULL,
      region TEXT NOT NULL,
      severity TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      metric TEXT NOT NULL,
      ackBy TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS license (
      licenseKey TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      expiryDate TEXT NOT NULL,
      licensedDevices INTEGER NOT NULL,
      fingerprint TEXT NOT NULL
    )
  `);

  // Check if tables are empty, and seed if they are
  const countDevices = db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number };
  if (countDevices.count === 0) {
    console.log('[AIN DB] Seeding initial Saudi NMS devices...');
    const seedDevices = [
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
        interfaces: JSON.stringify([
          { name: 'GigabitEthernet0/0 (Uplink)', status: 'up', speed: '10 Gbps', vlan: 'Trunk', trafficIn: 450, trafficOut: 320, errors: 0, flapping: false },
          { name: 'GigabitEthernet0/1 (NOC Local)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 85, trafficOut: 90, errors: 12, flapping: false },
          { name: 'GigabitEthernet0/2 (DMZ)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 100', trafficIn: 220, trafficOut: 180, errors: 0, flapping: false },
          { name: 'GigabitEthernet0/3 (Backup Link)', status: 'down', speed: '1 Gbps', vlan: 'VLAN 999', trafficIn: 0, trafficOut: 0, errors: 412, flapping: true }
        ])
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
        interfaces: JSON.stringify([
          { name: 'TenGigabitEthernet1/1', status: 'up', speed: '10 Gbps', vlan: 'Trunk', trafficIn: 1200, trafficOut: 980, errors: 0, flapping: false },
          { name: 'GigabitEthernet1/1', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 42, trafficOut: 200, errors: 0, flapping: false },
          { name: 'GigabitEthernet1/2', status: 'up', speed: '1 Gbps', vlan: 'VLAN 20', trafficIn: 140, trafficOut: 85, errors: 0, flapping: false },
          { name: 'GigabitEthernet1/3', status: 'up', speed: '1 Gbps', vlan: 'VLAN 30', trafficIn: 98, trafficOut: 12, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'Outside (Internet)', status: 'up', speed: '1 Gbps', vlan: 'Trunk', trafficIn: 620, trafficOut: 530, errors: 52, flapping: false },
          { name: 'Inside (Corporate)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 200', trafficIn: 480, trafficOut: 590, errors: 0, flapping: false },
          { name: 'DMZ', status: 'up', speed: '100 Mbps', vlan: 'VLAN 300', trafficIn: 12, trafficOut: 9, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'Ethernet1 (LAN)', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 8, trafficOut: 34, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'eth0', status: 'up', speed: '10 Gbps', vlan: 'VLAN 50', trafficIn: 980, trafficOut: 1120, errors: 4, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'Ethernet0 (PoE)', status: 'down', speed: '100 Mbps', vlan: 'VLAN 80', trafficIn: 0, trafficOut: 0, errors: 9901, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'SNMP Card Node', status: 'up', speed: '100 Mbps', vlan: 'VLAN 99', trafficIn: 1, trafficOut: 1, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'ens18', status: 'up', speed: '1 Gbps', vlan: 'VLAN 10', trafficIn: 45, trafficOut: 12, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'LAN NIC', status: 'up', speed: '100 Mbps', vlan: 'VLAN 40', trafficIn: 0.5, trafficOut: 2.1, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'HTTP/HTTPS Proxy Int', status: 'up', speed: '1 Gbps', vlan: 'VLAN 100', trafficIn: 88, trafficOut: 112, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'Wireless IP Client', status: 'up', speed: '54 Mbps', vlan: 'VLAN 80', trafficIn: 0.1, trafficOut: 0.2, errors: 0, flapping: false }
        ])
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
        interfaces: JSON.stringify([
          { name: 'VLAN 20 Local GW', status: 'up', speed: '1 Gbps', vlan: 'VLAN 20', trafficIn: 320, trafficOut: 240, errors: 15, flapping: false }
        ])
      }
    ];

    const insertDevice = db.prepare(`
      INSERT INTO devices (id, name, type, ip, region, status, cpu, ram, disk, temp, latency, uptime, fingerprint, lastDiscovery, interfaces)
      VALUES (@id, @name, @type, @ip, @region, @status, @cpu, @ram, @disk, @temp, @latency, @uptime, @fingerprint, @lastDiscovery, @interfaces)
    `);

    for (const d of seedDevices) {
      insertDevice.run(d);
    }
  }

  const countAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts').get() as { count: number };
  if (countAlerts.count === 0) {
    console.log('[AIN DB] Seeding initial alerts...');
    const seedAlerts = [
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
        metric: 'ICMP Loss 100%',
        ackBy: null
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
        metric: 'RAM: 92%',
        ackBy: null
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
        metric: 'CPU: 95%',
        ackBy: null
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
        metric: 'Link Flapped 4 times',
        ackBy: null
      }
    ];

    const insertAlert = db.prepare(`
      INSERT INTO alerts (id, deviceId, deviceName, deviceIp, region, severity, status, message, timestamp, metric, ackBy)
      VALUES (@id, @deviceId, @deviceName, @deviceIp, @region, @severity, @status, @message, @timestamp, @metric, @ackBy)
    `);

    for (const a of seedAlerts) {
      insertAlert.run(a);
    }
  }

  const countLicense = db.prepare('SELECT COUNT(*) as count FROM license').get() as { count: number };
  if (countLicense.count === 0) {
    console.log('[AIN DB] Seeding license credentials...');
    db.prepare(`
      INSERT INTO license (licenseKey, status, type, expiryDate, licensedDevices, fingerprint)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'AIN-RSA2048-LIFETIME-ZZ908-6621B',
      'active',
      'lifetime',
      'مفتوح (أبدي) - Lifetime',
      1500,
      'RSA-NODE-908B-CCFE-2026'
    );
  }

  console.log('[AIN DB] SQLite integration booted and verify complete!');
}

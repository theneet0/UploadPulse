export type TestState =
  | 'idle'
  | 'discovering_servers'
  | 'measuring_latency'
  | 'downloading'
  | 'uploading'
  | 'completed'
  | 'cancelled'
  | 'failed';

export interface StateInfo {
  state: TestState;
  sessionID: string;
  progressPercent: number;
  message: string;
  errorMessage?: string;
}

export interface LiveMetrics {
  sessionID: string;
  testMode?: string;
  phase?: 'latency' | 'download' | 'upload' | 'idle';
  instantaneousSpeedBps: number;
  peakSpeedBps: number;
  averageSpeedBps: number;
  avgDownloadSpeedBps?: number;
  peakDownloadSpeedBps?: number;
  avgUploadSpeedBps?: number;
  peakUploadSpeedBps?: number;
  transferredBytes: number;
  downloadBytes?: number;
  uploadBytes?: number;
  serverConfirmedBytes: number;
  serverConfirmedRatio: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  activeWorkers: number;
  latencyMs: number;
  jitterMs?: number;
  minLatencyMs?: number;
  maxLatencyMs?: number;
}

export interface ServerInfo {
  id: string;
  name: string;
  sponsor: string;
  country: string;
  city: string;
  distance: number;
  latencyMs: number;
  jitterMs?: number;
  minLatency?: number;
  maxLatency?: number;
  url: string;
  host: string;
  available: boolean;
}

export interface ProxyTestResult {
  success: boolean;
  latencyMs: number;
  exitIp: string;
  message: string;
}

export interface NetworkSettings {
  testMode: 'both' | 'download' | 'upload';
  durationSeconds: number;
  workerCount: number;
  protocol: 'http' | 'tcp';
  latencyMode: 'http' | 'tcp' | 'icmp';
  jitterSampleCount?: number;
  jitterPingSamples?: number;
  ipVersion: 'auto' | 'ipv4' | 'ipv6';
  warmupSeconds: number;
  savingMode: boolean;
  proxyURL: string;
  sourceIP?: string;
  sourceIp?: string;
  customDNSServer?: string;
  customDns?: string;
  userAgent: string;
  virtualCity: string;
  latitude: number | null;
  longitude: number | null;
  serverSearchKeyword: string;
  countryFilter: string;
  customServerURL: string;
  selectedServerID: string;
  serverSelectionMode: 'auto' | 'manual' | 'custom';
}

export interface DisplaySettings {
  speedUnit: 'Mbps' | 'MBps' | 'kbps' | 'kBps' | 'Gbps';
  decimalPrecision: number;
  theme: 'system' | 'dark' | 'light' | 'oled';
  accentColor?: string;
  enableMica: boolean;
  reducedMotion: boolean;
  showLiveChart: boolean;
  chartRetentionPoints: number;
  textScalingPercent?: number;
  alwaysOnTop?: boolean;
  minimizeToTray?: boolean;
  closeAction?: string;
  completionNotification: boolean;
  completionSound?: boolean;
  soundAlert?: boolean;
  autoStartOnLaunch?: boolean;
  maskSensitiveData: boolean;
  language: 'en';
}

export interface HistorySettings {
  maxRecords?: number;
  maxStoredRecords?: number;
  retentionDays: number;
  autoExportCSV?: boolean;
  autoExportJSON?: boolean;
}

export interface AppSettings {
  network: NetworkSettings;
  display: DisplaySettings;
  history: HistorySettings;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  testMode?: string;
  avgDownloadSpeedBps?: number;
  peakDownloadSpeedBps?: number;
  avgUploadSpeedBps: number;
  peakUploadSpeedBps: number;
  finalStableSpeedBps: number;
  durationSeconds: number;
  workerCount?: number;
  protocol?: string;
  downloadBytes?: number;
  uploadBytes?: number;
  transferredBytes: number;
  serverConfirmedBytes: number;
  serverConfirmedRatio: number;
  latencyMs: number;
  jitterMs?: number;
  minLatencyMs?: number;
  maxLatencyMs?: number;
  clientIP: string;
  isp?: string;
  server: {
    id: string;
    name: string;
    sponsor: string;
    country: string;
    city: string;
    distance: number;
    latency: number;
    jitterMs?: number;
    minLatency?: number;
    maxLatency?: number;
    host: string;
    url?: string;
    available?: boolean;
  };
  effectiveSettings: NetworkSettings;
}

export interface LocaleData {
  languageCode: 'en';
  direction: 'ltr';
  strings: Record<string, string>;
}

declare global {
  interface Window {
    go?: any;
    runtime?: any;
  }
}

export type TestState =
  | 'idle'
  | 'discovering_servers'
  | 'measuring_latency'
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
  instantaneousSpeedBps: number;
  peakSpeedBps: number;
  averageSpeedBps: number;
  transferredBytes: number;
  serverConfirmedBytes: number;
  serverConfirmedRatio: number;
  elapsedSeconds: number;
  estimatedRemainingSeconds: number;
  activeWorkers: number;
  latencyMs: number;
}

export interface ServerInfo {
  id: string;
  name: string;
  sponsor: string;
  country: string;
  city: string;
  distance: number;
  latencyMs: number;
  url: string;
  host: string;
  available: boolean;
}

export interface NetworkSettings {
  durationSeconds: number;
  customDurationSeconds: number;
  workerCount: number;
  protocol: 'http' | 'tcp';
  latencyMode: 'http' | 'tcp' | 'icmp';
  savingMode: boolean;
  proxyURL: string;
  sourceIP: string;
  dnsBindSource: boolean;
  userAgent: string;
  virtualCity: string;
  latitude: number;
  longitude: number;
  serverSearchKeyword: string;
  countryCodeFilter: string;
  serverSelectionMode: 'auto' | 'manual' | 'custom';
  selectedServerID: string;
  customServerURL: string;
}

export interface DisplaySettings {
  speedUnit: 'Mbps' | 'MBps' | 'kbps' | 'kBps';
  decimalPrecision: number;
  theme: 'system' | 'dark' | 'light';
  enableMica: boolean;
  reducedMotion: boolean;
  showLiveChart: boolean;
  chartRetentionPoints: number;
  maskSensitiveData: boolean;
  completionNotification: boolean;
  language: 'en' | 'fa';
}

export interface HistorySettings {
  maxRecords: number;
  autoPrune: boolean;
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
  avgUploadSpeedBps: number;
  peakUploadSpeedBps: number;
  finalStableSpeedBps: number;
  durationSeconds: number;
  transferredBytes: number;
  serverConfirmedBytes: number;
  serverConfirmedRatio: number;
  latencyMs: number;
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
    host: string;
  };
  effectiveSettings: NetworkSettings;
}

export interface LocaleData {
  languageCode: 'en' | 'fa';
  direction: 'ltr' | 'rtl';
  strings: Record<string, string>;
}

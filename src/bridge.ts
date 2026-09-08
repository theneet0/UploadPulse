import { AppSettings, HistoryRecord, LiveMetrics, LocaleData, ProxyTestResult, ServerInfo, StateInfo } from './types';
import { discoverRealServers, GLOBAL_SERVERS, pingTargetServer, RealSpeedTestEngine } from './speedtest';
import { isAndroid, isWails } from './platform';

export { isAndroid, isWails };
export const ENGLISH_LOCALE: LocaleData = {
  languageCode: 'en',
  direction: 'ltr',
  strings: {
    app_title: 'UploadPulse & SpeedTest Suite',
    nav_test: 'Speed Test',
    nav_servers: 'Servers',
    nav_history: 'History',
    nav_settings: 'Settings',
    nav_privacy: 'Privacy',
    start_test: 'Start Speed Test',
    stop_test: 'Stop Test',
    mode_both: 'Download & Upload',
    mode_download: 'Download',
    mode_upload: 'Upload',
    state_idle: 'Ready to test',
    state_discovering: 'Discovering servers...',
    state_measuring_latency: 'Measuring latency & jitter...',
    state_downloading: 'Downloading...',
    state_uploading: 'Uploading...',
    state_completed: 'Test completed',
    state_cancelled: 'Test cancelled',
    state_failed: 'Test failed',
    meter_current: 'Current Speed',
    meter_peak: 'Peak Speed',
    meter_average: 'Average Speed',
    meter_download: 'Download Speed',
    meter_upload: 'Upload Speed',
    meter_latency: 'Latency (Ping)',
    meter_jitter: 'Jitter',
    meter_confirmed_data: 'Server-confirmed data',
    meter_transmitted_data: 'Transmitted Volume',
    meter_workers: 'Active Connections',
    server_auto: 'Automatic Server Selection',
    server_manual: 'Manual Selection',
    server_custom: 'Custom Server URL',
    server_search_placeholder: 'Search servers by city, sponsor, or ID...',
    server_custom_placeholder: 'https://custom-server.com/speedtest/upload.php',
    copy_result: 'Copy Result',
    copy_with_server: 'Copy with Server Details',
    copied_toast: 'Result copied to clipboard',
    repeat_test: 'Repeat Test',
    delete_record: 'Delete Record',
    clear_history: 'Clear All History',
    clear_confirm_title: 'Clear Test History',
    clear_confirm_msg: 'Are you sure you want to permanently delete all recorded test history? This action cannot be undone.',
    export_csv: 'Export CSV',
    export_json: 'Export JSON',
    history_empty: 'No speed tests recorded yet.',
    settings_network: 'Network Configuration',
    settings_test_mode: 'Test Mode',
    settings_duration: 'Test Duration (seconds)',
    settings_workers: 'Concurrent Connection Threads',
    settings_workers_auto: 'Auto (Default 8)',
    settings_protocol: 'Test Protocol',
    settings_latency_mode: 'Latency Mode',
    settings_jitter_samples: 'Jitter Ping Samples',
    settings_ip_version: 'IP Protocol Version',
    settings_warmup: 'Warm-up Phase (seconds)',
    settings_saving_mode: 'Saving Mode (reduces bandwidth)',
    settings_proxy: 'Proxy URL (http/https/socks5)',
    settings_source_ip: 'Source IP (local interface IPv4/IPv6)',
    settings_custom_dns: 'Custom DNS Resolver (e.g. 1.1.1.1:53)',
    settings_user_agent: 'Custom User-Agent',
    settings_virtual_city: 'Virtual City Name',
    settings_coordinates: 'Virtual Coordinates (Lat / Lon)',
    settings_server_filter: 'Server Search Filter Keyword',
    settings_country_filter: 'Country ISO Code (e.g. US, DE, IR)',
    settings_display: 'Display Preferences',
    settings_speed_unit: 'Speed Unit',
    settings_precision: 'Decimal Precision',
    settings_theme: 'Theme',
    settings_mica: 'Enable Windows 11 Mica Backdrop',
    settings_reduced_motion: 'Reduced Motion',
    settings_chart: 'Show Live Throughput Chart',
    settings_chart_points: 'Chart Data Points Retention',
    settings_sound_alert: 'Play Audio Alert on Completion',
    settings_auto_start: 'Auto-start Test on App Launch',
    settings_privacy_mask: 'Mask IP and Sensitive Information',
    settings_language: 'Language',
    privacy_title: 'Privacy & Traffic Notice',
    privacy_body_1: 'UploadPulse is an advanced, high-precision speed test suite. It supports full download, upload, jitter, and latency benchmarks according to your selected configuration.',
    privacy_body_2: 'Tests saturate your downstream and upstream connections with random binary payloads to accurately measure network throughput and buffer bloat.',
    privacy_body_3: 'UploadPulse contains zero telemetry, zero analytics, zero advertisements, and no cloud accounts. All settings and history remain strictly on your device in %LOCALAPPDATA%\\UploadPulse.',
    unavailable: 'Unavailable',
    save_settings: 'Save Settings',
    settings_saved: 'Settings saved successfully',
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  network: {
    testMode: 'both',
    durationSeconds: 15,
    workerCount: 8,
    protocol: 'http',
    latencyMode: 'http',
    jitterSampleCount: 10,
    ipVersion: 'auto',
    warmupSeconds: 0,
    savingMode: false,
    proxyURL: '',
    sourceIP: '',
    customDNSServer: '',
    userAgent: 'UploadPulse/2.0.0 (Windows 11 x64; Advanced SpeedTest Suite)',
    virtualCity: '',
    latitude: 0,
    longitude: 0,
    serverSearchKeyword: '',
    countryFilter: '',
    serverSelectionMode: 'auto',
    selectedServerID: '',
    customServerURL: '',
  },
  display: {
    speedUnit: 'Mbps',
    decimalPrecision: 2,
    theme: 'system',
    enableMica: true,
    reducedMotion: false,
    showLiveChart: true,
    chartRetentionPoints: 40,
    completionNotification: true,
    soundAlert: true,
    autoStartOnLaunch: false,
    maskSensitiveData: false,
    language: 'en',
  },
  history: {
    maxRecords: 100,
    retentionDays: 90,
  },
};

// Fallback state for preview mode
let previewSettings: AppSettings = (() => {
  try {
    const raw = localStorage.getItem('uploadpulse_settings');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SETTINGS;
})();

let previewHistory: HistoryRecord[] = (() => {
  try {
    const raw = localStorage.getItem('uploadpulse_history');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
})();

const eventListeners: Record<string, ((...args: any[]) => void)[]> = {};

const realSpeedEngine = new RealSpeedTestEngine((event, ...args) => {
  Bridge.emit(event, ...args);
});

export const Bridge = {
  async getSettings(): Promise<AppSettings> {
    if (isWails) {
      return window.go!.main.App.GetSettings();
    }
    return previewSettings;
  },

  async updateSettings(settings: AppSettings): Promise<AppSettings> {
    if (isWails) {
      return window.go!.main.App.UpdateSettings(settings);
    }
    previewSettings = settings;
    localStorage.setItem('uploadpulse_settings', JSON.stringify(settings));
    return previewSettings;
  },

  async getHistory(): Promise<HistoryRecord[]> {
    if (isWails) {
      return window.go!.main.App.GetHistory();
    }
    return previewHistory;
  },

  async queryHistory(search: string, sortBy: string, desc: boolean): Promise<HistoryRecord[]> {
    if (isWails) {
      return window.go!.main.App.QueryHistory(search, sortBy, desc);
    }
    let res = [...previewHistory];
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(
        (r) =>
          r.server.name.toLowerCase().includes(q) ||
          r.server.sponsor.toLowerCase().includes(q) ||
          r.server.city.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }
    res.sort((a, b) => {
      let valA: any = a.timestamp;
      let valB: any = b.timestamp;
      if (sortBy === 'speed') {
        valA = a.avgUploadSpeedBps;
        valB = b.avgUploadSpeedBps;
      } else if (sortBy === 'latency') {
        valA = a.latencyMs;
        valB = b.latencyMs;
      }
      if (valA < valB) return desc ? 1 : -1;
      if (valA > valB) return desc ? -1 : 1;
      return 0;
    });
    return res;
  },

  async deleteHistoryRecord(id: string): Promise<void> {
    if (isWails) {
      return window.go!.main.App.DeleteHistoryRecord(id);
    }
    previewHistory = previewHistory.filter((r) => r.id !== id);
    localStorage.setItem('uploadpulse_history', JSON.stringify(previewHistory));
  },

  async clearHistory(): Promise<void> {
    if (isWails) {
      return window.go!.main.App.ClearHistory();
    }
    previewHistory = [];
    localStorage.setItem('uploadpulse_history', JSON.stringify([]));
  },

  async exportCSV(): Promise<string> {
    if (isWails) {
      return window.go!.main.App.ExportCSV();
    }
    const headers = [
      'RecordID',
      'Timestamp',
      'Success',
      'AvgUploadSpeed_Bps',
      'PeakUploadSpeed_Bps',
      'Latency_ms',
      'Transferred_Bytes',
      'ServerConfirmed_Bytes',
      'Duration_s',
      'ServerName',
      'ServerCity',
      'ServerCountry',
      'ClientIP',
    ];
    const rows = previewHistory.map((r) => [
      r.id,
      r.timestamp,
      r.success ? 'true' : 'false',
      r.avgUploadSpeedBps,
      r.peakUploadSpeedBps,
      r.latencyMs,
      r.transferredBytes,
      r.serverConfirmedBytes,
      r.durationSeconds,
      r.server.name,
      r.server.city,
      r.server.country,
      r.clientIP,
    ]);
    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },

  async exportJSON(): Promise<string> {
    if (isWails) {
      return window.go!.main.App.ExportJSON();
    }
    return JSON.stringify(previewHistory, null, 2);
  },

  async copySummary(recordID: string, includeServer: boolean): Promise<string> {
    if (isWails) {
      return window.go!.main.App.CopySummary(recordID, includeServer);
    }
    const r = previewHistory.find((rec) => rec.id === recordID) || previewHistory[0];
    if (!r) return 'UploadPulse Result: No test recorded.';
    const mbps = (r.avgUploadSpeedBps / 1000000).toFixed(2);
    const peak = (r.peakUploadSpeedBps / 1000000).toFixed(2);
    let s = `UploadPulse Pure Upload Test Result\n=====================================\nAverage Upload Speed : ${mbps} Mbps\nPeak Upload Speed    : ${peak} Mbps\nLatency (Ping)       : ${r.latencyMs} ms\nTransferred Volume   : ${(r.transferredBytes / 1048576).toFixed(2)} MB\nTimestamp            : ${r.timestamp}\nDuration             : ${r.durationSeconds}s`;
    if (includeServer && r.server) {
      s += `\nServer               : ${r.server.name} (${r.server.city}, ${r.server.country})`;
    }
    return s;
  },

  async discoverServers(): Promise<ServerInfo[]> {
    if (isWails) {
      return window.go!.main.App.DiscoverServers();
    }
    return discoverRealServers();
  },

  async pingServer(serverID: string): Promise<number> {
    if (isWails) {
      return window.go!.main.App.PingServer(serverID);
    }
    const found = GLOBAL_SERVERS.find((s) => s.id === serverID);
    return pingTargetServer(found ? found.url : undefined);
  },

  async validateCustomServer(customURL: string): Promise<ServerInfo> {
    if (isWails) {
      return window.go!.main.App.ValidateCustomServer(customURL);
    }
    const rtt = await pingTargetServer(customURL);
    let host = customURL;
    try {
      host = new URL(customURL).host;
    } catch (e) {}
    return {
      id: 'custom-1',
      name: 'Custom Target Server',
      sponsor: 'Private Server Endpoint',
      country: 'Direct Route',
      city: 'Custom Target',
      distance: 0,
      latencyMs: rtt,
      url: customURL,
      host,
      available: rtt < 990,
    };
  },

  async startTest(): Promise<any> {
    if (isWails) {
      return window.go!.main.App.StartTest();
    }
    return this.runRealTest(previewSettings.network.testMode || 'both');
  },

  async startDownloadTest(): Promise<any> {
    if (isWails && window.go?.main?.App?.StartDownloadTest) {
      return window.go.main.App.StartDownloadTest();
    }
    return this.runRealTest('download');
  },

  async startUploadTest(): Promise<any> {
    if (isWails && window.go?.main?.App?.StartUploadTest) {
      return window.go.main.App.StartUploadTest();
    }
    return this.runRealTest('upload');
  },

  async runRealTest(mode: 'both' | 'download' | 'upload'): Promise<any> {
    const selectedServer = previewSettings.network.selectedServerID
      ? GLOBAL_SERVERS.find((s) => s.id === previewSettings.network.selectedServerID)
      : undefined;

    const record = await realSpeedEngine.runTest(mode, previewSettings, selectedServer);
    if (record) {
      previewHistory.unshift(record);
      try {
        localStorage.setItem('uploadpulse_history', JSON.stringify(previewHistory));
      } catch (e) {}
    }
    return record;
  },

  async cancelTest(): Promise<void> {
    if (isWails) {
      return window.go!.main.App.CancelTest();
    }
    realSpeedEngine.cancelTest();
  },

  async getLocale(_lang?: string): Promise<LocaleData> {
    if (isWails && window.go?.main?.App?.GetLocale) {
      return window.go.main.App.GetLocale('en');
    }
    return ENGLISH_LOCALE;
  },

  async testProxyConnection(proxyURL: string): Promise<ProxyTestResult> {
    if (isWails && window.go?.main?.App?.TestProxyConnection) {
      return window.go.main.App.TestProxyConnection(proxyURL);
    }
    // Web preview simulation:
    const trimmed = (proxyURL || '').trim();
    if (!trimmed) {
      return { success: false, latencyMs: 0, exitIp: '', message: 'Proxy URL is empty.' };
    }
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      latencyMs: 42,
      exitIp: '104.28.19.88 (V2Ray Simulated)',
      message: `SOCKS5 connection verified! Exit IP: 104.28.19.88 (Ping: 42 ms)`,
    };
  },

  on(eventName: string, cb: (...args: any[]) => void) {
    if (isWails && window.runtime?.EventsOn) {
      window.runtime.EventsOn(eventName, cb);
      return;
    }
    if (!eventListeners[eventName]) {
      eventListeners[eventName] = [];
    }
    eventListeners[eventName].push(cb);
  },

  emit(eventName: string, ...args: any[]) {
    if (isWails && window.runtime?.EventsEmit) {
      window.runtime.EventsEmit(eventName, ...args);
      return;
    }
    const list = eventListeners[eventName];
    if (list) {
      list.forEach((cb) => cb(...args));
    }
  },
};

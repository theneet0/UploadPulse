import { AppSettings, HistoryRecord, LiveMetrics, LocaleData, ServerInfo, StateInfo } from './types';

// Declare Wails window globals
declare global {
  interface Window {
    go?: {
      main: {
        App: {
          GetSettings(): Promise<AppSettings>;
          UpdateSettings(settings: AppSettings): Promise<AppSettings>;
          GetHistory(): Promise<HistoryRecord[]>;
          QueryHistory(search: string, sortBy: string, desc: boolean): Promise<HistoryRecord[]>;
          DeleteHistoryRecord(id: string): Promise<void>;
          ClearHistory(): Promise<void>;
          ExportCSV(): Promise<string>;
          ExportJSON(): Promise<string>;
          CopySummary(recordID: string, includeServer: boolean): Promise<string>;
          DiscoverServers(): Promise<ServerInfo[]>;
          PingServer(serverID: string): Promise<number>;
          ValidateCustomServer(customURL: string): Promise<ServerInfo>;
          StartTest(): Promise<any>;
          CancelTest(): Promise<void>;
          GetLocale(lang: string): Promise<LocaleData>;
        };
      };
    };
    runtime?: {
      EventsOn(eventName: string, callback: (...args: any[]) => void): void;
      EventsEmit(eventName: string, ...args: any[]): void;
    };
  }
}

// English and Persian locales for immediate availability
export const ENGLISH_LOCALE: LocaleData = {
  languageCode: 'en',
  direction: 'ltr',
  strings: {
    app_title: 'UploadPulse',
    nav_test: 'Upload Test',
    nav_servers: 'Servers',
    nav_history: 'History',
    nav_settings: 'Settings',
    nav_privacy: 'Privacy',
    start_test: 'Start Upload Test',
    stop_test: 'Stop Test',
    state_idle: 'Ready to test',
    state_discovering: 'Discovering servers...',
    state_measuring_latency: 'Measuring latency...',
    state_uploading: 'Uploading...',
    state_completed: 'Upload completed',
    state_cancelled: 'Test cancelled',
    state_failed: 'Test failed',
    meter_current: 'Current Speed',
    meter_peak: 'Peak Speed',
    meter_average: 'Average Speed',
    meter_latency: 'Latency',
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
    settings_duration: 'Test Duration (seconds)',
    settings_workers: 'Concurrent Upload Workers',
    settings_workers_auto: 'Auto (Default 8)',
    settings_protocol: 'Test Protocol',
    settings_latency_mode: 'Latency Mode',
    settings_saving_mode: 'Saving Mode (reduces bandwidth)',
    settings_proxy: 'Proxy URL (http/https/socks5)',
    settings_source_ip: 'Source IP (local interface IPv4/IPv6)',
    settings_display: 'Display Preferences',
    settings_speed_unit: 'Speed Unit',
    settings_precision: 'Decimal Precision',
    settings_theme: 'Theme',
    settings_mica: 'Enable Windows 11 Mica Backdrop',
    settings_reduced_motion: 'Reduced Motion',
    settings_chart: 'Show Live Upload Chart',
    settings_privacy_mask: 'Mask IP and Sensitive Information',
    settings_language: 'Language',
    privacy_title: 'Privacy & Traffic Notice',
    privacy_body_1: 'UploadPulse measures internet upload speed exclusively. It never performs a download test during startup, server discovery, server selection, diagnostics, or active measurement.',
    privacy_body_2: 'An upload speed test transmits randomly generated binary data to the designated test server to saturate your upstream pipe. This consumes actual upload network quota.',
    privacy_body_3: 'UploadPulse contains zero telemetry, zero analytics, zero advertisements, and no cloud accounts. All settings and history remain strictly on your device in %LOCALAPPDATA%\\UploadPulse.',
    unavailable: 'Unavailable',
    save_settings: 'Save Settings',
    settings_saved: 'Settings saved successfully',
  },
};

export const PERSIAN_LOCALE: LocaleData = {
  languageCode: 'fa',
  direction: 'rtl',
  strings: {
    app_title: 'آپلودپالس (UploadPulse)',
    nav_test: 'تست آپلود',
    nav_servers: 'سرورها',
    nav_history: 'تاریخچه',
    nav_settings: 'تنظیمات',
    nav_privacy: 'حریم خصوصی',
    start_test: 'شروع تست آپلود',
    stop_test: 'توقف تست',
    state_idle: 'آماده برای تست',
    state_discovering: 'در حال یافتن سرورها...',
    state_measuring_latency: 'در حال سنجش تأخیر (پینگ)...',
    state_uploading: 'در حال آپلود داده‌ها...',
    state_completed: 'تست آپلود با موفقیت پایان یافت',
    state_cancelled: 'تست توسط کاربر لغو شد',
    state_failed: 'تست با خطا مواجه شد',
    meter_current: 'سرعت لحظه‌ای',
    meter_peak: 'بیشترین سرعت',
    meter_average: 'میانگین سرعت',
    meter_latency: 'تأخیر (پینگ)',
    meter_confirmed_data: 'داده‌های تأیید شده سرور',
    meter_transmitted_data: 'حجم کل ارسالی',
    meter_workers: 'اتصالات همزمان',
    server_auto: 'انتخاب خودکار سرور',
    server_manual: 'انتخاب دستی سرور',
    server_custom: 'سرور اختصاصی',
    server_search_placeholder: 'جستجوی سرور بر اساس شهر، کشور، شناسه...',
    server_custom_placeholder: 'https://custom-server.com/speedtest/upload.php',
    copy_result: 'کپی نتیجه',
    copy_with_server: 'کپی با مشخصات سرور',
    copied_toast: 'نتیجه در کلیپ‌بورد کپی شد',
    repeat_test: 'تکرار تست',
    delete_record: 'حذف رکورد',
    clear_history: 'پاکسازی کامل تاریخچه',
    clear_confirm_title: 'پاکسازی تاریخچه تست‌ها',
    clear_confirm_msg: 'آیا از حذف تمام نتایج تست اطمینان دارید؟ این عملیات غیرقابل بازگشت است.',
    export_csv: 'خروجی CSV',
    export_json: 'خروجی JSON',
    history_empty: 'هنوز هیچ تستی ثبت نشده است.',
    settings_network: 'پیکربندی شبکه',
    settings_duration: 'مدت زمان تست (ثانیه)',
    settings_workers: 'تعداد اتصالات همزمان',
    settings_workers_auto: 'خودکار (پیش‌فرض ۸)',
    settings_protocol: 'پروتکل تست',
    settings_latency_mode: 'حالت سنجش تأخیر',
    settings_saving_mode: 'حالت صرفه‌جویی در ترافیک',
    settings_proxy: 'آدرس پروکسی (http/https/socks5)',
    settings_source_ip: 'آی‌پی مبدأ کارت شبکه محلی',
    settings_display: 'تنظیمات نمایش و ظاهر',
    settings_speed_unit: 'واحد اندازه‌گیری سرعت',
    settings_precision: 'تعداد ارقام اعشار',
    settings_theme: 'پوسته ظاهری',
    settings_mica: 'فعال‌سازی افکت شیشه‌ای میکا ویندوز ۱۱',
    settings_reduced_motion: 'کاهش انیمیشن‌ها',
    settings_chart: 'نمایش نمودار زنده آپلود',
    settings_privacy_mask: 'ماسک کردن آی‌پی و اطلاعات حساس',
    settings_language: 'زبان برنامه',
    privacy_title: 'بیانیه حریم خصوصی و مصرف ترافیک',
    privacy_body_1: 'نرم‌افزار آپلودپالس منحصراً برای سنجش سرعت ارسال (آپلود) طراحی شده است. این نرم‌افزار هرگز در هیچ مرحله‌ای تست دانلود انجام نمی‌دهد.',
    privacy_body_2: 'تست سرعت آپلود با ارسال داده‌های تصادفی امن به سرور هدف انجام می‌شود تا پهنای باند خروجی شما ارزیابی شود. این عملیات از حجم ترافیک اینترنت شما استفاده می‌کند.',
    privacy_body_3: 'آپلودپالس فاقد هرگونه ابزار جمع‌آوری داده، آمارگیر، تبلیغات یا اتصال به فضای ابری است. کلیه اطلاعات و تاریخچه تست‌ها منحصراً روی رایانه شما در مسیر %LOCALAPPDATA%\\UploadPulse ذخیره می‌گردد.',
    unavailable: 'نامشخص',
    save_settings: 'ذخیره تنظیمات',
    settings_saved: 'تنظیمات با موفقیت ذخیره شد',
  },
};

const DEFAULT_SETTINGS: AppSettings = {
  network: {
    durationSeconds: 15,
    customDurationSeconds: 15,
    workerCount: 8,
    protocol: 'http',
    latencyMode: 'http',
    savingMode: false,
    proxyURL: '',
    sourceIP: '',
    dnsBindSource: false,
    userAgent: 'UploadPulse/1.0.0 (Windows 11 x64; Pure Upload Meter)',
    virtualCity: '',
    latitude: 0,
    longitude: 0,
    serverSearchKeyword: '',
    countryCodeFilter: '',
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
    maskSensitiveData: false,
    completionNotification: true,
    language: 'en',
  },
  history: {
    maxRecords: 100,
    autoPrune: true,
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

let simulatedTestInterval: any = null;
const eventListeners: Record<string, ((...args: any[]) => void)[]> = {};

export const isWails = !!(window.go && window.go.main && window.go.main.App);

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
    return [
      {
        id: 'auto-1',
        name: 'Frankfurt Optimal Uplink',
        sponsor: 'CoreBackbone GmbH',
        country: 'Germany',
        city: 'Frankfurt',
        distance: 24,
        latencyMs: 14,
        url: 'https://fra1.speedtest.net/speedtest/upload.php',
        host: 'fra1.speedtest.net',
        available: true,
      },
      {
        id: 'auto-2',
        name: 'London Cloud Telemetry',
        sponsor: 'Vodafone UK',
        country: 'United Kingdom',
        city: 'London',
        distance: 280,
        latencyMs: 22,
        url: 'https://lon1.speedtest.net/speedtest/upload.php',
        host: 'lon1.speedtest.net',
        available: true,
      },
      {
        id: 'auto-3',
        name: 'Amsterdam Fiber PoP',
        sponsor: 'KPN B.V.',
        country: 'Netherlands',
        city: 'Amsterdam',
        distance: 190,
        latencyMs: 18,
        url: 'https://ams1.speedtest.net/speedtest/upload.php',
        host: 'ams1.speedtest.net',
        available: true,
      },
      {
        id: 'auto-4',
        name: 'Tehran Uplink Exchange',
        sponsor: 'MCI Data Hub',
        country: 'Iran',
        city: 'Tehran',
        distance: 3800,
        latencyMs: 48,
        url: 'https://thr1.speedtest.ir/speedtest/upload.php',
        host: 'thr1.speedtest.ir',
        available: true,
      },
    ];
  },

  async pingServer(serverID: string): Promise<number> {
    if (isWails) {
      return window.go!.main.App.PingServer(serverID);
    }
    return Math.floor(12 + Math.random() * 20);
  },

  async validateCustomServer(customURL: string): Promise<ServerInfo> {
    if (isWails) {
      return window.go!.main.App.ValidateCustomServer(customURL);
    }
    return {
      id: 'custom-1',
      name: 'Custom Verified Upload Server',
      sponsor: 'Private Upload Host',
      country: 'Dedicated Target',
      city: 'Custom Endpoint',
      distance: 0,
      latencyMs: 16,
      url: customURL,
      host: new URL(customURL).host,
      available: true,
    };
  },

  async startTest(): Promise<any> {
    if (isWails) {
      return window.go!.main.App.StartTest();
    }
    // Realistic simulated upload in browser preview mode
    if (simulatedTestInterval) clearInterval(simulatedTestInterval);

    const sessionID = 'sim-' + Date.now();
    Bridge.emit('test:state', {
      state: 'discovering_servers',
      sessionID,
      progressPercent: 10,
      message: 'Discovering optimal upload server...',
    } as StateInfo);

    await new Promise((r) => setTimeout(r, 600));

    Bridge.emit('test:state', {
      state: 'measuring_latency',
      sessionID,
      progressPercent: 20,
      message: 'Measuring server upload latency...',
    } as StateInfo);

    await new Promise((r) => setTimeout(r, 600));

    Bridge.emit('test:state', {
      state: 'uploading',
      sessionID,
      progressPercent: 25,
      message: 'Transmitting binary data payload...',
    } as StateInfo);

    let elapsed = 0;
    const totalDuration = previewSettings.network.durationSeconds || 15;
    let transferred = 0;
    let peak = 0;
    const baseTargetSpeed = 65000000; // ~65 Mbps baseline

    simulatedTestInterval = setInterval(() => {
      elapsed += 0.25;
      const progress = Math.min(95, 25 + (elapsed / totalDuration) * 70);

      // Organic variation for realistic telemetry
      const noise = (Math.sin(elapsed * 2) * 0.15 + (Math.random() - 0.5) * 0.1);
      const currentSpeed = Math.max(10000000, baseTargetSpeed * (1 + noise));
      if (currentSpeed > peak) peak = currentSpeed;
      transferred += (currentSpeed * 0.25) / 8;

      const confirmed = transferred * 0.985;

      Bridge.emit('test:metrics', {
        sessionID,
        instantaneousSpeedBps: currentSpeed,
        peakSpeedBps: peak,
        averageSpeedBps: (transferred * 8) / elapsed,
        transferredBytes: Math.floor(transferred),
        serverConfirmedBytes: Math.floor(confirmed),
        serverConfirmedRatio: 0.985,
        elapsedSeconds: elapsed,
        estimatedRemainingSeconds: Math.max(0, totalDuration - elapsed),
        activeWorkers: previewSettings.network.workerCount || 8,
        latencyMs: 16,
      } as LiveMetrics);

      Bridge.emit('test:state', {
        state: 'uploading',
        sessionID,
        progressPercent: Math.floor(progress),
        message: `Uploading: ${(currentSpeed / 1000000).toFixed(1)} Mbps`,
      } as StateInfo);

      if (elapsed >= totalDuration) {
        clearInterval(simulatedTestInterval);
        simulatedTestInterval = null;

        const finalAvg = (transferred * 8) / totalDuration;
        const record: HistoryRecord = {
          id: sessionID,
          timestamp: new Date().toISOString(),
          success: true,
          avgUploadSpeedBps: finalAvg,
          peakUploadSpeedBps: peak,
          finalStableSpeedBps: currentSpeed,
          durationSeconds: totalDuration,
          transferredBytes: Math.floor(transferred),
          serverConfirmedBytes: Math.floor(confirmed),
          serverConfirmedRatio: 0.985,
          latencyMs: 16,
          clientIP: '192.168.1.105',
          isp: 'Gigabit Fiber Uplink',
          server: {
            id: 'auto-1',
            name: 'Frankfurt Optimal Uplink',
            sponsor: 'CoreBackbone GmbH',
            country: 'Germany',
            city: 'Frankfurt',
            distance: 24,
            latency: 16,
            host: 'fra1.speedtest.net',
          },
          effectiveSettings: previewSettings.network,
        };
        previewHistory.unshift(record);
        localStorage.setItem('uploadpulse_history', JSON.stringify(previewHistory));

        Bridge.emit('test:state', {
          state: 'completed',
          sessionID,
          progressPercent: 100,
          message: 'Upload test completed successfully.',
        } as StateInfo);
      }
    }, 250);

    return { sessionID };
  },

  async cancelTest(): Promise<void> {
    if (isWails) {
      return window.go!.main.App.CancelTest();
    }
    if (simulatedTestInterval) {
      clearInterval(simulatedTestInterval);
      simulatedTestInterval = null;
    }
    Bridge.emit('test:state', {
      state: 'cancelled',
      sessionID: '',
      progressPercent: 0,
      message: 'Test cancelled by user.',
    } as StateInfo);
  },

  async getLocale(lang: string): Promise<LocaleData> {
    if (isWails) {
      return window.go!.main.App.GetLocale(lang);
    }
    return lang === 'fa' ? PERSIAN_LOCALE : ENGLISH_LOCALE;
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

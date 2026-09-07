import { AppSettings, HistoryRecord, LiveMetrics, LocaleData, ProxyTestResult, ServerInfo, StateInfo } from './types';

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
          StartDownloadTest(): Promise<any>;
          StartUploadTest(): Promise<any>;
          CancelTest(): Promise<void>;
          GetLocale(lang: string): Promise<LocaleData>;
          TestProxyConnection(proxyURL: string): Promise<ProxyTestResult>;
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
    app_title: 'UploadPulse & SpeedTest Suite',
    nav_test: 'Speed Test',
    nav_servers: 'Servers',
    nav_history: 'History',
    nav_settings: 'Settings',
    nav_privacy: 'Privacy',
    start_test: 'Start Speed Test',
    stop_test: 'Stop Test',
    mode_both: 'Download & Upload',
    mode_download: 'Download Only',
    mode_upload: 'Upload Only',
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

export const PERSIAN_LOCALE: LocaleData = {
  languageCode: 'fa',
  direction: 'rtl',
  strings: {
    app_title: 'آپلودپالس و آزمون سرعت اینترنت',
    nav_test: 'تست سرعت',
    nav_servers: 'سرورها',
    nav_history: 'تاریخچه',
    nav_settings: 'تنظیمات',
    nav_privacy: 'حریم خصوصی',
    start_test: 'شروع تست سرعت',
    stop_test: 'توقف تست',
    mode_both: 'تست دوگانه (دانلود و آپلود)',
    mode_download: 'فقط دانلود',
    mode_upload: 'فقط آپلود',
    state_idle: 'آماده برای تست',
    state_discovering: 'در حال یافتن سرورها...',
    state_measuring_latency: 'در حال سنجش پینگ و جیتر (Jitter)...',
    state_downloading: 'در حال دانلود داده‌ها...',
    state_uploading: 'در حال آپلود داده‌ها...',
    state_completed: 'تست با موفقیت پایان یافت',
    state_cancelled: 'تست توسط کاربر لغو شد',
    state_failed: 'تست با خطا مواجه شد',
    meter_current: 'سرعت لحظه‌ای',
    meter_peak: 'بیشترین سرعت',
    meter_average: 'میانگین سرعت',
    meter_download: 'سرعت دانلود',
    meter_upload: 'سرعت آپلود',
    meter_latency: 'تأخیر (پینگ)',
    meter_jitter: 'نوسان تأخیر (جیتر)',
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
    settings_test_mode: 'حالت سنجش سرعت',
    settings_duration: 'مدت زمان تست (ثانیه)',
    settings_workers: 'تعداد اتصالات همزمان',
    settings_workers_auto: 'خودکار (پیش‌فرض ۸)',
    settings_protocol: 'پروتکل تست',
    settings_latency_mode: 'حالت سنجش تأخیر',
    settings_jitter_samples: 'تعداد نمونه‌های اندازه‌گیری جیتر',
    settings_ip_version: 'نسخه پروتکل IP',
    settings_warmup: 'مدت زمان پیش‌گرمایش (ثانیه)',
    settings_saving_mode: 'حالت صرفه‌جویی در ترافیک',
    settings_proxy: 'آدرس پروکسی (http/https/socks5)',
    settings_source_ip: 'آی‌پی کارت شبکه محلی',
    settings_custom_dns: 'سرور DNS اختصاصی (مانند 1.1.1.1:53)',
    settings_user_agent: 'عامل کاربر (User-Agent)',
    settings_virtual_city: 'نام شهر مجازی',
    settings_coordinates: 'مختصات جغرافیایی مجازی (Lat / Lon)',
    settings_server_filter: 'کلمه کلیدی فیلتر سرورها',
    settings_country_filter: 'کد دوحرفی کشور (مانند IR, DE, US)',
    settings_display: 'تنظیمات نمایش و ظاهر',
    settings_speed_unit: 'واحد اندازه‌گیری سرعت',
    settings_precision: 'تعداد ارقام اعشار',
    settings_theme: 'پوسته ظاهری',
    settings_mica: 'فعال‌سازی افکت شیشه‌ای میکا ویندوز ۱۱',
    settings_reduced_motion: 'کاهش انیمیشن‌ها',
    settings_chart: 'نمایش نمودار زنده سرعت',
    settings_chart_points: 'تعداد نقاط ذخیره در نمودار',
    settings_sound_alert: 'پخش صدای هشدار در پایان تست',
    settings_auto_start: 'شروع خودکار تست هنگام اجرای برنامه',
    settings_privacy_mask: 'ماسک کردن آی‌پی و اطلاعات حساس',
    settings_language: 'زبان برنامه',
    privacy_title: 'بیانیه حریم خصوصی و مصرف ترافیک',
    privacy_body_1: 'نرم‌افزار آپلودپالس یک بسته کامل و بسیار دقیق سنجش سرعت است که از تست‌های دانلود، آپلود، پینگ و جیتر پشتیبانی می‌کند.',
    privacy_body_2: 'تست‌های سرعت جهت سنجش دقیق پهنای باند و نوسانات بافر شبکه، به ارسال و دریافت داده‌های امن تصادفی اقدام می‌کنند.',
    privacy_body_3: 'این نرم‌افزار فاقد هرگونه ابزار جمع‌آوری اطلاعات شخصی، آمارگیری یا تبلیغات است و کلیه اطلاعات فقط در رایانه شما ذخیره می‌گردد.',
    unavailable: 'نامشخص',
    save_settings: 'ذخیره تنظیمات',
    settings_saved: 'تنظیمات با موفقیت ذخیره شد',
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
    return this.runSimulatedTest(previewSettings.network.testMode || 'both');
  },

  async startDownloadTest(): Promise<any> {
    if (isWails && window.go?.main?.App?.StartDownloadTest) {
      return window.go.main.App.StartDownloadTest();
    }
    return this.runSimulatedTest('download');
  },

  async startUploadTest(): Promise<any> {
    if (isWails && window.go?.main?.App?.StartUploadTest) {
      return window.go.main.App.StartUploadTest();
    }
    return this.runSimulatedTest('upload');
  },

  async runSimulatedTest(mode: 'both' | 'download' | 'upload'): Promise<any> {
    if (simulatedTestInterval) clearInterval(simulatedTestInterval);

    const sessionID = 'sim-' + Date.now();
    Bridge.emit('test:state', {
      state: 'discovering_servers',
      sessionID,
      progressPercent: 8,
      message: 'Discovering optimal speedtest server...',
    } as StateInfo);

    await new Promise((r) => setTimeout(r, 450));

    Bridge.emit('test:state', {
      state: 'measuring_latency',
      sessionID,
      progressPercent: 18,
      message: 'Benchmarking latency & jitter (10 ping samples)...',
    } as StateInfo);

    const measuredLatency = 14.5;
    const measuredJitter = 2.1;

    await new Promise((r) => setTimeout(r, 450));

    const totalDuration = Math.max(5, previewSettings.network.durationSeconds || 15);
    const hasDownload = mode === 'both' || mode === 'download';
    const hasUpload = mode === 'both' || mode === 'upload';
    const phaseDuration = mode === 'both' ? totalDuration / 2 : totalDuration;

    let currentPhase: 'download' | 'upload' = hasDownload ? 'download' : 'upload';
    let phaseElapsed = 0;
    let totalElapsed = 0;

    let downTransferred = 0;
    let upTransferred = 0;
    let downPeak = 0;
    let upPeak = 0;

    const baseDownSpeed = 118000000; // ~118 Mbps
    const baseUpSpeed = 65000000;    // ~65 Mbps

    Bridge.emit('test:state', {
      state: currentPhase === 'download' ? 'downloading' : 'uploading',
      sessionID,
      progressPercent: 20,
      message: currentPhase === 'download' ? 'Testing download speed...' : 'Testing upload speed...',
    } as StateInfo);

    simulatedTestInterval = setInterval(() => {
      const step = 0.25;
      phaseElapsed += step;
      totalElapsed += step;

      const noise = Math.sin(phaseElapsed * 2) * 0.12 + (Math.random() - 0.5) * 0.08;
      let activeSpeed = 0;

      if (currentPhase === 'download') {
        activeSpeed = Math.max(20000000, baseDownSpeed * (1 + noise));
        if (activeSpeed > downPeak) downPeak = activeSpeed;
        downTransferred += (activeSpeed * step) / 8;
      } else {
        activeSpeed = Math.max(15000000, baseUpSpeed * (1 + noise));
        if (activeSpeed > upPeak) upPeak = activeSpeed;
        upTransferred += (activeSpeed * step) / 8;
      }

      const totalTransferred = downTransferred + upTransferred;
      const progress = Math.min(95, 20 + (totalElapsed / totalDuration) * 75);

      Bridge.emit('test:metrics', {
        sessionID,
        testMode: mode,
        phase: currentPhase,
        instantaneousSpeedBps: activeSpeed,
        peakSpeedBps: currentPhase === 'download' ? downPeak : upPeak,
        averageSpeedBps: currentPhase === 'download'
          ? (downTransferred * 8) / phaseElapsed
          : (upTransferred * 8) / phaseElapsed,
        transferredBytes: Math.floor(totalTransferred),
        downloadBytes: Math.floor(downTransferred),
        uploadBytes: Math.floor(upTransferred),
        serverConfirmedBytes: Math.floor(totalTransferred * 0.99),
        serverConfirmedRatio: 0.99,
        elapsedSeconds: totalElapsed,
        estimatedRemainingSeconds: Math.max(0, totalDuration - totalElapsed),
        activeWorkers: previewSettings.network.workerCount || 8,
        latencyMs: measuredLatency,
        jitterMs: measuredJitter,
        minLatencyMs: 13.1,
        maxLatencyMs: 18.2,
      } as LiveMetrics);

      Bridge.emit('test:state', {
        state: currentPhase === 'download' ? 'downloading' : 'uploading',
        sessionID,
        progressPercent: Math.floor(progress),
        message: `${currentPhase === 'download' ? 'Downloading' : 'Uploading'}: ${(activeSpeed / 1000000).toFixed(1)} Mbps`,
      } as StateInfo);

      // Phase Transition
      if (currentPhase === 'download' && hasUpload && phaseElapsed >= phaseDuration) {
        currentPhase = 'upload';
        phaseElapsed = 0;
        Bridge.emit('test:state', {
          state: 'uploading',
          sessionID,
          progressPercent: Math.floor(progress),
          message: 'Swapping to upload phase...',
        } as StateInfo);
        return;
      }

      if (totalElapsed >= totalDuration) {
        clearInterval(simulatedTestInterval);
        simulatedTestInterval = null;

        const avgDown = hasDownload ? (downTransferred * 8) / (hasUpload ? phaseDuration : totalDuration) : 0;
        const avgUp = hasUpload ? (upTransferred * 8) / (hasDownload ? phaseDuration : totalDuration) : 0;

        const record: HistoryRecord = {
          id: sessionID,
          timestamp: new Date().toISOString(),
          success: true,
          testMode: mode,
          avgDownloadSpeedBps: avgDown,
          peakDownloadSpeedBps: downPeak,
          avgUploadSpeedBps: avgUp,
          peakUploadSpeedBps: upPeak,
          finalStableSpeedBps: activeSpeed,
          durationSeconds: totalDuration,
          downloadBytes: Math.floor(downTransferred),
          uploadBytes: Math.floor(upTransferred),
          transferredBytes: Math.floor(totalTransferred),
          serverConfirmedBytes: Math.floor(totalTransferred * 0.99),
          serverConfirmedRatio: 0.99,
          latencyMs: measuredLatency,
          jitterMs: measuredJitter,
          minLatencyMs: 13.1,
          maxLatencyMs: 18.2,
          clientIP: '192.168.1.105',
          isp: 'Gigabit Fiber Uplink',
          server: {
            id: 'auto-1',
            name: 'Frankfurt Optimal Cloud Hub',
            sponsor: 'CoreBackbone Global',
            country: 'Germany',
            city: 'Frankfurt',
            distance: 24,
            latency: measuredLatency,
            jitterMs: measuredJitter,
            minLatency: 13.1,
            maxLatency: 18.2,
            host: 'fra1.speedtest.net',
          },
          effectiveSettings: { ...previewSettings.network, testMode: mode },
        };

        previewHistory.unshift(record);
        localStorage.setItem('uploadpulse_history', JSON.stringify(previewHistory));

        Bridge.emit('test:state', {
          state: 'completed',
          sessionID,
          progressPercent: 100,
          message: `Speed test (${mode.toUpperCase()}) completed successfully.`,
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

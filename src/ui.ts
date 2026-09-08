import { Bridge, ENGLISH_LOCALE } from './bridge';
import { LiveChart } from './chart';
import { AppSettings, HistoryRecord, LiveMetrics, LocaleData, ServerInfo, StateInfo } from './types';

export class AppUI {
  private container: HTMLElement;
  private settings: AppSettings;
  private locale: LocaleData = ENGLISH_LOCALE;
  private activeTab: 'test' | 'servers' | 'history' | 'settings' | 'privacy' = 'test';

  // Live test state
  private currentState: StateInfo = {
    state: 'idle',
    sessionID: '',
    progressPercent: 0,
    message: 'Ready to test',
  };
  private currentMetrics: LiveMetrics = {
    sessionID: '',
    instantaneousSpeedBps: 0,
    peakSpeedBps: 0,
    averageSpeedBps: 0,
    avgDownloadSpeedBps: 0,
    avgUploadSpeedBps: 0,
    transferredBytes: 0,
    downloadBytes: 0,
    uploadBytes: 0,
    serverConfirmedBytes: 0,
    serverConfirmedRatio: 1,
    elapsedSeconds: 0,
    estimatedRemainingSeconds: 0,
    activeWorkers: 8,
    latencyMs: 0,
    jitterMs: 0,
  };

  private liveChart: LiveChart | null = null;
  private serversList: ServerInfo[] = [];
  private historyList: HistoryRecord[] = [];
  private historySearchQuery: string = '';
  private historySortBy: string = 'date';
  private historySortDesc: boolean = true;
  private isTesting: boolean = false;

  constructor(container: HTMLElement, initialSettings: AppSettings) {
    this.container = container;
    this.settings = initialSettings;
  }

  public async init() {
    this.locale = await Bridge.getLocale('en');
    document.body.setAttribute('dir', 'ltr');

    // Bind Wails / preview events
    Bridge.on('test:state', (stateInfo: StateInfo) => {
      this.currentState = stateInfo;
      this.isTesting =
        stateInfo.state === 'discovering_servers' ||
        stateInfo.state === 'measuring_latency' ||
        stateInfo.state === 'downloading' ||
        stateInfo.state === 'uploading';

      this.updateStateBanner();
      this.updateActionButtons();
    });

    Bridge.on('test:metrics', (metrics: LiveMetrics) => {
      this.currentMetrics = metrics;
      this.updateMeterValues();
      if (this.liveChart && this.settings.display.showLiveChart) {
        this.liveChart.addDataPoint(metrics.instantaneousSpeedBps);
      }
    });

    // Render full layout
    this.render();

    // Fetch initial servers and history
    this.refreshHistory();
    this.refreshServers();
  }

  private t(key: string): string {
    return this.locale?.strings?.[key] || ENGLISH_LOCALE.strings[key] || key;
  }

  private formatSpeed(bps?: number): string {
    if (bps === undefined || bps === null || bps <= 0) {
      return `-- ${this.settings.display.speedUnit}`;
    }
    const unit = this.settings.display.speedUnit || 'Mbps';
    const prec = this.settings.display.decimalPrecision ?? 2;
    let val = 0;
    switch (unit) {
      case 'MBps':
        val = bps / 8000000;
        break;
      case 'kbps':
        val = bps / 1000;
        break;
      case 'kBps':
        val = bps / 8000;
        break;
      case 'Gbps':
        val = bps / 1000000000;
        break;
      case 'Mbps':
      default:
        val = bps / 1000000;
        break;
    }
    return `${val.toFixed(prec)} ${unit}`;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  }

  private render() {
    this.container.innerHTML = `
      <div id="uploadpulse-root" class="mica flex flex-col md:flex-row h-screen w-screen overflow-hidden text-[#ffffff] select-none">
        <!-- Mobile Top App Bar (Android Header) -->
        <header class="flex md:hidden items-center justify-between px-4 py-2 bg-[#2c2c2c] border-b border-white/10 shrink-0 z-20">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-[#60cdff]/15 flex items-center justify-center text-[#60cdff]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </div>
            <span class="text-xs font-bold tracking-wider uppercase text-white">UploadPulse</span>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded bg-[#60cdff]/15 text-[#60cdff] border border-[#60cdff]/30 font-mono font-medium">v1.0</span>
        </header>

        <!-- Sidebar Navigation (Desktop) / Bottom Tab Bar (Mobile Android) -->
        <aside id="app-sidebar" class="sidebar-panel flex flex-row md:flex-col justify-between items-center md:items-stretch p-1.5 md:p-3 shrink-0 order-2 md:order-1 z-30">
          <div class="hidden md:block">
            <!-- Sidebar Title Bar -->
            <div class="h-10 flex items-center gap-2.5 px-3 mb-3 border-b border-white/5">
              <div class="w-6 h-6 rounded-md bg-[#60cdff]/15 flex items-center justify-center text-[#60cdff]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </div>
              <span class="text-xs font-semibold tracking-wider uppercase text-white/90">UploadPulse</span>
              <span class="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#a0a0a0] border border-white/10 font-mono">Win & Android</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="flex flex-row md:flex-col justify-around md:justify-start w-full gap-0.5 md:gap-1 md:space-y-1">
            <button id="nav-test" class="nav-item flex-1 md:w-full ${this.activeTab === 'test' ? 'active' : ''}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span class="nav-label">${this.t('nav_test')}</span>
            </button>

            <button id="nav-servers" class="nav-item flex-1 md:w-full ${this.activeTab === 'servers' ? 'active' : ''}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span class="nav-label">${this.t('nav_servers')}</span>
            </button>

            <button id="nav-history" class="nav-item flex-1 md:w-full ${this.activeTab === 'history' ? 'active' : ''}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span class="nav-label">${this.t('nav_history')}</span>
            </button>

            <button id="nav-settings" class="nav-item flex-1 md:w-full ${this.activeTab === 'settings' ? 'active' : ''}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span class="nav-label">${this.t('nav_settings')}</span>
            </button>

            <button id="nav-privacy" class="nav-item flex-1 md:w-full ${this.activeTab === 'privacy' ? 'active' : ''}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span class="nav-label">${this.t('nav_privacy')}</span>
            </button>
          </div>

          <!-- Bottom Section: Notice (Desktop only) -->
          <div class="hidden md:block pt-3 border-t border-white/5 space-y-2">
            <div class="px-3 py-2 rounded bg-[#60cdff]/10 border border-[#60cdff]/20 text-[11px] text-[#60cdff] flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              <span class="leading-tight font-medium">High Precision Speed Engine</span>
            </div>
          </div>
        </aside>

        <!-- Main Viewport Area -->
        <div class="flex-1 flex flex-col relative overflow-hidden bg-[#202020] order-1 md:order-2">
          <!-- Dynamic Viewport -->
          <main id="view-viewport" class="flex-1 overflow-y-auto p-3 md:p-6 flex flex-col"></main>
        </div>

        <!-- Global Toast Container -->
        <div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
      </div>
    `;

    this.bindGlobalEvents();
    this.renderCurrentView();
  }

  private bindGlobalEvents() {
    ['test', 'servers', 'history', 'settings', 'privacy'].forEach((tab) => {
      const el = document.getElementById(`nav-${tab}`);
      if (el) {
        el.onclick = () => {
          this.activeTab = tab as any;
          this.render();
        };
      }
    });
  }

  private renderCurrentView() {
    const viewport = document.getElementById('view-viewport');
    if (!viewport) return;

    if (this.liveChart) {
      this.liveChart.destroy();
      this.liveChart = null;
    }

    switch (this.activeTab) {
      case 'test':
        this.renderTestView(viewport);
        break;
      case 'servers':
        this.renderServersView(viewport);
        break;
      case 'history':
        this.renderHistoryView(viewport);
        break;
      case 'settings':
        this.renderSettingsView(viewport);
        break;
      case 'privacy':
        this.renderPrivacyView(viewport);
        break;
    }
  }

  // ----------------------------------------------------------------------
  // VIEW: Speed Test (Geometric Balance Central Gauge with Multi-Mode)
  // ----------------------------------------------------------------------
  private renderTestView(viewport: HTMLElement) {
    const activeServerName =
      this.settings.network.serverSelectionMode === 'custom'
        ? this.settings.network.customServerURL || this.t('server_custom')
        : this.settings.network.serverSelectionMode === 'manual' && this.settings.network.selectedServerID
        ? `Server ID ${this.settings.network.selectedServerID}`
        : 'Frankfurt, Germany - CoreBackbone';

    const currentMode = this.settings.network.testMode || 'both';

    viewport.innerHTML = `
      <div class="max-w-4xl mx-auto w-full flex flex-col items-center justify-center space-y-6 my-auto">
        
        <!-- Top Mode Selector Segmented Control -->
        <div class="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs gap-1 shadow-inner">
          <button id="btn-mode-both" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            currentMode === 'both'
              ? 'bg-[#60cdff] text-black shadow font-semibold'
              : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
          }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>
            <span>Download & Upload</span>
          </button>
          <button id="btn-mode-download" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            currentMode === 'download'
              ? 'bg-[#60cdff] text-black shadow font-semibold'
              : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
          }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg>
            <span>Download</span>
          </button>
          <button id="btn-mode-upload" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            currentMode === 'upload'
              ? 'bg-[#60cdff] text-black shadow font-semibold'
              : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
          }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V4m0 0l-6 6m6-6l6 6"/></svg>
            <span>Upload</span>
          </button>
        </div>

        <!-- Status Badge -->
        <div id="status-badge" class="status-badge tracking-wider uppercase">
          ${this.currentState.message ? this.currentState.message.toUpperCase() : this.t('state_idle').toUpperCase()}
        </div>

        <!-- Geometric Central Gauge -->
        <div class="gauge-outer">
          <!-- Circular Progress SVG Ring -->
          <svg class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.06)" stroke-width="4.5" fill="none"/>
            <circle id="meter-circle-progress" cx="50" cy="50" r="44" stroke="#60cdff" stroke-width="4.5" stroke-dasharray="276.46" stroke-dashoffset="276.46" stroke-linecap="round" fill="none" class="transition-all duration-300 ease-out"/>
          </svg>

          <!-- Gauge Inner Values -->
          <div class="flex flex-col items-center justify-center z-10 text-center px-4">
            <div id="meter-phase-label" class="text-[11px] font-bold uppercase tracking-widest text-[#60cdff] mb-0.5">
              ${
                this.currentState.state === 'downloading'
                  ? 'DOWNLOADING'
                  : this.currentState.state === 'uploading'
                  ? 'UPLOADING'
                  : this.currentState.state === 'measuring_latency'
                  ? 'LATENCY & JITTER'
                  : currentMode === 'download'
                  ? 'DOWNLOAD TEST'
                  : currentMode === 'upload'
                  ? 'UPLOAD TEST'
                  : 'DUAL BENCHMARK'
              }
            </div>
            <div id="meter-current-speed" class="speed-value">0.00</div>
            <div id="meter-unit" class="speed-unit">${this.settings.display.speedUnit}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button id="btn-start-stop" class="theme-btn-primary ${this.isTesting ? 'theme-btn-stop' : ''}">
            <svg id="btn-action-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              ${
                this.isTesting
                  ? `<rect x="5" y="5" width="10" height="10" rx="1.5"/>`
                  : `<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>`
              }
            </svg>
            <span id="btn-action-text">${this.isTesting ? this.t('stop_test').toUpperCase() : this.t('start_test').toUpperCase()}</span>
          </button>

          <button id="btn-toggle-chart" class="theme-btn-secondary flex items-center gap-1.5" title="Toggle Live Chart">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
            <span>${this.settings.display.showLiveChart ? 'Hide Chart' : 'Show Chart'}</span>
          </button>
        </div>

        <!-- Metric Group: 4 Clean Geometric Cards (Download, Upload, Latency, Jitter) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          <!-- Download Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-amber-400"><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg>
                ${this.t('meter_download')}
              </span>
            </div>
            <div id="meter-download-speed" class="metric-value text-amber-400 text-lg font-mono my-1">
              -- ${this.settings.display.speedUnit}
            </div>
            <div id="meter-download-peak" class="text-[10px] text-[#a0a0a0] font-mono">
              Peak: --
            </div>
          </div>

          <!-- Upload Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-[#60cdff]"><path d="M12 20V4m0 0l-6 6m6-6l6 6"/></svg>
                ${this.t('meter_upload')}
              </span>
            </div>
            <div id="meter-upload-speed" class="metric-value text-[#60cdff] text-lg font-mono my-1">
              -- ${this.settings.display.speedUnit}
            </div>
            <div id="meter-upload-peak" class="text-[10px] text-[#a0a0a0] font-mono">
              Peak: --
            </div>
          </div>

          <!-- Latency Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-emerald-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${this.t('meter_latency')}
              </span>
            </div>
            <div id="meter-latency-val" class="metric-value text-emerald-400 text-lg font-mono my-1">
              ${this.currentMetrics.latencyMs ? this.currentMetrics.latencyMs + ' ms' : '-- ms'}
            </div>
            <div id="meter-latency-range" class="text-[10px] text-[#a0a0a0] font-mono">
              ${this.currentMetrics.minLatencyMs ? `Min: ${this.currentMetrics.minLatencyMs}ms` : 'Min/Max: --'}
            </div>
          </div>

          <!-- Jitter Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-purple-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                ${this.t('meter_jitter')}
              </span>
            </div>
            <div id="meter-jitter-val" class="metric-value text-purple-400 text-lg font-mono my-1">
              ${this.currentMetrics.jitterMs !== undefined ? this.currentMetrics.jitterMs + ' ms' : '-- ms'}
            </div>
            <div id="meter-jitter-quality" class="text-[10px] text-purple-300/80 font-mono">
              ${this.currentMetrics.jitterMs !== undefined ? (this.currentMetrics.jitterMs < 5 ? 'Excellent' : this.currentMetrics.jitterMs < 15 ? 'Good' : 'Fair') : 'Stability'}
            </div>
          </div>
        </div>

        <!-- Transferred Volume & Flow Summary Card -->
        <div class="w-full max-w-2xl grid grid-cols-3 gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
          <div class="text-center">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Downloaded</div>
            <div id="meter-data-down" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes(this.currentMetrics.downloadBytes || 0)}
            </div>
          </div>
          <div class="text-center border-x border-white/10">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Uploaded</div>
            <div id="meter-data-up" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes(this.currentMetrics.uploadBytes || this.currentMetrics.serverConfirmedBytes || 0)}
            </div>
          </div>
          <div class="text-center">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Total Volume</div>
            <div id="meter-data-total" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes(
                (this.currentMetrics.downloadBytes || 0) +
                  (this.currentMetrics.uploadBytes || this.currentMetrics.serverConfirmedBytes || 0)
              )}
            </div>
          </div>
        </div>

        <!-- SOCKS5 / V2Ray Status Badge if Configured -->
        ${
          this.settings.network.proxyURL
            ? `
          <div class="w-full max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-lg bg-[#60cdff]/10 border border-[#60cdff]/30 text-xs">
            <div class="flex items-center gap-2 text-[#60cdff]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              <span class="font-medium">SOCKS5 / V2Ray Proxy:</span>
              <span class="font-mono text-white/90 truncate max-w-xs">${this.settings.network.proxyURL}</span>
            </div>
            <button id="btn-quick-test-proxy" class="theme-btn-secondary text-[11px] px-2.5 py-1 flex items-center gap-1">
              Test Proxy
            </button>
          </div>
        `
            : ''
        }

        <!-- Server Info Card (Geometric Balance) -->
        <div class="w-full max-w-2xl flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div class="w-10 h-10 rounded-full bg-[#60cdff]/10 flex items-center justify-center text-[#60cdff] shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">${activeServerName}</div>
            <div class="text-xs text-[#a0a0a0] truncate">Mode: ${currentMode.toUpperCase()} &bull; ${this.settings.network.workerCount || 8} Active Connections ${this.settings.network.proxyURL ? '&bull; Via SOCKS5' : ''}</div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>
          </div>
        </div>

        <!-- Live Upload / Download Chart Container -->
        <div id="chart-panel" class="w-full max-w-2xl h-44 rounded-lg bg-white/[0.02] border border-white/[0.08] p-3 flex flex-col ${this.settings.display.showLiveChart ? '' : 'hidden'}">
          <div class="flex items-center justify-between text-[11px] text-[#a0a0a0] mb-2 px-1">
            <span class="font-medium text-white/80">Live Throughput Stream</span>
            <span class="text-[10px] font-mono text-[#60cdff]">${this.settings.display.speedUnit} / time</span>
          </div>
          <div id="chart-canvas-wrapper" class="flex-1 w-full h-full relative overflow-hidden"></div>
        </div>
      </div>
    `;

    // Mode Selector Buttons
    const btnModeBoth = document.getElementById('btn-mode-both');
    const btnModeDown = document.getElementById('btn-mode-download');
    const btnModeUp = document.getElementById('btn-mode-upload');

    const switchMode = async (m: 'both' | 'download' | 'upload') => {
      this.settings.network.testMode = m;
      await Bridge.updateSettings(this.settings);
      this.renderTestView(viewport);
      this.showToast(`Test mode switched to ${m.toUpperCase()}`, 'info');
    };

    if (btnModeBoth) btnModeBoth.onclick = () => switchMode('both');
    if (btnModeDown) btnModeDown.onclick = () => switchMode('download');
    if (btnModeUp) btnModeUp.onclick = () => switchMode('upload');

    // Initialize chart if visible
    if (this.settings.display.showLiveChart) {
      const wrapper = document.getElementById('chart-canvas-wrapper');
      if (wrapper) {
        this.liveChart = new LiveChart(wrapper);
        this.liveChart.setMaxPoints(this.settings.display.chartRetentionPoints || 40);
      }
    }

    // Start/Stop button handler
    const btnAction = document.getElementById('btn-start-stop');
    if (btnAction) {
      btnAction.onclick = async () => {
        if (this.isTesting) {
          await Bridge.cancelTest();
        } else {
          if (this.liveChart) this.liveChart.clear();
          try {
            const mode = this.settings.network.testMode || 'both';
            if (mode === 'download') {
              await Bridge.startDownloadTest();
            } else if (mode === 'upload') {
              await Bridge.startUploadTest();
            } else {
              await Bridge.startTest();
            }
          } catch (err: any) {
            this.showToast(`Error starting test: ${err?.message || err}`, 'error');
          }
        }
      };
    }

    // Toggle chart button handler
    const btnToggleChart = document.getElementById('btn-toggle-chart');
    if (btnToggleChart) {
      btnToggleChart.onclick = () => {
        this.settings.display.showLiveChart = !this.settings.display.showLiveChart;
        Bridge.updateSettings(this.settings);
        this.renderTestView(viewport);
      };
    }

    // Quick test proxy button handler
    const btnQuickTestProxy = document.getElementById('btn-quick-test-proxy');
    if (btnQuickTestProxy) {
      btnQuickTestProxy.onclick = async () => {
        btnQuickTestProxy.textContent = 'Testing...';
        btnQuickTestProxy.setAttribute('disabled', 'true');
        const res = await Bridge.testProxyConnection(this.settings.network.proxyURL);
        btnQuickTestProxy.removeAttribute('disabled');
        btnQuickTestProxy.textContent = 'Test Proxy';
        if (res.success) {
          this.showToast(res.message, 'success');
        } else {
          this.showToast(res.message, 'error');
        }
      };
    }

    this.updateStateBanner();
    this.updateMeterValues();
  }

  private updateStateBanner() {
    const badge = document.getElementById('status-badge');
    if (badge) {
      badge.textContent = this.currentState.message
        ? this.currentState.message.toUpperCase()
        : this.t('state_idle').toUpperCase();
    }

    const phaseLabel = document.getElementById('meter-phase-label');
    if (phaseLabel) {
      const mode = this.settings.network.testMode || 'both';
      if (this.currentState.state === 'downloading') {
        phaseLabel.textContent = 'DOWNLOADING';
        phaseLabel.className = 'text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-0.5';
      } else if (this.currentState.state === 'uploading') {
        phaseLabel.textContent = 'UPLOADING';
        phaseLabel.className = 'text-[11px] font-bold uppercase tracking-widest text-[#60cdff] mb-0.5';
      } else if (this.currentState.state === 'measuring_latency') {
        phaseLabel.textContent = 'LATENCY & JITTER';
        phaseLabel.className = 'text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-0.5';
      } else if (this.currentState.state === 'completed') {
        phaseLabel.textContent = 'TEST COMPLETED';
        phaseLabel.className = 'text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5';
      } else {
        phaseLabel.textContent = mode === 'download' ? 'DOWNLOAD TEST' : mode === 'upload' ? 'UPLOAD TEST' : 'DUAL BENCHMARK';
        phaseLabel.className = 'text-[11px] font-bold uppercase tracking-widest text-[#60cdff] mb-0.5';
      }
    }

    const btnActionText = document.getElementById('btn-action-text');
    if (btnActionText) {
      btnActionText.textContent = this.isTesting
        ? this.t('stop_test').toUpperCase()
        : this.t('start_test').toUpperCase();
    }

    const progressCircle = document.getElementById('meter-circle-progress') as unknown as SVGCircleElement | null;
    if (progressCircle) {
      const totalLen = 276.46; // 2 * PI * 44
      const progress = this.currentState.progressPercent || 0;
      const offset = totalLen - (progress / 100) * totalLen;
      progressCircle.style.strokeDashoffset = `${offset}`;

      // Colorize circle based on phase
      if (this.currentState.state === 'downloading') {
        progressCircle.setAttribute('stroke', '#fbbf24'); // amber
      } else if (this.currentState.state === 'uploading') {
        progressCircle.setAttribute('stroke', '#60cdff'); // blue
      } else if (this.currentState.state === 'measuring_latency') {
        progressCircle.setAttribute('stroke', '#c084fc'); // purple
      } else {
        progressCircle.setAttribute('stroke', '#60cdff');
      }
    }
  }

  private updateActionButtons() {
    const btnAction = document.getElementById('btn-start-stop');
    if (!btnAction) return;
    if (this.isTesting) {
      btnAction.classList.add('theme-btn-stop');
    } else {
      btnAction.classList.remove('theme-btn-stop');
    }
  }

  private updateMeterValues() {
    const currEl = document.getElementById('meter-current-speed');
    const unit = this.settings.display.speedUnit;
    const prec = this.settings.display.decimalPrecision ?? 2;

    const toVal = (bps: number) => {
      switch (unit) {
        case 'MBps':
          return (bps / 8000000).toFixed(prec);
        case 'kbps':
          return (bps / 1000).toFixed(prec);
        case 'kBps':
          return (bps / 8000).toFixed(prec);
        case 'Gbps':
          return (bps / 1000000000).toFixed(prec);
        case 'Mbps':
        default:
          return (bps / 1000000).toFixed(prec);
      }
    };

    if (currEl) {
      currEl.textContent = toVal(this.currentMetrics.instantaneousSpeedBps);
    }

    // Download Speed Card
    const downSpeedEl = document.getElementById('meter-download-speed');
    const downPeakEl = document.getElementById('meter-download-peak');
    if (this.currentMetrics.phase === 'download' || this.currentMetrics.avgDownloadSpeedBps) {
      if (downSpeedEl) {
        const speedToShow =
          this.currentMetrics.phase === 'download'
            ? this.currentMetrics.instantaneousSpeedBps
            : this.currentMetrics.avgDownloadSpeedBps || 0;
        downSpeedEl.textContent = `${toVal(speedToShow)} ${unit}`;
      }
      if (downPeakEl && this.currentMetrics.peakSpeedBps && this.currentMetrics.phase === 'download') {
        downPeakEl.textContent = `Peak: ${toVal(this.currentMetrics.peakSpeedBps)} ${unit}`;
      }
    }

    // Upload Speed Card
    const upSpeedEl = document.getElementById('meter-upload-speed');
    const upPeakEl = document.getElementById('meter-upload-peak');
    if (this.currentMetrics.phase === 'upload' || this.currentMetrics.avgUploadSpeedBps || this.currentMetrics.averageSpeedBps) {
      if (upSpeedEl) {
        const speedToShow =
          this.currentMetrics.phase === 'upload'
            ? this.currentMetrics.instantaneousSpeedBps
            : this.currentMetrics.avgUploadSpeedBps || this.currentMetrics.averageSpeedBps || 0;
        upSpeedEl.textContent = `${toVal(speedToShow)} ${unit}`;
      }
      if (upPeakEl && this.currentMetrics.peakSpeedBps && this.currentMetrics.phase === 'upload') {
        upPeakEl.textContent = `Peak: ${toVal(this.currentMetrics.peakSpeedBps)} ${unit}`;
      }
    }

    // Latency (Ping)
    const latEl = document.getElementById('meter-latency-val');
    const latRangeEl = document.getElementById('meter-latency-range');
    if (latEl && this.currentMetrics.latencyMs) {
      latEl.textContent = `${this.currentMetrics.latencyMs} ms`;
    }
    if (latRangeEl && this.currentMetrics.minLatencyMs) {
      latRangeEl.textContent = `Min: ${this.currentMetrics.minLatencyMs}ms | Max: ${this.currentMetrics.maxLatencyMs}ms`;
    }

    // Jitter
    const jitterEl = document.getElementById('meter-jitter-val');
    const jitterQualityEl = document.getElementById('meter-jitter-quality');
    if (jitterEl && this.currentMetrics.jitterMs !== undefined) {
      jitterEl.textContent = `${this.currentMetrics.jitterMs} ms`;
      if (jitterQualityEl) {
        const j = this.currentMetrics.jitterMs;
        jitterQualityEl.textContent = j < 5 ? 'Excellent (<5ms)' : j < 15 ? 'Good (<15ms)' : 'Moderate';
      }
    }

    // Transferred Data
    const dataDownEl = document.getElementById('meter-data-down');
    const dataUpEl = document.getElementById('meter-data-up');
    const dataTotalEl = document.getElementById('meter-data-total');

    const downBytes = this.currentMetrics.downloadBytes || 0;
    const upBytes = this.currentMetrics.uploadBytes || this.currentMetrics.serverConfirmedBytes || 0;

    if (dataDownEl) dataDownEl.textContent = this.formatBytes(downBytes);
    if (dataUpEl) dataUpEl.textContent = this.formatBytes(upBytes);
    if (dataTotalEl) dataTotalEl.textContent = this.formatBytes(downBytes + upBytes);
  }

  // ----------------------------------------------------------------------
  // VIEW: Servers Selection (Geometric Balance)
  // ----------------------------------------------------------------------
  private renderServersView(viewport: HTMLElement) {
    viewport.innerHTML = `
      <div class="max-w-4xl mx-auto w-full space-y-5">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">Upload Servers</h2>
            <p class="text-xs text-[#a0a0a0]">Discover and select verified servers for pure upload performance measurement.</p>
          </div>
          <button id="btn-refresh-servers" class="theme-btn-secondary flex items-center gap-1.5 text-xs">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            <span>Refresh Servers</span>
          </button>
        </div>

        <!-- Mode Selector Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div id="mode-card-auto" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode === 'auto' ? 'border-[#60cdff] bg-[#60cdff]/10' : ''}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="auto" ${this.settings.network.serverSelectionMode === 'auto' ? 'checked' : ''}/>
              <span>${this.t('server_auto')}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Automatically selects nearest low-latency verified speedtest host.</p>
          </div>

          <div id="mode-card-manual" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode === 'manual' ? 'border-[#60cdff] bg-[#60cdff]/10' : ''}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="manual" ${this.settings.network.serverSelectionMode === 'manual' ? 'checked' : ''}/>
              <span>${this.t('server_manual')}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Pick from public servers with measured ping latency.</p>
          </div>

          <div id="mode-card-custom" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode === 'custom' ? 'border-[#60cdff] bg-[#60cdff]/10' : ''}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="custom" ${this.settings.network.serverSelectionMode === 'custom' ? 'checked' : ''}/>
              <span>${this.t('server_custom')}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Specify an enterprise endpoint or custom speedtest URL.</p>
          </div>
        </div>

        <!-- Custom Server Input Bar -->
        <div id="custom-server-panel" class="metric-card space-y-2 ${this.settings.network.serverSelectionMode === 'custom' ? '' : 'hidden'}">
          <label class="text-xs font-semibold text-white">Custom Upload Server URL</label>
          <div class="flex items-center gap-2">
            <input id="input-custom-url" type="text" class="theme-input flex-1 px-3 py-1.5 text-xs" placeholder="${this.t('server_custom_placeholder')}" value="${this.settings.network.customServerURL || ''}"/>
            <button id="btn-validate-custom" class="theme-btn-secondary text-[#60cdff] font-semibold text-xs">Validate</button>
          </div>
          <p class="text-[11px] text-[#a0a0a0]">Supports standard HTTP/HTTPS/TCP upload testing endpoints.</p>
        </div>

        <!-- Servers Table -->
        <div class="rounded-lg bg-[#323232] border border-white/[0.08] overflow-hidden">
          <div class="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <input id="input-server-search" type="text" class="theme-input px-3 py-1 text-xs w-72" placeholder="${this.t('server_search_placeholder')}"/>
            <span class="text-xs text-[#a0a0a0]">${this.serversList.length} servers available</span>
          </div>

          <div class="divide-y divide-white/5 max-h-96 overflow-y-auto">
            ${
              this.serversList.length === 0
                ? `<div class="p-6 text-center text-xs text-[#a0a0a0]">Loading server list...</div>`
                : this.serversList
                    .map(
                      (s) => `
              <div class="p-3 flex items-center justify-between hover:bg-white/[0.03] transition">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full ${s.available ? 'bg-emerald-400' : 'bg-slate-600'}"></div>
                  <div>
                    <div class="text-xs font-medium text-white flex items-center gap-2">
                      <span>${s.name}</span>
                      <span class="text-[10px] text-[#a0a0a0]">(${s.city}, ${s.country})</span>
                    </div>
                    <div class="text-[10px] text-[#a0a0a0]">${s.sponsor} &middot; ${s.distance ? s.distance.toFixed(0) + ' km' : 'Nearby'}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-[#60cdff] font-semibold">${s.latencyMs ? s.latencyMs + ' ms' : '--'}</span>
                  <button class="btn-select-srv theme-btn-secondary px-3 py-1 text-xs" data-id="${s.id}">
                    ${this.settings.network.selectedServerID === s.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </div>
            `
                    )
                    .join('')
            }
          </div>
        </div>
      </div>
    `;

    ['auto', 'manual', 'custom'].forEach((mode) => {
      const card = document.getElementById(`mode-card-${mode}`);
      if (card) {
        card.onclick = async () => {
          this.settings.network.serverSelectionMode = mode as any;
          await Bridge.updateSettings(this.settings);
          this.renderServersView(viewport);
        };
      }
    });

    const btnVal = document.getElementById('btn-validate-custom');
    if (btnVal) {
      btnVal.onclick = async () => {
        const inp = document.getElementById('input-custom-url') as HTMLInputElement | null;
        if (!inp || !inp.value.trim()) {
          this.showToast('Please enter a custom server URL.', 'error');
          return;
        }
        try {
          const info = await Bridge.validateCustomServer(inp.value.trim());
          this.settings.network.customServerURL = inp.value.trim();
          await Bridge.updateSettings(this.settings);
          this.showToast(`Verified custom server! Ping: ${info.latencyMs} ms`, 'success');
        } catch (err: any) {
          this.showToast(`Validation failed: ${err?.message || err}`, 'error');
        }
      };
    }

    const btnRefresh = document.getElementById('btn-refresh-servers');
    if (btnRefresh) {
      btnRefresh.onclick = () => {
        this.refreshServers();
      };
    }

    const selectBtns = viewport.querySelectorAll('.btn-select-srv');
    selectBtns.forEach((btn) => {
      (btn as HTMLElement).onclick = async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id') || '';
        this.settings.network.selectedServerID = id;
        this.settings.network.serverSelectionMode = 'manual';
        await Bridge.updateSettings(this.settings);
        this.showToast(`Selected server ID: ${id}`, 'success');
        this.renderServersView(viewport);
      };
    });
  }

  private async refreshServers() {
    try {
      this.serversList = await Bridge.discoverServers();
      if (this.activeTab === 'servers') {
        const viewport = document.getElementById('view-viewport');
        if (viewport) this.renderServersView(viewport);
      }
    } catch (e) {
      console.warn('Could not discover servers:', e);
    }
  }

  // ----------------------------------------------------------------------
  // VIEW: History (Geometric Balance)
  // ----------------------------------------------------------------------
  private renderHistoryView(viewport: HTMLElement) {
    viewport.innerHTML = `
      <div class="max-w-5xl mx-auto w-full space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">Speed Test History</h2>
            <p class="text-xs text-[#a0a0a0]">All benchmark records stored securely in your local %LOCALAPPDATA% directory.</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-export-csv" class="theme-btn-secondary text-xs flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>${this.t('export_csv')}</span>
            </button>
            <button id="btn-export-json" class="theme-btn-secondary text-xs flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              <span>${this.t('export_json')}</span>
            </button>
            <button id="btn-clear-history" class="theme-btn-secondary text-xs text-rose-400 hover:text-rose-300 border-rose-500/30">
              ${this.t('clear_history')}
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="metric-card flex items-center justify-between gap-4">
          <input id="input-history-search" type="text" class="theme-input px-3 py-1 text-xs w-64" placeholder="Search by server, city, mode..." value="${this.historySearchQuery}"/>

          <div class="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <span>Sort by:</span>
            <select id="select-history-sort" class="theme-input px-2.5 py-1 text-xs bg-[#1c1c1c] text-white">
              <option value="date" ${this.historySortBy === 'date' ? 'selected' : ''}>Date (Newest)</option>
              <option value="speed" ${this.historySortBy === 'speed' ? 'selected' : ''}>Upload Speed</option>
              <option value="download" ${this.historySortBy === 'download' ? 'selected' : ''}>Download Speed</option>
              <option value="latency" ${this.historySortBy === 'latency' ? 'selected' : ''}>Latency (Ping)</option>
              <option value="jitter" ${this.historySortBy === 'jitter' ? 'selected' : ''}>Jitter</option>
            </select>
          </div>
        </div>

        <!-- History Records Table -->
        <div class="rounded-lg bg-[#323232] border border-white/[0.08] overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-white/[0.04] text-[#a0a0a0] text-[11px] uppercase tracking-wider">
              <tr>
                <th class="p-3">Timestamp</th>
                <th class="p-3">Mode</th>
                <th class="p-3">Download</th>
                <th class="p-3">Upload</th>
                <th class="p-3">Latency</th>
                <th class="p-3">Jitter</th>
                <th class="p-3">Confirmed Data</th>
                <th class="p-3">Server</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              ${
                this.historyList.length === 0
                  ? `<tr><td colspan="9" class="p-8 text-center text-[#a0a0a0]">${this.t('history_empty')}</td></tr>`
                  : this.historyList
                      .map((r) => {
                        const modeBadge =
                          r.testMode === 'download'
                            ? `<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">DOWN</span>`
                            : r.testMode === 'upload'
                            ? `<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-[#60cdff]/10 text-[#60cdff] border border-[#60cdff]/20">UP</span>`
                            : `<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">DUAL</span>`;

                        const downText = r.avgDownloadSpeedBps ? this.formatSpeed(r.avgDownloadSpeedBps) : '--';
                        const upText = r.avgUploadSpeedBps ? this.formatSpeed(r.avgUploadSpeedBps) : '--';

                        return `
                          <tr class="hover:bg-white/[0.02] transition">
                            <td class="p-3 text-slate-300 font-mono text-[11px]">${new Date(r.timestamp).toLocaleString()}</td>
                            <td class="p-3">${modeBadge}</td>
                            <td class="p-3 font-semibold text-amber-400 font-mono">${downText}</td>
                            <td class="p-3 font-semibold text-[#60cdff] font-mono">${upText}</td>
                            <td class="p-3 font-mono text-emerald-400">${r.latencyMs} ms</td>
                            <td class="p-3 font-mono text-purple-400">${r.jitterMs !== undefined ? r.jitterMs + ' ms' : '--'}</td>
                            <td class="p-3 text-[#a0a0a0] font-mono text-[11px]">${this.formatBytes(
                              (r.downloadBytes || 0) + (r.uploadBytes || r.serverConfirmedBytes || 0)
                            )}</td>
                            <td class="p-3 text-slate-200 text-[11px] max-w-[140px] truncate">${r.server?.name || 'Auto Server'}</td>
                            <td class="p-3 text-right space-x-2">
                              <button class="btn-copy-rec theme-btn-secondary px-2.5 py-1 text-[11px]" data-id="${r.id}" title="Copy Result">Copy</button>
                              <button class="btn-delete-rec theme-btn-secondary px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300" data-id="${r.id}" title="Delete Record">&times;</button>
                            </td>
                          </tr>
                        `;
                      })
                      .join('')
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchInp = document.getElementById('input-history-search') as HTMLInputElement | null;
    if (searchInp) {
      searchInp.oninput = () => {
        this.historySearchQuery = searchInp.value;
        this.refreshHistory();
      };
    }

    const sortSel = document.getElementById('select-history-sort') as HTMLSelectElement | null;
    if (sortSel) {
      sortSel.onchange = () => {
        this.historySortBy = sortSel.value;
        this.refreshHistory();
      };
    }

    const btnCsv = document.getElementById('btn-export-csv');
    if (btnCsv) {
      btnCsv.onclick = async () => {
        const csv = await Bridge.exportCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uploadpulse-history-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('CSV export generated successfully.', 'success');
      };
    }

    const btnJson = document.getElementById('btn-export-json');
    if (btnJson) {
      btnJson.onclick = async () => {
        const json = await Bridge.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uploadpulse-history-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('JSON export generated successfully.', 'success');
      };
    }

    const btnClear = document.getElementById('btn-clear-history');
    if (btnClear) {
      btnClear.onclick = async () => {
        if (confirm(this.t('clear_confirm_msg'))) {
          await Bridge.clearHistory();
          this.refreshHistory();
          this.showToast('All history cleared.', 'success');
        }
      };
    }

    viewport.querySelectorAll('.btn-copy-rec').forEach((b) => {
      (b as HTMLElement).onclick = async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id') || '';
        const summary = await Bridge.copySummary(id, true);
        navigator.clipboard.writeText(summary);
        this.showToast(this.t('copied_toast'), 'success');
      };
    });

    viewport.querySelectorAll('.btn-delete-rec').forEach((b) => {
      (b as HTMLElement).onclick = async (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-id') || '';
        await Bridge.deleteHistoryRecord(id);
        this.refreshHistory();
        this.showToast('Record deleted.', 'success');
      };
    });
  }

  private async refreshHistory() {
    try {
      this.historyList = await Bridge.queryHistory(this.historySearchQuery, this.historySortBy, this.historySortDesc);
      if (this.activeTab === 'history') {
        const viewport = document.getElementById('view-viewport');
        if (viewport) this.renderHistoryView(viewport);
      }
    } catch (e) {
      console.warn('Could not refresh history:', e);
    }
  }

  // ----------------------------------------------------------------------
  // VIEW: Settings (Geometric Balance - Complete Customization)
  // ----------------------------------------------------------------------
  private renderSettingsView(viewport: HTMLElement) {
    viewport.innerHTML = `
      <div class="max-w-3xl mx-auto w-full space-y-6 pb-12">
        <div>
          <h2 class="text-lg font-semibold text-white">${this.t('nav_settings')}</h2>
          <p class="text-xs text-[#a0a0a0]">Configure test engine, worker concurrency, SOCKS5 proxy, units, appearance, and history storage.</p>
        </div>

        <!-- 1. Network & Engine Settings Card -->
        <div class="metric-card space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">Test Engine & Network Configuration</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]">Engine Options</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Test Mode -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Default Test Mode</label>
              <select id="cfg-test-mode" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="both" ${(this.settings.network.testMode || 'both') === 'both' ? 'selected' : ''}>Download & Upload (Dual)</option>
                <option value="download" ${this.settings.network.testMode === 'download' ? 'selected' : ''}>Download Only</option>
                <option value="upload" ${this.settings.network.testMode === 'upload' ? 'selected' : ''}>Upload Only</option>
              </select>
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_duration')}</label>
              <select id="cfg-duration" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="5" ${this.settings.network.durationSeconds === 5 ? 'selected' : ''}>5 Seconds</option>
                <option value="10" ${this.settings.network.durationSeconds === 10 ? 'selected' : ''}>10 Seconds</option>
                <option value="15" ${this.settings.network.durationSeconds === 15 ? 'selected' : ''}>15 Seconds (Standard)</option>
                <option value="20" ${this.settings.network.durationSeconds === 20 ? 'selected' : ''}>20 Seconds</option>
                <option value="30" ${this.settings.network.durationSeconds === 30 ? 'selected' : ''}>30 Seconds (Extended)</option>
                <option value="60" ${this.settings.network.durationSeconds === 60 ? 'selected' : ''}>60 Seconds (Heavy Stress)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Worker Connections -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_workers')}</label>
              <select id="cfg-workers" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="1" ${this.settings.network.workerCount === 1 ? 'selected' : ''}>1 Connection (Single-Thread / Low CPU)</option>
                <option value="2" ${this.settings.network.workerCount === 2 ? 'selected' : ''}>2 Connections</option>
                <option value="4" ${this.settings.network.workerCount === 4 ? 'selected' : ''}>4 Connections</option>
                <option value="8" ${this.settings.network.workerCount === 8 ? 'selected' : ''}>8 Connections (Default Balanced)</option>
                <option value="16" ${this.settings.network.workerCount === 16 ? 'selected' : ''}>16 Connections (High Throughput)</option>
                <option value="24" ${this.settings.network.workerCount === 24 ? 'selected' : ''}>24 Connections (Heavy Pipe)</option>
                <option value="32" ${this.settings.network.workerCount === 32 ? 'selected' : ''}>32 Connections (Max Stress)</option>
              </select>
            </div>

            <!-- Warmup Seconds -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Warm-up Phase (sec)</label>
              <select id="cfg-warmup" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="0" ${(this.settings.network.warmupSeconds || 0) === 0 ? 'selected' : ''}>0 Seconds (Disabled)</option>
                <option value="1" ${this.settings.network.warmupSeconds === 1 ? 'selected' : ''}>1 Second</option>
                <option value="2" ${this.settings.network.warmupSeconds === 2 ? 'selected' : ''}>2 Seconds</option>
                <option value="3" ${this.settings.network.warmupSeconds === 3 ? 'selected' : ''}>3 Seconds</option>
                <option value="5" ${this.settings.network.warmupSeconds === 5 ? 'selected' : ''}>5 Seconds</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Protocol -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_protocol')}</label>
              <select id="cfg-protocol" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="http" ${this.settings.network.protocol === 'http' ? 'selected' : ''}>HTTP / HTTPS (Default)</option>
                <option value="tcp" ${this.settings.network.protocol === 'tcp' ? 'selected' : ''}>Raw TCP (Experimental)</option>
              </select>
            </div>

            <!-- Latency Mode -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_latency_mode')}</label>
              <select id="cfg-latency-mode" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="http" ${this.settings.network.latencyMode === 'http' ? 'selected' : ''}>HTTP Ping (Default)</option>
                <option value="tcp" ${this.settings.network.latencyMode === 'tcp' ? 'selected' : ''}>TCP Ping</option>
                <option value="icmp" ${this.settings.network.latencyMode === 'icmp' ? 'selected' : ''}>ICMP (Raw Socket)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Jitter Ping Samples -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Jitter Ping Sample Count</label>
              <select id="cfg-jitter-samples" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="3" ${(this.settings.network.jitterPingSamples || 10) === 3 ? 'selected' : ''}>3 Samples (Fast)</option>
                <option value="5" ${(this.settings.network.jitterPingSamples || 10) === 5 ? 'selected' : ''}>5 Samples</option>
                <option value="10" ${(this.settings.network.jitterPingSamples || 10) === 10 ? 'selected' : ''}>10 Samples (Default)</option>
                <option value="15" ${(this.settings.network.jitterPingSamples || 10) === 15 ? 'selected' : ''}>15 Samples</option>
                <option value="20" ${(this.settings.network.jitterPingSamples || 10) === 20 ? 'selected' : ''}>20 Samples</option>
                <option value="30" ${(this.settings.network.jitterPingSamples || 10) === 30 ? 'selected' : ''}>30 Samples (High Precision)</option>
              </select>
            </div>

            <!-- IP Version -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">IP Protocol Stack</label>
              <select id="cfg-ip-version" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="auto" ${(this.settings.network.ipVersion || 'auto') === 'auto' ? 'selected' : ''}>Dual-Stack Auto (IPv4/IPv6)</option>
                <option value="ipv4" ${this.settings.network.ipVersion === 'ipv4' ? 'selected' : ''}>Force IPv4 Only</option>
                <option value="ipv6" ${this.settings.network.ipVersion === 'ipv6' ? 'selected' : ''}>Force IPv6 Only</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <div class="text-xs font-medium text-white">${this.t('settings_saving_mode')}</div>
              <div class="text-[11px] text-[#a0a0a0]">Limits concurrent upload threads to minimize metered data consumption.</div>
            </div>
            <input id="cfg-saving-mode" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.network.savingMode ? 'checked' : ''}/>
          </div>
        </div>

        <!-- 2. Network Routing, DNS & Virtual Location Card -->
        <div class="metric-card space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">Source Interface, DNS & Virtual Location</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]">Advanced Network</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Source Interface IP (Local Binding)</label>
              <input id="cfg-source-ip" type="text"
                placeholder="e.g. 192.168.1.105 (leave empty for auto)"
                value="${this.settings.network.sourceIp || ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Custom DNS Resolver Server</label>
              <input id="cfg-custom-dns" type="text"
                placeholder="e.g. 1.1.1.1:53, 8.8.8.8:53"
                value="${this.settings.network.customDns || ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Custom HTTP User-Agent Header</label>
            <input id="cfg-user-agent" type="text"
              placeholder="e.g. UploadPulse/2.0.0 (Windows 11 x64)"
              value="${this.settings.network.userAgent || ''}"
              class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual City Name</label>
              <input id="cfg-virtual-city" type="text"
                placeholder="e.g. Frankfurt"
                value="${this.settings.network.virtualCity || ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual Latitude</label>
              <input id="cfg-latitude" type="number" step="any"
                placeholder="50.1109"
                value="${this.settings.network.latitude !== null && this.settings.network.latitude !== undefined ? this.settings.network.latitude : ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual Longitude</label>
              <input id="cfg-longitude" type="number" step="any"
                placeholder="8.6821"
                value="${this.settings.network.longitude !== null && this.settings.network.longitude !== undefined ? this.settings.network.longitude : ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Server Search Keyword Filter</label>
              <input id="cfg-server-keyword" type="text"
                placeholder="e.g. Vodafone, Telecom, Core"
                value="${this.settings.network.serverSearchKeyword || ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Country ISO Code Filter</label>
              <input id="cfg-country-filter" type="text"
                placeholder="e.g. DE, US, IR, GB, FR"
                value="${this.settings.network.countryFilter || ''}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white uppercase placeholder:text-neutral-600" />
            </div>
          </div>
        </div>

        <!-- 3. SOCKS5 / V2Ray Proxy Configuration Card -->
        <div class="metric-card space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">SOCKS5 & V2Ray Proxy Configuration</h3>
            <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-[#60cdff]/10 text-[#60cdff] border border-[#60cdff]/20">
              v2ray / xray / clash / shadowsocks
            </span>
          </div>

          <p class="text-xs text-[#a0a0a0]">
            Route pure upload and download speed tests through your local V2Ray or Shadowsocks SOCKS5 inbound proxy port.
          </p>

          <div>
            <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Proxy Endpoint URL</label>
            <div class="flex gap-2">
              <input id="cfg-proxy-url" type="text"
                placeholder="socks5://127.0.0.1:10808 (e.g. V2Ray default)"
                value="${this.settings.network.proxyURL || ''}"
                class="theme-input flex-1 px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
              <button id="btn-test-proxy" type="button" class="theme-btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 shrink-0" title="Verify Proxy Connection">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span>Test Connection</span>
              </button>
            </div>
            <div id="proxy-test-status" class="mt-2 text-xs hidden"></div>
          </div>

          <!-- Quick Presets -->
          <div>
            <div class="text-[11px] text-[#a0a0a0] mb-1.5">Quick Presets:</div>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-preset-proxy theme-btn-secondary px-2.5 py-1 text-[11px]" data-url="socks5://127.0.0.1:10808">
                V2Ray (127.0.0.1:10808)
              </button>
              <button type="button" class="btn-preset-proxy theme-btn-secondary px-2.5 py-1 text-[11px]" data-url="socks5://127.0.0.1:10809">
                V2Ray HTTP (127.0.0.1:10809)
              </button>
              <button type="button" class="btn-preset-proxy theme-btn-secondary px-2.5 py-1 text-[11px]" data-url="socks5://127.0.0.1:7890">
                Clash / Sing-box (127.0.0.1:7890)
              </button>
              <button type="button" class="btn-preset-proxy theme-btn-secondary px-2.5 py-1 text-[11px]" data-url="socks5://127.0.0.1:1080">
                Shadowsocks (127.0.0.1:1080)
              </button>
              <button type="button" class="btn-preset-proxy theme-btn-secondary px-2.5 py-1 text-[11px] text-rose-400 hover:text-rose-300" data-url="">
                Direct (Disable Proxy)
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Display, Appearance & Notifications Card -->
        <div class="metric-card space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">${this.t('settings_display')}</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]">UI & Audio</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_speed_unit')}</label>
              <select id="cfg-speed-unit" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="Mbps" ${this.settings.display.speedUnit === 'Mbps' ? 'selected' : ''}>Megabits/sec (Mbps)</option>
                <option value="MBps" ${this.settings.display.speedUnit === 'MBps' ? 'selected' : ''}>Megabytes/sec (MB/s)</option>
                <option value="Gbps" ${this.settings.display.speedUnit === 'Gbps' ? 'selected' : ''}>Gigabits/sec (Gbps)</option>
                <option value="kbps" ${this.settings.display.speedUnit === 'kbps' ? 'selected' : ''}>Kilobits/sec (kbps)</option>
                <option value="kBps" ${this.settings.display.speedUnit === 'kBps' ? 'selected' : ''}>Kilobytes/sec (kB/s)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Decimal Precision</label>
              <select id="cfg-precision" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="0" ${(this.settings.display.decimalPrecision ?? 2) === 0 ? 'selected' : ''}>0 Decimals (100 Mbps)</option>
                <option value="1" ${(this.settings.display.decimalPrecision ?? 2) === 1 ? 'selected' : ''}>1 Decimal (100.5 Mbps)</option>
                <option value="2" ${(this.settings.display.decimalPrecision ?? 2) === 2 ? 'selected' : ''}>2 Decimals (100.52 Mbps)</option>
                <option value="3" ${(this.settings.display.decimalPrecision ?? 2) === 3 ? 'selected' : ''}>3 Decimals (100.524 Mbps)</option>
                <option value="4" ${(this.settings.display.decimalPrecision ?? 2) === 4 ? 'selected' : ''}>4 Decimals (High precision)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t('settings_language')}</label>
              <select id="cfg-language" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white" disabled>
                <option value="en" selected>English</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Visual Theme</label>
              <select id="cfg-theme" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="dark" ${(this.settings.display.theme || 'dark') === 'dark' ? 'selected' : ''}>Windows 11 Dark (Mica)</option>
                <option value="light" ${this.settings.display.theme === 'light' ? 'selected' : ''}>Windows 11 Light (Fluent)</option>
                <option value="oled" ${this.settings.display.theme === 'oled' ? 'selected' : ''}>OLED High-Contrast Black</option>
                <option value="system" ${this.settings.display.theme === 'system' ? 'selected' : ''}>System Default</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Chart Retention Points</label>
              <select id="cfg-chart-points" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="20" ${(this.settings.display.chartRetentionPoints || 40) === 20 ? 'selected' : ''}>20 Data Points</option>
                <option value="40" ${(this.settings.display.chartRetentionPoints || 40) === 40 ? 'selected' : ''}>40 Points (Default)</option>
                <option value="60" ${(this.settings.display.chartRetentionPoints || 40) === 60 ? 'selected' : ''}>60 Points</option>
                <option value="100" ${(this.settings.display.chartRetentionPoints || 40) === 100 ? 'selected' : ''}>100 Points (Wide History)</option>
              </select>
            </div>
          </div>

          <div class="space-y-3 pt-2 border-t border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Live Throughput Chart</div>
                <div class="text-[11px] text-[#a0a0a0]">Displays a real-time spline canvas graphing speed during active testing.</div>
              </div>
              <input id="cfg-show-chart" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.showLiveChart ? 'checked' : ''}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Windows 11 Mica Glass Effect</div>
                <div class="text-[11px] text-[#a0a0a0]">Renders dynamic translucent acrylic backdrop styling.</div>
              </div>
              <input id="cfg-enable-mica" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${(this.settings.display.enableMica ?? true) ? 'checked' : ''}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Desktop Notification on Test Completion</div>
                <div class="text-[11px] text-[#a0a0a0]">Triggers a native Windows 11 toast notification with final results.</div>
              </div>
              <input id="cfg-completion-notification" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${(this.settings.display.completionNotification ?? true) ? 'checked' : ''}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Audio Alert Chime</div>
                <div class="text-[11px] text-[#a0a0a0]">Plays an acoustic sound chime when benchmarks finish.</div>
              </div>
              <input id="cfg-completion-sound" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${(this.settings.display.completionSound ?? true) ? 'checked' : ''}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Auto-start Test on Application Launch</div>
                <div class="text-[11px] text-[#a0a0a0]">Automatically initiates speed test immediately when the app opens.</div>
              </div>
              <input id="cfg-auto-start" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${(this.settings.display.autoStartOnLaunch ?? false) ? 'checked' : ''}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">${this.t('settings_privacy_mask')}</div>
                <div class="text-[11px] text-[#a0a0a0]">Masks client IP in exports and summaries (e.g. 192.168.***.***).</div>
              </div>
              <input id="cfg-mask-ip" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.maskSensitiveData ? 'checked' : ''}/>
            </div>
          </div>
        </div>

        <!-- 5. History Storage & Retention Card -->
        <div class="metric-card space-y-4">
          <div class="flex items-center justify-between border-b border-white/5 pb-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">Local History Retention</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]">Storage Engine</span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Max Stored Records</label>
              <select id="cfg-max-records" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="25" ${(this.settings.history?.maxStoredRecords || 100) === 25 ? 'selected' : ''}>25 Records</option>
                <option value="50" ${(this.settings.history?.maxStoredRecords || 100) === 50 ? 'selected' : ''}>50 Records</option>
                <option value="100" ${(this.settings.history?.maxStoredRecords || 100) === 100 ? 'selected' : ''}>100 Records (Default)</option>
                <option value="250" ${(this.settings.history?.maxStoredRecords || 100) === 250 ? 'selected' : ''}>250 Records</option>
                <option value="500" ${(this.settings.history?.maxStoredRecords || 100) === 500 ? 'selected' : ''}>500 Records</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Data Retention Period</label>
              <select id="cfg-retention-days" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="30" ${(this.settings.history?.retentionDays || 90) === 30 ? 'selected' : ''}>30 Days</option>
                <option value="60" ${(this.settings.history?.retentionDays || 90) === 60 ? 'selected' : ''}>60 Days</option>
                <option value="90" ${(this.settings.history?.retentionDays || 90) === 90 ? 'selected' : ''}>90 Days (Default)</option>
                <option value="180" ${(this.settings.history?.retentionDays || 90) === 180 ? 'selected' : ''}>180 Days (Half Year)</option>
                <option value="365" ${(this.settings.history?.retentionDays || 90) === 365 ? 'selected' : ''}>365 Days (Full Year)</option>
                <option value="0" ${(this.settings.history?.retentionDays || 90) === 0 ? 'selected' : ''}>Keep Forever (Unlimited)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-3 pt-2">
          <button id="btn-save-settings" class="theme-btn-primary px-6 py-2.5 text-sm font-semibold">
            ${this.t('save_settings')}
          </button>
        </div>
      </div>
    `;

    // Presets click handlers
    viewport.querySelectorAll('.btn-preset-proxy').forEach((btn) => {
      (btn as HTMLElement).onclick = () => {
        const url = (btn as HTMLElement).getAttribute('data-url') || '';
        const proxyInput = document.getElementById('cfg-proxy-url') as HTMLInputElement | null;
        if (proxyInput) {
          proxyInput.value = url;
          this.showToast(url ? `Preset selected: ${url}` : 'Proxy disabled (direct connection)', 'info');
        }
      };
    });

    // Test proxy connection button handler
    const btnTestProxy = document.getElementById('btn-test-proxy');
    const proxyStatus = document.getElementById('proxy-test-status');
    if (btnTestProxy && proxyStatus) {
      btnTestProxy.onclick = async () => {
        const proxyInput = document.getElementById('cfg-proxy-url') as HTMLInputElement | null;
        const rawUrl = proxyInput ? proxyInput.value.trim() : '';
        if (!rawUrl) {
          proxyStatus.className = 'mt-2 text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 block';
          proxyStatus.textContent = 'Please enter a proxy URL to test.';
          return;
        }

        btnTestProxy.setAttribute('disabled', 'true');
        btnTestProxy.innerHTML = `
          <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span>Testing...</span>
        `;
        proxyStatus.className = 'mt-2 text-xs p-2 rounded bg-white/5 border border-white/10 text-white/70 block';
        proxyStatus.textContent = `Connecting to ${rawUrl}...`;

        try {
          const res = await Bridge.testProxyConnection(rawUrl);
          btnTestProxy.removeAttribute('disabled');
          btnTestProxy.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Test Connection</span>
          `;

          if (res.success) {
            proxyStatus.className = 'mt-2 text-xs p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 block font-mono';
            proxyStatus.textContent = res.message;
            this.showToast('Proxy verified successfully!', 'success');
          } else {
            proxyStatus.className = 'mt-2 text-xs p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 block';
            proxyStatus.textContent = res.message;
            this.showToast('Proxy test failed.', 'error');
          }
        } catch (err: any) {
          btnTestProxy.removeAttribute('disabled');
          btnTestProxy.innerHTML = `<span>Test Connection</span>`;
          proxyStatus.className = 'mt-2 text-xs p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 block';
          proxyStatus.textContent = `Error: ${err?.message || err}`;
        }
      };
    }

    const btnSave = document.getElementById('btn-save-settings');
    if (btnSave) {
      btnSave.onclick = async () => {
        const testMode = (document.getElementById('cfg-test-mode') as HTMLSelectElement).value as any;
        const dur = parseInt((document.getElementById('cfg-duration') as HTMLSelectElement).value, 10);
        const wrk = parseInt((document.getElementById('cfg-workers') as HTMLSelectElement).value, 10);
        const warmup = parseInt((document.getElementById('cfg-warmup') as HTMLSelectElement).value, 10);
        const proto = (document.getElementById('cfg-protocol') as HTMLSelectElement).value as any;
        const latMode = (document.getElementById('cfg-latency-mode') as HTMLSelectElement).value as any;
        const jitterSamples = parseInt((document.getElementById('cfg-jitter-samples') as HTMLSelectElement).value, 10);
        const ipVersion = (document.getElementById('cfg-ip-version') as HTMLSelectElement).value as any;
        const savMode = (document.getElementById('cfg-saving-mode') as HTMLInputElement).checked;

        const sourceIp = ((document.getElementById('cfg-source-ip') as HTMLInputElement)?.value || '').trim();
        const customDns = ((document.getElementById('cfg-custom-dns') as HTMLInputElement)?.value || '').trim();
        const userAgent = ((document.getElementById('cfg-user-agent') as HTMLInputElement)?.value || '').trim();
        const virtualCity = ((document.getElementById('cfg-virtual-city') as HTMLInputElement)?.value || '').trim();
        const latVal = parseFloat((document.getElementById('cfg-latitude') as HTMLInputElement)?.value);
        const lonVal = parseFloat((document.getElementById('cfg-longitude') as HTMLInputElement)?.value);
        const serverKeyword = ((document.getElementById('cfg-server-keyword') as HTMLInputElement)?.value || '').trim();
        const countryFilter = ((document.getElementById('cfg-country-filter') as HTMLInputElement)?.value || '').trim().toUpperCase();
        const proxyURL = ((document.getElementById('cfg-proxy-url') as HTMLInputElement)?.value || '').trim();

        const unit = (document.getElementById('cfg-speed-unit') as HTMLSelectElement).value as any;
        const prec = parseInt((document.getElementById('cfg-precision') as HTMLSelectElement).value, 10);
        const lang = (document.getElementById('cfg-language') as HTMLSelectElement).value as any;
        const theme = (document.getElementById('cfg-theme') as HTMLSelectElement).value as any;
        const chartPoints = parseInt((document.getElementById('cfg-chart-points') as HTMLSelectElement).value, 10);
        const showChart = (document.getElementById('cfg-show-chart') as HTMLInputElement).checked;
        const enableMica = (document.getElementById('cfg-enable-mica') as HTMLInputElement).checked;
        const compNotif = (document.getElementById('cfg-completion-notification') as HTMLInputElement).checked;
        const compSound = (document.getElementById('cfg-completion-sound') as HTMLInputElement).checked;
        const autoStart = (document.getElementById('cfg-auto-start') as HTMLInputElement).checked;
        const mask = (document.getElementById('cfg-mask-ip') as HTMLInputElement).checked;

        const maxRecs = parseInt((document.getElementById('cfg-max-records') as HTMLSelectElement).value, 10);
        const retDays = parseInt((document.getElementById('cfg-retention-days') as HTMLSelectElement).value, 10);

        // Populate Network Settings
        this.settings.network.testMode = testMode;
        this.settings.network.durationSeconds = dur;
        this.settings.network.workerCount = wrk;
        this.settings.network.warmupSeconds = warmup;
        this.settings.network.protocol = proto;
        this.settings.network.latencyMode = latMode;
        this.settings.network.jitterPingSamples = jitterSamples;
        this.settings.network.ipVersion = ipVersion;
        this.settings.network.savingMode = savMode;
        this.settings.network.sourceIp = sourceIp;
        this.settings.network.customDns = customDns;
        this.settings.network.userAgent = userAgent;
        this.settings.network.virtualCity = virtualCity;
        this.settings.network.latitude = isNaN(latVal) ? null : latVal;
        this.settings.network.longitude = isNaN(lonVal) ? null : lonVal;
        this.settings.network.serverSearchKeyword = serverKeyword;
        this.settings.network.countryFilter = countryFilter;
        this.settings.network.proxyURL = proxyURL;

        // Populate Display Settings
        this.settings.display.speedUnit = unit;
        this.settings.display.decimalPrecision = prec;
        this.settings.display.language = 'en';
        this.settings.display.theme = theme;
        this.settings.display.chartRetentionPoints = chartPoints;
        this.settings.display.showLiveChart = showChart;
        this.settings.display.enableMica = enableMica;
        this.settings.display.completionNotification = compNotif;
        this.settings.display.completionSound = compSound;
        this.settings.display.autoStartOnLaunch = autoStart;
        this.settings.display.maskSensitiveData = mask;

        // Populate History Settings
        if (!this.settings.history) {
          this.settings.history = { maxStoredRecords: 100, retentionDays: 90, autoExportCSV: false, autoExportJSON: false };
        }
        this.settings.history.maxStoredRecords = maxRecs;
        this.settings.history.retentionDays = retDays;

        await Bridge.updateSettings(this.settings);
        this.locale = await Bridge.getLocale('en');
        document.body.setAttribute('dir', 'ltr');
        this.showToast(this.t('settings_saved'), 'success');
        this.render();
      };
    }
  }

  // ----------------------------------------------------------------------
  // VIEW: Privacy Notice (Geometric Balance)
  // ----------------------------------------------------------------------
  private renderPrivacyView(viewport: HTMLElement) {
    viewport.innerHTML = `
      <div class="max-w-2xl mx-auto w-full space-y-5">
        <div>
          <h2 class="text-lg font-semibold text-white">${this.t('privacy_title')}</h2>
          <p class="text-xs text-[#a0a0a0]">Strict transparency regarding telemetry, network traffic, and local data storage.</p>
        </div>

        <div class="metric-card p-5 space-y-4 text-xs leading-relaxed text-slate-300">
          <div class="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
            Strict Architecture Guarantee: Zero Download Testing
          </div>

          <p>${this.t('privacy_body_1')}</p>
          <p>${this.t('privacy_body_2')}</p>
          <p>${this.t('privacy_body_3')}</p>

          <div class="pt-4 border-t border-white/10 space-y-2">
            <h4 class="font-semibold text-white">Local Data Locations on Windows 11:</h4>
            <ul class="list-disc list-inside space-y-1 text-[#a0a0a0] font-mono text-[11px]">
              <li>%LOCALAPPDATA%\\UploadPulse\\settings.json</li>
              <li>%LOCALAPPDATA%\\UploadPulse\\history.json</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  private showToast(msg: string, type: 'info' | 'success' | 'error' = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const color =
      type === 'success'
        ? 'border-emerald-500/30 bg-emerald-950/90 text-emerald-200'
        : type === 'error'
        ? 'border-rose-500/30 bg-rose-950/90 text-rose-200'
        : 'border-[#60cdff]/30 bg-[#2c2c2c]/95 text-[#60cdff]';

    toast.className = `px-4 py-2.5 rounded shadow-2xl border text-xs font-medium transition-all transform duration-200 opacity-0 translate-y-2 pointer-events-auto ${color}`;
    toast.textContent = msg;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 200);
    }, 3200);
  }
}

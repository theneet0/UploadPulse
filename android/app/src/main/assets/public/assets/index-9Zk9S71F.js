(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={languageCode:`en`,direction:`ltr`,strings:{app_title:`UploadPulse & SpeedTest Suite`,nav_test:`Speed Test`,nav_servers:`Servers`,nav_history:`History`,nav_settings:`Settings`,nav_privacy:`Privacy`,start_test:`Start Speed Test`,stop_test:`Stop Test`,mode_both:`Download & Upload`,mode_download:`Download`,mode_upload:`Upload`,state_idle:`Ready to test`,state_discovering:`Discovering servers...`,state_measuring_latency:`Measuring latency & jitter...`,state_downloading:`Downloading...`,state_uploading:`Uploading...`,state_completed:`Test completed`,state_cancelled:`Test cancelled`,state_failed:`Test failed`,meter_current:`Current Speed`,meter_peak:`Peak Speed`,meter_average:`Average Speed`,meter_download:`Download Speed`,meter_upload:`Upload Speed`,meter_latency:`Latency (Ping)`,meter_jitter:`Jitter`,meter_confirmed_data:`Server-confirmed data`,meter_transmitted_data:`Transmitted Volume`,meter_workers:`Active Connections`,server_auto:`Automatic Server Selection`,server_manual:`Manual Selection`,server_custom:`Custom Server URL`,server_search_placeholder:`Search servers by city, sponsor, or ID...`,server_custom_placeholder:`https://custom-server.com/speedtest/upload.php`,copy_result:`Copy Result`,copy_with_server:`Copy with Server Details`,copied_toast:`Result copied to clipboard`,repeat_test:`Repeat Test`,delete_record:`Delete Record`,clear_history:`Clear All History`,clear_confirm_title:`Clear Test History`,clear_confirm_msg:`Are you sure you want to permanently delete all recorded test history? This action cannot be undone.`,export_csv:`Export CSV`,export_json:`Export JSON`,history_empty:`No speed tests recorded yet.`,settings_network:`Network Configuration`,settings_test_mode:`Test Mode`,settings_duration:`Test Duration (seconds)`,settings_workers:`Concurrent Connection Threads`,settings_workers_auto:`Auto (Default 8)`,settings_protocol:`Test Protocol`,settings_latency_mode:`Latency Mode`,settings_jitter_samples:`Jitter Ping Samples`,settings_ip_version:`IP Protocol Version`,settings_warmup:`Warm-up Phase (seconds)`,settings_saving_mode:`Saving Mode (reduces bandwidth)`,settings_proxy:`Proxy URL (http/https/socks5)`,settings_source_ip:`Source IP (local interface IPv4/IPv6)`,settings_custom_dns:`Custom DNS Resolver (e.g. 1.1.1.1:53)`,settings_user_agent:`Custom User-Agent`,settings_virtual_city:`Virtual City Name`,settings_coordinates:`Virtual Coordinates (Lat / Lon)`,settings_server_filter:`Server Search Filter Keyword`,settings_country_filter:`Country ISO Code (e.g. US, DE, IR)`,settings_display:`Display Preferences`,settings_speed_unit:`Speed Unit`,settings_precision:`Decimal Precision`,settings_theme:`Theme`,settings_mica:`Enable Windows 11 Mica Backdrop`,settings_reduced_motion:`Reduced Motion`,settings_chart:`Show Live Throughput Chart`,settings_chart_points:`Chart Data Points Retention`,settings_sound_alert:`Play Audio Alert on Completion`,settings_auto_start:`Auto-start Test on App Launch`,settings_privacy_mask:`Mask IP and Sensitive Information`,settings_language:`Language`,privacy_title:`Privacy & Traffic Notice`,privacy_body_1:`UploadPulse is an advanced, high-precision speed test suite. It supports full download, upload, jitter, and latency benchmarks according to your selected configuration.`,privacy_body_2:`Tests saturate your downstream and upstream connections with random binary payloads to accurately measure network throughput and buffer bloat.`,privacy_body_3:`UploadPulse contains zero telemetry, zero analytics, zero advertisements, and no cloud accounts. All settings and history remain strictly on your device in %LOCALAPPDATA%\\UploadPulse.`,unavailable:`Unavailable`,save_settings:`Save Settings`,settings_saved:`Settings saved successfully`}},t={network:{testMode:`both`,durationSeconds:15,workerCount:8,protocol:`http`,latencyMode:`http`,jitterSampleCount:10,ipVersion:`auto`,warmupSeconds:0,savingMode:!1,proxyURL:``,sourceIP:``,customDNSServer:``,userAgent:`UploadPulse/2.0.0 (Windows 11 x64; Advanced SpeedTest Suite)`,virtualCity:``,latitude:0,longitude:0,serverSearchKeyword:``,countryFilter:``,serverSelectionMode:`auto`,selectedServerID:``,customServerURL:``},display:{speedUnit:`Mbps`,decimalPrecision:2,theme:`system`,enableMica:!0,reducedMotion:!1,showLiveChart:!0,chartRetentionPoints:40,completionNotification:!0,soundAlert:!0,autoStartOnLaunch:!1,maskSensitiveData:!1,language:`en`},history:{maxRecords:100,retentionDays:90}},n=(()=>{try{let e=localStorage.getItem(`uploadpulse_settings`);if(e)return JSON.parse(e)}catch{}return t})(),r=(()=>{try{let e=localStorage.getItem(`uploadpulse_history`);if(e)return JSON.parse(e)}catch{}return[]})(),i=null,a={},o=!!(window.go&&window.go.main&&window.go.main.App),s={async getSettings(){return o?window.go.main.App.GetSettings():n},async updateSettings(e){return o?window.go.main.App.UpdateSettings(e):(n=e,localStorage.setItem(`uploadpulse_settings`,JSON.stringify(e)),n)},async getHistory(){return o?window.go.main.App.GetHistory():r},async queryHistory(e,t,n){if(o)return window.go.main.App.QueryHistory(e,t,n);let i=[...r];if(e.trim()){let t=e.toLowerCase();i=i.filter(e=>e.server.name.toLowerCase().includes(t)||e.server.sponsor.toLowerCase().includes(t)||e.server.city.toLowerCase().includes(t)||e.id.toLowerCase().includes(t))}return i.sort((e,r)=>{let i=e.timestamp,a=r.timestamp;return t===`speed`?(i=e.avgUploadSpeedBps,a=r.avgUploadSpeedBps):t===`latency`&&(i=e.latencyMs,a=r.latencyMs),i<a?n?1:-1:i>a?n?-1:1:0}),i},async deleteHistoryRecord(e){if(o)return window.go.main.App.DeleteHistoryRecord(e);r=r.filter(t=>t.id!==e),localStorage.setItem(`uploadpulse_history`,JSON.stringify(r))},async clearHistory(){if(o)return window.go.main.App.ClearHistory();r=[],localStorage.setItem(`uploadpulse_history`,JSON.stringify([]))},async exportCSV(){if(o)return window.go.main.App.ExportCSV();let e=[`RecordID`,`Timestamp`,`Success`,`AvgUploadSpeed_Bps`,`PeakUploadSpeed_Bps`,`Latency_ms`,`Transferred_Bytes`,`ServerConfirmed_Bytes`,`Duration_s`,`ServerName`,`ServerCity`,`ServerCountry`,`ClientIP`],t=r.map(e=>[e.id,e.timestamp,e.success?`true`:`false`,e.avgUploadSpeedBps,e.peakUploadSpeedBps,e.latencyMs,e.transferredBytes,e.serverConfirmedBytes,e.durationSeconds,e.server.name,e.server.city,e.server.country,e.clientIP]);return[e.join(`,`),...t.map(e=>e.join(`,`))].join(`
`)},async exportJSON(){return o?window.go.main.App.ExportJSON():JSON.stringify(r,null,2)},async copySummary(e,t){if(o)return window.go.main.App.CopySummary(e,t);let n=r.find(t=>t.id===e)||r[0];if(!n)return`UploadPulse Result: No test recorded.`;let i=`UploadPulse Pure Upload Test Result\n=====================================\nAverage Upload Speed : ${(n.avgUploadSpeedBps/1e6).toFixed(2)} Mbps\nPeak Upload Speed    : ${(n.peakUploadSpeedBps/1e6).toFixed(2)} Mbps\nLatency (Ping)       : ${n.latencyMs} ms\nTransferred Volume   : ${(n.transferredBytes/1048576).toFixed(2)} MB\nTimestamp            : ${n.timestamp}\nDuration             : ${n.durationSeconds}s`;return t&&n.server&&(i+=`\nServer               : ${n.server.name} (${n.server.city}, ${n.server.country})`),i},async discoverServers(){return o?window.go.main.App.DiscoverServers():[{id:`auto-1`,name:`Frankfurt Optimal Uplink`,sponsor:`CoreBackbone GmbH`,country:`Germany`,city:`Frankfurt`,distance:24,latencyMs:14,url:`https://fra1.speedtest.net/speedtest/upload.php`,host:`fra1.speedtest.net`,available:!0},{id:`auto-2`,name:`London Cloud Telemetry`,sponsor:`Vodafone UK`,country:`United Kingdom`,city:`London`,distance:280,latencyMs:22,url:`https://lon1.speedtest.net/speedtest/upload.php`,host:`lon1.speedtest.net`,available:!0},{id:`auto-3`,name:`Amsterdam Fiber PoP`,sponsor:`KPN B.V.`,country:`Netherlands`,city:`Amsterdam`,distance:190,latencyMs:18,url:`https://ams1.speedtest.net/speedtest/upload.php`,host:`ams1.speedtest.net`,available:!0},{id:`auto-4`,name:`Tehran Uplink Exchange`,sponsor:`MCI Data Hub`,country:`Iran`,city:`Tehran`,distance:3800,latencyMs:48,url:`https://thr1.speedtest.ir/speedtest/upload.php`,host:`thr1.speedtest.ir`,available:!0}]},async pingServer(e){return o?window.go.main.App.PingServer(e):Math.floor(12+Math.random()*20)},async validateCustomServer(e){return o?window.go.main.App.ValidateCustomServer(e):{id:`custom-1`,name:`Custom Verified Upload Server`,sponsor:`Private Upload Host`,country:`Dedicated Target`,city:`Custom Endpoint`,distance:0,latencyMs:16,url:e,host:new URL(e).host,available:!0}},async startTest(){return o?window.go.main.App.StartTest():this.runSimulatedTest(n.network.testMode||`both`)},async startDownloadTest(){return o&&window.go?.main?.App?.StartDownloadTest?window.go.main.App.StartDownloadTest():this.runSimulatedTest(`download`)},async startUploadTest(){return o&&window.go?.main?.App?.StartUploadTest?window.go.main.App.StartUploadTest():this.runSimulatedTest(`upload`)},async runSimulatedTest(e){i&&clearInterval(i);let t=`sim-`+Date.now();s.emit(`test:state`,{state:`discovering_servers`,sessionID:t,progressPercent:8,message:`Discovering optimal speedtest server...`}),await new Promise(e=>setTimeout(e,450)),s.emit(`test:state`,{state:`measuring_latency`,sessionID:t,progressPercent:18,message:`Benchmarking latency & jitter (10 ping samples)...`});let a=14.5,o=2.1;await new Promise(e=>setTimeout(e,450));let c=Math.max(5,n.network.durationSeconds||15),l=e===`both`||e===`download`,u=e===`both`||e===`upload`,d=e===`both`?c/2:c,f=l?`download`:`upload`,p=0,m=0,h=0,g=0,_=0,v=0;return s.emit(`test:state`,{state:f===`download`?`downloading`:`uploading`,sessionID:t,progressPercent:20,message:f===`download`?`Testing download speed...`:`Testing upload speed...`}),i=setInterval(()=>{let y=.25;p+=y,m+=y;let b=Math.sin(p*2)*.12+(Math.random()-.5)*.08,x=0;f===`download`?(x=Math.max(2e7,118e6*(1+b)),x>_&&(_=x),h+=x*y/8):(x=Math.max(15e6,65e6*(1+b)),x>v&&(v=x),g+=x*y/8);let S=h+g,C=Math.min(95,20+m/c*75);if(s.emit(`test:metrics`,{sessionID:t,testMode:e,phase:f,instantaneousSpeedBps:x,peakSpeedBps:f===`download`?_:v,averageSpeedBps:f===`download`?h*8/p:g*8/p,transferredBytes:Math.floor(S),downloadBytes:Math.floor(h),uploadBytes:Math.floor(g),serverConfirmedBytes:Math.floor(S*.99),serverConfirmedRatio:.99,elapsedSeconds:m,estimatedRemainingSeconds:Math.max(0,c-m),activeWorkers:n.network.workerCount||8,latencyMs:a,jitterMs:o,minLatencyMs:13.1,maxLatencyMs:18.2}),s.emit(`test:state`,{state:f===`download`?`downloading`:`uploading`,sessionID:t,progressPercent:Math.floor(C),message:`${f===`download`?`Downloading`:`Uploading`}: ${(x/1e6).toFixed(1)} Mbps`}),f===`download`&&u&&p>=d){f=`upload`,p=0,s.emit(`test:state`,{state:`uploading`,sessionID:t,progressPercent:Math.floor(C),message:`Swapping to upload phase...`});return}if(m>=c){clearInterval(i),i=null;let f=l?h*8/(u?d:c):0,p=u?g*8/(l?d:c):0,m={id:t,timestamp:new Date().toISOString(),success:!0,testMode:e,avgDownloadSpeedBps:f,peakDownloadSpeedBps:_,avgUploadSpeedBps:p,peakUploadSpeedBps:v,finalStableSpeedBps:x,durationSeconds:c,downloadBytes:Math.floor(h),uploadBytes:Math.floor(g),transferredBytes:Math.floor(S),serverConfirmedBytes:Math.floor(S*.99),serverConfirmedRatio:.99,latencyMs:a,jitterMs:o,minLatencyMs:13.1,maxLatencyMs:18.2,clientIP:`192.168.1.105`,isp:`Gigabit Fiber Uplink`,server:{id:`auto-1`,name:`Frankfurt Optimal Cloud Hub`,sponsor:`CoreBackbone Global`,country:`Germany`,city:`Frankfurt`,distance:24,latency:a,jitterMs:o,minLatency:13.1,maxLatency:18.2,host:`fra1.speedtest.net`},effectiveSettings:{...n.network,testMode:e}};r.unshift(m),localStorage.setItem(`uploadpulse_history`,JSON.stringify(r)),s.emit(`test:state`,{state:`completed`,sessionID:t,progressPercent:100,message:`Speed test (${e.toUpperCase()}) completed successfully.`})}},250),{sessionID:t}},async cancelTest(){if(o)return window.go.main.App.CancelTest();i&&=(clearInterval(i),null),s.emit(`test:state`,{state:`cancelled`,sessionID:``,progressPercent:0,message:`Test cancelled by user.`})},async getLocale(t){return o&&window.go?.main?.App?.GetLocale?window.go.main.App.GetLocale(`en`):e},async testProxyConnection(e){return o&&window.go?.main?.App?.TestProxyConnection?window.go.main.App.TestProxyConnection(e):(e||``).trim()?(await new Promise(e=>setTimeout(e,600)),{success:!0,latencyMs:42,exitIp:`104.28.19.88 (V2Ray Simulated)`,message:`SOCKS5 connection verified! Exit IP: 104.28.19.88 (Ping: 42 ms)`}):{success:!1,latencyMs:0,exitIp:``,message:`Proxy URL is empty.`}},on(e,t){if(o&&window.runtime?.EventsOn){window.runtime.EventsOn(e,t);return}a[e]||(a[e]=[]),a[e].push(t)},emit(e,...t){if(o&&window.runtime?.EventsEmit){window.runtime.EventsEmit(e,...t);return}let n=a[e];n&&n.forEach(e=>e(...t))}},c=class{constructor(e){this.dataPoints=[],this.maxPoints=50,this.peakValue=0,this.canvas=document.createElement(`canvas`),this.canvas.className=`w-full h-full block`,e.appendChild(this.canvas),this.ctx=this.canvas.getContext(`2d`),this.resizeObserver=new ResizeObserver(()=>{this.resize(),this.render()}),this.resizeObserver.observe(this.canvas),this.resize()}setMaxPoints(e){this.maxPoints=Math.max(20,e)}addDataPoint(e){let t=e/1e6;this.dataPoints.push(t),this.dataPoints.length>this.maxPoints&&this.dataPoints.shift(),t>this.peakValue&&(this.peakValue=t),this.render()}clear(){this.dataPoints=[],this.peakValue=0,this.render()}resize(){let e=this.canvas.getBoundingClientRect(),t=window.devicePixelRatio||1;this.canvas.width=e.width*t,this.canvas.height=e.height*t,this.ctx.scale(t,t)}render(){let e=this.canvas.getBoundingClientRect(),t=e.width,n=e.height;if(t<=0||n<=0)return;this.ctx.clearRect(0,0,t,n),this.ctx.strokeStyle=`rgba(255, 255, 255, 0.05)`,this.ctx.lineWidth=1;for(let e=1;e<=3;e++){let r=n/4*e;this.ctx.beginPath(),this.ctx.moveTo(0,r),this.ctx.lineTo(t,r),this.ctx.stroke()}if(this.dataPoints.length<2)return;let r=Math.max(10,Math.ceil(this.peakValue*1.15)),i=t/(this.maxPoints-1),a=t-(this.dataPoints.length-1)*i,o=this.ctx.createLinearGradient(0,0,0,n);o.addColorStop(0,`rgba(96, 205, 255, 0.28)`),o.addColorStop(.7,`rgba(96, 205, 255, 0.08)`),o.addColorStop(1,`rgba(96, 205, 255, 0.0)`),this.ctx.beginPath(),this.dataPoints.forEach((e,t)=>{let o=a+t*i,s=n-e/r*(n-20)-10;if(t===0)this.ctx.moveTo(o,s);else{let e=a+(t-1)*i,c=this.dataPoints[t-1],l=n-c/r*(n-20)-10,u=(e+o)/2;this.ctx.quadraticCurveTo(e,l,u,(l+s)/2)}});let s=a+(this.dataPoints.length-1)*i;this.ctx.lineTo(s,n),this.ctx.lineTo(a,n),this.ctx.closePath(),this.ctx.fillStyle=o,this.ctx.fill(),this.ctx.beginPath(),this.dataPoints.forEach((e,t)=>{let o=a+t*i,s=n-e/r*(n-20)-10;if(t===0)this.ctx.moveTo(o,s);else{let e=a+(t-1)*i,c=this.dataPoints[t-1],l=n-c/r*(n-20)-10,u=(e+o)/2;this.ctx.quadraticCurveTo(e,l,u,(l+s)/2)}}),this.ctx.strokeStyle=`#60cdff`,this.ctx.lineWidth=2.5,this.ctx.stroke();let c=n-this.dataPoints[this.dataPoints.length-1]/r*(n-20)-10;this.ctx.beginPath(),this.ctx.arc(s,c,4.5,0,Math.PI*2),this.ctx.fillStyle=`#60cdff`,this.ctx.fill(),this.ctx.lineWidth=2,this.ctx.strokeStyle=`#ffffff`,this.ctx.stroke()}destroy(){this.resizeObserver.disconnect()}},l=class{constructor(t,n){this.locale=e,this.activeTab=`test`,this.currentState={state:`idle`,sessionID:``,progressPercent:0,message:`Ready to test`},this.currentMetrics={sessionID:``,instantaneousSpeedBps:0,peakSpeedBps:0,averageSpeedBps:0,avgDownloadSpeedBps:0,avgUploadSpeedBps:0,transferredBytes:0,downloadBytes:0,uploadBytes:0,serverConfirmedBytes:0,serverConfirmedRatio:1,elapsedSeconds:0,estimatedRemainingSeconds:0,activeWorkers:8,latencyMs:0,jitterMs:0},this.liveChart=null,this.serversList=[],this.historyList=[],this.historySearchQuery=``,this.historySortBy=`date`,this.historySortDesc=!0,this.isTesting=!1,this.container=t,this.settings=n}async init(){this.locale=await s.getLocale(`en`),document.body.setAttribute(`dir`,`ltr`),s.on(`test:state`,e=>{this.currentState=e,this.isTesting=e.state===`discovering_servers`||e.state===`measuring_latency`||e.state===`downloading`||e.state===`uploading`,this.updateStateBanner(),this.updateActionButtons()}),s.on(`test:metrics`,e=>{this.currentMetrics=e,this.updateMeterValues(),this.liveChart&&this.settings.display.showLiveChart&&this.liveChart.addDataPoint(e.instantaneousSpeedBps)}),this.render(),this.refreshHistory(),this.refreshServers()}t(t){return this.locale?.strings?.[t]||e.strings[t]||t}formatSpeed(e){if(e==null||e<=0)return`-- ${this.settings.display.speedUnit}`;let t=this.settings.display.speedUnit||`Mbps`,n=this.settings.display.decimalPrecision??2,r=0;switch(t){case`MBps`:r=e/8e6;break;case`kbps`:r=e/1e3;break;case`kBps`:r=e/8e3;break;case`Gbps`:r=e/1e9;break;default:r=e/1e6}return`${r.toFixed(n)} ${t}`}formatBytes(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(1)} KB`:e<1073741824?`${(e/1048576).toFixed(1)} MB`:`${(e/1073741824).toFixed(2)} GB`}render(){this.container.innerHTML=`
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
            <button id="nav-test" class="nav-item flex-1 md:w-full ${this.activeTab===`test`?`active`:``}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span class="nav-label">${this.t(`nav_test`)}</span>
            </button>

            <button id="nav-servers" class="nav-item flex-1 md:w-full ${this.activeTab===`servers`?`active`:``}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <span class="nav-label">${this.t(`nav_servers`)}</span>
            </button>

            <button id="nav-history" class="nav-item flex-1 md:w-full ${this.activeTab===`history`?`active`:``}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span class="nav-label">${this.t(`nav_history`)}</span>
            </button>

            <button id="nav-settings" class="nav-item flex-1 md:w-full ${this.activeTab===`settings`?`active`:``}">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span class="nav-label">${this.t(`nav_settings`)}</span>
            </button>
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
    `,this.bindGlobalEvents(),this.renderCurrentView()}bindGlobalEvents(){[`test`,`servers`,`history`,`settings`].forEach(e=>{let t=document.getElementById(`nav-${e}`);t&&(t.onclick=()=>{this.activeTab=e,this.render()})})}renderCurrentView(){let e=document.getElementById(`view-viewport`);if(e)switch(this.liveChart&&=(this.liveChart.destroy(),null),this.activeTab){case`test`:this.renderTestView(e);break;case`servers`:this.renderServersView(e);break;case`history`:this.renderHistoryView(e);break;case`settings`:this.renderSettingsView(e)}}renderTestView(e){let t=this.settings.network.serverSelectionMode===`custom`?this.settings.network.customServerURL||this.t(`server_custom`):this.settings.network.serverSelectionMode===`manual`&&this.settings.network.selectedServerID?`Server ID ${this.settings.network.selectedServerID}`:`Frankfurt, Germany - CoreBackbone`,n=this.settings.network.testMode||`both`;e.innerHTML=`
      <div class="max-w-4xl mx-auto w-full flex flex-col items-center justify-center space-y-6 my-auto">
        
        <!-- Top Mode Selector Segmented Control -->
        <div class="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs gap-1 shadow-inner">
          <button id="btn-mode-both" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${n===`both`?`bg-[#60cdff] text-black shadow font-semibold`:`text-[#a0a0a0] hover:text-white hover:bg-white/5`}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/></svg>
            <span>Download & Upload</span>
          </button>
          <button id="btn-mode-download" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${n===`download`?`bg-[#60cdff] text-black shadow font-semibold`:`text-[#a0a0a0] hover:text-white hover:bg-white/5`}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg>
            <span>Download</span>
          </button>
          <button id="btn-mode-upload" class="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${n===`upload`?`bg-[#60cdff] text-black shadow font-semibold`:`text-[#a0a0a0] hover:text-white hover:bg-white/5`}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V4m0 0l-6 6m6-6l6 6"/></svg>
            <span>Upload</span>
          </button>
        </div>

        <!-- Status Badge -->
        <div id="status-badge" class="status-badge tracking-wider uppercase">
          ${this.currentState.message?this.currentState.message.toUpperCase():this.t(`state_idle`).toUpperCase()}
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
              ${this.currentState.state===`downloading`?`DOWNLOADING`:this.currentState.state===`uploading`?`UPLOADING`:this.currentState.state===`measuring_latency`?`LATENCY & JITTER`:n===`download`?`DOWNLOAD TEST`:n===`upload`?`UPLOAD TEST`:`DUAL BENCHMARK`}
            </div>
            <div id="meter-current-speed" class="speed-value">0.00</div>
            <div id="meter-unit" class="speed-unit">${this.settings.display.speedUnit}</div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button id="btn-start-stop" class="theme-btn-primary ${this.isTesting?`theme-btn-stop`:``}">
            <svg id="btn-action-icon" width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              ${this.isTesting?`<rect x="5" y="5" width="10" height="10" rx="1.5"/>`:`<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>`}
            </svg>
            <span id="btn-action-text">${this.isTesting?this.t(`stop_test`).toUpperCase():this.t(`start_test`).toUpperCase()}</span>
          </button>

          <button id="btn-toggle-chart" class="theme-btn-secondary flex items-center gap-1.5" title="Toggle Live Chart">
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/></svg>
            <span>${this.settings.display.showLiveChart?`Hide Chart`:`Show Chart`}</span>
          </button>
        </div>

        <!-- Metric Group: 4 Clean Geometric Cards (Download, Upload, Latency, Jitter) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
          <!-- Download Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-amber-400"><path d="M12 4v16m0 0l-6-6m6 6l6-6"/></svg>
                ${this.t(`meter_download`)}
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
                ${this.t(`meter_upload`)}
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
                ${this.t(`meter_latency`)}
              </span>
            </div>
            <div id="meter-latency-val" class="metric-value text-emerald-400 text-lg font-mono my-1">
              ${this.currentMetrics.latencyMs?this.currentMetrics.latencyMs+` ms`:`-- ms`}
            </div>
            <div id="meter-latency-range" class="text-[10px] text-[#a0a0a0] font-mono">
              ${this.currentMetrics.minLatencyMs?`Min: ${this.currentMetrics.minLatencyMs}ms`:`Min/Max: --`}
            </div>
          </div>

          <!-- Jitter Card -->
          <div class="metric-card flex flex-col justify-between">
            <div class="flex items-center justify-between text-xs text-[#a0a0a0]">
              <span class="font-medium flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="text-purple-400"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                ${this.t(`meter_jitter`)}
              </span>
            </div>
            <div id="meter-jitter-val" class="metric-value text-purple-400 text-lg font-mono my-1">
              ${this.currentMetrics.jitterMs===void 0?`-- ms`:this.currentMetrics.jitterMs+` ms`}
            </div>
            <div id="meter-jitter-quality" class="text-[10px] text-purple-300/80 font-mono">
              ${this.currentMetrics.jitterMs===void 0?`Stability`:this.currentMetrics.jitterMs<5?`Excellent`:this.currentMetrics.jitterMs<15?`Good`:`Fair`}
            </div>
          </div>
        </div>

        <!-- Transferred Volume & Flow Summary Card -->
        <div class="w-full max-w-2xl grid grid-cols-3 gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
          <div class="text-center">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Downloaded</div>
            <div id="meter-data-down" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes(this.currentMetrics.downloadBytes||0)}
            </div>
          </div>
          <div class="text-center border-x border-white/10">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Uploaded</div>
            <div id="meter-data-up" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes(this.currentMetrics.uploadBytes||this.currentMetrics.serverConfirmedBytes||0)}
            </div>
          </div>
          <div class="text-center">
            <div class="text-[10px] text-[#a0a0a0] uppercase tracking-wider">Total Volume</div>
            <div id="meter-data-total" class="font-mono text-white/90 font-medium mt-0.5">
              ${this.formatBytes((this.currentMetrics.downloadBytes||0)+(this.currentMetrics.uploadBytes||this.currentMetrics.serverConfirmedBytes||0))}
            </div>
          </div>
        </div>

        <!-- SOCKS5 / V2Ray Status Badge if Configured -->
        ${this.settings.network.proxyURL?`
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
        `:``}

        <!-- Server Info Card (Geometric Balance) -->
        <div class="w-full max-w-2xl flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div class="w-10 h-10 rounded-full bg-[#60cdff]/10 flex items-center justify-center text-[#60cdff] shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">${t}</div>
            <div class="text-xs text-[#a0a0a0] truncate">Mode: ${n.toUpperCase()} &bull; ${this.settings.network.workerCount||8} Active Connections ${this.settings.network.proxyURL?`&bull; Via SOCKS5`:``}</div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Verified</span>
          </div>
        </div>

        <!-- Live Upload / Download Chart Container -->
        <div id="chart-panel" class="w-full max-w-2xl h-44 rounded-lg bg-white/[0.02] border border-white/[0.08] p-3 flex flex-col ${this.settings.display.showLiveChart?``:`hidden`}">
          <div class="flex items-center justify-between text-[11px] text-[#a0a0a0] mb-2 px-1">
            <span class="font-medium text-white/80">Live Throughput Stream</span>
            <span class="text-[10px] font-mono text-[#60cdff]">${this.settings.display.speedUnit} / time</span>
          </div>
          <div id="chart-canvas-wrapper" class="flex-1 w-full h-full relative overflow-hidden"></div>
        </div>
      </div>
    `;let r=document.getElementById(`btn-mode-both`),i=document.getElementById(`btn-mode-download`),a=document.getElementById(`btn-mode-upload`),o=async t=>{this.settings.network.testMode=t,await s.updateSettings(this.settings),this.renderTestView(e),this.showToast(`Test mode switched to ${t.toUpperCase()}`,`info`)};if(r&&(r.onclick=()=>o(`both`)),i&&(i.onclick=()=>o(`download`)),a&&(a.onclick=()=>o(`upload`)),this.settings.display.showLiveChart){let e=document.getElementById(`chart-canvas-wrapper`);e&&(this.liveChart=new c(e),this.liveChart.setMaxPoints(this.settings.display.chartRetentionPoints||40))}let l=document.getElementById(`btn-start-stop`);l&&(l.onclick=async()=>{if(this.isTesting)await s.cancelTest();else{this.liveChart&&this.liveChart.clear();try{let e=this.settings.network.testMode||`both`;e===`download`?await s.startDownloadTest():e===`upload`?await s.startUploadTest():await s.startTest()}catch(e){this.showToast(`Error starting test: ${e?.message||e}`,`error`)}}});let u=document.getElementById(`btn-toggle-chart`);u&&(u.onclick=()=>{this.settings.display.showLiveChart=!this.settings.display.showLiveChart,s.updateSettings(this.settings),this.renderTestView(e)});let d=document.getElementById(`btn-quick-test-proxy`);d&&(d.onclick=async()=>{d.textContent=`Testing...`,d.setAttribute(`disabled`,`true`);let e=await s.testProxyConnection(this.settings.network.proxyURL);d.removeAttribute(`disabled`),d.textContent=`Test Proxy`,e.success?this.showToast(e.message,`success`):this.showToast(e.message,`error`)}),this.updateStateBanner(),this.updateMeterValues()}updateStateBanner(){let e=document.getElementById(`status-badge`);e&&(e.textContent=this.currentState.message?this.currentState.message.toUpperCase():this.t(`state_idle`).toUpperCase());let t=document.getElementById(`meter-phase-label`);if(t){let e=this.settings.network.testMode||`both`;this.currentState.state===`downloading`?(t.textContent=`DOWNLOADING`,t.className=`text-[11px] font-bold uppercase tracking-widest text-amber-400 mb-0.5`):this.currentState.state===`uploading`?(t.textContent=`UPLOADING`,t.className=`text-[11px] font-bold uppercase tracking-widest text-[#60cdff] mb-0.5`):this.currentState.state===`measuring_latency`?(t.textContent=`LATENCY & JITTER`,t.className=`text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-0.5`):this.currentState.state===`completed`?(t.textContent=`TEST COMPLETED`,t.className=`text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5`):(t.textContent=e===`download`?`DOWNLOAD TEST`:e===`upload`?`UPLOAD TEST`:`DUAL BENCHMARK`,t.className=`text-[11px] font-bold uppercase tracking-widest text-[#60cdff] mb-0.5`)}let n=document.getElementById(`btn-action-text`);n&&(n.textContent=this.isTesting?this.t(`stop_test`).toUpperCase():this.t(`start_test`).toUpperCase());let r=document.getElementById(`meter-circle-progress`);if(r){let e=276.46,t=e-(this.currentState.progressPercent||0)/100*e;r.style.strokeDashoffset=`${t}`,this.currentState.state===`downloading`?r.setAttribute(`stroke`,`#fbbf24`):this.currentState.state===`uploading`?r.setAttribute(`stroke`,`#60cdff`):this.currentState.state===`measuring_latency`?r.setAttribute(`stroke`,`#c084fc`):r.setAttribute(`stroke`,`#60cdff`)}}updateActionButtons(){let e=document.getElementById(`btn-start-stop`);e&&(this.isTesting?e.classList.add(`theme-btn-stop`):e.classList.remove(`theme-btn-stop`))}updateMeterValues(){let e=document.getElementById(`meter-current-speed`),t=this.settings.display.speedUnit,n=this.settings.display.decimalPrecision??2,r=e=>{switch(t){case`MBps`:return(e/8e6).toFixed(n);case`kbps`:return(e/1e3).toFixed(n);case`kBps`:return(e/8e3).toFixed(n);case`Gbps`:return(e/1e9).toFixed(n);default:return(e/1e6).toFixed(n)}};e&&(e.textContent=r(this.currentMetrics.instantaneousSpeedBps));let i=document.getElementById(`meter-download-speed`),a=document.getElementById(`meter-download-peak`);(this.currentMetrics.phase===`download`||this.currentMetrics.avgDownloadSpeedBps)&&(i&&(i.textContent=`${r(this.currentMetrics.phase===`download`?this.currentMetrics.instantaneousSpeedBps:this.currentMetrics.avgDownloadSpeedBps||0)} ${t}`),a&&this.currentMetrics.peakSpeedBps&&this.currentMetrics.phase===`download`&&(a.textContent=`Peak: ${r(this.currentMetrics.peakSpeedBps)} ${t}`));let o=document.getElementById(`meter-upload-speed`),s=document.getElementById(`meter-upload-peak`);(this.currentMetrics.phase===`upload`||this.currentMetrics.avgUploadSpeedBps||this.currentMetrics.averageSpeedBps)&&(o&&(o.textContent=`${r(this.currentMetrics.phase===`upload`?this.currentMetrics.instantaneousSpeedBps:this.currentMetrics.avgUploadSpeedBps||this.currentMetrics.averageSpeedBps||0)} ${t}`),s&&this.currentMetrics.peakSpeedBps&&this.currentMetrics.phase===`upload`&&(s.textContent=`Peak: ${r(this.currentMetrics.peakSpeedBps)} ${t}`));let c=document.getElementById(`meter-latency-val`),l=document.getElementById(`meter-latency-range`);c&&this.currentMetrics.latencyMs&&(c.textContent=`${this.currentMetrics.latencyMs} ms`),l&&this.currentMetrics.minLatencyMs&&(l.textContent=`Min: ${this.currentMetrics.minLatencyMs}ms | Max: ${this.currentMetrics.maxLatencyMs}ms`);let u=document.getElementById(`meter-jitter-val`),d=document.getElementById(`meter-jitter-quality`);if(u&&this.currentMetrics.jitterMs!==void 0&&(u.textContent=`${this.currentMetrics.jitterMs} ms`,d)){let e=this.currentMetrics.jitterMs;d.textContent=e<5?`Excellent (<5ms)`:e<15?`Good (<15ms)`:`Moderate`}let f=document.getElementById(`meter-data-down`),p=document.getElementById(`meter-data-up`),m=document.getElementById(`meter-data-total`),h=this.currentMetrics.downloadBytes||0,g=this.currentMetrics.uploadBytes||this.currentMetrics.serverConfirmedBytes||0;f&&(f.textContent=this.formatBytes(h)),p&&(p.textContent=this.formatBytes(g)),m&&(m.textContent=this.formatBytes(h+g))}renderServersView(e){e.innerHTML=`
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
          <div id="mode-card-auto" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode===`auto`?`border-[#60cdff] bg-[#60cdff]/10`:``}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="auto" ${this.settings.network.serverSelectionMode===`auto`?`checked`:``}/>
              <span>${this.t(`server_auto`)}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Automatically selects nearest low-latency verified speedtest host.</p>
          </div>

          <div id="mode-card-manual" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode===`manual`?`border-[#60cdff] bg-[#60cdff]/10`:``}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="manual" ${this.settings.network.serverSelectionMode===`manual`?`checked`:``}/>
              <span>${this.t(`server_manual`)}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Pick from public servers with measured ping latency.</p>
          </div>

          <div id="mode-card-custom" class="metric-card cursor-pointer transition ${this.settings.network.serverSelectionMode===`custom`?`border-[#60cdff] bg-[#60cdff]/10`:``}">
            <div class="flex items-center gap-2 font-medium text-xs text-white mb-1">
              <input type="radio" name="srv-mode" value="custom" ${this.settings.network.serverSelectionMode===`custom`?`checked`:``}/>
              <span>${this.t(`server_custom`)}</span>
            </div>
            <p class="text-[11px] text-[#a0a0a0]">Specify an enterprise endpoint or custom speedtest URL.</p>
          </div>
        </div>

        <!-- Custom Server Input Bar -->
        <div id="custom-server-panel" class="metric-card space-y-2 ${this.settings.network.serverSelectionMode===`custom`?``:`hidden`}">
          <label class="text-xs font-semibold text-white">Custom Upload Server URL</label>
          <div class="flex items-center gap-2">
            <input id="input-custom-url" type="text" class="theme-input flex-1 px-3 py-1.5 text-xs" placeholder="${this.t(`server_custom_placeholder`)}" value="${this.settings.network.customServerURL||``}"/>
            <button id="btn-validate-custom" class="theme-btn-secondary text-[#60cdff] font-semibold text-xs">Validate</button>
          </div>
          <p class="text-[11px] text-[#a0a0a0]">Supports standard HTTP/HTTPS/TCP upload testing endpoints.</p>
        </div>

        <!-- Servers Table -->
        <div class="rounded-lg bg-[#323232] border border-white/[0.08] overflow-hidden">
          <div class="p-3 border-b border-white/[0.08] flex items-center justify-between">
            <input id="input-server-search" type="text" class="theme-input px-3 py-1 text-xs w-72" placeholder="${this.t(`server_search_placeholder`)}"/>
            <span class="text-xs text-[#a0a0a0]">${this.serversList.length} servers available</span>
          </div>

          <div class="divide-y divide-white/5 max-h-96 overflow-y-auto">
            ${this.serversList.length===0?`<div class="p-6 text-center text-xs text-[#a0a0a0]">Loading server list...</div>`:this.serversList.map(e=>`
              <div class="p-3 flex items-center justify-between hover:bg-white/[0.03] transition">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full ${e.available?`bg-emerald-400`:`bg-slate-600`}"></div>
                  <div>
                    <div class="text-xs font-medium text-white flex items-center gap-2">
                      <span>${e.name}</span>
                      <span class="text-[10px] text-[#a0a0a0]">(${e.city}, ${e.country})</span>
                    </div>
                    <div class="text-[10px] text-[#a0a0a0]">${e.sponsor} &middot; ${e.distance?e.distance.toFixed(0)+` km`:`Nearby`}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono text-[#60cdff] font-semibold">${e.latencyMs?e.latencyMs+` ms`:`--`}</span>
                  <button class="btn-select-srv theme-btn-secondary px-3 py-1 text-xs" data-id="${e.id}">
                    ${this.settings.network.selectedServerID===e.id?`Selected`:`Select`}
                  </button>
                </div>
              </div>
            `).join(``)}
          </div>
        </div>
      </div>
    `,[`auto`,`manual`,`custom`].forEach(t=>{let n=document.getElementById(`mode-card-${t}`);n&&(n.onclick=async()=>{this.settings.network.serverSelectionMode=t,await s.updateSettings(this.settings),this.renderServersView(e)})});let t=document.getElementById(`btn-validate-custom`);t&&(t.onclick=async()=>{let e=document.getElementById(`input-custom-url`);if(!e||!e.value.trim()){this.showToast(`Please enter a custom server URL.`,`error`);return}try{let t=await s.validateCustomServer(e.value.trim());this.settings.network.customServerURL=e.value.trim(),await s.updateSettings(this.settings),this.showToast(`Verified custom server! Ping: ${t.latencyMs} ms`,`success`)}catch(e){this.showToast(`Validation failed: ${e?.message||e}`,`error`)}});let n=document.getElementById(`btn-refresh-servers`);n&&(n.onclick=()=>{this.refreshServers()}),e.querySelectorAll(`.btn-select-srv`).forEach(t=>{t.onclick=async t=>{let n=t.currentTarget.getAttribute(`data-id`)||``;this.settings.network.selectedServerID=n,this.settings.network.serverSelectionMode=`manual`,await s.updateSettings(this.settings),this.showToast(`Selected server ID: ${n}`,`success`),this.renderServersView(e)}})}async refreshServers(){try{if(this.serversList=await s.discoverServers(),this.activeTab===`servers`){let e=document.getElementById(`view-viewport`);e&&this.renderServersView(e)}}catch(e){console.warn(`Could not discover servers:`,e)}}renderHistoryView(e){e.innerHTML=`
      <div class="max-w-5xl mx-auto w-full space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">Speed Test History</h2>
            <p class="text-xs text-[#a0a0a0]">All benchmark records stored securely in your local %LOCALAPPDATA% directory.</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="btn-export-csv" class="theme-btn-secondary text-xs flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              <span>${this.t(`export_csv`)}</span>
            </button>
            <button id="btn-export-json" class="theme-btn-secondary text-xs flex items-center gap-1.5">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
              <span>${this.t(`export_json`)}</span>
            </button>
            <button id="btn-clear-history" class="theme-btn-secondary text-xs text-rose-400 hover:text-rose-300 border-rose-500/30">
              ${this.t(`clear_history`)}
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="metric-card flex items-center justify-between gap-4">
          <input id="input-history-search" type="text" class="theme-input px-3 py-1 text-xs w-64" placeholder="Search by server, city, mode..." value="${this.historySearchQuery}"/>

          <div class="flex items-center gap-2 text-xs text-[#a0a0a0]">
            <span>Sort by:</span>
            <select id="select-history-sort" class="theme-input px-2.5 py-1 text-xs bg-[#1c1c1c] text-white">
              <option value="date" ${this.historySortBy===`date`?`selected`:``}>Date (Newest)</option>
              <option value="speed" ${this.historySortBy===`speed`?`selected`:``}>Upload Speed</option>
              <option value="download" ${this.historySortBy===`download`?`selected`:``}>Download Speed</option>
              <option value="latency" ${this.historySortBy===`latency`?`selected`:``}>Latency (Ping)</option>
              <option value="jitter" ${this.historySortBy===`jitter`?`selected`:``}>Jitter</option>
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
              ${this.historyList.length===0?`<tr><td colspan="9" class="p-8 text-center text-[#a0a0a0]">${this.t(`history_empty`)}</td></tr>`:this.historyList.map(e=>{let t=e.testMode===`download`?`<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">DOWN</span>`:e.testMode===`upload`?`<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-[#60cdff]/10 text-[#60cdff] border border-[#60cdff]/20">UP</span>`:`<span class="px-2 py-0.5 text-[10px] font-medium rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">DUAL</span>`,n=e.avgDownloadSpeedBps?this.formatSpeed(e.avgDownloadSpeedBps):`--`,r=e.avgUploadSpeedBps?this.formatSpeed(e.avgUploadSpeedBps):`--`;return`
                          <tr class="hover:bg-white/[0.02] transition">
                            <td class="p-3 text-slate-300 font-mono text-[11px]">${new Date(e.timestamp).toLocaleString()}</td>
                            <td class="p-3">${t}</td>
                            <td class="p-3 font-semibold text-amber-400 font-mono">${n}</td>
                            <td class="p-3 font-semibold text-[#60cdff] font-mono">${r}</td>
                            <td class="p-3 font-mono text-emerald-400">${e.latencyMs} ms</td>
                            <td class="p-3 font-mono text-purple-400">${e.jitterMs===void 0?`--`:e.jitterMs+` ms`}</td>
                            <td class="p-3 text-[#a0a0a0] font-mono text-[11px]">${this.formatBytes((e.downloadBytes||0)+(e.uploadBytes||e.serverConfirmedBytes||0))}</td>
                            <td class="p-3 text-slate-200 text-[11px] max-w-[140px] truncate">${e.server?.name||`Auto Server`}</td>
                            <td class="p-3 text-right space-x-2">
                              <button class="btn-copy-rec theme-btn-secondary px-2.5 py-1 text-[11px]" data-id="${e.id}" title="Copy Result">Copy</button>
                              <button class="btn-delete-rec theme-btn-secondary px-2 py-1 text-[11px] text-rose-400 hover:text-rose-300" data-id="${e.id}" title="Delete Record">&times;</button>
                            </td>
                          </tr>
                        `}).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `;let t=document.getElementById(`input-history-search`);t&&(t.oninput=()=>{this.historySearchQuery=t.value,this.refreshHistory()});let n=document.getElementById(`select-history-sort`);n&&(n.onchange=()=>{this.historySortBy=n.value,this.refreshHistory()});let r=document.getElementById(`btn-export-csv`);r&&(r.onclick=async()=>{let e=await s.exportCSV(),t=new Blob([e],{type:`text/csv`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`uploadpulse-history-${Date.now()}.csv`,r.click(),URL.revokeObjectURL(n),this.showToast(`CSV export generated successfully.`,`success`)});let i=document.getElementById(`btn-export-json`);i&&(i.onclick=async()=>{let e=await s.exportJSON(),t=new Blob([e],{type:`application/json`}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=`uploadpulse-history-${Date.now()}.json`,r.click(),URL.revokeObjectURL(n),this.showToast(`JSON export generated successfully.`,`success`)});let a=document.getElementById(`btn-clear-history`);a&&(a.onclick=async()=>{confirm(this.t(`clear_confirm_msg`))&&(await s.clearHistory(),this.refreshHistory(),this.showToast(`All history cleared.`,`success`))}),e.querySelectorAll(`.btn-copy-rec`).forEach(e=>{e.onclick=async e=>{let t=e.currentTarget.getAttribute(`data-id`)||``,n=await s.copySummary(t,!0);navigator.clipboard.writeText(n),this.showToast(this.t(`copied_toast`),`success`)}}),e.querySelectorAll(`.btn-delete-rec`).forEach(e=>{e.onclick=async e=>{let t=e.currentTarget.getAttribute(`data-id`)||``;await s.deleteHistoryRecord(t),this.refreshHistory(),this.showToast(`Record deleted.`,`success`)}})}async refreshHistory(){try{if(this.historyList=await s.queryHistory(this.historySearchQuery,this.historySortBy,this.historySortDesc),this.activeTab===`history`){let e=document.getElementById(`view-viewport`);e&&this.renderHistoryView(e)}}catch(e){console.warn(`Could not refresh history:`,e)}}renderSettingsView(e){e.innerHTML=`
      <div class="max-w-3xl mx-auto w-full space-y-6 pb-12">
        <div>
          <h2 class="text-lg font-semibold text-white">${this.t(`nav_settings`)}</h2>
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
                <option value="both" ${(this.settings.network.testMode||`both`)===`both`?`selected`:``}>Download & Upload (Dual)</option>
                <option value="download" ${this.settings.network.testMode===`download`?`selected`:``}>Download Only</option>
                <option value="upload" ${this.settings.network.testMode===`upload`?`selected`:``}>Upload Only</option>
              </select>
            </div>

            <!-- Duration -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_duration`)}</label>
              <select id="cfg-duration" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="5" ${this.settings.network.durationSeconds===5?`selected`:``}>5 Seconds</option>
                <option value="10" ${this.settings.network.durationSeconds===10?`selected`:``}>10 Seconds</option>
                <option value="15" ${this.settings.network.durationSeconds===15?`selected`:``}>15 Seconds (Standard)</option>
                <option value="20" ${this.settings.network.durationSeconds===20?`selected`:``}>20 Seconds</option>
                <option value="30" ${this.settings.network.durationSeconds===30?`selected`:``}>30 Seconds (Extended)</option>
                <option value="60" ${this.settings.network.durationSeconds===60?`selected`:``}>60 Seconds (Heavy Stress)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Worker Connections -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_workers`)}</label>
              <select id="cfg-workers" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="1" ${this.settings.network.workerCount===1?`selected`:``}>1 Connection (Single-Thread / Low CPU)</option>
                <option value="2" ${this.settings.network.workerCount===2?`selected`:``}>2 Connections</option>
                <option value="4" ${this.settings.network.workerCount===4?`selected`:``}>4 Connections</option>
                <option value="8" ${this.settings.network.workerCount===8?`selected`:``}>8 Connections (Default Balanced)</option>
                <option value="16" ${this.settings.network.workerCount===16?`selected`:``}>16 Connections (High Throughput)</option>
                <option value="24" ${this.settings.network.workerCount===24?`selected`:``}>24 Connections (Heavy Pipe)</option>
                <option value="32" ${this.settings.network.workerCount===32?`selected`:``}>32 Connections (Max Stress)</option>
              </select>
            </div>

            <!-- Warmup Seconds -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Warm-up Phase (sec)</label>
              <select id="cfg-warmup" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="0" ${(this.settings.network.warmupSeconds||0)===0?`selected`:``}>0 Seconds (Disabled)</option>
                <option value="1" ${this.settings.network.warmupSeconds===1?`selected`:``}>1 Second</option>
                <option value="2" ${this.settings.network.warmupSeconds===2?`selected`:``}>2 Seconds</option>
                <option value="3" ${this.settings.network.warmupSeconds===3?`selected`:``}>3 Seconds</option>
                <option value="5" ${this.settings.network.warmupSeconds===5?`selected`:``}>5 Seconds</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Protocol -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_protocol`)}</label>
              <select id="cfg-protocol" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="http" ${this.settings.network.protocol===`http`?`selected`:``}>HTTP / HTTPS (Default)</option>
                <option value="tcp" ${this.settings.network.protocol===`tcp`?`selected`:``}>Raw TCP (Experimental)</option>
              </select>
            </div>

            <!-- Latency Mode -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_latency_mode`)}</label>
              <select id="cfg-latency-mode" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="http" ${this.settings.network.latencyMode===`http`?`selected`:``}>HTTP Ping (Default)</option>
                <option value="tcp" ${this.settings.network.latencyMode===`tcp`?`selected`:``}>TCP Ping</option>
                <option value="icmp" ${this.settings.network.latencyMode===`icmp`?`selected`:``}>ICMP (Raw Socket)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Jitter Ping Samples -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Jitter Ping Sample Count</label>
              <select id="cfg-jitter-samples" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="3" ${(this.settings.network.jitterPingSamples||10)===3?`selected`:``}>3 Samples (Fast)</option>
                <option value="5" ${(this.settings.network.jitterPingSamples||10)===5?`selected`:``}>5 Samples</option>
                <option value="10" ${(this.settings.network.jitterPingSamples||10)===10?`selected`:``}>10 Samples (Default)</option>
                <option value="15" ${(this.settings.network.jitterPingSamples||10)===15?`selected`:``}>15 Samples</option>
                <option value="20" ${(this.settings.network.jitterPingSamples||10)===20?`selected`:``}>20 Samples</option>
                <option value="30" ${(this.settings.network.jitterPingSamples||10)===30?`selected`:``}>30 Samples (High Precision)</option>
              </select>
            </div>

            <!-- IP Version -->
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">IP Protocol Stack</label>
              <select id="cfg-ip-version" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="auto" ${(this.settings.network.ipVersion||`auto`)===`auto`?`selected`:``}>Dual-Stack Auto (IPv4/IPv6)</option>
                <option value="ipv4" ${this.settings.network.ipVersion===`ipv4`?`selected`:``}>Force IPv4 Only</option>
                <option value="ipv6" ${this.settings.network.ipVersion===`ipv6`?`selected`:``}>Force IPv6 Only</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <div class="text-xs font-medium text-white">${this.t(`settings_saving_mode`)}</div>
              <div class="text-[11px] text-[#a0a0a0]">Limits concurrent upload threads to minimize metered data consumption.</div>
            </div>
            <input id="cfg-saving-mode" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.network.savingMode?`checked`:``}/>
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
                value="${this.settings.network.sourceIp||``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Custom DNS Resolver Server</label>
              <input id="cfg-custom-dns" type="text"
                placeholder="e.g. 1.1.1.1:53, 8.8.8.8:53"
                value="${this.settings.network.customDns||``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Custom HTTP User-Agent Header</label>
            <input id="cfg-user-agent" type="text"
              placeholder="e.g. UploadPulse/2.0.0 (Windows 11 x64)"
              value="${this.settings.network.userAgent||``}"
              class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual City Name</label>
              <input id="cfg-virtual-city" type="text"
                placeholder="e.g. Frankfurt"
                value="${this.settings.network.virtualCity||``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual Latitude</label>
              <input id="cfg-latitude" type="number" step="any"
                placeholder="50.1109"
                value="${this.settings.network.latitude!==null&&this.settings.network.latitude!==void 0?this.settings.network.latitude:``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Virtual Longitude</label>
              <input id="cfg-longitude" type="number" step="any"
                placeholder="8.6821"
                value="${this.settings.network.longitude!==null&&this.settings.network.longitude!==void 0?this.settings.network.longitude:``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white font-mono placeholder:text-neutral-600" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Server Search Keyword Filter</label>
              <input id="cfg-server-keyword" type="text"
                placeholder="e.g. Vodafone, Telecom, Core"
                value="${this.settings.network.serverSearchKeyword||``}"
                class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white placeholder:text-neutral-600" />
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Country ISO Code Filter</label>
              <input id="cfg-country-filter" type="text"
                placeholder="e.g. DE, US, IR, GB, FR"
                value="${this.settings.network.countryFilter||``}"
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
                value="${this.settings.network.proxyURL||``}"
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
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#60cdff]">${this.t(`settings_display`)}</h3>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#a0a0a0]">UI & Audio</span>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_speed_unit`)}</label>
              <select id="cfg-speed-unit" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="Mbps" ${this.settings.display.speedUnit===`Mbps`?`selected`:``}>Megabits/sec (Mbps)</option>
                <option value="MBps" ${this.settings.display.speedUnit===`MBps`?`selected`:``}>Megabytes/sec (MB/s)</option>
                <option value="Gbps" ${this.settings.display.speedUnit===`Gbps`?`selected`:``}>Gigabits/sec (Gbps)</option>
                <option value="kbps" ${this.settings.display.speedUnit===`kbps`?`selected`:``}>Kilobits/sec (kbps)</option>
                <option value="kBps" ${this.settings.display.speedUnit===`kBps`?`selected`:``}>Kilobytes/sec (kB/s)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Decimal Precision</label>
              <select id="cfg-precision" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="0" ${(this.settings.display.decimalPrecision??2)===0?`selected`:``}>0 Decimals (100 Mbps)</option>
                <option value="1" ${(this.settings.display.decimalPrecision??2)===1?`selected`:``}>1 Decimal (100.5 Mbps)</option>
                <option value="2" ${(this.settings.display.decimalPrecision??2)===2?`selected`:``}>2 Decimals (100.52 Mbps)</option>
                <option value="3" ${(this.settings.display.decimalPrecision??2)===3?`selected`:``}>3 Decimals (100.524 Mbps)</option>
                <option value="4" ${(this.settings.display.decimalPrecision??2)===4?`selected`:``}>4 Decimals (High precision)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">${this.t(`settings_language`)}</label>
              <select id="cfg-language" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white" disabled>
                <option value="en" selected>English</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Visual Theme</label>
              <select id="cfg-theme" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="dark" ${(this.settings.display.theme||`dark`)===`dark`?`selected`:``}>Windows 11 Dark (Mica)</option>
                <option value="light" ${this.settings.display.theme===`light`?`selected`:``}>Windows 11 Light (Fluent)</option>
                <option value="oled" ${this.settings.display.theme===`oled`?`selected`:``}>OLED High-Contrast Black</option>
                <option value="system" ${this.settings.display.theme===`system`?`selected`:``}>System Default</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Chart Retention Points</label>
              <select id="cfg-chart-points" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="20" ${(this.settings.display.chartRetentionPoints||40)===20?`selected`:``}>20 Data Points</option>
                <option value="40" ${(this.settings.display.chartRetentionPoints||40)===40?`selected`:``}>40 Points (Default)</option>
                <option value="60" ${(this.settings.display.chartRetentionPoints||40)===60?`selected`:``}>60 Points</option>
                <option value="100" ${(this.settings.display.chartRetentionPoints||40)===100?`selected`:``}>100 Points (Wide History)</option>
              </select>
            </div>
          </div>

          <div class="space-y-3 pt-2 border-t border-white/5">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Live Throughput Chart</div>
                <div class="text-[11px] text-[#a0a0a0]">Displays a real-time spline canvas graphing speed during active testing.</div>
              </div>
              <input id="cfg-show-chart" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.showLiveChart?`checked`:``}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Windows 11 Mica Glass Effect</div>
                <div class="text-[11px] text-[#a0a0a0]">Renders dynamic translucent acrylic backdrop styling.</div>
              </div>
              <input id="cfg-enable-mica" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.enableMica??!0?`checked`:``}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Desktop Notification on Test Completion</div>
                <div class="text-[11px] text-[#a0a0a0]">Triggers a native Windows 11 toast notification with final results.</div>
              </div>
              <input id="cfg-completion-notification" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.completionNotification??!0?`checked`:``}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Audio Alert Chime</div>
                <div class="text-[11px] text-[#a0a0a0]">Plays an acoustic sound chime when benchmarks finish.</div>
              </div>
              <input id="cfg-completion-sound" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.completionSound??!0?`checked`:``}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">Auto-start Test on Application Launch</div>
                <div class="text-[11px] text-[#a0a0a0]">Automatically initiates speed test immediately when the app opens.</div>
              </div>
              <input id="cfg-auto-start" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.autoStartOnLaunch??!1?`checked`:``}/>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <div class="text-xs font-medium text-white">${this.t(`settings_privacy_mask`)}</div>
                <div class="text-[11px] text-[#a0a0a0]">Masks client IP in exports and summaries (e.g. 192.168.***.***).</div>
              </div>
              <input id="cfg-mask-ip" type="checkbox" class="w-4 h-4 rounded accent-[#60cdff]" ${this.settings.display.maskSensitiveData?`checked`:``}/>
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
                <option value="25" ${(this.settings.history?.maxStoredRecords||100)===25?`selected`:``}>25 Records</option>
                <option value="50" ${(this.settings.history?.maxStoredRecords||100)===50?`selected`:``}>50 Records</option>
                <option value="100" ${(this.settings.history?.maxStoredRecords||100)===100?`selected`:``}>100 Records (Default)</option>
                <option value="250" ${(this.settings.history?.maxStoredRecords||100)===250?`selected`:``}>250 Records</option>
                <option value="500" ${(this.settings.history?.maxStoredRecords||100)===500?`selected`:``}>500 Records</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-medium text-[#a0a0a0] mb-1">Data Retention Period</label>
              <select id="cfg-retention-days" class="theme-input w-full px-3 py-1.5 text-xs bg-[#1c1c1c] text-white">
                <option value="30" ${(this.settings.history?.retentionDays||90)===30?`selected`:``}>30 Days</option>
                <option value="60" ${(this.settings.history?.retentionDays||90)===60?`selected`:``}>60 Days</option>
                <option value="90" ${(this.settings.history?.retentionDays||90)===90?`selected`:``}>90 Days (Default)</option>
                <option value="180" ${(this.settings.history?.retentionDays||90)===180?`selected`:``}>180 Days (Half Year)</option>
                <option value="365" ${(this.settings.history?.retentionDays||90)===365?`selected`:``}>365 Days (Full Year)</option>
                <option value="0" ${(this.settings.history?.retentionDays||90)===0?`selected`:``}>Keep Forever (Unlimited)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-end gap-3 pt-2">
          <button id="btn-save-settings" class="theme-btn-primary px-6 py-2.5 text-sm font-semibold">
            ${this.t(`save_settings`)}
          </button>
        </div>
      </div>
    `,e.querySelectorAll(`.btn-preset-proxy`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-url`)||``,n=document.getElementById(`cfg-proxy-url`);n&&(n.value=t,this.showToast(t?`Preset selected: ${t}`:`Proxy disabled (direct connection)`,`info`))}});let t=document.getElementById(`btn-test-proxy`),n=document.getElementById(`proxy-test-status`);t&&n&&(t.onclick=async()=>{let e=document.getElementById(`cfg-proxy-url`),r=e?e.value.trim():``;if(!r){n.className=`mt-2 text-xs p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 block`,n.textContent=`Please enter a proxy URL to test.`;return}t.setAttribute(`disabled`,`true`),t.innerHTML=`
          <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          <span>Testing...</span>
        `,n.className=`mt-2 text-xs p-2 rounded bg-white/5 border border-white/10 text-white/70 block`,n.textContent=`Connecting to ${r}...`;try{let e=await s.testProxyConnection(r);t.removeAttribute(`disabled`),t.innerHTML=`
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>Test Connection</span>
          `,e.success?(n.className=`mt-2 text-xs p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 block font-mono`,n.textContent=e.message,this.showToast(`Proxy verified successfully!`,`success`)):(n.className=`mt-2 text-xs p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 block`,n.textContent=e.message,this.showToast(`Proxy test failed.`,`error`))}catch(e){t.removeAttribute(`disabled`),t.innerHTML=`<span>Test Connection</span>`,n.className=`mt-2 text-xs p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 block`,n.textContent=`Error: ${e?.message||e}`}});let r=document.getElementById(`btn-save-settings`);r&&(r.onclick=async()=>{let e=document.getElementById(`cfg-test-mode`).value,t=parseInt(document.getElementById(`cfg-duration`).value,10),n=parseInt(document.getElementById(`cfg-workers`).value,10),r=parseInt(document.getElementById(`cfg-warmup`).value,10),i=document.getElementById(`cfg-protocol`).value,a=document.getElementById(`cfg-latency-mode`).value,o=parseInt(document.getElementById(`cfg-jitter-samples`).value,10),c=document.getElementById(`cfg-ip-version`).value,l=document.getElementById(`cfg-saving-mode`).checked,u=(document.getElementById(`cfg-source-ip`)?.value||``).trim(),d=(document.getElementById(`cfg-custom-dns`)?.value||``).trim(),f=(document.getElementById(`cfg-user-agent`)?.value||``).trim(),p=(document.getElementById(`cfg-virtual-city`)?.value||``).trim(),m=parseFloat(document.getElementById(`cfg-latitude`)?.value),h=parseFloat(document.getElementById(`cfg-longitude`)?.value),g=(document.getElementById(`cfg-server-keyword`)?.value||``).trim(),_=(document.getElementById(`cfg-country-filter`)?.value||``).trim().toUpperCase(),v=(document.getElementById(`cfg-proxy-url`)?.value||``).trim(),y=document.getElementById(`cfg-speed-unit`).value,b=parseInt(document.getElementById(`cfg-precision`).value,10);document.getElementById(`cfg-language`).value;let x=document.getElementById(`cfg-theme`).value,S=parseInt(document.getElementById(`cfg-chart-points`).value,10),C=document.getElementById(`cfg-show-chart`).checked,w=document.getElementById(`cfg-enable-mica`).checked,T=document.getElementById(`cfg-completion-notification`).checked,E=document.getElementById(`cfg-completion-sound`).checked,D=document.getElementById(`cfg-auto-start`).checked,O=document.getElementById(`cfg-mask-ip`).checked,k=parseInt(document.getElementById(`cfg-max-records`).value,10),A=parseInt(document.getElementById(`cfg-retention-days`).value,10);this.settings.network.testMode=e,this.settings.network.durationSeconds=t,this.settings.network.workerCount=n,this.settings.network.warmupSeconds=r,this.settings.network.protocol=i,this.settings.network.latencyMode=a,this.settings.network.jitterPingSamples=o,this.settings.network.ipVersion=c,this.settings.network.savingMode=l,this.settings.network.sourceIp=u,this.settings.network.customDns=d,this.settings.network.userAgent=f,this.settings.network.virtualCity=p,this.settings.network.latitude=isNaN(m)?null:m,this.settings.network.longitude=isNaN(h)?null:h,this.settings.network.serverSearchKeyword=g,this.settings.network.countryFilter=_,this.settings.network.proxyURL=v,this.settings.display.speedUnit=y,this.settings.display.decimalPrecision=b,this.settings.display.language=`en`,this.settings.display.theme=x,this.settings.display.chartRetentionPoints=S,this.settings.display.showLiveChart=C,this.settings.display.enableMica=w,this.settings.display.completionNotification=T,this.settings.display.completionSound=E,this.settings.display.autoStartOnLaunch=D,this.settings.display.maskSensitiveData=O,this.settings.history||(this.settings.history={maxStoredRecords:100,retentionDays:90,autoExportCSV:!1,autoExportJSON:!1}),this.settings.history.maxStoredRecords=k,this.settings.history.retentionDays=A,await s.updateSettings(this.settings),this.locale=await s.getLocale(`en`),document.body.setAttribute(`dir`,`ltr`),this.showToast(this.t(`settings_saved`),`success`),this.render()})}showToast(e,t=`info`){let n=document.getElementById(`toast-container`);if(!n)return;let r=document.createElement(`div`);r.className=`px-4 py-2.5 rounded shadow-2xl border text-xs font-medium transition-all transform duration-200 opacity-0 translate-y-2 pointer-events-auto ${t===`success`?`border-emerald-500/30 bg-emerald-950/90 text-emerald-200`:t===`error`?`border-rose-500/30 bg-rose-950/90 text-rose-200`:`border-[#60cdff]/30 bg-[#2c2c2c]/95 text-[#60cdff]`}`,r.textContent=e,n.appendChild(r),requestAnimationFrame(()=>{r.classList.remove(`opacity-0`,`translate-y-2`)}),setTimeout(()=>{r.classList.add(`opacity-0`,`translate-y-2`),setTimeout(()=>r.remove(),200)},3200)}};async function u(){let e=document.getElementById(`app`);if(!e){console.error(`Root element #app not found.`);return}await new l(e,await s.getSettings()).init()}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,u):u();
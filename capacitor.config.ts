import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uploadpulse.app',
  appName: 'UploadPulse',
  webDir: 'dist',
  android: {
    backgroundColor: '#202020',
    allowMixedContent: true,
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;

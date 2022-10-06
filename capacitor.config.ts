import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.fhswf.fahrradverleih.ionic',
  appName: 'Fahrradverleih (Ionic)',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    allowNavigation: [
        "*"
    ],
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
  }
};

export default config;

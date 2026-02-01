import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'frontend-piensa',
  webDir: 'build',
  /* 👇 AÑADE ESTO PARA EVITAR EL TIMEOUT */
  server: {
    allowNavigation: ['backend-piensa-production.up.railway.app']
  }
};

export default config;
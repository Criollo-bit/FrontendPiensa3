import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sudamericano.piensa', // Asegúrate que este sea tu ID real
  appName: 'frontend-piensa',
  webDir: 'build', // 🔥 CAMBIADO: De 'dist' a 'build'
  server: {
    allowNavigation: ['backend-piensa-production.up.railway.app'],
    cleartext: true
  }
};

export default config;
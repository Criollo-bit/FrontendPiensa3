import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sudamericano.piensa', // Asegúrate que este sea tu ID real
  appName: 'frontend-piensa',
<<<<<<< HEAD
  webDir: 'build',
  /* 👇 AÑADE ESTO PARA EVITAR EL TIMEOUT */
=======
  webDir: 'build', // 🔥 CAMBIADO: De 'dist' a 'build'
>>>>>>> 47b50ba85a732b2aaf338648f2c8c3bdeda73107
  server: {
    allowNavigation: ['backend-piensa-production.up.railway.app'],
    cleartext: true
  }
};

export default config;
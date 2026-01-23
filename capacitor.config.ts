import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'frontend-piensa',
  webDir: 'dist' // 👈 Asegúrate que diga 'dist'
  // La línea de bundledWebRuntime se eliminó porque ya no se usa
};

export default config;
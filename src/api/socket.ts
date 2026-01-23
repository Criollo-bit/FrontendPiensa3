import { io, Socket } from 'socket.io-client';

// URL de producción en Railway - Única fuente de verdad
const RAILWAY_URL = 'https://backend-piensa-production.up.railway.app'; 

// Forzamos el uso de Railway para la APK
const BASE_URL = RAILWAY_URL; 

class SocketService {
  private socket: Socket | null = null;
  private battleSocket: Socket | null = null;

  // Conexión general para notificaciones globales
  connect(): Socket {
    const token = localStorage.getItem('token');
    
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ['websocket'],
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10, // Aumentamos intentos por si la red móvil es inestable
        reconnectionDelay: 2000
      }); 

      this.socket.on('connect', () => {
        console.log('🌐 Conectado al Socket General en Railway - ID:', this.socket?.id);
      });

      this.socket.on('connect_error', (err) => {
        console.error('❌ Error Socket General:', err.message);
      });
    } else {
      this.socket.connect();
    }

    return this.socket;
  }

  // Conexión específica para el Namespace de Batalla (/battle)
  connectToBattle(): Socket {
    const token = localStorage.getItem('token');
    
    if (this.battleSocket && this.battleSocket.connected) {
      return this.battleSocket;
    }

    if (this.battleSocket) {
      this.battleSocket.connect();
      return this.battleSocket;
    }

    // Usamos el namespace /battle en la nube
    this.battleSocket = io(`${BASE_URL}/battle`, {
      transports: ['websocket'],
      auth: { token }, 
      autoConnect: true,
      reconnection: true
    });

    this.battleSocket.on('connect', () => {
      console.log('⚔️ Batalla conectada a la nube - ID:', this.battleSocket?.id);
    });

    return this.battleSocket;
  }

  getBattleSocket(): Socket | null {
    return this.battleSocket;
  }

  disconnectBattle() {
    if (this.battleSocket) {
      this.battleSocket.disconnect();
      this.battleSocket = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.disconnectBattle();
  }
}

export const socketService = new SocketService();
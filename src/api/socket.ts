import { io, Socket } from 'socket.io-client';

// URL de producción en Railway
const RAILWAY_URL = 'https://backend-piensa-production.up.railway.app'; 

// Detección automática: Si estás en PC usa localhost, si estás en móvil usa Railway
const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : RAILWAY_URL;

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
        reconnectionAttempts: 5
      }); 

      this.socket.on('connect', () => {
        console.log('🌐 Conectado al Socket General - ID:', this.socket?.id);
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
    
    // Si ya existe y está conectado, lo retornamos
    if (this.battleSocket && this.battleSocket.connected) {
      return this.battleSocket;
    }

    // Si existe pero se desconectó, forzamos conexión
    if (this.battleSocket) {
      this.battleSocket.connect();
      return this.battleSocket;
    }

    // Creamos la conexión al namespace /battle usando la URL de Railway
    this.battleSocket = io(`${BASE_URL}/battle`, {
      transports: ['websocket'],
      auth: { token }, // Vital para el Guard de NestJS
      autoConnect: true,
      reconnection: true
    });

    this.battleSocket.on('connect', () => {
      console.log('⚔️ Conectado al Servidor de Batalla en la Nube - ID:', this.battleSocket?.id);
    });

    this.battleSocket.on('connect_error', (err) => {
      console.error('⚠️ Error conexión batalla:', err.message);
    });

    return this.battleSocket;
  }

  getBattleSocket(): Socket | null {
    return this.battleSocket;
  }

  // Desconectar solo el socket de batalla
  disconnectBattle() {
    if (this.battleSocket) {
      this.battleSocket.disconnect();
      this.battleSocket = null;
      console.log('⚔️ Socket de batalla desconectado');
    }
  }

  // Desconexión total
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('🌐 Socket general desconectado');
    }
    this.disconnectBattle();
  }
}

export const socketService = new SocketService();
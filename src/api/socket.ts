import { io, Socket } from 'socket.io-client';

// URL base
const BASE_URL = 'http://localhost:3000'; 

class SocketService {
  private socket: Socket | null = null;
  private battleSocket: Socket | null = null;

  // Conexión general (si la necesitas para notificaciones globales)
  connect() {
    const token = localStorage.getItem('token');
    if (!this.socket) {
      this.socket = io(BASE_URL, {
        transports: ['websocket'],
        auth: { token }, // Enviamos token
        autoConnect: true
      }); 
    }
    return this.socket;
  }

  // 🔥 NUEVO: Conexión específica para el Namespace de Batalla
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

    // Creamos la conexión al namespace /battle
    this.battleSocket = io(`${BASE_URL}/battle`, {
      transports: ['websocket'],
      auth: { token }, // Vital para que el Guard del backend sepa quién eres
      autoConnect: true
    });

    this.battleSocket.on('connect', () => {
      console.log('⚔️ Conectado al Servidor de Batalla ID:', this.battleSocket?.id);
    });

    this.battleSocket.on('connect_error', (err) => {
      console.error('Error conexión batalla:', err.message);
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
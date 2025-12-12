import { io, Socket } from 'socket.io-client';

// Usamos la misma URL que en tu axios.ts
const SOCKET_URL = 'http://localhost:3000'; 

class SocketService {
  private socket: Socket | null = null;

  connect() {
    // Solo conectamos si no existe ya una conexión
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'], // Forzar websocket para mayor velocidad
        autoConnect: true
      });
      
      this.socket.on('connect', () => {
        console.log('🟢 WebSocket Conectado ID:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('🔴 WebSocket Desconectado');
      });
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Exportamos una única instancia (Singleton) para toda la app
export const socketService = new SocketService();
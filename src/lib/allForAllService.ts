import { socketService } from '../api/socket';

export const joinAllForAllRoom = (
  code: string | number,
  studentId: string,
  studentName: string
): Promise<{ success: boolean; message?: string }> => {
  return new Promise((resolve) => {
    const socket = socketService.connectToBattle();
    const roomIdStr = String(code).trim().toUpperCase();

    if (!socket) return resolve({ success: false, message: "Sin conexión" });

    const handleResponse = (data: any) => {
      if (data.success || data.roomId === roomIdStr) {
        cleanup();
        resolve({ success: true });
      }
    };

    const cleanup = () => {
      socket.off('room-update', handleResponse);
      socket.off('error', handleResponse);
    };

    socket.on('room-update', handleResponse);
    socket.on('error', (err) => {
      cleanup();
      resolve({ success: false, message: "Sala no encontrada" });
    });

    socket.emit('join-room', {
      roomId: roomIdStr,
      studentId: String(studentId),
      studentName: String(studentName),
      gameType: 'all-for-all'
    });

    setTimeout(() => { cleanup(); resolve({ success: false, message: "Tiempo de espera agotado" }); }, 10000); // 👈 Subimos a 10s;
  });
};

// ASEGÚRATE DE QUE ESTA FUNCIÓN TENGA ESTE NOMBRE EXACTO:
export const sendColorResponse = (roomId: string, studentId: string, studentName: string, isCorrect: boolean) => {
  const socket = socketService.getBattleSocket();
  if (socket) {
    socket.emit('submit-answer', { 
      roomId, 
      studentId, 
      studentName, 
      isCorrect 
    });
  }
};
import { socketService } from '../api/socket'; 

interface JoinBattleResponse {
  success: boolean;
  message?: string;
  group?: {
    id: string;
    group_name: string;
    battle_id: string;
  };
  battle?: {
    name: string;
  };
}

export const joinBattleWithCode = (
  code: string, 
  studentId: string, 
  studentName: string
): Promise<JoinBattleResponse> => {
  
  return new Promise((resolve, reject) => {
    const socket = socketService.connectToBattle();

    if (!socket) {
      reject(new Error("No se pudo conectar al servidor."));
      return;
    }

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("El servidor tarda en responder. Reintenta en un momento."));
    }, 10000); // 👈 Subimos a 10s

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('room-update', onRoomUpdate);
      socket.off('error', onError);
    };

    const onRoomUpdate = (data: any) => {
      if (data.students) {
        cleanup();
        resolve({
          success: true,
          group: {
            id: socket.id || `temp-${Date.now()}`, 
            group_name: studentName,
            battle_id: code
          },
          battle: {
            name: `Batalla ${code}`
          }
        });
      }
    };

    const onError = (msg: string) => {
      cleanup();
      resolve({ success: false, message: msg });
    };

    socket.on('room-update', onRoomUpdate);
    socket.on('error', onError);

    socket.emit('join-room', { 
      roomId: code, 
      studentName: studentName 
    });
  });
};
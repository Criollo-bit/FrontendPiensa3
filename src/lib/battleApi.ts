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

/**
 * 🔥 ACTUALIZADO: Ahora recibe studentId y avatarUrl
 * Esto permite la validación de inscripción en el servidor y 
 * la visualización de fotos en el podio.
 */
export const joinBattleWithCode = (
  code: string, 
  studentName: string,
  studentId: string, // 👈 Nuevo: ID único de la DB
  avatarUrl: string  // 👈 Nuevo: URL de la foto de perfil
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
    }, 10000); 

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('room-update', onRoomUpdate);
      socket.off('error', onError);
    };

    const onRoomUpdate = (data: any) => {
      if (data.success || data.students) {
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

    // 🔥 ENVIAMOS LOS DATOS COMPLETOS AL BACKEND
    socket.emit('join-room', { 
      roomId: code, 
      studentName: studentName,
      studentId: studentId,   // 🛡️ Clave para el bloqueo de seguridad
      avatarUrl: avatarUrl    // 📸 Clave para la identidad visual
    });
  });
};
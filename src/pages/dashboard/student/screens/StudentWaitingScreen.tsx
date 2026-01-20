import React, { useEffect, useState } from 'react';
import { 
  IonIcon, 
  IonSpinner, 
  IonPage, 
  IonContent 
} from '@ionic/react';
import { 
  arrowBackOutline, 
  peopleOutline, 
  gameControllerOutline,
  checkmarkCircle
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import './StudentWaitingScreen.css';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isMe?: boolean;
}

interface StudentWaitingScreenProps {
  joinCode: string;
  studentName: string;
  onBack: () => void;
}

const StudentWaitingScreen: React.FC<StudentWaitingScreenProps> = ({ joinCode, studentName, onBack }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [statusText, setStatusText] = useState('Conectando a la sala...');

  useEffect(() => {
    // 1. Conexión al Socket
    const socket = socketService.connectToBattle();

    // 2. Unirse a la sala (IMPORTANTE: roomId es el código)
    // Nota: Asegúrate que el backend espera 'roomId' y 'studentName' en este evento
    socket.emit('join-room', { 
        roomId: joinCode, 
        studentName: studentName 
    });

    // 3. Listeners
    socket.on('connect', () => {
        setIsConnected(true);
        setStatusText('Esperando al profesor...');
    });

    socket.on('room-update', (data: any) => {
        console.log('Room Update:', data);
        if (data.students) {
            // Mapeamos los estudiantes que vienen del server
            const mappedPlayers = data.students.map((s: any) => ({
                id: s.id || s.socketId,
                name: s.name,
                // Generamos avatar con iniciales si no tiene foto
                avatar: s.avatar || `https://ui-avatars.com/api/?name=${s.name}&background=random&color=fff&size=128`,
                isMe: s.name === studentName
            }));
            setPlayers(mappedPlayers);
        }
        
        // Si el estado cambia a 'active', el juego empezó (aquí podrías redirigir a la pantalla de juego)
        if (data.status === 'active') {
            setStatusText('¡La batalla ha comenzado!');
            // TODO: Redirigir a StudentGameScreen
        }
    });

    socket.on('error', (msg: string) => {
        alert(msg);
        onBack();
    });

    // Cleanup
    return () => {
        socket.off('connect');
        socket.off('room-update');
        socket.off('error');
        // Opcional: socket.disconnect() si quieres desconectar al salir
    };
  }, [joinCode, studentName, onBack]);

  return (
    <IonPage>
      <IonContent fullscreen className="sw-bg">
        <div className="sw-container">
            
            {/* Header con botón atrás */}
            <button onClick={onBack} className="sw-back-button">
                <IonIcon icon={arrowBackOutline} />
            </button>

            <div className="sw-main-content">
                
                {/* Título y Código */}
                <div className="sw-header-section animate-slide-down">
                    <div className="sw-icon-wrapper">
                        <IonIcon icon={gameControllerOutline} />
                    </div>
                    <h1 className="sw-title">Sala de Batalla</h1>
                    <div className="sw-code-pill">
                        <span className="sw-code-label">CÓDIGO:</span>
                        <span className="sw-code-value">{joinCode}</span>
                    </div>
                    <p className="sw-status">
                        {isConnected ? (
                            <>
                                <IonSpinner name="dots" className="sw-spinner-small"/> {statusText}
                            </>
                        ) : (
                            'Conectando...'
                        )}
                    </p>
                </div>

                {/* Lista de Jugadores (Grid) */}
                <div className="sw-players-section animate-fade-in delay-100">
                    <div className="sw-players-header">
                        <IonIcon icon={peopleOutline} />
                        <span>Jugadores ({players.length})</span>
                    </div>

                    {players.length === 0 ? (
                        <div className="sw-empty-state">
                            <IonSpinner name="crescent" />
                            <p>Esperando compañeros...</p>
                        </div>
                    ) : (
                        <div className="sw-players-grid">
                            {players.map((player, index) => (
                                <div key={index} className={`sw-player-card ${player.isMe ? 'is-me' : ''}`}>
                                    <div className="sw-avatar-container">
                                        <img src={player.avatar} alt={player.name} className="sw-avatar-img"/>
                                        {player.isMe && <div className="sw-me-badge"><IonIcon icon={checkmarkCircle}/></div>}
                                    </div>
                                    <p className="sw-player-name">{player.name}</p>
                                    {player.isMe && <p className="sw-me-text">(Tú)</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Footer Decorativo */}
            <div className="sw-footer">
                <p>Prepárate, la batalla comenzará pronto.</p>
            </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentWaitingScreen;
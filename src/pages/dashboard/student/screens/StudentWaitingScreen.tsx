import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import { socketService } from '../../../../api/socket';
import { BattlePlayer } from '../../../../AppTypes';
import './StudentWaitingScreen.css'; // <--- EL CSS ES CLAVE

interface StudentWaitingScreenProps {
  joinCode: string;
  studentName: string;
  onBack: () => void;
}

const StudentWaitingScreen: React.FC<StudentWaitingScreenProps> = ({ joinCode, studentName, onBack }) => {
  const [players, setPlayers] = useState<BattlePlayer[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Conectar al namespace /battle
    const socket = socketService.connectToBattle();

    // 2. Unirse a la sala con el código
    socket.emit('join-room', { 
        code: joinCode,
        name: studentName 
    });

    // 3. Listeners
    socket.on('connect', () => {
        setIsConnected(true);
    });

    socket.on('room-update', (data: { players: BattlePlayer[] }) => {
        console.log('Actualización de sala:', data);
        setPlayers(data.players || []);
    });

    socket.on('game-started', () => {
        console.log('¡El juego ha comenzado!');
        // Aquí iría la lógica para cambiar a pantalla de preguntas
    });

    socket.on('error', (err) => {
        alert(err.message || 'Error al unirse');
        onBack();
    });

    return () => {
        socketService.disconnectBattle();
    };
  }, [joinCode, studentName, onBack]);

  const getAvatar = (name: string, url?: string) => {
      if (url) return url;
      return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`;
  };

  return (
    <div className="sw-screen">
        {/* Header con Botón Atrás */}
        <div className="sw-header-nav">
            <button onClick={onBack} className="sw-back-btn">
                <IonIcon icon={arrowBack} />
            </button>
        </div>

      <div className="sw-content animate-in">
        <div className="sw-info-box">
            <h1>Sala de Batalla</h1>
            <p className="sw-code-label">Código de Sala:</p>
            <div className="sw-code-display">{joinCode}</div>
            <p className="sw-status-text">
                {isConnected ? 'Esperando al profesor...' : 'Conectando...'}
            </p>
        </div>
        
        <div className="sw-players-section animate-in delay-100">
            <h2>Jugadores Conectados ({players.length})</h2>
            
            {players.length === 0 && isConnected ? (
                 <div className="sw-empty-list">
                    Esperando a que se unan compañeros...
                 </div>
            ) : (
                <div className="sw-players-grid">
                {players.map((player, index) => (
                    <div key={player.id || index} className="sw-player-card">
                        <img 
                            src={getAvatar(player.name, player.avatar)} 
                            alt={player.name} 
                            className="sw-avatar" 
                        />
                        <p className="sw-player-name">{player.name}</p>
                        {player.name === studentName && <span className="sw-you-badge">Tú</span>}
                    </div>
                ))}
                </div>
            )}
        </div>

        {/* Loading Spinner Footer */}
        <div className="sw-footer">
            {!isConnected ? (
                <div className="sw-spinner"></div>
            ) : (
                <div className="sw-ready-indicator">
                    <div className="sw-pulse"></div>
                    <span>Conectado y listo</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default StudentWaitingScreen;
import React, { useEffect, useState, useRef } from 'react';
import { IonContent, IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { 
  arrowBack, 
  gameController, // Icono de juego
  personCircleOutline 
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket';
import { User } from '../../../../AppTypes';
import './StudentWaitingScreen.css'; 

interface StudentWaitingScreenProps {
  user: User;
  subjectId: number;
  subjectName?: string;
  onGameStart: (gameConfig: any) => void;
  onBack: () => void;
}

const StudentWaitingScreen: React.FC<StudentWaitingScreenProps> = ({ 
  user, 
  subjectId, 
  subjectName = "Clase", 
  onGameStart, 
  onBack 
}) => {
  const [statusText, setStatusText] = useState('Estableciendo conexión...');
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<any>(null);
  const roomId = `subject_${subjectId}`;

  useEffect(() => {
    const socket = socketService.connect();
    socketRef.current = socket;

    if (socket.connected) {
      joinRoom();
    } else {
      socket.on('connect', joinRoom);
    }

    function joinRoom() {
      setIsConnected(true);
      setStatusText('Esperando al profesor...');
      
      socket.emit('joinGame', {
        roomId: roomId,
        studentId: user.id,
        playerName: user.name, 
        isMaster: false
      });
    }

    socket.on('game_started', (data: any) => {
      console.log("🚀 Batalla iniciada:", data);
      if (data.gameType === 'ALL_FOR_ALL') {
        onGameStart(data.config); 
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setStatusText('Reconectando...');
    });

    return () => {
      socket.off('connect');
      socket.off('game_started');
    };
  }, [subjectId, user]);

  return (
    <IonContent>
      <div className="lobby-container">
        
        {/* Botón Volver */}
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
           <IonButton fill="clear" onClick={onBack} color="dark">
             <IonIcon icon={arrowBack} />
           </IonButton>
        </div>

        {/* --- ANIMACIÓN DE RADAR --- */}
        <div className="pulse-container">
           {/* Ondas */}
           {isConnected && <div className="pulse-circle"></div>}
           {isConnected && <div className="pulse-circle"></div>}
           
           {/* Icono Central */}
           <div className="icon-wrapper">
             {isConnected ? (
                <IonIcon icon={gameController} style={{ fontSize: '40px', color: 'var(--ion-color-primary)' }} />
             ) : (
                <IonSpinner name="crescent" color="medium" />
             )}
           </div>
        </div>

        {/* --- MENSAJES --- */}
        <h1 className="lobby-title">
            {isConnected ? "¡Estás dentro!" : "Conectando..."}
        </h1>
        
        <p className="lobby-subtitle">
            Estás en la sala de espera de <strong>{subjectName}</strong>.<br/>
            El juego comenzará en la pantalla del profesor.
        </p>

        {/* --- TARJETA DE IDENTIDAD --- */}
        <div className="player-badge">
            <IonIcon icon={personCircleOutline} style={{ fontSize: '1.5rem' }} />
            <span>{user.name}</span>
        </div>

        {/* Indicador de estado pequeño */}
        <div style={{ marginTop: '20px', fontSize: '0.8rem', color: isConnected ? '#22c55e' : '#f59e0b', fontWeight: 'bold' }}>
            {statusText}
        </div>

      </div>
    </IonContent>
  );
};

export default StudentWaitingScreen;
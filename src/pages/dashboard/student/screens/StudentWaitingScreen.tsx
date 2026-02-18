import React, { useEffect, useState, useMemo } from 'react';
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

  // ✅ RECUPERACIÓN REAL DEL AVATAR (Lógica de tu Perfil)
  const myAvatarUrl = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const url = user.avatarUrl || user.avatar || user.avatar_url || '';
        // Timestamp para evitar que el navegador use una imagen vieja
        return url ? `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}` : '';
      }
    } catch (e) { console.error(e); }
    return '';
  }, []);

  useEffect(() => {
    const socket = socketService.connectToBattle();

    socket.emit('join-room', { 
        roomId: joinCode, 
        studentName: studentName,
        avatarUrl: myAvatarUrl // ✅ Enviamos tu foto real al servidor
    });

    socket.on('connect', () => {
        setIsConnected(true);
        setStatusText('Esperando al profesor...');
    });

    socket.on('room-update', (data: any) => {
        if (data.students) {
            const mappedPlayers = data.students.map((s: any) => ({
                id: s.id || s.socketId,
                name: s.name,
                // Priorizamos avatarUrl que viene del socket o generamos fallback
                avatar: s.avatarUrl || s.avatar || `https://ui-avatars.com/api/?name=${s.name}&background=random&color=fff&size=128`,
                isMe: s.name === studentName
            }));
            setPlayers(mappedPlayers);
        }
        
        if (data.status === 'active') {
            setStatusText('¡La batalla ha comenzado!');
        }
    });

    socket.on('error', (msg: string) => {
        alert(msg);
        onBack();
    });

    return () => {
        socket.off('connect');
        socket.off('room-update');
        socket.off('error');
    };
  }, [joinCode, studentName, onBack, myAvatarUrl]);

  return (
    <IonPage>
      {/* ✅ FUERZA BRUTA: Estilos inyectados para asegurar el morado y layout Kahoot */}
      <style>{`
        .sw-force-purple {
            --background: #46178F !important;
            background: #46178F !important;
        }
        .sw-wrapper {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: calc(20px + env(safe-area-inset-top)) 20px 20px;
            color: white;
            background: #46178F;
        }
        .sw-back-btn {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            margin-bottom: 20px;
        }
        .sw-code-badge {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            padding: 15px 30px;
            border-radius: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            margin: 20px 0;
        }
        .sw-player-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: fadeIn 0.5s ease-out;
        }
        .sw-avatar-frame {
            position: relative;
            width: 75px;
            height: 75px;
            border-radius: 50%;
            background: white;
            padding: 3px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.3);
            border: 3px solid transparent;
        }
        .sw-avatar-frame.is-me { border-color: #FFA602; }
        .sw-avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
        }
        .sw-me-check {
            position: absolute;
            bottom: -5px;
            right: -5px;
            background: #22c55e;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #46178F;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <IonContent fullscreen className="sw-force-purple">
        <div className="sw-wrapper">
            
            <button onClick={onBack} className="sw-back-btn">
                <IonIcon icon={arrowBackOutline} />
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                <div style={{ textAlign: 'center' }}>
                    <IonIcon icon={gameControllerOutline} style={{ fontSize: '4rem', marginBottom: '10px' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0 }}>Sala de Espera</h1>
                    
                    <div className="sw-code-badge">
                        <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7, fontWeight: 700, letterSpacing: '2px' }}>CÓDIGO DE SALA</p>
                        <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: '#FFA602' }}>{joinCode}</h2>
                    </div>

                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        {isConnected ? <><IonSpinner name="dots" color="success" /> {statusText}</> : 'Conectando...'}
                    </p>
                </div>

                {/* Grid de Jugadores */}
                <div style={{ width: '100%', marginTop: '30px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 700 }}>
                        <IonIcon icon={peopleOutline} /> Jugadores ({players.length})
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '25px' }}>
                        {players.map((player, index) => (
                            <div key={index} className="sw-player-card">
                                <div className={`sw-avatar-frame ${player.isMe ? 'is-me' : ''}`}>
                                    <img 
                                        src={player.avatar} 
                                        alt={player.name} 
                                        key={player.avatar} // 🔥 Fuerza el refresco visual para ver la foto del auto
                                        className="sw-avatar-img"
                                        onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${player.name}&background=random&color=fff`; }}
                                    />
                                    {player.isMe && (
                                        <div className="sw-me-check">
                                            <IonIcon icon={checkmarkCircle} style={{ fontSize: '14px' }} />
                                        </div>
                                    )}
                                </div>
                                <p style={{ 
                                    fontSize: '0.8rem', fontWeight: 600, marginTop: '8px', textAlign: 'center', 
                                    width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    color: player.isMe ? '#FFA602' : 'white'
                                }}>
                                    {player.isMe ? 'Tú' : player.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer style={{ textAlign: 'center', padding: '20px 0', opacity: 0.5, fontSize: '0.8rem' }}>
                Prepárate, la batalla está por comenzar.
            </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentWaitingScreen;
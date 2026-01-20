import React, { useState, useEffect } from 'react';
import { IonIcon, IonAlert } from '@ionic/react';
import { 
  arrowBack, chatboxEllipsesOutline, colorFillOutline, 
  checkmark, rocketOutline, people, listOutline 
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; // Ajusta la ruta a tu servicio
import './AllForAllControlScreen.css';

const COLOR_OPTIONS = [
  { name: 'ROJO', value: 'red', colorCode: '#ef4444' },     
  { name: 'AZUL', value: 'blue', colorCode: '#3b82f6' },    
  { name: 'VERDE', value: 'green', colorCode: '#22c55e' },  
  { name: 'AMARILLO', value: 'yellow', colorCode: '#eab308' } 
];

const AllForAllControlScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  // Configuración del juego
  const [wordText, setWordText] = useState('ROJO');
  const [wordColor, setWordColor] = useState('blue');
  const [correctAnswer, setCorrectAnswer] = useState<'text' | 'color'>('color');
  
  // Control de Sala
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [roomPin, setRoomPin] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Al igual que en Battle, conectamos al socket al montar
  useEffect(() => {
    const socket = socketService.connectToBattle(); // Reutilizamos el namespace de battle o el que prefieras

    socket.on('room-update', (data: any) => {
      if (data.students) setStudents(data.students);
    });

    socket.on('error', (msg: string) => {
      console.error("Socket Error:", msg);
    });

    return () => {
      socket.off('room-update');
      socket.off('error');
    };
  }, []);

  const handleOpenRoom = () => {
    // Generamos PIN de 4 dígitos
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    setRoomPin(newPin);
    setIsRoomOpen(true);

    // Emitimos la creación de la sala tipo "all-for-all"
    const socket = socketService.getBattleSocket();
    socket?.emit('create-room', { 
      teacherId: JSON.parse(localStorage.getItem('user') || '{}').id,
      name: "All for All - Desafío",
      type: 'all-for-all', // Diferenciador para el backend
      customPin: newPin 
    });
  };

  const handleStartGame = () => {
    const socket = socketService.getBattleSocket();
    // Enviamos la configuración que el profe eligió
    socket?.emit('start-all-for-all', {
      roomId: roomPin,
      config: {
        word: wordText,
        color: wordColor,
        mode: correctAnswer // 'text' o 'color'
      }
    });
    console.log("Juego iniciado definitivamente");
  };

  const handleExit = () => {
    // Limpieza similar a handleExitToMenu de Battle
    const socket = socketService.getBattleSocket();
    socket?.emit('end-battle', { roomId: roomPin });
    setIsRoomOpen(false);
    onBack();
  };

  return (
    <div className="all-for-all-container">
      <div className="game-header-top">
        <button onClick={() => isRoomOpen ? setShowExitConfirm(true) : onBack()} className="back-btn-circle">
          <IonIcon icon={arrowBack} />
        </button>
        <div className="header-text-center">
          <h1 className="game-title">All for All</h1>
          <p className="game-subtitle">{isRoomOpen ? `PIN: ${roomPin}` : 'Configura el reto'}</p>
        </div>
        <div className="header-spacer"></div>
      </div>

      <div className="config-card">
        {!isRoomOpen ? (
          /* VISTA DE CONFIGURACIÓN */
          <div className="setup-view">
            <h2 className="section-title">1. Personaliza la ronda</h2>
            
            <div className="form-group">
              <label className="config-label">Palabra que leerán</label>
              <select className="form-select" value={wordText} onChange={(e) => setWordText(e.target.value)}>
                {COLOR_OPTIONS.map(opt => <option key={opt.value} value={opt.name}>{opt.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="config-label">Color del texto</label>
              <div className="color-grid">
                {COLOR_OPTIONS.map((c) => (
                  <button 
                    key={c.value} 
                    className={`color-btn ${wordColor === c.value ? 'selected' : ''}`}
                    style={{ backgroundColor: c.colorCode }}
                    onClick={() => setWordColor(c.value)}
                  >
                    {wordColor === c.value && <IonIcon icon={checkmark} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="config-label">El alumno debe elegir:</label>
              <div className="answer-grid">
                <button className={`choice-btn ${correctAnswer === 'text' ? 'active' : ''}`} onClick={() => setCorrectAnswer('text')}>
                  <IonIcon icon={chatboxEllipsesOutline} /> <span>El Texto</span>
                </button>
                <button className={`choice-btn ${correctAnswer === 'color' ? 'active' : ''}`} onClick={() => setCorrectAnswer('color')}>
                  <IonIcon icon={colorFillOutline} /> <span>El Color</span>
                </button>
              </div>
            </div>

            <button className="primary-btn open-room" onClick={handleOpenRoom}>
              <IonIcon icon={listOutline} />
              MOSTRAR PIN A LOS ALUMNOS
            </button>
          </div>
        ) : (
          /* VISTA DE ESPERA (PIN Y ALUMNOS) */
          <div className="waiting-view">
            <div className="pin-display">
              <small>CÓDIGO DE ACCESO</small>
              <div className="pin-number">{roomPin}</div>
            </div>

            <div className={`status-banner ${students.length > 0 ? 'students-ready' : ''}`}>
              <IonIcon icon={people} />
              <span>{students.length} Estudiantes conectados</span>
            </div>

            <div className="preview-box">
              <p>Vista previa del reto:</p>
              <b style={{ color: COLOR_OPTIONS.find(c => c.value === wordColor)?.colorCode }}>
                {wordText}
              </b>
              <small>Deben marcar {correctAnswer === 'color' ? 'EL COLOR' : 'LA PALABRA'}</small>
            </div>

            <button 
              className={`launch-btn ${students.length > 0 ? 'enabled' : ''}`} 
              disabled={students.length === 0}
              onClick={handleStartGame}
            >
              <IonIcon icon={rocketOutline} className={students.length > 0 ? 'rocket-ready' : ''} />
              <span>{students.length === 0 ? 'ESPERANDO ALUMNOS...' : '¡EMPEZAR JUEGO!'}</span>
            </button>

            <button className="text-btn" onClick={() => setShowExitConfirm(true)}>
              Cancelar sala
            </button>
          </div>
        )}
      </div>

      <IonAlert
        isOpen={showExitConfirm}
        onDidDismiss={() => setShowExitConfirm(false)}
        header="¿Cerrar sala?"
        message="Se desconectará a todos los alumnos y deberás generar un nuevo PIN."
        buttons={[
          { text: 'Volver', role: 'cancel' },
          { text: 'Sí, cerrar', handler: handleExit }
        ]}
      />
    </div>
  );
};

export default AllForAllControlScreen;
import React, { useState, useEffect, useRef } from 'react';
import { 
  IonIcon, IonButton, IonToast, IonCard, IonCardContent, IonChip, IonLabel, IonBadge 
} from '@ionic/react';
import { 
  playCircle, stopCircle, timeOutline, checkmarkCircle, 
  closeCircle, chatboxEllipsesOutline, colorFillOutline, checkmark,
  arrowBack, people
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; // <--- Importamos el servicio
import './AllForAllControlScreen.css';

// --- TIPOS ---
interface Response {
  id: string;
  studentName: string;
  buttonPressed: string;
  isCorrect: boolean;
  pointsAwarded: number;
}

// DEFINICIÓN DE PROPS (Actualizada para recibir datos del Dashboard)
interface AllForAllControlScreenProps {
  subjectId: number;
  teacherName: string;
  onBack: () => void;
}

const COLOR_OPTIONS = [
  { name: 'ROJO', value: 'red', colorCode: '#ef4444' },     
  { name: 'AZUL', value: 'blue', colorCode: '#3b82f6' },    
  { name: 'VERDE', value: 'green', colorCode: '#22c55e' },  
  { name: 'AMARILLO', value: 'yellow', colorCode: '#eab308' } 
];

const AllForAllControlScreen: React.FC<AllForAllControlScreenProps> = ({ subjectId, teacherName, onBack }) => {
  // --- LÓGICA DE SOCKETS Y SALA ---
  const [connectedStudents, setConnectedStudents] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const roomId = `subject_${subjectId}`;
  const socketRef = useRef<any>(null);

  // Estados del Juego Visual
  const [isActive, setIsActive] = useState(false);
  const [wordText, setWordText] = useState('ROJO');
  const [wordColor, setWordColor] = useState('blue');
  const [correctAnswer, setCorrectAnswer] = useState<'text' | 'color'>('color');
  
  // Estado de Respuestas
  const [responses, setResponses] = useState<Response[]>([]);

  // 1. EFECTO DE CONEXIÓN AL MONTAR
  useEffect(() => {
    const socket = socketService.connect();
    socketRef.current = socket;

    // Unirse a la sala como Maestro
    socket.emit('joinGame', {
        roomId: roomId,
        studentId: 'TEACHER_ID',
        playerName: teacherName,
        isMaster: true 
    });

    // Escuchar actualizaciones de la sala (quién entra/sale)
    socket.on('playersUpdate', (data: { players: any[] }) => {
        // Filtramos para contar solo estudiantes
        const students = data.players.filter(p => !p.isMaster);
        setConnectedStudents(students);
    });

    // Escuchar respuestas de los alumnos (Cuando terminemos la pantalla del alumno)
    // socket.on('student_response', (data) => { ... });

    return () => {
        socket.off('playersUpdate');
    };
  }, [subjectId, roomId, teacherName]);


  // 2. FUNCIÓN INICIAR JUEGO (Conectada al Backend)
  const startGame = () => {
    if (!socketRef.current) return;

    const payload = {
      roomId: roomId,
      gameType: 'ALL_FOR_ALL',
      config: {
        wordText,      // Palabra seleccionada (ej: "ROJO")
        wordColor,     // Color seleccionado (ej: "blue")
        correctTarget: correctAnswer, // Qué deben adivinar ('text' o 'color')
        duration: 30   // Duración por defecto (puedes hacerla dinámica luego)
      }
    };

    console.log("🚀 Enviando configuración al servidor:", payload);
    
    // Emitir evento al Gateway
    socketRef.current.emit('create_game', payload, (response: any) => {
      if (response?.success) {
        setIsActive(true);
        setResponses([]); 
        setShowToast(true);
      }
    });
  };

  // 3. FUNCIÓN TERMINAR JUEGO
  const endGame = () => {
    if (!socketRef.current) return;
    
    // Emitimos reset para que los alumnos vuelvan a espera
    socketRef.current.emit('resetGame', { roomId });
    setIsActive(false);
  };

  // --- HELPERS VISUALES ---
  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getSelectedColorName = () => {
    return COLOR_OPTIONS.find(c => c.value === wordColor)?.name || '';
  };

  return (
    <div className="all-for-all-container">
      
      {/* Encabezado con Botón de Volver */}
      <div className="game-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IonButton fill="clear" onClick={onBack} size="small" style={{ margin: 0 }}>
            <IonIcon icon={arrowBack} style={{ fontSize: '24px', color: '#333' }} />
        </IonButton>
        <div>
            <h1 className="game-title" style={{ margin: 0 }}>All for All</h1>
            <p className="game-subtitle" style={{ margin: 0 }}>Sala: {roomId}</p>
        </div>
      </div>

      {!isActive ? (
        // --- VISTA DE CONFIGURACIÓN ---
        <div className="config-card">
          
          {/* INDICADOR DE ALUMNOS CONECTADOS (NUEVO) */}
          <IonCard style={{ margin: '0 0 20px 0', background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <IonCardContent style={{ padding: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <IonIcon icon={people} size="large" color="primary" />
                        <div>
                            <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>{connectedStudents.length}</h2>
                            <small>Alumnos Listos</small>
                        </div>
                    </div>
                    {/* Pequeña lista de nombres */}
                    <div style={{ display: 'flex', gap: '5px' }}>
                        {connectedStudents.slice(0, 3).map((s, i) => (
                             <IonBadge key={i} color="medium">{s.name}</IonBadge>
                        ))}
                        {connectedStudents.length > 3 && <IonBadge color="light">+{connectedStudents.length - 3}</IonBadge>}
                    </div>
                </div>
            </IonCardContent>
          </IonCard>

          <h2 className="config-title">Configurar Nueva Ronda</h2>

          {/* Selector de Palabra */}
          <div className="form-group">
            <label className="form-label">Palabra a Mostrar</label>
            <select 
              className="form-select"
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
            >
              {COLOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.name}>{opt.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de Color */}
          <div className="form-group">
            <label className="form-label">Color del Texto</label>
            <div className="color-grid">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setWordColor(color.value)}
                  className={`color-btn ${wordColor === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.colorCode }}
                >
                  {color.name}
                  {wordColor === color.value && (
                    <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#1e293b', borderRadius: '50%', padding: '2px' }}>
                      <IonIcon icon={checkmark} style={{ color: 'white', fontSize: '12px' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Respuesta Correcta */}
          <div className="form-group">
            <label className="form-label">Respuesta Correcta</label>
            <div className="answer-grid">
              <button
                onClick={() => setCorrectAnswer('text')}
                className={`answer-btn ${correctAnswer === 'text' ? 'active' : 'inactive'}`}
              >
                <IonIcon icon={chatboxEllipsesOutline} style={{ fontSize: '24px', marginBottom: '5px' }} />
                <span>Lo que dice</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>el texto</span>
              </button>

              <button
                onClick={() => setCorrectAnswer('color')}
                className={`answer-btn ${correctAnswer === 'color' ? 'active' : 'inactive'}`}
              >
                <IonIcon icon={colorFillOutline} style={{ fontSize: '24px', marginBottom: '5px' }} />
                <span>El color</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>del texto</span>
              </button>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="preview-box">
            <p className="form-label">Vista Previa</p>
            <div className="word-display">
              <span 
                className="word-text" 
                style={{ color: COLOR_OPTIONS.find(c => c.value === wordColor)?.colorCode }}
              >
                {wordText}
              </span>
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#22c55e', padding: '5px', borderRadius: '5px', display: 'flex' }}>
                <IonIcon icon={checkmarkCircle} style={{ color: 'white' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Respuesta Correcta</p>
                <p style={{ fontWeight: 'bold', margin: 0 }}>
                  {correctAnswer === 'text' ? wordText : getSelectedColorName()}
                </p>
              </div>
            </div>
          </div>

          <button 
            className="start-game-btn" 
            onClick={startGame}
            disabled={connectedStudents.length === 0} // Deshabilitar si no hay alumnos
            style={{ opacity: connectedStudents.length === 0 ? 0.6 : 1 }}
          >
            <IonIcon icon={playCircle} style={{ fontSize: '24px' }} />
            {connectedStudents.length === 0 ? "Esperando Alumnos..." : "Iniciar Juego"}
          </button>
        </div>
      ) : (
        // --- VISTA DE JUEGO ACTIVO ---
        <div className="config-card">
          <div className="active-game-header">
            <div>
              <div className="live-indicator">
                <div className="pulse-dot"></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Juego Activo</h2>
              </div>
              <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                {responses.length} respuestas recibidas
              </p>
            </div>
            <button className="stop-game-btn" onClick={endGame}>
              <IonIcon icon={stopCircle} />
              Terminar
            </button>
          </div>

          {/* Palabra en Pantalla Grande */}
          <div className="word-display">
            <span 
              className="word-text" 
              style={{ color: COLOR_OPTIONS.find(c => c.value === wordColor)?.colorCode }}
            >
              {wordText}
            </span>
          </div>

          {/* Ranking en Tiempo Real */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ranking en Tiempo Real</h3>
          
          {responses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              <IonIcon icon={timeOutline} style={{ fontSize: '3rem', marginBottom: '0.5rem' }} />
              <p>Esperando respuestas de los alumnos...</p>
            </div>
          ) : (
            <div className="ranking-list">
              {responses.map((resp, index) => (
                <div key={resp.id} className={`ranking-item ${resp.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="rank-position">{getRankEmoji(index)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{resp.studentName}</p>
                    <p style={{ fontSize: '0.8rem', margin: 0, color: '#64748b' }}>
                      Presionó: {resp.buttonPressed}
                    </p>
                  </div>
                  <div>
                    {resp.isCorrect ? (
                      <span style={{ color: '#16a34a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IonIcon icon={checkmarkCircle} /> +100
                      </span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IonIcon icon={closeCircle} /> Falló
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="¡Juego iniciado! Enviado a dispositivos."
        duration={2000}
        color="success"
        position="top"
      />
    </div>
  );
};

export default AllForAllControlScreen;
import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner, IonButton } from '@ionic/react';
import { 
  hourglass, 
  checkmarkCircle, 
  closeCircle, 
  trophy, 
  pause, 
  arrowBack, 
  alertCircle 
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import './StudentBattleScreen.css';

// Colores consistentes con el resto de la app
const COLORS = [
  { id: 'red', hex: '#ef4444', class: 'btn-red' },
  { id: 'blue', hex: '#3b82f6', class: 'btn-blue' },
  { id: 'green', hex: '#22c55e', class: 'btn-green' },
  { id: 'yellow', hex: '#eab308', class: 'btn-yellow' }
];

interface StudentBattleScreenProps {
  groupId: string;
  battleId: string;
  studentId: string;
  studentName: string;
  onBack: () => void;
}

// Estados visuales del alumno
type ViewState = 'WAITING' | 'QUESTION' | 'LOCKED' | 'FEEDBACK' | 'GAME_OVER';

const StudentBattleScreen: React.FC<StudentBattleScreenProps> = ({ 
  battleId, 
  studentName,
  onBack 
}) => {
  
  const [viewState, setViewState] = useState<ViewState>('WAITING');
  const [score, setScore] = useState(0);
  const [questionData, setQuestionData] = useState<any>(null); 
  const [feedback, setFeedback] = useState<any>(null); 
  const [localTimer, setLocalTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    // Conectar al namespace /battle
    const socket = socketService.connectToBattle();

    // Monitor de conexión
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect', () => setIsConnected(true));

    // 1. NUEVA PREGUNTA (Inicia ronda)
    socket.on('new-question', (data: any) => {
      setQuestionData(data);
      setViewState('QUESTION');
      setFeedback(null);
      setLocalTimer(data.duration || 20);
    });

    // 2. CONFIRMACIÓN (Respuesta recibida por el server)
    socket.on('answer-received', () => {
      setViewState('LOCKED'); 
    });

    // 3. RESULTADOS DE RONDA (El profe avanzó o se acabó el tiempo)
    socket.on('round-result', (data: any) => {
      // data: { correct, pointsEarned, totalScore, rank }
      setFeedback(data);
      setScore(data.totalScore); // Actualizamos puntaje acumulado
      setViewState('FEEDBACK');
    });

    // 4. FIN DEL JUEGO
    socket.on('game-over', () => {
      setViewState('GAME_OVER');
    });

    // Limpieza de listeners al desmontar
    return () => {
      socket.off('new-question');
      socket.off('answer-received');
      socket.off('round-result');
      socket.off('game-over');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, []);

  // Timer visual local
  useEffect(() => {
    if (viewState === 'QUESTION' && localTimer > 0) {
      const interval = setInterval(() => setLocalTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [viewState, localTimer]);

  const handleAnswer = (optionId: string) => {
    // Prevenir responder si el tiempo local ya es 0 (aunque el server valida tmb)
    if (localTimer <= 0) return;

    const socket = socketService.getBattleSocket();
    if (socket && socket.connected) {
      socket.emit('submit-answer', {
        roomId: battleId,
        studentName: studentName,
        optionId: optionId
      });
      // Bloqueo optimista inmediato para mejor UX
      setViewState('LOCKED');
    }
  };

  // --- RENDERIZADO DE CONTENIDO POR ESTADO ---
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="sb-content animate-in">
           <IonIcon icon={alertCircle} className="sb-status-icon text-red-500" />
           <h2>Desconectado</h2>
           <p>Intentando reconectar...</p>
           <IonSpinner />
        </div>
      );
    }

    switch (viewState) {
      case 'WAITING':
        return (
          <div className="sb-content animate-in">
             <IonIcon icon={hourglass} className="sb-status-icon spin-slow" />
             <h2>¡Estás dentro!</h2>
             <p className="pulse-text">Mira la pantalla del profesor...</p>
             <button className="btn-text-only" onClick={onBack} style={{marginTop: 30, color: '#94a3b8'}}>
               Salir de la sala
             </button>
          </div>
        );

      case 'QUESTION':
        return (
          <div className="sb-content">
             {/* Barra de Tiempo */}
             <div className="student-timer-bar">
                <div 
                   className={`timer-fill ${localTimer < 5 ? 'danger' : ''}`} 
                   style={{ width: `${(localTimer / 20) * 100}%` }} 
                />
             </div>
             
             {/* Texto de Pregunta (El alumno LO VE en su pantalla) */}
             <h3 className="mobile-question-text">{questionData?.text}</h3>

             {/* Grilla de Botones */}
             <div className="sb-answers-grid">
               {questionData?.options.map((opt: any, index: number) => (
                 <button
                   key={opt.id}
                   onClick={() => handleAnswer(opt.id)}
                   disabled={localTimer <= 0} // Deshabilitar si tiempo agotado
                   className={`sb-answer-btn ${COLORS[index % 4].class} ${localTimer <= 0 ? 'disabled' : ''}`}
                 >
                   {opt.text}
                 </button>
               ))}
             </div>
          </div>
        );

      case 'LOCKED':
        return (
          <div className="sb-content animate-in">
             <div className="locked-circle">
               <IonIcon icon={pause} />
             </div>
             <h2>Respuesta Enviada</h2>
             <p>Espera a que todos respondan o termine el tiempo.</p>
             <div className="wisdom-quote">
                "Todo esfuerzo tiene su recompensa."
             </div>
          </div>
        );

      case 'FEEDBACK':
        const isCorrect = feedback?.correct;
        return (
          <div className={`sb-feedback-container ${isCorrect ? 'bg-correct' : 'bg-wrong'} animate-in`}>
             <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} className="feedback-icon bounce-in" />
             
             <h1>{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</h1>
             
             {isCorrect && (
                <div className="points-badge">+{feedback.pointsEarned} Pts</div>
             )}
             
             <div className="rank-info">
                Puesto actual: <strong>#{feedback.rank}</strong>
             </div>
             
             <div className="footer-msg">
                <IonSpinner name="dots" />
                <span>El profesor iniciará la siguiente...</span>
             </div>
          </div>
        );

      case 'GAME_OVER':
        return (
          <div className="sb-content animate-in">
             <IonIcon icon={trophy} className="sb-status-icon text-yellow-500" />
             <h1>¡Batalla Finalizada!</h1>
             <div className="final-score-box">
                <span className="label">Puntaje Final</span>
                <span className="value">{score}</span>
             </div>
             <IonButton expand="block" onClick={onBack} className="mt-8">
                <IonIcon icon={arrowBack} slot="start" />
                Volver al Menú
             </IonButton>
          </div>
        );
    }
  };

  return (
    <div className="student-battle-container">
      {/* Header Fijo */}
      <div className="sb-header">
        <span className="sb-student-name truncate">{studentName}</span>
        <div className="sb-badge-score">
           <IonIcon icon={trophy} style={{fontSize: '0.8em'}}/> {score}
        </div>
      </div>
      
      {/* Área Principal */}
      {renderContent()}
    </div>
  );
};

export default StudentBattleScreen;
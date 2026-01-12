import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { 
  hourglass, 
  checkmarkCircle, 
  closeCircle, 
  pause, 
  alertCircle 
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import PodiumScreen from './PodiumScreen';
import WinnerScreen from './WinnerScreen';
import LoserScreen from './LoserScreen';
import './StudentBattleScreen.css';

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

// Nuevos estados visuales
type ViewState = 'WAITING' | 'QUESTION' | 'LOCKED' | 'FEEDBACK' | 'PODIUM' | 'FINAL_RESULT';

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
  
  // Datos para el final
  const [finalRanking, setFinalRanking] = useState<any[]>([]);
  const [amIWinner, setAmIWinner] = useState(false);

  useEffect(() => {
    const socket = socketService.connectToBattle();

    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect', () => setIsConnected(true));

    // 1. NUEVA PREGUNTA
    socket.on('new-question', (data: any) => {
      setQuestionData(data);
      setViewState('QUESTION'); // <--- Esto saca al usuario del estado FEEDBACK
      setFeedback(null);
      setLocalTimer(data.duration || 20);
    });

    // 2. CONFIRMACIÓN
    socket.on('answer-received', () => {
      setViewState('LOCKED'); 
    });

    // 3. RESULTADOS DE RONDA (Se queda aquí hasta que el profe cambie)
    socket.on('round-result', (data: any) => {
      setFeedback(data);
      setScore(data.totalScore); 
      setViewState('FEEDBACK'); // <--- Pantalla persistente de Correcto/Incorrecto
    });

    // 4. FIN DEL JUEGO (Recibimos Ranking)
    socket.on('game-over', (data: { winners: any[] }) => {
      const winners = data.winners || [];
      // Mapear ganadores para el podio (Top 3)
      const podiumWinners = winners.slice(0, 3).map((w: any, index: number) => ({
          position: index + 1,
          name: w.name,
          score: w.score,
          color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
      }));
      
      setFinalRanking(podiumWinners);
      
      // Determinar si soy ganador (Top 3)
      const myRankIndex = winners.findIndex((w: any) => w.name === studentName);
      setAmIWinner(myRankIndex >= 0 && myRankIndex < 3);

      setViewState('PODIUM'); // <--- Cambia a la animación de podio
    });

    return () => {
      socket.off('new-question');
      socket.off('answer-received');
      socket.off('round-result');
      socket.off('game-over');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, [studentName]);

  // Timer solo para la barra visual (no cambia el estado al llegar a 0, espera al server)
  useEffect(() => {
    if (viewState === 'QUESTION' && localTimer > 0) {
      const interval = setInterval(() => setLocalTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [viewState, localTimer]);

  const handleAnswer = (optionId: string) => {
    if (localTimer <= 0) return;

    const socket = socketService.getBattleSocket();
    if (socket && socket.connected) {
      socket.emit('submit-answer', {
        roomId: battleId,
        studentName: studentName,
        optionId: optionId
      });
      setViewState('LOCKED');
    }
  };

  // --- RENDERIZADO ---
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
             <button className="btn-text-only" onClick={onBack} style={{marginTop: 30, color: '#94a3b8'}}>Salir de la sala</button>
          </div>
        );

      case 'QUESTION':
        return (
          <div className="sb-content">
             <div className="student-timer-bar">
                <div className={`timer-fill ${localTimer < 5 ? 'danger' : ''}`} style={{ width: `${(localTimer / 20) * 100}%` }} />
             </div>
             <h3 className="mobile-question-text">{questionData?.text}</h3>
             <div className="sb-answers-grid">
               {questionData?.options.map((opt: any, index: number) => (
                 <button
                   key={opt.id}
                   onClick={() => handleAnswer(opt.id)}
                   disabled={localTimer <= 0}
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
             <div className="locked-circle"><IonIcon icon={pause} /></div>
             <h2>Respuesta Enviada</h2>
             <p>Espera a que todos respondan o termine el tiempo.</p>
          </div>
        );

      case 'FEEDBACK':
        const isCorrect = feedback?.correct;
        return (
          <div className={`sb-feedback-container ${isCorrect ? 'bg-correct' : 'bg-wrong'} animate-in`}>
             <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} className="feedback-icon bounce-in" />
             <h1>{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</h1>
             {isCorrect && <div className="points-badge">+{feedback.pointsEarned} Pts</div>}
             <div className="rank-info">Puesto actual: <strong>#{feedback.rank}</strong></div>
             
             {/* Este mensaje indica que es persistente */}
             <div className="footer-msg">
                <IonSpinner name="dots" />
                <span>Esperando siguiente pregunta...</span>
             </div>
          </div>
        );

      case 'PODIUM':
        return (
            <PodiumScreen 
                winners={finalRanking} 
                onContinue={() => setViewState('FINAL_RESULT')} 
            />
        );

      case 'FINAL_RESULT':
        return amIWinner ? (
            <WinnerScreen points={score} onContinue={onBack} />
        ) : (
            <LoserScreen score={score} onContinue={onBack} />
        );
    }
  };

  // Si estamos en Podio o Final, ocultamos el header normal para que ocupe toda la pantalla
  if (viewState === 'PODIUM' || viewState === 'FINAL_RESULT') {
      return <div className="student-battle-full">{renderContent()}</div>;
  }

  return (
    <div className="student-battle-container">
      <div className="sb-header">
        <span className="sb-student-name truncate">{studentName}</span>
        <div className="sb-badge-score"><IonIcon icon={checkmarkCircle} style={{fontSize: '0.8em', marginRight: 4}}/> {score}</div>
      </div>
      {renderContent()}
    </div>
  );
};

export default StudentBattleScreen;
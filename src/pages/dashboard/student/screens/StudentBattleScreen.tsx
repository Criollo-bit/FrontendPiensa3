import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { 
  checkmarkCircle, 
  closeCircle, 
  pause, 
  arrowBackOutline
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import PodiumScreen from './PodiumScreen';
import WinnerScreen from './WinnerScreen';
import LoserScreen from './LoserScreen';
import './StudentBattleScreen.css';

// --- COMPONENTE DE TRANSICIÓN ---
const QuestionTransition = ({ questionNumber, onComplete }: { questionNumber: number, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'#46178F', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
      <div style={{width:200, height:200, background:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', animation:'pulseCircle 0.8s ease-out'}}>
        <div style={{width:170, height:170, background:'#FFA602', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <span style={{fontSize:80, fontWeight:900, color:'white'}}>{questionNumber}</span>
        </div>
      </div>
      <h2 style={{color:'white', fontSize:32, fontWeight:800, marginTop:30}}>Pregunta {questionNumber}</h2>
    </div>
  );
};

const ANSWER_STYLES = [
  { color: 'k-red', icon: '▲' }, { color: 'k-blue', icon: '◆' },   
  { color: 'k-yellow', icon: '●' }, { color: 'k-green', icon: '■' }   
];

interface StudentBattleScreenProps {
  groupId: string;
  battleId: string;
  studentId: string;
  studentName: string;
  onBack: () => void;
}

type ViewState = 'WAITING' | 'QUESTION' | 'LOCKED' | 'FEEDBACK' | 'PODIUM' | 'FINAL_RESULT';

const StudentBattleScreen: React.FC<StudentBattleScreenProps> = ({ battleId, studentName, onBack }) => {
  
  const [viewState, setViewState] = useState<ViewState>('WAITING');
  const [score, setScore] = useState(0);
  const [questionData, setQuestionData] = useState<any>(null); 
  const [feedback, setFeedback] = useState<any>(null); 
  const [localTimer, setLocalTimer] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [currentQNum, setCurrentQNum] = useState(1);
  const [totalQCount, setTotalQCount] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [finalRanking, setFinalRanking] = useState<any[]>([]);
  const [amIWinner, setAmIWinner] = useState(false);

  // 🔥 NUEVO: Obtener la foto real del storage para el Lobby
  const [myAvatar, setMyAvatar] = useState<string>('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setMyAvatar(user.avatarUrl || user.avatar || '');
      }
    } catch (e) {
      console.error("Error cargando avatar en lobby", e);
    }
  }, []);

  // Timer de Feedback (8 segundos)
  useEffect(() => {
    if (viewState === 'FEEDBACK') {
        const timer = setTimeout(() => {
            setViewState(current => current === 'FEEDBACK' ? 'LOCKED' : current);
        }, 8000); 
        return () => clearTimeout(timer);
    }
  }, [viewState]);

  useEffect(() => {
    const socket = socketService.connectToBattle();
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect', () => setIsConnected(true));

    socket.on('new-question', (data: any) => {
      setQuestionData(data);
      setFeedback(null);
      setLocalTimer(data.duration || 20);
      if(data.questionNumber) setCurrentQNum(data.questionNumber);
      if(data.totalQuestions) setTotalQCount(data.totalQuestions);
      setShowTransition(true);
      setViewState('QUESTION'); 
    });

    socket.on('answer-received', () => {
      setViewState(prev => (prev === 'FEEDBACK' || prev === 'PODIUM' || prev === 'FINAL_RESULT') ? prev : 'LOCKED');
    });

    socket.on('round-result', (data: any) => {
      setShowTransition(false);
      setFeedback(data);
      setScore(data.totalScore); 
      setViewState('FEEDBACK'); 
    });

    socket.on('game-over', (data: { winners: any[] }) => {
      setShowTransition(false);
      const winners = data.winners || [];
      const podiumWinners = winners.slice(0, 3).map((w: any, index: number) => ({
          position: index + 1, 
          name: w.name, 
          score: w.score, 
          avatarUrl: w.avatarUrl, // 🔥 Ahora recibimos el avatar del servidor para el podio
          color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
      }));
      setFinalRanking(podiumWinners);
      const myRankIndex = winners.findIndex((w: any) => w.name === studentName);
      setAmIWinner(myRankIndex >= 0 && myRankIndex < 3);
      setViewState('PODIUM');
    });

    return () => {
      socket.off('new-question'); socket.off('answer-received'); socket.off('round-result');
      socket.off('game-over'); socket.off('disconnect'); socket.off('connect');
    };
  }, [studentName]);

  useEffect(() => {
    if (viewState === 'QUESTION' && !showTransition && localTimer > 0) {
      const interval = setInterval(() => setLocalTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [viewState, localTimer, showTransition]);

  const handleAnswer = (optionId: string) => {
    if (localTimer <= 0) return;
    const socket = socketService.getBattleSocket();
    if (socket && socket.connected) {
      socket.emit('submit-answer', { roomId: battleId, studentName, optionId });
      setViewState('LOCKED');
    }
  };

  const renderContent = () => {
    if (!isConnected) return <div className="locked-container"><h2>Desconectado</h2><IonSpinner/></div>;

    switch (viewState) {
      case 'WAITING':
        return (
          <div className="lobby-container">
             <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white rounded-full shadow border">
                <IonIcon icon={arrowBackOutline} />
             </button>
             
             {/* 🔥 AVATAR REAL: Muestra la foto del perfil o el fallback de iniciales */}
             <img 
                src={myAvatar || `https://ui-avatars.com/api/?name=${studentName}&background=random&size=200`} 
                alt="Avatar" 
                className="lobby-avatar-large"
                style={{ objectFit: 'cover', border: '5px solid white' }}
             />
             
             <h1 className="lobby-title">¡Hola, {studentName}!</h1>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <p className="text-slate-500 font-bold">CÓDIGO DE SALA</p>
                <p className="text-3xl font-black text-sky-600">{battleId}</p>
             </div>

             <div className="flex flex-col items-center gap-2">
                <IonSpinner name="dots" className="text-slate-400"/>
                <p className="lobby-subtitle">Esperando a que el profesor inicie...</p>
             </div>
          </div>
        );

      case 'QUESTION':
        return (
          <>
            {showTransition && <QuestionTransition questionNumber={currentQNum} onComplete={() => setShowTransition(false)} />}
            <div className="kahoot-layout">
                <div className="kahoot-header">
                    <div className="kahoot-progress-container">
                        <div className="kahoot-progress-track">
                            <div className="kahoot-progress-fill" style={{ width: totalQCount > 0 ? `${(currentQNum / totalQCount) * 100}%` : '0%' }}></div>
                        </div>
                        <span className="kahoot-counter">{currentQNum} de {totalQCount || '?'}</span>
                    </div>
                </div>
                <div className="kahoot-question-box">
                    <h1 className="kahoot-question-text">{questionData?.text}</h1>
                </div>
                <div className="kahoot-grid">
                    {questionData?.options.map((opt: any, index: number) => {
                        const style = ANSWER_STYLES[index % 4];
                        return (
                            <button key={opt.id} onClick={() => handleAnswer(opt.id)} disabled={localTimer <= 0 || showTransition} className={`kahoot-btn ${style.color} ${localTimer <= 0 ? 'disabled' : ''}`}>
                                <div className="k-icon">{style.icon}</div>
                                <span className="k-text">{opt.text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
          </>
        );

      case 'LOCKED':
        return (
          <div className="locked-container">
             <div className="custom-waiting-animation">
                 <div style={{width:100, height:100, borderRadius:'50%', border:'4px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse 2s infinite'}}>
                    <IonIcon icon={pause} style={{fontSize: '3rem', color:'#64748b'}} />
                 </div>
             </div>
             <h2 className="locked-title">Respuesta Enviada</h2>
             <p className="locked-subtitle">Prepárate para la siguiente pregunta...</p>
          </div>
        );

      case 'FEEDBACK':
        const isCorrect = feedback?.correct;
        const iconClass = isCorrect ? 'checkmark-animation' : 'x-animation';
        return (
          <div className={`sb-feedback-overlay ${isCorrect ? 'bg-correct' : 'bg-wrong'}`}>
             <div className="feedback-content-centered">
                 <div className={iconClass} style={{fontSize: '8rem', marginBottom: 20}}>
                    <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} />
                 </div>
                 
                 <h1 className="feedback-title">{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</h1>
                 <div className="points-pill">+{feedback.pointsEarned} Pts</div>
                 
                 <div className="rank-display">
                    <span className="rank-label">Tu Posición</span>
                    <span className="rank-value">#{feedback.rank}</span>
                 </div>
             </div>
             <div className="feedback-timer-bar"><div className="feedback-progress"></div></div>
          </div>
        );

      case 'PODIUM': return <PodiumScreen winners={finalRanking} onContinue={() => setViewState('FINAL_RESULT')} />;
      case 'FINAL_RESULT': return amIWinner ? <WinnerScreen points={score} onContinue={onBack} /> : <LoserScreen score={score} onContinue={onBack} />;
    }
  };

  if (viewState === 'PODIUM' || viewState === 'FINAL_RESULT') return <div className="student-battle-full">{renderContent()}</div>;

  return <div className="student-battle-container">{renderContent()}</div>;
};

export default StudentBattleScreen;
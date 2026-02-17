import React, { useEffect, useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { 
  checkmarkCircle, 
  closeCircle, 
  arrowBackOutline,
  hourglassOutline,
  gameControllerOutline
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
  const [totalDuration, setTotalDuration] = useState(20); // ✅ Base para la barra
  const [isConnected, setIsConnected] = useState(true);
  const [currentQNum, setCurrentQNum] = useState(1);
  const [totalQCount, setTotalQCount] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [finalRanking, setFinalRanking] = useState<any[]>([]);
  const [amIWinner, setAmIWinner] = useState(false);

  const [myAvatar, setMyAvatar] = useState<string>('');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const url = user.avatarUrl || user.avatar || user.avatar_url || '';
        setMyAvatar(url ? `${url}?t=${new Date().getTime()}` : '');
      }
    } catch (e) {
      console.error("Error cargando avatar en lobby", e);
    }
  }, []);

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
      const qDuration = data.duration || 20;
      setLocalTimer(qDuration);
      setTotalDuration(qDuration); // ✅ Guardamos duración total
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
          avatarUrl: w.avatarUrl, 
          color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
      }));
      setFinalRanking(podiumWinners);
      
      const myData = winners.find((w: any) => w.name === studentName);
      // ✅ Sincronización con puntos reales configurados por el docente
      if (myData && myData.rewardPoints) {
          setScore(myData.rewardPoints);
      } else {
          setScore(myData ? myData.score : score);
      }

      const myRankIndex = winners.findIndex((w: any) => w.name === studentName);
      setAmIWinner(myRankIndex >= 0 && myRankIndex < 3);
      setViewState('PODIUM');
    });

    return () => {
      socket.off('new-question'); socket.off('answer-received'); socket.off('round-result');
      socket.off('game-over'); socket.off('disconnect'); socket.off('connect');
    };
  }, [studentName, battleId, score]);

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
          <div style={{
            background: '#46178F', minHeight: '100vh', width: '100%', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            padding: 'calc(20px + env(safe-area-inset-top)) 20px 20px', color: 'white'
          }}>
             <button onClick={onBack} style={{
                position: 'absolute', top: 'calc(15px + env(safe-area-inset-top))', left: '20px',
                width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
                border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
             }}>
                <IonIcon icon={arrowBackOutline} style={{fontSize: '1.5rem'}} />
             </button>
             
             <div style={{marginTop: '40px', textAlign: 'center'}}>
                <div style={{
                    width: '80px', height: '80px', background: 'rgba(255,255,255,0.1)',
                    borderRadius: '22px', border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', margin: '0 auto 20px'
                }}>
                    <IonIcon icon={gameControllerOutline} />
                </div>
                <h1 style={{fontSize: '2.2rem', fontWeight: 900, marginBottom: '30px'}}>Lobby de Batalla</h1>
             </div>

             <div style={{
                width: '120px', height: '120px', borderRadius: '50%', 
                background: 'white', padding: '5px', marginBottom: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)', position: 'relative'
             }}>
                <img 
                    src={myAvatar || `https://ui-avatars.com/api/?name=${studentName}&background=random&size=200`} 
                    alt="Avatar" 
                    key={myAvatar}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${studentName}&background=random`; }}
                />
                <div style={{
                    position: 'absolute', bottom: '0', right: '5px', background: '#22c55e',
                    borderRadius: '50%', width: '30px', height: '30px', border: '3px solid #46178F',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <IonIcon icon={checkmarkCircle} style={{fontSize: '16px'}} />
                </div>
             </div>
             
             <h2 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '40px'}}>{studentName}</h2>

             <div style={{
                background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.2)',
                padding: '20px 40px', borderRadius: '25px', textAlign: 'center', backdropFilter: 'blur(10px)'
             }}>
                <p style={{margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, letterSpacing: '2px'}}>PIN DEL JUEGO</p>
                <p style={{margin: 0, fontSize: '3.5rem', fontWeight: 900, color: '#FFA602', letterSpacing: '5px'}}>{battleId}</p>
             </div>

             <div style={{marginTop: 'auto', marginBottom: '40px', textAlign: 'center'}}>
                <IonSpinner name="dots" color="success" style={{transform: 'scale(1.5)'}}/>
                <p style={{marginTop: '15px', fontSize: '1.1rem', opacity: 0.8, fontWeight: 500}}>Esperando al profesor...</p>
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
                            {/* ✅ BARRA DE TIEMPO DINÁMICA */}
                            <div className="kahoot-progress-fill" style={{ width: `${(localTimer / totalDuration) * 100}%`, transition: 'width 1s linear' }}></div>
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
          <div className="kahoot-waiting-screen">
             <div className="waiting-central-icon">
                <IonIcon icon={hourglassOutline} className="pulse-animation" />
             </div>
             <h2 className="waiting-title">Respuesta Enviada</h2>
             <div className="waiting-status-pill">
                Esperando a los demás jugadores...
             </div>
             <p className="waiting-hint">¿Serás el más rápido de la clase?</p>
          </div>
        );

      case 'FEEDBACK':
        const isCorrect = feedback?.correct;
        const iconClass = isCorrect ? 'checkmark-animation' : 'x-animation';
        return (
          <div className={`sb-feedback-overlay ${isCorrect ? 'bg-correct' : 'bg-wrong'}`}>
             <div className="feedback-content-centered" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                 {/* ✅ ICONO CENTRADO USANDO FLEXBOX DIRECTO */}
                 <div className={iconClass} style={{fontSize: '8rem', marginBottom: 20, display: 'flex', justifyContent: 'center', width:'100%'}}>
                    <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} />
                 </div>
                 
                 <h1 className="feedback-title">{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</h1>
                 
                 <div className="feedback-stats-row">
                    <div className="stat-pill-kahoot">
                        <span className="pill-label">PUNTOS</span>
                        <span className="pill-value">+{feedback.pointsEarned || 0}</span>
                    </div>
                    <div className="stat-pill-kahoot">
                        <span className="pill-label">POSICIÓN</span>
                        <span className="pill-value">#{feedback.rank || '1'}</span>
                    </div>
                 </div>

                 <div className="feedback-quote">
                    {isCorrect ? "¡Estás en racha! Sigue así." : "¡No te rindas, la próxima es tuya!"}
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

  return <div className="student-battle-container" style={{background: viewState === 'WAITING' ? '#46178F' : ''}}>{renderContent()}</div>;
};

export default StudentBattleScreen;
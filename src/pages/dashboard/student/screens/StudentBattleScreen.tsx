import React, { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';

// RUTAS DE ASSETS
import checkImg from '../../../../assets/check.png';
import crossImg from '../../../../assets/cross.png';

import { socketService } from '../../../../api/socket'; 
import PodiumScreen from './PodiumScreen';
import WinnerScreen from './WinnerScreen';
import LoserScreen from './LoserScreen';
import './StudentBattleScreen.css';

const ANSWER_STYLES = [
  { color: 'k-red', icon: '▲' }, 
  { color: 'k-blue', icon: '◆' },   
  { color: 'k-yellow', icon: '●' }, 
  { color: 'k-green', icon: '■' }   
];

// COMPONENTE DE TRANSICIÓN (Se mantiene tal cual lo tenías)
const QuestionTransition = ({ questionNumber, onComplete }: { questionNumber: number, onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="transition-overlay">
      <div className="transition-circle-outer">
        <div className="transition-circle-inner">
            <span className="transition-number">{questionNumber}</span>
        </div>
      </div>
      <h2 className="transition-text">Pregunta {questionNumber}</h2>
    </div>
  );
};

const StudentBattleScreen: React.FC<any> = ({ battleId, studentName, onBack }) => {
  const [viewState, setViewState] = useState<any>('WAITING');
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
  const [myAvatar, setMyAvatar] = useState<string>('');

  // EFECTO 1: Cargar Avatar
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setMyAvatar(user.avatarUrl || user.avatar || '');
      }
    } catch (e) { console.error(e); }
  }, []);

  // EFECTO 2: Sockets
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
      setViewState((prev: any) => (prev === 'FEEDBACK' || prev === 'PODIUM' || prev === 'FINAL_RESULT') ? prev : 'LOCKED');
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
      const myRankIndex = winners.findIndex((w: any) => w.name === studentName);
      setAmIWinner(myRankIndex >= 0 && myRankIndex < 3);
      setViewState('PODIUM');
    });

    return () => {
      socket.off('new-question'); socket.off('answer-received'); socket.off('round-result');
      socket.off('game-over'); socket.off('disconnect'); socket.off('connect');
    };
  }, [studentName, battleId]);

  const handleAnswer = (optionId: string) => {
    const socket = socketService.getBattleSocket();
    if (socket && socket.connected) {
      socket.emit('submit-answer', { roomId: battleId, studentName, optionId });
      setViewState('LOCKED');
    }
  };

  const renderContent = () => {
    if (!isConnected) return <div className="sb-locked-screen"><h2>Desconectado</h2><IonSpinner/></div>;

    switch (viewState) {
      case 'WAITING':
        return (
          <div className="sb-lobby-container">
            <button onClick={onBack} className="sb-back-btn">Volver</button>
            <div className="sb-avatar-box">
              {myAvatar ? <img src={myAvatar} alt="Avatar" /> : studentName.substring(0, 2).toUpperCase()}
            </div>
            <h1 className="sb-welcome-text">¡Hola, {studentName}!</h1>
            <div className="sb-room-card">
              <span className="sb-card-label">CÓDIGO DE SALA</span>
              <h2 className="sb-card-number">{battleId}</h2>
            </div>
            <div className="sb-waiting-footer">
              <IonSpinner name="dots" color="primary" />
              <p>Esperando a que el profesor inicie...</p>
            </div>
          </div>
        );

      case 'QUESTION':
        return (
          <>
            {showTransition && <QuestionTransition questionNumber={currentQNum} onComplete={() => setShowTransition(false)} />}
            <div className="sb-quiz-layout">
              <div className="sb-quiz-header">
                <div className="sb-progress-bar"><div style={{ width: `${(currentQNum/totalQCount)*100}%` }}></div></div>
                <span>{currentQNum} / {totalQCount}</span>
              </div>
              <div className="sb-question-box">
                <h1>{questionData?.text}</h1>
              </div>
              <div className="sb-quiz-grid">
                {questionData?.options.map((opt: any, index: number) => (
                  <button key={opt.id} onClick={() => handleAnswer(opt.id)} className={`sb-quiz-btn ${ANSWER_STYLES[index % 4].color}`}>
                    <span className="sb-btn-icon">{ANSWER_STYLES[index % 4].icon}</span>
                    <span className="sb-btn-text">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        );

      case 'LOCKED':
        return (
          <div className="sb-locked-screen">
            <div className="sb-locked-icon pulse-animation">⌛</div>
            <h2>Respuesta Enviada</h2>
            <div className="sb-status-pill">Esperando a los demás...</div>
          </div>
        );

      case 'FEEDBACK':
        const isCorrect = feedback?.correct;
        return (
          <div className={`sb-feedback-screen ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
            <div className="sb-feedback-content">
              <img src={isCorrect ? checkImg : crossImg} className={isCorrect ? 'pop-animation' : 'shake-animation'} alt="result" />
              <h1>{isCorrect ? '¡CORRECTO!' : 'INCORRECTO'}</h1>
              <div className="sb-points-badge">
                <small>PUNTOS</small>
                <strong>+{feedback?.pointsEarned || 0}</strong>
              </div>
            </div>
            <div className="sb-feedback-timer"><div className="sb-timer-fill"></div></div>
          </div>
        );
      
      case 'PODIUM': return <PodiumScreen winners={finalRanking} onContinue={() => setViewState('FINAL_RESULT')} />;
      case 'FINAL_RESULT': return amIWinner ? <WinnerScreen points={score} onContinue={onBack} /> : <LoserScreen score={score} onContinue={onBack} />;
      default: return null;
    }
  };

  return <div className="sb-app-container">{renderContent()}</div>;
};

export default StudentBattleScreen;
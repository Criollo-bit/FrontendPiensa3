import React, { useEffect, useState, useRef } from 'react';
import { 
  IonIcon, 
  IonSpinner, 
  IonSelect, 
  IonSelectOption, 
  IonPage,   
  IonContent,
  IonAlert,
  IonAvatar 
} from '@ionic/react';
import { 
  arrowBackOutline, 
  playOutline, 
  trophy, 
  hourglassOutline, 
  arrowForwardOutline,
  addCircleOutline,
  list,
  closeCircleOutline,
  trashOutline,
  addOutline,
  stopCircleOutline,
  homeOutline 
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import { api } from '../../../../api/axios'; 
import PodiumScreen from '../../student/screens/PodiumScreen'; 

import './BattleControlScreen.css';

const getTeacherId = (): string | null => {
  try {
    const userStr = localStorage.getItem('user'); 
    if (userStr) return JSON.parse(userStr).id;
    const token = localStorage.getItem('token');
    if (token) {
      const base64Url = token.split('.')[1]; 
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const parsedToken = JSON.parse(jsonPayload);
      return parsedToken.sub || parsedToken.id; 
    }
  } catch (e) { console.error(e); }
  return null;
};

interface QuestionDraft {
  question_text: string;
  answers: string[];
  correct_answer_index: number;
}

type BattlePhase = 'INIT' | 'LOBBY' | 'QUESTION' | 'RESULTS' | 'PODIUM_ANIMATION' | 'SUMMARY';

const BattleControlScreen: React.FC = () => {
  const TEACHER_ID = getTeacherId();
  const hasCreatedRoom = useRef(false); // 🔥 Control para que el código NO cambie

  const [phase, setPhase] = useState<BattlePhase>('INIT');
  const [roomId, setRoomId] = useState<string>('');
  const [code, setCode] = useState<string>('...'); 
  
  const [roomName, setRoomName] = useState<string>(() => {
      return localStorage.getItem('tempBattleName') || 'Cargando Sala...';
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);

  const [totalAnswers, setTotalAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [roundStats, setRoundStats] = useState({ correct: 0, incorrect: 0, ranking: [] });
  
  const [finalWinners, setFinalWinners] = useState<any[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newQuestions, setNewQuestions] = useState<QuestionDraft[]>([
    { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }
  ]);

  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; header: string; message: string; buttons: string[] }>({
    isOpen: false, header: '', message: '', buttons: ['OK']
  });
  const showNiceAlert = (header: string, message: string) => setAlertConfig({ isOpen: true, header, message, buttons: ['Entendido'] });

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!TEACHER_ID) {
      showNiceAlert("Error", "No se identificó al profesor.");
      setTimeout(() => window.location.href = '/login', 2000);
      return;
    }

    const socket = socketService.connectToBattle();
    const storedName = localStorage.getItem('tempBattleName');

    // 🔥 SOLO CREAR SALA SI NO SE HA CREADO YA
    if (!hasCreatedRoom.current) {
        localStorage.removeItem('currentBattleId');
        socket.emit('create-room', { teacherId: TEACHER_ID, name: storedName });
        hasCreatedRoom.current = true;
    }

    socket.on('room-created', (data: any) => {
      setRoomId(data.roomId);
      setCode(data.code); 
      setRoomName(data.name || storedName || `Sala ${data.code}`); 
      const banksOnly = (data.mySubjects || []).filter((s: any) => s.cycle === 'BANK');
      setSubjects(banksOnly);
      setPhase('LOBBY');
    });

    socket.on('subject-created-success', (data: any) => {
        setIsSubmitting(false);
        setShowCreateModal(false);
        resetForm();
        socket.emit('get-my-subjects', { teacherId: TEACHER_ID });
        if (data && data.newSubjectId) setSelectedSubjectId(data.newSubjectId);
        showNiceAlert("¡Éxito!", "Banco guardado y seleccionado automáticamente.");
    });

    socket.on('subjects-list', (data: any) => {
      const banksOnly = (data || []).filter((s: any) => s.cycle === 'BANK');
      setSubjects(banksOnly);
    });

    socket.on('room-update', (data: any) => {
      if (data.students) setStudents(data.students);
      if (typeof data.totalAnswers === 'number') setTotalAnswers(data.totalAnswers);
    });

    socket.on('new-question', (data: any) => {
      setPhase('QUESTION');
      setCurrentQuestion(data);
      setTotalAnswers(0);
      setTimeLeft(data.duration || 20);
      if (data.questionNumber) setCurrentQuestionIndex(data.questionNumber);
      if (data.totalQuestions) setTotalQuestionsCount(data.totalQuestions);
    });

    socket.on('round-finished', (data: any) => {
      setPhase('RESULTS');
      setRoundStats({ correct: data.correctCount, incorrect: data.incorrectCount, ranking: data.ranking });
    });

    socket.on('game-over', async (data: { winners: any[] }) => {
        const winners = data.winners || [];
        
        // ✅ CORRECCIÓN: Asignación de puntos reales uno a uno para evitar el 404
        // y asegurar que se use el identificador correcto (studentCode)
        for (const winner of winners.slice(0, 3)) {
          try {
            await api.post('/points/assign-battle-points', {
              studentCode: winner.studentCode || winner.code || winner.name, 
              subjectId: selectedSubjectId,
              amount: winner.rewardPoints || 100,
              reason: `Ganador de Batalla: ${roomName}`
            });
          } catch (e) {
            console.error("Error persistiendo puntos del ganador:", e);
          }
        }

        const podiumWinners = winners.slice(0, 3).map((w: any, index: number) => ({
            position: index + 1,
            name: w.name,
            score: w.score,
            avatarUrl: w.avatarUrl,
            color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
        }));
        setFinalWinners(podiumWinners);
        setPhase('PODIUM_ANIMATION');
    });

    socket.on('error', (msg: string) => { setIsSubmitting(false); showNiceAlert("Error", msg); });

    return () => {
      socket.off('room-created'); socket.off('subjects-list'); 
      socket.off('room-update'); socket.off('new-question'); 
      socket.off('round-finished'); socket.off('game-over'); socket.off('error');
    };
  }, [TEACHER_ID, selectedSubjectId, roomName, roomId]); 

  useEffect(() => {
    if (phase === 'QUESTION' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
      return () => clearInterval(timer);
    } else if (phase === 'QUESTION' && timeLeft === 0) {
      socketService.getBattleSocket()?.emit('time-up', { roomId });
    }
  }, [phase, timeLeft, roomId]);

  // Handlers
  const handleStartBattle = () => {
    if (!selectedSubjectId) return showNiceAlert("Atención", "Selecciona un tema primero.");
    setCurrentQuestionIndex(0); 
    setTotalQuestionsCount(0);
    socketService.getBattleSocket()?.emit('start-question', { roomId, subjectId: selectedSubjectId });
  };

  const handleNextQuestion = () => socketService.getBattleSocket()?.emit('start-question', { roomId });
  
  const handleEndGame = () => socketService.getBattleSocket()?.emit('end-battle', { roomId });
  
  const handleExitToMenu = () => {
      try {
        localStorage.removeItem('tempBattleName');
        localStorage.removeItem('currentBattleId');
        
        if (roomId && socketService.getBattleSocket()?.connected) {
            socketService.getBattleSocket()?.emit('end-battle', { roomId });
        }

        const listKey = `battles_${TEACHER_ID}`;
        const savedBattles = localStorage.getItem(listKey);
        if (savedBattles) {
            const parsedBattles = JSON.parse(savedBattles);
            if (Array.isArray(parsedBattles)) {
                const updatedBattles = parsedBattles.filter((b: any) => b.id !== roomId);
                localStorage.setItem(listKey, JSON.stringify(updatedBattles));
            }
        }
      } catch (e) {
        console.error("Error limpiando:", e);
      }
      window.location.href = '/home';
  };

  const resetForm = () => { 
    setNewBankName(''); 
    setNewQuestions([{ question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]); 
  };

  const handleAddQuestion = () => { 
    if (newQuestions.length >= 20) return showNiceAlert("Límite", "Máximo 20 preguntas"); 
    setNewQuestions([...newQuestions, { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]); 
  };

  const handleRemoveQuestion = (idx: number) => { 
    setNewQuestions(newQuestions.filter((_, i) => i !== idx)); 
  };

  const handleQuestionChange = (idx: number, field: string, val: any) => { 
    const updated = [...newQuestions]; 
    if (field === 'text') updated[idx].question_text = val; 
    if (field === 'correct') updated[idx].correct_answer_index = val; 
    setNewQuestions(updated); 
  };

  const handleAnswerChange = (qIdx: number, aIdx: number, val: string) => { 
    const updated = [...newQuestions]; 
    updated[qIdx].answers[aIdx] = val; 
    setNewQuestions(updated); 
  };
  
  const handleSaveBank = () => {
    if (!newBankName.trim()) return showNiceAlert("Faltan datos", "El banco debe tener nombre");
    if (newQuestions.some(q => !q.question_text.trim() || q.answers.some(a => !a.trim()))) { 
      return showNiceAlert("Faltan datos", "Completa todas las preguntas y respuestas"); 
    }
    setIsSubmitting(true);
    socketService.getBattleSocket()?.emit('create-full-subject', { 
        name: newBankName, 
        teacherId: TEACHER_ID, 
        questions: newQuestions,
        cycle: 'BANK' 
    });
  };

  const isLastQuestion = totalQuestionsCount > 0 && currentQuestionIndex >= totalQuestionsCount;
  const shouldShowRanking = phase === 'RESULTS' || phase === 'PODIUM_ANIMATION' || phase === 'SUMMARY';
  const usersListToRender = shouldShowRanking ? roundStats.ranking : students;

  if (phase === 'PODIUM_ANIMATION') {
      return (
        <div style={{height: '100vh', width: '100%', position: 'absolute', top:0, left:0, zIndex: 9999}}>
             <PodiumScreen 
                winners={finalWinners} 
                onContinue={() => setPhase('SUMMARY')} 
             />
        </div>
      );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="battle-bg-clean">
        <div className="relative-container">
          <button onClick={() => setShowExitConfirm(true)} className="float-back-btn">
            <IonIcon icon={arrowBackOutline} />
          </button>

          <div className="main-content">
            <div className="header-clean">
              <h1 className="header-title">{roomName}</h1>
              {phase !== 'LOBBY' && phase !== 'INIT' && totalQuestionsCount > 0 && (
                  <div className="progress-badge">Pregunta {currentQuestionIndex} / {totalQuestionsCount}</div>
              )}
              <div className="badges-row">
                <span className={`status-badge ${phase === 'LOBBY' ? 'bg-yellow' : phase === 'QUESTION' ? 'bg-green' : 'bg-slate'}`}>
                  {phase === 'LOBBY' ? 'Esperando' : phase === 'QUESTION' ? 'En Curso' : 'Finalizada'}
                </span>
              </div>
            </div>

            {phase === 'INIT' && <div className="loading-container"><IonSpinner name="crescent"/></div>}
            
            {code !== '...' && (
              <div className="hero-card-gradient">
                <p className="hero-label">CÓDIGO DE BATALLA</p>
                <p className="hero-code">{code}</p>
                <p className="hero-hint">Los estudiantes usan este código para unirse</p>
              </div>
            )}

            {phase === 'LOBBY' && (
              <div className="white-card-clean">
                {subjects.length === 0 ? (
                    <div className="text-center">
                        <p className="text-slate-600 mb-4">No tienes bancos de preguntas.</p>
                        <button onClick={() => setShowCreateModal(true)} className="btn-primary-green">
                            <IonIcon icon={addCircleOutline} style={{marginRight: 8}}/> Crear Banco
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="input-group">
                            <label className="input-label"><IonIcon icon={list}/> Elegir Preguntas:</label>
                            <div className="custom-select-wrapper">
                                <IonSelect 
                                    value={selectedSubjectId} 
                                    placeholder="Selecciona un tema..." 
                                    onIonChange={e => setSelectedSubjectId(e.detail.value)}
                                    interface="popover"
                                    className="clean-select"
                                >
                                    {subjects.map((s: any) => (
                                        <IonSelectOption key={s.id} value={s.id}>
                                            {s.name} ({s._count?.questions || 0} pregs)
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                            </div>
                        </div>
                        <div className="text-center mb-separated">
                            <button onClick={() => setShowCreateModal(true)} className="btn-text-link">+ Crear nuevo banco</button>
                        </div>
                        <div className="students-status-bar">
                            <IonIcon icon={playOutline} className="text-sky-600"/> 
                            <span>{students.length} Estudiantes unidos</span>
                        </div>
                        <div className="students-chips-grid">
                            {students.length === 0 ? (
                              <p className="text-slate-400 text-sm">Esperando alumnos...</p>
                            ) : (
                              students.map((s, i) => (
                                <div key={i} className="student-chip-avatar">
                                  <IonAvatar className="mini-avatar">
                                    <img src={s.avatarUrl || `https://ui-avatars.com/api/?name=${s.name}&background=random`} alt="avatar" />
                                  </IonAvatar>
                                  <span>{s.name}</span>
                                </div>
                              ))
                            )}
                        </div>
                        <button onClick={handleStartBattle} disabled={!selectedSubjectId || students.length === 0} className="btn-primary-green full-width">
                          <IonIcon icon={playOutline} style={{marginRight: 8}}/> INICIAR BATALLA
                        </button>
                    </>
                )}
              </div>
            )}

            {phase === 'QUESTION' && (
              <div className="white-card-clean">
                <h2 className="section-title">Pregunta Actual</h2>
                <p className="question-text-lg">{currentQuestion?.text}</p>
                <div className="answers-grid-clean">
                   {currentQuestion?.options.map((opt: any, idx: number) => (
                      <div key={idx} className={`answer-card-clean color-${idx % 4}`}><div className="dot"></div><span className="answer-text">{opt.text}</span></div>
                   ))}
                </div>
                <div className="waiting-pill"><div className="pulse-icon"><IonIcon icon={hourglassOutline} /></div><div className="waiting-text"><strong>Esperando respuestas...</strong><span>{totalAnswers}/{students.length} respondieron</span></div></div>
              </div>
            )}

            {phase === 'RESULTS' && (
               <div className="white-card-clean">
                  <h2 className="section-title">Resultados</h2>
                  <div className="stats-container">
                     <div className="stat-row"><div className="stat-label correct">Correctos ({roundStats.correct})</div><div className="stat-track"><div className="stat-fill correct" style={{width: `${(roundStats.correct / (students.length || 1)) * 100}%`}}></div></div></div>
                     <div className="stat-row"><div className="stat-label incorrect">Incorrectos ({roundStats.incorrect})</div><div className="stat-track"><div className="stat-fill incorrect" style={{width: `${(roundStats.incorrect / (students.length || 1)) * 100}%`}}></div></div></div>
                  </div>
                  {isLastQuestion ? (
                      <button onClick={handleEndGame} className="btn-finish-red full-width">
                          <IonIcon icon={stopCircleOutline} style={{marginRight:8}}/> Finalizar y Ver Podio
                      </button>
                  ) : (
                      <button onClick={handleNextQuestion} className="btn-primary-blue full-width">Siguiente <IonIcon icon={arrowForwardOutline}/></button>
                  )}
               </div>
            )}

            {phase === 'SUMMARY' && (
               <div className="hero-card-green">
                  <IonIcon icon={trophy} className="trophy-icon-lg"/>
                  <h2>Batalla Finalizada</h2>
                  <p className="text-center text-white/90" style={{marginBottom: '20px'}}>Se han asignado los puntos correspondientes a los participantes ganadores.</p>
                  <button onClick={handleExitToMenu} className="btn-white-pill"><IonIcon icon={homeOutline} /> Volver al Menú</button>
               </div>
            )}

            {(phase !== 'LOBBY' && students.length > 0) && (
               <div className="white-card-clean mt-4">
                  <h2 className="section-title">Ranking</h2>
                  <div className="ranking-list-clean">
                     {usersListToRender.map((s: any, idx: number) => (
                        <div key={idx} className={`ranking-row-clean rank-${idx + 1}`}>
                           <div className="rank-left">
                             <div className="rank-badge">{idx + 1}</div>
                             <IonAvatar className="ranking-avatar">
                                <img src={s.avatarUrl || `https://ui-avatars.com/api/?name=${s.name}&background=random`} alt="avatar" />
                             </IonAvatar>
                             <p className="rank-name">{s.name}</p>
                           </div>
                           <p className="rank-score">{s.score} pts</p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>

          {showCreateModal && (
            <div className="qbs-modal-overlay">
              <div className="qbs-modal-content">
                <div className="qbs-modal-header">
                  <h2>Nuevo Banco de Preguntas</h2>
                  <button onClick={() => setShowCreateModal(false)} className="qbs-close-icon"><IonIcon icon={closeCircleOutline} /></button>
                </div>
                <div className="qbs-modal-body">
                  <div className="qbs-form-group">
                    <label>Nombre del Banco</label>
                    <input type="text" placeholder="Ej: Matemáticas" value={newBankName} onChange={e => setNewBankName(e.target.value)} className="qbs-input big" />
                  </div>
                  <div className="qbs-questions-list">
                    <div className="qbs-list-header">
                      <h3>Preguntas ({newQuestions.length})</h3>
                      <button className="qbs-btn-small" onClick={handleAddQuestion} disabled={newQuestions.length >= 20}><IonIcon icon={addOutline} /> Agregar</button>
                    </div>
                    {newQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="qbs-question-card">
                        <div className="qbs-q-header">
                          <span className="qbs-q-num">#{qIdx + 1}</span>
                          {newQuestions.length > 1 && (
                            <button onClick={() => handleRemoveQuestion(qIdx)} className="qbs-btn-trash"><IonIcon icon={trashOutline} /></button>
                          )}
                        </div>
                        <input className="qbs-input full" placeholder="Escribe la pregunta aquí..." value={q.question_text} onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)} />
                        <div className="qbs-answers-grid">
                          {q.answers.map((ans, aIdx) => (
                            <div key={aIdx} className={`qbs-answer-row ${q.correct_answer_index === aIdx ? 'correct' : ''}`}>
                              <div className="qbs-radio-wrapper">
                                <input type="radio" checked={q.correct_answer_index === aIdx} onChange={() => handleQuestionChange(qIdx, 'correct', aIdx)} />
                              </div>
                              <input className="qbs-input small" placeholder={`Opción ${aIdx + 1}`} value={ans} onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="qbs-modal-footer">
                  <button className="qbs-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                  <button className="qbs-btn-primary" onClick={handleSaveBank} disabled={isSubmitting}>{isSubmitting ? <IonSpinner name="dots" /> : 'Guardar y Usar'}</button>
                </div>
              </div>
            </div>
          )}

          <IonAlert isOpen={alertConfig.isOpen} onDidDismiss={() => setAlertConfig({ ...alertConfig, isOpen: false })} header={alertConfig.header} message={alertConfig.message} buttons={alertConfig.buttons}/>
          <IonAlert
            isOpen={showExitConfirm}
            onDidDismiss={() => setShowExitConfirm(false)}
            header="¿Salir de la sala?"
            message="Al salir, la sala se perderá definitivamente y todos los estudiantes serán desconectados."
            buttons={[
              { text: 'Cancelar', role: 'cancel', cssClass: 'secondary' },
              { text: 'Salir y Cerrar', cssClass: 'danger-button', handler: () => { handleExitToMenu(); return true; } }
            ]}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BattleControlScreen;
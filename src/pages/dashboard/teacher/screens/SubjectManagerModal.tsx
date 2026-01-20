import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonSpinner, IonToast } from '@ionic/react';
import { close, add, trash, save, arrowBack, checkmarkCircle } from 'ionicons/icons';
import { socketService } from '../../../../api/socket';
import './SubjectManagerModal.css';

interface Question {
  question_text: string;
  answers: string[];
  correct_answer_index: number;
}

interface Subject {
  id: string;
  name: string;
  cycle?: string;
  _count?: { questions: number };
}

interface SubjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'view' | 'create';
  teacherId: string;
}

const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({ isOpen, onClose, initialMode, teacherId }) => {
  const [mode, setMode] = useState<'view' | 'create'>(initialMode);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [setName, setSetName] = useState('');
  const [newQuestions, setNewQuestions] = useState<Question[]>([
    { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }
  ]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if(initialMode === 'view') loadSubjects();
      if(initialMode === 'create') resetForm();
    }
  }, [isOpen, initialMode]);

  const resetForm = () => {
    setSetName('');
    setNewQuestions([{ question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
  };

  const loadSubjects = () => {
    setIsLoading(true);
    const socket = socketService.connectToBattle();
    socket.emit('get-my-subjects', { teacherId });
    socket.on('subjects-list', (data: Subject[]) => {
      // 🟢 FILTRO: Solo mostramos bancos
      const banksOnly = data.filter(s => s.cycle === 'BANK');
      setSubjects(banksOnly);
      setIsLoading(false);
    });
  };

  const handleAddQuestion = () => {
    if (newQuestions.length >= 20) return setToastMsg('Máximo 20 preguntas');
    setNewQuestions([...newQuestions, { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (newQuestions.length <= 1) return setToastMsg('Mínimo 1 pregunta');
    setNewQuestions(newQuestions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...newQuestions];
    updated[index].question_text = value;
    setNewQuestions(updated);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...newQuestions];
    updated[qIndex].answers[aIndex] = value;
    setNewQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex: number, aIndex: number) => {
    const updated = [...newQuestions];
    updated[qIndex].correct_answer_index = aIndex;
    setNewQuestions(updated);
  };

  const handleCreateSet = () => {
    if (!setName.trim()) return setToastMsg('Ingresa un nombre para el banco');
    for (let i = 0; i < newQuestions.length; i++) {
      const q = newQuestions[i];
      if (!q.question_text.trim()) return setToastMsg(`Pregunta ${i + 1} está vacía`);
      if (q.answers.some(a => !a.trim())) return setToastMsg(`Pregunta ${i + 1} tiene respuestas vacías`);
    }

    setIsLoading(true);
    const socket = socketService.getBattleSocket();
    
    if (socket) {
        // 🟢 CREACIÓN: cycle='BANK'
        socket.emit('create-full-subject', { 
            name: setName, 
            teacherId, 
            questions: newQuestions,
            cycle: 'BANK' 
        });

        socket.once('subject-created-success', () => {
            setToastMsg('¡Banco creado exitosamente!');
            setIsLoading(false);
            resetForm();
            setMode('view');
            loadSubjects(); 
        });

        socket.once('error', (err) => {
            setToastMsg('Error: ' + err);
            setIsLoading(false);
        });
    }
  };

  const renderContent = () => {
    if (mode === 'view') {
      return (
        <div className="sm-container">
          <div className="sm-actions-bar">
            <h2 className="sm-title">Mis Bancos</h2>
            <button className="sm-btn btn-primary" onClick={() => setMode('create')}>
              <IonIcon icon={add} /> Nuevo
            </button>
          </div>
          
          {isLoading ? <div style={{textAlign:'center', marginTop: 50}}><IonSpinner /></div> : (
             <div style={{ display: 'grid', gap: '15px' }}>
               {subjects.length === 0 ? <p style={{textAlign:'center', color:'#94a3b8'}}>No tienes bancos aún.</p> : 
                 subjects.map(sub => (
                   <div key={sub.id} style={{background:'white', padding:15, borderRadius:12, border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <div>
                        <h3 style={{margin:'0 0 5px 0', fontWeight:700, color:'#334155'}}>{sub.name}</h3>
                        <span style={{fontSize:'0.85rem', color:'#64748b', background:'#f1f5f9', padding:'2px 8px', borderRadius:4}}>
                          {sub._count?.questions || 0} preguntas
                        </span>
                      </div>
                   </div>
                 ))
               }
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="sm-container">
        <div className="sm-header-actions">
            <button className="sm-btn btn-secondary" onClick={() => setMode('view')}>
                <IonIcon icon={arrowBack} /> Volver
            </button>
        </div>

        <h2 className="sm-title">Crear Banco de Preguntas</h2>
        <p className="sm-subtitle">Diseña tu cuestionario para las batallas.</p>

        <div className="sm-section">
            <label className="sm-label">Nombre del Banco</label>
            <input 
                type="text" 
                className="sm-input" 
                placeholder="Ej: Matemáticas - Unidad 1"
                value={setName}
                onChange={e => setSetName(e.target.value)}
            />
        </div>

        <div className="sm-actions-bar">
            <h3 style={{margin:0, color:'#334155'}}>Preguntas ({newQuestions.length})</h3>
            <button className="sm-btn btn-add" onClick={handleAddQuestion} disabled={newQuestions.length >= 20}>
                <IonIcon icon={add} /> Agregar Pregunta
            </button>
        </div>

        {newQuestions.map((q, qIdx) => (
            <div key={qIdx} className="sm-question-card">
                <div className="sm-card-header">
                    <span className="sm-q-number">Pregunta {qIdx + 1}</span>
                    {newQuestions.length > 1 && (
                        <button className="sm-btn-trash" onClick={() => handleRemoveQuestion(qIdx)}>
                            <IonIcon icon={trash} />
                        </button>
                    )}
                </div>

                <input 
                    type="text" 
                    className="sm-input" 
                    placeholder="Escribe la pregunta aquí..." 
                    value={q.question_text}
                    onChange={e => handleQuestionChange(qIdx, e.target.value)}
                    style={{marginBottom: '15px', fontWeight: 600}}
                />

                <div className="sm-answers-grid">
                    {q.answers.map((ans, aIdx) => (
                        <div key={aIdx} className={`sm-answer-row ${q.correct_answer_index === aIdx ? 'correct' : ''}`}>
                            <input 
                                type="radio" 
                                className="sm-radio"
                                name={`q-${qIdx}`}
                                checked={q.correct_answer_index === aIdx}
                                onChange={() => handleCorrectAnswerChange(qIdx, aIdx)}
                            />
                            <input 
                                type="text"
                                className="sm-input-answer"
                                placeholder={`Opción ${aIdx + 1}`}
                                value={ans}
                                onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                            />
                            {q.correct_answer_index === aIdx && <IonIcon icon={checkmarkCircle} color="success" />}
                        </div>
                    ))}
                </div>
            </div>
        ))}

        <div className="sm-footer">
            <button className="sm-btn btn-secondary" onClick={() => setMode('view')}>Cancelar</button>
            <button className="sm-btn btn-success" onClick={handleCreateSet} disabled={isLoading}>
                {isLoading ? <IonSpinner name="dots" /> : <><IonIcon icon={save} /> Guardar Banco</>}
            </button>
        </div>
      </div>
    );
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="subject-manager-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestor de Contenido</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}><IonIcon icon={close} /></IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>{renderContent()}</IonContent>
      <IonToast isOpen={!!toastMsg} message={toastMsg || ''} duration={2000} onDidDismiss={() => setToastMsg(null)} />
    </IonModal>
  );
};

export default SubjectManagerModal;
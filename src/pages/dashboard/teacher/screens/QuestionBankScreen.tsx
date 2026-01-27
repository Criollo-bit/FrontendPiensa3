import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { 
  arrowBackOutline, 
  addCircleOutline, 
  trashOutline, 
  listOutline, 
  checkmarkCircle,
  closeCircleOutline,
  addOutline,
  documentTextOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import './QuestionBankScreen.css';

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

interface QuestionBankScreenProps {
  onBack: () => void;
  teacherId: string; 
}

const QuestionBankScreen: React.FC<QuestionBankScreenProps> = ({ onBack, teacherId }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setName, setSetName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }
  ]);

  // 🔥 NUEVO ESTADO PARA ALERTAS ELEGANTES
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, message: string, color: string}>({
    isOpen: false,
    message: '',
    color: 'success'
  });

  useEffect(() => {
    const socket = socketService.connectToBattle();
    
    socket.emit('get-my-subjects', { teacherId: teacherId });

    socket.on('subjects-list', (data: Subject[]) => {
      const banksOnly = data.filter(s => s.cycle === 'BANK');
      setSubjects(banksOnly);
      setIsLoading(false);
      setIsSubmitting(false);
    });

    socket.on('subject-created-success', () => {
      setShowModal(false);
      resetForm();
      socket.emit('get-my-subjects', { teacherId: teacherId });
      // 🔥 REEMPLAZO DE ALERT RÚSTICO
      setToastConfig({
        isOpen: true,
        message: '¡Banco de preguntas creado exitosamente!',
        color: 'success'
      });
    });

    socket.on('error', (err) => {
      setToastConfig({
        isOpen: true,
        message: `Error: ${err}`,
        color: 'danger'
      });
      setIsSubmitting(false);
    });

    return () => {
      socket.off('subjects-list');
      socket.off('subject-created-success');
      socket.off('error');
    };
  }, [teacherId]);

  const handleAddQuestion = () => {
    if (questions.length >= 20) return alert('Máximo 20 preguntas por set');
    setQuestions([...questions, { question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return alert('Mínimo 1 pregunta');
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    if (field === 'text') updated[index].question_text = value;
    if (field === 'correct') updated[index].correct_answer_index = value;
    setQuestions(updated);
  };

  const handleAnswerChange = (qIndex: number, aIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].answers[aIndex] = value;
    setQuestions(updated);
  };

  const resetForm = () => {
    setSetName('');
    setQuestions([{ question_text: '', answers: ['', '', '', ''], correct_answer_index: 0 }]);
    setIsSubmitting(false);
  };

  const validateAndSave = () => {
    if (!setName.trim()) return alert('Ingresa un nombre para el banco');
    if (questions.length < 1) return alert('Agrega al menos 1 pregunta');

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) return alert(`La pregunta ${i + 1} no tiene texto`);
      if (questions[i].answers.some(a => !a.trim())) return alert(`La pregunta ${i + 1} tiene respuestas vacías`);
    }

    setIsSubmitting(true);
    socketService.getBattleSocket()?.emit('create-full-subject', {
      name: setName,
      teacherId: teacherId, 
      questions: questions,
      cycle: 'BANK' 
    });
  };

  return (
    <div className="qbs-container">
      <button onClick={onBack} className="qbs-float-back-btn">
        <IonIcon icon={arrowBackOutline} />
      </button>

      <div className="qbs-content">
        <div className="qbs-header">
          <h1 className="qbs-title">Mis Bancos de Preguntas</h1>
          <p className="qbs-subtitle">Gestiona tus cuestionarios para las batallas</p>
        </div>

        {isLoading && (
          <div className="qbs-loading">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando bancos...</p>
          </div>
        )}

        {!isLoading && (
          <>
            <div className="qbs-actions">
               <button className="qbs-btn-create" onClick={() => setShowModal(true)}>
                 <IonIcon icon={addCircleOutline} /> Crear Nuevo Banco
               </button>
            </div>

            {subjects.length === 0 ? (
              <div className="qbs-empty-state">
                <div className="qbs-empty-icon"><IonIcon icon={documentTextOutline} /></div>
                <h3>No tienes bancos de preguntas</h3>
                <p>Crea tu primer set de preguntas para iniciar una batalla.</p>
                <button className="qbs-btn-outline" onClick={() => setShowModal(true)}>Crear Ahora</button>
              </div>
            ) : (
              <div className="qbs-grid">
                {subjects.map((sub) => (
                  <div key={sub.id} className="qbs-card">
                    <div className="qbs-card-header">
                      <div className="qbs-card-icon"><IonIcon icon={listOutline} /></div>
                      <div>
                        <h3>{sub.name}</h3>
                        <span>{sub._count?.questions || 0} Preguntas</span>
                      </div>
                    </div>
                    <div className="qbs-card-footer">
                        <span className="qbs-status-badge">Listo para Batalla</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="qbs-modal-overlay">
          <div className="qbs-modal-content">
            <div className="qbs-modal-header">
              <h2>Nuevo Banco de Preguntas</h2>
              <button onClick={() => setShowModal(false)} className="qbs-close-icon">
                <IonIcon icon={closeCircleOutline} />
              </button>
            </div>

            <div className="qbs-modal-body">
              <div className="qbs-form-group">
                <label>Nombre del Banco</label>
                <input 
                  type="text" 
                  placeholder="Ej: Historia Universal - Unidad 1"
                  value={setName}
                  onChange={e => setSetName(e.target.value)}
                  className="qbs-input big"
                />
              </div>

              <div className="qbs-questions-list">
                 <div className="qbs-list-header">
                   <h3>Preguntas ({questions.length})</h3>
                   <button className="qbs-btn-small" onClick={handleAddQuestion} disabled={questions.length >= 20}>
                      <IonIcon icon={addOutline} /> Agregar
                   </button>
                 </div>

                 {questions.map((q, qIdx) => (
                   <div key={qIdx} className="qbs-question-card">
                      <div className="qbs-q-header">
                         <span className="qbs-q-num">#{qIdx + 1}</span>
                         {questions.length > 1 && (
                           <button onClick={() => handleRemoveQuestion(qIdx)} className="qbs-btn-trash"><IonIcon icon={trashOutline} /></button>
                         )}
                      </div>
                      
                      <input 
                        className="qbs-input full" 
                        placeholder="Escribe la pregunta aquí..."
                        value={q.question_text}
                        onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)}
                      />

                      <div className="qbs-answers-grid">
                        {q.answers.map((ans, aIdx) => (
                          <div key={aIdx} className={`qbs-answer-row ${q.correct_answer_index === aIdx ? 'correct' : ''}`}>
                             <div className="qbs-radio-wrapper">
                                <input 
                                  type="radio" 
                                  name={`correct-${qIdx}`}
                                  checked={q.correct_answer_index === aIdx}
                                  onChange={() => handleQuestionChange(qIdx, 'correct', aIdx)}
                                />
                             </div>
                             <input 
                               className="qbs-input small" 
                               placeholder={`Opción ${aIdx + 1}`}
                               value={ans}
                               onChange={e => handleAnswerChange(qIdx, aIdx, e.target.value)}
                             />
                             {q.correct_answer_index === aIdx && <IonIcon icon={checkmarkCircle} className="text-green"/>}
                          </div>
                        ))}
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="qbs-modal-footer">
              <button className="qbs-btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button 
                className="qbs-btn-primary" 
                onClick={validateAndSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? <IonSpinner name="dots" /> : 'Guardar Banco'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 COMPONENTE DE ÉXITO MEJORADO */}
      <IonToast
        isOpen={toastConfig.isOpen}
        message={toastConfig.message}
        color={toastConfig.color}
        duration={3000}
        position="top"
        icon={toastConfig.color === 'success' ? checkmarkCircleOutline : closeCircleOutline}
        onDidDismiss={() => setToastConfig({ ...toastConfig, isOpen: false })}
        buttons={[
          {
            text: 'OK',
            role: 'cancel'
          }
        ]}
      />
    </div>
  );
};

export default QuestionBankScreen;
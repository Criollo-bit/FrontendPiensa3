import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonButton, IonIcon, IonItem, IonLabel, IonInput, IonNote, IonFooter
} from '@ionic/react';
import { close, layers, helpCircle } from 'ionicons/icons';
import './CreateBattleModal.css';

// --- INTERFACES ---
interface QuestionSet {
  id: string;
  set_name: string;
  description?: string;
  question_count: number;
}

interface Question {
    text: string;
    answers: string[];
    correctIndex: number;
}

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Callback modificado para recibir datos limpios
  onCreate: (battleData: {
      name: string; 
      roundCount: number; 
      groupCount: number; 
      questions: Question[]; 
      studentsPerGroup: number
  }) => void;
  teacherId: string;
  isLoading?: boolean;
}

// --- DATOS MOCK (Simulando Backend) ---
const MOCK_SETS: QuestionSet[] = [
    { id: '1', set_name: 'Matemáticas Básicas', description: 'Sumas y restas rápidas', question_count: 5 },
    { id: '2', set_name: 'Historia Universal', description: 'Eventos del siglo XX', question_count: 10 },
    { id: '3', set_name: 'Cultura General', description: 'Mix de preguntas variadas', question_count: 8 },
];

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ 
    isOpen, onClose, onCreate, teacherId, isLoading = false 
}) => {
  // Estados del Formulario
  const [battleName, setBattleName] = useState('');
  const [groupCount, setGroupCount] = useState(2);
  const [studentsPerGroup, setStudentsPerGroup] = useState(1);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  
  // Estado de Datos
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadQuestionSets();
    }
  }, [isOpen, teacherId]);

  const loadQuestionSets = async () => {
    // AQUÍ: Reemplazaríamos esto con axios.get('/api/question-sets')
    // Simulamos un delay de red
    setTimeout(() => {
        setQuestionSets(MOCK_SETS);
    }, 300);
  };

  const handleSubmit = () => {
    if (battleName.trim() === '') {
      alert('Por favor, dale un nombre a la batalla.');
      return;
    }
    if (!selectedSetId) {
      alert('Debes seleccionar un set de preguntas.');
      return;
    }

    // Simulamos la obtención de preguntas del set seleccionado
    const selectedSet = questionSets.find(s => s.id === selectedSetId);
    if (!selectedSet) return;

    // Generamos preguntas dummy según el conteo del set
    const mockQuestions: Question[] = Array.from({ length: selectedSet.question_count }).map((_, i) => ({
        text: `¿Pregunta simulada número ${i + 1} del set ${selectedSet.set_name}?`,
        answers: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctIndex: 0
    }));

    onCreate({
        name: battleName,
        roundCount: mockQuestions.length,
        groupCount: groupCount,
        questions: mockQuestions,
        studentsPerGroup: studentsPerGroup
    });

    // Resetear form
    setBattleName('');
    setGroupCount(2);
    setStudentsPerGroup(1);
    setSelectedSetId('');
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Crear Nueva Batalla</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="battle-modal-content">
        <div className="modal-form-container">
            
            {/* Input Nombre */}
            <IonItem className="input-item" lines="none">
                <IonLabel position="stacked">Nombre de la Batalla</IonLabel>
                <IonInput 
                    placeholder="Ej: Torneo Matemático" 
                    value={battleName}
                    onIonChange={e => setBattleName(e.detail.value!)}
                />
            </IonItem>

            {/* Inputs Numéricos */}
            <div className="number-inputs-row">
                <IonItem className="input-item" lines="none" style={{ flex: 1 }}>
                    <IonLabel position="stacked">Grupos (2-10)</IonLabel>
                    <IonInput 
                        type="number" 
                        min="2" max="10"
                        value={groupCount}
                        onIonChange={e => setGroupCount(parseInt(e.detail.value!, 10))}
                    />
                </IonItem>

                <IonItem className="input-item" lines="none" style={{ flex: 1 }}>
                    <IonLabel position="stacked">Alumnos/Grupo</IonLabel>
                    <IonInput 
                        type="number" 
                        min="1" max="10"
                        value={studentsPerGroup}
                        onIonChange={e => setStudentsPerGroup(parseInt(e.detail.value!, 10))}
                    />
                </IonItem>
            </div>

            {/* Selección de Sets */}
            <div>
                <IonLabel color="medium" style={{ marginLeft: '5px', marginBottom: '10px', display: 'block' }}>
                    Seleccionar Set de Preguntas
                </IonLabel>
                
                <div className="sets-selection-container">
                    {questionSets.length === 0 ? (
                        <div className="empty-sets-state">
                            <IonIcon icon={layers} style={{ fontSize: '2rem', marginBottom: '1rem' }} />
                            <p>Cargando sets o no existen...</p>
                        </div>
                    ) : (
                        questionSets.map(set => (
                            <div 
                                key={set.id}
                                onClick={() => setSelectedSetId(set.id)}
                                className={`set-item-card ${selectedSetId === set.id ? 'selected' : ''}`}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 className="set-title">{set.set_name}</h4>
                                    {selectedSetId === set.id && (
                                        <IonIcon icon={helpCircle} color="primary" />
                                    )}
                                </div>
                                <p className="set-description">{set.description || 'Sin descripción'}</p>
                                <div className="set-meta">
                                    {set.question_count} Preguntas
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </IonContent>

      <IonFooter>
        <div className="modal-footer-buttons">
            <IonButton expand="block" fill="outline" color="medium" onClick={onClose} style={{ flex: 1 }}>
                Cancelar
            </IonButton>
            <IonButton 
                expand="block" 
                style={{ flex: 2 }}
                onClick={handleSubmit}
                disabled={!battleName || !selectedSetId || isLoading}
            >
                {isLoading ? 'Creando...' : 'Crear Batalla'}
            </IonButton>
        </div>
      </IonFooter>
    </IonModal>
  );
};

export default CreateBattleModal;
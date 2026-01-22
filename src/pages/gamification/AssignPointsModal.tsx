import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonSelect, IonSelectOption, IonInput, IonButton, 
  IonToast, IonLoading, IonIcon
} from '@ionic/react'; 
import { bookOutline, personOutline, star, chatboxEllipsesOutline, close } from 'ionicons/icons';
import { api } from '../../api/axios'; 
import './AssignPointsModal.css';

interface AssignPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AssignPointsModal: React.FC<AssignPointsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]); 
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudentCode, setSelectedStudentCode] = useState(''); 
  const [points, setPoints] = useState<number>(100);
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        resetForm();
        loadSubjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSubject) {
        loadStudents(selectedSubject);
        setSelectedStudentCode(''); 
    } else {
        setEnrolledStudents([]);
    }
  }, [selectedSubject]);

  const resetForm = () => {
      setSelectedSubject('');
      setSelectedStudentCode('');
      setPoints(100); 
      setReason('');
      setMessage(null);
      setEnrolledStudents([]);
  };

  const loadSubjects = async () => {
      try {
          const res = await api.get('/subjects');
          // 🔥 FILTRO: Eliminamos bancos de preguntas
          const cleanSubjects = res.data.filter((s: any) => 
            !s.name.toLowerCase().includes('banco') && s.cycle !== 'BANK'
          );
          setSubjects(cleanSubjects);
      } catch (e) { console.error(e); }
  };

  const loadStudents = async (subjectId: string) => {
      try {
          const res = await api.get(`/enrollments/subject/${subjectId}`);
          setEnrolledStudents(res.data);
      } catch (error) {
          console.error("Error cargando estudiantes", error);
      }
  };

  // 🔥 SUMA LÓGICA: No reemplaza el valor, lo suma al actual
  const addPoints = (amount: number) => {
      setPoints(prev => (Number(prev) || 0) + amount);
  };

  const handleAssign = async () => {
    if (!selectedSubject || !selectedStudentCode) {
      setMessage('Por favor selecciona una materia y un estudiante.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/points/assign', {
        subjectId: selectedSubject,
        studentCode: selectedStudentCode,
        amount: Number(points),
        reason: reason || 'Participación en clase'
      });

      setMessage('¡Puntos asignados con éxito! 🎉');
      if (onSuccess) onSuccess(); 

      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al asignar puntos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="assign-points-modal">
      <div className="modal-content-wrapper">
        <button className="modal-close-btn" onClick={onClose}><IonIcon icon={close} /></button>
        
        <div className="assign-card-inner">
            <div className="card-header"><h2>Recompensar Alumno</h2></div>

            <div className="input-group">
                <div className="label-with-icon"><IonIcon icon={bookOutline} /><label>Materia</label></div>
                <div className="custom-input-wrapper">
                    <IonSelect 
                        value={selectedSubject} 
                        placeholder="Selecciona materia" 
                        onIonChange={e => setSelectedSubject(e.detail.value)} 
                        className="custom-select"
                        interface="action-sheet"
                    >
                        {subjects.map(sub => (
                            <IonSelectOption key={sub.id} value={sub.id}>{sub.name}</IonSelectOption>
                        ))}
                    </IonSelect>
                </div>
            </div>

            <div className="input-group">
                <div className="label-with-icon"><IonIcon icon={personOutline} /><label>Estudiante</label></div>
                <div className="custom-input-wrapper">
                    <IonSelect 
                        value={selectedStudentCode} 
                        placeholder={selectedSubject ? "Selecciona alumno" : "Elige materia primero"}
                        disabled={!selectedSubject || enrolledStudents.length === 0}
                        onIonChange={e => setSelectedStudentCode(e.detail.value)}
                        className="custom-select"
                        interface="action-sheet" 
                    >
                        {enrolledStudents.map(std => (
                            <IonSelectOption key={std.studentCode} value={std.studentCode}>
                                {std.fullName}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </div>
            </div>

            <div className="input-group">
                <div className="label-with-icon"><IonIcon icon={star} className="star-icon"/><label>Cantidad</label></div>
                <div className="custom-input-wrapper points-wrapper">
                    <IonInput 
                        type="number" 
                        value={points} 
                        onIonChange={e => setPoints(parseInt(e.detail.value!, 10))} 
                        className="points-input"
                    />
                    <div className="quick-points">
                        <span onClick={() => addPoints(50)}>+50</span>
                        <span onClick={() => addPoints(100)}>+100</span>
                    </div>
                </div>
            </div>

            <div className="input-group">
                <div className="label-with-icon"><IonIcon icon={chatboxEllipsesOutline} /><label>Motivo</label></div>
                <div className="custom-input-wrapper">
                    <IonInput placeholder="Opcional" value={reason} onIonChange={e => setReason(e.detail.value!)} />
                </div>
            </div>

            <IonButton expand="block" onClick={handleAssign} className="btn-assign-submit" shape="round">ENVIAR PUNTOS</IonButton>
        </div>

        <IonLoading isOpen={loading} message="Procesando..." spinner="crescent"/>
        <IonToast isOpen={!!message} message={message || ''} duration={2000} color={message?.includes('éxito') ? 'success' : 'danger'} position="top"/>
      </div>
    </IonModal>
  );
};

export default AssignPointsModal;
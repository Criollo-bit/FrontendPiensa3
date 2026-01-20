import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { arrowBack, folderOpenOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import './StudentListScreen.css';

interface StudentListScreenProps {
  onBack: () => void;
}

interface Subject {
  id: string;
  name: string;
  cycle: string;
  year: number;
  joinCode: string; 
}

interface Student {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  joinedAt: string;
}

const StudentListScreen: React.FC<StudentListScreenProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/subjects');
      // 🟢 FILTRO: Excluimos los bancos de preguntas (cycle === 'BANK')
      const classesOnly = response.data.filter((s: Subject) => s.cycle !== 'BANK');
      setSubjects(classesOnly);
    } catch (error) {
      console.error('Error cargando materias:', error);
      setErrorMsg('No se pudieron cargar tus clases.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    setStudents([]); 
    setIsLoading(true);

    try {
      const response = await api.get(`/enrollment/subject/${subject.id}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setErrorMsg(`Error al cargar alumnos de ${subject.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInternalBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
      setStudents([]);
    } else {
      onBack();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="student-list-container">
      <div className="sl-content">
        
        <div className="sl-header">
          <IonButton fill="clear" onClick={handleInternalBack} className="sl-back-btn">
             <IonIcon icon={arrowBack} style={{ fontSize: '24px', color: '#334155' }} />
          </IonButton>

          <div className="sl-title-box">
            <h1>{selectedSubject ? selectedSubject.name : 'Mis Clases'}</h1>
            <p className="sl-subtitle">
              {selectedSubject 
                ? `${students.length} estudiantes inscritos` 
                : 'Selecciona una clase para ver sus alumnos'}
            </p>
          </div>
        </div>

        {isLoading && students.length === 0 && subjects.length === 0 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando...</p>
          </div>
        ) : (
          <>
            {!selectedSubject && (
              <div className="subjects-grid">
                {subjects.length === 0 && !isLoading ? (
                    <div className="loading-container">
                        <IonIcon icon={folderOpenOutline} className="empty-state-icon"/>
                        <p>No tienes clases creadas aún.</p>
                    </div>
                ) : (
                    subjects.map(subj => (
                    <div 
                        key={subj.id} 
                        className="subject-folder-card"
                        onClick={() => handleSelectSubject(subj)}
                    >
                        <IonIcon icon={peopleOutline} style={{ fontSize: '2.5rem', color: '#6366f1' }} />
                        <h3 className="subject-name">{subj.name}</h3>
                        
                        <p style={{
                            margin: '5px 0', 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold', 
                            color: '#f59e0b', 
                            letterSpacing: '2px'
                        }}>
                            {subj.joinCode}
                        </p>

                        <span className="subject-cycle">{subj.cycle}</span>
                    </div>
                    ))
                )}
              </div>
            )}

            {selectedSubject && (
              <div className="students-list-wrapper">
                {students.length === 0 && !isLoading ? (
                  <div className="loading-container">
                    <IonIcon icon={personOutline} className="empty-state-icon"/>
                    <p>No hay estudiantes inscritos en esta materia todavía.</p>
                  </div>
                ) : (
                  students.map(student => (
                    <div key={student.id} className="student-item">
                      <div className="student-avatar">
                        {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt="avatar" />
                        ) : (
                            getInitials(student.fullName)
                        )}
                      </div>
                      <div className="student-details">
                        <h3>{student.fullName}</h3>
                        <p>{student.email}</p>
                      </div>
                      <div className="joined-date">
                        {new Date(student.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                    <div style={{textAlign: 'center', padding: '10px'}}>
                        <IonSpinner name="dots" />
                    </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <IonToast
        isOpen={!!errorMsg}
        message={errorMsg || ''}
        duration={3000}
        color="danger"
        onDidDismiss={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default StudentListScreen;
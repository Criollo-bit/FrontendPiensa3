import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { arrowBack, folderOpenOutline, peopleOutline, personOutline } from 'ionicons/icons';
// Asegúrate de que esta ruta apunte a tu configuración de axios
import { api } from '../../../../api/axios'; 
import './StudentListScreen.css';

interface StudentListScreenProps {
  onBack: () => void;
}

// Interfaces basadas en tu Schema Prisma y lo que devuelve el backend
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
  // --- ESTADOS ---
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- EFECTOS ---
  
  // 1. Carga inicial: Traer las materias del profesor
  useEffect(() => {
    loadSubjects();
  }, []);

  // --- FUNCIONES DE CARGA ---

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      // Endpoint existente en SubjectController
      const response = await api.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error cargando materias:', error);
      setErrorMsg('No se pudieron cargar tus clases.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubject = async (subject: Subject) => {
    setSelectedSubject(subject);
    setStudents([]); // Limpiar lista anterior para que no parpadee info vieja
    setIsLoading(true);

    try {
      // 👇 CORRECCIÓN AQUÍ: 'enrollment' en singular para coincidir con el backend
      const response = await api.get(`/enrollment/subject/${subject.id}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setErrorMsg(`Error al cargar alumnos de ${subject.name}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NAVEGACIÓN ---

  const handleInternalBack = () => {
    if (selectedSubject) {
      // Si estamos dentro de una materia, "volvemos" a la lista de materias
      setSelectedSubject(null);
      setStudents([]);
    } else {
      // Si estamos en la raíz, volvemos al Dashboard principal
      onBack();
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  // --- RENDER ---

  return (
    <div className="student-list-container">
      <div className="sl-content">
        
        {/* ENCABEZADO DINÁMICO */}
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

        {/* CONTENIDO PRINCIPAL */}
        {isLoading && students.length === 0 && subjects.length === 0 ? (
          <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando...</p>
          </div>
        ) : (
          <>
            {/* VISTA 1: GRID DE MATERIAS (Cuando no hay materia seleccionada) */}
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
                        
                        {/* VISUALIZACIÓN DEL CÓDIGO */}
                        <p style={{
                            margin: '5px 0', 
                            fontSize: '1.2rem', 
                            fontWeight: 'bold', 
                            color: '#f59e0b', // Color Ámbar
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

            {/* VISTA 2: LISTA DE ESTUDIANTES (Cuando hay materia seleccionada) */}
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
                {/* Spinner pequeño si recargamos la lista interna */}
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

      {/* Notificaciones de Error */}
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
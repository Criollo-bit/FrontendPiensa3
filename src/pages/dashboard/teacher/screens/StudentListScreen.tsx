import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonSpinner, IonToast, IonActionSheet, IonAlert } from '@ionic/react';
import { 
  arrowBack, 
  folderOpenOutline, 
  peopleOutline, 
  personOutline, 
  copyOutline,
  ellipsisVertical, // 🟢 Icono para el menú
  trashOutline      // 🟢 Icono para borrar
} from 'ionicons/icons';
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

  // 🟢 ESTADOS PARA EL MENÚ Y BORRADO
  const [subjectToAction, setSubjectToAction] = useState<Subject | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showAlertDelete, setShowAlertDelete] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/subjects');
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
      const response = await api.get(`/enrollments/subject/${subject.id}`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error cargando estudiantes:', error);
      setStudents([]);
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

  // 🟢 ABRIR MENÚ DE OPCIONES (3 PUNTOS)
  const openSubjectOptions = (e: React.MouseEvent, subject: Subject) => {
    e.stopPropagation(); // Evita entrar a la clase al hacer click en los puntos
    setSubjectToAction(subject);
    setShowActionSheet(true);
  };

  // 🟢 EJECUTAR EL BORRADO
  const handleDeleteSubject = async () => {
    if (!subjectToAction) return;
    setIsLoading(true);
    try {
        await api.delete(`/subjects/${subjectToAction.id}`);
        // Actualizamos la lista local
        setSubjects(prev => prev.filter(s => s.id !== subjectToAction.id));
        setErrorMsg(null); // Limpiar errores
    } catch (error) {
        console.error("Error al eliminar:", error);
        setErrorMsg("Error al eliminar la clase.");
    } finally {
        setIsLoading(false);
        setSubjectToAction(null);
    }
  };

  return (
    <div className="student-list-container">
      <div className="sl-content">
        
        {/* HEADER */}
        <div className="sl-header">
          <IonButton fill="clear" onClick={handleInternalBack} className="sl-back-btn">
             <IonIcon icon={arrowBack} style={{ fontSize: '24px', color: '#334155' }} />
          </IonButton>

          <div className="sl-title-box">
            <h1>{selectedSubject ? selectedSubject.name : 'Mis Clases'}</h1>
            {!selectedSubject && <p className="sl-subtitle">Selecciona una clase para ver sus alumnos</p>}
          </div>
        </div>

        {/* CONTENIDO */}
        {isLoading && !selectedSubject ? (
          <div className="loading-container"><IonSpinner name="crescent" color="primary" /><p>Cargando...</p></div>
        ) : (
          <>
            {/* VISTA 1: GRID DE MATERIAS */}
            {!selectedSubject && (
              <div className="subjects-grid">
                {subjects.length === 0 ? (
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
                        {/* 🟢 BOTÓN DE 3 PUNTOS */}
                        <button className="card-options-btn" onClick={(e) => openSubjectOptions(e, subj)}>
                            <IonIcon icon={ellipsisVertical} />
                        </button>

                        <IonIcon icon={peopleOutline} className="card-main-icon" />
                        <h3 className="subject-name">{subj.name}</h3>
                        <span className="subject-cycle">{subj.cycle}</span>
                    </div>
                    ))
                )}
              </div>
            )}

            {/* VISTA 2: DETALLE DE CLASE */}
            {selectedSubject && (
              <div className="class-detail-view">
                
                {/* 🔵 TARJETA DEL CÓDIGO (Más pequeña) */}
                <div className="code-banner-card">
                   <p className="code-label">CÓDIGO DE CLASE</p>
                   <div className="code-display-container">
                     <span className="code-value">{selectedSubject.joinCode}</span>
                     <IonIcon icon={copyOutline} className="copy-icon" />
                   </div>
                   <p className="code-hint">Comparte este código con tus alumnos.</p>
                </div>

                <h3 className="list-section-title">
                   Estudiantes Inscritos ({students.length})
                </h3>

                <div className="students-list-wrapper">
                  {students.length === 0 && !isLoading ? (
                    <div className="loading-container">
                      <IonIcon icon={personOutline} className="empty-state-icon"/>
                      <p>Aún no hay estudiantes en esta clase.</p>
                    </div>
                  ) : (
                    students.map(student => (
                      <div key={student.id} className="student-item">
                        <div className="student-avatar">
                          {student.avatarUrl ? <img src={student.avatarUrl} alt="avatar" /> : getInitials(student.fullName)}
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
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🟢 MENÚ DESPLEGABLE */}
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header={`Opciones para "${subjectToAction?.name}"`}
        buttons={[
          {
            text: 'Eliminar Clase',
            role: 'destructive',
            icon: trashOutline,
            handler: () => setShowAlertDelete(true)
          },
          { text: 'Cancelar', role: 'cancel' }
        ]}
      />

      {/* 🟢 ALERTA DE CONFIRMACIÓN */}
      <IonAlert
        isOpen={showAlertDelete}
        onDidDismiss={() => setShowAlertDelete(false)}
        header={'¿Eliminar esta clase?'}
        subHeader={'Esta acción no se puede deshacer.'}
        message={'Se eliminarán permanentemente todos los estudiantes inscritos, sus puntajes y los datos asociados a esta materia.'}
        buttons={[
          { text: 'Cancelar', role: 'cancel', cssClass: 'secondary' },
          { 
            text: 'Sí, Eliminar', 
            cssClass: 'alert-danger-button',
            handler: handleDeleteSubject 
          }
        ]}
      />

      <IonToast isOpen={!!errorMsg} message={errorMsg || ''} duration={3000} color="danger" onDidDismiss={() => setErrorMsg(null)} />
    </div>
  );
};

export default StudentListScreen;
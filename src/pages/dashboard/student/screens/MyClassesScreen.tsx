import React, { useState, useEffect } from 'react';
import { 
  IonButton, IonIcon, IonSpinner, IonActionSheet, IonAlert, IonToast
} from '@ionic/react';
import { 
  folderOpenOutline, 
  bookOutline,
  ellipsisVertical,   // 🟢 Icono menú
  trashOutline,       // 🟢 Icono borrar
  closeCircleOutline 
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { api } from '../../../../api/axios'; 
import './MyClassesScreen.css';

const MyClassesScreen: React.FC = () => {
  const history = useHistory();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- ESTADOS PARA SALIR DE CLASE ---
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMyEnrollments();
  }, []);

  const loadMyEnrollments = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/enrollments/my-subjects');
      
      const mappedSubjects = data.map((item: any) => ({
        id: item.subject.id,
        name: item.subject.name,
        cycle: item.subject.cycle,
        teacherName: item.subject.teacher?.fullName || 'Docente',
      }));

      setSubjects(mappedSubjects);
    } catch (error) {
      console.error('Error cargando mis clases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassClick = (subjectId: string) => {
    history.push(`/student/class/${subjectId}`);
  };

  // 🟢 ABRIR MENÚ (Evita entrar a la clase al hacer click)
  const handleOpenOptions = (e: React.MouseEvent, subject: any) => {
    e.stopPropagation(); 
    setSelectedSubject(subject);
    setShowActionSheet(true);
  };

  // 🟢 SALIR DE LA CLASE
  const handleLeaveClass = async () => {
    if (!selectedSubject) return;
    try {
        await api.delete(`/enrollments/leave/${selectedSubject.id}`);
        setToastMsg("Has salido de la clase correctamente.");
        loadMyEnrollments(); // Recargamos la lista
    } catch (error) {
        setToastMsg("Error al salir de la clase.");
    } finally {
        setSelectedSubject(null);
    }
  };

  return (
    <div className="my-classes-inner">
      
      {/* 🟢 TÍTULO CON ESPACIO SEGURO (safe-area-top) */}
      <div className="sl-header-text safe-area-top">
        <h1>Mis Clases</h1>
        <p>Tus materias inscritas</p>
      </div>

      {isLoading ? (
        <div className="loading-container">
            <IonSpinner name="crescent" color="primary" />
            <p>Cargando materias...</p>
        </div>
      ) : (
        <div className="subjects-grid">
          {subjects.length === 0 ? (
              <div className="empty-state-container">
                  <div className="empty-icon-circle">
                    <IonIcon icon={folderOpenOutline} />
                  </div>
                  <h3>¡Está un poco vacío aquí!</h3>
                  <p>Aún no te has unido a ninguna clase.</p>
                  <IonButton 
                      className="mt-4 empty-btn"
                      shape="round"
                      onClick={() => history.push('/home')} 
                  >
                      Ir a Inicio
                  </IonButton>
              </div>
          ) : (
              subjects.map(subj => (
              <div 
                  key={subj.id} 
                  className="subject-folder-card"
                  onClick={() => handleClassClick(subj.id)}
              >
                  {/* 🟢 BOTÓN DE 3 PUNTOS (Esquina superior) */}
                  <button className="card-options-btn" onClick={(e) => handleOpenOptions(e, subj)}>
                    <IonIcon icon={ellipsisVertical} />
                  </button>

                  <div className="folder-icon-wrapper">
                    <IonIcon icon={bookOutline} />
                  </div>
                  
                  <h3 className="subject-name">{subj.name}</h3>
                  <p className="teacher-name-label">{subj.teacherName}</p>
                  <span className="subject-cycle">{subj.cycle}</span>
              </div>
              ))
          )}
        </div>
      )}
      
      {/* Espaciador final */}
      <div style={{ height: '100px' }}></div>

      {/* 🟢 MENÚ DESPLEGABLE */}
      <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        header={`Opciones: ${selectedSubject?.name}`}
        buttons={[
          {
            text: 'Salir de la clase',
            role: 'destructive',
            icon: trashOutline,
            handler: () => setShowConfirmAlert(true)
          },
          {
            text: 'Cancelar',
            icon: closeCircleOutline,
            role: 'cancel'
          }
        ]}
      />

      {/* 🟢 ALERTA CONFIRMACIÓN */}
      <IonAlert
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header={'¿Salir de la clase?'}
        message={`¿Estás seguro que deseas salir de "${selectedSubject?.name}"? Perderás tu progreso y puntos.`}
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Sí, Salir', handler: handleLeaveClass, cssClass: 'alert-danger-text' }
        ]}
      />

      <IonToast isOpen={!!toastMsg} message={toastMsg || ''} duration={2000} onDidDismiss={() => setToastMsg(null)} />
    </div>
  );
};

export default MyClassesScreen;
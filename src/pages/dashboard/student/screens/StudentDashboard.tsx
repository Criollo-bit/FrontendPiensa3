import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonIcon, 
  IonButton,
  IonAlert,
  IonLoading,
  IonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { 
  giftOutline, 
  enterOutline, 
  logOutOutline,
  star,
  flashOutline,
  trophyOutline
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 

// --- IMPORTACIONES ---
import StudentWaitingScreen from './StudentWaitingScreen';
import StudentProfileScreen from './StudentProfileScreen'; 
import StudentBottomNav from './components/StudentBottomNav';
import JoinClassModal from './components/JoinClassModal'; // <--- NUEVO MODAL

import './StudentDashboard.css';

// ... (El componente ProfessorCard se queda igual, no lo pego para ahorrar espacio) ...
const ProfessorCard: React.FC<{ teacher: any; onClick: () => void; }> = ({ teacher, onClick }) => {
  // ... (mismo código de ProfessorCard que ya tenías) ...
  const cardRef = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => { /* ... */ };
  const handleMouseLeave = () => { /* ... */ };
  return (
    <div className="professor-card-container" onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={cardRef} className="tilt-card">
        <div className="tilt-card-inner">
          <img src={teacher.imageUrl || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} alt={teacher.name} className="tilt-card-bg" />
          <div className="card-badge"><IonIcon icon={star} /><span>{teacher.points || 0} pts</span></div>
          <div className="card-text-overlay tilt-card-content"><h3 className="card-title">{teacher.name}</h3><p className="card-subtitle">{teacher.subject}</p></div>
          <div className="tilt-card-shine"></div>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD PRINCIPAL ---

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // MODALES Y ALERTAS
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); // <--- Nuevo estado para el modal
  const [successAlertData, setSuccessAlertData] = useState<{show: boolean, className: string, teacherName: string} | null>(null);
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, msg: string, color: string}>({
    isOpen: false, msg: '', color: 'success'
  });

  // Data temporal para redirigir después de la alerta
  const [newClassData, setNewClassData] = useState<{id: number, name: string} | null>(null);

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/enrollment/student');
      
      const mappedClasses = data.map((enrollment: any) => ({
        id: enrollment.subject.id,
        name: enrollment.subject.teacher?.fullName || "Profesor", 
        subject: enrollment.subject.name,
        imageUrl: enrollment.subject.teacher?.avatarUrl || null,
        points: enrollment.accumulatedPoints || 0
      }));

      setTeachers(mappedClasses);
    } catch (error) {
      console.error("Error cargando clases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    fetchEnrollments();
  });

  // --- LÓGICA DE UNIRSE A CLASE ---
  const handleJoinClass = async (code: string) => {
    try {
      setLoading(true);
      // Hacemos la petición al backend
      const response = await api.post('/enrollment/join', { code });
      const enrollment = response.data; // Asumimos que el backend devuelve el objeto Enrollment creado

      // Cerramos el modal de input
      setIsJoinModalOpen(false);

      // Preparamos los datos para la redirección
      // NOTA: Ajusta esto según tu respuesta del backend. 
      // Supongamos que devuelve { id: ..., subject: { id: 1, name: 'Mate', teacher: { fullName: 'Juan' } } }
      const subjectInfo = enrollment.subject; 
      
      setNewClassData({
        id: subjectInfo.id,
        name: subjectInfo.name
      });

      // Recargamos la lista de fondo
      await fetchEnrollments();

      // Mostramos la ALERTA DE ÉXITO
      setSuccessAlertData({
        show: true,
        className: subjectInfo.name,
        teacherName: subjectInfo.teacher?.fullName || 'el Profesor'
      });

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Código inválido o error de conexión.';
      setToastConfig({ isOpen: true, msg: errorMsg, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // Callback al cerrar la alerta de éxito
  const handleSuccessAlertDismiss = () => {
    setSuccessAlertData(null);
    // REDIRECCIÓN AUTOMÁTICA
    if (newClassData) {
      setSelectedSubjectId(newClassData.id);
      setSelectedSubjectName(newClassData.name);
      setCurrentScreen('WAITING');
      setNewClassData(null); // Limpiar
    }
  };

  const handleGameStart = (config: any) => {
    console.log("🚀 Ir a juego:", config);
  };

  // --- RENDERIZADO CONDICIONAL: PANTALLA DE ESPERA ---
  if (currentScreen === 'WAITING' && selectedSubjectId) {
    return (
      <StudentWaitingScreen 
        user={user}
        subjectId={selectedSubjectId}
        subjectName={selectedSubjectName}
        onGameStart={handleGameStart}
        onBack={() => {
            fetchEnrollments();
            setCurrentScreen('HOME');
        }}
      />
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <IonPage>
      <IonContent>
        
        {/* VISTA HOME */}
        {currentScreen === 'HOME' && (
          <div className="student-dashboard" style={{ paddingBottom: '100px' }}>
            <div className="welcome-header">
              <div className="welcome-text">
                <h1>Hola, {user.name.split(' ')[0]}</h1>
                <p>Vamos a ganar puntos hoy.</p>
              </div>
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=0ea5e9&color=fff`} 
                alt="Profile" 
                className="avatar-small"
                onClick={() => setCurrentScreen('PROFILE')} 
              />
            </div>

            <div className="actions-grid">
              {/* Botón Abre el Nuevo Modal */}
              <button className="action-card btn-join" onClick={() => setIsJoinModalOpen(true)}>
                <IonIcon icon={enterOutline} />
                <h3>Unirse a Clase</h3>
              </button>
              <button className="action-card btn-rewards" onClick={() => setCurrentScreen('REWARDS')}>
                <IonIcon icon={giftOutline} />
                <h3>Tienda</h3>
              </button>
            </div>

            <h2 className="section-title">Mis Clases</h2>
            
            {loading && !successAlertData && teachers.length === 0 ? (
               <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Cargando...</div>
            ) : (
              <div className="professors-grid">
                {teachers.length > 0 ? (
                  teachers.map((teacher) => (
                    <ProfessorCard 
                      key={teacher.id} 
                      teacher={teacher} 
                      onClick={() => {
                        setSelectedSubjectId(teacher.id);
                        setSelectedSubjectName(teacher.subject);
                        setCurrentScreen('WAITING');
                      }}
                    />
                  ))
                ) : (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '30px', color: '#64748b' }}>
                     <p>No tienes clases aún.</p>
                     <small>Usa el botón "Unirse a Clase".</small>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA BATALLA */}
        {currentScreen === 'BATTLE' && (
          <div style={{ padding: '40px 20px', textAlign: 'center', marginTop: '50px' }}>
             <IonIcon icon={flashOutline} style={{ fontSize: '80px', color: '#eab308' }} />
             <h2 style={{ marginTop: '20px', fontWeight: '800' }}>Zona de Batalla</h2>
             <p style={{ color: '#64748b' }}>Pronto disponible.</p>
             <IonButton fill="outline" onClick={() => setCurrentScreen('HOME')} style={{ marginTop: '20px' }}>Volver</IonButton>
          </div>
        )}

        {/* VISTA PREMIOS */}
        {currentScreen === 'REWARDS' && (
          <div style={{ padding: '40px 20px', textAlign: 'center', marginTop: '50px' }}>
             <IonIcon icon={trophyOutline} style={{ fontSize: '80px', color: '#8b5cf6' }} />
             <h2 style={{ marginTop: '20px', fontWeight: '800' }}>Logros</h2>
             <p style={{ color: '#64748b' }}>Pronto disponible.</p>
          </div>
        )}

        {/* VISTA PERFIL */}
        {currentScreen === 'PROFILE' && (
           <StudentProfileScreen user={user} onLogout={onLogout} />
        )}

        {/* --- MODAL PARA INGRESAR CÓDIGO (VISUAL MEJORADO) --- */}
        <JoinClassModal 
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={handleJoinClass}
          isLoading={loading}
        />

        {/* --- ALERTA DE ÉXITO --- */}
        <IonAlert
          isOpen={!!successAlertData}
          onDidDismiss={handleSuccessAlertDismiss}
          header="¡Éxito!"
          subHeader="Te has unido a la clase"
          message={`Bienvenido a <strong>${successAlertData?.className}</strong> con ${successAlertData?.teacherName}.`}
          buttons={['¡Vamos!']}
          cssClass="success-alert" // Puedes añadir estilos extra si quieres
        />

        {/* --- TOAST DE ERROR --- */}
        <IonToast
          isOpen={toastConfig.isOpen}
          onDidDismiss={() => setToastConfig({ ...toastConfig, isOpen: false })}
          message={toastConfig.msg}
          duration={3000}
          color={toastConfig.color}
          position="top"
        />

      </IonContent>
 
      <StudentBottomNav 
         activeScreen={currentScreen} 
         setActiveScreen={setCurrentScreen} 
      />

    </IonPage>
  );
};

export default StudentDashboard;
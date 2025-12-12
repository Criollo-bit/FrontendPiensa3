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
  star
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 

// --- IMPORTACIONES DE PANTALLAS ---
import StudentWaitingScreen from './StudentWaitingScreen';
import StudentProfileScreen from './StudentProfileScreen'; // <--- NUEVO: Importamos el perfil
import StudentBottomNav from './components/StudentBottomNav'; 

import './StudentDashboard.css';

// --- COMPONENTE INTERNO: ProfessorCard (Visual 3D) ---
const ProfessorCard: React.FC<{
  teacher: any;
  onClick: () => void;
}> = ({ teacher, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = rect;

    const rotateX = (y / height - 0.5) * -20; 
    const rotateY = (x / width - 0.5) * 20;
    const shineX = (x / width) * 100;
    const shineY = (y / height) * 100;

    cardRef.current.style.setProperty('--rx', `${rotateY.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--ry', `${rotateX.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--shine-x', `${shineX.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-y', `${shineY.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-opacity', '1');
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
    cardRef.current.style.setProperty('--shine-opacity', '0');
  };

  return (
    <div 
      className="professor-card-container" 
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={cardRef} className="tilt-card">
        <div className="tilt-card-inner">
          <img 
            src={teacher.imageUrl || `https://ui-avatars.com/api/?name=${teacher.name}&background=random`} 
            alt={teacher.name} 
            className="tilt-card-bg"
          />
          <div className="card-badge">
            <IonIcon icon={star} />
            <span>{teacher.points || 0} pts</span>
          </div>
          <div className="card-text-overlay tilt-card-content">
             <h3 className="card-title">{teacher.name}</h3>
             <p className="card-subtitle">{teacher.subject}</p>
          </div>
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
  // Estado de Pantalla (HOME, WAITING, PROFILE, REWARDS)
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('');
  
  // Estados de Datos
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, msg: string, color: string}>({
    isOpen: false, msg: '', color: 'success'
  });

  // 1. CARGAR DATOS REALES
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

  // 2. UNIRSE A CLASE
  const handleJoinClass = async (code: string) => {
    if (!code.trim()) return;
    try {
      setLoading(true);
      await api.post('/enrollment/join', { code });
      setToastConfig({ isOpen: true, msg: '¡Unido a la clase!', color: 'success' });
      await fetchEnrollments();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Código inválido.';
      setToastConfig({ isOpen: true, msg: errorMsg, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  // 3. INICIO JUEGO
  const handleGameStart = (config: any) => {
    console.log("🚀 Ir a juego:", config);
    // Aquí cambiarías a setCurrentScreen('PLAYING')
  };

  // --- RENDERIZADO CONDICIONAL: PANTALLA DE ESPERA ---
  // (Esta pantalla oculta la navbar, por eso está en un return separado)
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

  // --- RENDERIZADO PRINCIPAL CON NAVBAR ---
  return (
    <IonPage>
      <IonContent>
        {/* Renderizado condicional del contenido DENTRO del IonContent */}
        
        {/* --- VISTA: INICIO (HOME) --- */}
        {currentScreen === 'HOME' && (
          <div className="student-dashboard" style={{ paddingBottom: '100px' }}>
            
            {/* HEADER */}
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

            {/* ACCIONES PRINCIPALES */}
            <div className="actions-grid">
              <button className="action-card btn-join" onClick={() => setShowJoinAlert(true)}>
                <IonIcon icon={enterOutline} />
                <h3>Unirse a Clase</h3>
              </button>
              <button className="action-card btn-rewards" onClick={() => setCurrentScreen('REWARDS')}>
                <IonIcon icon={giftOutline} />
                <h3>Canjear Puntos</h3>
              </button>
            </div>

            {/* LISTA DE DOCENTES (GRID) */}
            <h2 className="section-title">Mis Clases</h2>
            
            {loading && teachers.length === 0 ? (
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

            {/* Logout Rápido */}
            <div className="ion-text-center pb-4 pt-4">
              <IonButton fill="clear" color="medium" onClick={onLogout}>
                <IonIcon slot="start" icon={logOutOutline} />
                Cerrar Sesión
              </IonButton>
            </div>
          </div>
        )}

        {/* --- VISTA: PERFIL (PROFILE) --- */}
        {currentScreen === 'PROFILE' && (
           <StudentProfileScreen 
              user={user} 
              onLogout={onLogout} 
           />
        )}

        {/* --- VISTA: PREMIOS (REWARDS) - Placeholder --- */}
        {currentScreen === 'REWARDS' && (
          <div style={{ padding: '20px', paddingTop: '50px', textAlign: 'center' }}>
             <h2>Tienda de Premios</h2>
             <p>Próximamente...</p>
             <IonButton onClick={() => setCurrentScreen('HOME')}>Volver</IonButton>
          </div>
        )}

        {/* --- COMPONENTES GLOBALES --- */}
        <IonAlert
          isOpen={showJoinAlert}
          onDidDismiss={() => setShowJoinAlert(false)}
          header="Código de Acceso"
          inputs={[{ name: 'code', type: 'text', placeholder: 'Ej: A4F1' }]}
          buttons={[
            { text: 'Cancelar', role: 'cancel' },
            { text: 'Entrar', handler: (d) => handleJoinClass(d.code) }
          ]}
        />

        <IonLoading isOpen={loading} message="Procesando..." />

        <IonToast
          isOpen={toastConfig.isOpen}
          onDidDismiss={() => setToastConfig({ ...toastConfig, isOpen: false })}
          message={toastConfig.msg}
          duration={3000}
          color={toastConfig.color}
          position="top"
        />

      </IonContent>

      {/* --- NAVBAR FLOTANTE --- */}
      <StudentBottomNav 
         activeScreen={currentScreen} 
         setActiveScreen={setCurrentScreen} 
      />

    </IonPage>
  );
};

export default StudentDashboard;
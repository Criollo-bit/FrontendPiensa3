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
  flashOutline, 
  schoolOutline
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 

// --- IMPORTACIONES ---
import StudentWaitingScreen from './StudentWaitingScreen';
import StudentProfileScreen from './StudentProfileScreen'; 
import AchievementsScreen from './AchievementsScreen'; 
import StudentBottomNav from './components/StudentBottomNav';
import JoinClassModal from './components/JoinClassModal'; 

// 👇 CORRECCIÓN DE RUTAS: Apuntamos a la carpeta shared
import ProfessorCard from './ProfessorCard'; 
import ProfessorCardDetailModal from './ProfessorCardDetailModal';

import './StudentDashboard.css';

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
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); 
  const [successAlertData, setSuccessAlertData] = useState<{show: boolean, className: string, teacherName: string} | null>(null);
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, msg: string, color: string}>({
    isOpen: false, msg: '', color: 'success'
  }); 
  const [newClassData, setNewClassData] = useState<{id: number, name: string} | null>(null);

  // ESTADO PARA EL MODAL DE DETALLE/CANJE
  const [selectedCardForRedemption, setSelectedCardForRedemption] = useState<any>(null);

  // --- ESTADOS PARA EL CARRUSEL 3D ---
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    startX: number;
    currentX: number;
  }>({
    isDragging: false,
    startX: 0,
    currentX: 0,
  });

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/enrollment/student');
      
      const mappedClasses = data.map((enrollment: any) => ({
        id: enrollment.subject.teacher?.id || 'unknown',
        cardId: enrollment.subject.id,
        name: enrollment.subject.teacher?.fullName || "Profesor", 
        subject: enrollment.subject.name,
        title: enrollment.subject.name,
        imageUrl: enrollment.subject.teacher?.avatarUrl || null,
        points: enrollment.accumulatedPoints || 0,
        locked: false,
        unlockPoints: 0
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

  // --- LÓGICA DE ARRASTRE (DRAG) ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragState({ isDragging: true, startX: clientX, currentX: 0 });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragState(prev => ({ ...prev, currentX: clientX - prev.startX }));
  };

  const handleDragEnd = () => {
    if (!dragState.isDragging) return;
    const threshold = 50; 
    
    if (Math.abs(dragState.currentX) > threshold) {
      if (dragState.currentX > 0 && activeCardIndex > 0) {
        setActiveCardIndex(prev => prev - 1);
      } else if (dragState.currentX < 0 && activeCardIndex < teachers.length - 1) {
        setActiveCardIndex(prev => prev + 1);
      }
    }

    setDragState({ isDragging: false, startX: 0, currentX: 0 });
  };

  // --- CÁLCULO DE ESTILO 3D ---
  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeCardIndex;
    const isActive = index === activeCardIndex;
    
    if (Math.abs(offset) > 2) return { display: 'none' };

    let baseTranslateX = offset * 55;
    let baseScale = isActive ? 1 : 0.85;
    let baseRotate = offset * -5;
    let opacity = isActive ? 1 : 0.6;
    let zIndex = 100 - Math.abs(offset);

    if (dragState.isDragging) {
       if (isActive) {
          return {
             transform: `translateX(calc(${baseTranslateX}% + ${dragState.currentX}px)) scale(${baseScale}) rotate(${dragState.currentX * 0.05}deg)`,
             zIndex, opacity, cursor: 'grabbing', transition: 'none',
             position: 'absolute', width: '100%', height: '100%', top: 0, left: 0
          };
       }
    }

    return {
      transform: `translateX(${baseTranslateX}%) scale(${baseScale}) rotate(${baseRotate}deg)`,
      zIndex,
      opacity,
      cursor: isActive ? 'pointer' : 'default',
      transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.4s ease',
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0
    };
  };

  // --- MANEJO DEL CLICK EN CARTA ---
  const handleCardClick = (index: number) => {
     if (Math.abs(dragState.currentX) > 10) return; 

     if (index === activeCardIndex) {
        const prof = teachers[index];
        setSelectedCardForRedemption({
           teacherId: prof.id,
           professorName: prof.name,
           currentPoints: prof.points,
           imageUrl: prof.imageUrl
        });
     } else {
        setActiveCardIndex(index);
     }
  };

  const handleJoinClass = async (code: string) => {
    try {
      setLoading(true); 
      
      // 👇 CORRECCIÓN CRÍTICA AQUÍ 👇
      // Cambiamos { code } por { joinCode: code }
      const response = await api.post('/enrollment/join', { joinCode: code });
      
      const enrollment = response.data; 
      setIsJoinModalOpen(false); 
      const subjectInfo = enrollment.subject; 
      setNewClassData({ id: subjectInfo.id, name: subjectInfo.name });
      await fetchEnrollments();
      setSuccessAlertData({ 
        show: true, 
        className: subjectInfo.name, 
        teacherName: subjectInfo.teacher?.fullName || 'el Profesor' 
      }); 
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Código inválido.';
      setToastConfig({ isOpen: true, msg: errorMsg, color: 'danger' });
    } finally {
      setLoading(false);
    }
  };
 
  const handleSuccessAlertDismiss = () => {
    setSuccessAlertData(null);
    if (newClassData) { 
      setSelectedSubjectId(newClassData.id);
      setSelectedSubjectName(newClassData.name);
      setCurrentScreen('WAITING');
      setNewClassData(null); 
    }
  }; 
 
  if (currentScreen === 'WAITING' && selectedSubjectId) {
    return (
      <StudentWaitingScreen 
        user={user}
        subjectId={selectedSubjectId}
        subjectName={selectedSubjectName}
        onGameStart={(c) => console.log(c)}
        onBack={() => { fetchEnrollments(); setCurrentScreen('HOME'); }}
      />
    );
  }

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <IonPage>
      <IonContent className="dashboard-content">
          
        {currentScreen === 'HOME' && (
          <div className="student-dashboard" style={{ paddingBottom: '100px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            
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
              <button className="action-card btn-join" onClick={() => setIsJoinModalOpen(true)}>
                <IonIcon icon={enterOutline} />
                <h3>Unirse a Clase</h3>
              </button>
              <button className="action-card btn-rewards" onClick={() => setCurrentScreen('ACHIEVEMENTS')}>
                <IonIcon icon={giftOutline} />
                <h3>Logros</h3>
              </button>
            </div>

            <h2 className="section-title">Mis Clases</h2>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '400px' }}>
              {loading && teachers.length === 0 ? (
                 <div style={{ textAlign: 'center', color: '#999' }}>
                    <IonLoading isOpen={true} message="Cargando cartas..." duration={1000}/>
                 </div>
              ) : teachers.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <IonIcon icon={schoolOutline} style={{fontSize: '4rem', opacity: 0.5}} />
                    <p>No tienes clases aún.</p>
                    <small>Usa el botón "Unirse a Clase".</small>
                 </div>
              ) : (
                <>
                  {/* CONTENEDOR 3D */}
                  <div 
                    ref={cardContainerRef}
                    style={{ 
                       perspective: '1200px', 
                       height: '420px', 
                       width: '100%', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       position: 'relative',
                       overflow: 'hidden',
                       touchAction: 'pan-y'
                    }}
                    onMouseDown={handleDragStart}
                    onMouseMove={handleDragMove}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchMove={handleDragMove}
                    onTouchEnd={handleDragEnd}
                  >
                    <div style={{ position: 'relative', width: '280px', height: '380px', transformStyle: 'preserve-3d' }}>
                      {teachers.map((teacher, index) => (
                        <div key={index} style={getCardStyle(index)} onClick={() => handleCardClick(index)}>
                          <ProfessorCard 
                             professor={teacher} 
                             isActive={index === activeCardIndex}
                             points={teacher.points}
                             requiredPoints={teacher.unlockPoints || 100}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* INDICADORES (PUNTITOS) */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                    {teachers.map((_, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: index === activeCardIndex ? '20px' : '8px', 
                          height: '8px', 
                          borderRadius: '4px', 
                          background: index === activeCardIndex ? '#0ea5e9' : '#cbd5e1',
                          transition: 'all 0.3s'
                        }} 
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        )}

        {/* OTRAS PANTALLAS */}
        {currentScreen === 'BATTLE' && (
           <div style={{ padding: '40px', textAlign: 'center' }}>
             <IonIcon icon={flashOutline} style={{ fontSize: '80px', color: '#eab308' }} />
             <h2>Batalla</h2>
             <IonButton fill="outline" onClick={() => setCurrentScreen('HOME')}>Volver</IonButton>
           </div>
        )}

        {(currentScreen === 'REWARDS' || currentScreen === 'ACHIEVEMENTS') && (
           <AchievementsScreen user={user} onBack={() => setCurrentScreen('HOME')} />
        )}
 
        {currentScreen === 'PROFILE' && (
           <StudentProfileScreen user={user} onLogout={onLogout} />
        )}

        {/* MODAL UNIRSE A CLASE */}
        <JoinClassModal 
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onJoin={handleJoinClass}
          isLoading={loading}
        />

        {/* MODAL DETALLE DE CARTA / CANJE */}
        {selectedCardForRedemption && (
           <ProfessorCardDetailModal 
              teacherId={selectedCardForRedemption.teacherId}
              professorName={selectedCardForRedemption.professorName}
              currentPoints={selectedCardForRedemption.currentPoints}
              professorImageUrl={selectedCardForRedemption.imageUrl}
              onClose={() => setSelectedCardForRedemption(null)}
              onRedeem={() => {
                 fetchEnrollments(); 
              }}
           />
        )}

        <IonAlert 
          isOpen={!!successAlertData}
          onDidDismiss={handleSuccessAlertDismiss}
          header="¡Éxito!"
          message={`Bienvenido a <strong>${successAlertData?.className}</strong>.`}
          buttons={['¡Vamos!']}
        /> 
        <IonToast
          isOpen={toastConfig.isOpen}
          onDidDismiss={() => setToastConfig({ ...toastConfig, isOpen: false })}
          message={toastConfig.msg} 
          color={toastConfig.color}
          duration={2000}
        /> 
      </IonContent>
 
      <StudentBottomNav activeScreen={currentScreen} setActiveScreen={setCurrentScreen} />
    </IonPage>
  );
};

export default StudentDashboard;
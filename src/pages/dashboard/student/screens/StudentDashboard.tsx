import React, { useState, useCallback } from 'react';
import { 
  IonContent, IonPage, IonIcon, IonLoading, IonAlert, IonToast, useIonViewWillEnter,
  IonRefresher, IonRefresherContent, IonModal, IonList, IonItem, IonLabel, IonButton
} from '@ionic/react';
import { enterOutline, bookOutline, notificationsOutline, checkmarkCircleOutline, closeOutline, trashOutline } from 'ionicons/icons'; 
import { useHistory } from 'react-router-dom'; 
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 

// --- IMPORTACIONES DE COMPONENTES ---
import StudentProfileScreen from './StudentProfileScreen'; 
import AchievementsScreen from './AchievementsScreen'; 
import StudentBottomNav from './components/StudentBottomNav';
import JoinClassModal from './components/JoinClassModal'; 
import JoinBattleScreen from '../../student/screens/JoinBattleScreen'; 
import JoinAllForAllScreen from './components/JoinAllForAllScreen'; 
import ProfessorCard from './ProfessorCard'; 
import MyClassesScreen from './MyClassesScreen'; 

import './StudentDashboard.css';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const history = useHistory(); 
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');
  const [userProfile, setUserProfile] = useState<User>(user);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 🔥 ESTADOS PARA NOTIFICACIONES
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifModal, setShowNotifModal] = useState(false);

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); 
  const [joinedClassData, setJoinedClassData] = useState<{id: string, name: string} | null>(null);
  
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, msg: string, color: string}>({
    isOpen: false, msg: '', color: 'success'
  }); 
  
  const fetchEnrollments = useCallback(async () => {
    try {
      const { data } = await api.get('/enrollments/my-subjects'); 
      const mappedClasses = data.map((enrollment: any) => ({
        id: enrollment.subject.teacherId || 'unknown',
        cardId: enrollment.subject.id, 
        name: enrollment.subject.teacher?.fullName || "Docente", 
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
    }
  }, []);

  const refreshUserProfile = async () => {
    try {
        const { data } = await api.get('/users/me');
        setUserProfile(prev => ({ ...prev, ...data }));
    } catch (error) {
        console.error("Error actualizando perfil:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/rewards/student/my-requests');
      const processed = data.filter((r: any) => r.status !== 'PENDING');
      setNotifications(processed);
    } catch (e) {
      console.error("Error al cargar notificaciones");
    }
  };

  const handleRefresh = async (event: any) => {
    await Promise.all([fetchEnrollments(), refreshUserProfile(), fetchNotifications()]);
    event.detail.complete(); 
  };

  useIonViewWillEnter(() => {
    setLoading(true); 
    Promise.all([fetchEnrollments(), refreshUserProfile(), fetchNotifications()])
      .finally(() => setLoading(false));
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, currentX: 0 });
  const handleDragStart = (e: any) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragState({ isDragging: true, startX: clientX, currentX: 0 });
  };
  const handleDragMove = (e: any) => {
    if (!dragState.isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragState(prev => ({ ...prev, currentX: clientX - prev.startX }));
  };
  const handleDragEnd = () => {
    if (!dragState.isDragging) return;
    if (Math.abs(dragState.currentX) > 50) {
      if (dragState.currentX > 0 && activeCardIndex > 0) setActiveCardIndex(prev => prev - 1);
      else if (dragState.currentX < 0 && activeCardIndex < teachers.length - 1) setActiveCardIndex(prev => prev + 1);
    }
    setDragState({ isDragging: false, startX: 0, currentX: 0 });
  };
  
  const getCardStyle = (index: number): React.CSSProperties => {
    const offset = index - activeCardIndex;
    const isActive = index === activeCardIndex;
    if (Math.abs(offset) > 2) return { display: 'none' };
    let baseTranslateX = offset * 55;
    return {
      transform: `translateX(${baseTranslateX}%) scale(${isActive ? 1 : 0.85}) rotate(${offset * -5}deg)`,
      zIndex: 100 - Math.abs(offset),
      opacity: isActive ? 1 : 0.6,
      position: 'absolute', width: '100%', height: '100%', top: 0, left: 0,
      transition: dragState.isDragging ? 'none' : 'transform 0.4s ease, opacity 0.4s ease'
    };
  };

  const handleJoinClass = async (code: string) => {
    try {
      setLoading(true); 
      const response = await api.post('/enrollments/join', { joinCode: code });
      setIsJoinModalOpen(false);
      setJoinedClassData({ id: response.data.subject.id, name: response.data.subject.name });
      fetchEnrollments(); 
    } catch (error: any) {
      setToastConfig({ isOpen: true, msg: 'Código inválido o ya inscrito.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const navigateToClassDetail = (subjectId: string) => {
      history.push(`/student/class/${subjectId}`);
  };

  return (
    <IonPage>
      <IonContent className="dashboard-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingText="Desliza para actualizar" refreshingSpinner="crescent" />
        </IonRefresher>

        <IonLoading isOpen={loading} message="Cargando..." />
        
        {/* 🔥 AGREGADA CLASE DE ANIMACIÓN AQUÍ */}
        <div className="app-fade-in">
          {currentScreen === 'HOME' && (
            <div className="student-dashboard">
              <div className="welcome-header">
                <div className="header-left">
                  <img 
                    src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name}`} 
                    className="avatar-small"
                    alt="Profile"
                    onClick={() => setCurrentScreen('PROFILE')} 
                  />
                  <div className="welcome-text">
                    <h1>Hola, {userProfile.name.split(' ')[0]}</h1>
                    <div className="id-badge">ID: <span className="id-value">{userProfile.studentCode || '...'}</span></div>
                  </div>
                </div>
                
                <div className="header-actions">
                  <button className="notif-btn" onClick={() => setShowNotifModal(true)}>
                    <IonIcon icon={notificationsOutline} />
                    {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
                  </button>
                </div>
              </div>

              <div className="actions-grid"> 
                <button className="action-card btn-join" onClick={() => setIsJoinModalOpen(true)}>
                  <IonIcon icon={enterOutline} className="action-icon-large" />
                  <h3>Unirse</h3>
                </button>
                <button className="action-card btn-classes" onClick={() => setCurrentScreen('MY_CLASSES')}>
                  <IonIcon icon={bookOutline} className="action-icon-large" />
                  <h3>Mis Clases</h3>
                </button>
              </div>

              <h2 className="section-title">Clases Recientes</h2>
              {teachers.length === 0 && !loading ? (
                  <div className="empty-classes-state"><p>No estás inscrito en ninguna clase aún.</p></div>
              ) : (
                  <div className="carousel-container" onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>
                     <div style={{ position: 'relative', width: '240px', height: '320px', margin: '0 auto' }}>
                        {teachers.map((teacher, index) => (
                          <div key={index} style={getCardStyle(index)} onClick={() => index === activeCardIndex && navigateToClassDetail(teacher.cardId)}>
                            <ProfessorCard professor={teacher} isActive={index === activeCardIndex} points={teacher.points} requiredPoints={100} />
                          </div>
                        ))}
                     </div>
                  </div>
              )}
            </div>
          )}

          {/* --- PANTALLAS SECUNDARIAS CON ANIMACIÓN --- */}
          {currentScreen === 'BATTLE' && <JoinBattleScreen onBack={() => setCurrentScreen('HOME')} studentId={userProfile.id} studentName={userProfile.name} />}
          {currentScreen === 'ALLFORALL' && <JoinAllForAllScreen onBack={() => setCurrentScreen('HOME')} studentId={userProfile.id} studentName={userProfile.name} />}
          {currentScreen === 'MY_CLASSES' && <MyClassesScreen />} 
          {currentScreen === 'REWARDS' && <AchievementsScreen user={userProfile} onBack={() => setCurrentScreen('HOME')} />}
          {currentScreen === 'PROFILE' && <StudentProfileScreen user={userProfile} onLogout={onLogout} />}
        </div>

        {/* --- MODALES --- */}
        <IonModal isOpen={showNotifModal} onDidDismiss={() => setShowNotifModal(false)} className="notif-modal">
          <div className="modal-notif-container">
            <div className="modal-notif-header">
              <h2>Notificaciones</h2>
              <button onClick={() => setShowNotifModal(false)} className="close-notif-btn"><IonIcon icon={closeOutline}/></button>
            </div>
            
            <div className="modal-notif-body">
              {notifications.length === 0 ? (
                <div className="empty-notif"><p>No tienes avisos nuevos.</p></div>
              ) : (
                <IonList lines="none">
                  {notifications.map((notif) => (
                    <IonItem key={notif.id} className="notif-item">
                      <div slot="start" className={`notif-status-icon ${notif.status.toLowerCase()}`}>
                        <IonIcon icon={notif.status === 'APPROVED' ? checkmarkCircleOutline : closeOutline} />
                      </div>
                      <IonLabel>
                        <h3>{notif.status === 'APPROVED' ? '¡Premio Aceptado!' : 'Canje Rechazado'}</h3>
                        <p>El docente ha {notif.status === 'APPROVED' ? 'aceptado' : 'rechazado'} tu recompensa: <strong>{notif.reward.name}</strong> en {notif.reward.subject.name}.</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="modal-notif-footer">
                <IonButton fill="clear" color="medium" onClick={() => setNotifications([])}>
                  <IonIcon slot="start" icon={trashOutline} /> Limpiar todo
                </IonButton>
              </div>
            )}
          </div>
        </IonModal>

        <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinClass} isLoading={loading} />
        <IonAlert isOpen={!!joinedClassData} onDidDismiss={() => { if (joinedClassData) { navigateToClassDetail(joinedClassData.id); setJoinedClassData(null); } }} header="¡Felicidades!" message={`Te has unido correctamente a la clase: ${joinedClassData?.name}`} buttons={['Ir a la clase']} /> 
        <IonToast isOpen={toastConfig.isOpen} onDidDismiss={() => setToastConfig({ ...toastConfig, isOpen: false })} message={toastConfig.msg} color={toastConfig.color} duration={2000} /> 
      </IonContent>
      <StudentBottomNav activeScreen={currentScreen} setActiveScreen={setCurrentScreen} />
    </IonPage>
  );
};

export default StudentDashboard;
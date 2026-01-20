import React, { useState, useCallback } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonIcon, 
  IonLoading,
  IonAlert,
  IonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { 
  giftOutline, 
  enterOutline,
  personCircleOutline // Añadido para evitar errores
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 

// --- IMPORTACIONES DE PANTALLAS ---
import StudentProfileScreen from './StudentProfileScreen'; 
import AchievementsScreen from './AchievementsScreen'; 
import StudentBottomNav from './components/StudentBottomNav';
import JoinClassModal from './components/JoinClassModal'; 

// Pantallas de Juego
import JoinBattleScreen from '../../student/screens/JoinBattleScreen'; 
import JoinAllForAllScreen from './components/JoinAllForAllScreen'; 

// Importaciones Shared/Components
import ProfessorCard from './ProfessorCard'; 
import ProfessorCardDetailModal from './ProfessorCardDetailModal';

import './StudentDashboard.css';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [currentScreen, setCurrentScreen] = useState<string>('HOME');
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); 
  const [successAlertData, setSuccessAlertData] = useState<{show: boolean, className: string, teacherName: string} | null>(null);
  const [toastConfig, setToastConfig] = useState<{isOpen: boolean, msg: string, color: string}>({
    isOpen: false, msg: '', color: 'success'
  }); 
  const [selectedCardForRedemption, setSelectedCardForRedemption] = useState<any>(null);

  // --- LÓGICA DE CARRUSEL ---
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, currentX: 0 });

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/enrollments/my-subjects'); 
      
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
      const response = await api.post('/enrollment/join', { joinCode: code });
      setIsJoinModalOpen(false); 
      setSuccessAlertData({ 
        show: true, 
        className: response.data.subject.name, 
        teacherName: response.data.subject.teacher?.fullName || 'el Profesor' 
      }); 
      fetchEnrollments();
    } catch (error: any) {
      setToastConfig({ isOpen: true, msg: 'Código inválido.', color: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="dashboard-content">
        <IonLoading isOpen={loading} message="Cargando..." />
        
        {currentScreen === 'HOME' && (
          <div className="student-dashboard">
            <div className="welcome-header">
              <div className="welcome-text">
                <h1>Hola, {user.name.split(' ')[0]}</h1>
                <p>Vamos a ganar puntos hoy.</p>
              </div>
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                className="avatar-small"
                alt="Profile"
                onClick={() => setCurrentScreen('PROFILE')} 
              />
            </div>

            <div className="actions-grid"> 
              <button className="action-card btn-join" onClick={() => setIsJoinModalOpen(true)}>
                <IonIcon icon={enterOutline} />
                <h3>Unirse</h3>
              </button>
              <button className="action-card btn-rewards" onClick={() => setCurrentScreen('ACHIEVEMENTS')}>
                <IonIcon icon={giftOutline} />
                <h3>Logros</h3>
              </button>
            </div>

            <h2 className="section-title">Mis Clases</h2>
            <div className="carousel-container" 
                 onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} 
                 onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>
               <div style={{ position: 'relative', width: '280px', height: '380px', margin: '0 auto' }}>
                  {teachers.map((teacher, index) => (
                    <div key={index} style={getCardStyle(index)} onClick={() => index === activeCardIndex && setSelectedCardForRedemption(teacher)}>
                      <ProfessorCard professor={teacher} isActive={index === activeCardIndex} points={teacher.points} requiredPoints={100} />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {currentScreen === 'BATTLE' && <JoinBattleScreen onBack={() => setCurrentScreen('HOME')} studentId={user.id} studentName={user.name} />}
        {currentScreen === 'ALLFORALL' && <JoinAllForAllScreen onBack={() => setCurrentScreen('HOME')} studentId={user.id} studentName={user.name} />}
        {(currentScreen === 'REWARDS' || currentScreen === 'ACHIEVEMENTS') && <AchievementsScreen user={user} onBack={() => setCurrentScreen('HOME')} />}
        {currentScreen === 'PROFILE' && <StudentProfileScreen user={user} onLogout={onLogout} />}

        <JoinClassModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} onJoin={handleJoinClass} isLoading={loading} />
        
        {selectedCardForRedemption && (
           <ProfessorCardDetailModal 
              teacherId={selectedCardForRedemption.id} 
              professorName={selectedCardForRedemption.name} 
              currentPoints={selectedCardForRedemption.points} 
              professorImageUrl={selectedCardForRedemption.imageUrl} 
              onClose={() => setSelectedCardForRedemption(null)} 
              onRedeem={fetchEnrollments} 
           />
        )}

        <IonAlert 
          isOpen={!!successAlertData} 
          onDidDismiss={() => setSuccessAlertData(null)} 
          header="¡Éxito!" 
          message={`Bienvenido a ${successAlertData?.className}.`} 
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
import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { notificationsOutline } from 'ionicons/icons';
import { TeacherScreen, User, AppScreen, CustomModule } from '../../../../AppTypes';
import { api } from '../../../../api/axios';

// Estilos CSS
import './TeacherDashboard.css';

// Componentes de Navegación
import TeacherBottomNav from './TeacherBottomNav';
import DashboardScreen from './DashboardScreen'; 

// --- IMPORTACIÓN DE PANTALLAS REALES ---
import AllForAllControlScreen from './AllForAllControlScreen';
import TeacherProfileScreen from './TeacherProfileScreen';
import BattleManagerScreen from './BattleManagerScreen'; 
import StudentListScreen from './StudentListScreen'; 
import RewardsManagementScreen from '../screens/RewardsManagementScreen'; 
import QuestionBankScreen from './QuestionBankScreen';

// Modal de Asignar Puntos
import AssignPointsModal from '../../../gamification/AssignPointsModal';



interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  enabledModules?: Set<AppScreen | TeacherScreen | string>;
  customModules?: CustomModule[];
  students?: User[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, 
  onLogout, 
  enabledModules = new Set(), 
  customModules = []
}) => {
  
  const [activeScreen, setActiveScreen] = useState<TeacherScreen | string>(TeacherScreen.Dashboard);
  const [showAssignPointsModal, setShowAssignPointsModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const { data } = await api.get('/rewards/teacher/pending');
        setPendingCount(data.length);
      } catch (e) {
        console.error("Error al cargar notificaciones");
      }
    };
    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (screen: TeacherScreen) => setActiveScreen(screen);

  const renderContent = () => {
    const handleBack = () => setActiveScreen(TeacherScreen.Dashboard);
    
    switch (activeScreen) {
      case TeacherScreen.Dashboard:
        return (
            <DashboardScreen 
                navigateTo={navigateTo} 
                onOpenAssignPoints={() => setShowAssignPointsModal(true)}
            />
        );
      case TeacherScreen.BattleManager:
        return <BattleManagerScreen students={[]} teacherId={user.id} onBack={handleBack} onOpenBank={() => setActiveScreen('questions')} />;
      case TeacherScreen.StudentList:
        return <StudentListScreen onBack={handleBack} />;
      case TeacherScreen.Profile:
        return <TeacherProfileScreen user={user} onLogout={onLogout} />;
      case TeacherScreen.AllForAll:
        return <AllForAllControlScreen onBack={handleBack} />;
      case 'rewards':
        return <RewardsManagementScreen teacherId={user.id} onBack={handleBack} />;
      case 'questions':
        return <QuestionBankScreen onBack={() => setActiveScreen(TeacherScreen.BattleManager)} teacherId={user.id} />;
      default:
        return <DashboardScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="teacher-dashboard-container">
      
      {/* HEADER AJUSTADO PARA GANAR ESPACIO VERTICAL */}
      <header className="dashboard-header-dark">
        <div className="header-info-main">
          <p className="welcome-label">Hola, <strong>{(user?.name || 'Juan').split(' ')[0]}</strong></p>
          <h1 className="header-title-main">Panel de Docente</h1>
          <p className="header-subtitle-main">Gestiona tus clases y actividades.</p>
        </div>
        
        <div className="header-actions-main">
          <button 
            className="notif-bell-main" 
            onClick={() => navigateTo('rewards' as any)}
          >
            <div className="bell-wrapper-main">
              <IonIcon icon={notificationsOutline} />
              {pendingCount > 0 && (
                <span className="notif-badge-float-main">{pendingCount}</span>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* ÁREA DE CONTENIDO CON OVERLAP AJUSTADO */}
      <main className="teacher-content-area overlap-active">
        {renderContent()}
      </main>
      
      <TeacherBottomNav
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        enabledModules={enabledModules}
        customModules={customModules}
      />

      <AssignPointsModal 
        isOpen={showAssignPointsModal}
        onClose={() => setShowAssignPointsModal(false)}
      />
    </div>
  );
};

export default TeacherDashboard;
import React, { useState } from 'react';
import { 
  IonButton 
} from '@ionic/react';

// CORRECCIÓN: Usamos TeacherScreen que es lo que tienes definido en tus tipos
import { TeacherScreen, User, AppScreen, CustomModule } from '../../../../AppTypes';

// Estilos CSS
import './TeacherDashboard.css';

// Componentes de Navegación
import TeacherBottomNav from './TeacherBottomNav';
import DashboardScreen from './DashboardScreen';

// --- COMPONENTES INTERNOS (Placeholders) ---

const BattleManagerScreen: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <h2>Gestor de Batallas</h2>
    <p>Aquí crearás los torneos 1v1 y por equipos.</p>
    <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Volver</button>
  </div>
);

const StudentListScreen: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <h2>Lista de Estudiantes</h2>
    <p>Gestión de alumnos inscritos.</p>
    <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Volver</button>
  </div>
);

const TeacherProfileScreen: React.FC<any> = ({ user, onLogout }) => (
  <div className="ion-padding">
    <h2>Perfil del Docente</h2>
    <h3>{user.name}</h3>
    <p>Email: {user.email}</p>
    <button onClick={onLogout} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px' }}>
      Cerrar Sesión
    </button>
  </div>
);

const RewardsManagementScreen: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <h2>Gestión de Premios</h2>
    <p>Crea recompensas para tus alumnos.</p>
    <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Volver</button>
  </div>
);

const AllForAllControlScreen: React.FC<any> = () => (
  <div className="ion-padding"><h2>Control "Todos contra Todos"</h2></div>
);

const BattleLobbyScreen: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <h2>Sala de Espera</h2>
    <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Volver</button>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

interface TeacherDashboardProps {
  user: User;
  onLogout: () => void;
  enabledModules?: Set<AppScreen | TeacherScreen | string>; // Usamos TeacherScreen
  customModules?: CustomModule[];
  students?: User[];
  onInviteStudents?: (studentIds: string[], roomCode: string, battleName: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, 
  onLogout, 
  enabledModules = new Set(), 
  customModules = [], 
  students = [], 
  onInviteStudents = () => {} 
}) => {
  // Usamos TeacherScreen en el estado inicial
  const [activeScreen, setActiveScreen] = useState<TeacherScreen | string>(TeacherScreen.Dashboard);
  
  const navigateTo = (screen: TeacherScreen) => setActiveScreen(screen);

  const renderContent = () => {
    const handleBack = () => setActiveScreen(TeacherScreen.Dashboard);
    
    switch (activeScreen) {
      case TeacherScreen.Dashboard:
        return <DashboardScreen navigateTo={navigateTo}/>;
      case TeacherScreen.BattleManager:
        return <BattleManagerScreen students={students} teacherId={user.id} onBack={handleBack} />;
      case TeacherScreen.StudentList:
        return <StudentListScreen onBack={handleBack} />;
      case TeacherScreen.Profile:
        return <TeacherProfileScreen user={user} onLogout={onLogout} />;
      case TeacherScreen.AllForAll:
        return <AllForAllControlScreen />;
      case 'rewards':
        return <RewardsManagementScreen teacherId={user.id} onBack={handleBack} />;
      default:
        const customModule = customModules.find(m => m.id === activeScreen);
        if (customModule) {
            return <BattleLobbyScreen onBack={handleBack} />;
        }
        return <DashboardScreen navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="teacher-dashboard-container">
      {/* Área Principal con Scroll */}
      <main className="teacher-content-area">
        {renderContent()}
      </main>
      
      {/* Barra de Navegación Inferior */}
      <TeacherBottomNav
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        enabledModules={enabledModules}
        customModules={customModules}
      />
    </div>
  );
};

export default TeacherDashboard;
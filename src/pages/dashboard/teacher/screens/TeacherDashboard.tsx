import React, { useState } from 'react';
import { 
  IonButton 
} from '@ionic/react';
 
import { TeacherScreen, User, AppScreen, CustomModule } from '../../../../AppTypes';

// Estilos CSS
import './TeacherDashboard.css';

// Componentes de Navegación
import TeacherBottomNav from './TeacherBottomNav';
import DashboardScreen from './DashboardScreen';

// --- IMPORTACIÓN DE PANTALLAS REALES (Desde la carpeta screens) ---
// Nota: Hemos estandarizado la ruta a './screens/' para mantener el orden
import AllForAllControlScreen from './AllForAllControlScreen';
import TeacherProfileScreen from './TeacherProfileScreen';
import BattleManagerScreen from './BattleManagerScreen';
import StudentListScreen from './StudentListScreen'; // <--- NUEVO IMPORT

// --- COMPONENTES INTERNOS (Placeholders restantes) ---

const RewardsManagementScreen: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <h2>Gestión de Premios</h2>
    <p>Crea recompensas para tus alumnos.</p>
    <button onClick={onBack} style={{ marginTop: '20px', padding: '10px 20px' }}>Volver</button>
  </div>
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
  enabledModules?: Set<AppScreen | TeacherScreen | string>;
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
  
  const [activeScreen, setActiveScreen] = useState<TeacherScreen | string>(TeacherScreen.Dashboard);
  
  const navigateTo = (screen: TeacherScreen) => setActiveScreen(screen);

  const renderContent = () => {
    // Función para volver al dashboard principal
    const handleBack = () => setActiveScreen(TeacherScreen.Dashboard);
    
    switch (activeScreen) {
      case TeacherScreen.Dashboard:
        return <DashboardScreen navigateTo={navigateTo}/>;
        
      case TeacherScreen.BattleManager:
        return <BattleManagerScreen students={students} teacherId={user.id} onBack={handleBack} />;
        
      case TeacherScreen.StudentList:
        // Ahora renderiza el componente real importado de ./screens/StudentListScreen
        return <StudentListScreen onBack={handleBack} />;
        
      case TeacherScreen.Profile:
        return <TeacherProfileScreen user={user} onLogout={onLogout} />;
        
      case TeacherScreen.AllForAll:
        return <AllForAllControlScreen onBack={handleBack} />;
        
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
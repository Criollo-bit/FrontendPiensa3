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

// --- IMPORTACIÓN DE PANTALLAS REALES ---
import AllForAllControlScreen from './AllForAllControlScreen';
import TeacherProfileScreen from './TeacherProfileScreen';
import BattleManagerScreen from './BattleManagerScreen';
import StudentListScreen from './StudentListScreen';

// 🔥 IMPORTAMOS LA PANTALLA DE PREMIOS
import RewardsManagementScreen from '../screens/RewardsManagementScreen';

// 🔥 NUEVO IMPORT: Importamos la pantalla de Bancos que creamos antes
import QuestionBankScreen from './QuestionBankScreen';

// --- COMPONENTES INTERNOS (Placeholders) ---
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
    const handleBack = () => setActiveScreen(TeacherScreen.Dashboard);
    
    switch (activeScreen) {
      case TeacherScreen.Dashboard:
        return <DashboardScreen navigateTo={navigateTo}/>;
        
      case TeacherScreen.BattleManager:
        return (
          <BattleManagerScreen 
            students={students} 
            teacherId={user.id} 
            onBack={handleBack} 
            // 👇 Pasamos la función para navegar al Banco
            onOpenBank={() => setActiveScreen('questions')} 
          />
        );
        
      case TeacherScreen.StudentList:
        return <StudentListScreen onBack={handleBack} />;
        
      case TeacherScreen.Profile:
        return <TeacherProfileScreen user={user} onLogout={onLogout} />;
        
      case TeacherScreen.AllForAll:
        return <AllForAllControlScreen subjectId={1} teacherName={user.name} onBack={handleBack} />;
        
      case 'rewards':
        return <RewardsManagementScreen teacherId={user.id} onBack={handleBack} />;

      // 🔥 NUEVO CASO: Renderizamos el Banco de Preguntas
      case 'questions':
        return (
           <QuestionBankScreen 
             onBack={() => setActiveScreen(TeacherScreen.BattleManager)} 
             teacherId={user.id} // ID Real para guardar en BD
           />
        );
        
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
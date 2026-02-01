import React from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// --- IMPORTS DE PÁGINAS ---
import Login from './pages/auth/Login';
import Home from './pages/dashboard/Home';
import Subjects from './pages/academic/Subjects';
import AssignPoints from './pages/gamification/AssignPointsModal';

// --- IMPORTS DE GAMIFICACIÓN (DOCENTE) ---
import BattleControlScreen from './pages/dashboard/teacher/screens/BattleControlScreen'; 
import QuestionBankScreen from './pages/dashboard/teacher/screens/QuestionBankScreen';
import RewardsManagementScreen from './pages/dashboard/teacher/screens/RewardsManagementScreen'; 

// --- IMPORTS DE ESTUDIANTE ---
import MyClassesScreen from './pages/dashboard/student/screens/MyClassesScreen';
import StudentClassDetailScreen from './pages/dashboard/student/screens/StudentClassDetailScreen'; 
import JoinBattleScreen from './pages/dashboard/student/screens/JoinBattleScreen'; // ✅ Importamos la pantalla de batalla

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// ✅ COMPONENTE DE CONTROL DE NAVEGACIÓN
const NavigationManager: React.FC = () => {
  const location = useLocation();

  // Definimos las rutas donde la Navbar DEBE ocultarse
  const hideNavbarPaths = [
    '/teacher/battle',
    '/student/battle-arena' // ✅ Ahora ocultamos la navbar en la nueva ruta de batalla
  ];

  const shouldHide = hideNavbarPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      <style>
        {`
          ion-tab-bar {
            --height: 80px !important; /* Ajuste para evitar iconos cortados en móviles */
            padding-bottom: env(safe-area-inset-bottom) !important;
            border-top: 1px solid rgba(0,0,0,0.05) !important;
            display: ${shouldHide ? 'none' : 'flex'} !important;
          }
          ion-tab-button {
            margin-bottom: 8px !important;
          }
        `}
      </style>
    </>
  );
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <NavigationManager />
         
        <IonRouterOutlet>
          
          {/* --- RUTAS PÚBLICAS --- */}
          <Route exact path="/login" component={Login} />
          
          {/* --- HOME --- */}
          <Route exact path="/home" component={Home} />

          {/* --- ACADÉMICAS --- */}
          <Route exact path="/subjects" component={Subjects} />
          <Route exact path="/assign-points" component={AssignPoints} />

          {/* --- DOCENTE --- */}
          <Route exact path="/teacher/battle" component={BattleControlScreen} />
          
          <Route 
            exact 
            path="/teacher/questions" 
            render={(props) => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : { id: '' };
              return (
                <QuestionBankScreen 
                   onBack={() => props.history.goBack()}
                   teacherId={user.id} 
                />
              );
            }} 
          />
 
          <Route 
            exact 
            path="/teacher/rewards" 
            render={(props) => { 
               const userStr = localStorage.getItem('user');
               const user = userStr ? JSON.parse(userStr) : { id: '' };
               return (
                 <RewardsManagementScreen 
                   teacherId={user.id} 
                   onBack={() => props.history.goBack()} 
                 />
               );
            }} 
          />

          {/* --- ESTUDIANTE --- */}
          <Route 
            exact 
            path="/student/my-classes" 
            component={MyClassesScreen} 
          />

          <Route 
            exact 
            path="/student/class/:subjectId" 
            component={StudentClassDetailScreen} 
          />

          {/* ✅ RUTA INDEPENDIENTE PARA LA BATALLA ✅ */}
          {/* Esto soluciona el fondo blanco y permite que la imagen del auto cargue correctamente */}
          <Route 
            exact 
            path="/student/battle-arena" 
            render={(props) => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : { id: '', fullName: '', name: '' };
              return (
                <JoinBattleScreen 
                  studentId={user.id} 
                  studentName={user.fullName || user.name} 
                  onBack={() => props.history.push('/home')} 
                />
              );
            }} 
          />

          {/* --- REDIRECCIÓN --- */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

        </IonRouterOutlet>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;
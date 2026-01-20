import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// --- IMPORTS DE PÁGINAS ---
import Login from './pages/auth/Login';
import Home from './pages/dashboard/Home';
import Subjects from './pages/academic/Subjects';
import AssignPoints from './pages/gamification/AssignPoints';

// --- IMPORTS DE GAMIFICACIÓN (DOCENTE) ---
import BattleControlScreen from './pages/dashboard/teacher/screens/BattleControlScreen'; 
import QuestionBankScreen from './pages/dashboard/teacher/screens/QuestionBankScreen'; 

// 🔥 NUEVO IMPORT: La pantalla real que creamos con Axios
import RewardsManagementScreen from './pages/dashboard/teacher/screens/RewardsManagementScreen'; 

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

const App: React.FC = () => {

  return (
    <IonApp>
      <IonReactRouter>
        
        {/* El Outlet maneja el cambio de pantallas */}
        <IonRouterOutlet>
          
          {/* --- RUTAS PÚBLICAS --- */}
          <Route exact path="/login" component={Login} />
          
          {/* --- HOME (DASHBOARD PRINCIPAL) --- */}
          <Route exact path="/home" component={Home} />

          {/* --- RUTAS ACADÉMICAS Y GAMIFICACIÓN --- */}
          <Route exact path="/subjects" component={Subjects} />
          <Route exact path="/assign-points" component={AssignPoints} />

          {/* --- RUTAS DEL DOCENTE (BATALLAS Y PREMIOS) --- */}
          
          {/* 1. Control de Batalla */}
          <Route exact path="/teacher/battle" component={BattleControlScreen} />

          {/* 2. Banco de Preguntas */}
          <Route 
            exact 
            path="/teacher/questions" 
            render={(props) => (
              <QuestionBankScreen 
                {...props} 
                onBack={() => props.history.goBack()} 
              />
            )} 
          />

          {/* 3. 🔥 NUEVA RUTA: Gestión de Premios */}
          <Route 
            exact 
            path="/teacher/rewards" 
            render={(props) => {
               // Recuperamos el usuario del localStorage para pasar el ID
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

          {/* --- REDIRECCIÓN POR DEFECTO --- */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

        </IonRouterOutlet>

      </IonReactRouter>
    </IonApp>
  );
};

export default App;
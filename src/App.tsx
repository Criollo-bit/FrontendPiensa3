import React from 'react';
import { Redirect, Route } from 'react-router-dom';
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
          
          {/* 🔥 CORRECCIÓN AQUÍ (Línea 65) 🔥 
              Ahora recuperamos el usuario y pasamos 'teacherId' 
          */}
          <Route 
            exact 
            path="/teacher/questions" 
            render={(props) => {
              const userStr = localStorage.getItem('user');
              const user = userStr ? JSON.parse(userStr) : { id: '' };
              return (
                <QuestionBankScreen 
                   onBack={() => props.history.goBack()}
                   teacherId={user.id} // 👈 ¡ESTO FALTABA!
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
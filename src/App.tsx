import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// --- IMPORTS DE PÁGINAS ORGANIZADAS ---
import Login from './pages/auth/Login';
import Home from './pages/dashboard/Home';
import Subjects from './pages/academic/Subjects';
import AssignPoints from './pages/gamification/AssignPoints';

// --- IMPORT DEL NAVBAR ---
import BottomNav from './components/BottomNav';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
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

  // Función simple para obtener el rol del usuario actual
  // Esto es necesario para que el NavBar sepa si mostrar opciones de Profe o Alumno
  const getUserRole = (): 'TEACHER' | 'STUDENT' => {
    // Intentamos leer el rol guardado en localStorage (si lo guardaste en Login)
    // Si no hay nada, asumimos TEACHER por defecto para que no falle la UI
    const savedRole = localStorage.getItem('userRole');
    return (savedRole === 'STUDENT') ? 'STUDENT' : 'TEACHER';
  };

  return (
    <IonApp>
      <IonReactRouter>
        
        {/* El Outlet maneja el cambio de pantallas */}
        <IonRouterOutlet>
          
          {/* Ruta pública (Login) */}
          <Route exact path="/login" component={Login} />
          
          {/* Rutas principales del sistema */}
          <Route exact path="/home" component={Home} />
          <Route exact path="/subjects" component={Subjects} />
          <Route exact path="/assign-points" component={AssignPoints} />

          {/* Redirección inicial */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

        </IonRouterOutlet>

        {/* El NavBar se coloca AQUÍ, fuera del Outlet pero dentro del Router.
          Así es visible en todas las páginas (el componente BottomNav ya tiene
          lógica interna para ocultarse si estás en /login).
        */}
        <BottomNav role={getUserRole()} />

      </IonReactRouter>
    </IonApp>
  );
};

export default App;
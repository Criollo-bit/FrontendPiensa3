import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

// --- IMPORTS DE PÁGINAS ORGANIZADAS ---
import Login from './pages/auth/Login';
import Home from './pages/dashboard/Home';
import Subjects from './pages/academic/Subjects';
import AssignPoints from './pages/gamification/AssignPoints';
 
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

  // Eliminamos la lógica de roles aquí porque ya la maneja el Home.tsx
  // y cada Dashboard tiene su propio NavBar interno.

  return (
    <IonApp>
      <IonReactRouter>
        
        {/* El Outlet maneja el cambio de pantallas */}
        <IonRouterOutlet>
          
          {/* Ruta pública (Login) */}
          <Route exact path="/login" component={Login} />
          
          {/* Ruta Home (El Portero que decide qué Dashboard mostrar) */}
          <Route exact path="/home" component={Home} />

          {/* Rutas específicas (Accesibles desde los Dashboards) */}
          <Route exact path="/subjects" component={Subjects} />
          <Route exact path="/assign-points" component={AssignPoints} />

          {/* Redirección inicial */}
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>

        </IonRouterOutlet>

        {/* ¡NavBar ELIMINADO! 
            Ahora cada Dashboard (Student/Teacher) renderiza su propia barra. 
        */}
 
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
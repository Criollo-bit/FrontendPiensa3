import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Login from './pages/Login';
import Home from './pages/Home';
import Subjects from './pages/Subjects';      
import AssignPoints from './pages/AssignPoints'; 

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

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Ruta por defecto: Login */}
        <Route exact path="/login">
          <Login />
        </Route>
        
        {/* Ruta protegida: Home */}
        <Route exact path="/home">
          <Home />
        </Route>

        {/* --- NUEVAS RUTAS --- */}
        <Route exact path="/subjects">
          <Subjects />
        </Route>

        <Route exact path="/assign-points">
          <AssignPoints />
        </Route>
        {/* -------------------- */}

        {/* Redirección inicial */}
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
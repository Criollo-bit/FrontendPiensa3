import React from 'react';
import { IonIcon, IonTabBar, IonTabButton, IonLabel } from '@ionic/react';
import { home, trophy, people, gameController, person } from 'ionicons/icons';
import { TeacherScreen, Screen, CustomModule } from '../../../../AppTypes';

interface TeacherBottomNavProps {
  activeScreen: TeacherScreen | string;
  setActiveScreen: (screen: TeacherScreen | string) => void;
  enabledModules?: Set<Screen | TeacherScreen | string>;
  customModules?: CustomModule[];
}

const TeacherBottomNav: React.FC<TeacherBottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton selected={activeScreen === TeacherScreen.Dashboard} onClick={() => setActiveScreen(TeacherScreen.Dashboard)}>
        <IonIcon icon={home} />
        <IonLabel>Inicio</IonLabel>
      </IonTabButton>
      <IonTabButton selected={activeScreen === 'rewards'} onClick={() => setActiveScreen('rewards')}>
        <IonIcon icon={trophy} />
        <IonLabel>Premios</IonLabel>
      </IonTabButton>
      <IonTabButton selected={activeScreen === TeacherScreen.BattleManager} onClick={() => setActiveScreen(TeacherScreen.BattleManager)}>
        <IonIcon icon={gameController} />
        <IonLabel>Batalla</IonLabel>
      </IonTabButton>
      <IonTabButton selected={activeScreen === TeacherScreen.StudentList} onClick={() => setActiveScreen(TeacherScreen.StudentList)}>
        <IonIcon icon={people} />
        <IonLabel>Alumnos</IonLabel>
      </IonTabButton>
      <IonTabButton selected={activeScreen === TeacherScreen.Profile} onClick={() => setActiveScreen(TeacherScreen.Profile)}>
        <IonIcon icon={person} />
        <IonLabel>Perfil</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};
export default TeacherBottomNav;
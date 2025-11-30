import React from 'react';
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonCardTitle, IonCardSubtitle } from '@ionic/react';
import { school, trophy, gameController } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { TeacherScreen } from '../../../../AppTypes';

interface DashboardHomeProps {
  navigateTo: (screen: TeacherScreen) => void;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ navigateTo }) => {
  const history = useHistory();

  return (
    <div style={{ paddingTop: '20px' }}>
      <h2 style={{ paddingLeft: '10px', margin: '0 0 20px 0' }}>Panel de Control</h2>
      <IonGrid>
        <IonRow>
          <IonCol size="6">
            <IonCard button onClick={() => history.push('/subjects')} style={{ height: '140px', margin: '5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <IonCardContent>
                <IonIcon icon={school} color="primary" style={{ fontSize: '40px', marginBottom: '10px' }} />
                <IonCardTitle style={{ fontSize: '16px' }}>Mis Clases</IonCardTitle>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="6">
            <IonCard button onClick={() => history.push('/assign-points')} style={{ height: '140px', margin: '5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <IonCardContent>
                <IonIcon icon={trophy} color="warning" style={{ fontSize: '40px', marginBottom: '10px' }} />
                <IonCardTitle style={{ fontSize: '16px' }}>Asignar Puntos</IonCardTitle>
              </IonCardContent>
            </IonCard>
          </IonCol>
          <IonCol size="12">
            <IonCard button onClick={() => navigateTo(TeacherScreen.BattleManager)} style={{ background: 'var(--ion-color-tertiary)', color: 'white', margin: '5px', marginTop: '15px' }}>
              <IonCardContent style={{ display: 'flex', alignItems: 'center' }}>
                <IonIcon icon={gameController} style={{ fontSize: '40px', marginRight: '20px' }} />
                <div>
                  <IonCardTitle style={{ color: 'white' }}>Torneos</IonCardTitle>
                  <IonCardSubtitle style={{ color: 'rgba(255,255,255,0.8)' }}>Gestionar batallas</IonCardSubtitle>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};
export default DashboardHome;
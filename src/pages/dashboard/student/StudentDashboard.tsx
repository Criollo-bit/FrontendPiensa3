import React from 'react';
import { 
  IonCard, IonCardTitle, IonCardContent, IonCardSubtitle,
  IonGrid, IonRow, IonCol, IonIcon, IonButton
} from '@ionic/react';
import { school, trophy, logOut } from 'ionicons/icons';

interface StudentDashboardProps {
  user: any;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  return (
    <>
      <div style={{ padding: '10px 5px', marginBottom: '10px' }}>
        <h1 style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
          ¡Hola, {user.name.split(' ')[0]}!
        </h1>
        <p style={{ margin: '5px 0', color: '#666' }}>Panel del Estudiante</p>
      </div>

      <IonGrid>
        <IonRow>
          <IonCol size="6">
            <IonCard button routerLink="/subjects" style={{ height: '100%', margin: 0, textAlign: 'center' }}>
              <IonCardContent>
                <IonIcon icon={school} color="primary" style={{ fontSize: '30px', marginBottom: '10px' }} />
                <IonCardTitle style={{ fontSize: '16px' }}>Mis Clases</IonCardTitle>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="6">
            <IonCard button style={{ height: '100%', margin: '0', textAlign: 'center' }}>
              <IonCardContent>
                <IonIcon icon={trophy} color="success" style={{ fontSize: '30px', marginBottom: '10px' }} />
                <IonCardTitle style={{ fontSize: '16px' }}>Canjear</IonCardTitle>
                <IonCardSubtitle>Premios</IonCardSubtitle>
              </IonCardContent>
            </IonCard>
          </IonCol>
          
          <IonCol size="12">
             <IonButton fill="clear" color="medium" expand="block" onClick={onLogout}>
                <IonIcon slot="start" icon={logOut} />
                Cerrar Sesión
             </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </>
  );
};

export default StudentDashboard;
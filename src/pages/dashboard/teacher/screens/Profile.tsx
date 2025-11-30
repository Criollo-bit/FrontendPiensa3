import React from 'react';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle } from '@ionic/react';

const Profile: React.FC<any> = ({ user, onLogout }) => (
  <div className="ion-padding">
    <h2>Mi Perfil</h2>
    <IonCard>
      <IonCardHeader><IonCardTitle>{user.name}</IonCardTitle></IonCardHeader>
      <IonCardContent><p>{user.email}</p></IonCardContent>
    </IonCard>
    <IonButton color="danger" expand="block" onClick={onLogout} className="ion-margin-top">Cerrar Sesión</IonButton>
  </div>
);
export default Profile;
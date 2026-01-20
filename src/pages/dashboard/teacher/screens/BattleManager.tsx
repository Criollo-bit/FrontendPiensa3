import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

const BattleManager: React.FC<any> = ({ onBack }) => (
  <div className="ion-padding">
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <IonButton fill="clear" onClick={onBack}><IonIcon icon={arrowBack} slot="icon-only" /></IonButton>
        <h2 style={{ margin: 0 }}>Gestor de Batallas</h2>
    </div>
    <p>Aquí crearás los torneos.</p>
  </div>
);
export default BattleManager;
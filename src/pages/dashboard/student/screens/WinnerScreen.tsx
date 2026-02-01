import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { trophy, star, arrowForwardOutline, checkmarkDoneCircle } from 'ionicons/icons';
import './WinnerScreen.css';

interface WinnerScreenProps {
  points: number;
  onContinue: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ points, onContinue }) => {
  const [userAvatar, setUserAvatar] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserAvatar(user.avatarUrl || user.avatar || '');
      setUserName(user.fullName || user.name || 'Estudiante');
    }
  }, []);

  return (
    <div className="winner-page-container">
      {/* Elementos decorativos de fondo */}
      <IonIcon icon={star} className="star-decoration s1" />
      <IonIcon icon={star} className="star-decoration s2" />
      <IonIcon icon={star} className="star-decoration s3" />

      <div className="winner-content-card">
        <div className="trophy-badge-container">
          <div className="trophy-glow"></div>
          <div className="winner-avatar-mini">
            <img 
              src={userAvatar || `https://ui-avatars.com/api/?name=${userName}&background=random`} 
              alt="Tú" 
            />
          </div>
          <IonIcon icon={trophy} className="main-trophy-icon animate-bounce-slow" />
        </div>

        <h1 className="winner-title">¡Victoria!</h1>
        <p className="winner-subtitle">Felicidades {userName.split(' ')[0]}, has dominado la batalla.</p>

        <div className="points-reward-box">
          <span className="points-label">PUNTOS CARGADOS A TU CUENTA</span>
          <div className="points-value-row">
            <span className="points-plus">+</span>
            <span className="points-number">{points}</span>
          </div>
          <div className="real-points-notice">
            <IonIcon icon={checkmarkDoneCircle} />
            <span>Puntos de materia actualizados</span>
          </div>
        </div>

        <button onClick={onContinue} className="btn-finish-battle">
          VOLVER AL INICIO
          <IonIcon icon={arrowForwardOutline} />
        </button>
      </div>
    </div>
  );
};

export default WinnerScreen;
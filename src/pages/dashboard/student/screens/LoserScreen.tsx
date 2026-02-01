import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { sadOutline, rocketOutline, arrowForwardOutline, flameOutline } from 'ionicons/icons';
import './LoserScreen.css';

interface LoserScreenProps {
  score: number;
  onContinue: () => void;
}

const LoserScreen: React.FC<LoserScreenProps> = ({ score, onContinue }) => {
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
    <div className="loser-page-container">
      {/* Decoraciones de fondo motivadoras */}
      <IonIcon icon={flameOutline} className="decor-icon d1" />
      <IonIcon icon={rocketOutline} className="decor-icon d2" />

      <div className="loser-content-card">
        <div className="sad-icon-container">
          <div className="sad-glow"></div>
          
          {/* Avatar del estudiante con filtro de escala de grises suave */}
          <div className="loser-avatar-frame">
            <img 
              src={userAvatar || `https://ui-avatars.com/api/?name=${userName}&background=random`} 
              alt="Perfil" 
            />
          </div>
          
          <IonIcon icon={sadOutline} className="main-sad-icon animate-pulse-slow" />
        </div>

        <h1 className="loser-title">¡Buen intento!</h1>
        <p className="loser-subtitle">
          {userName.split(' ')[0]}, el aprendizaje es parte del camino. ¡La próxima será mejor!
        </p>

        <div className="score-summary-box">
          <span className="score-label">PUNTUACIÓN OBTENIDA</span>
          <div className="score-value-row">
            <span className="score-number">{score}</span>
            <span className="score-pts">PTS</span>
          </div>
          <div className="motivation-tag">
             <IonIcon icon={rocketOutline} />
             <span>Sigue practicando para subir al podio</span>
          </div>
        </div>

        <button onClick={onContinue} className="btn-retry-exit">
          VOLVER AL MENÚ
          <IonIcon icon={arrowForwardOutline} />
        </button>
      </div>
    </div>
  );
};

export default LoserScreen;
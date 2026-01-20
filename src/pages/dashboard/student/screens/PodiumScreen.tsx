import React, { useState, useEffect } from 'react';
import './PodiumScreen.css';

interface Winner {
  name: string;
  score: number;
  position: number; // 1, 2, o 3
  color?: string;
}

interface PodiumScreenProps {
  winners: Winner[]; 
  onContinue: () => void;
}

const PodiumScreen: React.FC<PodiumScreenProps> = ({ winners, onContinue }) => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Iniciar animación al montar
    setTimeout(() => setAnimated(true), 100);
    // ELIMINADO: Ya no hay temporizador automático
  }, []);

  const getPodiumHeight = (position: number) => {
    switch(position) {
      case 1: return '260px'; // Oro más alto
      case 2: return '180px'; // Plata
      case 3: return '130px'; // Bronce
      default: return '100px';
    }
  };

  const getMedalEmoji = (position: number) => {
    switch(position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getBarColor = (position: number) => {
      if (position === 1) return '#FFD700'; // Oro
      if (position === 2) return '#C0C0C0'; // Plata
      return '#CD7F32'; // Bronce
  };

  return (
    <div className="podium-container">
      
      {/* BOTÓN DE SALIDA MANUAL (ARRIBA DERECHA) */}
      <div className="podium-nav">
          <button onClick={onContinue} className="btn-skip">
              Siguiente <span className="arrow">→</span>
          </button>
      </div>

      <div className="podium-header">
        <h1 className="podium-title">¡Top 3!</h1>
        <div className="confetti-container">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)` }} />
          ))}
        </div>
      </div>

      <div className="podium-stage">
        {winners.map((winner, index) => (
          <div 
            key={index}
            className={`podium-wrapper pos-${winner.position}`}
            // Orden visual: 2 (izq), 1 (centro), 3 (der)
            style={{ order: winner.position === 1 ? 2 : winner.position === 2 ? 1 : 3 }}
          >
            {/* Avatar y Datos (Flotan encima de la barra) */}
            <div 
              className="avatar-group"
              style={{ 
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${index * 0.2}s`
              }}
            >
              <div className="medal-badge" style={{ backgroundColor: getBarColor(winner.position) }}>
                {getMedalEmoji(winner.position)}
              </div>
              
              <div className="podium-avatar-circle">
                {winner.name.substring(0, 2).toUpperCase()}
              </div>
              
              <div className="info-card">
                <div className="p-name">{winner.name}</div>
                <div className="p-score">{winner.score} pts</div>
              </div>
            </div>

            {/* Barra del Podio */}
            <div 
              className="podium-bar"
              style={{
                height: animated ? getPodiumHeight(winner.position) : '0px',
                backgroundColor: getBarColor(winner.position),
                transitionDelay: `${index * 0.1}s`,
                boxShadow: `0 0 20px ${getBarColor(winner.position)}66`
              }}
            >
              <span className="rank-number">{winner.position}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="celebration-footer">
        <p>¡Buen trabajo equipo!</p>
      </div>
    </div>
  );
};

export default PodiumScreen;
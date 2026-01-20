import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { star, lockClosed } from 'ionicons/icons';

// Definimos la interfaz aquí o impórtala de tus tipos
interface Professor {
  id: number | string;
  name: string;
  imageUrl?: string;
  subject?: string; // Equivale a title
  title?: string;
  locked?: boolean;
}

interface ProfessorCardProps {
  professor: Professor;
  onClick?: () => void;
  isActive?: boolean;
  points?: number;
  requiredPoints?: number;
}

const ProfessorCard: React.FC<ProfessorCardProps> = ({ 
  professor, 
  onClick, 
  isActive = false, 
  points = 0, 
  requiredPoints = 100 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isLocked = professor.locked;
  const [isUnlocking, setIsUnlocking] = useState(false);
  const prevLockedState = useRef(isLocked);

  useEffect(() => {
    if (prevLockedState.current === true && isLocked === false) {
      setIsUnlocking(true);
      const timer = setTimeout(() => setIsUnlocking(false), 1200);
      return () => clearTimeout(timer);
    }
    prevLockedState.current = isLocked;
  }, [isLocked]);

  const isInteractive = isActive && !isLocked && !isUnlocking;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isInteractive) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = rect;

    const rotateX = (y / height - 0.5) * -20; // Reduje un poco la rotación para móvil
    const rotateY = (x / width - 0.5) * 20;

    const shineX = (x / width) * 100;
    const shineY = (y / height) * 100;

    cardRef.current.style.setProperty('--rx', `${rotateY.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--ry', `${rotateX.toFixed(2)}deg`);
    cardRef.current.style.setProperty('--shine-x', `${shineX.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-y', `${shineY.toFixed(2)}%`);
    cardRef.current.style.setProperty('--shine-opacity', '1');
  };

  const handleMouseLeave = () => {
    if (!cardRef.current || !isInteractive) return;
    cardRef.current.style.setProperty('--rx', '0deg');
    cardRef.current.style.setProperty('--ry', '0deg');
    cardRef.current.style.setProperty('--shine-opacity', '0');
  };

  // Clases CSS dinámicas (se definen en StudentDashboard.css o global)
  const unlockShineClasses = isUnlocking ? 'animate-unlock-shine' : '';
  const unlockIconClasses = isUnlocking ? 'animate-unlock-icon-pop' : '';

  return (
    <div
      ref={cardRef}
      className={`professor-card-wrapper ${isInteractive ? 'tilt-card' : ''}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden', position: 'relative',
        boxShadow: isActive ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 20px rgba(0,0,0,0.2)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        background: 'white'
      }}
    >
      <div className={isInteractive ? 'tilt-card-inner' : ''} style={{ width: '100%', height: '100%' }}>
        
        {/* IMAGEN DE FONDO */}
        <img
          src={professor.imageUrl || `https://ui-avatars.com/api/?name=${professor.name}&background=random`}
          alt={professor.name}
          className={`${isLocked && !isUnlocking ? 'grayscale' : ''}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        
        {/* OVERLAY OSCURO */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }}></div>

        {/* BADGE DE PUNTOS (ARRIBA DERECHA) */}
        {!isLocked && (
          <div style={{ 
            position: 'absolute', top: '15px', right: '15px', 
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            padding: '6px 12px', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', gap: '5px',
            color: 'white', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
          }}>
            <IonIcon icon={star} style={{ fontSize: '1rem' }} />
            <span style={{ fontSize: '0.9rem' }}>{points}</span>
          </div>
        )}

        {/* CANDADO (SI ESTÁ BLOQUEADO) */}
        {isLocked && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className={unlockIconClasses} style={{ background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '50%', backdropFilter: 'blur(5px)' }}>
                 <IonIcon icon={lockClosed} style={{ fontSize: '3rem', color: 'white' }} />
              </div>
              <div style={{ position: 'absolute', bottom: '20px', color: 'white', fontWeight: 'bold' }}>
                 {points}/{requiredPoints} pts para desbloquear
              </div>
           </div>
        )}

        {/* TEXTO (ABAJO) */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', color: 'white' }}>
            <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', lineHeight: 1.2, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {professor.name}
            </h3>
            <p style={{ margin: '5px 0 0', color: '#7dd3fc', fontSize: '0.95rem', fontWeight: '600' }}>
              {professor.subject || professor.title}
            </p>
        </div>

        {/* BRILLO (SHINE) */}
        {isInteractive && <div className="tilt-card-shine"></div>}
        
        {/* BRILLO DE DESBLOQUEO */}
        <div className={`absolute inset-0 ${unlockShineClasses}`}></div>

      </div>
    </div>
  );
};

export default ProfessorCard;
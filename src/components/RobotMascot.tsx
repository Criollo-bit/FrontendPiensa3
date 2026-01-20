import React from 'react';

interface RobotProps {
  focus: 'idle' | 'email' | 'password';
}

const RobotMascot: React.FC<RobotProps> = ({ focus }) => {
  const isEmailFocused = focus === 'email';
  const isPasswordFocused = focus === 'password';

  return (
    <div className="robot-container robot-idle-animation">
      <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
        {/* Sombra */}
        <ellipse cx="100" cy="180" rx="60" ry="10" fill="rgba(0,0,0,0.1)" />
        
        {/* Cuerpo */}
        <rect x="50" y="80" width="100" height="90" rx="20" fill="#e2e8f0" />
        <rect x="60" y="100" width="80" height="50" rx="10" fill="#f8fafc" />
        
        {/* Cabeza */}
        <rect x="65" y="30" width="70" height="60" rx="15" fill="#e2e8f0" />
        
        {/* Antena */}
        <line x1="100" y1="30" x2="100" y2="15" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
        <circle cx="100" cy="12" r="5" fill="#38bdf8" />
        
        {/* Ojos (reaccionan al password tapándose o mirando) */}
        {isPasswordFocused ? (
           // Ojos cerrados/tapados
           <g>
             <line x1="75" y1="60" x2="95" y2="60" stroke="#475569" strokeWidth="3" />
             <line x1="105" y1="60" x2="125" y2="60" stroke="#475569" strokeWidth="3" />
           </g>
        ) : (
           // Ojos abiertos
           <g>
             <circle cx="85" cy="60" r="12" fill="#475569" />
             <circle cx="115" cy="60" r="12" fill="#475569" />
             <circle cx="85" cy="60" r="5" fill="#fff" />
             <circle cx="115" cy="60" r="5" fill="#fff" />
           </g>
        )}
        
        {/* Brazos (Se mueven según el foco) */}
        <g>
            {/* Brazo Izquierdo */}
            <g className="robot-arm" style={{ 
                transform: isEmailFocused ? 'translateY(25px) translateX(-20px) rotate(-60deg)' : 
                           isPasswordFocused ? 'translateY(-40px) translateX(10px) rotate(140deg)' : 'none', 
                transformOrigin: '70px 110px' 
            }}>
                 <rect x="25" y="100" width="30" height="15" rx="7.5" fill="#94a3b8" />
                 <circle cx="20" cy="107.5" r="12" fill="#cbd5e1" />
            </g>
             {/* Brazo Derecho */}
            <g className="robot-arm" style={{ 
                transform: isEmailFocused ? 'translateY(25px) translateX(20px) rotate(60deg)' : 
                           isPasswordFocused ? 'translateY(-40px) translateX(-10px) rotate(-140deg)' : 'none', 
                transformOrigin: '130px 110px' 
            }}>
                <rect x="145" y="100" width="30" height="15" rx="7.5" fill="#94a3b8" />
                <circle cx="180" cy="107.5" r="12" fill="#cbd5e1" />
            </g>
        </g>
      </svg>
    </div>
  );
};

export default RobotMascot;
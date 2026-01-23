import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { colorFillOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import { socketService } from '../../../../api/socket'; 
import { sendColorResponse } from '../../../../lib/allForAllService';

interface Props { 
  subjectId: string; 
  studentId: string; 
  studentName: string; 
  onBack: () => void; 
}

const AllForAllStudentGame: React.FC<Props> = ({ subjectId, studentId, studentName }) => {
  const [phase, setPhase] = useState<'LOBBY' | 'PLAYING' | 'FEEDBACK'>('LOBBY');
  const [challenge, setChallenge] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const socket = socketService.getBattleSocket();
    
    // Escuchamos el reto del profesor (Evento: start-all-for-all)
    socket?.on('start-all-for-all', (data: any) => {
      // El backend envía { roomId, config: { word, color, mode } }
      setChallenge(data.config); 
      setIsCorrect(null);
      setPhase('PLAYING');
    });

    return () => { socket?.off('start-all-for-all'); };
  }, []);

  const handleSelectAnswer = (selectedColor: string) => {
    if (phase !== 'PLAYING' || !challenge) return;
    
    // DETERMINAR RESPUESTA CORRECTA
    let correctValue = '';
    if (challenge.mode === 'color') {
      // El niño debe presionar el color de la tinta
      correctValue = challenge.color; 
    } else {
      // El niño debe presionar lo que dice el texto (mapeo de palabra a color)
      const wordMap: any = { 
        'ROJO': 'red', 'AZUL': 'blue', 'VERDE': 'green', 'AMARILLO': 'yellow' 
      };
      correctValue = wordMap[challenge.word];
    }
    
    const check = selectedColor === correctValue;
    setIsCorrect(check);
    setPhase('FEEDBACK');

    // ENVIAR AL BACKEND (Suma puntos si check es true)
    sendColorResponse(subjectId, studentId, studentName, check);

    // Volver a espera tras 2.5 segundos
    setTimeout(() => setPhase('LOBBY'), 2500);
  };

  return (
    <div style={{ 
      background: '#f8fafc', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      
      {/* VISTA: ESPERANDO RITUAL */}
      {phase === 'LOBBY' && (
        <div style={{ textAlign: 'center' }}>
          <IonSpinner name="bubbles" color="primary" style={{ width: '80px', height: '80px' }} />
          <h2 style={{ color: '#1e293b', marginTop: '30px', fontWeight: 700 }}>¡Atento a la pantalla!</h2>
          <p style={{ color: '#64748b' }}>El profesor está preparando el próximo desafío...</p>
        </div>
      )}

      {/* VISTA: JUEGO ACTIVO */}
      {phase === 'PLAYING' && challenge && (
        <div style={{ width: '100%', maxWidth: '450px', textAlign: 'center' }}>
          
          {/* BANNER DE INSTRUCCIÓN CLARA */}
          <div style={{ 
            background: challenge.mode === 'color' ? '#7c3aed' : '#0284c7', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '24px', 
            marginBottom: '30px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '4px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, letterSpacing: '1px', marginBottom: '5px' }}>MISIÓN:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>
              <IonIcon 
                icon={challenge.mode === 'color' ? colorFillOutline : chatboxEllipsesOutline} 
                style={{ fontSize: '1.8rem', verticalAlign: 'middle', marginRight: '10px' }} 
              />
              {challenge.mode === 'color' 
                ? '¡PRESIONA EL COLOR DE LA TINTA!' 
                : '¡PRESIONA LO QUE DICE EL TEXTO!'}
            </div>
          </div>

          {/* PALABRA DEL RETO (STROOP) */}
          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <h1 style={{ 
  /* Bajamos a 10vw para que palabras largas como AMARILLO quepan mejor */
  fontSize: 'clamp(1.5rem, 10vw, 4.5rem)', 
  fontWeight: 900, 
  margin: 0,
  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
  color: challenge.color === 'red' ? '#ef4444' : 
         challenge.color === 'blue' ? '#3b82f6' : 
         challenge.color === 'green' ? '#22c55e' : '#eab308',
  width: '100%',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  /* Añadimos esto para que si aun así es grande, se encoja un poco más */
  letterSpacing: '-1px',
  display: 'block',
  overflow: 'hidden',
}}>
  {challenge.word}
</h1>
          </div>

          {/* BOTONES DE RESPUESTA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
            <button onClick={() => handleSelectAnswer('red')} style={btnStyle('#ef4444')}>ROJO</button>
            <button onClick={() => handleSelectAnswer('blue')} style={btnStyle('#3b82f6')}>AZUL</button>
            <button onClick={() => handleSelectAnswer('green')} style={btnStyle('#22c55e')}>VERDE</button>
            <button onClick={() => handleSelectAnswer('yellow')} style={btnStyle('#eab308')}>AMARILLO</button>
          </div>
        </div>
      )}

      {/* VISTA: RESULTADO RÁPIDO */}
      {phase === 'FEEDBACK' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10rem', marginBottom: '10px' }}>
            {isCorrect ? '✅' : '❌'}
          </div>
          <h2 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 900, 
            color: isCorrect ? '#16a34a' : '#dc2626' 
          }}>
            {isCorrect ? '¡CORRECTO!' : '¡OUCH!'}
          </h2>
          <p style={{ fontSize: '1.5rem', color: '#475569' }}>
            {isCorrect ? '+100 PUNTOS' : 'Más suerte ahora'}
          </p>
        </div>
      )}
    </div>
  );
};

// Estilo auxiliar para los botones
const btnStyle = (bg: string) => ({
  background: bg,
  color: 'white',
  border: 'none',
  padding: '30px 10px',
  borderRadius: '20px',
  fontSize: '1.4rem',
  fontWeight: 800,
  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
  cursor: 'pointer',
  transition: 'transform 0.1s active',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

export default AllForAllStudentGame;
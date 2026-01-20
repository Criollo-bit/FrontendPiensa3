import React, { useState, useRef } from 'react';
import { IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { arrowBack, colorPaletteOutline } from 'ionicons/icons';
// Ruta ajustada a 5 niveles según tu estructura
import { joinAllForAllRoom } from '../../../../../lib/allForAllService';
import AllForAllStudentGame from '../AllForAllStudentGame'; 

interface Props { onBack: () => void; studentId: string; studentName: string; }

const JoinAllForAllScreen: React.FC<Props> = ({ onBack, studentId, studentName }) => {
  const [code, setCode] = useState<string[]>(Array(4).fill(''));
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameData, setGameData] = useState<any | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (value: string, index: number) => {
    const val = value.toUpperCase();
    if (/^[A-Z0-9]$/.test(val) || val === '') {
      const newCode = [...code];
      newCode[index] = val;
      setCode(newCode);
      if (val !== '' && index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pinString = code.join('').toUpperCase();
    if (pinString.length < 4) return setErrorMsg('PIN incompleto');

    setIsJoining(true);
    try {
      const result = await joinAllForAllRoom(pinString, studentId, studentName);
      if (result.success) {
        setGameData({ subjectId: pinString });
      } else {
        setErrorMsg(result.message || 'La sala no existe');
      }
    } catch (err) {
      setErrorMsg('Error de conexión');
    } finally {
      setIsJoining(false);
    }
  };

  if (gameData) return (
    <AllForAllStudentGame 
      subjectId={gameData.subjectId} 
      studentId={studentId} 
      studentName={studentName} 
      onBack={() => setGameData(null)} 
    />
  );

  return (
    <div style={{background: '#f5f3ff', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <button onClick={onBack} style={{position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', cursor: 'pointer'}}>
        <IonIcon icon={arrowBack} style={{fontSize: '2rem', color: '#4c1d95'}}/>
      </button>
      <div style={{textAlign: 'center', marginBottom: 30}}>
        <IonIcon icon={colorPaletteOutline} style={{fontSize: '4rem', color: '#8b5cf6'}}/>
        <h1 style={{color: '#4c1d95', fontWeight: 800}}>All For All</h1>
        <p>Introduce el PIN de la clase</p>
      </div>
      <form onSubmit={handleJoin} style={{width: '100%', maxWidth: 300}}>
        <div style={{display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20}}>
          {code.map((digit, i) => (
            <input key={i} ref={el => { inputRefs.current[i] = el; }} type="text" maxLength={1} value={digit}
              onChange={e => handleInputChange(e.target.value, i)}
              style={{width: 55, height: 65, textAlign: 'center', fontSize: '1.5rem', borderRadius: 12, border: '2px solid #ddd6fe'}}
            />
          ))}
        </div>
        <button type="submit" disabled={isJoining} style={{width: '100%', background: '#7c3aed', color: 'white', padding: 15, borderRadius: 15, fontWeight: 700, border: 'none', cursor: 'pointer'}}>
          {isJoining ? <IonSpinner name="crescent"/> : 'INGRESAR'}
        </button>
      </form>
      <IonToast isOpen={!!errorMsg} message={errorMsg!} duration={2000} color="danger" onDidDismiss={() => setErrorMsg(null)} />
    </div>
  );
};

export default JoinAllForAllScreen;
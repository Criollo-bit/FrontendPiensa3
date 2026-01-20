import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { arrowBack, peopleOutline } from 'ionicons/icons';
// Asegúrate de que la ruta de importación sea correcta según tu estructura
import * as battleApi from '../../../../lib/battleApi'; 
import StudentBattleScreen from './StudentBattleScreen'; 
import './JoinBattleScreen.css'; 

interface JoinBattleScreenProps {
  onBack: () => void;
  studentId: string;
  studentName: string;
}

const JoinBattleScreen: React.FC<JoinBattleScreenProps> = ({ onBack, studentId, studentName }) => {
  // 1. CAMBIO: Inicializamos con 4 espacios en lugar de 6
  const [code, setCode] = useState<string[]>(Array(4).fill(''));
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [joinedGroup, setJoinedGroup] = useState<{ groupId: string; battleId: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.toUpperCase();
    if (/^[A-Z0-9]$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // 2. CAMBIO: El índice máximo ahora es 3 (porque 0,1,2,3 son 4 elementos)
      if (value !== '' && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    // 3. CAMBIO: Cortamos a 4 caracteres
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 4);
    const newCode = [...code];
    // 4. CAMBIO: Iteramos hasta 4
    for (let i = 0; i < 4; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setCode(newCode);
    // 5. CAMBIO: El último índice válido es 3
    const lastFullIndex = Math.min(pastedData.length, 3);
    inputRefs.current[lastFullIndex]?.focus();
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    // 6. CAMBIO: Validación de longitud 4
    if (fullCode.length !== 4) {
      setErrorMsg('El código debe tener 4 caracteres.');
      return;
    }

    setIsJoining(true);
    setErrorMsg(null);

    try {
      const result = await battleApi.joinBattleWithCode(fullCode, studentId, studentName);

      if (result.success && result.group) {
        setJoinedGroup({
          groupId: result.group.id,
          battleId: result.group.battle_id,
        });
      } else {
        setErrorMsg(result.message || 'Error al unirse.');
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Error de conexión.');
    } finally {
      setIsJoining(false);
    }
  };

  if (joinedGroup) {
    return (
      <StudentBattleScreen
        groupId={joinedGroup.groupId}
        battleId={joinedGroup.battleId}
        studentId={studentId}
        studentName={studentName}
        onBack={() => {
          setJoinedGroup(null);
          setCode(Array(4).fill('')); // Limpiar código al volver
        }}
      />
    );
  }

  return (
    <div className="bg-join-battle">
      <button
        onClick={onBack}
        style={{
            position: 'absolute', top: '20px', left: '20px', zIndex: 50,
            background: 'white', border: 'none', borderRadius: '50%',
            width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer'
        }}
      >
        <IonIcon icon={arrowBack} style={{ fontSize: '1.5rem', color: '#334155' }} />
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          
          <div className="animate-stagger" style={{ '--stagger-delay': '100ms' } as React.CSSProperties}>
            <div className="battle-portal">
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Unirse a Batalla</h1>
              <p style={{ color: '#64748b' }}>Introduce el PIN de 4 dígitos</p>
              
              <div style={{ 
                  marginTop: '1.5rem', width: '80px', height: '80px', borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(5px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <IonIcon icon={peopleOutline} style={{ fontSize: '3rem', color: '#3b82f6' }} />
              </div>
            </div>
          </div>

          <form onSubmit={handleJoinWithCode} style={{ width: '100%', maxWidth: '400px', padding: '0 20px' }}>
            <div
              className="code-inputs-container animate-stagger"
              style={{ '--stagger-delay': '200ms' } as React.CSSProperties}
              onPaste={handlePaste}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="code-input-glass"
                  disabled={isJoining}
                />
              ))}
            </div>

            <div className="animate-stagger" style={{ '--stagger-delay': '300ms', marginTop: '2.5rem' } as React.CSSProperties}>
              <button
                type="submit"
                // 7. CAMBIO: Botón se habilita con 4 caracteres
                disabled={isJoining || code.join('').length < 4}
                style={{
                    width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                    background: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', cursor: 'pointer',
                    opacity: (isJoining || code.join('').length < 4) ? 0.7 : 1,
                    transition: 'all 0.2s'
                }}
              >
                {isJoining ? (
                    <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                        <IonSpinner name="crescent" style={{color:'white', width:'20px', height:'20px'}}/> Conectando...
                    </div>
                ) : 'Entrar al Grupo'}
              </button>
            </div>
          </form>
      </div>

      <IonToast
        isOpen={!!errorMsg}
        message={errorMsg || ''}
        duration={3000}
        color="danger"
        position="top"
        onDidDismiss={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default JoinBattleScreen;
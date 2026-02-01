import React, { useState, useRef, ChangeEvent, KeyboardEvent, useMemo } from 'react';
import { IonIcon, IonSpinner, IonToast, IonContent, IonPage } from '@ionic/react';
import { arrowBack, personCircleOutline } from 'ionicons/icons';
import * as battleApi from '../../../../lib/battleApi'; 
import StudentBattleScreen from './StudentBattleScreen'; 
import './JoinBattleScreen.css'; 

interface JoinBattleScreenProps {
  onBack: () => void;
  studentId: string;
  studentName: string;
}

const JoinBattleScreen: React.FC<JoinBattleScreenProps> = ({ onBack, studentId, studentName }) => {
  const [code, setCode] = useState<string[]>(Array(4).fill(''));
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [joinedGroup, setJoinedGroup] = useState<{ groupId: string; battleId: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ RECUPERACIÓN RADICAL: Obtenemos el avatar real del storage local
  const displayImage = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const url = user.avatarUrl || user.avatar || user.avatar_url || '';
        return url ? `${url}${url.includes('?') ? '&' : '?'}t=${new Date().getTime()}` : '';
      }
    } catch (e) { console.error(e); }
    return '';
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.toUpperCase();
    if (/^[A-Z0-9]$/.test(value) || value === '') {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value !== '' && index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setErrorMsg('El código debe tener 4 caracteres.');
      return;
    }
    setIsJoining(true);
    try {
      const result = await (battleApi as any).joinBattleWithCode(fullCode, studentName, studentId, displayImage);
      if (result.success && result.group) {
        setJoinedGroup({ groupId: result.group.id, battleId: result.group.battle_id });
      } else {
        setErrorMsg(result.message || 'Error al unirse.');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Error de conexión.');
    } finally { setIsJoining(false); }
  };

  if (joinedGroup) {
    return (
      <StudentBattleScreen
        groupId={joinedGroup.groupId}
        battleId={joinedGroup.battleId}
        studentId={studentId}
        studentName={studentName}
        onBack={() => { setJoinedGroup(null); setCode(Array(4).fill('')); }}
      />
    );
  }

  // ✅ SOLUCIÓN AL FONDO BLANCO: Envolvemos en IonPage e IonContent propios con estilos inline
  return (
    <IonPage style={{ zIndex: 1000 }}>
      <IonContent fullscreen style={{ '--background': '#f1f5f9' }}>
        <div className="bg-join-battle" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={onBack}
            style={{
                position: 'absolute', 
                top: 'calc(20px + env(safe-area-inset-top))', 
                left: '20px', 
                zIndex: 50,
                background: 'white', border: 'none', borderRadius: '50%',
                width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <IonIcon icon={arrowBack} style={{ fontSize: '1.6rem', color: '#334155' }} />
          </button>

          <div className="join-battle-content-wrapper" style={{ flex: 1, paddingTop: '80px' }}>
              <div className="battle-portal">
                <div className="avatar-preview-container" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white',
                        overflow: 'hidden', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', background: 'white'
                    }}>
                        <img 
                          src={displayImage || `https://ui-avatars.com/api/?name=${studentName}&background=random`} 
                          alt="Tu perfil" 
                          key={displayImage} // 🔥 Fuerza el refresco visual para ver el auto
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${studentName}&background=random`; }}
                        />
                    </div>
                    <span style={{ fontSize: '1rem', color: '#334155', marginTop: '0.8rem', fontWeight: '700' }}>{studentName}</span>
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>Unirse a Batalla</h1>
                <p style={{ color: '#64748b' }}>Introduce el PIN de 4 dígitos</p>
              </div>

              <form onSubmit={handleJoinWithCode} style={{ width: '100%', maxWidth: '400px', padding: '0 20px', margin: '0 auto' }}>
                <div className="code-inputs-container">
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
                <button
                    type="submit"
                    disabled={isJoining || code.join('').length < 4}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
                        background: '#0f172a', color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                        marginTop: '2.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                        opacity: (isJoining || code.join('').length < 4) ? 0.7 : 1
                    }}
                >
                    {isJoining ? 'Conectando...' : 'Entrar al Grupo'}
                </button>
              </form>
          </div>
        </div>
      </IonContent>
      <IonToast isOpen={!!errorMsg} message={errorMsg || ''} duration={3000} color="danger" position="top" />
    </IonPage>
  );
};

export default JoinBattleScreen;
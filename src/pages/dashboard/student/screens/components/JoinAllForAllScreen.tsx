import React, { useState, useRef } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { arrowBack, colorPaletteOutline } from 'ionicons/icons';
import { socketService } from '../../../../../api/socket';
import AllForAllStudentGame from '../AllForAllStudentGame';
import './JoinAllForAllScreen.css';

interface Props {
  onBack: () => void;
  studentId: string; // 👈 no se usa, pero se mantiene
  studentName: string;
}

const JoinAllForAllScreen: React.FC<Props> = ({
  onBack,
  studentName,
}) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const v = value.toUpperCase();
    if (!/^[A-Z0-9]?$/.test(v)) return;

    const next = [...code];
    next[index] = v;
    setCode(next);

    if (v && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const joinRoom = () => {
    const roomId = code.join('').toUpperCase();

    if (roomId.length < 4) {
      setError('PIN incompleto');
      return;
    }

    const socket = socketService.connectToBattle();

    socket.emit('join-room', {
      roomId,
      studentName,
    });

    // ✅ GUARDAMOS PARA EL JUEGO
    localStorage.setItem('allForAllRoomId', roomId);
    localStorage.setItem('studentName', studentName);

    setJoined(true);
  };

  // ✅ YA NO PASAMOS PROPS
  if (joined) {
    return <AllForAllStudentGame />;
  }

  return (
    <div className="join-container">
      <button className="join-back" onClick={onBack}>
        <IonIcon icon={arrowBack} />
      </button>

      <div className="join-header">
        <IonIcon icon={colorPaletteOutline} />
        <h1>All For All</h1>
        <p>Ingresa el PIN</p>
      </div>

      <div className="pin-inputs">
        {code.map((v, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            value={v}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, i)}
          />
        ))}
      </div>

      <button className="join-btn" onClick={joinRoom}>
        INGRESAR
      </button>

      <IonToast
        isOpen={!!error}
        message={error || ''}
        duration={2000}
        color="danger"
        onDidDismiss={() => setError(null)}
      />
    </div>
  );
};

export default JoinAllForAllScreen;

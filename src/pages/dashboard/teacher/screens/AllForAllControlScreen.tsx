import React, { useEffect, useState } from 'react';
import { IonIcon, IonAlert } from '@ionic/react';
import { arrowBack, rocketOutline, people } from 'ionicons/icons';
import { socketService } from '../../../../api/socket';
import './AllForAllControlScreen.css';

const COLORS = [
  { name: 'ROJO', value: 'red', hex: '#ef4444' },
  { name: 'AZUL', value: 'blue', hex: '#3b82f6' },
  { name: 'VERDE', value: 'green', hex: '#22c55e' },
  { name: 'AMARILLO', value: 'yellow', hex: '#eab308' },
];

const AllForAllControlScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [roomId, setRoomId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [word, setWord] = useState('ROJO');
  const [color, setColor] = useState('blue');
  const [mode, setMode] = useState<'text' | 'color'>('color');
  const [started, setStarted] = useState(false);
  const [showExit, setShowExit] = useState(false);

  useEffect(() => {
    const socket = socketService.connectToBattle();

    socket.on('room-created', (data: any) => {
      setRoomId(data.roomId);
      setStudents([]);
      setRanking([]);
    });

    socket.on('room-update', (data: any) => {
      if (data.students) setStudents(data.students);
    });

    socket.on('all-for-all-ranking', (data: any) => {
      setRanking(data.ranking);
    });

    return () => {
      socket.off('room-created');
      socket.off('room-update');
      socket.off('all-for-all-ranking');
    };
  }, []);

  const createRoom = () => {
    socketService.getBattleSocket()?.emit('create-room', {
      teacherId: 'TEMP_TEACHER',
      name: 'All For All',
    });
  };

  const startGame = () => {
    setStarted(true);
    setRanking([]);

    socketService.getBattleSocket()?.emit('start-all-for-all', {
      roomId,
      config: { word, color, mode },
    });
  };

  return (
    <div className="afa-container">
      <header className="afa-header">
        <button onClick={() => setShowExit(true)} className="back-btn">
          <IonIcon icon={arrowBack} />
        </button>
        <h1>All For All</h1>
        <p>{roomId ? `PIN: ${roomId}` : 'Crear sala'}</p>
      </header>

      <div className="afa-card">
        {!roomId && (
          <>
            <h2>Configurar ronda</h2>

            <select value={word} onChange={e => setWord(e.target.value)}>
              {COLORS.map(c => (
                <option key={c.value} value={c.name}>{c.name}</option>
              ))}
            </select>

            <div className="color-row">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  style={{
                    backgroundColor: c.hex,
                    outline: color === c.value ? '3px solid black' : 'none',
                  }}
                  onClick={() => setColor(c.value)}
                />
              ))}
            </div>

            <div className="mode-row">
              <button
                onClick={() => setMode('text')}
                style={{
                  backgroundColor: mode === 'text' ? '#3b82f6' : '#f0f0f0',
                  color: mode === 'text' ? 'white' : 'black',
                }}
              >
                Texto
              </button>
              <button
                onClick={() => setMode('color')}
                style={{
                  backgroundColor: mode === 'color' ? '#3b82f6' : '#f0f0f0',
                  color: mode === 'color' ? 'white' : 'black',
                }}
              >
                Color
              </button>
            </div>

            <button className="primary" onClick={createRoom}>
              MOSTRAR PIN
            </button>
          </>
        )}

        {roomId && !started && (
          <>
            <h2>Código: {roomId}</h2>
            <p><IonIcon icon={people} /> {students.length} estudiantes</p>
            <button className="start" onClick={startGame}>
              <IonIcon icon={rocketOutline} /> EMPEZAR
            </button>
          </>
        )}

        {started && ranking.length > 0 && (
          <>
            <h2>🏆 Ranking en vivo</h2>

            {/* Podio para los 3 primeros */}
            <div className="podium-container">
              {ranking.slice(0,3).map((r, i) => (
                <div key={i} className="podium-item">
                  <div className={`podium-bar ${i === 0 ? 'first' : i === 1 ? 'second' : 'third'}`}>
                    {r.name}
                  </div>
                  <div className="podium-name">{i + 1}°</div>
                </div>
              ))}
            </div>

            {/* Resto del ranking */}
            {ranking.length > 3 && (
              <div className="ranking-list">
                {ranking.slice(3).map((r, i) => (
                  <div key={i} className="rank-item">
                    <span>{i + 4}. {r.name}</span>
                    <span>{r.score || ''}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <IonAlert
        isOpen={showExit}
        header="¿Salir?"
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Sí', handler: onBack },
        ]}
        onDidDismiss={() => setShowExit(false)}
      />
    </div>
  );
};

export default AllForAllControlScreen;
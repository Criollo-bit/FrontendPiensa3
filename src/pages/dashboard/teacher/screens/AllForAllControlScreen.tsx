import React, { useEffect, useState } from 'react';
import { IonIcon, IonAlert } from '@ionic/react';
import { arrowBack, rocketOutline, people, trophy, medalOutline } from 'ionicons/icons';
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
        <p>{roomId ? `PIN: ${roomId}` : 'Configuración'}</p>
      </header>

      <div className="afa-scroll-content">
        <div className="afa-card">
          {!roomId && (
            <div className="setup-section">
              <h2>Nueva Ronda</h2>
              <select className="afa-select" value={word} onChange={e => setWord(e.target.value)}>
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
                      border: color === c.value ? '4px solid #1e293b' : 'none',
                    }}
                    onClick={() => setColor(c.value)}
                  />
                ))}
              </div>

              <div className="mode-row">
                <button
                  onClick={() => setMode('text')}
                  className={mode === 'text' ? 'active' : ''}
                >
                  Texto
                </button>
                <button
                  onClick={() => setMode('color')}
                  className={mode === 'color' ? 'active' : ''}
                >
                  Color
                </button>
              </div>

              <button className="primary-btn" onClick={createRoom}>
                GENERAR PIN
              </button>
            </div>
          )}

          {roomId && !started && (
            <div className="waiting-room">
              <div className="pin-display">
                <span className="label">PIN DE ACCESO</span>
                <span className="number">{roomId}</span>
              </div>
              <p className="student-count">
                <IonIcon icon={people} /> <b>{students.length}</b> listos para jugar
              </p>
              <button className="start-btn" onClick={startGame}>
                <IonIcon icon={rocketOutline} /> EMPEZAR AHORA
              </button>
            </div>
          )}

          {started && ranking.length > 0 && (
            <div className="ranking-section">
              <div className="ranking-header">
                <IonIcon icon={trophy} className="trophy-icon" />
                <h2>Posiciones</h2>
              </div>

              <div className="ranking-list">
                {ranking.map((r, i) => (
                  <div key={i} className={`rank-card pos-${i + 1}`}>
                    <div className="rank-badge">
                      {i < 3 ? <IonIcon icon={medalOutline} /> : i + 1}
                    </div>
                    <span className="rank-name">{r.name}</span>
                    <span className="rank-score">{r.score || 0} <small>pts</small></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <IonAlert
        isOpen={showExit}
        header="¿Finalizar sesión?"
        message="Se cerrará la sala actual."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Salir', handler: onBack, cssClass: 'alert-danger' },
        ]}
        onDidDismiss={() => setShowExit(false)}
      />
    </div>
  );
};

export default AllForAllControlScreen;
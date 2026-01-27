import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { socketService } from '../../../../api/socket';
import './AllForAllStudentGame.css';

const COLORS = [
  { name: 'ROJO', value: 'red', hex: '#ef4444' },
  { name: 'AZUL', value: 'blue', hex: '#3b82f6' },
  { name: 'VERDE', value: 'green', hex: '#22c55e' },
  { name: 'AMARILLO', value: 'yellow', hex: '#eab308' },
];

const AllForAllStudentGame: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [word, setWord] = useState('');
  const [color, setColor] = useState('');
  const [mode, setMode] = useState<'color' | 'text'>('color');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const socket = socketService.getBattleSocket();
    if (!socket) return;

    const roomIdStored = localStorage.getItem('allForAllRoomId');
    const studentName = localStorage.getItem('studentName') || 'Alumno';

    if (!roomIdStored) {
      console.error('No hay roomId en localStorage');
      return;
    }

    // Unirse a la sala al entrar
    socket.emit('join-room', { roomId: roomIdStored, studentName });
    console.log('Estudiante unido a la sala:', roomIdStored);

    // Escuchar inicio de ronda
    socket.on('start-all-for-all', ({ roomId, config }) => {
      console.log('Ronda recibida en estudiante:', config);
      setRoomId(roomId);
      setWord(config.word || 'ROJO');
      setColor(config.color || 'red');
      setMode(config.mode || 'color');
      setAnswered(false);
      setIsCorrect(null);
      setGameOver(false);
    });

    return () => {
      socket.off('start-all-for-all');
    };
  }, []);

  const submitAnswer = (value: string) => {
    if (answered) return;

    const correct =
      mode === 'color' ? value === color : value.toLowerCase() === word.toLowerCase();

    setAnswered(true);
    setIsCorrect(correct);

    setCorrectAnswers(prev => prev + (correct ? 1 : 0));
    setTotalQuestions(prev => prev + 1);

    socketService.getBattleSocket()?.emit('submit-answer-all', {
      roomId,
      studentName: localStorage.getItem('studentName'),
      isCorrect: correct,
    });

    // Mostrar resultado final tras 1s
    setTimeout(() => setGameOver(true), 1000);
  };

  return (
    <div className="afa-student-container">
      <h2 className="instruction">
        {mode === 'color' ? 'Escoge el COLOR del texto' : 'Escoge el TEXTO'}
      </h2>

      {/* TEXTO STROOP */}
      <div
        className="stroop-word"
        style={{ color: color }}
      >
        {word || '...'}
      </div>

      {/* OPCIONES */}
      <div className="options">
        {COLORS.map(c => (
          <button
            key={c.value}
            className={`option-btn ${mode}`}
            style={
              mode === 'color'
                ? { backgroundColor: c.hex, color: 'white' }
                : { backgroundColor: '#3b82f6', color: 'white' }
            }
            disabled={answered}
            onClick={() => submitAnswer(c.value)}
          >
            {mode === 'text' ? c.name : ''}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {answered && !gameOver && (
        <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
          <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} />
          {isCorrect ? 'Correcto' : 'Incorrecto'}
        </div>
      )}

      {/* RESULTADO FINAL */}
      {gameOver && (
        <div className={`final-result ${correctAnswers / totalQuestions >= 0.7 ? 'correct' : 'incorrect'}`}>
          <h2>{correctAnswers / totalQuestions >= 0.7 ? '🎉 Ganaste!' : '❌ Intenta de nuevo'}</h2>
          <p>Acertaste {correctAnswers}/{totalQuestions} preguntas</p>
        </div>
      )}
    </div>
  );
};

export default AllForAllStudentGame;
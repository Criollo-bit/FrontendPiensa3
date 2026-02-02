import React, { useEffect, useState, useMemo } from 'react';
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

    if (!roomIdStored) return;

    socket.emit('join-room', { roomId: roomIdStored, studentName });

    socket.on('start-all-for-all', ({ roomId, config }) => {
      setRoomId(roomId);
      setWord(config.word);
      setColor(config.color);
      setMode(config.mode);
      setAnswered(false);
      setIsCorrect(null);
      setGameOver(false);
    });

    return () => {
      socket.off('start-all-for-all');
    };
  }, []);

  /**
   * 🔴 STROOP REAL:
   * - Ningún botón repite color
   * - Ningún botón coincide texto-color
   * - El color VISUAL es el que se evalúa en modo "color"
   */
  const stroopOptions = useMemo(() => {
    const shifted = COLORS.map((_, i) => COLORS[(i + 1) % COLORS.length]);

    return COLORS.map((c, i) => ({
      ...c,
      displayColor: shifted[i].hex,     // color visual incorrecto
      displayValue: shifted[i].value,   // valor real del color visual
    }));
  }, [word, color]);

  const submitAnswer = (answer: string) => {
    if (answered) return;

    const correct =
      mode === 'color'
        ? answer === color        // comparar color VISUAL
        : answer === word;        // comparar TEXTO

    setAnswered(true);
    setIsCorrect(correct);
    setCorrectAnswers(prev => prev + (correct ? 1 : 0));
    setTotalQuestions(prev => prev + 1);

    socketService.getBattleSocket()?.emit('submit-answer-all', {
      roomId,
      studentName: localStorage.getItem('studentName'),
      isCorrect: correct,
    });

    setTimeout(() => setGameOver(true), 1000);
  };

  return (
    <div className="afa-student-container">
      <h2 className="instruction">
        {mode === 'color'
          ? 'Escoge el COLOR del texto'
          : 'Escoge el TEXTO'}
      </h2>

      {/* ESTÍMULO STROOP */}
      <div className="stroop-word" style={{ color }}>
        {word}
      </div>

      {/* OPCIONES INCONGRUENTES */}
      <div className="options">
        {stroopOptions.map(c => (
          <button
            key={c.value}
            className={`option-btn ${mode}`}
            style={{ backgroundColor: c.displayColor, color: 'white' }}
            disabled={answered}
            onClick={() =>
              submitAnswer(
                mode === 'color' ? c.displayValue : c.name
              )
            }
          >
            {mode === 'text' ? c.name : ''}
          </button>
        ))}
      </div>

      {/* FEEDBACK */}
      {answered && !gameOver && (
        <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`}>
          <IonIcon icon={isCorrect ? checkmarkCircle : closeCircle} />
          {isCorrect ? 'Correcto ' : 'Incorrecto '}
        </div>
      )}

      {/* RESULTADO FINAL */}
      {gameOver && (
        <div
          className={`final-result ${
            correctAnswers / totalQuestions >= 0.7
              ? 'correct'
              : 'incorrect'
          }`}
        >
          <h2>
            {correctAnswers / totalQuestions >= 0.7
              ? '🎉 Ganaste!'
              : '❌ Intenta de nuevo'}
          </h2>
          <p>
            Acertaste {correctAnswers}/{totalQuestions}
          </p>
        </div>
      )}
    </div>
  );
};

export default AllForAllStudentGame;
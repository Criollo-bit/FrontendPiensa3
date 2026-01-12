import React from 'react';
import { IonIcon } from '@ionic/react';
import { trophy } from 'ionicons/icons';

interface WinnerScreenProps {
  points: number;
  onContinue: () => void;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ points, onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen text-center p-8 bg-gradient-to-br from-green-400 to-teal-500 text-white">
      <div className="animate-bounce mb-6 text-7xl">
        <IonIcon icon={trophy} />
      </div>
      <h1 className="text-4xl font-extrabold mb-2">¡Felicitaciones!</h1>
      <p className="text-xl opacity-90 mb-8">Has completado la batalla.</p>
      <div className="bg-white/30 rounded-xl px-6 py-3 backdrop-blur-sm">
        <p className="text-2xl font-bold">Puntaje Final: {points}</p>
      </div>
       <button onClick={onContinue} className="mt-10 bg-white text-teal-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
        Volver al Menú
      </button>
    </div>
  );
};
export default WinnerScreen;
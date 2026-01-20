import React from 'react';
import { IonIcon } from '@ionic/react';
import { sadOutline } from 'ionicons/icons';

interface LoserScreenProps {
  score: number;
  onContinue: () => void;
}

const LoserScreen: React.FC<LoserScreenProps> = ({ score, onContinue }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen text-center p-8 bg-gradient-to-br from-red-500 to-orange-500 text-white">
      <div className="animate-pulse mb-6 text-7xl">
        <IonIcon icon={sadOutline} />
      </div>
      <h1 className="text-4xl font-extrabold mb-2">Batalla Terminada</h1>
      <p className="text-xl opacity-90 mb-8">¡Buen intento! Sigue practicando.</p>
      <div className="bg-white/30 rounded-xl px-6 py-3 backdrop-blur-sm">
        <p className="text-2xl font-bold">Puntaje Final: {score}</p>
      </div>
      <button onClick={onContinue} className="mt-10 bg-white text-orange-600 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
        Volver al Menú
      </button>
    </div>
  );
};
export default LoserScreen;
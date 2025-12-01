import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonSpinner } from '@ionic/react';
import { 
  arrowBack, bookOutline, addCircleOutline, playOutline, timeOutline 
} from 'ionicons/icons';

import { User } from '../../../../AppTypes';
import CreateBattleModal from './CreateBattleModal';
import './BattleManagerScreen.css';

// --- PLACEHOLDERS (Para evitar errores hasta que implementemos estos archivos) ---
const QuestionBankScreenPlaceholder: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="ion-padding" style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>🏦 Banco de Preguntas</h2>
    <p>Este módulo se implementará pronto.</p>
    <IonButton onClick={onBack}>Volver</IonButton>
  </div>
);

const BattleControlScreenPlaceholder: React.FC<{ battleId: string; onBack: () => void }> = ({ battleId, onBack }) => (
  <div className="ion-padding" style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>⚔️ Control de Batalla</h2>
    <p>ID de Batalla: {battleId}</p>
    <p>Aquí irá la lógica de WebSocket para controlar el juego.</p>
    <IonButton onClick={onBack}>Volver</IonButton>
  </div>
);
// --------------------------------------------------------------------------------

interface BattleRoom {
  id: string;
  name: string;
  questionCount: number;
  battleCode: string;
  groupCount: number;
  status: 'waiting' | 'active' | 'finished';
}

interface BattleManagerScreenProps {
  students: User[]; // Aunque no se usa directamente en el render, se mantiene por la interfaz original
  teacherId: string;
  onBack: () => void;
}

const BattleManagerScreen: React.FC<BattleManagerScreenProps> = ({ students, teacherId, onBack }) => {
  // Estados
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Carga inicial
  useEffect(() => {
    loadTeacherBattles();
  }, [teacherId]);

  const loadTeacherBattles = async () => {
    setIsLoading(true);
    // SIMULACIÓN: Aquí reemplazaríamos con axios.get(`/api/battles/teacher/${teacherId}`)
    console.log('Cargando batallas para:', teacherId);
    
    setTimeout(() => {
        // Datos Mock para probar visualmente
        const mockBattles: BattleRoom[] = [
            { id: '101', name: 'Repaso Matemáticas', questionCount: 5, battleCode: 'MATH-22', groupCount: 3, status: 'waiting' },
            { id: '102', name: 'Historia Express', questionCount: 10, battleCode: 'HIST-99', groupCount: 2, status: 'finished' },
        ];
        setRooms(mockBattles);
        setIsLoading(false);
    }, 800);
  };

  const handleCreateBattle = async (battleData: {
      name: string; 
      roundCount: number; 
      groupCount: number; 
      questions: any[]; 
      studentsPerGroup: number
  }) => {
    setIsLoading(true);
    
    // SIMULACIÓN: Aquí iría axios.post('/api/battles', battleData)
    console.log('Creando batalla con datos:', battleData);

    setTimeout(() => {
        const newBattle: BattleRoom = {
            id: Date.now().toString(),
            name: battleData.name,
            questionCount: battleData.roundCount,
            battleCode: 'NEW-' + Math.floor(Math.random() * 1000),
            groupCount: battleData.groupCount,
            status: 'waiting'
        };
        
        setRooms(prev => [newBattle, ...prev]);
        setIsCreateModalOpen(false);
        setIsLoading(false);
    }, 1000);
  };

  const handleOpenBattle = (battleId: string) => {
    setSelectedBattleId(battleId);
  };

  // --- NAVEGACIÓN INTERNA ---

  if (showQuestionBank) {
    return <QuestionBankScreenPlaceholder onBack={() => setShowQuestionBank(false)} />;
  }

  if (selectedBattleId) {
    return (
      <BattleControlScreenPlaceholder 
        battleId={selectedBattleId} 
        onBack={() => {
            setSelectedBattleId(null);
            loadTeacherBattles(); // Recargar al volver
        }} 
      />
    );
  }

  // --- RENDER PRINCIPAL ---

  return (
    <div className="battle-manager-container">
      
      {/* Header */}
      <div className="bm-header">
        <IonButton fill="clear" onClick={onBack} className="bm-back-btn">
             <IonIcon icon={arrowBack} style={{ fontSize: '24px', color: '#334155' }} />
        </IonButton>
        <h1 className="bm-title">Gestor de Batallas</h1>
        <p className="bm-subtitle">Crea y administra torneos para tus clases</p>
      </div>

      {/* Botones de Acción */}
      <div className="bm-actions-grid">
        <button 
            className="action-card-btn btn-green"
            onClick={() => setShowQuestionBank(true)}
        >
            <IonIcon icon={bookOutline} style={{ fontSize: '1.2rem' }} />
            Banco de Preguntas
        </button>
        <button 
            className="action-card-btn btn-sky"
            onClick={() => setIsCreateModalOpen(true)}
        >
             <IonIcon icon={addCircleOutline} style={{ fontSize: '1.2rem' }} />
            Crear Batalla
        </button>
      </div>

      {/* Lista de Batallas */}
      <div className="battles-list-section">
        <h2>Batallas Creadas</h2>
        
        {isLoading && rooms.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '20px' }}><IonSpinner /></div>
        ) : rooms.length === 0 ? (
            <div className="empty-state">
                <IonIcon icon={timeOutline} style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                <p>No hay batallas activas. ¡Crea una para empezar!</p>
            </div>
        ) : (
            <div className="rooms-list">
                {rooms.map(room => (
                    <div key={room.id} className="battle-card">
                        <div className="battle-card-header">
                            <div>
                                <h3 className="battle-name">{room.name}</h3>
                                <p className="battle-info">
                                    {room.questionCount} preguntas • {room.groupCount} grupos
                                </p>
                            </div>
                            <IonButton 
                                size="small" 
                                fill="solid" 
                                color="primary" // Ionic blue
                                onClick={() => handleOpenBattle(room.id)}
                            >
                                <IonIcon slot="start" icon={playOutline} />
                                Abrir
                            </IonButton>
                        </div>
                        
                        <div className="battle-code-box">
                            <span className="code-label">🎮 CÓDIGO DE ACCESO</span>
                            <p className="battle-code">{room.battleCode}</p>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                Comparte este código con tus alumnos
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Modal de Creación */}
      <CreateBattleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateBattle}
        teacherId={teacherId}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BattleManagerScreen;
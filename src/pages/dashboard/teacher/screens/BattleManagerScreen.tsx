import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonActionSheet } from '@ionic/react';
import { 
  arrowBack, 
  bookOutline, 
  addCircleOutline, 
  playOutline, 
  trashOutline, 
  list, 
  create 
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import CreateBattleModal from './CreateBattleModal'; 
// import SubjectManagerModal from './SubjectManagerModal'; // <-- YA NO LO NECESITAS
import { socketService } from '../../../../api/socket';
import './BattleManagerScreen.css';

interface BattleRoom {
  id: string;
  name: string;
  questionCount: number;
  battleCode: string;
  groupCount: number; 
  status: 'waiting' | 'active' | 'finished';
}

interface BattleManagerScreenProps {
  students: User[]; 
  teacherId: string;
  onBack: () => void;
}

const BattleManagerScreen: React.FC<BattleManagerScreenProps> = ({ students, teacherId, onBack }) => { 
  const history = useHistory();
  
  // --- ESTADOS DE SALAS ---
  const [rooms, setRooms] = useState<BattleRoom[]>(() => {
    const saved = localStorage.getItem(`battles_${teacherId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const tempBattleName = useRef<string>('');

  // --- ESTADOS MODALES Y UI ---
  const [isCreateBattleModalOpen, setIsCreateBattleModalOpen] = useState(false);
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // --- SOCKETS (TU LÓGICA ORIGINAL) ---
  useEffect(() => {
    const socket = socketService.connectToBattle();
    
    socket.on('room-created', (data: { roomId: string, code?: string, mySubjects?: any[] }) => {
      // Guardar bancos si llegan
      if (data.mySubjects) {
        localStorage.setItem(`subjects_${teacherId}`, JSON.stringify(data.mySubjects));
      }
      
      // Crear sala localmente
      const finalCode = data.code || data.roomId;
      const finalName = tempBattleName.current || `Batalla ${finalCode}`;
      const newRoom: BattleRoom = {
        id: data.roomId,
        name: finalName,
        questionCount: 5, 
        battleCode: finalCode,
        groupCount: 0,
        status: 'waiting'
      };
      
      setRooms(prev => [newRoom, ...prev]);
      tempBattleName.current = '';
      setIsLoading(false);
      setIsCreateBattleModalOpen(false); 
    });

    return () => { socket.off('room-created'); };
  }, [teacherId]);

  // --- HANDLERS ---

  const handleCreateBattle = async (name: string, qCount: number, gCount: number, qs: any[], sPerGroup: number) => {
      setIsLoading(true);
      const socket = socketService.getBattleSocket();
      if(socket) {
          tempBattleName.current = name;
          socket.emit('create-room', { name, questionCount: qCount, teacherId });
      }
  };

  const handleOpenBattle = (battleId: string) => {
    // Redirige a la pantalla de control que arreglamos antes
    history.push(`/teacher/battle`); 
    // Nota: La sala se crea/recupera sola al entrar a esa ruta, 
    // pero si necesitas pasar el ID específico puedes usar history state o params.
  };

  const handleDeleteRoom = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if(confirm('¿Borrar?')) setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  // --- CONEXIÓN CON BANCO DE PREGUNTAS (NUEVO) ---
  const goToQuestionBank = () => {
    // Navegamos a la pantalla completa que creamos en el paso anterior
    history.push('/teacher/questions');
  };

  return (
    <div className="bm-screen">
      <button onClick={onBack} className="bm-back-btn">
        <IonIcon icon={arrowBack} />
      </button>
      
      <div className="bm-content">
        <div className="bm-header animate-in">
          <h1>Gestor de Batallas</h1>
          <p>Crea y administra las batallas para tus clases.</p>
        </div>

        <div className="bm-actions-grid">
          {/* BOTÓN BANCO DE PREGUNTAS */}
          <button onClick={() => setShowBankOptions(true)} className="bm-action-btn btn-green">
            <IonIcon icon={bookOutline} className="bm-icon" />
            Banco de Preguntas
          </button>
          
          {/* BOTÓN CREAR BATALLA */}
          <button onClick={() => setIsCreateBattleModalOpen(true)} className="bm-action-btn btn-blue">
            <IonIcon icon={addCircleOutline} className="bm-icon" />
            Crear Batalla
          </button>
        </div>

        <div className="bm-list-section animate-in delay-100">
          <h2>Batallas Activas</h2>
          {rooms.length === 0 ? (
            <div className="bm-empty-state"><p>No hay batallas activas.</p></div>
          ) : (
            <div className="bm-cards-container">
              {rooms.map(room => (
                <div key={room.id} className="bm-card">
                  <div className="bm-card-header">
                    <div>
                      <p className="bm-room-name">{room.name}</p>
                      <p className="bm-room-info">{room.status}</p>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={(e) => handleDeleteRoom(e, room.id)} className="bm-control-btn" style={{background:'#ef4444'}}>
                            <IonIcon icon={trashOutline}/>
                        </button>
                        <button onClick={() => handleOpenBattle(room.id)} className="bm-control-btn">
                            <IonIcon icon={playOutline}/> Controlar
                        </button>
                    </div>
                  </div>
                  <div className="bm-code-box">
                    <p className="bm-code-label">CÓDIGO:</p>
                    <p className="bm-code-text">{room.battleCode}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Crear Batalla */}
      {isCreateBattleModalOpen && (
         <CreateBattleModal
           isOpen={isCreateBattleModalOpen}
           onClose={() => setIsCreateBattleModalOpen(false)}
           onCreate={handleCreateBattle}
           teacherId={teacherId}
           isLoading={isLoading}
         />
      )}

      {/* ActionSheet - Menú de Bancos */}
      <IonActionSheet
        isOpen={showBankOptions}
        onDidDismiss={() => setShowBankOptions(false)}
        header="Gestión de Bancos"
        buttons={[
          {
            text: 'Ver mis bancos de preguntas',
            icon: list,
            handler: goToQuestionBank // <--- Redirige a la pantalla nueva
          },
          {
            text: 'Crear banco de preguntas',
            icon: create,
            handler: goToQuestionBank // <--- Redirige a la misma pantalla (ahí tienes el botón Crear)
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]}
      />
    </div>
  );
};

export default BattleManagerScreen;
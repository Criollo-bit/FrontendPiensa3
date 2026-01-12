import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonActionSheet, IonSpinner } from '@ionic/react';
import { 
  arrowBack, 
  bookOutline, 
  addCircleOutline, 
  playOutline, 
  trashOutline, 
  list, 
  create,
  folderOpenOutline 
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import CreateBattleModal from './CreateBattleModal'; 
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
  
  // 1. CARGA INICIAL CON LIMPIEZA DE FANTASMAS
  const [rooms, setRooms] = useState<BattleRoom[]>(() => {
    try {
      const saved = localStorage.getItem(`battles_${teacherId}`);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      
      // FILTRO ESTRICTO: Solo pasan las salas con ID y Nombre válidos
      const cleanRooms = Array.isArray(parsed) 
        ? parsed.filter((r: any) => r && r.id && r.name && r.battleCode) 
        : [];
      
      // Si encontramos basura, la limpiamos de una vez
      if (cleanRooms.length !== parsed.length) {
         localStorage.setItem(`battles_${teacherId}`, JSON.stringify(cleanRooms));
      }
      
      return cleanRooms;
    } catch (e) {
      return [];
    }
  });
  
  const tempBattleName = useRef<string>('');
  const [isCreateBattleModalOpen, setIsCreateBattleModalOpen] = useState(false);
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Sincronizar cambios con localStorage
  useEffect(() => {
    if (teacherId) {
      localStorage.setItem(`battles_${teacherId}`, JSON.stringify(rooms));
    }
  }, [rooms, teacherId]);

  useEffect(() => {
    const socket = socketService.connectToBattle();
    
    socket.on('room-created', (data: { roomId: string, code?: string, mySubjects?: any[], name?: string }) => {
      if (data.mySubjects) {
        localStorage.setItem(`subjects_${teacherId}`, JSON.stringify(data.mySubjects));
      }
      
      const finalCode = data.code || data.roomId;
      const finalName = data.name || tempBattleName.current || `Batalla ${finalCode}`;
      
      const newRoom: BattleRoom = {
        id: data.roomId,
        name: finalName,
        questionCount: 0, 
        battleCode: finalCode,
        groupCount: 0,
        status: 'waiting'
      };
      
      // Agregamos la nueva sala (el useEffect arriba la guardará automáticamente)
      setRooms(prev => [newRoom, ...prev]);
      
      tempBattleName.current = '';
      setIsLoading(false);
      setIsCreateBattleModalOpen(false); 
      
      // Navegación segura al crear
      setTimeout(() => history.push('/teacher/battle'), 100);
    });

    return () => { socket.off('room-created'); };
  }, [teacherId, history]);

  // --- HANDLERS ---

  const handleCreateBattle = (name: string, qCount: number, gCount: number, qs: any[], sPerGroup: number) => {
      localStorage.removeItem('currentBattleId');
      localStorage.setItem('tempBattleName', name);
      
      const socket = socketService.getBattleSocket();
      if(socket) {
          setIsLoading(true);
          tempBattleName.current = name;
          socket.emit('create-room', { teacherId, name });
          // Esperamos al evento del socket para navegar
      }
  };

  const handleOpenBattle = (battleId: string, battleName: string) => {
    localStorage.setItem('currentBattleId', battleId);
    localStorage.setItem('tempBattleName', battleName);
    history.push(`/teacher/battle`); 
  };

  const handleDeleteRoom = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if(confirm('¿Borrar esta sala de tu lista?')) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  const goToQuestionBank = () => {
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
          <button onClick={() => setShowBankOptions(true)} className="bm-action-btn btn-green">
            <IonIcon icon={bookOutline} className="bm-icon" />
            Banco de Preguntas
          </button>
          
          <button onClick={() => setIsCreateBattleModalOpen(true)} className="bm-action-btn btn-blue">
            <IonIcon icon={addCircleOutline} className="bm-icon" />
            Crear Batalla
          </button>
        </div>

        <div className="bm-list-section animate-in delay-100">
          <h2>Batallas Activas</h2>
          
          {rooms.length === 0 ? (
            <div className="bm-empty-state-pro">
               <div className="empty-icon-circle">
                  <IonIcon icon={folderOpenOutline} />
               </div>
               <h3>Todavía no tienes batallas</h3>
               <p>Crea una nueva sala para comenzar a jugar con tus estudiantes.</p>
            </div>
          ) : (
            <div className="bm-cards-container">
              {rooms.map(room => (
                <div key={room.id} className="bm-card">
                  <div className="bm-card-header">
                    <div>
                      <p className="bm-room-name">{room.name}</p>
                      <p className="bm-room-info">
                        {room.status === 'waiting' ? 'Esperando...' : 'En curso'}
                      </p>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={(e) => handleDeleteRoom(e, room.id)} className="bm-control-btn" style={{background:'#ef4444'}}>
                            <IonIcon icon={trashOutline}/>
                        </button>
                        <button onClick={() => handleOpenBattle(room.id, room.name)} className="bm-control-btn">
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
      
      {isCreateBattleModalOpen && (
         <CreateBattleModal
           isOpen={isCreateBattleModalOpen}
           onClose={() => setIsCreateBattleModalOpen(false)}
           onCreate={handleCreateBattle}
           teacherId={teacherId}
           isLoading={isLoading}
         />
      )}

      {isLoading && (
        <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(255,255,255,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <IonSpinner name="crescent" color="primary"/>
        </div>
      )}

      <IonActionSheet
        isOpen={showBankOptions}
        onDidDismiss={() => setShowBankOptions(false)}
        header="Gestión de Bancos"
        buttons={[
          { text: 'Ver mis bancos de preguntas', icon: list, handler: goToQuestionBank },
          { text: 'Crear banco de preguntas', icon: create, handler: goToQuestionBank },
          { text: 'Cancelar', role: 'cancel' }
        ]}
      />
    </div>
  );
};

export default BattleManagerScreen;
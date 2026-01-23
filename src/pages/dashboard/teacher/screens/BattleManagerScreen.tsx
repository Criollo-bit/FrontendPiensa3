import React, { useState, useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonActionSheet, IonSpinner } from '@ionic/react';
import { 
  arrowBack, bookOutline, addCircleOutline, playOutline, trashOutline, list, create, folderOpenOutline 
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
  // 👇 NUEVA PROP: Para navegar al banco
  onOpenBank: () => void;
}

const BattleManagerScreen: React.FC<BattleManagerScreenProps> = ({ teacherId, onBack, onOpenBank }) => { 
  const history = useHistory();
  
  // Carga segura
  const [rooms, setRooms] = useState<BattleRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
      try {
          const saved = localStorage.getItem(`battles_${teacherId}`);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) {
                  setRooms(parsed.filter((r: any) => r && r.id));
              }
          }
      } catch (e) {
          console.error("Error cargando salas", e);
      } finally {
          setLoadingRooms(false);
      }
  }, [teacherId]);
  
  const tempBattleName = useRef<string>('');
  const [isCreateBattleModalOpen, setIsCreateBattleModalOpen] = useState(false);
  const [showBankOptions, setShowBankOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loadingRooms && teacherId) {
      localStorage.setItem(`battles_${teacherId}`, JSON.stringify(rooms));
    }
  }, [rooms, teacherId, loadingRooms]);

  useEffect(() => {
    const socket = socketService.connectToBattle();
    
    const handleRoomCreated = (data: { roomId: string, code?: string, mySubjects?: any[], name?: string }) => {
      if (data.mySubjects) localStorage.setItem(`subjects_${teacherId}`, JSON.stringify(data.mySubjects));
      
      const finalCode = data.code || data.roomId;
      const finalName = data.name || tempBattleName.current || `Batalla ${finalCode}`;
      
      const newRoom: BattleRoom = {
        id: data.roomId, name: finalName, questionCount: 0, battleCode: finalCode, groupCount: 0, status: 'waiting'
      };
      
      setRooms(prev => [newRoom, ...prev]);
      tempBattleName.current = '';
      setIsLoading(false);
      setIsCreateBattleModalOpen(false); 
      // Aquí podrías navegar a la sala creada si tienes la ruta configurada
      // history.push('/teacher/battle'); 
    };

    socket.on('room-created', handleRoomCreated);
    return () => { socket.off('room-created', handleRoomCreated); };
  }, [teacherId, history]);

  const handleCreateBattle = (name: string) => {
      localStorage.removeItem('currentBattleId');
      localStorage.setItem('tempBattleName', name);
      const socket = socketService.getBattleSocket();
      if(socket) {
          setIsLoading(true);
          tempBattleName.current = name;
          socket.emit('create-room', { teacherId, name });
      }
  };

  const handleOpenBattle = (battleId: string, battleName: string) => {
    localStorage.setItem('currentBattleId', battleId);
    localStorage.setItem('tempBattleName', battleName);
    // Asumiendo que esta ruta existe en tu App.tsx principal
    history.push(`/teacher/battle`); 
  };

  const handleDeleteRoom = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if(confirm('¿Borrar esta sala de la lista?')) {
        setRooms(prev => prev.filter(r => r.id !== roomId));
    }
  };

  if (loadingRooms) return <div style={{padding:50, textAlign:'center'}}><IonSpinner/></div>;

  return (
    <div className="bm-screen">
      <button onClick={onBack} className="bm-back-btn"><IonIcon icon={arrowBack} /></button>
      
      <div className="bm-content">
        <div className="bm-header">
          <h1>Gestor de Batallas</h1>
          <p>Crea y administra las batallas para tus clases.</p>
        </div>

        <div className="bm-actions-grid">
          {/* 👇 CORRECCIÓN: Usamos onOpenBank en lugar del history.push indirecto */}
          <button onClick={() => setShowBankOptions(true)} className="bm-action-btn btn-green">
            <IonIcon icon={bookOutline} className="bm-icon" /> Banco de Preguntas
          </button>
          <button onClick={() => setIsCreateBattleModalOpen(true)} className="bm-action-btn btn-blue">
            <IonIcon icon={addCircleOutline} className="bm-icon" /> Crear Batalla
          </button>
        </div>

        <div className="bm-list-section">
          <h2>Batallas Activas</h2>
          {rooms.length === 0 ? (
            <div className="bm-empty-state-pro">
               <div className="empty-icon-circle"><IonIcon icon={folderOpenOutline} /></div>
               <h3>Todavía no tienes batallas</h3>
               <p>Crea una nueva sala para comenzar.</p>
            </div>
          ) : (
            <div className="bm-cards-container">
              {rooms.map(room => (
                <div key={room.id} className="bm-card">
                  <div className="bm-card-header">
                    <div>
                      <p className="bm-room-name">{room.name}</p>
                      <p className="bm-room-info">{room.status === 'waiting' ? 'Esperando...' : 'En curso'}</p>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                        <button onClick={(e) => handleDeleteRoom(e, room.id)} className="bm-control-btn" style={{background:'#ef4444'}}><IonIcon icon={trashOutline}/></button>
                        <button onClick={() => handleOpenBattle(room.id, room.name)} className="bm-control-btn"><IonIcon icon={playOutline}/> Controlar</button>
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
         <CreateBattleModal isOpen={isCreateBattleModalOpen} onClose={() => setIsCreateBattleModalOpen(false)} onCreate={handleCreateBattle} teacherId={teacherId} isLoading={isLoading} />
      )}

      {isLoading && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
            <IonSpinner name="crescent" color="primary"/>
            <p style={{marginTop: 10, color: '#64748b', fontWeight: 600}}>Creando sala...</p>
        </div>
      )}

      {/* Menú de opciones de Banco */}
      <IonActionSheet 
        isOpen={showBankOptions} 
        onDidDismiss={() => setShowBankOptions(false)} 
        header="Gestión de Bancos" 
        buttons={[
          { 
            text: 'Ver mis bancos', 
            icon: list, 
            handler: onOpenBank // 🟢 Usamos la prop aquí
          }, 
          { 
            text: 'Crear banco', 
            icon: create, 
            handler: onOpenBank // 🟢 Y aquí también
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
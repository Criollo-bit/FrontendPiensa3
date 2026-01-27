import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner, IonToast, IonAlert } from '@ionic/react';
import { 
  arrowBackOutline, 
  giftOutline, 
  addCircleOutline, 
  closeOutline, 
  star, 
  trashOutline,
  checkmarkCircleOutline, 
  closeCircleOutline,     
  timeOutline             
} from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import './RewardsManagementScreen.css';

interface Subject {
  id: string;
  name: string;
  cycle?: string; // 🔥 Importante para filtrar
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  cost: number;
  isActive: boolean;
  subject?: { name: string };
}

interface RedemptionRequest {
  id: string;
  status: string;
  student: { fullName: string; studentCode: string };
  reward: { name: string; cost: number; subject: { name: string } };
}

interface RewardsManagementScreenProps {
  teacherId: string;
  onBack: () => void;
}

const RewardsManagementScreen: React.FC<RewardsManagementScreenProps> = ({ teacherId, onBack }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pendingRequests, setPendingRequests] = useState<RedemptionRequest[]>([]); 
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // 🔥 Estado para el Alert de eliminación profesional
  const [deleteAlert, setDeleteAlert] = useState<{isOpen: boolean, rewardId: string | null}>({
    isOpen: false,
    rewardId: null
  });

  const [isCreating, setIsCreating] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    points_required: 100,
    subjectId: ''
  });

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, rewardsRes, pendingRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/rewards/teacher'),
        api.get('/rewards/teacher/pending') 
      ]);

      // 🔥 FILTRO: Solo materias reales, excluimos bancos de preguntas (cycle === 'BANK')
      const realSubjects = subjectsRes.data.filter((s: Subject) => s.cycle !== 'BANK');
      
      setSubjects(realSubjects);
      setRewards(rewardsRes.data);
      setPendingRequests(pendingRes.data);
      
      if (realSubjects.length > 0 && !newReward.subjectId) {
          setNewReward(prev => ({ ...prev, subjectId: realSubjects[0].id }));
      }
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/rewards/teacher/handle-request/${requestId}`, { status });
      setToastMsg(status === 'APPROVED' ? 'Premio aprobado correctamente' : 'Canje rechazado');
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error("Error al procesar", error);
      setToastMsg("Error al procesar la solicitud.");
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.title.trim() || !newReward.subjectId) {
      setToastMsg('Título y Materia son requeridos');
      return;
    }

    try {
      await api.post('/rewards', {
        name: newReward.title,
        description: newReward.description,
        cost: newReward.points_required,
        subjectId: newReward.subjectId
      });
      
      setNewReward({ 
        title: '', 
        description: '', 
        points_required: 100, 
        subjectId: subjects[0]?.id || '' 
      });
      setIsCreating(false);
      loadData(); 
      setToastMsg('Recompensa creada con éxito');
    } catch (error) {
      console.error('Error creando recompensa:', error);
      setToastMsg('Error al crear. Verifica tus materias.');
    }
  };

  const handleToggleActive = async (rewardId: string, currentStatus: boolean) => {
    try {
        setRewards(prev => prev.map(r => r.id === rewardId ? {...r, isActive: !currentStatus} : r));
        await api.patch(`/rewards/${rewardId}`, { isActive: !currentStatus });
    } catch (error) {
        console.error("Error actualizando estado", error);
        loadData(); 
    }
  };

  const confirmDeleteReward = async () => {
    if (!deleteAlert.rewardId) return;
    try {
        await api.delete(`/rewards/${deleteAlert.rewardId}`);
        setRewards(prev => prev.filter(r => r.id !== deleteAlert.rewardId));
        setToastMsg('Recompensa eliminada');
    } catch (error) {
        console.error("Error eliminando", error);
        setToastMsg('No se pudo eliminar la recompensa');
    } finally {
        setDeleteAlert({ isOpen: false, rewardId: null });
    }
  };

  if (loading) return <div className="flex-center-full"><IonSpinner name="crescent"/></div>;

  return (
    <div className="rewards-page">
      <div className="rewards-container-limit">
        
        <div className="header-nav">
          <button onClick={onBack} className="back-button">
            <div className="icon-circle">
                 <IonIcon icon={arrowBackOutline} />
            </div>
            <span>Volver</span>
          </button>
        </div>

        {pendingRequests.length > 0 && (
          <div className="pending-rewards-section">
            <h2 className="pending-title">
              <IonIcon icon={timeOutline} /> Premios por Aprobar
            </h2>
            <div className="pending-list">
              {pendingRequests.map(req => (
                <div key={req.id} className="pending-card">
                  <div className="pending-info">
                    <h3>{req.student.fullName}</h3>
                    <p className="p-reward-name">{req.reward.name}</p>
                    <span className="p-subject">{req.reward.subject.name} • {req.reward.cost} pts</span>
                  </div>
                  <div className="pending-actions">
                    <button className="p-btn approve" onClick={() => handleRequest(req.id, 'APPROVED')}>
                      <IonIcon icon={checkmarkCircleOutline} />
                    </button>
                    <button className="p-btn reject" onClick={() => handleRequest(req.id, 'REJECTED')}>
                      <IonIcon icon={closeCircleOutline} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="page-header-card">
          <h1 className="page-title">
             Gestión de Premios
          </h1>
          <p className="page-subtitle">
            Crea recompensas que tus estudiantes pueden canjear con sus puntos.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-create-toggle ${isCreating ? 'cancel' : 'create'}`}
        >
          <IonIcon icon={isCreating ? closeOutline : addCircleOutline} style={{fontSize: '1.5rem'}} />
          {isCreating ? 'Cancelar Creación' : 'Crear Nueva Recompensa'}
        </button>

        {isCreating && (
          <div className="create-form-card">
            <h2 style={{marginTop:0, color:'#1e293b'}}>Configurar Premio</h2>
            <div className="form-group">
                <label className="form-label">Asignar a la materia</label>
                {subjects.length > 0 ? (
                <select 
                    value={newReward.subjectId}
                    onChange={(e) => setNewReward({...newReward, subjectId: e.target.value})}
                    className="form-select"
                >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                ) : (
                <p style={{color:'red'}}>⚠️ Crea una materia primero.</p>
                )}
            </div>
            <div className="form-group">
                <label className="form-label">Título</label>
                <input
                    type="text"
                    value={newReward.title}
                    onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                    placeholder="Ej: +1 Punto en Examen"
                    className="form-input"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Descripción (Opcional)</label>
                <textarea
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    placeholder="Detalles sobre cómo funciona..."
                    rows={2}
                    className="form-textarea"
                />
            </div>
            <div className="form-group">
                <label className="form-label">Costo en Puntos</label>
                <input
                    type="number"
                    /* 🔥 FIX: Evita que el '0' se muestre al borrar o escribir */
                    value={newReward.points_required === 0 ? '' : newReward.points_required}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewReward({ 
                        ...newReward, 
                        points_required: val === '' ? 0 : parseInt(val, 10) 
                      });
                    }}
                    placeholder="Ej: 100"
                    min="1"
                    className="form-input"
                />
            </div>
            <button onClick={handleCreateReward} disabled={subjects.length === 0} className="btn-submit">
                Guardar Recompensa
            </button>
          </div>
        )}

        <div className="rewards-list">
          {rewards.length === 0 && !loading ? (
            <div className="empty-state">
              <IonIcon icon={giftOutline} style={{fontSize:'4rem', color:'#cbd5e1', marginBottom:'1rem'}} />
              <p style={{color:'#64748b'}}>No has creado recompensas todavía.</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <div key={reward.id} className={`reward-card ${!reward.isActive ? 'inactive' : ''}`}>
                <div className="rc-header">
                    <span className="rc-subject-badge">{reward.subject?.name || 'GENERAL'}</span>
                    {!reward.isActive && <span className="rc-status-badge">INACTIVO</span>}
                </div>
                <div className="rc-body">
                    <h3 className="rc-title">{reward.name}</h3>
                    <p className="rc-desc">{reward.description || "Sin descripción adicional."}</p>
                </div>
                <div className="rc-points-hero">
                    <IonIcon icon={star} className="rc-star-icon" />
                    <span className="rc-points-value">{reward.cost}</span>
                    <span className="rc-points-label">PTS</span>
                </div>
                <div className="rc-actions">
                    <button onClick={() => handleToggleActive(reward.id, reward.isActive)} className={`rc-btn ${reward.isActive ? 'btn-disable' : 'btn-enable'}`}>
                      {reward.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => setDeleteAlert({ isOpen: true, rewardId: reward.id })} className="rc-btn btn-delete">
                      <IonIcon icon={trashOutline} />
                    </button> 
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <IonToast 
        isOpen={!!toastMsg} 
        message={toastMsg || ''} 
        duration={2000} 
        color="dark" 
        onDidDismiss={() => setToastMsg(null)} 
      />

      <IonAlert
        isOpen={deleteAlert.isOpen}
        header={'¿Eliminar Recompensa?'}
        message={'Esta acción no se puede deshacer. Los estudiantes ya no podrán canjear este premio.'}
        buttons={[
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => setDeleteAlert({ isOpen: false, rewardId: null })
          },
          {
            text: 'Eliminar',
            role: 'destructive',
            handler: confirmDeleteReward
          }
        ]}
        onDidDismiss={() => setDeleteAlert({ isOpen: false, rewardId: null })}
      />
    </div>
  );
};

export default RewardsManagementScreen;
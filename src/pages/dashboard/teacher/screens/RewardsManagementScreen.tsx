import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { 
  arrowBackOutline, 
  giftOutline, 
  addCircleOutline, 
  closeOutline, 
  star, 
  trashOutline 
} from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import './RewardsManagementScreen.css';

interface Subject {
  id: string;
  name: string;
}

interface Reward {
  id: string;
  name: string;
  description?: string;
  cost: number;
  isActive: boolean;
  subject?: { name: string };
}

interface RewardsManagementScreenProps {
  teacherId: string;
  onBack: () => void;
}

const RewardsManagementScreen: React.FC<RewardsManagementScreenProps> = ({ teacherId, onBack }) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      const subjectsRes = await api.get('/subjects'); 
      setSubjects(subjectsRes.data);
      
      if (subjectsRes.data.length > 0) {
          setNewReward(prev => ({ ...prev, subjectId: subjectsRes.data[0].id }));
      }

      const rewardsRes = await api.get('/rewards/teacher');
      setRewards(rewardsRes.data);
    } catch (error) {
      console.error("Error cargando datos", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async () => {
    if (!newReward.title.trim() || !newReward.subjectId) {
      alert('Título y Materia son requeridos');
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
    } catch (error) {
      console.error('Error creando recompensa:', error);
      alert('Error al crear. Verifica que tengas materias creadas.');
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

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm('¿Eliminar esta recompensa?')) return;
    try {
        await api.delete(`/rewards/${rewardId}`);
        setRewards(prev => prev.filter(r => r.id !== rewardId));
    } catch (error) {
        console.error("Error eliminando", error);
    }
  };

  if (loading) return <div className="flex-center-full"><IonSpinner name="crescent"/></div>;

  return (
    <div className="rewards-page">
      <div className="rewards-container-limit">
        
        {/* Header con Botón Volver */}
        <div className="header-nav">
          <button onClick={onBack} className="back-button">
            <div className="icon-circle">
                 <IonIcon icon={arrowBackOutline} />
            </div>
            <span>Volver</span>
          </button>
        </div>

        {/* Título Principal */}
        <div className="page-header-card">
          <h1 className="page-title">
            <span role="img" aria-label="gift">🎁</span> Gestión de Premios
          </h1>
          <p className="page-subtitle">
            Crea recompensas que tus estudiantes pueden canjear con sus puntos.
          </p>
        </div>

        {/* Botón Grande: Crear Nueva Recompensa */}
        <button
          onClick={() => setIsCreating(!isCreating)}
          className={`btn-create-toggle ${isCreating ? 'cancel' : 'create'}`}
        >
          <IonIcon icon={isCreating ? closeOutline : addCircleOutline} style={{fontSize: '1.5rem'}} />
          {isCreating ? 'Cancelar Creación' : 'Crear Nueva Recompensa'}
        </button>

        {/* Formulario de Creación */}
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
                    placeholder="Ej: Eliminar una tarea"
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
                    value={newReward.points_required}
                    onChange={(e) => setNewReward({ ...newReward, points_required: parseInt(e.target.value) || 0 })}
                    min="1"
                    className="form-input"
                />
            </div>

            <button
                onClick={handleCreateReward}
                disabled={subjects.length === 0}
                className="btn-submit"
            >
                Guardar Recompensa
            </button>
          </div>
        )}

        {/* Lista de Premios */}
        <div className="rewards-list">
          {rewards.length === 0 && !loading ? (
            <div className="empty-state">
              <IonIcon icon={giftOutline} style={{fontSize:'4rem', color:'#cbd5e1', marginBottom:'1rem'}} />
              <p style={{color:'#64748b'}}>No has creado recompensas todavía.</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <div
                key={reward.id}
                className={`reward-card ${!reward.isActive ? 'inactive' : ''}`}
              >
                <div className="reward-content">
                  <div className="reward-info">
                    <div className="reward-header">
                      <span className="subject-tag">
                        {reward.subject?.name || 'Materia'}
                      </span>
                      <h3 className="reward-title">{reward.name}</h3>
                      {!reward.isActive && (
                        <span className="status-badge">INACTIVO</span>
                      )}
                    </div>
                    
                    <p className="reward-desc">
                      {reward.description || "Sin descripción."}
                    </p>
                    
                    <div className="points-pill">
                      <IonIcon icon={star} />
                      <span>{reward.cost} pts</span>
                    </div>
                  </div>

                  <div className="reward-actions">
                    <button
                      onClick={() => handleToggleActive(reward.id, reward.isActive)}
                      className={`btn-action btn-toggle ${reward.isActive ? 'is-active' : ''}`}
                    >
                      {reward.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => handleDeleteReward(reward.id)}
                      className="btn-action btn-delete"
                    >
                      <IonIcon icon={trashOutline} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardsManagementScreen;
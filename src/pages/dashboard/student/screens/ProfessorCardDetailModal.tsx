import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { closeOutline, arrowBackOutline, star, giftOutline, checkmarkCircle } from 'ionicons/icons';
import { api } from '../../../../api/axios'; 

interface Reward {
  id: string;
  name: string; // Backend usa 'name', frontend viejo usaba 'title'
  description?: string; // Backend podría no tenerlo, lo hacemos opcional
  cost: number; // Backend usa 'cost'
}

interface ProfessorCardDetailModalProps {
  teacherId: string | number; // ID del profesor
  professorName: string;
  currentPoints: number;
  professorImageUrl?: string;
  onClose: () => void;
  onRedeem: () => void; // Callback para recargar puntos
}

const ProfessorCardDetailModal: React.FC<ProfessorCardDetailModalProps> = ({
  teacherId,
  professorName,
  currentPoints,
  professorImageUrl,
  onClose,
  onRedeem,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    loadRewards();
  }, [teacherId]);

  const loadRewards = async () => {
    try {
      // AQUÍ LLAMAMOS A TU BACKEND REAL
      // Asegúrate de tener este endpoint: GET /rewards/teacher/:teacherId
      const { data } = await api.get(`/rewards/teacher/${teacherId}`);
      setRewards(data);
    } catch (error) {
      console.error("Error cargando premios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (currentPoints < reward.cost) {
      alert('No tienes suficientes puntos');
      return;
    }

    if (!window.confirm(`¿Canjear "${reward.name}" por ${reward.cost} puntos?`)) return;

    setIsRedeeming(true);
    try {
      // Endpoint para canjear: POST /redemptions
      await api.post('/redemptions', {
        rewardId: reward.id,
      });

      alert('¡Solicitud enviada! El profesor debe aprobarla.');
      onRedeem(); // Recargar puntos en el dashboard
      onClose();  // Cerrar modal
    } catch (error) {
      console.error('Error canjeando:', error);
      alert('Error al canjear la recompensa.');
    } finally {
      setIsRedeeming(false);
    }
  };

  // --- VISTA PREVIA (CARTA EN GRANDE) ---
  if (!showRewards) {
    return (
      <div className="fixed-modal-overlay">
        <div className="modal-card-container">
           {/* Botón Cerrar */}
           <button onClick={onClose} className="modal-close-btn">
             <IonIcon icon={closeOutline} />
           </button>

           <div className="modal-image-wrapper">
             <img src={professorImageUrl} alt={professorName} className="modal-hero-image" />
             <div className="modal-image-gradient"></div>
             
             <div className="modal-hero-text">
               <div className="flex items-center gap-2">
                 <h2>{professorName}</h2>
                 <IonIcon icon={checkmarkCircle} style={{ color: '#60a5fa' }} />
               </div>
               <p>Profesor</p>
             </div>
           </div>

           <div className="modal-content-body">
              <div className="stats-row">
                 <div className="stat-item">
                    <span className="stat-value">{currentPoints}</span>
                    <span className="stat-label">Mis Puntos</span>
                 </div>
                 <div className="stat-item">
                    <span className="stat-value">{rewards.length}</span>
                    <span className="stat-label">Premios</span>
                 </div>
              </div>

              <button 
                className="btn-main-action"
                onClick={() => setShowRewards(true)}
              >
                <IonIcon icon={giftOutline} /> Ver Recompensas
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- VISTA DE LISTA DE PREMIOS ---
  return (
    <div className="fixed-modal-overlay">
      <div className="modal-card-container full-height">
         <div className="modal-header-rewards">
            <button onClick={() => setShowRewards(false)} className="header-icon-btn">
               <IonIcon icon={arrowBackOutline} />
            </button>
            <h3>Recompensas</h3>
            <div className="header-points">
               <IonIcon icon={star} /> {currentPoints} pts
            </div>
         </div>

         <div className="rewards-list">
            {loading ? (
               <div className="spinner-container"><IonSpinner /></div>
            ) : rewards.length === 0 ? (
               <div className="empty-state">
                  <IonIcon icon={giftOutline} />
                  <p>No hay recompensas disponibles.</p>
               </div>
            ) : (
               rewards.map(reward => {
                  const canAfford = currentPoints >= reward.cost;
                  return (
                    <div key={reward.id} className={`reward-item ${canAfford ? 'affordable' : 'expensive'}`}>
                       <div className="reward-info">
                          <h4>{reward.name}</h4>
                          <span className="reward-cost">{reward.cost} pts</span>
                       </div>
                       <button 
                         className="btn-redeem"
                         disabled={!canAfford || isRedeeming}
                         onClick={() => handleRedeemReward(reward)}
                       >
                         {canAfford ? 'Canjear' : 'Faltan pts'}
                       </button>
                    </div>
                  );
               })
            )}
         </div>
      </div>
    </div>
  );
};

export default ProfessorCardDetailModal;
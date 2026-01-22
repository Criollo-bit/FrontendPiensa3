import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonButton, IonIcon, IonSpinner, IonHeader, IonToolbar, IonButtons, IonTitle, IonToast, IonModal, IonActionSheet, IonAlert,
  IonRefresher, IonRefresherContent // 🔥 Importamos Refresher
} from '@ionic/react';
import { 
  arrowBack, giftOutline, walletOutline, closeCircleOutline, ellipsisVertical, trashOutline 
} from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { api } from '../../../../api/axios'; 
import './StudentClassDetailScreen.css';

const StudentClassDetailScreen: React.FC = () => {
  const history = useHistory();
  const { subjectId } = useParams<{ subjectId: string }>(); 

  const [enrollment, setEnrollment] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modales
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorConfig, setErrorConfig] = useState({ title: '', msg: '' });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Salir de clase
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showLeaveAlert, setShowLeaveAlert] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [subjectId]);

  const loadClassData = async () => {
    // 🔥 Nota: No ponemos setLoading(true) aquí para que el refresh sea suave
    try {
      const { data: allEnrollments } = await api.get('/enrollments/my-subjects');
      const current = allEnrollments.find((e: any) => e.subject.id === subjectId);
      
      if (current) {
        setEnrollment(current);
        // Cargar premios
        try {
            const rewardsRes = await api.get(`/rewards/subject/${subjectId}`);
            setRewards(rewardsRes.data.filter((r: any) => r.isActive));
        } catch (err) {
            console.warn("Error cargando premios");
            setRewards([]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIÓN DE REFRESCO MANUAL
  const handleRefresh = async (event: any) => {
    await loadClassData();
    event.detail.complete();
  };

  const handleClickRedeem = (reward: any) => {
      const currentPoints = enrollment?.accumulatedPoints || 0;
      if (currentPoints < reward.cost) {
          setErrorConfig({
              title: '¡Ups! Te faltan puntos',
              msg: `Necesitas ${reward.cost} puntos para este premio.`
          });
          setShowErrorModal(true);
          return;
      }
      setSelectedReward(reward);
      setShowConfirmModal(true);
  };

  const confirmRedemption = async () => {
    if (!selectedReward || !enrollment) return;
    try {
        await api.post('/rewards/redeem', { rewardId: selectedReward.id });
        setShowConfirmModal(false);
        setToastMsg("¡Canje exitoso! Disfruta tu premio 🎉");
        loadClassData(); // Recargar saldo automáticamente
    } catch (error: any) {
        setShowConfirmModal(false);
        setErrorConfig({
            title: 'Error',
            msg: error.response?.status === 403 ? 'Saldo insuficiente.' : 'Problema de conexión.'
        });
        setShowErrorModal(true);
    }
  };

  const handleLeaveClass = async () => {
      try {
          await api.delete(`/enrollments/leave/${enrollment.subject.id}`);
          history.replace('/home');
          window.location.reload(); 
      } catch (error) {
          setToastMsg("Error al salir de la clase.");
      }
  };

  if (loading && !enrollment) {
      return <IonPage><div className="loading-center"><IonSpinner name="crescent" /></div></IonPage>;
  }

  if (!enrollment && !loading) {
      return (
          <IonPage>
             <IonContent>
                 <div className="error-center">
                     <p>Clase no encontrada.</p>
                     <IonButton onClick={() => history.goBack()}>Volver</IonButton>
                 </div>
             </IonContent>
          </IonPage>
      );
  }

  const currentPoints = enrollment.accumulatedPoints || 0;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()} color="dark">
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{enrollment.subject.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)} color="medium">
                <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="class-detail-content">
        
        {/* 🔥 REFRESHER AQUÍ */}
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent pullingText="Desliza para actualizar saldo" refreshingSpinner="crescent" />
        </IonRefresher>

        {/* TARJETA DE SALDO */}
        <div className="points-hero-card">
            <div className="points-label">TU SALDO ACTUAL</div>
            <div className="points-value">
                <IonIcon icon={walletOutline} />
                <span>{currentPoints}</span>
            </div>
            <p className="teacher-ref">Prof. {enrollment.subject.teacher?.fullName}</p>
        </div>

        {/* PREMIOS */}
        <h2 className="section-header"><IonIcon icon={giftOutline} /> Premios Disponibles</h2>
        <div className="rewards-grid">
            {rewards.length === 0 ? (
                <div className="empty-rewards"><p>El profesor aún no ha publicado premios.</p></div>
            ) : (
                rewards.map(reward => {
                    const canAfford = currentPoints >= reward.cost;
                    return (
                        <div key={reward.id} className={`reward-item-card ${!canAfford ? 'locked' : ''}`}>
                            <div className="reward-info">
                                <h4>{reward.name}</h4>
                                <p className="reward-desc">{reward.description || 'Sin descripción'}</p>
                                <span className={`cost-badge ${canAfford ? 'affordable' : 'expensive'}`}>{reward.cost} pts</span>
                            </div>
                            <IonButton 
                                fill={canAfford ? "solid" : "outline"} 
                                color={canAfford ? "primary" : "medium"}
                                className="redeem-btn"
                                onClick={() => handleClickRedeem(reward)}
                            >
                                {canAfford ? 'Canjear' : 'Bloqueado'}
                            </IonButton>
                        </div>
                    );
                })
            )}
        </div>

        {/* MODALES */}
        <IonModal isOpen={showConfirmModal} onDidDismiss={() => setShowConfirmModal(false)} className="custom-modal-small">
            <div className="modal-content-wrapper">
                <div className="modal-icon-header success"><IonIcon icon={giftOutline} /></div>
                <h2>Confirmar Canje</h2>
                <p>Estás a punto de canjear:</p>
                <div className="reward-preview-box">
                    <h3>{selectedReward?.name}</h3>
                    <span className="pts-tag">-{selectedReward?.cost} pts</span>
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setShowConfirmModal(false)}>Cancelar</button>
                    <button className="btn-confirm" onClick={confirmRedemption}>¡Sí, lo quiero!</button>
                </div>
            </div>
        </IonModal>

        <IonModal isOpen={showErrorModal} onDidDismiss={() => setShowErrorModal(false)} className="custom-modal-small">
            <div className="modal-content-wrapper">
                <div className="modal-icon-header error"><IonIcon icon={closeCircleOutline} /></div>
                <h2>{errorConfig.title}</h2>
                <p className="error-body">{errorConfig.msg}</p>
                <div className="modal-actions single">
                    <button className="btn-cancel full-width" onClick={() => setShowErrorModal(false)}>Entendido</button>
                </div>
            </div>
        </IonModal>

        <IonActionSheet
            isOpen={showActionSheet}
            onDidDismiss={() => setShowActionSheet(false)}
            header="Opciones de la Clase"
            buttons={[
                { text: 'Salir de la clase', role: 'destructive', icon: trashOutline, handler: () => setShowLeaveAlert(true) },
                { text: 'Cancelar', role: 'cancel', icon: closeCircleOutline }
            ]}
        />

        <IonAlert
            isOpen={showLeaveAlert}
            onDidDismiss={() => setShowLeaveAlert(false)}
            header={'¿Salir de esta clase?'}
            message={'Si sales ahora, perderás todos tus puntos acumulados en esta materia.'}
            buttons={[
                { text: 'Cancelar', role: 'cancel' },
                { text: 'Sí, Salir', handler: handleLeaveClass, cssClass: 'alert-danger-button' }
            ]}
        />

        <IonToast isOpen={!!toastMsg} message={toastMsg || ''} duration={2500} color="success" position="top" onDidDismiss={() => setToastMsg(null)} />
      </IonContent>
    </IonPage>
  );
};

export default StudentClassDetailScreen;
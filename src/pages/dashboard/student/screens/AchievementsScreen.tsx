import React, { useState, useEffect } from 'react';
import { 
  IonContent, IonPage, IonIcon, IonSpinner, IonButton 
} from '@ionic/react';
import { 
  trophy, ribbon, checkmarkCircle, lockClosed, close, 
  star, flash, flame, book, shieldCheckmark, 
  bulb, videocam 
} from 'ionicons/icons';
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios';
import './AchievementsScreen.css';

// Mapeo de strings (DB) a objetos de iconos (Ionic)
const ICON_MAP: { [key: string]: string } = {
  'trophy': trophy,
  'star': star,
  'flash': flash,
  'flame': flame,
  'book': book,
  'shield-checkmark': shieldCheckmark,
  'bulb': bulb,
  'footsteps': videocam, 
  // Agrega más si es necesario
};

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  pointsReward: number; 
  unlocked: boolean;
  unlockedAt?: string;
  unlockCondition?: string;
}

interface AchievementsScreenProps {
  user: User;
  onBack: () => void; // Aunque ya no usamos el botón, mantenemos la prop por compatibilidad si se necesitara
}

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ user }) => {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data } = await api.get('/achievements');
      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.pointsReward, 0);

  const currentLevel = Math.floor(totalPoints / 100) + 1;

  // Función para determinar clases CSS según el tipo de icono
  const getGradientClass = (iconName: string, unlocked: boolean) => {
    if (!unlocked) return 'card-gradient-locked';
    if (iconName.includes('shield')) return 'card-gradient-blue';
    if (iconName.includes('flash')) return 'card-gradient-yellow';
    if (iconName.includes('flame')) return 'card-gradient-red';
    if (iconName.includes('book')) return 'card-gradient-purple';
    return 'card-gradient-teal'; // Default
  };

  return (
    <IonPage className="achievements-page">
      
      {/* HE ELIMINADO EL ION-HEADER AQUÍ PARA QUITAR LA FLECHA Y EL TÍTULO */}

      <IonContent fullscreen className="achievements-content">
        
        {/* Fondo de Partículas (CSS puro) */}
        <div className="particles-bg">
          {[...Array(8)].map((_, i) => <div key={i} className="particle"></div>)}
        </div>

        {/* Sección Perfil Resumido - Añadimos margen superior para el Status Bar */}
        <div className="profile-summary-section" style={{ marginTop: '40px' }}>
          <div className="avatar-glow-wrapper">
            <div className="glow-ring"></div>
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
              alt={user.name} 
              className="user-avatar-circle"
            />
          </div>

          <h1 className="user-name-display">{user.name}</h1>
          <div className="level-badge">
            <IonIcon icon={trophy} />
            <span>Nivel {currentLevel}</span>
          </div>

          {/* Estadísticas */}
          <div className="stats-container">
            <div className="stat-box">
              <div className="stat-value">{unlockedCount}</div>
              <div className="stat-label">Logros</div>
            </div>
            <div className="stat-separator"></div>
            <div className="stat-box">
              <div className="stat-value">{totalPoints}</div>
              <div className="stat-label">Puntos</div>
            </div>
            <div className="stat-separator"></div>
            <div className="stat-box">
              <div className="stat-value">{achievements.length}</div>
              <div className="stat-label">Totales</div>
            </div>
          </div>
        </div>

        {/* Grilla de Logros */}
        <div className="achievements-grid-section">
          <h2 className="section-title">
            <IonIcon icon={ribbon} color="primary" /> Tus Logros
          </h2>

          {loading ? (
             <div className="loading-wrapper"><IonSpinner name="crescent" /></div>
          ) : (
            <div className="achievements-grid">
              {achievements.map((ach) => (
                <div 
                  key={ach.id}
                  className={`achievement-card ${getGradientClass(ach.icon, ach.unlocked)} ${!ach.unlocked ? 'is-locked' : ''}`}
                  onClick={() => setSelectedAchievement(ach)}
                >
                  {/* Brillo en hover */}
                  <div className="shine-effect"></div>
                  
                  <div className="icon-wrapper">
                    <IonIcon icon={ICON_MAP[ach.icon] || trophy} className="main-icon" />
                  </div>
                  
                  <h3 className="achievement-name">{ach.name}</h3>

                  {ach.unlocked ? (
                    <div className="status-badge unlocked">
                      <IonIcon icon={checkmarkCircle} />
                    </div>
                  ) : (
                    <div className="status-overlay locked">
                      <IonIcon icon={lockClosed} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DE DETALLE (Overlay Personalizado) */}
        {selectedAchievement && (
          <div className="modal-overlay" onClick={() => setSelectedAchievement(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setSelectedAchievement(null)}>
                <IonIcon icon={close} />
              </button>

              <div className={`modal-header ${getGradientClass(selectedAchievement.icon, selectedAchievement.unlocked)}`}>
                <div className="modal-icon-lg">
                  <IonIcon icon={ICON_MAP[selectedAchievement.icon] || trophy} />
                </div>
                <h2>{selectedAchievement.name}</h2>
                <p>{selectedAchievement.description}</p>
              </div>

              <div className="modal-body">
                {selectedAchievement.unlocked ? (
                  <div className="unlocked-content">
                    <div className="info-row success-bg">
                       <IonIcon icon={checkmarkCircle} className="success-icon" />
                       <div>
                         <strong>¡Logro Desbloqueado!</strong>
                         <span className="date-text">
                           {selectedAchievement.unlockedAt 
                             ? new Date(selectedAchievement.unlockedAt).toLocaleDateString() 
                             : 'Recientemente'}
                         </span>
                       </div>
                    </div>
                    <div className="points-display">
                      <IonIcon icon={star} color="warning" />
                      <span>+{selectedAchievement.pointsReward} Puntos</span>
                    </div>
                  </div>
                ) : (
                  <div className="locked-content">
                    <div className="lock-circle">
                      <IonIcon icon={lockClosed} />
                    </div>
                    <h3>Logro Bloqueado</h3>
                    <p className="condition-text">{selectedAchievement.unlockCondition || 'Sigue jugando para descubrirlo.'}</p>
                    <div className="points-pill">
                      <IonIcon icon={star} />
                      <span>+{selectedAchievement.pointsReward} al desbloquear</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default AchievementsScreen;
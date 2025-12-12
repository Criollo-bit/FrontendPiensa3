import React, { useState, useEffect } from 'react';
import { IonIcon, IonSpinner, IonToast } from '@ionic/react';
import { 
  schoolOutline, book, bulb, calendar, card, informationCircle 
} from 'ionicons/icons';

// Tipos e Importaciones
import { User } from '../../../../AppTypes';
// Importamos la API configurada
import { api } from '../../../../api/axios'; 
import EditTeacherProfileModal, { EditableUser } from './EditTeacherProfileModal';
import './TeacherProfileScreen.css';

interface TeacherProfileScreenProps {
  user: User; // Usuario base que viene del login
  onLogout: () => void;
}

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout }) => {
  
  // --- ESTADOS ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  // Estado del perfil completo (extendido)
  const [profileData, setProfileData] = useState<EditableUser>({
    ...user,
    // Valores por defecto visuales (Mock UI)
    subjects: ['Matemáticas', 'Física'], 
    skills: ['Gamificación', 'Liderazgo'],
    cycles: ['2025-A'],
    bio: '',
    avatarUrl: ''
  });

  const [unlockPoints, setUnlockPoints] = useState(100);
  const [isEditingPoints, setIsEditingPoints] = useState(false);

  // --- EFECTOS ---

  // Cargar perfil real al montar
  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // --- FUNCIONES API ---

  const loadUserProfile = async () => {
    try {
      // GET /users/me
      const response = await api.get('/users/me');
      const backendUser = response.data;

      // Actualizamos el estado mezclando los datos reales con los visuales
      setProfileData(prev => ({
        ...prev,
        name: backendUser.fullName, // Mapeamos fullName (DB) a name (UI)
        email: backendUser.email,
        bio: backendUser.bio,
        avatarUrl: backendUser.avatarUrl,
        id: backendUser.id
      }));

    } catch (error) {
      console.error('Error cargando perfil:', error);
      // No mostramos error invasivo aquí, solo en consola, para no bloquear la UI
    }
  };

  const handleSaveProfile = async (updatedData: { fullName: string; bio: string; avatarUrl: string }) => {
    setIsLoading(true);
    try {
      // PATCH /users/me
      const response = await api.patch('/users/me', updatedData);
      const updatedUser = response.data;

      // Actualizamos UI
      setProfileData(prev => ({
        ...prev,
        name: updatedUser.fullName,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      }));
      
      setIsEditModalOpen(false);
      setErrorMsg(null); // Limpiar errores si hubo

    } catch (error) {
      console.error('Error guardando perfil:', error);
      setErrorMsg('Error al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUnlockPoints = () => {
    // TODO: Conectar esto cuando tengamos una tabla de configuración de docente
    setIsEditingPoints(false);
  };

  // --- RENDER ---

  // Usamos una imagen por defecto si no hay avatarUrl
  const displayImage = profileData.avatarUrl || profileData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`;

  return (
    <div className="profile-screen-container">
      {/* Contenido Principal con Scroll */}
      <main
        className="profile-content"
        onScroll={handleScroll}
      >
        {/* --- HERO SECTION --- */}
        <div style={{ marginBottom: '1rem' }}>
          <div className="hero-image-container">
            <img
              src={displayImage}
              alt={profileData.name}
              className="hero-image"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.5, 100)}px) scale(${1 + Math.min(scrollY * 0.001, 0.3)})`
              }}
              // 🔥 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 🔥
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Si la imagen falla (link roto), ponemos una por defecto
                if (!target.src.includes('dicebear.com')) {
                   target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`;
                }
              }}
            />
          </div>

          {/* --- TARJETA PRINCIPAL --- */}
          <div className="profile-main-card">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-role">
              <IonIcon icon={schoolOutline} />
              Docente
            </p>
            
            {/* Mostrar Bio si existe */}
            {profileData.bio && (
                <p style={{fontSize: '0.9rem', color: '#475569', margin: '10px 0', fontStyle: 'italic'}}>
                    "{profileData.bio}"
                </p>
            )}

            {/* Estadísticas (Visuales por ahora) */}
            <div className="stats-row">
              <div>
                <div className="stat-number">{profileData.subjects?.length || 0}</div>
                <div className="stat-label">Clases</div>
              </div>
              <div>
                <div className="stat-number">{profileData.skills?.length || 0}</div>
                <div className="stat-label">Habilidades</div>
              </div>
              <div>
                <div className="stat-number">{profileData.cycles?.length || 0}</div>
                <div className="stat-label">Ciclos</div>
              </div>
            </div>

            {/* Botones */}
            <div className="action-buttons-row">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-edit-profile"
              >
                Editar Perfil
              </button>
              <button
                onClick={onLogout}
                className="btn-logout"
              >
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* --- SECCIONES DE INFO --- */}
        <div className="info-section">
          
          {/* Materias (Mock visual) */}
          <div className="glass-card-modern">
            <h3 className="section-title">
              <IonIcon icon={book} style={{ color: '#3b82f6' }} />
              Mis Clases
            </h3>
            <div className="tags-container">
              {profileData.subjects?.map((subject, index) => (
                <span key={index} className="tag-chip tag-blue">
                  {subject}
                </span>
              ))}
            </div>
          </div>

          {/* Configuración de Tarjeta (Mock visual funcional localmente) */}
          <div className="glass-card-modern">
            <h3 className="section-title">
              <IonIcon icon={card} style={{ color: '#f59e0b' }} />
              Configuración de Tarjeta
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                Puntos necesarios para desbloquear tu tarjeta
              </p>

              <div className="config-input-group">
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={unlockPoints}
                  onChange={(e) => setUnlockPoints(Number(e.target.value))}
                  disabled={!isEditingPoints}
                  className="points-input"
                  style={{ opacity: isEditingPoints ? 1 : 0.7, background: isEditingPoints ? 'white' : '#f8fafc' }}
                />

                <div className="action-buttons-row">
                  {isEditingPoints ? (
                    <>
                      <button 
                        onClick={handleSaveUnlockPoints}
                        className="btn-edit-profile" style={{ background: '#22c55e' }}>
                        Guardar
                      </button>
                      <button 
                        onClick={() => { setIsEditingPoints(false); }}
                        className="btn-logout" style={{ border: 'none', background: '#e2e8f0' }}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditingPoints(true)}
                      className="btn-edit-profile">
                      Cambiar Puntos
                    </button>
                  )}
                </div>
              </div>

              <div className="info-box">
                <IonIcon icon={informationCircle} style={{ fontSize: '1.5rem', color: '#d97706' }} />
                <p>
                  Los estudiantes necesitarán <strong>{unlockPoints} puntos</strong> para desbloquear tu carta especial.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* MODAL */}
      <EditTeacherProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profileData}
        onSave={handleSaveProfile}
        isLoading={isLoading}
      />
      
      {/* Toast Error */}
      <IonToast
        isOpen={!!errorMsg}
        message={errorMsg || ''}
        duration={3000}
        color="danger"
        onDidDismiss={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default TeacherProfileScreen;
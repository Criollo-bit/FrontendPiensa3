import React, { useState, useEffect } from 'react';
import { IonIcon, IonToast } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';

// Tipos e Importaciones
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios';
import EditTeacherProfileModal, { EditableUser } from './EditTeacherProfileModal';
import './TeacherProfileScreen.css';

interface TeacherProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout }) => {

  // --- ESTADOS ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
  // Estado del perfil completo
  const [profileData, setProfileData] = useState<EditableUser>({
    ...user,
    // Valores estáticos de ejemplo
    subjects: ['Matemáticas', 'Física'],
    skills: ['Gamificación', 'Liderazgo'],
    cycles: ['2025-A'],
    bio: (user as any).bio || '', 
    // 👇 CORRECCIÓN AQUÍ: Usamos (user as any) para evitar el error de TypeScript
    avatarUrl: (user as any).avatarUrl || user.avatar || '',
    name: user.name || (user as any).fullName || '' 
  });

  // --- EFECTOS ---
  useEffect(() => { 
    loadUserProfile();
  }, []);
 
  // --- FUNCIONES API ---
  const loadUserProfile = async () => { 
    setIsLoading(true);
    try { 
      const response = await api.get('/users/me');
      const backendUser = response.data;
 
      setProfileData(prev => ({
        ...prev,
        name: backendUser.fullName || prev.name,
        email: backendUser.email || prev.email,
        bio: backendUser.bio || prev.bio,
        avatarUrl: backendUser.avatarUrl || prev.avatarUrl,
        id: backendUser.id || prev.id,
      }));
      
      setErrorMsg(null); 
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (updatedData: { fullName: string; bio: string; avatarUrl: string }) => {
    setIsLoading(true);
    try { 
      const response = await api.patch('/users/me', updatedData);
      const updatedUser = response.data;
 
      setProfileData(prev => ({
        ...prev,
        name: updatedUser.fullName,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      }));

      setIsEditModalOpen(false);
      setErrorMsg(null);
    } catch (error) {
      console.error('Error guardando perfil:', error);
      setErrorMsg('Error al guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }; 

  // --- RENDER ---
  
  // Lógica de imagen: Si hay URL úsala, sino genera un avatar con las iniciales
  const displayImage = profileData.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`;

  return (
    <div className="profile-screen-container">
      <main className="profile-content">

        {/* Card de Perfil */}
        <div className="profile-card">

          {/* Header con Gradiente */}
          <div className="profile-header">
            <div className="header-pattern"></div>
          </div>

          {/* Avatar Circular Centrado */}
          <div className="avatar-container">
            <img
              src={displayImage}
              alt={profileData.name}
              className="profile-avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.name}`;
                target.onerror = null; 
              }}
            />
          </div>

          {/* Información del Perfil */}
          <div className="profile-info">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-title">Profesor Certificado</p>
            
            <p className="profile-location">
              <IonIcon icon={locationOutline} />
              Instituto Sudamericano
            </p>

            {/* Botón EDITAR */}
            <button 
              className="btn-follow" 
              onClick={() => setIsEditModalOpen(true)}
              disabled={isLoading}
            >
              {isLoading ? 'GUARDANDO...' : 'EDITAR PERFIL'}
            </button>

            {/* About Section */}
            <div className="about-section">
              <h3 className="about-title">Acerca de {profileData.name.split(' ')[0]}</h3>
              <p className="about-text">
                {profileData.bio || 'Aún no has escrito tu biografía. ¡Toca "Editar Perfil" para añadir una descripción sobre ti!'}
              </p>
            </div>

            {/* Botón Logout */}
            <button className="btn-logout-bottom" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>

        </div>

      </main>

      {/* MODAL DE EDICIÓN */}
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
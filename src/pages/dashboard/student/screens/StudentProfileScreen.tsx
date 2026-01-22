import React, { useState, useEffect } from 'react';
import { IonIcon, IonToast, IonSpinner } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';

// Tipos e Importaciones
import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios';
import EditStudentProfileModal, { EditableStudent } from './EditStudentProfileModal';
import './StudentProfileScreen.css';

interface StudentProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ user, onLogout }) => {

  // --- ESTADOS ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado del perfil
  const [profileData, setProfileData] = useState<EditableStudent>({
    ...user,
    bio: (user as any).bio || '',
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
      // Usamos /auth/me para estudiantes
      const response = await api.get('/auth/me');
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
      // Endpoint de estudiante
      const response = await api.patch('/auth/me', updatedData);
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
      setErrorMsg('Error al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generador de avatar si no hay imagen
  const displayImage = profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`;

  return (
    <div className="profile-screen-container">
      <main className="profile-content">

        {/* Card de Perfil */}
        <div className="profile-card">

          {/* Header con Gradiente (Azul para estudiante) */}
          <div className="profile-header"></div>

          {/* Avatar Circular Centrado */}
          <div className="avatar-container">
            <img
              src={displayImage}
              alt={profileData.name}
              className="profile-avatar"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${profileData.name}&background=random`;
              }}
            />
          </div>

          {/* Información del Perfil */}
          <div className="profile-info">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-title">Estudiante</p>
            
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
              {isLoading ? <IonSpinner name="dots" /> : 'EDITAR PERFIL'}
            </button>

            {/* About Section (Biografía) */}
            <div className="about-section">
              <h3 className="about-title">Acerca de mí</h3>
              <p className="about-text">
                {profileData.bio || 'Hola, soy estudiante de Desarrollo de Software. ¡Toca "Editar Perfil" para añadir tu biografía!'}
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
      <EditStudentProfileModal
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

export default StudentProfileScreen;
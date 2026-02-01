import React, { useState, useRef, useEffect } from 'react';
import { 
  IonIcon, IonToast, IonSpinner, IonButton, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, 
} from '@ionic/react';
import { cameraOutline, logOutOutline, personCircleOutline } from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import { User } from '../../../../AppTypes';
import './StudentProfileScreen.css';

interface StudentProfileScreenProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void;
}

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ user, onLogout, onUserUpdate }) => {
  // Llaves de referencia para compatibilidad
  const STORAGE_KEY_NAME = `u_name_${user.id}`;
  const STORAGE_KEY_BIO = `u_bio_${user.id}`;
  const STORAGE_KEY_IMG = `u_img_${user.id}`;

  const [profileData, setProfileData] = useState({
    fullName: (user as any).fullName || user.name || '',
    bio: (user as any).bio || '',
    avatarUrl: (user as any).avatar || (user as any).avatarUrl || ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', color: 'success' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronización: Si el prop 'user' cambia desde App.tsx, actualizamos el estado local
  useEffect(() => {
    setProfileData({
      fullName: (user as any).fullName || user.name || '',
      bio: (user as any).bio || '',
      avatarUrl: (user as any).avatar || (user as any).avatarUrl || ''
    });
  }, [user]);

  const displayImage = previewUrl || profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.fullName}&background=random`;

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      /**
       * 🔥 PERSISTENCIA REAL: 
       * Enviamos FormData para que el backend procese el archivo 'avatar' y los campos de texto.
       */
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('bio', profileData.bio || ''); 
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      // 1. Petición al servidor (Railway)
      const response = await api.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUserFromBackend = response.data;

      // 2. GESTIÓN SEGURA DEL LOCALSTORAGE
      // Combinamos lo que ya tenemos con lo que devuelve el servidor (incluyendo la nueva URL de imagen)
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserObj = { ...currentUserData, ...updatedUserFromBackend };

      try {
        // Guardamos el objeto actualizado (Ligero, solo strings de URL)
        localStorage.setItem('user', JSON.stringify(newUserObj));
        
        /**
         * 🧹 LIMPIEZA DE SEGURIDAD: 
         * Eliminamos residuos de Base64 que puedan causar el QuotaExceededError.
         */
        localStorage.removeItem(STORAGE_KEY_IMG);
        localStorage.removeItem(STORAGE_KEY_NAME);
        localStorage.removeItem(STORAGE_KEY_BIO);
      } catch (storageError) {
        console.warn("⚠️ LocalStorage saturado. Aplicando reseteo de emergencia...");
        localStorage.clear(); 
        localStorage.setItem('user', JSON.stringify(newUserObj));
      }

      // 3. ACTUALIZACIÓN GLOBAL: 
      // Notificamos a App.tsx para que el cambio se vea en toda la app inmediatamente.
      if (onUserUpdate) {
        onUserUpdate(newUserObj);
      }

      setIsEditModalOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null); 
      setToast({ show: true, msg: '¡Perfil actualizado correctamente!', color: 'success' });
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setToast({ show: true, msg: 'No se pudieron guardar los cambios', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-page-wrapper animate-fade-up">
      <div className="profile-card-main">
        <div className="profile-image-section">
          <div className="avatar-ring">
            <img src={displayImage} alt="Avatar" className="profile-avatar-img" key={displayImage} />
          </div>
          <h2 className="profile-name-text">{profileData.fullName}</h2>
          <p className="profile-email-text">{user.email}</p>
          <div className="badge-container">
            <span className="student-badge"><IonIcon icon={personCircleOutline} /> Estudiante</span>
          </div>
        </div>

        <div className="profile-info-section">
          <label className="info-label">SOBRE MÍ</label>
          <div className="bio-container-box">
            {profileData.bio ? (
              <p className="bio-content-text">{profileData.bio}</p>
            ) : (
              <p className="bio-content-empty">Sin biografía aún.</p>
            )}
          </div>
        </div>

        <div className="profile-footer-actions">
          <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>
            <IonIcon icon={cameraOutline} /> EDITAR PERFIL
          </button>
          <button className="sign-out-btn" onClick={() => { localStorage.clear(); onLogout(); }}>
            <IonIcon icon={logOutOutline} /> Cerrar Sesión
          </button>
        </div>
      </div>

      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>Editar Perfil</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSaveProfile} disabled={isLoading} color="primary" strong>
                {isLoading ? <IonSpinner name="dots" /> : 'GUARDAR'}
              </IonButton>
            </IonButtons>
            <IonButtons slot="start">
              <IonButton onClick={() => setIsEditModalOpen(false)}>Cancelar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding edit-modal-content">
          <div className="modal-avatar-selector" onClick={() => fileInputRef.current?.click()}>
            <img src={displayImage} alt="Preview" />
            <div className="camera-icon-badge"><IonIcon icon={cameraOutline} /></div>
          </div>

          <div className="ios-input-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={profileData.fullName} 
              onChange={e => setProfileData({...profileData, fullName: e.target.value})} 
            />
          </div>

          <div className="ios-input-group">
            <label>Biografía</label>
            <textarea 
              rows={4} 
              value={profileData.bio || ""} 
              onChange={e => setProfileData({...profileData, bio: e.target.value})}
            />
          </div>

          <input ref={fileInputRef} type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setPreviewUrl(URL.createObjectURL(file));
              setSelectedFile(file);
            }
          }} />
        </IonContent>
      </IonModal>

      <IonToast isOpen={toast.show} message={toast.msg} color={toast.color} duration={2000} onDidDismiss={() => setToast({...toast, show: false})} />
    </div>
  );
};

export default StudentProfileScreen;
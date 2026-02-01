import React, { useState, useRef, useEffect } from 'react';
import { 
  IonIcon, IonToast, IonSpinner, IonButton, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonBadge, 
} from '@ionic/react';
import { cameraOutline, trophyOutline, logOutOutline } from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import { User } from '../../../../AppTypes';
import './TeacherProfileScreen.css';

interface TeacherProfileScreenProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void; 
}

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout, onUserUpdate }) => {
  const T_NAME = `t_name_${user.id}`;
  const T_BIO = `t_bio_${user.id}`;
  const T_IMG = `t_img_${user.id}`;

  // ✅ LÓGICA DE EXTRACCIÓN REFORZADA: 
  // Si el objeto 'u' (props) viene vacío al recargar, rescatamos del localStorage
  const getFreshData = (u: any) => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    return {
      fullName: u.fullName || storedUser.fullName || u.name || '',
      // Priorizamos u.bio, pero si el Dashboard lo borró al recargar, usamos storedUser.bio
      bio: u.bio || storedUser.bio || (u as any).description || '',
      avatarUrl: u.avatarUrl || storedUser.avatarUrl || u.avatar || ''
    };
  };

  const [profileData, setProfileData] = useState(getFreshData(user));
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({show: false, msg: '', color: 'success'});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ SINCRONIZACIÓN FORZADA: 
  // Al recargar la página, este efecto asegura que profileData tenga los datos del storage
  useEffect(() => {
    setProfileData(getFreshData(user));
  }, [user]);

  const displayImage = previewUrl || 
    (profileData.avatarUrl 
      ? (profileData.avatarUrl.includes('?') ? profileData.avatarUrl : `${profileData.avatarUrl}?t=${new Date().getTime()}`)
      : `https://ui-avatars.com/api/?name=${profileData.fullName}&background=random`);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileData.fullName.trim());
      formData.append('bio', profileData.bio ? profileData.bio.trim() : '');
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const response = await api.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUserFromBackend = response.data;

      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserObj = { ...currentUserData, ...updatedUserFromBackend };

      localStorage.setItem('user', JSON.stringify(newUserObj));
      
      // Limpieza de residuos antiguos
      localStorage.removeItem(T_NAME);
      localStorage.removeItem(T_BIO);
      localStorage.removeItem(T_IMG);

      if (onUserUpdate) {
        onUserUpdate(newUserObj);
      }

      setIsEditModalOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      setToast({show: true, msg: '¡Perfil docente actualizado!', color: 'success'});
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setToast({show: true, msg: 'No se pudo guardar', color: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container app-fade-in">
      <div className="profile-card-main shadow-soft">
        <div className="avatar-section">
          <div className="avatar-ring">
            <img src={displayImage} alt="Avatar" className="avatar-circle" key={displayImage} />
          </div>
        </div>
        <h2 className="user-full-name">{profileData.fullName}</h2>
        <p className="user-email-text">{user.email}</p>
        <div className="badge-container">
          <IonBadge color="primary" mode="ios" className="profile-badge">
            <IonIcon icon={trophyOutline} /> Docente
          </IonBadge>
        </div>
      </div>

      <div className="bio-display-section">
        <h3 className="section-title">PERFIL PROFESIONAL</h3>
        <div className="bio-box">
          {profileData.bio ? (
            <p className="bio-text">{profileData.bio}</p>
          ) : (
            <p className="bio-text-empty">Sin biografía registrada.</p>
          )}
        </div>
      </div>

      <div className="profile-footer-actions">
        <button className="edit-main-btn" onClick={() => setIsEditModalOpen(true)}>
          <IonIcon icon={cameraOutline} /> EDITAR PERFIL
        </button>
        <button className="logout-link-btn" onClick={() => { localStorage.clear(); onLogout(); }}>
          <IonIcon icon={logOutOutline} /> Cerrar Sesión
        </button>
      </div>

      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)}>
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>Editar Perfil</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleSaveProfile} disabled={isLoading} color="primary" strong>
                {isLoading ? <IonSpinner name="crescent" /> : 'GUARDAR'}
              </IonButton>
            </IonButtons>
            <IonButtons slot="start">
              <IonButton onClick={() => setIsEditModalOpen(false)}>Cancelar</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding edit-modal-content">
          <div className="edit-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
            <div className="avatar-preview-container">
              <img src={displayImage} alt="Preview" />
              <div className="camera-badge-overlay"><IonIcon icon={cameraOutline} /></div>
            </div>
          </div>
          
          <div className="custom-input-group">
            <label>Nombre Completo</label>
            <input 
              type="text" 
              value={profileData.fullName} 
              onChange={e => setProfileData({...profileData, fullName: e.target.value})} 
            />
          </div>

          <div className="custom-input-group">
            <label>Biografía Profesional</label>
            <textarea 
              rows={4} 
              value={profileData.bio || ""} 
              onChange={e => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Escribe tu trayectoria..."
            />
          </div>

          <input ref={fileInputRef} type="file" style={{display:'none'}} accept="image/*" onChange={(e) => {
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

export default TeacherProfileScreen;
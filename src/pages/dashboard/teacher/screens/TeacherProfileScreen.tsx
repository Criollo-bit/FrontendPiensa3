import React, { useState, useRef, useEffect } from 'react';
import { 
  IonIcon, IonToast, IonSpinner, IonButton, IonModal, 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonBadge,
  IonItem, IonLabel, IonInput, IonTextarea
} from '@ionic/react';
import { cameraOutline, trophyOutline, logOutOutline } from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import { User } from '../../../../AppTypes';
import './TeacherProfileScreen.css';

interface TeacherProfileScreenProps {
  user: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: any) => void; // Añadido para avisar al Dashboard
}

const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ user, onLogout, onUserUpdate }) => {
  // Claves únicas para que el Profe no pierda sus datos
  const T_NAME = `t_name_${user.id}`;
  const T_BIO = `t_bio_${user.id}`;
  const T_IMG = `t_img_${user.id}`;

  const [profileData, setProfileData] = useState({
    fullName: localStorage.getItem(T_NAME) || (user as any).fullName || user.name || '',
    bio: localStorage.getItem(T_BIO) || (user as any).bio || '',
    avatarUrl: localStorage.getItem(T_IMG) || (user as any).avatarUrl || (user as any).avatar || ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({show: false, msg: '', color: 'success'});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincronización: Si el Dashboard manda datos, priorizamos los nuestros si los del Dashboard vienen vacíos
  useEffect(() => {
    const savedName = localStorage.getItem(T_NAME);
    const savedBio = localStorage.getItem(T_BIO);
    const savedImg = localStorage.getItem(T_IMG);
    
    setProfileData(prev => ({
      fullName: savedName || (user as any).fullName || user.name || prev.fullName,
      bio: savedBio || (user as any).bio || prev.bio,
      avatarUrl: savedImg || (user as any).avatarUrl || (user as any).avatar || prev.avatarUrl
    }));
  }, [user]);

  const displayImage = previewUrl || profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.fullName}&background=random`;

  // Convierte la foto a Base64 para que sea inmortal al recargar
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileData.fullName);
      formData.append('bio', profileData.bio || '');
      if (selectedFile) formData.append('avatar', selectedFile);

      // Enviamos al servidor
      await api.patch('/auth/me', formData);
      
      // PERSISTENCIA LOCAL: Guardamos antes de que la sincronización nos borre nada
      localStorage.setItem(T_NAME, profileData.fullName);
      localStorage.setItem(T_BIO, profileData.bio);
      
      let finalImg = profileData.avatarUrl;
      if (selectedFile) {
        finalImg = await convertToBase64(selectedFile);
        localStorage.setItem(T_IMG, finalImg);
      }

      const updatedUser = {
        ...user,
        fullName: profileData.fullName,
        bio: profileData.bio,
        avatarUrl: finalImg
      };

      setProfileData({
        fullName: updatedUser.fullName,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      });

      if (onUserUpdate) onUserUpdate(updatedUser);

      setIsEditModalOpen(false);
      setPreviewUrl(null);
      setToast({show: true, msg: '¡Perfil docente actualizado!', color: 'success'});
    } catch (err: any) {
      setToast({show: true, msg: 'Error al actualizar perfil', color: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container app-fade-in">
      <div className="profile-card-main shadow-soft">
        <div className="avatar-section">
          <img src={displayImage} alt="Avatar" className="avatar-circle" key={displayImage} />
        </div>
        <h2 className="user-full-name">{profileData.fullName}</h2>
        <p className="user-email-text">{user.email}</p>
        <div className="badge-container">
          <IonBadge color="primary" mode="ios" className="profile-badge">
            <IonIcon icon={trophyOutline} /> Docente
          </IonBadge>
        </div>
      </div>

      <div className="bio-display-section" key={profileData.bio}>
        <h3 className="section-title">PERFIL PROFESIONAL</h3>
        <p className="bio-text">{profileData.bio || 'Sin biografía docente.'}</p>
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
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
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
            <label>Biografía</label>
            <textarea 
              rows={4} 
              value={profileData.bio || ""} 
              onChange={e => setProfileData({...profileData, bio: e.target.value})}
              placeholder="Escribe tu trayectoria..."
            />
          </div>
        </IonContent>
      </IonModal>

      <input ref={fileInputRef} type="file" style={{display:'none'}} accept="image/*" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setPreviewUrl(URL.createObjectURL(file));
          setSelectedFile(file);
        }
      }} />
      <IonToast isOpen={toast.show} message={toast.msg} color={toast.color} duration={2000} onDidDismiss={() => setToast({...toast, show: false})} />
    </div>
  );
};

export default TeacherProfileScreen;
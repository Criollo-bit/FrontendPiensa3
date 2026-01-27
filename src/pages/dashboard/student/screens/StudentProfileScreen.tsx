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
  const STORAGE_KEY_NAME = `u_name_${user.id}`;
  const STORAGE_KEY_BIO = `u_bio_${user.id}`;
  const STORAGE_KEY_IMG = `u_img_${user.id}`;

  const [profileData, setProfileData] = useState({
    fullName: localStorage.getItem(STORAGE_KEY_NAME) || (user as any).fullName || user.name || '',
    bio: localStorage.getItem(STORAGE_KEY_BIO) || (user as any).bio || '',
    avatarUrl: localStorage.getItem(STORAGE_KEY_IMG) || (user as any).avatar || (user as any).avatarUrl || ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', color: 'success' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem(STORAGE_KEY_NAME);
    const savedBio = localStorage.getItem(STORAGE_KEY_BIO);
    const savedImg = localStorage.getItem(STORAGE_KEY_IMG);
    
    setProfileData(prev => ({
      fullName: savedName || (user as any).fullName || user.name || prev.fullName,
      bio: savedBio || (user as any).bio || prev.bio,
      avatarUrl: savedImg || (user as any).avatar || (user as any).avatarUrl || prev.avatarUrl
    }));
  }, [user]);

  const displayImage = previewUrl || profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.fullName}&background=random`;

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

      await api.patch('/auth/me', formData);
      
      localStorage.setItem(STORAGE_KEY_NAME, profileData.fullName);
      localStorage.setItem(STORAGE_KEY_BIO, profileData.bio);
      
      if (selectedFile) {
        const base64Img = await convertToBase64(selectedFile);
        localStorage.setItem(STORAGE_KEY_IMG, base64Img);
        setProfileData(prev => ({ ...prev, avatarUrl: base64Img }));
      }

      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          fullName: profileData.fullName,
          bio: profileData.bio,
          avatarUrl: selectedFile ? localStorage.getItem(STORAGE_KEY_IMG) : profileData.avatarUrl
        });
      }

      setIsEditModalOpen(false);
      setPreviewUrl(null);
      setToast({ show: true, msg: '¡Perfil guardado correctamente!', color: 'success' });
    } catch (err) {
      setToast({ show: true, msg: 'Error de conexión', color: 'danger' });
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
            {/* 🔥 Agregamos botón cerrar para mejor UX en móvil */}
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
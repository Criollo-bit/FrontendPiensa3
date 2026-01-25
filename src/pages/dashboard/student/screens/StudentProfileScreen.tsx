import React, { useState, useRef } from 'react';
import { 
  IonIcon, IonToast, IonSpinner, IonButton, IonModal, 
  IonItem, IonLabel, IonInput, IonTextarea, IonHeader, 
  IonToolbar, IonTitle, IonButtons, IonContent, IonAlert
} from '@ionic/react';
import { 
  cameraOutline, closeOutline, checkmarkOutline, 
  personOutline, locationOutline, logOutOutline, imageOutline
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { api } from '../../../../api/axios'; 
import { User } from '../../../../AppTypes';

import './StudentProfileScreen.css';

interface StudentProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ user, onLogout }) => {
  // Estado inicial del perfil con datos del usuario
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    bio: (user as any).bio || '',
    avatarUrl: (user as any).avatarUrl || (user as any).avatar || ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const isPickingImage = useRef(false);
  
  // Estados para manejo de archivos de imagen
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  // Determinar qué imagen mostrar (Avatar actual, Previa seleccionada o Iniciales)
  const displayImage = previewUrl || profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`;

  // Función auxiliar para procesar imagen
  const processImage = async (image: any) => {
    if (image.webPath) {
      console.log("WebPath disponible:", image.webPath);
      setPreviewUrl(image.webPath); // Actualiza la vista previa inmediatamente
      
      // Convertir el path de la cámara en un archivo real para el servidor
      try {
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        console.log("Archivo creado exitosamente");
      } catch (fetchErr) {
        console.error("Error al convertir imagen:", fetchErr);
        setErrorMsg('Error al procesar la imagen');
      }
    }
  };

  // Procesar archivo desde input file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
        setSelectedFile(file);
        console.log("Archivo seleccionado:", file.name);
      };
      reader.readAsDataURL(file);
      // Limpiar el input para poder seleccionar el mismo archivo nuevamente
      e.target.value = '';
    }
    isPickingImage.current = false;
  };

  // Función para abrir la cámara
  const pickFromCamera = async () => {
    if (isPickingImage.current) return; // Evitar ejecuciones múltiples
    isPickingImage.current = true;

    // En web, usar directamente el input file
    if (!Capacitor.isNativePlatform()) {
      if (hiddenFileInput.current) {
        hiddenFileInput.current.accept = "image/*";
        (hiddenFileInput.current as any).capture = "environment";
        setTimeout(() => hiddenFileInput.current?.click(), 100);
      }
      return;
    }

    // En nativo, usar Camera Plugin
    try {
      console.log("Abriendo cámara...");
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      console.log("Imagen de cámara obtenida:", image);
      await processImage(image);
    } catch (e: any) {
      console.log("Error de cámara:", e);
      // Fallback a input file si Camera falla
      if (hiddenFileInput.current) {
        hiddenFileInput.current.accept = "image/*";
        (hiddenFileInput.current as any).capture = "environment";
        setTimeout(() => hiddenFileInput.current?.click(), 100);
      }
    } finally {
      isPickingImage.current = false;
    }
  };

  // Función para abrir la galería
  const pickFromGallery = async () => {
    if (isPickingImage.current) return; // Evitar ejecuciones múltiples
    isPickingImage.current = true;

    // En web, usar directamente el input file
    if (!Capacitor.isNativePlatform()) {
      if (hiddenFileInput.current) {
        hiddenFileInput.current.accept = "image/*";
        (hiddenFileInput.current as any).capture = "";
        setTimeout(() => hiddenFileInput.current?.click(), 100);
      }
      return;
    }

    // En nativo, usar Camera Plugin
    try {
      console.log("Abriendo galería...");
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      console.log("Imagen de galería obtenida:", image);
      await processImage(image);
    } catch (e: any) {
      console.log("Error de galería:", e);
      // Fallback a input file si Camera falla
      if (hiddenFileInput.current) {
        hiddenFileInput.current.accept = "image/*";
        (hiddenFileInput.current as any).capture = "";
        setTimeout(() => hiddenFileInput.current?.click(), 100);
      }
    } finally {
      isPickingImage.current = false;
    }
  };

  // Función para mostrar opciones
  const handlePickImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowPhotoOptions(true);
  };

  // Función para enviar los cambios al backend
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', profileData.name);
      formData.append('bio', profileData.bio);
      
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      // Ajusta este endpoint según tu API (/auth/me o /users/update)
      const response = await api.patch('/auth/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updatedUser = response.data;
      setProfileData({
        name: updatedUser.fullName || updatedUser.name,
        bio: updatedUser.bio || '',
        avatarUrl: updatedUser.avatarUrl,
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      setIsEditModalOpen(false);
    } catch (err) {
      setErrorMsg('No se pudo actualizar el perfil. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container app-fade-in">
      {/* TARJETA DE PERFIL PRINCIPAL */}
      <div className="profile-card-main">
        <div className="avatar-section">
          <img src={displayImage} alt="Avatar" className="avatar-circle" />
        </div>
        <h2 className="user-full-name">{profileData.name}</h2>
        <p className="user-email-text">{user.email}</p>
        <div className="badge-container">
          <span className="info-badge"><IonIcon icon={personOutline} /> Estudiante</span>
          <span className="info-badge"><IonIcon icon={locationOutline} /> I.S. Sudamericano</span>
        </div>
      </div>

      <div className="bio-display-section">
        <h3 className="section-title">Biografía</h3>
        <p className="bio-text">{profileData.bio || 'Sin biografía añadida.'}</p>
      </div>

      <div className="profile-footer-actions">
        <IonButton expand="block" shape="round" className="edit-main-btn" onClick={() => setIsEditModalOpen(true)}>
          <IonIcon slot="start" icon={cameraOutline} /> Editar Perfil
        </IonButton>
        <IonButton expand="block" fill="clear" color="danger" onClick={onLogout}>
          <IonIcon slot="start" icon={logOutOutline} /> Cerrar Sesión
        </IonButton>
      </div>

      {/* MODAL DE EDICIÓN */}
      <IonModal isOpen={isEditModalOpen} onDidDismiss={() => setIsEditModalOpen(false)} className="profile-edit-modal">
        <IonHeader className="ion-no-border">
          <IonToolbar>
            <IonTitle>Editar Perfil</IonTitle>
            <IonButtons slot="start">
              <IonButton onClick={() => setIsEditModalOpen(false)}>
                <IonIcon icon={closeOutline} color="medium" />
              </IonButton>
            </IonButtons>
            <IonButtons slot="end">
              <IonButton onClick={handleSaveProfile} disabled={isLoading} color="primary" strong>
                {isLoading ? <IonSpinner name="crescent" /> : 'GUARDAR'}
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* BOTÓN DE IMAGEN: Se usa un botón real para asegurar el clic */}
          <div className="edit-avatar-wrapper">
            <button type="button" className="avatar-interaction-btn" onClick={handlePickImage}>
              <div className="avatar-preview-container">
                <img src={displayImage} alt="Preview" />
                <div className="camera-badge-overlay">
                  <IonIcon icon={cameraOutline} />
                </div>
              </div>
            </button>
            <p className="tap-hint-text">Toca para cambiar foto</p>
          </div>

          <div className="edit-form-list">
            <IonItem lines="none" className="custom-form-item">
              <IonLabel position="stacked">Nombre Completo</IonLabel>
              <IonInput 
                fill="outline" 
                mode="md"
                placeholder="Ingresa tu nombre"
                className="custom-styled-input"
                value={profileData.name} 
                onIonInput={e => setProfileData({...profileData, name: e.detail.value!})} 
              />
            </IonItem>

            <IonItem lines="none" className="custom-form-item">
              <IonLabel position="stacked">Acerca de ti (Bio)</IonLabel>
              <IonTextarea 
                fill="outline" 
                mode="md"
                rows={5}
                placeholder="Cuéntanos algo sobre ti..."
                className="custom-styled-input"
                value={profileData.bio} 
                onIonInput={e => setProfileData({...profileData, bio: e.detail.value!})} 
              />
            </IonItem>
          </div>
        </IonContent>
      </IonModal>

      {/* INPUT FILE OCULTO COMO FALLBACK */}
      <input
        ref={hiddenFileInput}
        type="file"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* ALERT PARA SELECCIONAR CÁMARA O GALERÍA */}
      <IonAlert
        isOpen={showPhotoOptions}
        onDidDismiss={() => setShowPhotoOptions(false)}
        header="Cambiar foto"
        message="¿De dónde deseas tomar la foto?"
        buttons={[
          {
            text: 'Cámara',
            handler: () => {
              pickFromCamera();
              setShowPhotoOptions(false);
            }
          },
          {
            text: 'Galería',
            handler: () => {
              pickFromGallery();
              setShowPhotoOptions(false);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]}
      />
      
      <IonToast isOpen={!!errorMsg} message={errorMsg || ''} duration={3000} color="danger" />
    </div>
  );
};

export default StudentProfileScreen;
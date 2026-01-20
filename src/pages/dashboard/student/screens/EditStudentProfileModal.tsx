import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonAvatar, IonSpinner, IonIcon
} from '@ionic/react';
import { camera, person, chatbubble, close, checkmark } from 'ionicons/icons';
import './EditStudentProfileModal.css';
 
export interface EditableStudent {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
} 

interface EditStudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: EditableStudent;
  onSave: (data: { fullName: string; bio: string; avatarUrl: string }) => Promise<void>;
  isLoading: boolean;
}

const EditStudentProfileModal: React.FC<EditStudentProfileModalProps> = ({ 
  isOpen, onClose, user, onSave, isLoading 
}) => {
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    avatarUrl: ''
  });
 
  useEffect(() => {
    if (isOpen) {
      setFormData({
        fullName: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [isOpen, user]);

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="edit-profile-modal">
      <IonHeader className="ion-no-border">
        <IonToolbar className="edit-profile-toolbar">
          <IonButtons slot="start">
            <IonButton onClick={onClose} className="cancel-btn">
              <IonIcon icon={close} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle className="edit-profile-title">Editar Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton 
              onClick={handleSave} 
              disabled={isLoading}
              className="save-btn"
              strong={true}
            >
              {isLoading ? <IonSpinner name="crescent" /> : <IonIcon icon={checkmark} slot="icon-only" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="edit-profile-content">
        <div className="profile-edit-container">
          
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <IonAvatar className="profile-avatar">
                <img 
                  src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || user.name)}&background=random`} 
                  alt="Avatar" 
                />
              </IonAvatar>
              <div className="avatar-overlay">
                <IonIcon icon={camera} className="camera-icon" />
              </div>
            </div>
            <p className="avatar-hint">Toca para cambiar foto</p>
          </div>

          {/* Form Fields */}
          <div className="form-section">
            
            <div className="input-card">
              <div className="input-icon-wrapper">
                <IonIcon icon={person} className="input-icon" />
              </div>
              <div className="input-content-wrapper">
                <div className="input-header">Nombre Completo</div>
                <IonInput 
                  value={formData.fullName} 
                  onIonChange={e => setFormData({...formData, fullName: e.detail.value!})} 
                  placeholder="Luis ESTU"
                  className="custom-input-field"
                />
              </div>
            </div>

            <div className="input-card textarea-card">
              <div className="input-icon-wrapper">
                <IonIcon icon={chatbubble} className="input-icon" />
              </div>
              <div className="input-content-wrapper">
                <div className="input-header">Biografía</div>
                <IonTextarea 
                  value={formData.bio} 
                  rows={3}
                  placeholder="Cuéntanos algo sobre ti..."
                  onIonChange={e => setFormData({...formData, bio: e.detail.value!})} 
                  className="custom-textarea-field"
                  maxlength={150}
                />
                <div className="char-count">{(formData.bio || '').length}/150</div>
              </div>
            </div>

            <div className="input-card">
              <div className="input-icon-wrapper">
                <IonIcon icon={camera} className="input-icon" />
              </div>
              <div className="input-content-wrapper">
                <div className="input-header">URL de Foto (Opcional)</div>
                <IonInput 
                  value={formData.avatarUrl} 
                  placeholder="https://i.pinimg.com/736x/f8/84/c2/f884"
                  onIonChange={e => setFormData({...formData, avatarUrl: e.detail.value!})} 
                  className="custom-input-field"
                  type="url"
                />
              </div>
            </div>

          </div>

          {/* Action Button */}
          <div className="action-section">
            <IonButton 
              expand="block" 
              onClick={handleSave} 
              disabled={isLoading || !formData.fullName.trim()} 
              className="save-button"
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" className="button-spinner" />
                  <span>Guardando...</span>
                </>
              ) : (
                'Guardar Cambios'
              )}
            </IonButton>
          </div>

        </div>
      </IonContent>
    </IonModal>
  );
};

export default EditStudentProfileModal;
import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonItem, IonLabel, IonInput, IonButton, IonButtons, IonIcon, IonTextarea 
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { User } from '../../../../AppTypes';

// Extendemos la interfaz User para incluir los campos del Backend
export interface EditableUser extends User {
  bio?: string;
  avatarUrl?: string; 
  // Mantenemos estos para UI aunque no estén en BD aun
  subjects?: string[]; 
  skills?: string[];
  cycles?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: EditableUser; 
  onSave: (data: any) => void;
  isLoading?: boolean;
}

const EditTeacherProfileModal: React.FC<Props> = ({ isOpen, onClose, user, onSave, isLoading }) => {
  // Estados locales del formulario
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Cargar datos actuales cuando se abre el modal
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setBio(user.bio || '');
      // El backend manda avatarUrl, el frontend base usaba avatar
      setAvatarUrl(user.avatarUrl || user.avatar || ''); 
    }
  }, [user, isOpen]);

  const handleSave = () => {
    // Enviamos el DTO exacto que espera el Backend (EditUserDto)
    onSave({ 
      fullName, 
      bio, 
      avatarUrl 
    });
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} disabled={isLoading}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        
        {/* Nombre Completo */}
        <IonItem>
          <IonLabel position="stacked">Nombre Completo</IonLabel>
          <IonInput 
            value={fullName} 
            placeholder="Ej: Juan Pérez"
            onIonChange={e => setFullName(e.detail.value!)} 
          />
        </IonItem>

        {/* URL del Avatar */}
        <IonItem>
          <IonLabel position="stacked">URL de Imagen (Avatar)</IonLabel>
          <IonInput 
            value={avatarUrl} 
            placeholder="https://..."
            onIonChange={e => setAvatarUrl(e.detail.value!)} 
          />
        </IonItem>
        <p style={{fontSize: '0.8rem', color: '#666', padding: '0 16px'}}>
            Nota: Pega una URL de imagen válida.
        </p>

        {/* Biografía */}
        <IonItem>
          <IonLabel position="stacked">Biografía / Sobre mí</IonLabel>
          <IonTextarea 
            value={bio} 
            rows={4}
            placeholder="Cuéntale a tus alumnos sobre ti..."
            onIonChange={e => setBio(e.detail.value!)} 
          />
        </IonItem>
        
        <div style={{ padding: '20px 0' }}>
          <IonButton expand="block" onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default EditTeacherProfileModal;
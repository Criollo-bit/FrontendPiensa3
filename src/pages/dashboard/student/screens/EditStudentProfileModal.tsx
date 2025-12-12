import React, { useState, useEffect } from 'react';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonLabel, IonInput, IonTextarea, IonAvatar, IonSpinner
} from '@ionic/react';
import { camera } from 'ionicons/icons'; // Necesitarás importar IonIcon si usas el icono

// Definimos la interfaz localmente o impórtala de tus tipos compartidos
export interface EditableStudent {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  // Campos extra del estudiante si los hubiera
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

  // Cargar datos al abrir
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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Editar Perfil</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancelar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Avatar Preview Simple */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
             <IonAvatar style={{ width: '100px', height: '100px' }}>
               <img 
                 src={formData.avatarUrl || `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`} 
                 alt="Avatar" 
               />
             </IonAvatar>
          </div>

          <IonItem>
            <IonLabel position="stacked">Nombre Completo</IonLabel>
            <IonInput 
              value={formData.fullName} 
              onIonChange={e => setFormData({...formData, fullName: e.detail.value!})} 
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Biografía / Frase</IonLabel>
            <IonTextarea 
              value={formData.bio} 
              rows={3}
              placeholder="Escribe algo sobre ti..."
              onIonChange={e => setFormData({...formData, bio: e.detail.value!})} 
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">URL de Avatar (Opcional)</IonLabel>
            <IonInput 
              value={formData.avatarUrl} 
              placeholder="https://..."
              onIonChange={e => setFormData({...formData, avatarUrl: e.detail.value!})} 
            />
          </IonItem>

          <IonButton expand="block" onClick={handleSave} disabled={isLoading} style={{ marginTop: '20px' }}>
            {isLoading ? <IonSpinner name="crescent" /> : 'Guardar Cambios'}
          </IonButton>

        </div>
      </IonContent>
    </IonModal>
  );
};

export default EditStudentProfileModal;
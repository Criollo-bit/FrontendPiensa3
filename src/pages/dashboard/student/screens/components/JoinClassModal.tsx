import React, { useState } from 'react';
import { 
  IonModal, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonSpinner 
} from '@ionic/react';
import { qrCodeOutline, closeOutline, enterOutline } from 'ionicons/icons';
import './JoinClassModal.css'; // Crearemos este CSS abajo

interface JoinClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
  isLoading: boolean;
}

const JoinClassModal: React.FC<JoinClassModalProps> = ({ isOpen, onClose, onJoin, isLoading }) => {
  const [code, setCode] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.trim().length > 0) {
      onJoin(code);
      setCode(''); // Limpiar
    }
  };

  return (
    <IonModal 
      isOpen={isOpen} 
      onDidDismiss={onClose} 
      className="join-class-modal"
    >
      <div className="join-modal-content">
        {/* Botón Cerrar */}
        <button onClick={onClose} className="close-modal-btn">
          <IonIcon icon={closeOutline} />
        </button>

        {/* Icono Principal */}
        <div className="modal-icon-wrapper">
          <IonIcon icon={qrCodeOutline} />
        </div>

        <h2 className="modal-title">Unirse a una Clase</h2>
        <p className="modal-subtitle">
          Ingresa el código alfanumérico que te proporcionó tu profesor.
        </p>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="custom-input-container">
            <input 
              type="text" 
              className="custom-code-input"
              placeholder="Ej: A4F1-X2"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} // Auto mayúsculas
              maxLength={10}
              disabled={isLoading}
            />
          </div>

          <IonButton 
            expand="block" 
            type="submit" 
            className="join-submit-btn"
            disabled={!code || isLoading}
          >
            {isLoading ? (
              <IonSpinner name="crescent" color="light" />
            ) : (
              <>
                Entrar a Clase
                <IonIcon slot="end" icon={enterOutline} />
              </>
            )}
          </IonButton>
        </form>
      </div>
    </IonModal>
  );
};

export default JoinClassModal;
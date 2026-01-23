import React, { useState } from 'react';
import { 
  IonIcon, 
  IonModal, 
  IonSpinner
} from '@ionic/react';
import { closeCircleOutline, rocketOutline } from 'ionicons/icons';
import './CreateBattleModal.css';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  isLoading: boolean;
  onCreate: (
    battleName: string,
    questionCount: number, // (Lo mantenemos por compatibilidad pero enviaremos 0)
    groupCount: number,
    questions: any[],
    studentsPerGroup: number
  ) => void;
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [battleName, setBattleName] = useState('');
  const [studentsPerGroup, setStudentsPerGroup] = useState(1);
  const [groupCount, setGroupCount] = useState(1); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battleName.trim()) return;

    // Enviamos 0 en questionCount ya que ahora depende del banco seleccionado
    onCreate(
      battleName,
      0, 
      groupCount,
      [], 
      studentsPerGroup
    );
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="clean-battle-modal">
      <div className="modal-wrapper-clean">
        
        {/* HEADER */}
        <div className="modal-header-clean">
          <div className="header-text">
            <h2>Nueva Batalla</h2>
            <p>Configura los detalles básicos de la sala</p>
          </div>
          <button onClick={onClose} className="btn-close-icon">
            <IonIcon icon={closeCircleOutline} />
          </button>
        </div>
        
        {/* BODY */}
        <div className="modal-body-clean">
          <form onSubmit={handleSubmit} className="clean-form">
            
            <div className="form-group">
              <label>Nombre de la Sala</label>
              <input 
                type="text" 
                placeholder="Ej: Repaso Matemáticas - 5to A"
                value={battleName}
                onChange={e => setBattleName(e.target.value)}
                required
                className="clean-input-lg"
                autoFocus
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estudiantes por Grupo</label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={studentsPerGroup}
                  onChange={e => setStudentsPerGroup(Number(e.target.value))}
                  className="clean-input"
                />
              </div>
              
              <div className="form-group">
                <label>Total de Grupos</label>
                <input 
                  type="number" 
                  min="1" 
                  value={groupCount}
                  onChange={e => setGroupCount(Number(e.target.value))}
                  className="clean-input"
                />
              </div>
            </div>
            
            <div className="info-box">
              <p>
                <strong>Nota:</strong> Las preguntas se seleccionarán desde tu banco de preguntas una vez creada la sala.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-clean-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-clean-primary" disabled={isLoading || !battleName.trim()}>
                {isLoading ? <IonSpinner name="dots" /> : (
                  <>
                    <IonIcon icon={rocketOutline} style={{marginRight: 8}} />
                    Crear Sala
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </IonModal> 
  );
};

export default CreateBattleModal;
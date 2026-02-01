import React, { useState, useEffect } from 'react';
import { 
  IonIcon, 
  IonModal, 
  IonSpinner
} from '@ionic/react';
import { 
  closeCircleOutline, 
  rocketOutline, 
  trophyOutline, 
  bookOutline 
} from 'ionicons/icons';
import { api } from '../../../../api/axios'; 
import './CreateBattleModal.css';

interface CreateBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
  isLoading: boolean;
  onCreate: (
    battleName: string,
    subjectId: string, // 🔥 Nuevo: Materia vinculada
    pointsConfig: { p1: number, p2: number, p3: number }, // 🔥 Nuevo: Configuración de premios
    groupCount: number,
    studentsPerGroup: number
  ) => void;
}

const CreateBattleModal: React.FC<CreateBattleModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  isLoading 
}) => {
  const [battleName, setBattleName] = useState('');
  const [studentsPerGroup, setStudentsPerGroup] = useState(1);
  const [groupCount, setGroupCount] = useState(1); 

  // 🔥 NUEVOS ESTADOS PARA GESTIÓN REAL
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [p1, setP1] = useState(200);
  const [p2, setP2] = useState(100);
  const [p3, setP3] = useState(50);

  // Cargar materias cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadRealSubjects();
    }
  }, [isOpen]);

  const loadRealSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      // 🔥 FILTRO: Solo materias reales (cycle !== 'BANK')
      const onlySubjects = res.data.filter((s: any) => s.cycle !== 'BANK');
      setSubjects(onlySubjects);
      if (onlySubjects.length > 0) setSelectedSubjectId(onlySubjects[0].id);
    } catch (e) {
      console.error("Error cargando materias para la batalla", e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!battleName.trim() || !selectedSubjectId) return;

    onCreate(
      battleName,
      selectedSubjectId,
      { p1, p2, p3 },
      groupCount,
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
            <p>Configura los puntos reales para tus materias</p>
          </div>
          <button onClick={onClose} className="btn-close-icon">
            <IonIcon icon={closeCircleOutline} />
          </button>
        </div>
        
        {/* BODY */}
        <div className="modal-body-clean">
          <form onSubmit={handleSubmit} className="clean-form">
            
            {/* SELECTOR DE MATERIA REAL */}
            <div className="form-group">
              <label><IonIcon icon={bookOutline} /> Materia a la que se asignan puntos</label>
              <select 
                className="clean-input"
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                required
              >
                {subjects.length > 0 ? (
                  subjects.map(s => <option key={s.id} value={s.id}>{s.name} - {s.cycle}</option>)
                ) : (
                  <option value="">Cargando materias...</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Nombre de la Sala</label>
              <input 
                type="text" 
                placeholder="Ej: Repaso de Electrónica - Unidad 1"
                value={battleName}
                onChange={e => setBattleName(e.target.value)}
                required
                className="clean-input-lg"
                autoFocus
              />
            </div>

            {/* CONFIGURACIÓN DE PREMIOS (PODIO) */}
            <div className="points-config-section">
              <label style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                <IonIcon icon={trophyOutline} color="warning" /> Configuración de Premios (PTS)
              </label>
              
              <div className="form-group">
                <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#64748b'}}>1º Lugar</span>
                <input 
                  type="number" 
                  className="clean-input" 
                  value={p1 === 0 ? '' : p1}
                  onChange={e => setP1(e.target.value === '' ? 0 : parseInt(e.target.value))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#64748b'}}>2º Lugar</span>
                  <input 
                    type="number" 
                    className="clean-input" 
                    value={p2 === 0 ? '' : p2}
                    onChange={e => setP2(e.target.value === '' ? 0 : parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group">
                  <span style={{fontSize: '0.8rem', fontWeight: 600, color: '#64748b'}}>3º Lugar</span>
                  <input 
                    type="number" 
                    className="clean-input" 
                    value={p3 === 0 ? '' : p3}
                    onChange={e => setP3(e.target.value === '' ? 0 : parseInt(e.target.value))}
                  />
                </div>
              </div>
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
                <strong>Nota:</strong> Los puntos configurados se sumarán al saldo real de los estudiantes ganadores en la materia seleccionada.
              </p>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn-clean-secondary">
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-clean-primary" 
                disabled={isLoading || !battleName.trim() || subjects.length === 0}
              >
                {isLoading ? <IonSpinner name="dots" /> : (
                  <>
                    <IonIcon icon={rocketOutline} style={{marginRight: 8}} />
                    Crear Sala Real
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
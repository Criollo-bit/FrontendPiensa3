import React, { useState, useEffect } from 'react';
import { 
  IonIcon, IonButton, IonCard, IonCardContent, 
  IonText, IonSpinner 
} from '@ionic/react';
import { 
  layersOutline, peopleOutline, rocketOutline, arrowBack
} from 'ionicons/icons';
import { socketService } from '../../../../api/socket';

interface AllForAllProfessorControlProps {
  subjectId: number; // Asegúrate de que esto sea un número (ej: 1)
  subjectName: string;
  onBack: () => void;
}

const AllForAllProfessorControl: React.FC<AllForAllProfessorControlProps> = ({ 
  subjectId, 
  subjectName, 
  onBack 
}) => {
  const [studentCount, setStudentCount] = useState(0);
  const [students, setStudents] = useState<any[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // 1. GENERACIÓN DEL PIN: Si subjectId es 1, pinDisplay será "0001"
  const pinDisplay = subjectId ? subjectId.toString().padStart(4, '0') : "----";
  const roomId = `subject_${subjectId}`;

  useEffect(() => {
    const socket = socketService.connectToBattle();
    if (!socket) return;

    console.log("Conectando a sala:", roomId);

    // 2. ABRIR SALA: Esto hace que el backend reconozca la sala del profe
    socket.emit('open-allforall-room', { roomId });
    setIsConnecting(false);

    // 3. ESCUCHAR ACTUALIZACIONES: Cuando un alumno usa el PIN, llega aquí
    socket.on('allforall-update', (data: any) => {
      console.log("Actualización de sala recibida:", data);
      if (data.students) {
        setStudents(data.students);
        setStudentCount(data.students.length);
      }
    });

    return () => {
      socket.off('allforall-update');
    };
  }, [roomId]);

  const handleLaunchGame = () => {
    const socket = socketService.connectToBattle();
    if (!socket) return;

    // Lanzamos la ronda inicial a todos los alumnos
    socket.emit('allforall-start-round', {
      roomId,
      wordText: 'AZUL', 
      wordColor: 'red', // Efecto Stroop: Palabra Azul en color Rojo
      correctTarget: 'color', // El alumno debe marcar el color (Rojo)
      roundNumber: 1
    });

    setIsGameStarted(true);
  };

  return (
    <div style={{ background: '#f4f7fe', minHeight: '100vh', paddingBottom: '30px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
        <IonButton fill="clear" onClick={onBack} color="dark">
          <IonIcon icon={arrowBack} slot="icon-only" />
        </IonButton>
        <div style={{ marginLeft: '10px' }}>
          <h2 style={{ margin: 0, fontWeight: 'bold' }}>All for All</h2>
          <p style={{ margin: 0, opacity: 0.6 }}>Clase: {subjectName}</p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        
        {/* TARJETA DEL PIN: Esto es lo que ven los alumnos en la pizarra */}
        <IonCard style={{ 
          borderRadius: '24px', 
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
          border: '3px solid #8b5cf6',
          textAlign: 'center',
          background: 'white'
        }}>
          <IonCardContent style={{ padding: '40px 10px' }}>
            <IonText color="primary">
              <h3 style={{ fontWeight: 'bold', letterSpacing: '3px', marginBottom: '15px' }}>
                PIN PARA ESTUDIANTES
              </h3>
            </IonText>
            {isConnecting ? (
              <IonSpinner name="crescent" />
            ) : (
              <h1 style={{ 
                fontSize: '5rem', 
                fontWeight: '900', 
                margin: 0, 
                letterSpacing: '15px',
                color: '#4c1d95' 
              }}>
                {pinDisplay}
              </h1>
            )}
          </IonCardContent>
        </IonCard>

        {/* PANEL DE CONTROL */}
        <IonCard style={{ borderRadius: '24px', textAlign: 'center', marginTop: '20px' }}>
          <IonCardContent style={{ padding: '30px 20px' }}>
            <div style={{ 
              background: '#ede9fe', width: '60px', height: '60px', 
              borderRadius: '15px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', margin: '0 auto 20px' 
            }}>
              <IonIcon icon={layersOutline} style={{ fontSize: '1.8rem', color: '#8b5cf6' }} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>Rondas Listas</h2>
            <p style={{ color: '#64748b' }}>Indica a tus alumnos que ingresen el PIN superior.</p>

            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              gap: '10px', margin: '25px 0' 
            }}>
              <IonIcon icon={peopleOutline} color="primary" style={{ fontSize: '1.5rem' }} />
              <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>
                {studentCount} Estudiantes conectados
              </span>
            </div>

            <IonButton 
              expand="block" 
              shape="round" 
              disabled={studentCount === 0 || isGameStarted}
              onClick={handleLaunchGame}
              style={{ 
                height: '60px', fontSize: '1.1rem', fontWeight: 'bold',
                '--background': '#8b5cf6'
              }}
            >
              <IonIcon icon={rocketOutline} slot="start" />
              {isGameStarted ? 'JUEGO INICIADO' : '¡LANZAR JUEGO!'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* LISTA DE ALUMNOS (Bubbles) */}
        <div style={{ 
          marginTop: '20px', display: 'flex', flexWrap: 'wrap', 
          gap: '10px', justifyContent: 'center' 
        }}>
          {students.map((s, i) => (
            <div key={i} style={{ 
              background: '#fff', padding: '8px 15px', borderRadius: '20px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0',
              fontSize: '0.9rem', color: '#4b5563'
            }}>
              {s.studentName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllForAllProfessorControl;
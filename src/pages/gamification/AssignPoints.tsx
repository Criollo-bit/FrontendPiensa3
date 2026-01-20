import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonInput, IonButton, IonToast, IonLoading
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../api/axios'; // <--- CAMBIO

const AssignPoints: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [studentId, setStudentId] = useState('');
  const [points, setPoints] = useState<number>(100);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const history = useHistory();

  useEffect(() => {
    api.get('/subjects').then(res => setSubjects(res.data)).catch(console.error);
  }, []);

  const handleAssign = async () => {
    if (!selectedSubject || !studentId) {
      setMessage('Falta materia o ID del estudiante');
      return;
    }
    setLoading(true);
    try {
      await api.post('/points/assign', {
        subjectId: selectedSubject,
        studentId: studentId,
        amount: Number(points),
        reason: reason || 'Participación en clase'
      });
      setMessage('¡Puntos asignados con éxito!');
      setTimeout(() => history.goBack(), 1500);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Error al asignar puntos');
    } finally {
      setLoading(false);
    }
  };

  // ... (El return del componente es igual al anterior)
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Asignar Puntos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem className="ion-margin-bottom">
          <IonLabel position="stacked">1. Selecciona la Materia</IonLabel>
          <IonSelect value={selectedSubject} placeholder="Elige una materia" onIonChange={e => setSelectedSubject(e.detail.value)}>
            {subjects.map(sub => (
              <IonSelectOption key={sub.id} value={sub.id}>{sub.name}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonItem className="ion-margin-bottom">
          <IonLabel position="stacked">2. ID del Estudiante</IonLabel>
          <IonInput placeholder="Pega el ID aquí" value={studentId} onIonChange={e => setStudentId(e.detail.value!)} />
        </IonItem>
        <IonItem className="ion-margin-bottom">
          <IonLabel position="stacked">3. Cantidad de Puntos</IonLabel>
          <IonInput type="number" value={points} onIonChange={e => setPoints(parseInt(e.detail.value!, 10))} />
        </IonItem>
        <IonItem className="ion-margin-bottom">
          <IonLabel position="stacked">4. Motivo (Opcional)</IonLabel>
          <IonInput placeholder="Ej. Buen trabajo" value={reason} onIonChange={e => setReason(e.detail.value!)} />
        </IonItem>
        <IonButton expand="block" onClick={handleAssign} className="ion-margin-top">Enviar Puntos</IonButton>
        <IonLoading isOpen={loading} message="Asignando..." />
        <IonToast isOpen={!!message} message={message || ''} duration={2000} onDidDismiss={() => setMessage(null)} />
      </IonContent>
    </IonPage>
  );
};

export default AssignPoints;
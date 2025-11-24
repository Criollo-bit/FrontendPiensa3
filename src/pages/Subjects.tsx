import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonBadge, IonNote, IonIcon
} from '@ionic/react';
import { copyOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { api } from '../api/axios';

const Subjects: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    // Consultamos las materias al cargar la pantalla
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get('/subjects');
        setSubjects(data);
      } catch (error) {
        console.error('Error cargando materias', error);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Mis Materias</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {subjects.length === 0 ? (
            <div className="ion-text-center ion-padding">
              <p>No tienes materias creadas aún.</p>
            </div>
          ) : (
            subjects.map((subject) => (
              <IonItem key={subject.id}>
                <IonLabel>
                  <h2>{subject.name}</h2>
                  <p>{subject.cycle} - {subject.year}</p>
                </IonLabel>
                <div className="ion-text-end">
                  <IonNote>Código:</IonNote><br/>
                  <IonBadge color="tertiary" style={{ fontSize: '1.1em' }}>
                    {subject.joinCode} <IonIcon icon={copyOutline} style={{ verticalAlign: 'middle' }}/>
                  </IonBadge>
                </div>
              </IonItem>
            ))
          )}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Subjects;
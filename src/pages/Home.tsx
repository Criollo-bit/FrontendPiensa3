import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, 
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,
  IonIcon, IonLabel, IonItem, IonList, IonBadge
} from '@ionic/react';
import { schoolOutline, personOutline, logOutOutline, starOutline } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../api/axios';

interface User {
  id: string;
  fullName: string;
  role: 'TEACHER' | 'STUDENT';
  email: string;
}

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Obtenemos datos del usuario actual
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        // Si el token expiró, al login
        localStorage.removeItem('token');
        history.push('/login');
      }
    };
    fetchUser();
  }, [history]);

  const logout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color={user?.role === 'TEACHER' ? 'tertiary' : 'success'}>
          <IonTitle>Panel de {user?.role === 'TEACHER' ? 'Docente' : 'Estudiante'}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={logout}>
            <IonIcon icon={logOutOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {user && (
          <>
            {/* Tarjeta de Perfil */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{user.fullName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{user.email}</p>
                <IonBadge color={user.role === 'TEACHER' ? 'tertiary' : 'success'}>
                  {user.role}
                </IonBadge>
              </IonCardContent>
            </IonCard>

            {/* Menú de Acciones según Rol */}
            <IonList>
              {/* BOTÓN 1: MIS MATERIAS */}
              <IonItem button routerLink="/subjects"> 
                <IonIcon icon={schoolOutline} slot="start" />
                <IonLabel>Mis Materias</IonLabel>
                <IonButton fill="outline" slot="end">Ver</IonButton>
              </IonItem>

              {user.role === 'TEACHER' && (
                <>
                  {/* BOTÓN 2: ASIGNAR PUNTOS */}
                  <IonItem button routerLink="/assign-points"> 
                    <IonIcon icon={starOutline} slot="start" />
                    <IonLabel>Asignar Puntos</IonLabel>
                    <IonButton fill="outline" slot="end">Ir</IonButton>
                  </IonItem>
                  
                  <IonItem button>
                    <IonIcon icon={personOutline} slot="start" />
                    <IonLabel>Crear Torneo</IonLabel>
                    <IonButton fill="outline" slot="end">Crear</IonButton>
                  </IonItem>
                </>
              )}

              {user.role === 'STUDENT' && (
                <IonItem button>
                  <IonIcon icon={starOutline} slot="start" />
                  <IonLabel>Canjear Recompensas</IonLabel>
                  <IonButton fill="outline" slot="end">Canjear</IonButton>
                </IonItem>
              )}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
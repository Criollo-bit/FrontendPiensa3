import { 
  IonContent, IonPage, IonHeader, IonToolbar, IonTitle, IonLoading
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../api/axios';

// Importamos los dashboards separados
import TeacherDashboard from './teacher/screens/TeacherDashboard';
import StudentDashboard from './student/screens/StudentDashboard';
import { User } from '../../AppTypes'; 

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        
        // --- AQUÍ ESTÁ LA CORRECCIÓN ---
        // Transformamos los datos que vienen del backend
        const currentUser: User = {
          id: data.id,
          email: data.email,
          name: data.fullName, // El backend manda 'fullName', el front usa 'name'
          role: data.role,     // 'TEACHER' o 'STUDENT'
          avatar: data.avatarUrl
        };

        setUser(currentUser);
      } catch (error) {
        console.error("Error cargando perfil:", error);
        localStorage.removeItem('token');
        history.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [history]);

  const logout = () => {
    localStorage.removeItem('token');
    history.push('/login');
  };

  if (loading) {
    return <IonLoading isOpen={true} message="Cargando perfil..." />;
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="light">
          <IonTitle color="primary"><b>Piensa</b>App</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color="light">
        {user ? (
          // Renderizado condicional según el rol
          user.role === 'TEACHER' ? (
            <TeacherDashboard user={user} onLogout={logout} />
          ) : (
            <StudentDashboard user={user} onLogout={logout} />
          )
        ) : null}
      </IonContent>
    </IonPage>
  );
};

export default Home;
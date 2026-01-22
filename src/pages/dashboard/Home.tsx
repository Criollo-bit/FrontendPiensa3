import { IonPage, IonContent, IonLoading } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../api/axios';

import TeacherDashboard from '../dashboard/teacher/screens/TeacherDashboard';
import StudentDashboard from '../dashboard/student/screens/StudentDashboard';
import { User } from '../../AppTypes';

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');

        const currentUser: User = {
          id: data.id,
          email: data.email,
          name: data.fullName,
          role: data.role,
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
    return <IonLoading isOpen message="Cargando perfil..." />;
  }

  if (!user) return null;

  return (
    <IonPage>
      <IonContent fullscreen>
        {user.role === 'TEACHER' ? (
          <TeacherDashboard user={user} onLogout={logout} />
        ) : (
          <StudentDashboard user={user} onLogout={logout} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;

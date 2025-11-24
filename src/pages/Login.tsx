import { 
  IonContent, IonPage, IonInput, IonButton, IonItem, IonLabel, 
  IonHeader, IonToolbar, IonTitle, IonToast, IonLoading, IonIcon
} from '@ionic/react';
import { logInOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../api/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async () => {
    if(!email || !password) {
      setMessage('Por favor completa los campos');
      return;
    }

    setLoading(true);
    try {
      // 1. Llamada al backend
      const { data } = await api.post('/auth/signin', {
        email,
        password
      });

      // 2. Guardar Token
      localStorage.setItem('token', data.access_token);
      
      // 3. Redirigir
      setMessage('¡Bienvenido!');
      history.push('/home'); 
      
    } catch (error: any) {
      console.error(error);
      setMessage('Credenciales incorrectas o error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Proyecto Piensa</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ marginTop: '40px', marginBottom: '20px', textAlign: 'center' }}>
          <IonIcon icon={logInOutline} style={{ fontSize: '64px', color: '#3880ff' }} />
          <h2>Iniciar Sesión</h2>
        </div>

        <IonItem fill="outline" className="ion-margin-bottom">
          <IonLabel position="floating">Correo Electrónico</IonLabel>
          <IonInput 
            type="email" 
            value={email} 
            onIonChange={e => setEmail(e.detail.value!)} 
          />
        </IonItem>

        <IonItem fill="outline" className="ion-margin-bottom">
          <IonLabel position="floating">Contraseña</IonLabel>
          <IonInput 
            type="password" 
            value={password} 
            onIonChange={e => setPassword(e.detail.value!)} 
          />
        </IonItem>

        <IonButton expand="block" onClick={handleLogin}>
          Ingresar
        </IonButton>

        <IonLoading isOpen={loading} message={'Autenticando...'} />
        <IonToast 
          isOpen={!!message} 
          message={message || ''} 
          duration={2000} 
          color="danger"
          onDidDismiss={() => setMessage(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
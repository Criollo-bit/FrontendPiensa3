import { 
  IonContent, IonPage, IonToast, IonLoading 
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../api/axios'; // <--- CAMBIO: Subimos 2 niveles
import RobotMascot from '../../components/RobotMascot'; // <--- CAMBIO
import FloatingInput from '../../components/FloatingInput'; // <--- CAMBIO
import './Login.css';

const Login: React.FC = () => {
  // ... (El resto del código es idéntico, no cambia la lógica)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focus, setFocus] = useState<'idle' | 'email' | 'password'>('idle'); 
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email || !password) {
      setMessage('Por favor completa los campos');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/signin', { email, password });
      localStorage.setItem('token', data.access_token);
      setMessage('¡Bienvenido!');
      history.push('/home'); 
    } catch (error: any) {
      console.error(error);
      setMessage('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="login-container">
          <div style={{ marginBottom: '2rem' }}>
            <RobotMascot focus={focus} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>¡Bienvenido!</h1>
            <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>Ingresa para continuar tu aventura.</p>
          </div>
          <form onSubmit={handleLogin} style={{ maxWidth: '24rem', margin: '0 auto', width: '100%' }}>
            <FloatingInput 
              id="email" label="Correo Electrónico" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocus('email')} onBlur={() => setFocus('idle')} required
            />
            <FloatingInput 
              id="password" label="Contraseña" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocus('password')} onBlur={() => setFocus('idle')} required
            />
            <button type="submit" className="btn-primary">Iniciar Sesión</button>
          </form>
          <IonLoading isOpen={loading} message={'Autenticando...'} />
          <IonToast isOpen={!!message} message={message || ''} duration={2000} position="top" color="danger" onDidDismiss={() => setMessage(null)} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
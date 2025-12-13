import { 
  IonContent, IonPage, IonToast, IonLoading 
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { api } from '../../api/axios'; 
import RobotMascot from '../../components/RobotMascot'; 
import FloatingInput from '../../components/FloatingInput'; 
import './Login.css';

const Login: React.FC = () => {
  const history = useHistory();
  
  // Estado de la vista: 'login' o 'register'
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Campos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Solo para registro

  // Estados de UI
  const [focus, setFocus] = useState<'idle' | 'email' | 'password'>('idle'); 
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false); // Para color del toast
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!email || !password) {
      showToast('Por favor completa el correo y contraseña', true);
      return;
    }

    if (view === 'register' && !fullName) {
      showToast('Por favor ingresa tu nombre completo', true);
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (view === 'login') {
        // --- INICIO DE SESIÓN ---
        response = await api.post('/auth/signin', { email, password });
      } else {
        // --- REGISTRO ---
        // Ya no enviamos el rol, el backend asignará 'STUDENT' por defecto
        response = await api.post('/auth/signup', { 
          email, 
          password, 
          fullName
        });
      }

      // Si todo sale bien
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      showToast(`¡Bienvenido ${view === 'register' ? fullName : ''}!`, false);
      
      // Redirigir al Home
      history.push('/home'); 

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message;
      
      if (view === 'login') {
        showToast('Credenciales incorrectas o usuario no encontrado.', true);
      } else {
        showToast(errorMsg || 'Error al crear la cuenta.', true);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, isErr: boolean) => {
    setMessage(msg);
    setIsError(isErr);
  };

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login');
    setMessage(null); 
  };

  return (
    <IonPage>
      <IonContent>
        <div className="login-container">
          
          <div style={{ marginBottom: '1.5rem' }}>
            <RobotMascot focus={focus} />
          </div>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>
              {view === 'login' ? '¡Hola de nuevo!' : 'Crea tu Cuenta'}
            </h1>
            <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>
              {view === 'login' ? 'Ingresa para continuar.' : 'Únete a la aventura educativa.'}
            </p>
          </div>

          {/* HE ELIMINADO EL SELECTOR DE ROL AQUÍ.
             Ahora pasa directo a los inputs.
          */}

          <form onSubmit={handleSubmit} style={{ maxWidth: '24rem', margin: '0 auto', width: '100%' }}>
            
            {/* Campo Nombre (Solo en Registro) */}
            {view === 'register' && (
              <FloatingInput 
                id="fullName" 
                label="Nombre Completo" 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onFocus={() => setFocus('idle')} 
                onBlur={() => setFocus('idle')} 
                required
              />
            )}

            <FloatingInput 
              id="email" 
              label="Correo Electrónico" 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocus('email')} 
              onBlur={() => setFocus('idle')} 
              required
            />
            
            <FloatingInput 
              id="password" 
              label="Contraseña" 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocus('password')} 
              onBlur={() => setFocus('idle')} 
              required
            />
            
            <button type="submit" className="btn-primary">
              {view === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          {/* --- ENLACE PARA CAMBIAR ENTRE LOGIN / REGISTER --- */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
            {view === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
            <button 
              onClick={toggleView}
              style={{ 
                background: 'none', border: 'none', color: '#0ea5e9', 
                fontWeight: 'bold', cursor: 'pointer', fontSize: 'inherit' 
              }}
            >
              {view === 'login' ? 'Regístrate aquí' : 'Ingresa aquí'}
            </button>
          </div>

          <IonLoading isOpen={loading} message={view === 'login' ? 'Autenticando...' : 'Creando cuenta...'} />
          
          <IonToast 
            isOpen={!!message} 
            message={message || ''} 
            duration={2000} 
            position="top" 
            color={isError ? "danger" : "success"} 
            onDidDismiss={() => setMessage(null)} 
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
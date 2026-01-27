import React, { useMemo, useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  homeOutline, 
  personOutline, 
  flashOutline, 
  colorPaletteOutline,
  bookOutline 
} from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom'; 
import './StudentBottomNav.css';

interface StudentBottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const history = useHistory();
  const location = useLocation();

  // 🔥 ESTADO INICIAL SIEMPRE EN FALSE: La barra es estática por defecto
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const onShow = () => {
      // Validación de seguridad: Solo ocultar si el foco está en un campo de entrada
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') {
        setIsKeyboardVisible(true);
      }
    };
    
    const onHide = () => setIsKeyboardVisible(false);

    // Eventos de teclado (Capacitor/Nativo)
    window.addEventListener('keyboardWillShow', onShow);
    window.addEventListener('keyboardWillHide', onHide);
    
    // Soporte para navegadores y transiciones de pantalla
    window.addEventListener('focusin', onShow);
    window.addEventListener('focusout', onHide);

    return () => {
      window.removeEventListener('keyboardWillShow', onShow);
      window.removeEventListener('keyboardWillHide', onHide);
      window.removeEventListener('focusin', onShow);
      window.removeEventListener('focusout', onHide);
    };
  }, []);

  // 1. CONFIGURACIÓN DE SECCIONES
  const navItems = useMemo(() => [
    { id: 'HOME', label: 'Inicio', icon: homeOutline, isRoute: false },
    { id: 'MY_CLASSES', label: 'Clases', icon: bookOutline, isRoute: false },
    { id: 'BATTLE', label: 'Batalla', icon: flashOutline, isRoute: false },
    { id: 'ALLFORALL', label: 'Jugar', icon: colorPaletteOutline, isRoute: false },
    { id: 'PROFILE', label: 'Perfil', icon: personOutline, isRoute: false },
  ], []);

  // 2. CÁLCULO DEL ÍTEM ACTIVO
  const activeIndex = navItems.findIndex(item => item.id === activeScreen);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex; 

  const totalItems = navItems.length;
  const notchCenterX = (safeIndex / totalItems) * 100 + (50 / totalItems);
  const nX = notchCenterX * 4; 

  // 3. MANEJADOR DE NAVEGACIÓN
  const handleNavigation = (item: any) => {
    if (item.isRoute) {
        history.push(item.path);
    } else {
        if (location.pathname !== '/home') {
            history.push('/home');
            setTimeout(() => setActiveScreen(item.id), 50);
        } else {
            setActiveScreen(item.id);
        }
    }
  };

  // 🔥 LÓGICA DE VISIBILIDAD REFORZADA
  // 'nav-visible-static' asegura que la barra no se mueva al cambiar de sección
  const keyboardClass = isKeyboardVisible ? 'nav-hidden-keyboard' : 'nav-visible-static';

  return (
    <div className={`student-nav-wrapper ${keyboardClass}`}>
      {/* Botón Flotante Activo */}
      {activeIndex !== -1 && (
        <div className="floating-active-container" style={{ left: `${notchCenterX}%` }}>
          <div className="floating-outer-circle">
            <div className="floating-inner-circle">
              <IonIcon 
                icon={navItems[activeIndex].icon} 
                style={{ fontSize: '24px', color: 'white' }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Barra SVG - Ajustada para cubrir iconos totalmente */}
      <div className="nav-svg-layer">
        <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8f9fa" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="-2" stdDeviation="4" floodOpacity="0.1"/>
            </filter>
          </defs>
          <path 
            className="nav-svg-path"
            d={`
              M 0,25 
              L ${nX - 52},25 
              C ${nX - 42},25 ${nX - 38},22 ${nX - 32},15 
              C ${nX - 22},5 ${nX - 12},0 ${nX},0 
              C ${nX + 12},0 ${nX + 22},5 ${nX + 32},15 
              C ${nX + 38},22 ${nX + 42},25 ${nX + 52},25 
              L 400,25 
              L 400,100 
              L 0,100 
              Z`} 
            fill="url(#barGradient)" 
            filter="url(#shadow)" 
          />
        </svg>
      </div>

      {/* Items de Navegación */}
      <div className="nav-items-layer">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} className="nav-btn" onClick={() => handleNavigation(item)}>
              <div className={isActive ? 'hidden-element' : 'nav-icon-box'}>
                <IonIcon icon={item.icon} className="nav-icon" /> 
              </div> 
              <span className={`nav-label ${isActive ? 'hidden-element' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentBottomNav;
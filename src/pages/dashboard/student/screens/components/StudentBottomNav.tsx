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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const onShow = () => {
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') setIsKeyboardVisible(true);
    };
    const onHide = () => setIsKeyboardVisible(false);

    window.addEventListener('keyboardWillShow', onShow);
    window.addEventListener('keyboardWillHide', onHide);
    window.addEventListener('focusin', onShow);
    window.addEventListener('focusout', onHide);

    return () => {
      window.removeEventListener('keyboardWillShow', onShow);
      window.removeEventListener('keyboardWillHide', onHide);
      window.removeEventListener('focusin', onShow);
      window.removeEventListener('focusout', onHide);
    };
  }, []);

  const navItems = useMemo(() => [
    { id: 'HOME', label: 'Inicio', icon: homeOutline },
    { id: 'MY_CLASSES', label: 'Clases', icon: bookOutline },
    { id: 'BATTLE', label: 'Batalla', icon: flashOutline },
    { id: 'ALLFORALL', label: 'Jugar', icon: colorPaletteOutline },
    { id: 'PROFILE', label: 'Perfil', icon: personOutline },
  ], []);

  const activeIndex = navItems.findIndex(item => item.id === activeScreen);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex; 
  const totalItems = navItems.length;
  const notchCenterX = (safeIndex / totalItems) * 100 + (50 / totalItems);
  const nX = notchCenterX * 4; 

  const handleNavigation = (item: any) => {
    if (location.pathname !== '/home') {
        history.push('/home');
        setTimeout(() => setActiveScreen(item.id), 50);
    } else {
        setActiveScreen(item.id);
    }
  };

  // 🔥 NUEVA LÓGICA DE VISIBILIDAD QUIRÚRGICA 🔥
  // Solo ocultamos si el teclado está activo O si el usuario está DENTRO de una batalla activa.
  // Pero NO la ocultamos en la pantalla de "Unirse a Batalla" (donde se pone el PIN).
  const isActuallyInGame = activeScreen === 'BATTLE' && (
    document.querySelector('.waiting-container') || // Clase común en pantalla de espera
    document.querySelector('.answers-grid-clean')   // Clase en pantalla de juego Kahoot
  );

  const shouldHideNav = isKeyboardVisible || isActuallyInGame;

  return (
    <div className={`student-nav-wrapper ${shouldHideNav ? 'nav-hidden-game' : 'nav-visible-fix'}`}>
      
      {/* CSS in JS para asegurar que el fix de altura se aplique a tu teléfono móvil */}
      <style>{`
        .nav-hidden-game { display: none !important; }
        
        .student-nav-wrapper.nav-visible-fix {
          height: 80px !important; /* Aumentado para que los iconos no se corten */
          padding-bottom: env(safe-area-inset-bottom) !important;
          background: transparent;
          transition: transform 0.3s ease;
        }

        /* Ajuste de los iconos para que no se salgan de la barra en el móvil */
        .nav-items-layer {
          height: 100%;
          display: flex;
          align-items: center;
          padding-top: 15px; /* Empuja los iconos hacia abajo para centrarlos en el diseño */
        }

        .nav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Botón Flotante Activo */}
      {!shouldHideNav && activeIndex !== -1 && (
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

      {/* Barra SVG */}
      {!shouldHideNav && (
        <div className="nav-svg-layer">
          <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8f9fa" />
              </linearGradient>
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
            />
          </svg>
        </div>
      )}

      {/* Items de Navegación */}
      {!shouldHideNav && (
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
      )}
    </div>
  );
};

export default StudentBottomNav;
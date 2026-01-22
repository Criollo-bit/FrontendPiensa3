import React, { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  homeOutline,        // Inicio
  personOutline,      // Perfil
  flashOutline,       // Batalla
  trophyOutline,      // Logros
  colorPaletteOutline,// All for All
  bookOutline         // Icono para Clases
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

  // 1. CONFIGURACIÓN DE SECCIONES
  const navItems = useMemo(() => [
    { 
      id: 'HOME', 
      label: 'Inicio', 
      icon: homeOutline,
      isRoute: false 
    },
    { 
      id: 'MY_CLASSES', 
      label: 'Clases', 
      icon: bookOutline, 
      isRoute: false // 🔥 CAMBIO IMPORTANTE: Ahora es interno, igual que Perfil
    },
    { 
      id: 'BATTLE', 
      label: 'Batalla', 
      icon: flashOutline,
      isRoute: false
    },
    { 
      id: 'REWARDS', 
      label: 'Insignias', 
      icon: trophyOutline,
      isRoute: false
    },
    { 
      id: 'ALLFORALL', 
      label: 'Jugar', 
      icon: colorPaletteOutline,
      isRoute: false
    },
    { 
      id: 'PROFILE', 
      label: 'Perfil', 
      icon: personOutline,
      isRoute: false
    },
    
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
        // Si no estamos en Home, volvemos primero para reiniciar el stack visual
        if (location.pathname !== '/home') {
            history.push('/home');
            setTimeout(() => setActiveScreen(item.id), 50);
        } else {
            setActiveScreen(item.id);
        }
    }
  };

  return (
    <div className="student-nav-wrapper">
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

      {/* Barra SVG */}
      <div className="nav-svg-layer">
        <svg width="100%" height="100%" viewBox="0 0 400 70" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8f9fa" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="-2" stdDeviation="4" floodOpacity="0.1"/>
            </filter>
          </defs>
          <path d={`M 0,18 L ${nX - 50},18 Q ${nX - 42},18 ${nX - 38},16 Q ${nX - 32},12 ${nX - 28},9 Q ${nX - 20},3 ${nX},0 Q ${nX + 20},3 ${nX + 28},9 Q ${nX + 32},12 ${nX + 38},16 Q ${nX + 42},18 ${nX + 50},18 L 400,18 L 400,70 L 0,70 Z`} fill="url(#barGradient)" filter="url(#shadow)" className="nav-svg-path" />
        </svg>
      </div>

      {/* Items */}
      <div className="nav-items-layer">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button key={item.id} className="nav-btn" onClick={() => handleNavigation(item)}>
              <div className={isActive ? 'hidden-element' : ''}>
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
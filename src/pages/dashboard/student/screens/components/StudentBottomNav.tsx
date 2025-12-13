import React, { useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  homeOutline,       // Inicio
  personOutline,     // Perfil
  flashOutline,      // Batalla
  trophyOutline,     // Logros
  colorPaletteOutline // All for All (Si lo usas)
} from 'ionicons/icons';
import './StudentBottomNav.css';

interface StudentBottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
}

const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  
  // 1. CONFIGURACIÓN DE SECCIONES (Orden: Home -> Batalla -> Logros -> Perfil)
  const navItems = useMemo(() => [
    { 
      id: 'HOME', 
      label: 'Inicio', 
      icon: homeOutline 
    },
    { 
      id: 'BATTLE', 
      label: 'Batalla', 
      icon: flashOutline 
    },
    { 
      id: 'REWARDS', 
      label: 'Insignias', 
      icon: trophyOutline 
    },
    { 
      id: 'PROFILE', 
      label: 'Perfil', 
      icon: personOutline 
    },
  ], []);

  // 2. CÁLCULOS (Lógica copiada de tu referencia)
  const activeIndex = navItems.findIndex(item => item.id === activeScreen);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex; // Default a 0 si no encuentra

  const totalItems = navItems.length;
  
  // Cálculo del centro de la muesca en porcentaje (0-100)
  const notchCenterX = (safeIndex / totalItems) * 100 + (50 / totalItems);

  // El SVG tiene un viewBox de width=400. Convertimos % a unidades SVG.
  const nX = notchCenterX * 4;

  return (
    <div className="student-nav-wrapper">
      
      {/* A. Botón Flotante Activo (Estilo copiado: Círculo negro en blanco) */}
      {activeIndex !== -1 && (
        <div 
          className="floating-active-container"
          style={{ left: `${notchCenterX}%` }}
        >
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

      {/* B. Barra SVG con Curva (Estilo copiado) */}
      <div className="nav-svg-layer">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 70"
          preserveAspectRatio="none"
        >
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
            d={`
              M 0,18
              L ${nX - 50},18
              Q ${nX - 42},18 ${nX - 38},16
              Q ${nX - 32},12 ${nX - 28},9
              Q ${nX - 20},3 ${nX},0
              Q ${nX + 20},3 ${nX + 28},9
              Q ${nX + 32},12 ${nX + 38},16
              Q ${nX + 42},18 ${nX + 50},18
              L 400,18
              L 400,70
              L 0,70
              Z
            `}
            fill="url(#barGradient)"
            filter="url(#shadow)"
            className="nav-svg-path"
          />
        </svg>
      </div>

      {/* C. Items de Navegación */}
      <div className="nav-items-layer">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              className="nav-btn"
              onClick={() => setActiveScreen(item.id)}
            >
              {/* Contenedor del icono (Oculto si activo) */}
              <div className={isActive ? 'hidden-element' : ''}>
                <IonIcon icon={item.icon} className="nav-icon" />
              </div>
              
              {/* Etiqueta (Oculta si activo) */}
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
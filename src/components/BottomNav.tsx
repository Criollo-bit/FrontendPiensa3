import React from 'react';
import { IonIcon } from '@ionic/react';
import { personOutline, schoolOutline, trophyOutline, gameControllerOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './BottomNav.css';

interface NavItemData {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavProps {
  role: 'TEACHER' | 'STUDENT';
}

const BottomNav: React.FC<BottomNavProps> = ({ role }) => {
  const history = useHistory();
  const location = useLocation();

  // Definimos los ítems según el rol (Adaptado a tus rutas reales)
  const navItems: NavItemData[] = role === 'TEACHER' 
    ? [
        { id: 'home', label: 'Inicio', icon: personOutline, path: '/home' },
        { id: 'subjects', label: 'Clases', icon: schoolOutline, path: '/subjects' },
        { id: 'points', label: 'Puntos', icon: trophyOutline, path: '/assign-points' },
        { id: 'battle', label: 'Torneo', icon: gameControllerOutline, path: '/home' }, // A futuro: /tournament
      ]
    : [
        { id: 'home', label: 'Inicio', icon: personOutline, path: '/home' },
        { id: 'subjects', label: 'Clases', icon: schoolOutline, path: '/subjects' },
        { id: 'redeem', label: 'Canjear', icon: trophyOutline, path: '/home' }, // A futuro: /redeem
      ];

  // Encontrar el índice activo basado en la URL actual
  const activeIndex = navItems.findIndex(item => location.pathname === item.path);
  
  // Si estamos en una página que no tiene nav (ej. login), no renderizar nada
  if (location.pathname === '/login' || location.pathname === '/') return null;

  // Calcular la posición de la curva (Notch)
  // 50 es el centro porcentual si hay 1 item. Ajustamos dinámicamente.
  const totalItems = navItems.length;
  // Cada ítem ocupa (100 / totalItems) del ancho.
  // El centro de cada ítem es: (index * ancho_item) + (ancho_item / 2)
  const itemWidth = 100 / totalItems;
  const notchCenterX = activeIndex !== -1 
    ? (activeIndex * itemWidth) + (itemWidth / 2)
    : -100; // Si no hay activo, esconder la curva lejos

  const handleNavClick = (path: string) => {
    history.push(path);
  };

  return (
    <div className="bottom-nav-container">
      
      {/* Botón Flotante Activo */}
      {activeIndex !== -1 && (
        <div 
          className="floating-active-btn"
          style={{ left: `calc(${notchCenterX}% - 30px)` }}
        >
          <div className="floating-inner-circle">
            <IonIcon icon={navItems[activeIndex].icon} className="floating-icon" />
          </div>
        </div>
      )}

      {/* SVG de Fondo con Curva */}
      <svg className="nav-background-svg" viewBox="0 0 400 70" preserveAspectRatio="none">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="-2" stdDeviation="4" floodOpacity="0.1"/>
          </filter>
        </defs>
        <path
          className="nav-background-path"
          filter="url(#shadow)"
          d={`
            M 0,0
            L ${notchCenterX * 4 - 50},0
            Q ${notchCenterX * 4 - 42},0 ${notchCenterX * 4 - 38},2
            Q ${notchCenterX * 4 - 32},6 ${notchCenterX * 4 - 28},9
            Q ${notchCenterX * 4 - 20},15 ${notchCenterX * 4},18
            Q ${notchCenterX * 4 + 20},15 ${notchCenterX * 4 + 28},9
            Q ${notchCenterX * 4 + 32},6 ${notchCenterX * 4 + 38},2
            Q ${notchCenterX * 4 + 42},0 ${notchCenterX * 4 + 50},0
            L 400,0
            L 400,70
            L 0,70
            Z
          `}
        />
      </svg>

      {/* Ítems de Navegación */}
      <div className="nav-items-container">
        {navItems.map((item, index) => (
          <button
            key={item.id}
            className={`nav-item-btn ${activeIndex === index ? 'active' : ''}`}
            onClick={() => handleNavClick(item.path)}
            style={{ width: `${itemWidth}%` }}
          >
            <IonIcon icon={item.icon} className="nav-item-icon" />
            <span className="nav-item-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
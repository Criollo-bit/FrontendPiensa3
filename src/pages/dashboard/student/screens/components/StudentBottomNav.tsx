import React from 'react';
import { IonIcon } from '@ionic/react';
import { 
  homeOutline, 
  giftOutline, 
  personOutline,
  bookOutline 
} from 'ionicons/icons';
import './StudentBottomNav.css';

interface StudentBottomNavProps {
  activeScreen: string;
  setActiveScreen: (screen: any) => void;
}

const StudentBottomNav: React.FC<StudentBottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  
  // Definimos las pantallas disponibles en la barra
  const navItems = [
    { id: 'HOME', label: 'Inicio', icon: homeOutline },
    { id: 'SUBJECTS', label: 'Clases', icon: bookOutline }, // Nueva pantalla futura
    { id: 'REWARDS', label: 'Premios', icon: giftOutline },
    { id: 'PROFILE', label: 'Perfil', icon: personOutline },
  ];

  // Encontrar índice activo para cálculos matemáticos
  const activeIndex = navItems.findIndex(item => item.id === activeScreen);

  // --- LÓGICA MATEMÁTICA DEL SVG (Portado del original) ---
  // Calcula el porcentaje exacto (X) donde debe estar la curva
  const totalItems = navItems.length;
  // Si no hay activo (ej: pantalla Waiting), ponemos la muesca fuera o en medio
  const safeIndex = activeIndex === -1 ? 0 : activeIndex; 
  
  // Fórmula: (Index / Total) * 100 + (Mitad del ancho de cada segmento)
  const notchCenterX = (safeIndex / totalItems) * 100 + (50 / totalItems);

  // Si estamos en una pantalla que no está en el menú (ej: WAITING), ocultamos la barra flotante?
  // Por ahora la dejaremos visible en el último conocido o primero.
  
  return (
    <div className="student-nav-container">
      
      {/* 1. Botón Flotante (El círculo azul que se mueve) */}
      {activeIndex !== -1 && (
        <div 
          className="floating-notch-wrapper"
          style={{ left: `${notchCenterX}%` }}
        >
          <div className="floating-circle">
            <IonIcon icon={navItems[activeIndex].icon} style={{ fontSize: '24px' }} />
          </div>
        </div>
      )}

      {/* 2. El Fondo SVG Curvado */}
      <svg
        className="nav-svg-bg"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
      >
        <path
          d={`
            M 0,20
            L ${notchCenterX * 4 - 50},20
            Q ${notchCenterX * 4 - 42},20 ${notchCenterX * 4 - 38},18
            Q ${notchCenterX * 4 - 32},14 ${notchCenterX * 4 - 28},10
            Q ${notchCenterX * 4 - 20},0 ${notchCenterX * 4},0
            Q ${notchCenterX * 4 + 20},0 ${notchCenterX * 4 + 28},10
            Q ${notchCenterX * 4 + 32},14 ${notchCenterX * 4 + 38},18
            Q ${notchCenterX * 4 + 42},20 ${notchCenterX * 4 + 50},20
            L 400,20
            L 400,80
            L 0,80
            Z
          `}
          fill="white"
          className="nav-path"
        />
      </svg>

      {/* 3. Iconos y Textos */}
      <div className="nav-items-container">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              className="nav-item-btn"
              onClick={() => setActiveScreen(item.id)}
            >
              {/* El icono desaparece si está activo (porque sube al círculo flotante) */}
              <IonIcon 
                icon={item.icon} 
                className={`nav-icon ${isActive ? 'hidden' : ''}`} 
              />
              
              {/* El texto desaparece si está activo */}
              <span className={`nav-label ${isActive ? 'hidden' : ''}`}>
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
import React, { useState, useEffect, useMemo } from 'react';
import { IonIcon } from '@ionic/react';
import { homeOutline, flashOutline, colorPaletteOutline, giftOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { TeacherScreen, Screen, CustomModule, AppRole } from '../../../../AppTypes'; 
import './TeacherBottomNav.css';

interface TeacherBottomNavProps {
  activeScreen: TeacherScreen | string;
  setActiveScreen: (screen: TeacherScreen | string) => void;
  enabledModules?: Set<Screen | TeacherScreen | string>;
  customModules?: CustomModule[];
}

interface NavItemData {
  screen: TeacherScreen | string;
  label: string;
  icon: string;
}

const NavItem: React.FC<{
  item: NavItemData;
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => (
  <button 
    className={`nav-item-btn ${isActive ? 'active' : ''}`} 
    onClick={onClick}
  >
    <div className="nav-item-icon-wrapper">
      <IonIcon icon={item.icon} className="nav-item-icon" />
    </div>
    <span className="nav-item-label">{item.label}</span>
  </button>
);

const TeacherBottomNav: React.FC<TeacherBottomNavProps> = ({ 
  activeScreen, 
  setActiveScreen, 
  enabledModules = new Set(), 
  customModules = [] 
}) => {
  
  // 🔥 ESTADO INICIAL SIEMPRE EN FALSE: La barra es estática por defecto
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const onShow = () => {
      // Validación de seguridad: Solo ocultar si el foco está en un campo de entrada real
      const activeEl = document.activeElement?.tagName;
      if (activeEl === 'INPUT' || activeEl === 'TEXTAREA') {
        setIsKeyboardVisible(true);
      }
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

  const allStandardNavItems: NavItemData[] = [
    { screen: TeacherScreen.Dashboard, label: 'Inicio', icon: homeOutline },
    { screen: TeacherScreen.BattleManager, label: 'Batallas', icon: flashOutline },
    { screen: TeacherScreen.AllForAll, label: 'All for All', icon: colorPaletteOutline },
    { screen: 'rewards', label: 'Premios', icon: giftOutline },
    { screen: TeacherScreen.StudentList, label: 'Alumnos', icon: peopleOutline },
    { screen: TeacherScreen.Profile, label: 'Perfil', icon: personOutline },
  ];

  const standardNavItems = useMemo(() => 
    enabledModules.size > 0 
      ? allStandardNavItems.filter(item => enabledModules.has(item.screen))
      : allStandardNavItems
  , [enabledModules]);

  const customNavItems = useMemo(() => 
    customModules
      .filter(module => module.role === AppRole.Teacher && enabledModules.has(module.id))
      .map(module => ({
          screen: module.id,
          label: module.name,
          icon: module.icon 
      }))
  , [customModules, enabledModules]);

  const navItems = [...standardNavItems, ...customNavItems];
  const activeIndex = navItems.findIndex(item => item.screen === activeScreen);

  if (navItems.length === 0) return null;

  const notchCenterX = activeIndex !== -1
    ? (activeIndex / navItems.length) * 100 + (50 / navItems.length)
    : 50;

  const nX = notchCenterX * 4;

  // 🔥 LÓGICA DE VISIBILIDAD REFORZADA: Solo aplica 'keyboard-active' si el teclado está arriba
  // 'nav-visible-static' asegura que la barra no desaparezca al navegar
  const navClass = isKeyboardVisible 
    ? 'teacher-nav-container keyboard-active' 
    : 'teacher-nav-container nav-visible-static';

  return (
    <div className={navClass}>
      {/* Botón Flotante Activo */}
      {activeIndex !== -1 && (
        <div 
          className="floating-active-btn"
          style={{ left: `${notchCenterX}%` }}
        >
          <div className="floating-inner-circle">
            <IonIcon icon={navItems[activeIndex].icon} className="floating-icon" />
          </div>
        </div>
      )}

      {/* Barra de Fondo con SVG Curvo - Ajustada para cubrir iconos totalmente */}
      <div className="nav-background-svg-wrapper">
        <svg width="100%" height="100%" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="barGradientTeacher" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f8f9fa" />
            </linearGradient>
          </defs>
          <path
            className="nav-path"
            fill="url(#barGradientTeacher)"
            d={`
              M 0,25 
              L ${nX - 55},25 
              C ${nX - 45},25 ${nX - 40},22 ${nX - 35},15 
              C ${nX - 22},5 ${nX - 12},0 ${nX},0 
              C ${nX + 12},0 ${nX + 22},5 ${nX + 32},15 
              C ${nX + 38},22 ${nX + 42},25 ${nX + 55},25 
              L 400,25 
              L 400,100 
              L 0,100 
              Z
            `}
          />
        </svg>
      </div>

      <div className="nav-items-wrapper">
        {navItems.map((item) => (
          <NavItem
            key={item.screen}
            item={item}
            isActive={activeScreen === item.screen}
            onClick={() => setActiveScreen(item.screen)}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherBottomNav;
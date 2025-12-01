import React from 'react';
import { IonIcon } from '@ionic/react';
import { homeOutline, flashOutline, colorPaletteOutline, giftOutline, peopleOutline, personOutline } from 'ionicons/icons';
import { TeacherScreen, Screen, CustomModule, AppRole } from '../../../../AppTypes'; // Ajusta la ruta a tus tipos
import './TeacherBottomNav.css'; // Importamos los estilos CSS

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

// Sub-componente NavItem (interno)
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
  
  // 1. Definimos los ítems estándar
  const allStandardNavItems: NavItemData[] = [
    { screen: TeacherScreen.Dashboard, label: 'Inicio', icon: homeOutline },
    { screen: TeacherScreen.BattleManager, label: 'Batallas', icon: flashOutline },
    { screen: TeacherScreen.AllForAll, label: 'All for All', icon: colorPaletteOutline },
    { screen: 'rewards', label: 'Premios', icon: giftOutline },
    { screen: TeacherScreen.StudentList, label: 'Alumnos', icon: peopleOutline },
    { screen: TeacherScreen.Profile, label: 'Perfil', icon: personOutline },
  ];

  // 2. Filtramos según módulos habilitados (si usas esa lógica, si no, muestra todos)
  // Para probar, si enabledModules está vacío, mostramos todos por defecto o los filtramos.
  // Asumiremos que queremos mostrar todos si el Set está vacío para desarrollo.
  const standardNavItems = enabledModules.size > 0 
    ? allStandardNavItems.filter(item => enabledModules.has(item.screen))
    : allStandardNavItems;

  // 3. Módulos personalizados (si los hay)
  const customNavItems = customModules
    .filter(module => module.role === AppRole.Teacher && enabledModules.has(module.id))
    .map(module => ({
        screen: module.id,
        label: module.name,
        icon: module.icon // Asumiendo que el string del icono es compatible con IonIcon
    }));

  const navItems = [...standardNavItems, ...customNavItems];
  const activeIndex = navItems.findIndex(item => item.screen === activeScreen);

  if (navItems.length === 0) return null;

  // 4. Cálculo matemático para la curva (Notch)
  // Mueve la curva al centro del botón activo
  const notchCenterX = activeIndex !== -1
    ? (activeIndex / navItems.length) * 100 + (50 / navItems.length)
    : 50;

  return (
    <div className="bottom-nav-container">
      
      {/* Botón Flotante Activo (La bola negra) */}
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

      {/* Barra de Fondo con SVG Curvo */}
      <svg className="nav-background-svg" viewBox="0 0 400 70" preserveAspectRatio="none">
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
            M 0,18
            L ${notchCenterX * 4 - 50},18
            Q ${notchCenterX * 4 - 42},18 ${notchCenterX * 4 - 38},16
            Q ${notchCenterX * 4 - 32},12 ${notchCenterX * 4 - 28},9
            Q ${notchCenterX * 4 - 20},3 ${notchCenterX * 4},0
            Q ${notchCenterX * 4 + 20},3 ${notchCenterX * 4 + 28},9
            Q ${notchCenterX * 4 + 32},12 ${notchCenterX * 4 + 38},16
            Q ${notchCenterX * 4 + 42},18 ${notchCenterX * 4 + 50},18
            L 400,18
            L 400,70
            L 0,70
            Z
          `}
        />
      </svg>

      {/* Ítems de Navegación */}
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
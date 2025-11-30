import React from 'react';
import { IonIcon } from '@ionic/react';
import { flashOutline, peopleOutline, schoolOutline, trophyOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

// CORRECCIÓN: Importamos TeacherScreen (así se llama en tu AppTypes.ts)
import { TeacherScreen } from '../../../../AppTypes';

// Importamos los estilos CSS (asegúrate de que este archivo exista en la misma carpeta)
import './DashboardScreen.css';

interface DashboardScreenProps {
  navigateTo: (screen: TeacherScreen) => void;
}

// Componente ActionCard reutilizable (Estilo Tarjeta Blanca)
const ActionCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: string; 
  onClick: () => void; 
  delay: string 
}> = ({ title, description, icon, onClick, delay }) => (
  <button 
    onClick={onClick} 
    className="action-card-btn"
    style={{ animation: `slideUp 0.5s ease-out backwards`, animationDelay: delay }}
  >
    <div className="card-icon-wrapper">
      <IonIcon icon={icon} />
    </div>
    <div className="card-text-wrapper">
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  </button>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigateTo }) => {
  const history = useHistory();

  return (
    <div className="dashboard-screen">
      
      {/* Encabezado */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel de Docente</h1>
        <p className="dashboard-subtitle">Gestiona tus clases y actividades.</p>
      </div>

      {/* Lista de Acciones */}
      <div className="cards-container">
        
        {/* Botón: Crear Batalla (Navegación Interna) */}
        <ActionCard
          title="Crear Batalla"
          description="Inicia una nueva competencia para tus estudiantes."
          icon={flashOutline}
          onClick={() => navigateTo(TeacherScreen.BattleManager)}
          delay="100ms"
        />
        
        {/* Botón: Ver Estudiantes (Navegación Interna) */}
        <ActionCard
          title="Ver Estudiantes"
          description="Revisa el progreso y los logros de tu clase."
          icon={peopleOutline}
          onClick={() => navigateTo(TeacherScreen.StudentList)}
          delay="200ms"
        />

        {/* Botón: Mis Clases (Navegación Externa) */}
        <ActionCard
          title="Mis Clases"
          description="Administra tus materias y códigos de acceso."
          icon={schoolOutline}
          onClick={() => history.push('/subjects')}
          delay="300ms"
        />

        {/* Botón: Asignar Puntos (Navegación Externa) */}
        <ActionCard
          title="Asignar Puntos"
          description="Otorga puntos a los alumnos manualmente."
          icon={trophyOutline}
          onClick={() => history.push('/assign-points')}
          delay="400ms"
        />

      </div>
    </div>
  );
};

export default DashboardScreen;
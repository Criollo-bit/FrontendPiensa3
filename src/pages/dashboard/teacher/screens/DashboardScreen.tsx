import React, { useState } from 'react'; // <--- 1. Importamos useState
import { IonIcon, IonAlert } from '@ionic/react'; // <--- 2. Importamos IonAlert
// Agregamos addCircleOutline para el nuevo botón
import { flashOutline, peopleOutline, trophyOutline, addCircleOutline } from 'ionicons/icons'; 
import { useHistory } from 'react-router-dom';

import { TeacherScreen } from '../../../../AppTypes';

// Importamos el Modal (Asegúrate de que la ruta sea correcta donde guardaste el archivo)
import CreateSubjectModal from './CreateSubjectModal'; 

import './DashboardScreen.css';

interface DashboardScreenProps {
  navigateTo: (screen: TeacherScreen) => void;
}

// Componente ActionCard reutilizable (Sin cambios)
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

  // --- 3. ESTADOS PARA EL MODAL ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  return (
    <div className="dashboard-screen">
      
      {/* Encabezado */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel de Docente</h1>
        <p className="dashboard-subtitle">Gestiona tus clases y actividades.</p>
      </div>

      {/* Lista de Acciones */}
      <div className="cards-container">
        
        {/* 1. Crear Batalla */}
        <ActionCard
          title="Crear Batalla"
          description="Inicia una nueva competencia para tus estudiantes."
          icon={flashOutline}
          onClick={() => navigateTo(TeacherScreen.BattleManager)}
          delay="100ms"
        />
        
        {/* 2. Ver Estudiantes */}
        <ActionCard
          title="Ver Estudiantes"
          description="Revisa el progreso y los logros de tu clase."
          icon={peopleOutline}
          onClick={() => navigateTo(TeacherScreen.StudentList)}
          delay="200ms"
        />

        {/* 3. Asignar Puntos */}
        <ActionCard
          title="Asignar Puntos"
          description="Otorga puntos a los alumnos manualmente."
          icon={trophyOutline}
          onClick={() => history.push('/assign-points')}
          delay="300ms"
        />

        {/* --- 4. NUEVO BOTÓN: CREAR MATERIA --- */}
        <ActionCard
          title="Crear Materia"
          description="Genera una nueva asignatura y obtén el código de acceso."
          icon={addCircleOutline}
          onClick={() => setIsCreateModalOpen(true)}
          delay="400ms"
        />

      </div>

      {/* --- 5. RENDERIZADO DEL MODAL Y ALERTA --- */}
      <CreateSubjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => setShowSuccessAlert(true)}
      />

      <IonAlert
        isOpen={showSuccessAlert}
        onDidDismiss={() => setShowSuccessAlert(false)}
        header="¡Materia Creada!"
        subHeader="Código Generado"
        message="La materia se ha creado correctamente. Comparte el código con tus alumnos para que se unan."
        buttons={['Entendido']}
      />

    </div>
  );
};

export default DashboardScreen;
import React, { useState } from 'react'; 
import { IonIcon, IonAlert } from '@ionic/react'; 
import { flashOutline, peopleOutline, trophyOutline, addCircleOutline } from 'ionicons/icons'; 
import { useHistory } from 'react-router-dom';

import { TeacherScreen } from '../../../../AppTypes';

// Importamos el Modal de Crear Materia
import CreateSubjectModal from './CreateSubjectModal'; 

import './DashboardScreen.css';

// 🔥 CAMBIO 1: Agregamos la propiedad opcional onOpenAssignPoints
interface DashboardScreenProps {
  navigateTo: (screen: TeacherScreen) => void;
  onOpenAssignPoints?: () => void; 
}

// Componente ActionCard reutilizable
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

// 🔥 CAMBIO 2: Desestructuramos onOpenAssignPoints
const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigateTo, onOpenAssignPoints }) => {
  const history = useHistory();

  // Estados para el modal de Crear Materia
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

        {/* 3. Asignar Puntos (MODIFICADO) */}
        <ActionCard
          title="Asignar Puntos"
          description="Otorga puntos a los alumnos manualmente."
          icon={trophyOutline}
          // 🔥 CAMBIO 3: Usamos la función del modal en lugar de history.push
          onClick={() => {
            if (onOpenAssignPoints) {
                onOpenAssignPoints();
            } else {
                console.warn("Función onOpenAssignPoints no proporcionada");
            }
          }}
          delay="300ms"
        />

        {/* 4. Crear Materia */}
        <ActionCard
          title="Crear Materia"
          description="Genera una nueva asignatura y obtén el código."
          icon={addCircleOutline}
          onClick={() => setIsCreateModalOpen(true)}
          delay="400ms"
        />

      </div>

      {/* RENDERIZADO DEL MODAL DE MATERIAS Y ALERTA */}
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
        message="La materia se ha creado correctamente. Comparte el código con tus alumnos."
        buttons={['Entendido']}
      />

    </div>
  );
};

export default DashboardScreen;
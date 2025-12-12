import React, { useState, useEffect } from 'react';
import { IonIcon, IonToast, IonSpinner } from '@ionic/react';
import { 
  schoolOutline, trophy, star 
} from 'ionicons/icons';

import { User } from '../../../../AppTypes';
import { api } from '../../../../api/axios'; 
import EditStudentProfileModal, { EditableStudent } from './EditStudentProfileModal';
import '../../teacher/screens/TeacherProfileScreen.css'; 

interface StudentProfileScreenProps {
  user: User;
  onLogout: () => void;
}

const StudentProfileScreen: React.FC<StudentProfileScreenProps> = ({ user, onLogout }) => {
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  const [profileData, setProfileData] = useState<EditableStudent>({
    ...user,
    bio: ''
  });

  const [stats, setStats] = useState({
    totalPoints: 0,
    enrolledSubjects: 0,
    level: 1
  });

  useEffect(() => {
    loadUserProfile();
    loadStudentStats();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  // --- API ---

  const loadUserProfile = async () => {
    try {
      // CORRECCIÓN: Usamos /auth/me
      const response = await api.get('/auth/me');
      const backendUser = response.data;

      setProfileData(prev => ({
        ...prev,
        name: backendUser.fullName,
        email: backendUser.email,
        bio: backendUser.bio,
        avatarUrl: backendUser.avatarUrl,
        id: backendUser.id
      }));

    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStudentStats = async () => {
    try {
      const { data } = await api.get('/enrollment/student'); 
      const totalPoints = data.reduce((acc: number, curr: any) => acc + (curr.accumulatedPoints || 0), 0);
      const subjectsCount = data.length;
      const calculatedLevel = Math.floor(totalPoints / 100) + 1; 

      setStats({
        totalPoints,
        enrolledSubjects: subjectsCount,
        level: calculatedLevel
      });

    } catch (error) {
      console.error("Error loading stats", error);
    }
  };

  const handleSaveProfile = async (updatedData: { fullName: string; bio: string; avatarUrl: string }) => {
    setIsLoading(true);
    try {
      // CORRECCIÓN: Usamos /auth/me
      const response = await api.patch('/auth/me', updatedData);
      const updatedUser = response.data;

      setProfileData(prev => ({
        ...prev,
        name: updatedUser.fullName,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl
      }));
      
      setIsEditModalOpen(false);
      setErrorMsg(null);

    } catch (error) {
      console.error('Error saving:', error);
      setErrorMsg('Error al guardar los cambios.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayImage = profileData.avatarUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`;

  return (
    <div className="profile-screen-container">
      <main className="profile-content" onScroll={handleScroll}>
        <div style={{ marginBottom: '1rem' }}>
          <div className="hero-image-container">
            <img
              src={displayImage}
              alt={profileData.name}
              className="hero-image"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.5, 100)}px) scale(${1 + Math.min(scrollY * 0.001, 0.3)})`
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('ui-avatars.com')) {
                    target.src = `https://ui-avatars.com/api/?name=${profileData.name}&background=random`;
                }
              }}
            />
          </div>

          <div className="profile-main-card">
            <h1 className="profile-name">{profileData.name}</h1>
            <p className="profile-role">
              <IonIcon icon={schoolOutline} />
              Estudiante
            </p>
            
            {profileData.bio && (
                <p style={{fontSize: '0.9rem', color: '#475569', margin: '10px 0', fontStyle: 'italic'}}>
                    "{profileData.bio}"
                </p>
            )}

            <div className="stats-row">
              <div>
                <div className="stat-number" style={{ color: '#0ea5e9' }}>{stats.level}</div>
                <div className="stat-label">Nivel</div>
              </div>
              <div>
                <div className="stat-number">{stats.totalPoints}</div>
                <div className="stat-label">Puntos Totales</div>
              </div>
              <div>
                <div className="stat-number">{stats.enrolledSubjects}</div>
                <div className="stat-label">Materias</div>
              </div>
            </div>

            <div className="action-buttons-row">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="btn-edit-profile"
                style={{ background: '#0ea5e9' }} 
              >
                Editar Perfil
              </button>
              <button onClick={onLogout} className="btn-logout">
                Salir
              </button>
            </div>
          </div>
        </div>

        <div className="info-section">
          <div className="glass-card-modern">
            <h3 className="section-title">
              <IonIcon icon={trophy} style={{ color: '#f59e0b' }} />
              Logros Destacados
            </h3>
            <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', padding: '10px' }}>
                <IonIcon icon={star} style={{ fontSize: '2rem', marginBottom: '5px', opacity: 0.3 }} /><br/>
                ¡Pronto verás tus medallas aquí!
            </div>
          </div>
        </div>
      </main>

      <EditStudentProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profileData}
        onSave={handleSaveProfile}
        isLoading={isLoading}
      />
      
      <IonToast
        isOpen={!!errorMsg}
        message={errorMsg || ''}
        duration={3000}
        color="danger"
        onDidDismiss={() => setErrorMsg(null)}
      />
    </div>
  );
};

export default StudentProfileScreen;
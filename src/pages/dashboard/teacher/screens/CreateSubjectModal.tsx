import React, { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { closeOutline, bookOutline, timeOutline, calendarOutline } from 'ionicons/icons';
import { api } from '../../../../api/axios'; // Ajusta la ruta a tu api

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Para recargar la lista o mostrar alerta
}

const CreateSubjectModal: React.FC<CreateSubjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cycle: 'Ciclo 1', // Valor por defecto
    year: new Date().getFullYear(),
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('El nombre es obligatorio');

    setLoading(true);
    try {
      // Llamada al backend POST /subjects
      await api.post('/subjects', {
        name: formData.name,
        cycle: formData.cycle,
        year: Number(formData.year), // Aseguramos que sea número
      });

      // Limpiar y cerrar
      setFormData({ name: '', cycle: 'Ciclo 1', year: new Date().getFullYear() });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al crear la materia');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-up" style={{background:'white', width:'90%', maxWidth:'400px', borderRadius:'20px', padding:'20px'}}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6" style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
          <h2 className="text-xl font-bold text-slate-800" style={{margin:0, fontSize:'1.5rem', color:'#1e293b'}}>Nueva Materia</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100" style={{background:'transparent', border:'none', cursor:'pointer'}}>
            <IonIcon icon={closeOutline} style={{fontSize:'1.5rem'}} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          
          {/* Nombre */}
          <div>
            <label style={{display:'block', marginBottom:'5px', color:'#64748b', fontSize:'0.9rem'}}>Nombre de la Materia</label>
            <div style={{display:'flex', alignItems:'center', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'10px'}}>
               <IonIcon icon={bookOutline} style={{marginRight:'10px', color:'#94a3b8'}} />
               <input 
                 type="text" 
                 placeholder="Ej. Matemáticas Avanzadas"
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 style={{border:'none', outline:'none', width:'100%', fontSize:'1rem'}}
                 required
               />
            </div>
          </div>

          <div style={{display:'flex', gap:'15px'}}>
            {/* Ciclo */}
            <div style={{flex:1}}>
              <label style={{display:'block', marginBottom:'5px', color:'#64748b', fontSize:'0.9rem'}}>Ciclo</label>
              <div style={{display:'flex', alignItems:'center', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'10px'}}>
                 <IonIcon icon={timeOutline} style={{marginRight:'10px', color:'#94a3b8'}} />
                 <select 
                   value={formData.cycle}
                   onChange={e => setFormData({...formData, cycle: e.target.value})}
                   style={{border:'none', outline:'none', width:'100%', background:'white'}}
                 >
                   <option>Ciclo 1</option>
                   <option>Ciclo 2</option>
                   <option>Ciclo 3</option>
                   <option>Ciclo 4</option>
                 </select>
              </div>
            </div>

            {/* Año */}
            <div style={{flex:1}}>
              <label style={{display:'block', marginBottom:'5px', color:'#64748b', fontSize:'0.9rem'}}>Año</label>
              <div style={{display:'flex', alignItems:'center', border:'1px solid #cbd5e1', borderRadius:'10px', padding:'10px'}}>
                 <IonIcon icon={calendarOutline} style={{marginRight:'10px', color:'#94a3b8'}} />
                 <input 
                   type="number" 
                   value={formData.year}
                   onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                   style={{border:'none', outline:'none', width:'100%'}}
                 />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop:'20px', padding:'15px', borderRadius:'12px', border:'none',
              background: loading ? '#94a3b8' : '#0f172a', color:'white', fontWeight:'bold', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? <IonSpinner name="crescent" color="light" /> : 'Crear Materia'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateSubjectModal;
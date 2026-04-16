import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diplomas, AVAILABLE_SUBJECTS } from '../data/mockData'; 
import { registerUser } from '../services/api';

export default function Register() {
  const [role, setRole] = useState('parent');
  const [formData, setFormData] = useState({
     name: '', phone: '', city: '', password: '', diploma_level: '', hourly_rate: 0, subjects: []
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleDiplomaChange = (e) => {
     const selectedId = e.target.value;
     const diplomaObj = diplomas.find(d => d.id === selectedId);
     setFormData({ ...formData, diploma_level: selectedId, hourly_rate: diplomaObj ? diplomaObj.hourlyRate : 0 });
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;
    
    if (checked) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, value] }));
    } else {
      setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== value) }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (role === 'teacher' && formData.subjects.length === 0) {
          throw new Error("Veuillez sélectionner au moins une matière.");
      }

      const finalData = { ...formData, role };
      if (role === 'teacher') {
          finalData.subjects = finalData.subjects.join(', ');
      }
      
      await registerUser(finalData);
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card glass">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Créer un compte</h2>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className={`btn ${role === 'parent' ? 'btn-primary' : 'btn-outline'}`} 
            style={{ flex: 1 }} 
            onClick={() => setRole('parent')}
            type="button"
          >
            Parent d'élève
          </button>
          <button 
             className={`btn ${role === 'teacher' ? 'btn-primary' : 'btn-outline'}`} 
             style={{ flex: 1 }} 
             onClick={() => setRole('teacher')}
             type="button"
          >
            Enseignant
          </button>
        </div>
        
        {errorMsg && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid #f87171' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Nom et Prénoms</label>
            <input type="text" placeholder="Ex: Kouamé Jean" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>N° de téléphone (Côte d'Ivoire)</label>
            <input type="text" placeholder="+225 00 00 00 00 00" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Ville / Commune</label>
            <input type="text" placeholder="Ex: Abidjan (Cocody)" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          </div>

          {role === 'teacher' && (
            <div className="form-group animate-fade-in" style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              
              <label style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Matières enseignées</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                {AVAILABLE_SUBJECTS.map((sub, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                       type="checkbox" 
                       value={sub} 
                       checked={formData.subjects.includes(sub)} 
                       onChange={handleSubjectChange} 
                    />
                    {sub}
                  </label>
                ))}
              </div>

              <label style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Votre dernier diplôme obtenu</label>
              <select required value={formData.diploma_level} onChange={handleDiplomaChange}>
                <option value="">Sélectionnez votre diplôme...</option>
                {diplomas.map(d => (
                  <option key={d.id} value={d.id}>{d.label} (Base: {d.hourlyRate} FCFA / h)</option>
                ))}
              </select>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '0.75rem', lineHeight: '1.4' }}>
                Note : Sur EduCoursCI, le tarif horaire final sera ce tarif de base + un bonus selon la classe (ex: Lycée, Terminale).
              </p>
            </div>
          )}

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={isLoading}>
            {isLoading ? "Enregistrement en cours..." : "M'inscrire gratuitement"}
          </button>
        </form>
      </div>
    </div>
  );
}

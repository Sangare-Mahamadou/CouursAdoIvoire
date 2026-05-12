import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diplomas, AVAILABLE_SUBJECTS } from '../data/mockData'; 
import { registerUser } from '../services/api';

export default function Register() {
  const [role, setRole] = useState('parent');
  const [formData, setFormData] = useState({
     name: '', email: '', phone: '', city: '', password: '', diploma_level: '', subjects: [], availability_days: 5
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [customSubject, setCustomSubject] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  
  const navigate = useNavigate();

  const handleDiplomaChange = (e) => {
     const selectedId = e.target.value;
     setFormData({ ...formData, diploma_level: selectedId });
  };

  // handleSubjectChange is now done directly in the render

  const handleAddCustomSubject = () => {
    if (customSubject.trim() && customPrice) {
      // Check if it already exists to avoid duplicates
      if (!formData.subjects.some(s => s.name.toLowerCase() === customSubject.trim().toLowerCase())) {
        setFormData(prev => ({
          ...prev,
          subjects: [...prev.subjects, { name: customSubject.trim(), price: customPrice }]
        }));
      }
      setCustomSubject('');
      setCustomPrice('');
    }
  };

  const handleRemoveCustomSubject = (subjectName) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.name !== subjectName)
    }));
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Veuillez saisir une adresse e-mail valide.");
      }

      // Validation du téléphone
      let phone = formData.phone.replace(/\s/g, ''); // enlever les espaces
      if (phone.startsWith('+225')) {
        phone = phone.substring(4);
      }
      if (!/^\d{10}$/.test(phone)) {
        throw new Error("Le numéro de téléphone doit contenir 10 chiffres.");
      }
      const finalPhone = `+225${phone}`;

      if (role === 'teacher' && formData.subjects.length === 0) {
          throw new Error("Veuillez sélectionner au moins une matière.");
      }
      if (role === 'teacher' && !profilePicture) {
          throw new Error("Veuillez ajouter une photo de profil (obligatoire pour les enseignants).");
      }

      let submitData;
      if (role === 'teacher') {
          submitData = new FormData();
          submitData.append('role', role);
          submitData.append('name', formData.name);
          submitData.append('email', formData.email);
          submitData.append('phone', finalPhone);
          submitData.append('city', formData.city);
          submitData.append('password', formData.password);
          submitData.append('diploma_level', formData.diploma_level);
          submitData.append('subjects', JSON.stringify(formData.subjects));
          submitData.append('availability_days', formData.availability_days);
          submitData.append('profile_picture', profilePicture);
      } else {
          submitData = { ...formData, role, phone: finalPhone };
      }
      
      await registerUser(submitData);
      navigate('/login?status=registered');
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
            <label>Adresse E-mail</label>
            <input type="email" placeholder="votre.email@exemple.com" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                {AVAILABLE_SUBJECTS.map((sub, idx) => {
                  const isChecked = formData.subjects.some(s => s.name === sub);
                  const subjectObj = formData.subjects.find(s => s.name === sub);
                  
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: isChecked ? '#eff6ff' : 'transparent' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', fontWeight: isChecked ? '600' : 'normal' }}>
                        <input 
                           type="checkbox" 
                           checked={isChecked} 
                           onChange={(e) => {
                             if (e.target.checked) {
                               setFormData(prev => ({ ...prev, subjects: [...prev.subjects, { name: sub, price: '' }] }));
                             } else {
                               setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.name !== sub) }));
                             }
                           }} 
                        />
                        {sub}
                      </label>
                      {isChecked && (
                        <input 
                          type="number" 
                          placeholder="Prix / mois (FCFA)" 
                          required 
                          value={subjectObj?.price || ''}
                          onChange={(e) => {
                            const newPrice = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              subjects: prev.subjects.map(s => s.name === sub ? { ...s, price: newPrice } : s)
                            }));
                          }}
                          style={{ padding: '0.4rem', fontSize: '0.875rem', width: '100%', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="form-group">
                <label>Jours de disponibilité par semaine</label>
                <input 
                  type="number" 
                  min="1" 
                  max="7" 
                  required 
                  value={formData.availability_days} 
                  onChange={e => setFormData({...formData, availability_days: parseInt(e.target.value)})} 
                />
              </div>

              {/* Champ pour ajouter une matière personnalisée */}
              <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem', padding: '1rem', border: '1px dashed var(--color-primary)', borderRadius: 'var(--radius-sm)', backgroundColor: 'white' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'block', color: 'var(--color-primary-dark)' }}>+ Ajouter une autre matière :</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="Ex: Informatique, Piano..." 
                    value={customSubject} 
                    onChange={e => setCustomSubject(e.target.value)} 
                    style={{ flex: '1 1 200px', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <input 
                    type="number" 
                    placeholder="Prix / mois (FCFA)" 
                    value={customPrice} 
                    onChange={e => setCustomPrice(e.target.value)} 
                    style={{ flex: '1 1 120px', padding: '0.4rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <button type="button" onClick={handleAddCustomSubject} className="btn btn-primary" style={{ padding: '0.4rem 1rem' }}>Ajouter</button>
                </div>

                {/* Affichage des matières personnalisées ajoutées */}
                {formData.subjects.filter(s => !AVAILABLE_SUBJECTS.includes(s.name)).length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.subjects.filter(s => !AVAILABLE_SUBJECTS.includes(s.name)).map((sub, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: '#f1f5f9', borderRadius: 'var(--radius-sm)', border: '1px solid #cbd5e1' }}>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{sub.name} <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.5rem' }}>({sub.price} FCFA/mois)</span></span>
                        <button type="button" onClick={() => handleRemoveCustomSubject(sub.name)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', padding: '0 0.5rem' }}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label style={{ color: 'var(--color-primary)', fontWeight: 'bold', display: 'block' }}>Photo de profil (Obligatoire)</label>
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                required 
                onChange={e => setProfilePicture(e.target.files[0])} 
                style={{ marginBottom: '1.5rem', width: '100%', padding: '0.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)' }}
              />

              <label style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>Votre dernier diplôme obtenu</label>
              <select required value={formData.diploma_level} onChange={handleDiplomaChange}>
                <option value="">Sélectionnez votre diplôme...</option>
                {diplomas.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
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

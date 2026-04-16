import { useState, useMemo } from 'react';
import { createContract } from '../services/api';
import { classLevels } from '../data/mockData';

export default function BookingModal({ teacher, onClose }) {
  const [formData, setFormData] = useState({
    children_count: 1,
    class_level: classLevels[0].id,
    subject: teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects[0] : 'Soutien général',
    hours_per_week: 2 // Défaut 2 heures
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Trouver la classe sélectionnée pour appliquer son bonus
  const selectedClass = useMemo(() => {
    return classLevels.find(c => c.id === formData.class_level) || classLevels[0];
  }, [formData.class_level]);

  // Tarif unitaire final : Base (Diplôme du prof) + Bonus (Niveau de la classe)
  const adjustedHourlyRate = teacher.hourlyRate + selectedClass.baseRate;
  
  // Coût Hebdomadaire
  const totalPrice = adjustedHourlyRate * formData.hours_per_week * formData.children_count;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await createContract({
        teacher_id: teacher.id,
        children_count: formData.children_count,
        class_level: selectedClass.label,
        subject: formData.subject,
        hours_per_week: formData.hours_per_week,
        hourly_rate: adjustedHourlyRate
      });
      setStatus('success');
      setTimeout(() => onClose(), 2000); // Ferme automatiquement après succès
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-light)' }}>&times;</button>
        
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Contacter {teacher.firstName}</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Tarif du profil de base : {teacher.hourlyRate} FCFA / Heure
        </p>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ color: 'var(--color-secondary-dark)' }}>Demande envoyée !</h3>
            <p style={{ color: '#475569', marginTop: '0.5rem' }}>Le professeur a été notifié. Retrouvez cette demande dans votre Espace Parent.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            
            {status === 'error' && (
               <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  ⚠️ {errorMsg}
               </div>
            )}

            <div className="form-group">
              <label>Nombre d'enfants à encadrer</label>
              <input type="number" min="1" max="10" required value={formData.children_count} onChange={e => setFormData({...formData, children_count: parseInt(e.target.value)})} />
            </div>

            <div className="form-group">
              <label>Classe(s)</label>
              <select required value={formData.class_level} onChange={e => setFormData({...formData, class_level: e.target.value})}>
                {classLevels.map((c) => (
                   <option key={c.id} value={c.id}>
                     {c.label} (+ {c.baseRate} FCFA)
                   </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Matière à réviser</label>
              <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))
                ) : (
                  <option value="Soutien général">Soutien général</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <label>Nombre d'heures par semaine</label>
              <input type="number" min="1" max="20" required value={formData.hours_per_week} onChange={e => setFormData({...formData, hours_per_week: parseInt(e.target.value)})} />
            </div>

            <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#475569' }}>
                 <span>Tarif horaire ajusté</span>
                 <span>{adjustedHourlyRate} FCFA / h / enfant</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '0.5rem' }}>
                  <span style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>Coût estimé / semaine</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>{totalPrice} FCFA</span>
               </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi...' : 'Confirmer la demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

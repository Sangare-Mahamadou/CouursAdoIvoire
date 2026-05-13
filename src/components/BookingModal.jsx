import { useState, useMemo } from 'react';
import { createContract, getCurrentUser } from '../services/api';
import { classLevels } from '../data/mockData';
import writtenNumber from 'written-number';

writtenNumber.defaults.lang = 'fr';

export default function BookingModal({ teacher, onClose }) {
  const user = getCurrentUser();
  const [selections, setSelections] = useState([]);
  const [formData, setFormData] = useState({
    children_count: 1,
    class_level: classLevels[0].id,
    subject: teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects[0].name : 'Soutien général'
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Trouver le tarif mensuel de la matière sélectionnée
  const selectedSubjectObj = useMemo(() => {
    if (teacher.subjects && teacher.subjects.length > 0) {
      return teacher.subjects.find(s => s.name === formData.subject) || teacher.subjects[0];
    }
    return { price: 0 };
  }, [formData.subject, teacher.subjects]);

  const adjustedMonthlyRate = parseInt(selectedSubjectObj.price, 10) || 0;
  
  const handleAddSelection = () => {
    setSelections([...selections, { ...formData, price: adjustedMonthlyRate }]);
  };

  const handleRemoveSelection = (index) => {
    setSelections(selections.filter((_, i) => i !== index));
  };

  const finalSelections = selections.length > 0 ? selections : [{ ...formData, price: adjustedMonthlyRate }];
  const grandTotal = finalSelections.reduce((sum, s) => sum + (s.price * s.children_count), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      // Send the array of selections to the backend
      await createContract({
        teacher_id: teacher.id,
        selections: finalSelections.map(s => ({
            children_count: s.children_count,
            class_level: classLevels.find(c => c.id === s.class_level)?.label || s.class_level,
            subject: s.subject,
            hours_per_week: 0,
            hourly_rate: s.price
        }))
      });
      setStatus('success');
      setTimeout(() => onClose(), 1000); // Ferme automatiquement après succès
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-light)' }}>&times;</button>
        
        <h2 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Contacter {teacher.name}</h2>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Finalisez les détails de votre demande.
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
                     {c.label}
                   </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Matière à réviser</label>
              <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})}>
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map((sub, idx) => (
                    <option key={idx} value={sub.name}>{sub.name} ({sub.price} FCFA/mois)</option>
                  ))
                ) : (
                  <option value="Soutien général">Soutien général</option>
                )}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button type="button" onClick={handleAddSelection} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                + Ajouter une autre classe/matière
              </button>
            </div>

            {selections.length > 0 && (
              <div style={{ marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>Éléments ajoutés :</h4>
                <ul style={{ paddingLeft: '1.5rem', margin: 0, fontSize: '0.9rem' }}>
                  {selections.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      {s.children_count} enfant(s) en {classLevels.find(c => c.id === s.class_level)?.label} pour {s.subject} - <strong>{s.price * s.children_count} FCFA</strong>
                      <button type="button" onClick={() => handleRemoveSelection(idx)} style={{ marginLeft: '1rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Retirer</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginTop: '2rem', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
               <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>CONTRAT D'ENGAGEMENT</h3>
               <p>Entre les soussignés :</p>
               <p><strong>Le Parent :</strong> {user?.name || '___________________'}</p>
               <p><strong>L'Enseignant :</strong> {teacher.name}</p>
               <p style={{ marginTop: '1rem' }}>
                 Il est convenu ce qui suit : L'enseignant dispensera des cours de soutien pour {finalSelections.length} sélection(s).
               </p>
               <p style={{ marginTop: '0.5rem' }}>
                 La rémunération mensuelle totale est fixée à <strong>{grandTotal} FCFA</strong> (<em>{grandTotal > 0 ? writtenNumber(grandTotal) : 'zéro'} francs CFA</em>).
               </p>
               <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-sm)', border: '1px solid #f87171' }}>
                 <p style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>⚠️ Clauses strictes de la plateforme AlloProf CI :</p>
                 <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#991b1b' }}>
                   <li>Ce contrat ne peut être révoqué qu'après un mois d'engagement.</li>
                   <li>Toute personne ne respectant pas ce contrat sera suspendue de la plateforme pendant un mois.</li>
                 </ul>
               </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi...' : 'Êtes-vous sûr d’envoyer cette demande ?'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

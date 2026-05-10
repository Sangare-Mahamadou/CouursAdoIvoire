import { useState, useEffect, useCallback } from 'react';
import { getContracts, rateContract } from '../services/api';
import ProfileEditor from '../components/ProfileEditor';

export default function DashboardParent() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, contractId: null, rating: 5 });

  const fetchContracts = useCallback(() => {
    setIsLoading(true);
    getContracts()
      .then(data => {
        setContracts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    getContracts()
      .then(data => {
        setContracts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    try {
      await rateContract(ratingModal.contractId, ratingModal.rating);
      setRatingModal({ isOpen: false, contractId: null, rating: 5 });
      fetchContracts();
    } catch (err) {
      alert("Erreur lors de la notation: " + err.message);
    }
  };

  return (
    <div className="container dashboard-layout animate-fade-in">
      <h1 className="page-title">Espace Parent - Tableau de bord</h1>
      
      <ProfileEditor />

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Mes Demandes & Contrats en cours</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Nb. Enfants</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Classe</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Matière</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Enseignant</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Contact & Email</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Total / Mois</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Statut</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="8" style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>Aucun contrat actif ou en attente.</td></tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{contract.children_count} enfant(s)</td>
                    <td style={{ padding: '1rem' }}>{contract.class_level}</td>
                    <td style={{ padding: '1rem' }}>{contract.subject}</td>
                    <td style={{ padding: '1rem' }}>{contract.teacher_name}</td>
                    <td style={{ padding: '1rem' }}>
                      {contract.teacher_phone === 'Masqué' ? (
                        <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>Masqué</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <a href={`tel:${contract.teacher_phone}`} style={{ color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'none' }}>
                            {contract.teacher_phone}
                          </a>
                          <a href={`mailto:${contract.teacher_email}`} style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', textDecoration: 'none' }}>
                            {contract.teacher_email}
                          </a>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-text)' }}>{contract.hourly_rate * contract.children_count} FCFA</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: contract.status === 'completed' ? '#dcfce7' : (contract.status === 'active' ? 'var(--color-secondary-light)' : (contract.status === 'rejected' ? '#fee2e2' : '#fef3c7')), color: contract.status === 'completed' ? '#166534' : (contract.status === 'active' ? 'var(--color-secondary-dark)' : (contract.status === 'rejected' ? '#b91c1c' : '#b45309')) }}>
                        {contract.status === 'completed' ? 'Terminé' : (contract.status === 'active' ? 'En cours' : (contract.status === 'rejected' ? 'Refusé' : 'En attente'))}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {contract.status === 'active' && (
                        <button 
                            onClick={() => setRatingModal({ isOpen: true, contractId: contract.id, rating: 5 })}
                            className="btn btn-outline" 
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                            Noter & Terminer
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Notation */}
      {ratingModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Noter l'enseignant</h2>
              <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                Attribuez une note sur 5 à cet enseignant pour finaliser le contrat.
              </p>
              <form onSubmit={handleRateSubmit}>
                <div className="form-group">
                  <label>Note (sur 5)</label>
                  <select 
                     value={ratingModal.rating} 
                     onChange={(e) => setRatingModal({ ...ratingModal, rating: parseInt(e.target.value) })}
                  >
                     <option value={5}>⭐⭐⭐⭐⭐ Excellent (5)</option>
                     <option value={4}>⭐⭐⭐⭐ Très bien (4)</option>
                     <option value={3}>⭐⭐⭐ Bien (3)</option>
                     <option value={2}>⭐⭐ Passable (2)</option>
                     <option value={1}>⭐ Mauvais (1)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Noter & Terminer</button>
                    <button type="button" onClick={() => setRatingModal({ isOpen: false, contractId: null, rating: 5 })} className="btn btn-outline">Annuler</button>
                </div>
              </form>
            </div>
          </div>
      )}
    </div>
  );
}

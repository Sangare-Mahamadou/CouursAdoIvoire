import { useState, useEffect } from 'react';
import { getContracts } from '../services/api';

export default function DashboardParent() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="container dashboard-layout animate-fade-in">
      <h1 className="page-title">Espace Parent - Tableau de bord</h1>
      
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
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Volume Horaire</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Total / Semaine</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>Chargement...</td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>Aucun contrat actif ou en attente.</td></tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{contract.children_count} enfant(s)</td>
                    <td style={{ padding: '1rem' }}>{contract.class_level}</td>
                    <td style={{ padding: '1rem' }}>{contract.subject}</td>
                    <td style={{ padding: '1rem' }}>{contract.teacher_name}</td>
                    <td style={{ padding: '1rem' }}>{contract.hours_per_week}h / sem</td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--color-text)' }}>{contract.hourly_rate * contract.hours_per_week * contract.children_count} FCFA</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: contract.status === 'active' ? 'var(--color-secondary-light)' : (contract.status === 'rejected' ? '#fee2e2' : '#fef3c7'), color: contract.status === 'active' ? 'var(--color-secondary-dark)' : (contract.status === 'rejected' ? '#b91c1c' : '#b45309') }}>
                        {contract.status === 'active' ? 'En cours' : (contract.status === 'rejected' ? 'Refusé' : 'En attente')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

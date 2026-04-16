import { useState, useEffect } from 'react';
import { getContracts, updateContractStatus } from '../services/api';

export default function DashboardTeacher() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({ estimatedRevenue: 0, hoursTotal: 0 });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = () => {
    getContracts()
      .then(data => {
        setContracts(data);
        
        // Calcul du revenu et des heures seulement pour les contrats acceptés
        const activeContracts = data.filter(c => c.status === 'active');
        // Revenu mensuel estimé = Tarif horaire * heures_hebdo * nombre d'enfants * 4 semaines
        const rev = activeContracts.reduce((acc, curr) => acc + (curr.hourly_rate * curr.hours_per_week * curr.children_count * 4), 0); 
        const hrs = activeContracts.reduce((acc, curr) => acc + curr.hours_per_week, 0); 
        
        setProfileData({ estimatedRevenue: rev, hoursTotal: hrs });
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const handleStatusChange = async (id, newStatus) => {
     try {
         await updateContractStatus(id, newStatus);
         fetchContracts(); // Rafraîchit automatiquement la liste de contrats
     } catch (err) {
         alert(err.message);
     }
  };

  return (
    <div className="container dashboard-layout animate-fade-in">
      <h1 className="page-title">Espace Enseignant - Tableau de bord</h1>
      
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
         <div className="card text-center glass">
            <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Revenus estimés (Mois)</h3>
            <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '0.5rem' }}>{profileData.estimatedRevenue} FCFA</p>
         </div>
         <div className="card text-center glass">
            <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Heures dispensées / Semaine</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '0.5rem', color: 'var(--color-secondary)' }}>{profileData.hoursTotal}h</p>
         </div>
      </div>

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Mes Demandes & Contrats</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Parent (Téléphone)</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Nb. Enfants</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Classe</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Matière</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Heures / sem</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Statut</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center' }}>Chargement des données...</td></tr>
              ) : contracts.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>Vous n'avez aucune demande pour le moment.</td></tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                        {contract.parent_name} <br/> <a href={`tel:${contract.parent_phone}`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none'}}>{contract.parent_phone}</a>
                    </td>
                    <td style={{ padding: '1rem' }}>{contract.children_count} enfant(s)</td>
                    <td style={{ padding: '1rem' }}>{contract.class_level}</td>
                    <td style={{ padding: '1rem' }}>{contract.subject}</td>
                    <td style={{ padding: '1rem' }}>{contract.hours_per_week}h</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: contract.status === 'active' ? 'var(--color-secondary-light)' : (contract.status === 'rejected' ? '#fee2e2' : '#fef3c7'), color: contract.status === 'active' ? 'var(--color-secondary-dark)' : (contract.status === 'rejected' ? '#b91c1c' : '#b45309') }}>
                        {contract.status === 'active' ? 'En cours' : (contract.status === 'rejected' ? 'Refusée' : 'Nouvelle demande')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {contract.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleStatusChange(contract.id, 'active')} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>Accepter</button>
                          <button onClick={() => handleStatusChange(contract.id, 'rejected')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', borderColor: '#ef4444', color: '#ef4444' }}>Refuser</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Traitée</span>
                      )}
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

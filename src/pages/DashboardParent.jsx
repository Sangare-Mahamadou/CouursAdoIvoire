import { useState, useEffect, useCallback } from 'react';
import { getContracts, rateContract } from '../services/api';
import ProfileEditor from '../components/ProfileEditor';
import ChatInterface from '../components/ChatInterface';
import { getUserNotifications, deleteNotification } from '../services/api';
import { Bell, MessageSquare } from 'lucide-react';

export default function DashboardParent() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState({ isOpen: false, contractId: null, rating: 5 });
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');

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
      
    getUserNotifications()
      .then(data => setNotifications(data))
      .catch(err => console.error("Erreur notifications", err));
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

  const handleDismissNotification = async (id) => {
     try {
         await deleteNotification(id);
         setNotifications(notifications.filter(n => n.id !== id));
     } catch (err) {
         console.error("Erreur fermeture notification", err);
     }
  };

  return (
    <div className="container dashboard-layout animate-fade-in">
      <h1 className="page-title">Espace Parent - Tableau de bord</h1>
      
      {notifications.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)', backgroundColor: '#fff7ed', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
            <Bell size={20} /> Notifications
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {notifications.map(notif => (
              <li key={notif.id} style={{ padding: '0.8rem', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{notif.message}</p>
                    <small style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
                      {new Date(notif.created_at).toLocaleString()}
                    </small>
                </div>
                <button onClick={() => handleDismissNotification(notif.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-light)', fontSize: '1.2rem', padding: '0 0.5rem' }}>&times;</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('dashboard')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}>
          Tableau de Bord
        </button>
        <button onClick={() => setActiveTab('messages')} className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-outline'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} /> Messagerie
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
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
        </>
      ) : (
        <ChatInterface />
      )}
    </div>
  );
}

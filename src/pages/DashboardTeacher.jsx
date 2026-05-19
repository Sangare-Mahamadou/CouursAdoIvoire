import { useState, useEffect, useCallback } from 'react';
import { getContracts, updateContractStatus } from '../services/api';
import ProfileEditor from '../components/ProfileEditor';
import ChatInterface from '../components/ChatInterface';
import { getUserNotifications, deleteNotification, getUnreadCount } from '../services/api';
import { Bell, MessageSquare } from 'lucide-react';

export default function DashboardTeacher() {
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({ estimatedRevenue: 0 });
  const [expandedContract, setExpandedContract] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  const fetchContracts = useCallback(() => {
    getContracts()
      .then(data => {
        setContracts(data);
        
        // Calcul du revenu mensuel seulement pour les contrats acceptés
        const activeContracts = data.filter(c => c.status === 'active');
        // Revenu mensuel estimé = Tarif mensuel * nombre d'enfants
        const rev = activeContracts.reduce((acc, curr) => acc + (curr.hourly_rate * curr.children_count), 0); 
        
        setProfileData({ estimatedRevenue: rev });
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchContracts();
    
    getUserNotifications()
      .then(data => setNotifications(data))
      .catch(err => console.error("Erreur notifications", err));
      
    // Fetch unread messages count periodically
    const fetchUnread = () => {
        getUnreadCount().then(data => setUnreadMsgCount(data.count)).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [fetchContracts]);

  const handleStatusChange = async (id, newStatus) => {
     try {
         await updateContractStatus(id, newStatus);
         fetchContracts(); // Rafraîchit automatiquement la liste de contrats
     } catch (err) {
         alert(err.message);
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
      <h1 className="page-title">Espace Enseignant - Tableau de bord</h1>

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

      <div className="dashboard-tabs">
        <button onClick={() => setActiveTab('dashboard')} className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}>
          Tableau de Bord
        </button>
        <button onClick={() => { setActiveTab('messages'); setUnreadMsgCount(0); }} className={`btn ${activeTab === 'messages' ? 'btn-primary' : 'btn-outline'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
          <MessageSquare size={18} /> Messagerie
          {unreadMsgCount > 0 && activeTab !== 'messages' && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadMsgCount}
              </span>
          )}
        </button>
      </div>

      {activeTab === 'dashboard' ? (
        <>
          <ProfileEditor />
          
          <div className="grid grid-cols-1" style={{ marginBottom: '2rem' }}>
         <div className="card text-center glass">
            <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Revenus estimés (Mois)</h3>
            <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '0.5rem' }}>{profileData.estimatedRevenue} FCFA</p>
         </div>
      </div>

      <div className="card glass">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Mes Demandes & Contrats</h2>
        <div className="table-scroll">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Parent & Contact</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Nb. Enfants</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Classe</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Matière</th>
                <th style={{ padding: '1rem', color: 'var(--color-text-light)' }}>Total / Mois</th>
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
                  <tr key={contract.id} style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: expandedContract === contract.id ? '#f8fafc' : 'transparent' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                        {contract.parent_name} <br/> 
                        {contract.parent_phone === 'Masqué' ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>Contacts Masqués</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                            <a href={`tel:${contract.parent_phone}`} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none'}}>{contract.parent_phone}</a>
                            <a href={`mailto:${contract.parent_email}`} style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', textDecoration: 'none'}}>{contract.parent_email}</a>
                          </div>
                        )}
                    </td>
                    <td style={{ padding: '1rem' }}>{contract.children_count} enfant(s)</td>
                    <td style={{ padding: '1rem' }}>{contract.class_level}</td>
                    <td style={{ padding: '1rem' }}>{contract.subject}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{contract.hourly_rate * contract.children_count} FCFA</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: contract.status === 'active' ? 'var(--color-secondary-light)' : (contract.status === 'rejected' ? '#fee2e2' : '#fef3c7'), color: contract.status === 'active' ? 'var(--color-secondary-dark)' : (contract.status === 'rejected' ? '#b91c1c' : '#b45309') }}>
                        {contract.status === 'active' ? 'En cours' : (contract.status === 'rejected' ? 'Refusée' : 'Nouvelle demande')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {contract.status === 'pending' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)} className="btn btn-outline" style={{ padding: '0.3rem', fontSize: '0.8rem' }}>
                            {expandedContract === contract.id ? 'Masquer Contrat' : 'Voir Contrat'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>Traitée</span>
                      )}
                    </td>
                  </tr>
                )).flatMap((row, index) => {
                  const contract = contracts[index];
                  const rows = [row];
                  if (expandedContract === contract.id && contract.status === 'pending') {
                    rows.push(
                      <tr key={`contract-${contract.id}`} style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--color-border)' }}>
                        <td colSpan="7" style={{ padding: '1.5rem' }}>
                          <div style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', padding: '1.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: '#334155', lineHeight: '1.6' }}>
                             <h3 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem', textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>CONTRAT D'ENGAGEMENT PROPOSÉ</h3>
                             <p>Entre les soussignés :</p>
                             <p><strong>Le Parent :</strong> {contract.parent_name}</p>
                             <p><strong>L'Enseignant :</strong> Vous-même</p>
                             <p style={{ marginTop: '1rem' }}>
                               Il est convenu ce qui suit : Vous dispenserez des cours de soutien en <strong>{contract.subject}</strong> pour <strong>{contract.children_count}</strong> enfant(s) de niveau <strong>{contract.class_level}</strong>.
                             </p>
                             <p style={{ marginTop: '0.5rem' }}>
                               La rémunération mensuelle totale est fixée à <strong>{contract.hourly_rate * contract.children_count} FCFA</strong>.
                             </p>
                             <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-sm)', border: '1px solid #f87171' }}>
                               <p style={{ fontWeight: 'bold', color: '#b91c1c', marginBottom: '0.5rem' }}>⚠️ Clauses strictes de la plateforme :</p>
                               <ul style={{ paddingLeft: '1.5rem', margin: 0, color: '#991b1b' }}>
                                 <li>Ce contrat ne peut être révoqué qu'après un mois d'engagement.</li>
                                 <li>Toute personne ne respectant pas ce contrat sera suspendue de la plateforme pendant un mois.</li>
                               </ul>
                             </div>
                             
                             <div className="stackable-actions" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                                <button onClick={() => handleStatusChange(contract.id, 'active')} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Accepter le contrat</button>
                                <button onClick={() => handleStatusChange(contract.id, 'rejected')} className="btn btn-outline" style={{ padding: '0.5rem 1.5rem', borderColor: '#ef4444', color: '#ef4444' }}>Refuser</button>
                             </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        <ChatInterface />
      )}
    </div>
  );
}

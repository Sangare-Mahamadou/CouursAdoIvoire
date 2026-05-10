import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser, getAllAdminContracts } from '../services/api';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('parents'); // 'parents', 'teachers', 'contracts', 'stats'
  
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Vérification stricte de l'administrateur
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      logoutUser();
      navigate('/login');
      return;
    }
    
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Récupération des utilisateurs
      const resUsers = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resUsers.ok) {
        setUsers(await resUsers.json());
      }

      // Récupération des contrats
      const dataContracts = await getAllAdminContracts();
      setContracts(dataContracts);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur définitivement ?")) {
      try {
        const response = await fetch(`${API_URL}/admin/users/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          fetchData();
        } else {
          alert("Erreur lors de la suppression.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Filtrage des données
  const parents = users.filter(u => u.role === 'parent');
  const teachers = users.filter(u => u.role === 'teacher');
  
  // Statistiques
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const pendingContracts = contracts.filter(c => c.status === 'pending').length;

  return (
    <div className="container dashboard-layout animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
            <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Espace Administrateur</h1>
            <p style={{ color: 'var(--color-text-light)' }}>Vue globale et modération de la plateforme AlloProf CI.</p>
        </div>
        <button onClick={() => { logoutUser(); navigate('/login'); }} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
            Déconnexion Admin
        </button>
      </div>

      {/* Navigation des onglets */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '1rem', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('parents')} className={`btn ${activeTab === 'parents' ? 'btn-primary' : 'btn-outline'}`}>
          Parents ({parents.length})
        </button>
        <button onClick={() => setActiveTab('teachers')} className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-outline'}`}>
          Enseignants ({teachers.length})
        </button>
        <button onClick={() => setActiveTab('contracts')} className={`btn ${activeTab === 'contracts' ? 'btn-primary' : 'btn-outline'}`}>
          Relations ({contracts.length})
        </button>
        <button onClick={() => setActiveTab('stats')} className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-outline'}`}>
          Statistiques
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>Chargement des données administrateur...</div>
      ) : (
        <>
          {/* ONGLET : PARENTS */}
          {activeTab === 'parents' && (
            <div className="card glass animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Liste des Parents d'élèves</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem' }}>ID</th>
                      <th style={{ padding: '1rem' }}>Nom</th>
                      <th style={{ padding: '1rem' }}>Téléphone</th>
                      <th style={{ padding: '1rem' }}>Ville</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Aucun parent inscrit.</td></tr>
                    ) : (
                      parents.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '1rem' }}>{u.id}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>{u.phone}</td>
                          <td style={{ padding: '1rem' }}>{u.city}</td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleDelete(u.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
                              Bannir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET : ENSEIGNANTS */}
          {activeTab === 'teachers' && (
            <div className="card glass animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Liste des Enseignants</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem' }}>ID</th>
                      <th style={{ padding: '1rem' }}>Nom</th>
                      <th style={{ padding: '1rem' }}>Téléphone</th>
                      <th style={{ padding: '1rem' }}>Ville</th>
                      <th style={{ padding: '1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Aucun enseignant inscrit.</td></tr>
                    ) : (
                      teachers.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '1rem' }}>{u.id}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{u.name}</td>
                          <td style={{ padding: '1rem' }}>{u.phone}</td>
                          <td style={{ padding: '1rem' }}>{u.city}</td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => handleDelete(u.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
                              Bannir
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET : RELATIONS */}
          {activeTab === 'contracts' && (
            <div className="card glass animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Toutes les Relations (Contrats)</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                      <th style={{ padding: '1rem' }}>ID</th>
                      <th style={{ padding: '1rem' }}>Parent</th>
                      <th style={{ padding: '1rem' }}>Enseignant</th>
                      <th style={{ padding: '1rem' }}>Matière / Classe</th>
                      <th style={{ padding: '1rem' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.length === 0 ? (
                      <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Aucun contrat sur la plateforme.</td></tr>
                    ) : (
                      contracts.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '1rem' }}>{c.id}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{c.parent_name}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{c.teacher_name}</td>
                          <td style={{ padding: '1rem' }}>{c.subject} <br/><span style={{fontSize: '0.85rem', color: 'var(--color-text-light)'}}>{c.class_level}</span></td>
                          <td style={{ padding: '1rem' }}>
                            <span className="badge" style={{ backgroundColor: c.status === 'active' ? 'var(--color-secondary-light)' : (c.status === 'rejected' ? '#fee2e2' : '#fef3c7'), color: c.status === 'active' ? 'var(--color-secondary-dark)' : (c.status === 'rejected' ? '#b91c1c' : '#b45309') }}>
                                {c.status === 'active' ? 'Actif' : (c.status === 'rejected' ? 'Refusé' : 'En attente')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ONGLET : STATISTIQUES */}
          {activeTab === 'stats' && (
            <div className="animate-fade-in">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Tableau de bord de la Plateforme</h2>
              <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                <div className="card text-center glass" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Total Utilisateurs</h3>
                    <p className="text-gradient" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '0.5rem' }}>{users.length}</p>
                </div>
                <div className="card text-center glass" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                    <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Contrats Actifs</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', marginTop: '0.5rem', color: 'var(--color-secondary)' }}>{activeContracts}</p>
                </div>
                <div className="card text-center glass" style={{ borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Demandes en Attente</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', marginTop: '0.5rem', color: '#f59e0b' }}>{pendingContracts}</p>
                </div>
                <div className="card text-center glass" style={{ borderLeft: '4px solid #ef4444' }}>
                    <h3 style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>Contrats Refusés</h3>
                    <p style={{ fontSize: '3rem', fontWeight: '800', marginTop: '0.5rem', color: '#ef4444' }}>{contracts.length - activeContracts - pendingContracts}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

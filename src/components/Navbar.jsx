import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { getCurrentUser, hasAuthToken, loadCurrentUser, logoutUser } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const refreshUser = () => setUser(getCurrentUser());
    window.addEventListener('auth-changed', refreshUser);

    if (hasAuthToken() && !getCurrentUser()) {
      loadCurrentUser().catch(() => {});
    }

    return () => window.removeEventListener('auth-changed', refreshUser);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <BookOpen className="logo-icon" />
          <span>AlloProf <span className="text-primary">CI</span></span>
        </Link>
        <div className="nav-links">
          <Link 
            to="/teachers" 
            className="btn btn-outline main-btn" 
          >
            Trouver un enseignant
          </Link>
          
          {user ? (
            <>
              <Link to={user.role === 'admin' ? '/admin' : `/dashboard/${user.role}`} className="btn btn-primary">
                {user.role === 'admin' ? 'Panneau Admin' : `Mon Espace (${user.name.split(' ')[0]})`}
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline" 
                style={{ padding: '0.4rem', border: 'none', color: 'var(--color-primary)' }}
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="btn btn-outline main-btn" 
              >
                Se connecter
              </Link>
              <Link 
                to="/register" 
                className="btn btn-outline main-btn" 
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

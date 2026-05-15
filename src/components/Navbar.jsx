import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  // état pour savoir quel bouton est actif
  const [activeLink, setActiveLink] = useState(null);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // style commun pour le bouton actif
  const activeStyle = { backgroundColor: '#D55513', color: 'white' };

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
            className={`btn ${activeLink === 'teachers' ? 'btn-primary' : 'btn-outline'}`} 
            style={activeLink === 'teachers' ? activeStyle : {}}
            onClick={() => setActiveLink('teachers')}
          >
            Trouver un enseignant
          </Link>
          
          {user ? (
            <>
              <Link to={`/dashboard/${user.role}`} className="btn btn-primary">
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
                className={`btn ${activeLink === 'login' ? 'btn-primary' : 'btn-outline'}`} 
                style={activeLink === 'login' ? activeStyle : {}}
                onClick={() => setActiveLink('login')}
              >
                Se connecter
              </Link>
              <Link 
                to="/register" 
                className={`btn ${activeLink === 'register' ? 'btn-primary' : 'btn-outline'}`} 
                style={activeLink === 'register' ? activeStyle : {}}
                onClick={() => setActiveLink('register')}
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

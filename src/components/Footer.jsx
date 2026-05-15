import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          AlloProf CI
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Accueil</Link>
          <span style={{ color: 'var(--color-text-light)' }}>|</span>
          <Link to="/teachers" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Enseignants</Link>
          <span style={{ color: 'var(--color-text-light)' }}>|</span>
          <Link to="/login" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Connexion</Link>
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
          &copy; 2026 AlloProf CI. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

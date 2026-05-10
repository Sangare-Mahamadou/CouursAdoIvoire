import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-brand">
          <BookOpen className="logo-icon" />
          <span>AlloProf CI</span>
        </div>
        <div className="footer-links">
          <Link to="/">Accueil</Link>
          <Link to="/teachers">Enseignants</Link>
          <Link to="/login">Connexion</Link>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} AlloProf CI. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

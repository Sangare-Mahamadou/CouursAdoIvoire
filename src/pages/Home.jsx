import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, MapPin, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-fade-in">
      <section className="hero">
        <h1 className="text-gradient">L'excellence scolaire à domicile en Côte d'Ivoire</h1>
        <p>
          Trouvez l'enseignant idéal pour accompagner vos enfants vers la réussite.
          Des professeurs vérifiés, qualifiés et proches de chez vous.
        </p>
        <div className="hero-buttons">
          <Link to="/teachers" className="btn btn-primary">
            <Search size={18} /> Rechercher un enseignant
          </Link>
          <Link to="/register" className="btn btn-primary">
            <GraduationCap size={18} /> Devenir enseignant
          </Link>
        </div>
      </section>

      <section className="container" style={{ padding: '4rem 1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 3rem 0', fontSize: '2rem' }}>Pourquoi choisir AlloProf CI ?</h2>
        <div className="grid grid-cols-3">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%' }}>
              <CheckCircle size={32} color="var(--color-primary)" />
            </div>
            <h3>Enseignants Qualifiés</h3>
            <p style={{ color: 'var(--color-text-light)' }}>De BAC à Doctorat, choisissez l'enseignant au niveau adapté à vos besoins spécifiques.</p>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-secondary-light)', borderRadius: '50%' }}>
              <CheckCircle size={32} color="var(--color-secondary)" />
            </div>
            <h3>Tarifs Transparents</h3>
            <p style={{ color: 'var(--color-text-light)' }}>Des prix justes en FCFA, adaptés à vos besoins et au profil de l'enseignant.</p>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-light)', borderRadius: '50%' }}>
              <CheckCircle size={32} color="var(--color-primary)" />
            </div>
            <h3>Suivi Personnalisé</h3>
            <p style={{ color: 'var(--color-text-light)' }}>Des espaces dédiés pour les parents et les enseignants afin de gérer facilement les cours et contrats.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

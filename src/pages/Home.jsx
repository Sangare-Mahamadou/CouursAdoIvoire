import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, GraduationCap, MapPin, Search, Star } from 'lucide-react';
import { getPlatformReviews, addPlatformReview, getCurrentUser } from '../services/api';
import toast from 'react-hot-toast';

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getCurrentUser();

  const fetchReviews = () => {
    getPlatformReviews().then(data => {
      setReviews(data);
    }).catch(err => console.error("Erreur avis", err));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vous devez être connecté pour laisser un avis.');
      return;
    }
    if (rating === 0) {
      toast.error('Veuillez donner une note.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      await addPlatformReview({ rating, comment });
      setRating(0);
      setComment('');
      toast.success('Merci pour votre avis !');
      fetchReviews();
    } catch {
      toast.error("Veuillez vous connecter pour laisser un avis, ou une erreur s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {reviews.length > 0 && (
        <section className="container" style={{ padding: '0 1.5rem', marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Avis de nos utilisateurs</h2>
          <div className="grid grid-cols-3">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} fill={star <= review.rating ? '#f59e0b' : 'none'} />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--color-text-light)', flex: 1 }}>"{review.comment}"</p>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>- {review.author_name}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Zone de soumission d'avis */}
      <section className="container" style={{ padding: '0 1.5rem', marginBottom: '4rem', display: 'flex', justifyContent: 'center' }}>
        <div className="card glass" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Donnez votre avis sur AlloProf CI</h3>
            {user ? (
                <form onSubmit={handleReviewSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <label style={{ marginBottom: '0.5rem' }}>Votre note</label>
                    <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                        key={star}
                        size={32}
                        color={star <= rating ? '#f59e0b' : '#d1d5db'}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                        onClick={() => setRating(star)}
                        />
                    ))}
                    </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label>Votre commentaire (optionnel)</label>
                    <textarea
                    className="form-control"
                    rows="3"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'est-ce qui pourrait être amélioré ?"
                    />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                    {isSubmitting ? 'Envoi...' : 'Envoyer mon avis'}
                    </button>
                </div>
                </form>
            ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-light)' }}>Vous devez être connecté pour laisser un avis sur la plateforme.</p>
                    <Link to="/login" className="btn btn-outline">Se connecter</Link>
                </div>
            )}
        </div>
      </section>
    </div>
  );
}

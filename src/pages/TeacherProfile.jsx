import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTeacherById, getTeacherReviews, checkContractStatus, getCurrentUser } from '../services/api';
import TeacherCard from '../components/TeacherCard';
import { Star, Phone, Mail } from 'lucide-react';
import ReviewModal from '../components/ReviewModal';

export default function TeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [contractStatus, setContractStatus] = useState({ hasActiveContract: false, canRate: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        const [teacherData, reviewsData] = await Promise.all([
          getTeacherById(id),
          getTeacherReviews(id),
        ]);
        setTeacher(teacherData);
        setReviews(reviewsData);
        
        if (user && user.role === 'parent') {
           const statusData = await checkContractStatus(id);
           setContractStatus(statusData);
        }
      } catch (error) {
        console.error("Erreur de chargement du profil de l'enseignant:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, [id]);

  if (isLoading) {
    return <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Chargement du profil...</div>;
  }

  if (!teacher) {
    return <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>Enseignant non trouvé.</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <TeacherCard teacher={teacher} />

      {contractStatus.hasActiveContract && (
        <div className="card glass animate-fade-in" style={{ marginTop: '2rem', borderLeft: '4px solid var(--color-primary)' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Coordonnées de l'enseignant</h3>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Phone size={18} /> <a href={`tel:${teacher.phone}`} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>{teacher.phone}</a>
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> <a href={`mailto:${teacher.email}`} style={{ textDecoration: 'none', color: 'var(--color-text)' }}>{teacher.email}</a>
          </p>
        </div>
      )}

      <div className="reviews-section" style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Avis des parents ({reviews.length})</h3>
            {contractStatus.canRate && (
                <button onClick={() => setIsReviewModalOpen(true)} className="btn btn-primary">
                    Donner un avis
                </button>
            )}
        </div>
        {reviews.length > 0 ? (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card card glass">
                <strong>{review.author_name}</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} color={i < review.rating ? '#f59e0b' : '#d1d5db'} fill={i < review.rating ? '#f59e0b' : 'none'} />
                  ))}
                </div>
                <p>{review.comment}</p>
                <small style={{ color: 'var(--color-text-light)', marginTop: '1rem', display: 'block' }}>
                  {new Date(review.created_at).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <p>Cet enseignant n'a pas encore reçu d'avis.</p>
        )}
      </div>

      {isReviewModalOpen && (
          <ReviewModal 
              teacher={teacher} 
              onClose={() => setIsReviewModalOpen(false)} 
              onReviewAdded={() => {
                  setIsReviewModalOpen(false);
                  getTeacherReviews(id).then(setReviews);
              }} 
          />
      )}
    </div>
  );
}

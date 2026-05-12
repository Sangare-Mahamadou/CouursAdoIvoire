import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTeacherById, getTeacherReviews } from '../services/api';
import TeacherCard from '../components/TeacherCard';
import { Star } from 'lucide-react';

export default function TeacherProfile() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      <div className="reviews-section" style={{ marginTop: '3rem' }}>
        <h3 style={{ marginBottom: '2rem' }}>Avis des parents ({reviews.length})</h3>
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
    </div>
  );
}

import { useState } from 'react';
import { MapPin, Star, MessageSquare } from 'lucide-react';
import BookingModal from './BookingModal';
import ReviewModal from './ReviewModal';
import { diplomas } from '../data/mockData';
import { getCurrentUser } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function TeacherCard({ teacher, onReviewAdded }) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const diplomaObj = diplomas.find(d => d.id === teacher.diploma_level);
  const diplomaLabel = diplomaObj ? diplomaObj.label : 'Non défini';

  const handleContactClick = () => {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Veuillez vous connecter pour contacter un enseignant.");
    } else if (user.role !== 'parent') {
      toast.error("Seul un parent d'élève peut contacter un enseignant.");
    } else {
      setIsBookingModalOpen(true);
    }
  };

  return (
    <>
      <div className="card teacher-card animate-fade-in">
        <div>
          <div className="teacher-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img 
               src={teacher.profile_picture_url || 'https://via.placeholder.com/60'} 
               alt={`Photo de ${teacher.firstName}`} 
               style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)', cursor: 'pointer' }} 
               onClick={() => setIsImageModalOpen(true)}
            />
            <div style={{ flex: 1 }}>
              <h3 className="teacher-name">
                <Link to={`/teacher/${teacher.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {teacher.firstName} {teacher.lastName}
                </Link>
              </h3>
              <p className="teacher-city"><MapPin size={14} /> {teacher.city}</p>
            </div>
            <span className="badge">Niveau : {diplomaLabel}</span>
          </div>
          
          <div className="subjects-list">
            {teacher.subjects && teacher.subjects.map((sub, idx) => (
              <span key={idx} className="subject-pill" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '600' }}>{sub.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{sub.price} FCFA/mois</span>
              </span>
            ))}
          </div>

          <p className="teacher-description" style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
            {teacher.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" />
              <span style={{ fontWeight: '600' }}>Note : {Number(teacher.rating || 0).toFixed(1)}/5</span>
              <span style={{ color: 'var(--color-text-light)' }}>({teacher.reviewsCount || 0} avis)</span>
            </div>
            <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              Dispo. {teacher.availability_days || 5}j/7
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <Link to={`/teacher/${teacher.id}`} className="btn btn-outline">
            Voir Profil & Avis
          </Link>
          <button className="btn btn-secondary" onClick={handleContactClick}>Contacter</button>
        </div>
      </div>

      {isBookingModalOpen && <BookingModal teacher={teacher} onClose={() => setIsBookingModalOpen(false)} />}
      {isReviewModalOpen && <ReviewModal teacher={teacher} onClose={() => setIsReviewModalOpen(false)} onReviewAdded={onReviewAdded} />}
      {isImageModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsImageModalOpen(false)}>
          <img 
            src={teacher.profile_picture_url} 
            alt={`Photo de ${teacher.firstName}`} 
            style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 'var(--radius-lg)' }}
          />
        </div>
      )}
    </>
  );
}

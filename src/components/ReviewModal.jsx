import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { addReview } from '../services/api';

export default function ReviewModal({ teacher, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addReview(teacher.id, { rating, comment });
      toast.success('Avis envoyé avec succès !');
      if (onReviewAdded) {
        onReviewAdded();
      }
      onClose();
    } catch (error) {
      toast.error(error.message || "Une erreur s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel card" style={{ padding: '2rem', backgroundColor: 'var(--color-surface)' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--color-primary)' }}>
          Laisser un avis pour {teacher.firstName}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Votre note</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className={star <= rating ? 'filled' : ''}
                  onClick={() => setRating(star)}
                  style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Votre commentaire</label>
            <textarea
              rows="5"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec cet enseignant pour aider les autres parents..."
              required
            />
          </div>
          <div className="form-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer l\'avis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

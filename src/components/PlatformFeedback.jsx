import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

export default function PlatformFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Veuillez donner une note.');
      return;
    }
    setIsSubmitting(true);
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Avis sur la plateforme:', { rating, comment });
    
    setIsSubmitting(false);
    setIsOpen(false);
    setRating(0);
    setComment('');
    toast.success('Merci pour votre avis !');
  };

  if (!isOpen) {
    return (
      <div className="platform-feedback-fab">
        <button onClick={() => setIsOpen(true)} className="btn btn-primary">
          Votre avis sur la plateforme
        </button>
      </div>
    );
  }

  return (
    <div className="platform-feedback-modal">
      <div className="modal-panel">
        <h3 style={{ marginBottom: '1.5rem' }}>Donnez votre avis sur la plateforme</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Votre note</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className={star <= rating ? 'filled' : ''}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Votre commentaire (optionnel)</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Qu'est-ce qui pourrait être amélioré ?"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

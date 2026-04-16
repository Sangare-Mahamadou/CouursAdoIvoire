import { useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import BookingModal from './BookingModal';

export default function TeacherCard({ teacher }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const diplomaLabel = teacher.diplomaId ? teacher.diplomaId.toUpperCase() : 'Non défini';

  return (
    <>
      <div className="card teacher-card animate-fade-in">
        <div>
          <div className="teacher-header">
            <div>
              <h3 className="teacher-name">{teacher.firstName} {teacher.lastName}</h3>
              <p className="teacher-city"><MapPin size={14} /> {teacher.city}</p>
            </div>
            <span className="badge">{diplomaLabel}</span>
          </div>
          
          <div className="subjects-list">
            {teacher.subjects && teacher.subjects.map((sub, idx) => (
              <span key={idx} className="subject-pill">{sub}</span>
            ))}
          </div>

          <p className="teacher-description" style={{ marginTop: '1rem', color: 'var(--color-text-light)', fontSize: '0.875rem' }}>
            {teacher.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: '600' }}>{teacher.rating || '5.0'}</span>
            <span style={{ color: 'var(--color-text-light)' }}>({teacher.reviewsCount || 0} avis)</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tarif horaire</span>
            <div className="price-tag">{teacher.hourlyRate} FCFA</div>
          </div>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>Contacter</button>
        </div>
      </div>

      {isModalOpen && <BookingModal teacher={teacher} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

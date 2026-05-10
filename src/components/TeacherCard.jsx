import { useState } from 'react';
import { MapPin, Star } from 'lucide-react';
import BookingModal from './BookingModal';
import { diplomas } from '../data/mockData';

export default function TeacherCard({ teacher }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const diplomaObj = diplomas.find(d => d.id === teacher.diplomaId);
  const diplomaLabel = diplomaObj ? diplomaObj.label : (teacher.diplomaId ? teacher.diplomaId.toUpperCase() : 'Non défini');

  return (
    <>
      <div className="card teacher-card animate-fade-in">
        <div>
          <div className="teacher-header" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img 
               src={teacher.profile_picture_url || 'https://via.placeholder.com/60'} 
               alt={`Photo de ${teacher.firstName}`} 
               style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} 
            />
            <div style={{ flex: 1 }}>
              <h3 className="teacher-name">{teacher.firstName} {teacher.lastName}</h3>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: '0.875rem' }}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <span style={{ fontWeight: '600' }}>Note : {teacher.rating || '5.0'}/5</span>
            <span style={{ color: 'var(--color-text-light)' }}>({teacher.reviewsCount || 0} avis parents)</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>Contacter</button>
        </div>
      </div>

      {isModalOpen && <BookingModal teacher={teacher} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}

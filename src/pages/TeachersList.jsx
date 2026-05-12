import { useState, useEffect } from 'react';
import { diplomas } from '../data/mockData';
import TeacherCard from '../components/TeacherCard';
import { getTeachers } from '../services/api';

export default function TeachersList() {
  const [filterDiploma, setFilterDiploma] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Appel à l'API pour récupérer les vrais profs depuis MySQL
    getTeachers()
      .then(data => {
        setTeachers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur api teachers:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredTeachers = teachers.filter(teacher => {
    const matchDiploma = filterDiploma ? teacher.diploma_level === filterDiploma : true;
    
    const matchSearch = teacher.subjects && teacher.subjects.length > 0 
      ? teacher.subjects.some(sub => sub.name && sub.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (teacher.city && teacher.city.toLowerCase().includes(searchTerm.toLowerCase()))
      : (teacher.city && teacher.city.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchDiploma && matchSearch;
  });

  return (
    <div className="container dashboard-layout animate-fade-in">
      <div>
        <h1 className="page-title">Trouver un enseignant</h1>
        <p style={{ color: 'var(--color-text-light)', marginTop: '-1.5rem', marginBottom: '2rem' }}>
          Parcourez nos profils vérifiés réels depuis la base de données.
        </p>
      </div>

      <div className="card glass" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ flex: '1 1 300px' }}>
          <label>Matière ou Ville (ex: Mathématiques, Abidjan)</label>
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label>Niveau / Diplôme</label>
          <select value={filterDiploma} onChange={(e) => setFilterDiploma(e.target.value)}>
            <option value="">Tous les niveaux</option>
            {diplomas.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            Chargement des enseignants depuis MySQL...
          </div>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            Aucun enseignant trouvé avec ces critères en base de données.
          </div>
        )}
      </div>
    </div>
  );
}

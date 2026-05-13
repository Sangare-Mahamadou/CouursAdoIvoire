import { useEffect, useState } from 'react';
import { updateProfile, getCurrentUser, getProfile } from '../services/api';
import { diplomas, AVAILABLE_SUBJECTS } from '../data/mockData';

const emptyForm = {
    name: '',
    email: '',
    phone: '',
    city: '',
    diploma_level: '',
    subjects: [],
    description: '',
    profile_picture_url: '',
    availability_days: 5
};

export default function ProfileEditor() {
    const [user] = useState(() => getCurrentUser());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [profilePicture, setProfilePicture] = useState(null);
    const [customSubject, setCustomSubject] = useState('');
    const [customPrice, setCustomPrice] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        if (!user) return;

        getProfile()
            .then((profile) => {
                setFormData({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    city: profile.city || '',
                    diploma_level: profile.diploma_level || 'licence',
                    subjects: Array.isArray(profile.subjects) ? profile.subjects : [],
                    description: profile.description || '',
                    availability_days: profile.availability_days || 5,
                    profile_picture_url: profile.profile_picture_url || ''
                });
            })
            .catch(() => {
                setFormData({
                    ...emptyForm,
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    city: user?.city || '',
                    diploma_level: user?.diploma_level || 'licence',
                    subjects: user?.subjects || [],
                    description: user?.description || '',
                    availability_days: user?.availability_days || 5,
                    profile_picture_url: user?.profile_picture_url || ''
                });
            });
    }, [user]);

    const updateSubjectPrice = (subjectName, price) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.map(s => s.name === subjectName ? { ...s, price } : s)
        }));
    };

    const toggleSubject = (subjectName, checked) => {
        setFormData(prev => ({
            ...prev,
            subjects: checked
                ? [...prev.subjects, { name: subjectName, price: '' }]
                : prev.subjects.filter(s => s.name !== subjectName)
        }));
    };

    const addCustomSubject = () => {
        const name = customSubject.trim();
        if (!name || !customPrice) return;
        if (formData.subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) return;

        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, { name, price: customPrice }]
        }));
        setCustomSubject('');
        setCustomPrice('');
    };

    const removeSubject = (subjectName) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter(s => s.name !== subjectName)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        try {
            let payload = new FormData();
            payload.append('name', formData.name);
            payload.append('email', formData.email);
            payload.append('phone', formData.phone);
            payload.append('city', formData.city);

            if (user?.role === 'teacher') {
                payload.append('diploma_level', formData.diploma_level);
                payload.append('subjects', JSON.stringify(formData.subjects));
                payload.append('description', formData.description);
                payload.append('availability_days', formData.availability_days);
                if (profilePicture) {
                    payload.append('profile_picture', profilePicture);
                }
            }

            await updateProfile(payload);
            setStatus('success');
            setIsEditing(false);
            // Optionnel: recharger les données ou mettre à jour l'état global
        } catch (err) {
            setStatus('error');
            setErrorMsg(err.message || "Une erreur s'est produite.");
        }
    };

    if (!user) return <div>Chargement...</div>;

    return (
        <div className="card profile-editor">
            <div className="profile-header">
                <img 
                    src={profilePicture ? URL.createObjectURL(profilePicture) : formData.profile_picture_url || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                    alt="Profil" 
                    className="profile-picture-large"
                />
                <h2>{formData.name}</h2>
                <p>{user.role === 'teacher' ? `Enseignant • ${diplomas.find(d => d.id === formData.diploma_level)?.label || 'Niveau non défini'}` : 'Parent d\'élève'}</p>
                <button 
                    className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'}`} 
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Annuler' : 'Modifier mon profil'}
                </button>
            </div>

            {status === 'success' && <div className="alert alert-success">Profil mis à jour avec succès !</div>}
            {status === 'error' && <div className="alert alert-danger">{errorMsg}</div>}

            <form onSubmit={handleSubmit}>
                {isEditing ? (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nom complet</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Téléphone</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Ville</label>
                            <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        </div>

                        {user.role === 'teacher' && (
                            <>
                                <div className="form-group">
                                    <label>Photo de profil</label>
                                    <input type="file" accept="image/*" onChange={e => setProfilePicture(e.target.files[0])} />
                                </div>
                                <div className="form-group">
                                    <label>Niveau d'étude</label>
                                    <select value={formData.diploma_level} onChange={e => setFormData({...formData, diploma_level: e.target.value})}>
                                        {diplomas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Jours disponibles / semaine</label>
                                    <select value={formData.availability_days} onChange={e => setFormData({...formData, availability_days: parseInt(e.target.value, 10)})}>
                                        {[...Array(7).keys()].map(i => <option key={i+1} value={i+1}>{i+1} jour{i > 0 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Description</label>
                                    <textarea rows="5" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                                </div>
                                <div className="form-group full-width">
                                    <label>Matières et tarifs (par heure)</label>
                                    <div className="subjects-grid">
                                        {AVAILABLE_SUBJECTS.map(subject => (
                                            <div key={subject} className="subject-item-wrapper">
                                                <div className={`subject-item ${formData.subjects.some(s => s.name === subject) ? 'selected' : ''}`}>
                                                    <span>{subject}</span>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={formData.subjects.some(s => s.name === subject)}
                                                        onChange={(e) => toggleSubject(subject, e.target.checked)}
                                                    />
                                                </div>
                                                {formData.subjects.some(s => s.name === subject) && (
                                                    <div className="price-input">
                                                        <input 
                                                            type="number" 
                                                            placeholder="Prix" 
                                                            value={formData.subjects.find(s => s.name === subject)?.price || ''}
                                                            onChange={(e) => updateSubjectPrice(subject, e.target.value)}
                                                            required
                                                        />
                                                        <span>FCFA</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Ajouter une autre matière</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="text" placeholder="Nom de la matière" value={customSubject} onChange={e => setCustomSubject(e.target.value)} />
                                        <input type="number" placeholder="Prix/heure en FCFA" value={customPrice} onChange={e => setCustomPrice(e.targe.value)} />
                                        <button type="button" className="btn btn-outline" onClick={addCustomSubject}>Ajouter</button>
                                    </div>
                                    <div className="custom-subjects-list">
                                        {formData.subjects.filter(s => !AVAILABLE_SUBJECTS.includes(s.name)).map(s => (
                                            <div key={s.name} className="chip">
                                                {s.name} ({s.price} FCFA)
                                                <button type="button" onClick={() => removeSubject(s.name)}>&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="form-group full-width">
                            <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                                {status === 'loading' ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="profile-display">
                        <p><strong>Email:</strong> {formData.email}</p>
                        <p><strong>Téléphone:</strong> {formData.phone}</p>
                        <p><strong>Ville:</strong> {formData.city}</p>
                        {user.role === 'teacher' && (
                            <>
                                <p><strong>Disponibilité:</strong> {formData.availability_days} jour{formData.availability_days > 1 ? 's' : ''}/7</p>
                                <p><strong>Description:</strong> {formData.description || 'Aucune description fournie.'}</p>
                                <h3>Matières enseignées</h3>
                                {formData.subjects.length > 0 ? (
                                    <ul className="subjects-list-display">
                                        {formData.subjects.map(s => <li key={s.name}>{s.name} - <strong>{s.price} FCFA/h</strong></li>)}
                                    </ul>
                                ) : <p>Aucune matière configurée.</p>}
                            </>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}

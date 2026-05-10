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
    profile_picture_url: ''
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
            let payload = formData;
            if (user?.role === 'teacher') {
                if (formData.subjects.length === 0) {
                    throw new Error("Veuillez renseigner au moins une matière.");
                }

                payload = new FormData();
                payload.append('name', formData.name);
                payload.append('email', formData.email);
                payload.append('phone', formData.phone);
                payload.append('city', formData.city);
                payload.append('diploma_level', formData.diploma_level);
                payload.append('subjects', JSON.stringify(formData.subjects));
                payload.append('description', formData.description);
                if (profilePicture) {
                    payload.append('profile_picture', profilePicture);
                }
            }

            await updateProfile(payload);

            const updatedProfile = await getProfile();
            localStorage.setItem('user', JSON.stringify(updatedProfile));
            setFormData({
                name: updatedProfile.name || '',
                email: updatedProfile.email || '',
                phone: updatedProfile.phone || '',
                city: updatedProfile.city || '',
                diploma_level: updatedProfile.diploma_level || 'licence',
                subjects: Array.isArray(updatedProfile.subjects) ? updatedProfile.subjects : [],
                description: updatedProfile.description || '',
                profile_picture_url: updatedProfile.profile_picture_url || ''
            });

            setProfilePicture(null);
            setStatus('success');
            setTimeout(() => {
                setIsEditing(false);
                setStatus('idle');
            }, 1000);
        } catch (err) {
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    if (!isEditing) {
        return (
            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {user?.role === 'teacher' && formData.profile_picture_url && (
                            <img src={formData.profile_picture_url} alt="Profil" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
                        )}
                        <div>
                            <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Mes Informations</h2>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                                {formData.name} - {formData.email} - {formData.phone} - {formData.city}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(true)} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
                        Modifier
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card glass" style={{ marginBottom: '2rem', border: '1px solid var(--color-primary)' }}>
            <h2 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Modifier mes informations</h2>

            {status === 'error' && <div className="feedback error">{errorMsg}</div>}
            {status === 'success' && <div className="feedback success">Profil mis à jour.</div>}

            <form onSubmit={handleSubmit}>
                <div className="profile-grid">
                    <div className="form-group">
                        <label>Nom et prénoms</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Adresse e-mail</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Téléphone</label>
                        <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="form-group">
                        <label>Ville</label>
                        <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                </div>

                {user?.role === 'teacher' && (
                    <>
                        <div className="form-group">
                            <label>Niveau / diplôme</label>
                            <select required value={formData.diploma_level} onChange={e => setFormData({ ...formData, diploma_level: e.target.value })}>
                                {diplomas.map(d => (
                                    <option key={d.id} value={d.id}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea rows="4" placeholder="Présentez votre expérience, votre méthode et vos disponibilités." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label>Photo de profil</label>
                            <input type="file" accept="image/*" onChange={e => setProfilePicture(e.target.files[0])} />
                        </div>

                        <div className="form-group">
                            <label>Matières et prix mensuels</label>
                            <div className="subjects-editor">
                                {AVAILABLE_SUBJECTS.map(subject => {
                                    const selected = formData.subjects.find(s => s.name === subject);
                                    return (
                                        <div key={subject} className="subject-editor-row">
                                            <label className="checkbox-label">
                                                <input type="checkbox" checked={Boolean(selected)} onChange={e => toggleSubject(subject, e.target.checked)} />
                                                {subject}
                                            </label>
                                            {selected && (
                                                <input type="number" min="0" required placeholder="Prix / mois" value={selected.price || ''} onChange={e => updateSubjectPrice(subject, e.target.value)} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="custom-subject-row">
                            <input type="text" placeholder="Autre matière" value={customSubject} onChange={e => setCustomSubject(e.target.value)} />
                            <input type="number" min="0" placeholder="Prix / mois" value={customPrice} onChange={e => setCustomPrice(e.target.value)} />
                            <button type="button" onClick={addCustomSubject} className="btn btn-outline">Ajouter</button>
                        </div>

                        {formData.subjects.filter(s => !AVAILABLE_SUBJECTS.includes(s.name)).length > 0 && (
                            <div className="custom-subjects-list">
                                {formData.subjects.filter(s => !AVAILABLE_SUBJECTS.includes(s.name)).map(subject => (
                                    <span key={subject.name} className="subject-pill">
                                        {subject.name} - {subject.price} FCFA/mois
                                        <button type="button" onClick={() => removeSubject(subject.name)} className="pill-remove">x</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={status === 'loading'}>
                        {status === 'loading' ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline">
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
}

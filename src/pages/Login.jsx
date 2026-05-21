import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('status') === 'registered') {
      setSuccessMsg('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    }
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const data = await loginUser({ identifier, password });
      // Redirection après succès
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'parent') {
        navigate('/dashboard/parent');
      } else {
        navigate('/dashboard/teacher');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="card auth-card glass">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.8rem' }}>Connexion</h2>

        {errorMsg && <AlertMessage type="error" title="Erreur">{errorMsg}</AlertMessage>}
        {successMsg && <AlertMessage type="success" title="Succès">{successMsg}</AlertMessage>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>E-mail ou N° de téléphone</label>
            <input
              type="text"
              placeholder="votre@email.com ou +225..."
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label style={{ marginBottom: 0 }}>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '500' }}>
              Mot de passe oublié ?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

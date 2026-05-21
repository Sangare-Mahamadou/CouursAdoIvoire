import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await forgotPassword(email);
      setSuccessMsg(data.message || 'Si un compte existe avec cet email, un code a été envoyé.');
      
      // Attendre un court instant pour que l'utilisateur lise le message de succès avant la redirection
      setTimeout(() => {
        navigate(`/verify-reset-code?email=${encodeURIComponent(email)}`, { state: { email } });
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Une erreur s'est produite lors de l'envoi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="card auth-card glass">
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-primary-light)', 
            color: 'var(--color-primary)', 
            marginBottom: '1rem' 
          }}>
            <Mail size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Mot de passe oublié ?</h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
            Saisissez votre adresse email pour recevoir un code OTP de réinitialisation.
          </p>
        </div>

        {errorMsg && <AlertMessage type="error" title="Erreur">{errorMsg}</AlertMessage>}
        {successMsg && <AlertMessage type="success" title="Succès">{successMsg}</AlertMessage>}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="email">Adresse email</label>
            <input
              id="email"
              type="email"
              placeholder="parent@alloprof.ci ou enseignant@alloprof.ci"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ paddingLeft: '1rem' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              width: '100%', 
              marginTop: '1rem', 
              padding: '0.85rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem' 
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Envoi du code...
              </>
            ) : (
              'Envoyer le code OTP'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.9rem', 
            color: 'var(--color-primary)', 
            fontWeight: '600' 
          }}>
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

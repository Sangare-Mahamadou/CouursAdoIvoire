import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { verifyResetCode, forgotPassword } from '../services/api';
import AlertMessage from '../components/AlertMessage';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyResetCode() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Récupérer l'email depuis l'état de navigation ou le paramètre de requête
  const initialEmail = location.state?.email || searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Minuteur de 60 secondes pour le renvoi
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(null);

  const startTimer = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;
    if (!email) {
      setErrorMsg("Veuillez d'abord renseigner votre adresse email.");
      return;
    }

    setIsResending(true);
    setErrorMsg('');
    try {
      const data = await forgotPassword(email);
      toast.success(data.message || 'Un nouveau code OTP a été envoyé.');
      setSuccessMsg('Un nouveau code OTP a été envoyé à votre adresse email.');
      startTimer();
    } catch (err) {
      setErrorMsg(err.message || "Impossible de renvoyer le code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setErrorMsg('Le code OTP doit être composé de 6 chiffres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await verifyResetCode(email, code, password, confirmPassword);
      toast.success('Mot de passe réinitialisé avec succès !');
      setSuccessMsg('Mot de passe réinitialisé avec succès ! Redirection...');
      
      // Connexion automatique après réinitialisation
      setTimeout(() => {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'parent') {
          navigate('/dashboard/parent');
        } else {
          navigate('/dashboard/teacher');
        }
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur est survenue lors de la réinitialisation.');
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
            backgroundColor: 'var(--color-secondary-light)', 
            color: 'var(--color-secondary)', 
            marginBottom: '1rem' 
          }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>Vérification du code</h2>
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
            Veuillez saisir le code OTP reçu et choisir un nouveau mot de passe.
          </p>
        </div>

        {errorMsg && <AlertMessage type="error" title="Erreur">{errorMsg}</AlertMessage>}
        {successMsg && <AlertMessage type="success" title="Succès">{successMsg}</AlertMessage>}

        <form onSubmit={handleSubmit}>
          {!initialEmail && (
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="code">Code OTP (6 chiffres)</label>
            <input
              id="code"
              type="text"
              required
              maxLength={6}
              disabled={isLoading}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 123456"
              style={{ 
                letterSpacing: code ? '4px' : 'normal', 
                textAlign: code ? 'center' : 'left',
                fontSize: code ? '1.25rem' : 'normal',
                fontWeight: code ? 'bold' : 'normal'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
            <input
              id="confirmPassword"
              type="password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
                Réinitialisation en cours...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          {countdown > 0 ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-light)' }}>
              Vous pourrez renvoyer un code dans{' '}
              <strong style={{ color: 'var(--color-primary)' }}>{countdown}s</strong>
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              disabled={isResending}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              {isResending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Renvoi en cours...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Renvoyer le code OTP
                </>
              )}
            </button>
          )}

          <Link to="/login" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.9rem', 
            color: 'var(--color-text-light)', 
            fontWeight: '500',
            marginTop: '0.5rem'
          }}>
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

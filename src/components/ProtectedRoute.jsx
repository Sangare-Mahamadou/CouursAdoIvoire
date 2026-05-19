import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasAuthToken, loadCurrentUser } from '../services/api';

export default function ProtectedRoute({ allowedRoles, children }) {
  const [user, setUser] = useState(getCurrentUser());
  const [isLoading, setIsLoading] = useState(hasAuthToken() && !getCurrentUser());

  useEffect(() => {
    let isMounted = true;

    if (!hasAuthToken()) return undefined;

    loadCurrentUser()
      .then((profile) => {
        if (isMounted) setUser(profile);
      })
      .catch(() => {
        if (isMounted) setUser(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="container dashboard-layout">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin' : (user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/parent');
    return <Navigate to={fallback} replace />;
  }

  return children;
}

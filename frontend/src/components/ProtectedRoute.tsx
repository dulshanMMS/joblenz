import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any route that requires authentication
// If not logged in → redirect to login
// While loading auth state → show nothing (avoids flash)
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

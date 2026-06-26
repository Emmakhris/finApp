import { Navigate } from 'react-router-dom';
import { getToken } from '../../lib/apiClient';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function ProtectedRoute({ children }) {
  const { authUser, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" />;
  }

  return children;
} 
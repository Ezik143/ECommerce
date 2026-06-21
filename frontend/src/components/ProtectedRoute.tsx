import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth0';
import { useUserProfile } from '../hooks/useUserProfile';
import RoleSelection from './RoleSelection';
import RegistrationForm from './RegistrationForm';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { profile, loading: profileLoading, error, refetch } = useUserProfile();

  if (isLoading || profileLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '20rem', margin: '0 1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Failed to load profile
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
          <button onClick={refetch} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!profile.hasCompletedProfile) {
    return <RegistrationForm onCompleted={refetch} />;
  }

  if (!profile.hasChosenRole) {
    return <RoleSelection onRoleChosen={refetch} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
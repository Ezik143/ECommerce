import { useUserProfile } from '../hooks/useUserProfile';

const UserProfile = () => {
  const { profile, loading } = useUserProfile();

  if (loading || !profile) return null;

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'badge badge-admin';
      case 'Seller':
        return 'badge badge-seller';
      case 'Customer':
        return 'badge badge-customer';
      default:
        return 'badge badge-default';
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span className={roleBadgeClass(profile.role)}>{profile.role}</span>
    </div>
  );
};

export default UserProfile;
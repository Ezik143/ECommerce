import { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth0';
import { profileApi } from '../services/profileApi';
import type { ProfileResponse } from '../types/user';

interface UserProfileContextValue {
  profile: ProfileResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const UserProfileContext = createContext<UserProfileContextValue>({
  profile: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading: authLoading, getAccessToken } = useAuth();
  const getTokenRef = useRef(getAccessToken);
  getTokenRef.current = getAccessToken;

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await getTokenRef.current();
      await profileApi.ensureUser();
      const data = await profileApi.getMe();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserProfileContext.Provider value={{ profile, loading: loading || authLoading, error, refetch }}>
      {children}
    </UserProfileContext.Provider>
  );
};

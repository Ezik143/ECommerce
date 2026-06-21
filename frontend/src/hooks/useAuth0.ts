import { useAuth0 } from '@auth0/auth0-react';
import { setAccessToken } from '../services/api';

export const useAuth = () => {
  const auth0 = useAuth0();

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const token = await auth0.getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      });
      setAccessToken(token);
      return token;
    } catch (error) {
      console.error('Failed to get access token:', error);
      setAccessToken(null);
      return null;
    }
  };

  return {
    ...auth0,
    getAccessToken,
  };
};

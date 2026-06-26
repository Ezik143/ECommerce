import { useContext } from 'react';
import { UserProfileContext } from '../contexts/UserProfileContext';

export const useUserProfile = () => {
  return useContext(UserProfileContext);
};

export type UserRole = 'Customer' | 'Seller' | 'OrderManager' | 'CustomerSupport' | 'Admin';

export interface ProfileResponse {
  auth0UserId: string;
  email: string;
  name: string;
  localUserId: number | null;
  localFullName: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  hasChosenRole: boolean;
  hasCompletedProfile: boolean;
  message: string;
}

export interface SetRoleRequest {
  role: 'Customer' | 'Seller';
}

export interface SetRoleResponse {
  role: UserRole;
  hasChosenRole: boolean;
}

export interface EnsureUserResponse {
  user: {
    userId: number;
    auth0Id: string;
    email: string;
    fullName: string;
    role: UserRole;
    hasChosenRole: boolean;
    createdAt: string;
  };
  isNew: boolean;
}

export interface CompleteProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

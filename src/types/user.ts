export type UserRole = 'parent' | 'driver';

export interface BaseUser {
  id: number;
  full_name: string;
  username: string;
  role: UserRole;
  school_id: number;
  school_name: string;
  is_active: boolean;
}

export interface ParentUser extends BaseUser {
  role: 'parent';
  phone: string;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}

export interface DriverUser extends BaseUser {
  role: 'driver';
  user_role: string;
  phone: string | null;
  email_id: string | null;
  license_number: string | null;
  license_expiry_date: string | null;
  address: string | null;
}

export type AuthUser = ParentUser | DriverUser;

export interface User {
  id: string;
  username: string;
  createdAt: string;
  lastLogin?: string;
  mustChangePassword: boolean;
  role: 'user' | 'admin';
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

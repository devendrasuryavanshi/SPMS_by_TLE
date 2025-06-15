import api from '../plugins/axios';

export interface UserLoginData {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

const authService = {
  login: async (userData: UserLoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', userData);
    if (response.data.success) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data;
    } else {
      throw new Error(response.data.message);
    }
  },

  logout: async (): Promise<void> => {
    if (!localStorage.getItem('user')) {
      return;
    }
    const response = await api.post('/auth/logout');
    if (response.data.success) {
      localStorage.removeItem('user');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data.user;
    } catch (error) {
      return null;
    }
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('user');
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;

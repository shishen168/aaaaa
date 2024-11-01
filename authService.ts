import { userService } from './userService';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  token: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);
      
      if (token && userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch (e) {
      console.error('Error loading user from storage:', e);
      this.clearStorage();
    }
  }

  private clearStorage() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser = null;
  }

  isLoggedIn(): boolean {
    return !!this.currentUser && !!localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.loadUserFromStorage();
    }
    return this.currentUser;
  }

  async login(usernameOrEmail: string, password: string, rememberMe: boolean = false): Promise<{success: boolean; message?: string}> {
    try {
      const user = userService.validateCredentials(usernameOrEmail, password);
      
      if (!user) {
        return { success: false, message: '用户名或密码错误' };
      }

      const token = Math.random().toString(36).substring(2);
      
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        token
      };

      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(this.currentUser));

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '登录失败，请重试' };
    }
  }

  logout() {
    if (this.currentUser) {
      userService.updateLastLogout(this.currentUser.id);
    }
    this.clearStorage();
    window.location.href = '/login';
  }
}

export const authService = new AuthService();
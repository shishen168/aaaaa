import { BALANCE_UPDATE_EVENT } from '../components/MainApp';

export interface User {
  id: string;
  email: string;
  username: string;
  status: 'active' | 'banned';
  balance: number;
  lastLogin: string;
  registerDate: string;
  totalOrders: number;
  totalRecharge: number;
  totalSpent: number;
  lastModified: string;
}

export interface UserCredentials {
  id: string;
  email: string;
  username: string;
  password: string;
  lastPasswordChange: string;
}

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
}

class UserService {
  private users: User[] = [];
  private credentials: UserCredentials[] = [];
  private readonly USERS_KEY = 'users';
  private readonly CREDENTIALS_KEY = 'userCredentials';

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      const savedUsers = localStorage.getItem(this.USERS_KEY);
      const savedCredentials = localStorage.getItem(this.CREDENTIALS_KEY);

      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        this.initializeUsers();
      }

      if (savedCredentials) {
        this.credentials = JSON.parse(savedCredentials);
      } else {
        this.initializeCredentials();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.initializeUsers();
      this.initializeCredentials();
    }
  }

  private saveData() {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users));
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify(this.credentials));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  private initializeUsers() {
    this.users = [
      {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        status: 'active',
        balance: 100.00,
        lastLogin: new Date().toLocaleString(),
        registerDate: new Date().toLocaleString(),
        totalOrders: 0,
        totalRecharge: 100.00,
        totalSpent: 0,
        lastModified: new Date().toISOString()
      }
    ];
    this.saveData();
  }

  private initializeCredentials() {
    this.credentials = [
      {
        id: '1',
        email: 'admin@example.com',
        username: 'admin',
        password: 'admin123',
        lastPasswordChange: new Date().toLocaleString()
      }
    ];
    this.saveData();
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  getAllCredentials(): UserCredentials[] {
    return [...this.credentials];
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getCurrentUser(): User | null {
    const authUser = localStorage.getItem('auth_user');
    if (!authUser) return null;
    
    const { id } = JSON.parse(authUser);
    return this.getUserById(id) || null;
  }

  updateUserBalance(userId: string, newBalance: number): boolean {
    try {
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) return false;

      const user = this.users[userIndex];
      const oldBalance = user.balance;
      const rechargeAmount = newBalance - oldBalance;

      this.users[userIndex] = {
        ...user,
        balance: newBalance,
        lastModified: new Date().toISOString(),
        totalRecharge: rechargeAmount > 0 ? user.totalRecharge + rechargeAmount : user.totalRecharge,
        totalSpent: rechargeAmount < 0 ? user.totalSpent + Math.abs(rechargeAmount) : user.totalSpent
      };

      this.saveData();

      window.dispatchEvent(new CustomEvent(BALANCE_UPDATE_EVENT, {
        detail: {
          userId,
          balance: newBalance,
          oldBalance,
          change: rechargeAmount
        }
      }));

      return true;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return false;
    }
  }

  deductBalance(userId: string, amount: number): boolean {
    try {
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) return false;

      const user = this.users[userIndex];
      if (user.balance < amount) return false;

      const newBalance = user.balance - amount;
      this.users[userIndex] = {
        ...user,
        balance: newBalance,
        lastModified: new Date().toISOString(),
        totalSpent: user.totalSpent + amount
      };

      this.saveData();

      window.dispatchEvent(new CustomEvent(BALANCE_UPDATE_EVENT, {
        detail: {
          userId,
          balance: newBalance,
          oldBalance: user.balance,
          change: -amount
        }
      }));

      return true;
    } catch (error) {
      console.error('Error deducting balance:', error);
      return false;
    }
  }

  addBalance(userId: string, amount: number): boolean {
    try {
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex === -1) return false;

      const user = this.users[userIndex];
      const newBalance = user.balance + amount;

      this.users[userIndex] = {
        ...user,
        balance: newBalance,
        lastModified: new Date().toISOString(),
        totalRecharge: user.totalRecharge + amount
      };

      this.saveData();

      window.dispatchEvent(new CustomEvent(BALANCE_UPDATE_EVENT, {
        detail: {
          userId,
          balance: newBalance,
          oldBalance: user.balance,
          change: amount
        }
      }));

      return true;
    } catch (error) {
      console.error('Error adding balance:', error);
      return false;
    }
  }

  updateUserStatus(userId: string, status: 'active' | 'banned'): boolean {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    this.users[userIndex] = {
      ...this.users[userIndex],
      status,
      lastModified: new Date().toISOString()
    };

    this.saveData();
    return true;
  }

  registerUser(data: RegisterUserData): boolean {
    try {
      const existingUser = this.credentials.find(
        u => u.username.toLowerCase() === data.username.toLowerCase() || 
            u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        return false;
      }

      const now = new Date();
      const userId = (Math.max(...this.users.map(u => parseInt(u.id)), 0) + 1).toString();

      const newCredentials: UserCredentials = {
        id: userId,
        email: data.email,
        username: data.username,
        password: data.password,
        lastPasswordChange: now.toLocaleString()
      };

      const newUser: User = {
        id: userId,
        email: data.email,
        username: data.username,
        status: 'active',
        balance: 0, // 新用户初始余额为0
        lastLogin: now.toLocaleString(),
        registerDate: now.toLocaleString(),
        totalOrders: 0,
        totalRecharge: 0, // 初始充值金额为0
        totalSpent: 0,
        lastModified: now.toISOString()
      };

      this.credentials.push(newCredentials);
      this.users.push(newUser);
      this.saveData();

      return true;
    } catch (error) {
      console.error('Error registering user:', error);
      return false;
    }
  }

  validateCredentials(usernameOrEmail: string, password: string): UserCredentials | null {
    const user = this.credentials.find(
      u => (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || 
            u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
           u.password === password
    );
    
    if (user) {
      const userRecord = this.users.find(u => u.id === user.id);
      if (userRecord) {
        userRecord.lastLogin = new Date().toLocaleString();
        this.saveData();
      }
    }
    
    return user;
  }

  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: '密码长度至少为6位' };
    }
    return { valid: true };
  }

  updateLastLogout(userId: string): void {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      this.users[userIndex].lastModified = new Date().toISOString();
      this.saveData();
    }
  }

  logout(): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.updateLastLogout(currentUser.id);
    }
  }
}

export const userService = new UserService();
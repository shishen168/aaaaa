import { io, Socket } from 'socket.io-client';
import { userService } from './userService';
import { blacklistService } from './blacklistService';
import { priceService } from './priceService';

interface SendSMSParams {
  recipients: string[];
  message: string;
  scheduleTime?: string;
}

interface SMSResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class SMSService {
  private readonly API_ENDPOINT = 'https://api.textinghouse.com/http/v1/do';
  private readonly API_USER = 'afei4913@gmail.com';
  private readonly API_PASS = '3jrnig3ks38r00j4rhb5pvg2';
  private socket: Socket | null = null;
  private messageHandlers: ((message: any) => void)[] = [];
  private rechargeHandlers: ((data: any) => void)[] = [];
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private readonly RECONNECT_DELAY = 5000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      const socketUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.textinghouse.com'
        : window.location.hostname === 'localhost' 
          ? 'http://localhost:3001'
          : `https://${window.location.hostname.replace('3000', '3001')}`;

      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: this.RECONNECT_DELAY,
        timeout: 10000,
        forceNew: true,
        path: '/socket.io'
      });

      this.setupSocketListeners();
    } catch (error) {
      console.warn('Socket initialization failed, falling back to local storage mode:', error);
      this.socket = null;
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.info('Connected to SMS server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      this.handleConnectionError();
    });

    this.socket.on('new_message', (message) => {
      this.handleIncomingMessage(message);
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('recharge_success', (data) => {
      this.handleRechargeSuccess(data);
    });

    this.socket.on('disconnect', (reason) => {
      console.info('Disconnected from SMS server:', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.handleConnectionError();
    });
  }

  private handleRechargeSuccess(data: { userId: string; amount: number }) {
    try {
      const currentUser = userService.getCurrentUser();
      if (currentUser && currentUser.id === data.userId) {
        // 更新用户余额
        userService.addBalance(data.userId, data.amount);
        
        // 触发充值成功事件
        window.dispatchEvent(new CustomEvent('rechargeSuccess', {
          detail: {
            amount: data.amount,
            newBalance: userService.getUserById(data.userId)?.balance || 0
          }
        }));

        // 通知所有充值处理器
        this.rechargeHandlers.forEach(handler => handler(data));

        // 自动跳转到主页
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error handling recharge success:', error);
    }
  }

  private handleConnectionError() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.warn('Max reconnection attempts reached, switching to local storage mode');
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }

  private handleIncomingMessage(message: any) {
    try {
      const history = this.getLocalHistory();
      history.push({
        id: Date.now().toString(),
        recipient: message.from,
        message: message.text,
        status: 'success',
        sendTime: new Date().toISOString(),
        isIncoming: true
      });
      localStorage.setItem('sms_history', JSON.stringify(history));
      window.dispatchEvent(new Event('smsHistoryUpdate'));
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  private getLocalHistory(): any[] {
    try {
      const saved = localStorage.getItem('sms_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading SMS history:', error);
      return [];
    }
  }

  async sendSMS(recipients: string[], message: string): Promise<SMSResponse> {
    try {
      const currentUser = userService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: '用户未登录'
        };
      }

      const blacklistedNumbers = recipients.filter(phone => 
        blacklistService.isBlacklisted(phone)
      );

      if (blacklistedNumbers.length > 0) {
        return {
          success: false,
          message: `以下号码在黑名单中: ${blacklistedNumbers.join(', ')}`
        };
      }

      const prices = priceService.getSettings();
      const totalCost = recipients.length * prices.sendPrice;

      const userData = userService.getUserById(currentUser.id);
      if (!userData || userData.balance < totalCost) {
        return {
          success: false,
          message: '余额不足，请充值'
        };
      }

      const deductSuccess = userService.deductBalance(currentUser.id, totalCost);
      if (!deductSuccess) {
        return {
          success: false,
          message: '扣费失败'
        };
      }

      const history = this.getLocalHistory();
      const newRecords = recipients.map(recipient => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        recipient,
        message,
        status: 'sent',
        sendTime: new Date().toISOString()
      }));

      history.push(...newRecords);
      localStorage.setItem('sms_history', JSON.stringify(history));
      window.dispatchEvent(new Event('smsHistoryUpdate'));

      if (this.socket?.connected) {
        for (const recipient of recipients) {
          await new Promise<void>((resolve, reject) => {
            this.socket?.emit('send_message', {
              to: recipient,
              text: message,
              userId: currentUser.id
            }, (response: any) => {
              if (response?.success) {
                resolve();
              } else {
                reject(new Error('Failed to send message via socket'));
              }
            });

            setTimeout(() => resolve(), 5000);
          });
        }
      }

      return {
        success: true,
        message: '发送成功',
        data: newRecords
      };

    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      };
    }
  }

  onMessage(handler: (message: any) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onRecharge(handler: (data: any) => void): () => void {
    this.rechargeHandlers.push(handler);
    return () => {
      this.rechargeHandlers = this.rechargeHandlers.filter(h => h !== handler);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers = [];
    this.rechargeHandlers = [];
  }
}

export const smsService = new SMSService();
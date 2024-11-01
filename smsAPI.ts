import { userService } from './userService';
import { priceService } from './priceService';
import { blacklistService } from './blacklistService';
import { authService } from './authService';

export const smsAPI = {
  async sendSMS({ recipients, message }: {
    recipients: string[];
    message: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if user is logged in
      if (!authService.isLoggedIn()) {
        return {
          success: false,
          message: '用户未登录'
        };
      }

      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          message: '用户未登录'
        };
      }

      // Check blacklist
      const blacklistedNumbers = recipients.filter(phone => 
        blacklistService.isBlacklisted(phone)
      );

      if (blacklistedNumbers.length > 0) {
        return {
          success: false,
          message: `以下号码在黑名单中: ${blacklistedNumbers.join(', ')}`
        };
      }

      // Calculate cost
      const prices = priceService.getSettings();
      const totalCost = recipients.length * prices.sendPrice;

      // Check user balance
      const userData = userService.getUserById(currentUser.id);
      if (!userData || userData.balance < totalCost) {
        return {
          success: false,
          message: '余额不足，请充值'
        };
      }

      // Deduct balance first
      const deductSuccess = userService.deductBalance(currentUser.id, totalCost);
      if (!deductSuccess) {
        return {
          success: false,
          message: '扣费失败'
        };
      }

      // Save to history
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
  },

  getLocalHistory() {
    try {
      const saved = localStorage.getItem('sms_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading SMS history:', error);
      return [];
    }
  },

  deleteMessage(id: string) {
    try {
      const history = this.getLocalHistory();
      const newHistory = history.filter(msg => msg.id !== id);
      localStorage.setItem('sms_history', JSON.stringify(newHistory));
      window.dispatchEvent(new Event('smsHistoryUpdate'));
      return { success: true };
    } catch (error) {
      return { success: false, message: '删除失败' };
    }
  },

  deleteThread(recipient: string) {
    try {
      const history = this.getLocalHistory();
      const newHistory = history.filter(msg => msg.recipient !== recipient);
      localStorage.setItem('sms_history', JSON.stringify(newHistory));
      window.dispatchEvent(new Event('smsHistoryUpdate'));
      return { success: true };
    } catch (error) {
      return { success: false, message: '删除失败' };
    }
  }
};
import { smsService } from './smsService';
import { contactsService } from './contactsService';
import { Contact } from '../types';

export interface SMSRecord {
  id: string;
  recipient: string;
  message: string;
  status: 'sent' | 'failed' | 'scheduled';
  sendTime: string;
  isIncoming?: boolean;
}

class SMSApi {
  async sendSMS({ recipients, message }: {
    recipients: string[];
    message: string;
  }): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const response = await smsService.sendSMS(recipients, message);
      return response;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '发送失败'
      };
    }
  }

  getLocalHistory(): SMSRecord[] {
    try {
      const saved = localStorage.getItem('sms_history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading SMS history:', error);
      return [];
    }
  }

  deleteMessage(messageId: string): { success: boolean; message?: string } {
    try {
      const history = this.getLocalHistory();
      const filtered = history.filter(msg => msg.id !== messageId);
      localStorage.setItem('sms_history', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, message: '删除消息失败' };
    }
  }

  deleteThread(recipient: string): { success: boolean; message?: string } {
    try {
      const history = this.getLocalHistory();
      const filtered = history.filter(msg => msg.recipient !== recipient);
      localStorage.setItem('sms_history', JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, message: '删除对话失败' };
    }
  }

  isPinned(recipient: string): boolean {
    try {
      const pinned = localStorage.getItem('pinned_threads');
      const pinnedThreads = pinned ? JSON.parse(pinned) : [];
      return pinnedThreads.includes(recipient);
    } catch (error) {
      return false;
    }
  }

  togglePin(recipient: string): void {
    try {
      const pinned = localStorage.getItem('pinned_threads');
      const pinnedThreads = pinned ? JSON.parse(pinned) : [];
      const index = pinnedThreads.indexOf(recipient);
      
      if (index === -1) {
        pinnedThreads.push(recipient);
      } else {
        pinnedThreads.splice(index, 1);
      }
      
      localStorage.setItem('pinned_threads', JSON.stringify(pinnedThreads));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  }
}

class ContactsApi {
  async getContacts() {
    try {
      const contacts = contactsService.getContacts();
      return {
        success: true,
        data: contacts
      };
    } catch (error) {
      return {
        success: false,
        message: '获取联系人失败'
      };
    }
  }

  async addContact(contact: Omit<Contact, 'id'>) {
    try {
      const newContact = contactsService.addContact(contact);
      return {
        success: true,
        data: newContact
      };
    } catch (error) {
      return {
        success: false,
        message: '添加联系人失败'
      };
    }
  }

  async updateContact(id: string, contact: Partial<Contact>) {
    try {
      const success = contactsService.updateContact(id, contact);
      return {
        success,
        message: success ? '更新成功' : '更新失败'
      };
    } catch (error) {
      return {
        success: false,
        message: '更新联系人失败'
      };
    }
  }

  async deleteContact(id: string) {
    try {
      const success = contactsService.deleteContact(id);
      return {
        success,
        message: success ? '删除成功' : '删除失败'
      };
    } catch (error) {
      return {
        success: false,
        message: '删除联系人失败'
      };
    }
  }

  async getTags() {
    try {
      const tags = contactsService.getTags();
      return {
        success: true,
        data: tags
      };
    } catch (error) {
      return {
        success: false,
        message: '获取标签失败'
      };
    }
  }

  async createTag(name: string) {
    try {
      const tag = contactsService.createTag(name);
      return {
        success: true,
        data: tag
      };
    } catch (error) {
      return {
        success: false,
        message: '创建标签失败'
      };
    }
  }

  async deleteTag(id: string) {
    try {
      const success = contactsService.deleteTag(id);
      return {
        success,
        message: success ? '删除成功' : '删除失败'
      };
    } catch (error) {
      return {
        success: false,
        message: '删除标签失败'
      };
    }
  }
}

export const smsAPI = new SMSApi();
export const contactsAPI = new ContactsApi();
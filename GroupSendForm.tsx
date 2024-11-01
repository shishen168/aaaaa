import React, { useState } from 'react';
import { Send, Users, Upload, AlertCircle, X, FileText } from 'lucide-react';
import { smsAPI } from '../../services/api';
import { contactsService } from '../../services/contactsService';
import ContactSelector from '../contacts/ContactSelector';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

function GroupSendForm() {
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedContacts, setUploadedContacts] = useState<{phone: string; name?: string}[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls', '.xlsx']
    },
    multiple: false,
    onDrop: async (files) => {
      try {
        const file = files[0];
        setUploadedFile(file);
        
        const text = await file.text();
        
        if (file.name.endsWith('.csv')) {
          // 解析 CSV 文件
          Papa.parse(text, {
            header: true,
            complete: (results) => {
              const contacts = results.data
                .filter(row => row.phone || row.mobile || row.telephone)
                .map(row => ({
                  phone: row.phone || row.mobile || row.telephone,
                  name: row.name || row.contact || row.username
                }));
              
              if (contacts.length > 0) {
                setUploadedContacts(contacts);
                setError('');
              } else {
                setError('文件中未找到有效的电话号码');
              }
            },
            error: (error) => {
              setError(`解析文件失败: ${error.message}`);
            }
          });
        } else {
          // 解析纯文本文件，假设每行一个号码
          const numbers = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(phone => ({ phone }));
          
          if (numbers.length > 0) {
            setUploadedContacts(numbers);
            setError('');
          } else {
            setError('文件中未找到有效的电话号码');
          }
        }
      } catch (err) {
        setError('读取文件失败');
        console.error('File reading error:', err);
      }
    }
  });

  const handleSend = async (e: React.MouseEvent) => {
    e.preventDefault();

    const allRecipients = [
      ...selectedContacts.map(c => c.phone),
      ...uploadedContacts.map(c => c.phone)
    ];

    if (allRecipients.length === 0) {
      setError('请添加至少一个收件人');
      return;
    }

    if (!message.trim()) {
      setError('请输入短信内容');
      return;
    }

    try {
      setSending(true);
      setError('');
      setSuccess('');

      const response = await smsAPI.sendSMS({
        recipients: allRecipients,
        message: message.trim()
      });

      if (response.success) {
        setSuccess('短信发送成功');
        setMessage('');
        setSelectedContacts([]);
        setUploadedContacts([]);
        setUploadedFile(null);
        
        // 3秒后清除成功提示
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(response.message || '发送失败');
      }
    } catch (err) {
      console.error('发送短信失败:', err);
      setError('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  const handleRemoveContact = (index: number, type: 'selected' | 'uploaded') => {
    if (type === 'selected') {
      setSelectedContacts(prev => prev.filter((_, i) => i !== index));
    } else {
      setUploadedContacts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedContacts([]);
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center p-4 bg-red-50 rounded-lg text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">收件人</label>
          
          {/* 联系人选择器 */}
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[100px]">
            {selectedContacts.map((contact, index) => (
              <div
                key={`selected-${index}`}
                className="flex items-center bg-white px-3 py-1 rounded-full border shadow-sm"
              >
                <span>{contact.name} ({contact.phone})</span>
                <button
                  onClick={() => handleRemoveContact(index, 'selected')}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {uploadedContacts.map((contact, index) => (
              <div
                key={`uploaded-${index}`}
                className="flex items-center bg-white px-3 py-1 rounded-full border shadow-sm"
              >
                <span>
                  {contact.name ? `${contact.name} (${contact.phone})` : contact.phone}
                </span>
                <button
                  onClick={() => handleRemoveContact(index, 'uploaded')}
                  className="ml-2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                onClick={() => setShowContactSelector(true)}
                className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-full"
              >
                <Users className="w-4 h-4 mr-1" />
                选择联系人
              </button>
              
              <div {...getRootProps()} className="cursor-pointer">
                <input {...getInputProps()} />
                <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-full">
                  <Upload className="w-4 h-4 mr-1" />
                  上传文件
                </button>
              </div>
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-1" />
              {uploadedFile.name}
              <button
                onClick={handleRemoveFile}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="mt-2 text-sm text-gray-500">
            支持上传 CSV、TXT 文件，CSV 文件需包含 phone/mobile/telephone 列
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            短信内容
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="输入要发送的短信内容..."
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            总计收件人: {selectedContacts.length + uploadedContacts.length}
          </div>
          <button
            onClick={handleSend}
            disabled={sending || (selectedContacts.length + uploadedContacts.length === 0) || !message.trim()}
            className={`
              flex items-center px-6 py-2 rounded-md text-white
              ${sending || selectedContacts.length + uploadedContacts.length === 0 || !message.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                发送中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                发送短信
              </>
            )}
          </button>
        </div>
      </div>

      {showContactSelector && (
        <ContactSelector
          contacts={contactsService.getContacts()}
          selectedContacts={selectedContacts}
          onSelect={setSelectedContacts}
          onClose={() => setShowContactSelector(false)}
        />
      )}
    </div>
  );
}

export default GroupSendForm;
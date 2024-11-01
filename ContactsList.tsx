import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { contactsAPI } from '../../services/api';
import ContactForm, { ContactFormData } from './ContactForm';
import BlacklistManager from './BlacklistManager';
import ContactImportExport from './ContactImportExport';
import useMediaQuery from '../../hooks/useMediaQuery';
import { Contact } from '../../types';

function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showBlacklist, setShowBlacklist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getContacts();
      if (response.success) {
        setContacts(response.data || []);
        setError('');
      } else {
        setError(response.message || '加载联系人失败');
      }
    } catch (err) {
      setError('加载联系人时发生错误');
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (data: ContactFormData) => {
    try {
      const response = await contactsAPI.addContact(data);
      if (response.success) {
        await loadContacts();
        setIsFormOpen(false);
      } else {
        setError(response.message || '添加联系人失败');
      }
    } catch (err) {
      setError('添加联系人时发生错误');
      console.error('Error adding contact:', err);
    }
  };

  const handleEdit = async (contact: Contact) => {
    try {
      const response = await contactsAPI.updateContact(contact.id, contact);
      if (response.success) {
        await loadContacts();
      } else {
        setError(response.message || '更新联系人失败');
      }
    } catch (err) {
      setError('更新联系人时发生错误');
      console.error('Error updating contact:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个联系人吗？')) return;

    try {
      const response = await contactsAPI.deleteContact(id);
      if (response.success) {
        await loadContacts();
      } else {
        setError(response.message || '删除联系人失败');
      }
    } catch (err) {
      setError('删除联系人时发生错误');
      console.error('Error deleting contact:', err);
    }
  };

  const handleSendSMS = (contact: Contact) => {
    navigate('/', { state: { recipient: contact.phone, recipientName: contact.name } });
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <h2 className="text-xl font-semibold">联系人管理</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBlacklist(true)}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              <Ban className="w-4 h-4 mr-1" />
              {!isMobile && "黑名单管理"}
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              {!isMobile && "添加联系人"}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索联系人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <ContactImportExport
          contacts={contacts}
          onImport={(importedContacts) => {
            setContacts([...contacts, ...importedContacts]);
          }}
        />

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                    {contact.email && (
                      <p className="text-sm text-gray-500">{contact.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSendSMS(contact)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    发送短信
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无联系人
            </h3>
            <p className="text-gray-500">
              点击"添加联系人"按钮创建新的联系人
            </p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <ContactForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddContact}
          title="添加联系人"
        />
      )}

      {showBlacklist && (
        <BlacklistManager
          isOpen={showBlacklist}
          onClose={() => setShowBlacklist(false)}
        />
      )}
    </div>
  );
}

export default ContactsList;
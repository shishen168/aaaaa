import React, { useState, useEffect } from 'react';
import { smsAPI } from '../../services/api';
import { SMSRecord, ChatThread } from './types';
import ThreadList from './ThreadList';
import ChatView from './ChatView';
import EmptyState from './EmptyState';
import Alert from '../common/Alert';

function SMSHistory() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
    
    const handleHistoryUpdate = () => {
      loadHistory();
    };
    
    window.addEventListener('smsHistoryUpdate', handleHistoryUpdate);
    return () => {
      window.removeEventListener('smsHistoryUpdate', handleHistoryUpdate);
    };
  }, []);

  const loadHistory = () => {
    try {
      setLoading(true);
      setError('');
      
      const messages = smsAPI.getLocalHistory();
      const threadMap = new Map<string, ChatThread>();

      // Group messages by recipient
      messages.forEach(message => {
        const thread = threadMap.get(message.recipient) || {
          recipient: message.recipient,
          messages: []
        };
        thread.messages.push(message);
        threadMap.set(message.recipient, thread);
      });

      // Sort threads by last message time
      const sortedThreads = Array.from(threadMap.values())
        .map(thread => ({
          ...thread,
          messages: thread.messages.sort((a, b) => 
            new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
          )
        }))
        .sort((a, b) => {
          const aTime = new Date(a.messages[0].sendTime).getTime();
          const bTime = new Date(b.messages[0].sendTime).getTime();
          return bTime - aTime;
        });

      setThreads(sortedThreads);
      
      // Update selected thread if exists
      if (selectedThread) {
        const updatedThread = sortedThreads.find(t => t.recipient === selectedThread.recipient);
        if (updatedThread) {
          setSelectedThread(updatedThread);
        }
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setError('加载历史记录失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await smsAPI.deleteMessage(messageId);
      if (response.success) {
        loadHistory();
      } else {
        setError(response.message || '删除消息失败');
      }
    } catch (error) {
      setError('删除消息失败，请重试');
    }
  };

  const handleDeleteThread = async (recipient: string) => {
    if (!window.confirm('确定要删除此对话吗？')) return;

    try {
      const response = await smsAPI.deleteThread(recipient);
      if (response.success) {
        if (selectedThread?.recipient === recipient) {
          setSelectedThread(null);
        }
        loadHistory();
      } else {
        setError(response.message || '删除对话失败');
      }
    } catch (error) {
      setError('删除对话失败，请重试');
    }
  };

  const filteredThreads = threads.filter(thread =>
    thread.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.messages.some(msg => msg.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-[600px] md:h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[600px] md:h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg flex">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="absolute top-4 right-4 z-50"
        />
      )}

      <div className={`${selectedThread ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r flex-col`}>
        {threads.length === 0 ? (
          <EmptyState
            title="暂无短信记录"
            description="发送新短信后将在这里显示"
          />
        ) : (
          <ThreadList
            threads={filteredThreads}
            selectedThreadId={selectedThread?.recipient || null}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onThreadSelect={setSelectedThread}
            onDeleteThread={handleDeleteThread}
          />
        )}
      </div>

      <div className={`${selectedThread ? 'flex' : 'hidden md:flex'} flex-col w-full md:w-2/3`}>
        {selectedThread ? (
          <ChatView
            key={selectedThread.recipient}
            thread={selectedThread}
            onClose={() => setSelectedThread(null)}
            onDeleteMessage={handleDeleteMessage}
            onThreadUpdate={loadHistory}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            选择一个对话开始聊天
          </div>
        )}
      </div>
    </div>
  );
}

export default SMSHistory;
import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, MoreVertical, Ban } from 'lucide-react';
import { ChatThread } from './types';
import MessageItem from './MessageItem';
import { smsAPI } from '../../services/api';
import { smsService } from '../../services/smsService';

interface ChatViewProps {
  thread: ChatThread;
  onClose: () => void;
  onDeleteMessage: (id: string) => void;
  onThreadUpdate: () => void;
  onAddToBlacklist?: (recipient: string) => void;
}

function ChatView({ thread, onClose, onDeleteMessage, onThreadUpdate, onAddToBlacklist }: ChatViewProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    scrollToBottom('auto');

    // 订阅新消息通知
    const unsubscribe = smsService.onMessage((message) => {
      if (message.from === thread.recipient) {
        onThreadUpdate();
        scrollToBottom();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [thread.messages]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior,
      block: 'end'
    });
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await smsAPI.sendSMS({
        recipients: [thread.recipient],
        message: replyMessage.trim()
      });

      if (response.success) {
        setReplyMessage('');
        onThreadUpdate();
      } else {
        alert(response.message || '发送失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // 对消息进行排序，确保按时间正序显示
  const sortedMessages = [...thread.messages].sort((a, b) => 
    new Date(a.sendTime).getTime() - new Date(b.sendTime).getTime()
  );

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Chat Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full mr-2 md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-medium">{thread.recipient}</h3>
            <p className="text-xs text-gray-500">
              {sortedMessages.length} 条消息
            </p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              {onAddToBlacklist && (
                <button
                  onClick={() => {
                    onAddToBlacklist(thread.recipient);
                    setShowOptions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  加入黑名单
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {sortedMessages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onDelete={() => onDeleteMessage(message.id)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendReply}
            disabled={!replyMessage.trim() || sending}
            className={`p-2 rounded-full ${
              !replyMessage.trim() || sending
                ? 'bg-gray-200 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
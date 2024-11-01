import React from 'react';
import { Search, Trash2, Pin } from 'lucide-react';
import { ChatThread } from './types';
import { smsAPI } from '../../services/api';

interface ThreadListProps {
  threads: ChatThread[];
  selectedThreadId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onThreadSelect: (thread: ChatThread) => void;
  onDeleteThread: (recipient: string) => void;
}

function ThreadList({
  threads,
  selectedThreadId,
  searchTerm,
  onSearchChange,
  onThreadSelect,
  onDeleteThread
}: ThreadListProps) {
  const sortedThreads = [...threads].sort((a, b) => {
    const isPinnedA = smsAPI.isPinned(a.recipient);
    const isPinnedB = smsAPI.isPinned(b.recipient);
    
    if (isPinnedA && !isPinnedB) return -1;
    if (!isPinnedA && isPinnedB) return 1;
    
    return new Date(b.messages[0].sendTime).getTime() - 
           new Date(a.messages[0].sendTime).getTime();
  });

  const handleTogglePin = (recipient: string, e: React.MouseEvent) => {
    e.stopPropagation();
    smsAPI.togglePin(recipient);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索历史记录..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedThreads.map((thread) => {
          const lastMessage = thread.messages[thread.messages.length - 1];
          const isPinned = smsAPI.isPinned(thread.recipient);
          
          return (
            <div
              key={thread.recipient}
              onClick={() => onThreadSelect(thread)}
              className={`p-4 cursor-pointer border-b flex justify-between items-center ${
                selectedThreadId === thread.recipient
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{thread.recipient}</div>
                <p className="text-sm text-gray-600 truncate mt-1">
                  {lastMessage.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(lastMessage.sendTime).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center ml-2">
                <button
                  onClick={(e) => handleTogglePin(thread.recipient, e)}
                  className={`p-2 rounded-full hover:bg-gray-100 ${
                    isPinned ? 'text-blue-500' : 'text-gray-400'
                  }`}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(thread.recipient);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
        
        {sortedThreads.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            暂无聊天记录
          </div>
        )}
      </div>
    </div>
  );
}

export default ThreadList;
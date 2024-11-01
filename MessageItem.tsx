import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';

interface MessageItemProps {
  message: {
    id: string;
    message: string;
    sendTime: string;
    isIncoming?: boolean;
    status?: 'sent' | 'failed' | 'pending';
  };
  onDelete: () => void;
}

function MessageItem({ message, onDelete }: MessageItemProps) {
  return (
    <div className={`flex ${message.isIncoming ? 'justify-start' : 'justify-end'}`}>
      <div className={`
        relative group max-w-[75%] rounded-lg px-4 py-2
        ${message.isIncoming 
          ? 'bg-white text-gray-900' 
          : 'bg-blue-500 text-white'
        }
        ${message.isIncoming ? 'rounded-tl-none' : 'rounded-tr-none'}
        shadow-sm
      `}>
        <p className="break-words text-sm">{message.message}</p>
        <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
          message.isIncoming ? 'text-gray-500' : 'text-blue-100'
        }`}>
          <span>{format(new Date(message.sendTime), 'HH:mm')}</span>
          {!message.isIncoming && (
            <Check className="w-3 h-3" />
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`
            absolute -right-8 top-0 p-2 opacity-0 group-hover:opacity-100
            transition-opacity text-gray-400 hover:text-red-500
          `}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default MessageItem;
import React from 'react';
import { MessageSquare, Users, Bell, Wallet, FileText, Phone, Ban, UserPlus, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'sms', icon: MessageSquare, label: '短信' },
    { id: 'contacts', icon: Users, label: '联系人' },
    { id: 'groupSend', icon: UserPlus, label: '群发短信' },
    { id: 'followup', icon: Bell, label: '跟进' },
    { id: 'recharge', icon: Wallet, label: '充值' },
    { id: 'billing', icon: FileText, label: '计费详情' },
    { id: 'countryCode', icon: Phone, label: '默认区号' },
    { id: 'blacklist', icon: Ban, label: '黑名单' }
  ];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              flex items-center w-full px-6 py-3 text-base transition-all duration-200
              ${activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              }
            `}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform duration-200 ${
              activeTab === item.id ? 'scale-110' : ''
            }`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">退出登录</span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
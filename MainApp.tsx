import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { notificationService } from '../services/notificationService';
import Navbar from './Navbar';
import MainContent from './MainContent';
import RechargeModal from './recharge/RechargeModal';
import NotificationBanner from './NotificationBanner';
import Advertisement from './advertisement/Advertisement';
import useMediaQuery from '../hooks/useMediaQuery';

export const BALANCE_UPDATE_EVENT = 'balanceUpdate';

function MainApp() {
  const [activeTab, setActiveTab] = useState('sms');
  const [balance, setBalance] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  const [notification, setNotification] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    loadUserBalance();

    const handleBalanceUpdate = (event: CustomEvent) => {
      if (event.detail.userId === currentUser.id) {
        setBalance(event.detail.balance);
      }
    };

    window.addEventListener(BALANCE_UPDATE_EVENT, handleBalanceUpdate as EventListener);
    
    return () => {
      window.removeEventListener(BALANCE_UPDATE_EVENT, handleBalanceUpdate as EventListener);
    };
  }, [currentUser]);

  const loadUserBalance = () => {
    if (!currentUser) return;

    const userData = userService.getUserById(currentUser.id);
    if (userData) {
      setBalance(userData.balance);
    }
  };

  const handleRechargeSuccess = (amount: number) => {
    loadUserBalance();
    setShowRecharge(false);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {isMobile && (
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-lg"
        >
          {showMobileMenu ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      )}

      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out' : 'relative'}
        ${isMobile && !showMobileMenu ? '-translate-x-full' : 'translate-x-0'}
        w-80 bg-white shadow-lg flex flex-col
      `}>
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="ml-3 flex-1">
              <div className="font-medium">{currentUser.username}</div>
              <div className="text-sm text-gray-500">余额: {balance.toFixed(2)} USDT</div>
            </div>
            <button
              onClick={() => setShowRecharge(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              充值
            </button>
          </div>
        </div>

        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <MainContent 
          activeTab={activeTab}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          onShowRecharge={() => setShowRecharge(true)}
        />
      </div>

      {showRecharge && (
        <RechargeModal
          isOpen={showRecharge}
          onClose={() => setShowRecharge(false)}
          onSuccess={handleRechargeSuccess}
        />
      )}

      {notification && <NotificationBanner />}
    </div>
  );
}

export default MainApp;
import React, { Suspense } from 'react';
import LoadingSpinner from './common/LoadingSpinner';
import SMSForm from './sms/SMSForm';
import SMSHistory from './sms/SMSHistory';
import ContactsList from './contacts/ContactsList';
import GroupSendForm from './sms/GroupSendForm';
import FollowUpList from './followup/FollowUpList';
import RechargeContent from './recharge/RechargeContent';
import BillingDetails from './billing/BillingDetails';
import CountryCodeSettings from './settings/CountryCodeSettings';
import BlacklistManager from './blacklist/BlacklistManager';

interface MainContentProps {
  activeTab: string;
  onShowRecharge: () => void;
}

function MainContent({ activeTab, onShowRecharge }: MainContentProps) {
  const renderContent = () => {
    switch (activeTab) {
      case 'sms':
        return (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <SMSForm />
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-lg shadow-lg">
                <SMSHistory />
              </div>
            </div>
          </div>
        );

      case 'contacts':
        return <ContactsList />;

      case 'groupSend':
        return <GroupSendForm />;

      case 'followup':
        return <FollowUpList />;

      case 'recharge':
        return <RechargeContent onShowRecharge={onShowRecharge} />;

      case 'billing':
        return <BillingDetails />;

      case 'countryCode':
        return <CountryCodeSettings />;

      case 'blacklist':
        return <BlacklistManager />;

      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingSpinner />}>
        {renderContent()}
      </Suspense>
    </div>
  );
}

export default MainContent;
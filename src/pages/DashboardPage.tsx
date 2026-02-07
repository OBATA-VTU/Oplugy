
import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';
import { SERVICE_CATEGORIES } from '../constants';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon } from '../components/Icons';

const serviceIcons: { [key: string]: React.ReactNode } = {
  airtime: <PhoneIcon />,
  data: <SignalIcon />,
  bills: <BoltIcon />,
  cable: <TvIcon />,
};

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated, fetchWalletBalance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Welcome to <span className="text-blue-600">Oplug</span>
      </h1>
      <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl mx-auto">
        Your one-stop solution for instant airtime, data, bills payment, and cable TV subscriptions.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {SERVICE_CATEGORIES.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.name}
            description={service.description}
            icon={serviceIcons[service.id]}
            to={service.path}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

import React from 'react';

interface InternetArchiveDonationProps {
  className?: string;
}

export const InternetArchiveDonation: React.FC<InternetArchiveDonationProps> = ({ className = '' }) => {
  const handleDonate = () => {
    window.open('https://archive.org/donate?origin=redirectinator.us', '_blank');
  };

  return (
    <div className={`wayback-donation-section ${className}`}>
      <div className="donation-header">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🏛️ Support the Internet Archive
        </h3>
      </div>
      
      <div className="donation-content text-center">
        <div 
          className="wayback-logo mx-auto mb-4 cursor-pointer transition-opacity duration-200 hover:opacity-80 text-center"
          onClick={handleDonate}
        >
          <div className="text-2xl font-bold text-blue-600 mb-2">WayBack Machine</div>
          <div className="text-sm text-gray-600">by Internet Archive</div>
        </div>
        
        <p className="donation-message text-sm text-gray-600 mb-4 leading-relaxed">
          The Wayback Machine API is free to use. Help keep 
          this invaluable service alive by making a donation.
        </p>
        
        <button 
          onClick={handleDonate}
          className="donate-button bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          💝 Donate to Internet Archive
        </button>
      </div>
    </div>
  );
};

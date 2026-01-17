import React from 'react';

// Placeholder Acutis logo component.
// If you have acutis-logo.jsx elsewhere, you can replace this
// with your real logo while keeping the same export name.
const AcutisLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 shadow-inner" />
        <div>
          <div className="text-3xl font-extrabold tracking-tight text-gray-900">Acutis</div>
          <div className="text-sm text-gray-500 -mt-1">Bruree Treatment Centre</div>
        </div>
      </div>
    </div>
  );
};

export default AcutisLogo;


import React from 'react';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastProps {
  open: boolean;
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ open, message, type = 'info', onClose }) => {
  if (!open) return null;

  const styles: Record<ToastType, string> = {
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`max-w-sm px-4 py-3 rounded-lg shadow border ${styles[type]} flex items-start space-x-3`}>
        <div className="flex-1 text-sm">{message}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs font-medium opacity-70 hover:opacity-100"
            aria-label="Close notification"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;


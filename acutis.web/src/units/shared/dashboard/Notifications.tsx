import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'urgent', message: 'Medical review needed - John D.', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New admission scheduled for 14:00', time: '15 min ago' },
    { id: 3, type: 'success', message: 'Room 12-A cleaned and ready', time: '1 hour ago' }
  ];

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'urgent':
        return { bg: 'bg-red-50', icon: AlertTriangle, color: 'text-red-500' };
      case 'success':
        return { bg: 'bg-green-50', icon: CheckCircle, color: 'text-green-500' };
      default:
        return { bg: 'bg-blue-50', icon: Clock, color: 'text-blue-500' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
      <div className="space-y-3">
        {notifications.map((notification) => {
          const config = getNotificationConfig(notification.type);
          const IconComponent = config.icon;
          
          return (
            <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${config.bg}`}>
              <div className={`mt-1 ${config.color}`}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
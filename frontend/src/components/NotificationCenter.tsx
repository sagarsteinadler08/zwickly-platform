import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle, Calendar, Sparkles } from "lucide-react";

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ isOpen, onClose }: NotificationCenterProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch notifications from API
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      // Get userId from localStorage
      const userId = localStorage.getItem('userId') || 'user-demo';
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const data = await response.json();
      
      // Transform API notifications to component format
      const transformedNotifications: Notification[] = data.map((n: any) => {
        const payload = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
        return {
          id: n.id,
          type: getNotificationType(n.type),
          title: getNotificationTitle(n.type, payload),
          message: getNotificationMessage(n.type, payload),
          timestamp: formatTimestamp(n.createdAt),
          read: n.read,
        };
      });
      
      // Fallback to mock if no notifications
      if (transformedNotifications.length === 0) {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'success',
            title: 'Welcome! 🎉',
            message: 'You are now connected to the notification system.',
            timestamp: 'Just now',
            read: false,
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(1);
      } else {
        setNotifications(transformedNotifications);
        setUnreadCount(transformedNotifications.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };
  
  const getNotificationType = (type: string): 'success' | 'error' | 'info' | 'warning' => {
    if (type.includes('approved') || type.includes('success')) return 'success';
    if (type.includes('declined') || type.includes('error') || type.includes('failed')) return 'error';
    if (type.includes('warning')) return 'warning';
    if (type.includes('admin_channel_request_new') || type.includes('admin_ticket_new')) return 'warning';
    return 'info';
  };
  
  const getNotificationTitle = (type: string, payload: any): string => {
    if (type.includes('mention')) return 'You were mentioned!';
    if (type.includes('ticket')) return 'Support Ticket Created';
    if (type.includes('event')) return 'New Event';
    if (type.includes('channel_request_approved')) return 'Channel Request Approved! 🎉';
    if (type.includes('channel_request_declined')) return 'Channel Request Declined';
    if (type.includes('channel_request_submitted')) return 'Channel Request Submitted';
    if (type.includes('admin_channel_request_new')) return 'New Channel Request 📝';
    if (type.includes('admin_ticket_new')) return 'New Support Ticket';
    return 'Notification';
  };
  
  const getNotificationMessage = (type: string, payload: any): string => {
    if (payload.message) return payload.message;
    if (type.includes('mention')) return payload.text || 'Someone mentioned you';
    if (type.includes('ticket')) return 'Your support ticket has been received';
    if (type.includes('event')) return 'A new event is available';
    if (type.includes('channel_request')) return payload.channelName || 'Channel update';
    return 'You have a new notification';
  };
  
  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const addNotification = (data: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      ...data,
      timestamp: 'Just now',
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <div className="p-2 rounded-full bg-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        );
      case 'error':
        return (
          <div className="p-2 rounded-full bg-red-500/20">
            <XCircle className="w-5 h-5 text-red-400" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-2 rounded-full bg-orange-500/20">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-blue-500/20">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pointer-events-none">
      <div className="w-full max-w-md mx-4 mt-4">
        <div className="bg-[#1E293B] backdrop-blur-2xl rounded-2xl shadow-2xl shadow-purple-500/20 border border-purple-500/20 p-0 overflow-hidden pointer-events-auto animate-slide-down">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white text-purple-600 text-sm font-bold shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-all hover:scale-110"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-4 px-4 py-2 rounded-full bg-white/10 text-sm text-white hover:bg-white/20 transition-all hover:scale-105 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0F172A]/40">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <div
                  key={notification.id}
                  className={`p-5 border-b border-gray-200 dark:border-white/10 cursor-pointer hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-300 ${
                    !notification.read ? 'bg-purple-50 dark:bg-purple-500/10 border-l-4 border-l-purple-500' : ''
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-bold text-base text-gray-900 dark:text-white">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2.5 h-2.5 bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] rounded-full shadow-lg shadow-purple-500/50 animate-pulse"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">{notification.timestamp}</span>
                      </div>
                      {notification.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                          className="mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white text-xs font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all hover:scale-105"
                        >
                          {notification.action.label} →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;


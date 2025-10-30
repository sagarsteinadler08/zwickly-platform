import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Info, AlertTriangle, Calendar, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    // Fetch notifications from database or use mock data
    loadNotifications();
    
    // Set up realtime subscription for new events
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'events'
      }, (payload) => {
        console.log('New event notification:', payload);
        if (payload.eventType === 'INSERT') {
          addNotification({
            type: 'info',
            title: 'New Event Available!',
            message: `A new event "${payload.new.title}" has been added.`,
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    // Mock notifications for now - replace with actual DB queries
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        title: 'Event Approved! 🎉',
        message: 'Your event "Tech Workshop" has been approved and is now live.',
        timestamp: '2 minutes ago',
        read: false,
        action: {
          label: 'View Event',
          onClick: () => console.log('View event'),
        },
      },
      {
        id: '2',
        type: 'info',
        title: 'New Event Posted',
        message: 'Spring Music Festival has been added to campus events.',
        timestamp: '1 hour ago',
        read: false,
      },
      {
        id: '3',
        type: 'warning',
        title: 'Event Registration Closing',
        message: 'Only 5 spots left for Career Fair 2025. Register now!',
        timestamp: '3 hours ago',
        read: true,
      },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
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

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pointer-events-none">
      <div className="w-full max-w-md mx-4 mt-4">
        <div className="glass-card rounded-3xl shadow-2xl p-0 overflow-hidden pointer-events-auto animate-slide-down">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="notification-badge relative">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="mt-4 text-sm text-white/90 hover:text-white underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100/50 cursor-pointer hover:bg-white/50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1">{notification.title}</p>
                          <p className="text-xs text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">{notification.timestamp}</span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      </div>
                      {notification.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action?.onClick();
                          }}
                          className="mt-2 text-xs font-medium text-primary hover:underline"
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


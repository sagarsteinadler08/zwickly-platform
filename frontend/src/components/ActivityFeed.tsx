import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Calendar,
  MessageCircle,
  BarChart3,
  Users,
  Pin,
  Megaphone,
  AtSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useSocket } from '@/lib/useSocket';

interface Activity {
  id: string;
  type: 'announcement' | 'event' | 'poll' | 'message' | 'mention' | 'highlight' | 'ticket';
  title: string;
  description: string;
  timestamp: Date;
  priority?: 'high' | 'normal' | 'low';
  channelName?: string;
  isPinned?: boolean;
}

type FilterType = 'all' | 'announcements' | 'social' | 'events';

const ActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user-demo' : 'user-demo';
  const { socket } = useSocket(userId, handleSocketEvent);

  // Socket event handler
  function handleSocketEvent(event: any) {
    if (event.type === 'message:new') {
      addActivity({
        id: `msg-${event.message?.id || Date.now()}`,
        type: 'message',
        title: `New message in #${event.channelName || 'channel'}`,
        description: event.message?.body?.substring(0, 100) || '',
        timestamp: new Date(),
        channelName: event.channelName,
      });
    } else if (event.type === 'poll:created') {
      addActivity({
        id: `poll-${event.poll?.id || Date.now()}`,
        type: 'poll',
        title: 'New Poll Created',
        description: event.poll?.question || '',
        timestamp: new Date(),
        channelName: event.channelName,
      });
    } else if (event.type === 'announcement:new') {
      addActivity({
        id: `announce-${Date.now()}`,
        type: 'announcement',
        title: event.title || 'New Announcement',
        description: event.message || '',
        timestamp: new Date(),
        priority: 'high',
        isPinned: event.pinned,
      });
    } else if (event.type === 'mention') {
      addActivity({
        id: `mention-${Date.now()}`,
        type: 'mention',
        title: `${event.from} mentioned you`,
        description: event.message || '',
        timestamp: new Date(),
        priority: 'high',
      });
    }
  }

  useEffect(() => {
    fetchInitialActivities();
  }, []);

  const fetchInitialActivities = async () => {
    setLoading(true);
    try {
      // Fetch recent events
      const eventsRes = await fetch('/api/events?limit=5');
      const events = await eventsRes.json();

      const eventActivities: Activity[] = (Array.isArray(events) ? events : []).map((e: any) => ({
        id: `event-${e.id}`,
        type: 'event' as const,
        title: e.title || 'Event',
        description: `${e.event_date} at ${e.event_time} - ${e.location}`,
        timestamp: new Date(e.created_at || Date.now()),
      }));

      // Fetch notifications
      const notifRes = await fetch(`/api/notifications?userId=${userId}`);
      const notifications = await notifRes.json();

      const notifActivities: Activity[] = (Array.isArray(notifications) ? notifications.slice(0, 5) : []).map((n: any) => {
        const payload = typeof n.payload === 'string' ? JSON.parse(n.payload) : n.payload;
        return {
          id: `notif-${n.id}`,
          type: n.type.includes('announcement') ? 'announcement' :
                n.type.includes('mention') ? 'mention' :
                n.type.includes('poll') ? 'poll' : 'highlight',
          title: payload.title || 'Update',
          description: payload.message || '',
          timestamp: new Date(n.createdAt),
        };
      });

      setActivities([...notifActivities, ...eventActivities].sort((a, b) =>
        b.timestamp.getTime() - a.timestamp.getTime()
      ));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const addActivity = (activity: Activity) => {
    setActivities(prev => {
      const exists = prev.some(a => a.id === activity.id);
      if (exists) return prev;
      return [activity, ...prev].slice(0, 20); // Keep last 20
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'announcement': return <Megaphone className="w-5 h-5 text-orange-400" />;
      case 'event': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'poll': return <BarChart3 className="w-5 h-5 text-green-400" />;
      case 'message': return <MessageCircle className="w-5 h-5 text-purple-400" />;
      case 'mention': return <AtSign className="w-5 h-5 text-pink-400" />;
      case 'highlight': return <TrendingUp className="w-5 h-5 text-teal-400" />;
      case 'ticket': return <Bell className="w-5 h-5 text-yellow-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'announcements') return activity.type === 'announcement';
    if (filter === 'social') return ['message', 'mention', 'highlight'].includes(activity.type);
    if (filter === 'events') return ['event', 'poll'].includes(activity.type);
    return true;
  });

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'social', label: 'Social' },
    { id: 'events', label: 'Events' },
  ];

  return (
    <Card className="neo-card h-[600px] flex flex-col animate-fadeInUp">
      <div className="p-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#7B5CFA] to-[#48E0E4]">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Activity Feed</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Real-time</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <Button
              key={f.id}
              variant={filter === f.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f.id)}
              className={`rounded-full text-xs ${
                filter === f.id
                  ? 'bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white shadow-md'
                  : 'text-slate-600 dark:text-gray-300 border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-gray-400">
            Loading activities...
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-gray-400">No activities yet</p>
          </div>
        ) : (
          <div className="space-y-2 py-2">
            {filteredActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className={`p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer ${
                  activity.isPinned ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30' : 'bg-white dark:bg-transparent'
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {activity.isPinned && <Pin className="w-3 h-3 text-purple-600 dark:text-purple-400" />}
                        <p className="font-semibold text-sm text-slate-800 dark:text-white">
                          {activity.title}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-gray-500 whitespace-nowrap">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.channelName && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 rounded-full">
                        <MessageCircle className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs text-purple-700 dark:text-purple-300">#{activity.channelName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default ActivityFeed;


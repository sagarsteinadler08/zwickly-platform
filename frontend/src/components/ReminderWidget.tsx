import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle, 
  RotateCcw,
  Trash2,
  Calendar as CalendarIcon,
  Repeat
} from 'lucide-react';
import { toast } from 'sonner';
import { useSocket } from '@/lib/useSocket';

interface Reminder {
  id: string;
  userId: string;
  title: string;
  description?: string;
  reminderTime: Date;
  completed: boolean;
  snoozedUntil?: Date;
  recurrence?: string;
  source?: string;
  sourceId?: string;
  timezone: string;
}

const ReminderWidget = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('');
  const [recurrence, setRecurrence] = useState('once');
  const [loading, setLoading] = useState(true);
  
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user-demo' : 'user-demo';
  const { socket } = useSocket(userId, handleSocketEvent);

  function handleSocketEvent(event: any) {
    if (event.type === 'reminder:triggered') {
      // Show toast notification
      toast.info(event.title, {
        description: event.description,
        action: {
          label: 'Snooze 10m',
          onClick: () => snoozeReminder(event.id, 10),
        },
      });
      
      // Refresh reminders
      fetchReminders();
    }
  }

  useEffect(() => {
    fetchReminders();
    
    // Poll for reminders every minute
    const interval = setInterval(() => {
      checkDueReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reminders?userId=${userId}&status=active`);
      const data = await res.json();
      setReminders(data.map((r: any) => ({
        ...r,
        reminderTime: new Date(r.reminderTime),
        snoozedUntil: r.snoozedUntil ? new Date(r.snoozedUntil) : undefined,
      })));
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkDueReminders = () => {
    const now = new Date();
    reminders.forEach(reminder => {
      if (!reminder.completed && reminder.reminderTime <= now) {
        if (reminder.snoozedUntil && reminder.snoozedUntil > now) {
          return; // Still snoozed
        }
        
        // Trigger reminder
        toast.info(`⏰ ${reminder.title}`, {
          description: reminder.description,
          action: {
            label: 'Snooze',
            onClick: () => snoozeReminder(reminder.id, 10),
          },
        });
      }
    });
  };

  const addReminder = async () => {
    if (!newTitle.trim() || !newDate || !newTime) {
      toast.error('Fill in all fields');
      return;
    }

    try {
      const reminderDateTime = new Date(`${newDate}T${newTime}`);
      
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          title: newTitle,
          reminderTime: reminderDateTime.toISOString(),
          recurrence,
          source: 'manual',
        }),
      });

      if (!res.ok) throw new Error('Failed to create reminder');

      toast.success('Reminder created!');
      setNewTitle('');
      setNewDate('');
      setNewTime('');
      setRecurrence('once');
      setShowAddForm(false);
      fetchReminders();
    } catch (error) {
      toast.error('Failed to create reminder');
    }
  };

  const completeReminder = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });

      toast.success('Reminder completed!');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to complete reminder');
    }
  };

  const snoozeReminder = async (id: string, minutes: number) => {
    try {
      await fetch('/api/reminders/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, duration: minutes }),
      });

      toast.success(`Snoozed for ${minutes} minutes`);
      fetchReminders();
    } catch (error) {
      toast.error('Failed to snooze');
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      });

      toast.success('Reminder deleted');
      fetchReminders();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const formatReminderTime = (time: Date): string => {
    const now = new Date();
    const diffMs = time.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 0) return 'Overdue!';
    if (diffMins < 60) return `In ${diffMins}m`;
    if (diffHours < 24) return `In ${diffHours}h`;
    if (diffDays < 7) return `In ${diffDays}d`;
    return time.toLocaleDateString();
  };

  const todayReminders = reminders.filter(r => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return r.reminderTime >= today && r.reminderTime < tomorrow && !r.completed;
  });

  return (
    <Card className="neo-card animate-fadeInUp" style={{ animationDelay: '200ms' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Reminders</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-md text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Reminder Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-xl space-y-3 animate-fadeIn">
            <Input
              placeholder="Reminder title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm"
              maxLength={100}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="text-sm"
              />
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="text-sm"
              />
            </div>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="once">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekdays">Weekdays only</option>
            </select>
            <div className="flex gap-2">
              <Button size="sm" onClick={addReminder} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Add Reminder
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Today's Reminders */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase mb-2 flex items-center gap-2">
            <CalendarIcon className="w-3 h-3" />
            Today ({todayReminders.length})
          </h4>
          {todayReminders.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-3 bg-slate-100 dark:bg-white/5 rounded-lg">
              No reminders for today
            </p>
          ) : (
            <div className="space-y-2">
              {todayReminders.map((reminder) => {
                const isOverdue = reminder.reminderTime < new Date();
                const isSnoozed = reminder.snoozedUntil && reminder.snoozedUntil > new Date();
                
                return (
                  <div
                    key={reminder.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700/30' :
                      isSnoozed ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/30' :
                      'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => completeReminder(reminder.id)}
                        className="flex-shrink-0 mt-0.5"
                      >
                        <div className="w-4 h-4 rounded-full border-2 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                          {reminder.title}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs flex items-center gap-1 ${
                            isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-gray-400'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {formatReminderTime(reminder.reminderTime)}
                          </span>
                          {reminder.recurrence && reminder.recurrence !== 'once' && (
                            <span className="text-xs flex items-center gap-1 text-purple-600 dark:text-purple-400">
                              <Repeat className="w-3 h-3" />
                              {reminder.recurrence}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => snoozeReminder(reminder.id, 10)}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                          title="Snooze 10min"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 dark:text-gray-400 uppercase mb-2">
            Upcoming ({reminders.filter(r => !r.completed && r.reminderTime > new Date()).length})
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
            {reminders
              .filter(r => !r.completed && r.reminderTime > new Date())
              .sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime())
              .slice(0, 5)
              .map((reminder) => (
                <div
                  key={reminder.id}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => completeReminder(reminder.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-slate-700 dark:text-white truncate flex-1">
                      {reminder.title}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                      {formatReminderTime(reminder.reminderTime)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReminderWidget;


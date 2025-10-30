import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle,
  BookOpen,
  Target,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface StudySession {
  taskName: string;
  duration: number; // in minutes
  completed: boolean;
  startedAt?: Date;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

const StudyPlanner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes default
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [currentTask, setCurrentTask] = useState('');
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [newAssignment, setNewAssignment] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  // Pomodoro timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleSessionComplete();
            return sessionType === 'focus' ? 5 * 60 : 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, sessionType]);

  // Load assignments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('zwickly-assignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAssignments(parsed.map((a: any) => ({
          ...a,
          dueDate: new Date(a.dueDate),
        })));
      } catch (error) {
        console.error('Error loading assignments:', error);
      }
    }
  }, []);

  const saveAssignments = (updated: Assignment[]) => {
    localStorage.setItem('zwickly-assignments', JSON.stringify(updated));
    setAssignments(updated);
  };

  const handleSessionComplete = () => {
    if (sessionType === 'focus') {
      toast.success('Focus session complete! Time for a break.');
      setSessionType('break');
    } else {
      toast.success('Break over! Ready for another focus session?');
      setSessionType('focus');
    }
    setIsRunning(false);
    setIsPaused(false);
  };

  const startSession = () => {
    if (!isRunning && !currentTask.trim() && sessionType === 'focus') {
      setShowTaskInput(true);
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    if (sessionType === 'focus') {
      toast.success(`Focus session started: ${currentTask || 'Study time'}`);
    }
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const resetSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionType === 'focus' ? 25 * 60 : 5 * 60);
    setCurrentTask('');
    setShowTaskInput(false);
  };

  const addAssignment = async () => {
    if (!newAssignment.trim() || !newDueDate) {
      toast.error('Fill in all fields');
      return;
    }

    const assignment: Assignment = {
      id: `assign-${Date.now()}`,
      title: newAssignment,
      dueDate: new Date(newDueDate),
      completed: false,
    };

    saveAssignments([...assignments, assignment]);
    
    // Create reminder for assignment (1 day before due date)
    try {
      const userId = localStorage.getItem('userId') || 'user-demo';
      const reminderTime = new Date(newDueDate);
      reminderTime.setDate(reminderTime.getDate() - 1);
      reminderTime.setHours(9, 0, 0, 0); // 9 AM day before

      if (reminderTime > new Date()) {
        await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            title: `Assignment due tomorrow: ${newAssignment}`,
            description: `Don't forget to complete: ${newAssignment}`,
            reminderTime: reminderTime.toISOString(),
            recurrence: 'once',
            source: 'study_plan',
            sourceId: assignment.id,
          }),
        });
        
        toast.success('Assignment and reminder added!');
      } else {
        toast.success('Assignment added!');
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast.success('Assignment added!');
    }
    
    setNewAssignment('');
    setNewDueDate('');
  };

  const toggleAssignment = (id: string) => {
    saveAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
  };

  const deleteAssignment = (id: string) => {
    saveAssignments(assignments.filter(a => a.id !== id));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const upcomingAssignments = assignments
    .filter(a => !a.completed)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  return (
    <Card className="neo-card animate-fadeInUp" style={{ animationDelay: '150ms' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Study Planner</h3>
          </div>
        </div>

        {/* Pomodoro Timer */}
        <div className="mb-6 p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
          <div className="text-center mb-4">
            <p className="text-sm text-white/80 mb-2">
              {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
            </p>
            <div className="text-6xl font-bold text-white mb-2">
              {formatTime(timeLeft)}
            </div>
            {currentTask && (
              <p className="text-sm text-white/90 truncate">{currentTask}</p>
            )}
          </div>

          {showTaskInput ? (
            <div className="mb-4">
              <Input
                placeholder="What are you working on?"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setShowTaskInput(false);
                    startSession();
                  }
                }}
                className="text-sm"
                maxLength={50}
              />
            </div>
          ) : null}

          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={startSession}
                className="flex-1 bg-white text-green-700 hover:bg-gray-100 font-semibold shadow-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseSession}
                  className="flex-1 bg-white text-green-700 hover:bg-gray-100 font-semibold"
                >
                  {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  onClick={resetSession}
                  variant="outline"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Assignments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-gray-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-green-500" />
              Upcoming Deadlines
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAssignments(!showAssignments)}
              className="text-xs text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
            >
              {showAssignments ? 'Hide' : 'Manage'}
            </Button>
          </div>

          {showAssignments && (
            <div className="mb-4 p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Assignment title..."
                  value={newAssignment}
                  onChange={(e) => setNewAssignment(e.target.value)}
                  className="text-sm flex-1"
                />
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="text-sm w-36"
                />
              </div>
              <Button size="sm" onClick={addAssignment} className="w-full bg-green-600 hover:bg-green-700">
                Add Assignment
              </Button>
            </div>
          )}

          <div className="space-y-2">
            {upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-gray-400 text-center py-4">
                No upcoming assignments. Add one to track deadlines!
              </p>
            ) : (
              upcomingAssignments.map((assignment) => {
                const daysLeft = Math.ceil((assignment.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 2;
                
                return (
                  <div
                    key={assignment.id}
                    className={`p-2 rounded-lg border border-slate-200 dark:border-white/10 flex items-center gap-2 ${
                      assignment.completed ? 'opacity-50 bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => toggleAssignment(assignment.id)}
                      className="flex-shrink-0"
                    >
                      {assignment.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-gray-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium text-slate-700 dark:text-white truncate ${assignment.completed ? 'line-through' : ''}`}>
                        {assignment.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400 dark:text-gray-500" />
                        <span className={`text-xs ${isUrgent ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-gray-500'}`}>
                          {daysLeft === 0 ? 'Due today!' : daysLeft === 1 ? 'Due tomorrow' : `${daysLeft} days left`}
                        </span>
                      </div>
                    </div>
                    {showAssignments && (
                      <button
                        onClick={() => deleteAssignment(assignment.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudyPlanner;


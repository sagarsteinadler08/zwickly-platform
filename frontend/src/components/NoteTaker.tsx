import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StickyNote, Plus, Pin, Check, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  isPinned: boolean;
  isDone: boolean;
}

const NoteTaker = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Load notes from localStorage
    const saved = localStorage.getItem('zwickly-notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })));
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    }
  }, []);

  const saveNotes = (updatedNotes: Note[]) => {
    localStorage.setItem('zwickly-notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const addNote = () => {
    if (!newTitle.trim()) {
      toast.error('Note title is required');
      return;
    }

    const note: Note = {
      id: `note-${Date.now()}`,
      title: newTitle,
      content: newContent,
      createdAt: new Date(),
      isPinned: false,
      isDone: false,
    };

    saveNotes([note, ...notes]);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
    toast.success('Note added!');
  };

  const togglePin = (id: string) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const toggleDone = (id: string) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, isDone: !n.isDone } : n));
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id));
    toast.success('Note deleted');
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card className="neo-card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Quick Notes</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="rounded-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:shadow-md text-white"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Add Note Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl space-y-3 animate-fadeIn">
            <Input
              placeholder="Note title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm"
              maxLength={50}
            />
            <textarea
              placeholder="Note content..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border-2 border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 min-h-[60px]"
              maxLength={200}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={addNote} className="flex-1 bg-amber-600 hover:bg-amber-700">
                Add Note
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-gray-400">No notes yet. Click + to add one!</p>
            </div>
          ) : (
            sortedNotes.map((note, idx) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg border border-slate-200 dark:border-white/10 transition-all hover:shadow-md ${
                  note.isPinned ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700/30' : 'bg-white dark:bg-white/5'
                } ${note.isDone ? 'opacity-60' : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />}
                    <p className={`font-semibold text-sm text-slate-800 dark:text-white truncate ${note.isDone ? 'line-through' : ''}`}>
                      {note.title}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePin(note.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                      title={note.isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Pin className={`w-3 h-3 ${note.isPinned ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => toggleDone(note.id)}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                      title={note.isDone ? 'Mark undone' : 'Mark done'}
                    >
                      <Check className={`w-3 h-3 ${note.isDone ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
                {note.content && (
                  <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 ml-5">
                    {note.content}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export default NoteTaker;


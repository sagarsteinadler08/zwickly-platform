import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, Lock } from 'lucide-react';

type Channel = { id: string; name: string; slug: string; description?: string; memberCount?: number; isPrivate?: boolean };

interface Props {
  userId: string;
  userHandle: string;
  selectedChannelId?: string;
  onSelect: (channel: Channel) => void;
  onToast: (t: any) => void;
}

const ChannelList: React.FC<Props> = ({
  userId, selectedChannelId, onSelect, onToast
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [unread, setUnread] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/chat/channels')
      .then(r => r.json())
      .then(data => {
        // Add member counts and private status
        const enrichedChannels = (Array.isArray(data) ? data : []).map((ch: any, idx: number) => ({
          ...ch,
          memberCount: [234, 156, 45, 450, 28][idx] || Math.floor(Math.random() * 200) + 50,
          isPrivate: ch.slug === 'campus-events' // Example: mark one channel as private
        }));
        setChannels(enrichedChannels);
      })
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  // Simulate unread badge
  useEffect(() => {
    if (channels.length > 0) {
      setUnread({ [channels[0].id]: 2 });
    }
  }, [channels.length]);

  async function requestCh() {
    if (!reqName.trim()) { onToast({ message: 'Channel name is required' }); return; }
    setReqLoading(true);
    try {
      await fetch('/api/chat/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName, description: reqDesc, requesterId: userId })
      });
      setReqOpen(false);
      onToast({ message: 'Channel request sent!' });
      setReqName('');
      setReqDesc('');
    } catch {
      onToast({ message: 'Failed to request channel.' });
    }
    setReqLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Request Channel Button */}
      <Button 
        onClick={() => setReqOpen(o => !o)}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Request Channel
      </Button>

      {/* Channel Request Form */}
      {reqOpen && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 animate-fadeIn border border-gray-200">
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Channel name" 
            maxLength={50}
            value={reqName} 
            onChange={e => setReqName(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Description (optional)" 
            maxLength={120}
            value={reqDesc} 
            onChange={e => setReqDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <Button 
              disabled={reqLoading} 
              className="flex-1 bg-purple-600 hover:bg-purple-700 rounded-lg"
              onClick={requestCh}
            >
              {reqLoading ? "Sending..." : "Submit"}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 rounded-lg"
              onClick={() => setReqOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Channels Header */}
      <div>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">CHANNELS</h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {channels.map(ch => (
              <li key={ch.id} className="relative">
                <button
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group
                  ${selectedChannelId === ch.id ? 'bg-purple-100 text-purple-900' : 'hover:bg-gray-100 text-gray-700'}`}
                  onClick={() => onSelect(ch)}
                  tabIndex={0}
                  aria-current={selectedChannelId === ch.id}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {ch.isPrivate && <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                    <span className="font-medium truncate"># {ch.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {unread[ch.id] && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unread[ch.id]}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-500 group-hover:text-gray-700">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">{ch.memberCount}</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChannelList;

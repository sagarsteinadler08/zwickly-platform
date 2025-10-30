import { useState, useEffect } from 'react';

const AdminSocial = () => {
  const [channels, setChannels] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat/channels');
      const data = await res.json();
      if (Array.isArray(data)) {
        setChannels(data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;

    try {
      const slug = newChannelName.toLowerCase().replace(/\s+/g, '-');
      const res = await fetch('http://localhost:3000/api/chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName,
          slug,
          description: newChannelDesc,
          is_public: true,
        }),
      });

      if (res.ok) {
        setNewChannelName('');
        setNewChannelDesc('');
        setShowCreateDialog(false);
        fetchChannels();
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Admin - Social Wall</h1>

      <button
        onClick={() => setShowCreateDialog(true)}
        className="mb-8 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create New Channel
      </button>

      {showCreateDialog && (
        <div className="mb-8 p-4 border rounded">
          <input
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            placeholder="Channel name"
            className="mb-2 p-2 border rounded w-full"
          />
          <input
            value={newChannelDesc}
            onChange={(e) => setNewChannelDesc(e.target.value)}
            placeholder="Description"
            className="mb-2 p-2 border rounded w-full"
          />
          <div className="flex gap-2">
            <button onClick={handleCreateChannel} className="px-4 py-2 bg-green-600 text-white rounded">
              Create
            </button>
            <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 bg-gray-600 text-white rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <div key={channel.id} className="p-4 border rounded">
            <h3 className="font-bold">{channel.name}</h3>
            <p className="text-sm text-gray-600">{channel.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSocial;

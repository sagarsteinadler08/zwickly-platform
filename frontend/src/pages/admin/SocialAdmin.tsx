import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Plus, MessageSquare, Trash2, BarChart3, Send, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const SocialAdmin = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [fetchingImages, setFetchingImages] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [fetchingPolls, setFetchingPolls] = useState(false);
  const [pollResults, setPollResults] = useState<{[pollId: string]: any}>({});
  const [pollResultsLoading, setPollResultsLoading] = useState<{[pollId: string]: boolean}>({});
  const [selectedPollOptions, setSelectedPollOptions] = useState<{[pollId: string]: string}>({});
  const [tickets, setTickets] = useState<any[]>([]);
  const [showTickets, setShowTickets] = useState(false);

  useEffect(() => {
    fetchChannels();
    fetchRequests();
    fetchTickets();
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tickets?status=open');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setTickets([]);
    }
  };

  // Handle ticket reply
  const handleTicketReply = async (ticketId: string, reply: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', adminReply: reply }),
      });
      if (res.ok) {
        toast.success('Ticket replied!');
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to reply');
    }
  };

  useEffect(() => {
    // If single channel selected, fetch its messages, images, polls
    if (selectedChannels.length === 1) {
      fetchMessages(selectedChannels[0].id);
      fetchImages(selectedChannels[0].id);
      fetchPolls(selectedChannels[0].id);
    } else {
      setMessages([]);
      setImages([]);
      setPolls([]);
    }
  }, [selectedChannels]);

  // Fetch results for all polls whenever polls change
  useEffect(() => {
    const fetchAllPollResults = async () => {
      if (selectedChannels.length !== 1 || polls.length === 0) {
        setPollResults({});
        setSelectedPollOptions({});
        return;
      }
      const channelId = selectedChannels[0].id;
      const nextResults: {[pollId: string]: any} = {};
      const nextSelections: {[pollId: string]: string} = {};
      await Promise.all(
        polls.map(async (poll) => {
          setPollResultsLoading(prev => ({ ...prev, [poll.id]: true }));
          try {
            const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls/${poll.id}/votes?userId=admin`);
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            nextResults[poll.id] = data;
            nextSelections[poll.id] = data.userVote ?? '';
          } catch {
            nextResults[poll.id] = null;
            nextSelections[poll.id] = '';
          } finally {
            setPollResultsLoading(prev => ({ ...prev, [poll.id]: false }));
          }
        })
      );
      setPollResults(nextResults);
      setSelectedPollOptions(nextSelections);
    };
    fetchAllPollResults();
  }, [polls, selectedChannels]);

  const fetchChannels = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat/channels');
      const data = await res.json();
      if (Array.isArray(data)) {
        setChannels(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setChannels([]);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat/requests');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setRequests([]);
    }
  };

  const fetchMessages = async (channelId: string) => {
    setFetchingMessages(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setFetchingMessages(false);
    }
  };

  const fetchImages = async (channelId: string) => {
    setFetchingImages(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/images`);
      const data = await res.json();
      if (Array.isArray(data)) setImages(data);
    } catch {
      setImages([]);
    } finally {
      setFetchingImages(false);
    }
  };

  const fetchPolls = async (channelId: string) => {
    setFetchingPolls(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls`);
      const data = await res.json();
      if (Array.isArray(data)) setPolls(data);
    } catch {
      setPolls([]);
    } finally {
      setFetchingPolls(false);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm('Delete this channel?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Channel deleted!');
      setSelectedChannel(null);
      fetchChannels();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/requests/${requestId}/approve`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed');
      
      toast.success('Request approved!');
      fetchChannels();
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/requests/${requestId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Declined by admin' }),
      });

      if (!res.ok) throw new Error('Failed');
      
      toast.success('Request declined');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to decline');
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast.error('Channel name required');
      return;
    }

    setLoading(true);
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

      if (!res.ok) throw new Error('Failed');
      
      toast.success('Channel created!');
      setShowCreateDialog(false);
      setNewChannelName('');
      setNewChannelDesc('');
      fetchChannels();
    } catch (error) {
      toast.error('Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  // Helper for toggling channel selection
  const toggleChannelSelect = (channel) => {
    setSelectedChannels((prev) => {
      const idx = prev.findIndex((ch) => ch.id === channel.id);
      if (idx > -1) {
        const copy = prev.slice(); copy.splice(idx, 1); return copy;
      } else {
        return [...prev, channel];
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] transition-colors duration-300">
      <AdminNavbar />
      
      <main className="container mx-auto px-6 pt-24 pb-12">
        <h1 className="text-5xl font-bold gradient-text mb-8 text-center">Social Wall Admin</h1>

        {/* Pending Channel Requests */}
        {requests.length > 0 && (
          <Card className="neo-card p-6 mb-6 border-l-2 border-l-orange-500/50">
            <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">Pending Channel Requests</h2>
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-transparent">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{req.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-400">{req.description}</p>
                    <p className="text-xs text-slate-500 dark:text-gray-500">Requested by: {req.requesterId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApproveRequest(req.id)} className="bg-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(req.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Create Channel */}
        <Card className="neo-card p-6 mb-6">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-xl hover:shadow-orange-500/40">
                <Plus className="w-4 h-4 mr-2" />
                Create New Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Channel name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                />
                <Button 
                  onClick={handleCreateChannel} 
                  className="w-full rounded-full"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Tickets Section */}
        <Card className="neo-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Support Tickets (@admin mentions)</h3>
            <Button variant="outline" size="sm" onClick={() => setShowTickets(!showTickets)}>
              {showTickets ? 'Hide' : `Show (${tickets.length})`}
            </Button>
          </div>
          {showTickets && (
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <p className="text-slate-600 dark:text-gray-400 text-center py-4">No open tickets</p>
              ) : (
                tickets.map(ticket => (
                  <div key={ticket.id} className="border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white">{ticket.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">From: {ticket.userId}</p>
                        <p className="text-xs text-slate-500 dark:text-gray-500">
                          {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                        {ticket.status}
                      </span>
                    </div>
                    <p className="text-sm mb-3">{ticket.description}</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                            handleTicketReply(ticket.id, e.currentTarget.value.trim());
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          const input = e.currentTarget.parentElement?.querySelector('input');
                          if (input?.value.trim()) {
                            handleTicketReply(ticket.id, input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Reply
                      </Button>
                    </div>
                    {ticket.adminReply && (
                      <div className="mt-2 p-2 bg-green-50 rounded">
                        <p className="text-xs text-green-700 font-semibold">Admin Reply:</p>
                        <p className="text-sm text-green-800">{ticket.adminReply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        {/* Always-visible message draft/send area - only enabled if exactly one channel selected */}
        <Card className="neo-card p-6 mb-6">
          <h3 className="font-bold mb-2 text-slate-800 dark:text-white">Draft & Send Message</h3>
          {selectedChannels.length !== 1 ? (
            <p className="text-slate-600 dark:text-gray-400">Select exactly one channel to enable drafting and sending a message.</p>
          ) : (
            <div className="flex flex-col gap-2 md:flex-row md:items-end">
              <textarea
                className="border rounded-xl p-3 flex-grow min-h-[60px]"
                placeholder={`Type a message for ${selectedChannels[0].name}`}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
              <Button
                onClick={async () => {
                  if (!messageText.trim() || selectedChannels.length !== 1) return;
                  try {
                    const res = await fetch(`http://localhost:3000/api/chat/channels/${selectedChannels[0].id}/messages`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: 'admin', body: messageText }),
                    });
                    if (!res.ok) throw new Error('Failed');
                    toast.success('Message sent!');
                    setMessageText('');
                    fetchMessages(selectedChannels[0].id);
                  } catch {
                    toast.error('Failed to send message');
                  }
                }}
                disabled={!messageText.trim() || selectedChannels.length !== 1}
                className="md:w-32 mt-2 md:mt-0 rounded-full"
              >
                Send
              </Button>
            </div>
          )}
        </Card>

        {/* Message History for selected channel */}
        {selectedChannels.length === 1 && (
          <Card className="neo-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Messages for {selectedChannels[0].name}</h3>
            {fetchingMessages ? (
              <p className="text-slate-600 dark:text-gray-400">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-slate-600 dark:text-gray-400">No messages yet.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="border border-slate-200 dark:border-white/10 rounded p-2 flex flex-col bg-white dark:bg-transparent">
                    <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">{msg.userId} &bull; {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</div>
                    <div className="text-slate-700 dark:text-white">{msg.body}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        {selectedChannels.length > 1 && (
          <Card className="neo-card p-6 mb-6">
            <p className="text-center text-slate-600 dark:text-gray-400">Multiple channels selected: bulk actions only (send/view messages not available).</p>
          </Card>
        )}

        {/* Admin Controls: if any selected, support bulk delete, single send */}
        {selectedChannels.length > 0 && (
          <Card className="neo-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
              Admin Controls: {selectedChannels.length === 1 ? selectedChannels[0].name : `${selectedChannels.length} channels selected`}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-full" onClick={() => selectedChannels.length === 1 && setShowMessageDialog(true)} disabled={selectedChannels.length !== 1}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setShowPollDialog(true)}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setShowImageDialog(true)}>
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              <Button variant="destructive" className="rounded-full" 
                onClick={async () => {
                  if (!confirm(`Delete ${selectedChannels.length} channel(s)?`)) return;
                  for (const ch of selectedChannels) {
                    try {
                      const res = await fetch(`http://localhost:3000/api/chat/channels/${ch.id}`, { method: 'DELETE' });
                      if (!res.ok) throw new Error('Failed');
                    } catch {
                      toast.error(`Failed to delete channel ${ch.name}`);
                    }
                  }
                  toast.success('Channel(s) deleted!');
                  setSelectedChannels([]);
                  fetchChannels();
                }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Channel(s)
              </Button>
            </div>
          </Card>
        )}

        {/* Send Message Dialog */}
        <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
          <DialogContent className="neo-card">
            <DialogHeader>
              <DialogTitle>Send Message to {selectedChannels.length === 1 ? selectedChannels[0].name : 'Selected Channels'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full min-h-[120px] p-4 border-2 border-slate-300 dark:border-white/20 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-colors duration-300"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    if (!messageText.trim() || selectedChannels.length === 0) return;
                    try {
                      for (const ch of selectedChannels) {
                        const res = await fetch(`http://localhost:3000/api/chat/channels/${ch.id}/messages`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: 'admin', body: messageText }),
                        });
                        if (!res.ok) throw new Error('Failed');
                      }
                      toast.success('Message sent!');
                      setMessageText('');
                      setShowMessageDialog(false);
                      // No need to refetch messages here, they are already fetched by the useEffect
                    } catch (error) {
                      toast.error('Failed to send message');
                    }
                  }}
                  className="rounded-full"
                >
                  Send
                </Button>
                <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Poll Dialog, now uses backend API to create poll and refresh list */}
        <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
          <DialogContent className="neo-card">
            <DialogHeader>
              <DialogTitle>Create Poll in {selectedChannels.length === 1 ? selectedChannels[0].name : 'Selected Channels'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="Poll question"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-gray-200">Options</label>
                {pollOptions.map((opt, i) => (
                  <Input
                    key={i}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...pollOptions];
                      newOpts[i] = e.target.value;
                      setPollOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="rounded-full"
                >
                  Add Option
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setPollOptions(pollOptions.slice(0, -1))}
                  disabled={pollOptions.length <= 2}
                  className="rounded-full"
                >
                  Remove Option
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    if (!pollQuestion.trim() || selectedChannels.length !== 1) return;
                    if (pollOptions.filter(o => o.trim()).length < 2) {
                      toast.error('Need at least 2 options');
                      return;
                    }
                    try {
                      const res = await fetch(`http://localhost:3000/api/chat/channels/${selectedChannels[0].id}/polls`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question: pollQuestion, options: pollOptions }),
                      });
                      if (!res.ok) throw new Error('Failed');
                      toast.success('Poll created!');
                      setPollQuestion('');
                      setPollOptions(['', '']);
                      setShowPollDialog(false);
                      fetchPolls(selectedChannels[0].id);
                    } catch (error) {
                      toast.error('Failed to create poll');
                    }
                  }}
                  disabled={selectedChannels.length !== 1}
                  className="rounded-full"
                >
                  Create Poll
                </Button>
                <Button variant="outline" onClick={() => setShowPollDialog(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Image Dialog, now actually uploads to backend and refreshes images */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="neo-card">
            <DialogHeader>
              <DialogTitle>Upload Image to {selectedChannels.length === 1 ? selectedChannels[0].name : 'Selected Channels'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full"
              />
              {imageFile && (
                <div className="mt-2">
                  <img 
                    src={URL.createObjectURL(imageFile)} 
                    alt="Preview" 
                    className="max-h-48 rounded-xl"
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={async () => {
                    if (!imageFile || selectedChannels.length !== 1) return;
                    try {
                      const formData = new FormData();
                      formData.append('image', imageFile);
                      const res = await fetch(`http://localhost:3000/api/chat/channels/${selectedChannels[0].id}/images`, {
                          method: 'POST',
                          body: formData,
                      });
                      if (!res.ok) throw new Error('Failed to upload');
                      toast.success('Image uploaded!');
                      setImageFile(null);
                      setShowImageDialog(false);
                      fetchImages(selectedChannels[0].id);
                    } catch {
                      toast.error('Failed to upload image');
                    }
                  }}
                  disabled={!imageFile || selectedChannels.length !== 1}
                  className="rounded-full"
                >
                  Upload
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)} className="rounded-full">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* All Channels */}
        <Card className="neo-card p-6">
          <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">All Channels</h2>
          {channels.length === 0 ? (
            <p className="text-slate-600 dark:text-gray-400 text-center py-8">No channels yet. Create one!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <div 
                  key={channel.id}
                  className={`p-4 border border-slate-200 dark:border-white/10 rounded-xl hover-glow cursor-pointer transition-all bg-white dark:bg-transparent ${
                    selectedChannels.some(ch => ch.id === channel.id) ? 'bg-purple-50 dark:bg-primary/10 border-purple-400 dark:border-primary' : ''
                  }`}
                  onClick={() => toggleChannelSelect(channel)}
                >
                  <input
                    type="checkbox"
                    checked={selectedChannels.some(ch => ch.id === channel.id)}
                    onChange={() => toggleChannelSelect(channel)}
                    onClick={e => e.stopPropagation()}
                    className="mr-2 align-middle"
                  />
                  <MessageSquare className="w-8 h-8 text-primary mb-2 inline-block align-middle" />
                  <span className="font-bold text-lg align-middle text-slate-800 dark:text-white">{channel.name}</span>
                  <div className="text-sm text-slate-600 dark:text-gray-400">{channel.description}</div>
                  <div className="text-xs text-slate-500 dark:text-gray-500 mt-2">#{channel.slug}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Channel image gallery: render if exactly one selected, below message history */}
        {selectedChannels.length === 1 && (
          <Card className="neo-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Images for {selectedChannels[0].name}</h3>
            {fetchingImages ? (
              <p className="text-slate-600 dark:text-gray-400">Loading images...</p>
            ) : images.length === 0 ? (
              <p className="text-slate-600 dark:text-gray-400">No images uploaded yet.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {images.map((img) => (
                  <div key={img.id} className="w-48 flex flex-col items-center border border-slate-200 dark:border-white/10 rounded-xl p-2 bg-white dark:bg-white/10">
                    <img src={img.url} alt={img.originalName || 'image'} className="object-contain max-h-40 w-full" />
                    <div className="text-xs text-slate-500 dark:text-gray-400 mt-1 truncate w-full">{img.originalName}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Channel polls: render if exactly one selected, below message/images, now fully interactive */}
        {selectedChannels.length === 1 && (
          <Card className="neo-card p-6 mb-6">
            <h3 className="text-xl font-bold mb-2 text-slate-800 dark:text-white">Polls for {selectedChannels[0].name}</h3>
            {fetchingPolls ? (
              <p className="text-slate-600 dark:text-gray-400">Loading polls...</p>
            ) : polls.length === 0 ? (
              <p className="text-slate-600 dark:text-gray-400">No polls created yet.</p>
            ) : (
              <div className="space-y-6">
                {polls.map((poll) => {
                  const r = pollResults[poll.id];
                  const loading = pollResultsLoading[poll.id];
                  const userVoted = !!(r && r.userVote !== null && r.userVote !== undefined);
                  return (
                    <div key={poll.id} className="border rounded-xl bg-white/80 p-3">
                      <div className="font-semibold mb-1">Q: {poll.question} {poll.isClosed && <span className="text-xs text-red-600 ml-2">[Closed]</span>}</div>
                      {/* Voting UI */}
                      {(!poll.isClosed && !userVoted) ? (
                        <div>
                          {r && r.options.map((opt, i) => (
                            <div key={i} className="flex items-center gap-2 mb-1">
                              <input
                                type="radio"
                                name={`poll-${poll.id}`}
                                id={`poll-${poll.id}-opt-${i}`}
                                value={opt.optionId}
                                checked={selectedPollOptions[poll.id] === opt.optionId}
                                onChange={() => setSelectedPollOptions(prev => ({...prev, [poll.id]: opt.optionId}))}
                                disabled={loading}
                              />
                              <label htmlFor={`poll-${poll.id}-opt-${i}`}>{opt.text}</label>
                            </div>
                          ))}
                          <Button
                            className="rounded-full mt-2"
                            size="sm"
                            onClick={async () => {
                              if (!selectedPollOptions[poll.id]) return;
                              setPollResultsLoading(prev => ({ ...prev, [poll.id]: true }));
                              try {
                                const channelId = selectedChannels[0].id;
                                const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls/${poll.id}/votes`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ userId: 'admin', optionId: selectedPollOptions[poll.id] }),
                                });
                                if (!res.ok) throw new Error('Failed');
                                toast.success('Vote recorded!');
                                // refresh this poll result
                                const res2 = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls/${poll.id}/votes?userId=admin`);
                                const data = await res2.json();
                                setPollResults(prev => ({ ...prev, [poll.id]: data }));
                              } catch { toast.error('Failed to vote'); }
                              setPollResultsLoading(prev => ({ ...prev, [poll.id]: false }));
                            }}
                            disabled={loading || !selectedPollOptions[poll.id]}
                          >Vote</Button>
                        </div>
                      ) : r ? (
                        <div className="space-y-1 mt-1">
                          {r.options.map((opt, i) => {
                            const percent = r.options.reduce((sum, o) => sum + o.count, 0)
                              ? (opt.count / r.options.reduce((sum, o) => sum + o.count, 0)) * 100
                              : 0;
                            const voted = r.userVote === opt.optionId;
                            return (
                              <div key={i} className="flex items-center gap-2">
                                <div className={`flex-1 relative rounded bg-primary/10 border h-8 flex items-center ${voted ? 'ring-2 ring-primary' : ''}`}
                                     style={{width:`100%`, background:`linear-gradient(90deg, #cfe6fd ${percent}%, #f0f0f0 ${percent}%)`}}>
                                  <span className="block px-2 z-10">{opt.text}</span>
                                  <span className="absolute right-2 z-10">{opt.count} vote{opt.count!==1?'s':''}</span>
                                </div>
                                {voted && <span title="Your vote" className="text-lg ml-2">✅</span>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-600 dark:text-gray-400">Unable to load poll options.</p>
                      )}
                      {/* Admin close poll */}
                      {!poll.isClosed && (
                        <div className="mt-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-full"
                            onClick={async () => {
                              try {
                                const channelId = selectedChannels[0].id;
                                const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls/${poll.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ isClosed: true })
                                });
                                if (!res.ok) throw new Error('Failed');
                                toast.success('Poll closed.');
                                fetchPolls(selectedChannels[0].id);
                              } catch {
                                toast.error('Failed to close poll');
                              }
                            }}
                          >Close Poll</Button>
                        </div>
                      )}
                      <div className="text-xs text-slate-500 dark:text-gray-500 mt-1">Created: {poll.createdAt ? new Date(poll.createdAt).toLocaleString() : ''}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </main>
    </div>
  );
};

export default SocialAdmin;


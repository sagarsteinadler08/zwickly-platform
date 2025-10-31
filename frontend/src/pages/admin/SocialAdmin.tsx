import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, XCircle, Plus, MessageSquare, Trash2, BarChart3, Send, 
  Image as ImageIcon, Users, Hash, Clock, Eye, X, Megaphone, LayoutDashboard,
  Settings, Upload, Edit, Trash
} from 'lucide-react';
import { toast } from 'sonner';

const SocialAdminImproved = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Forms
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [messageText, setMessageText] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '']);
  
  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementImage, setAnnouncementImage] = useState<File | null>(null);
  const [announcementImagePreview, setAnnouncementImagePreview] = useState('');
  const [selectedChannelsForAnnouncement, setSelectedChannelsForAnnouncement] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit channel
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [editChannelDesc, setEditChannelDesc] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Data for selected channel
  const [messages, setMessages] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetchChannels();
    fetchRequests();
    fetchTickets();
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

  const fetchRequests = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/chat/requests');
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data.filter((r: any) => r.status === 'pending'));
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tickets?status=open');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchChannelData = async (channelId: string) => {
    try {
      // Fetch messages
      const msgRes = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/messages`);
      const msgData = await msgRes.json();
      setMessages(Array.isArray(msgData) ? msgData.slice(0, 5) : []);

      // Fetch polls  
      const pollRes = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/polls`);
      const pollData = await pollRes.json();
      setPolls(Array.isArray(pollData) ? pollData.slice(0, 3) : []);

      // Fetch images
      const imgRes = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/images`);
      const imgData = await imgRes.json();
      setImages(Array.isArray(imgData) ? imgData.slice(0, 6) : []);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    }
  };

  const handleSelectChannel = (channel: any) => {
    setSelectedChannel(channel);
    fetchChannelData(channel.id);
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/chat/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newChannelName, description: newChannelDesc }),
      });
      if (res.ok) {
        toast.success('Channel created!');
        setNewChannelName('');
        setNewChannelDesc('');
        fetchChannels();
      }
    } catch (error) {
      toast.error('Failed to create channel');
    }
    setLoading(false);
  };

  const handleEditChannel = (channel: any) => {
    setEditingChannel(channel);
    setEditChannelName(channel.name);
    setEditChannelDesc(channel.description || '');
    setShowEditDialog(true);
  };

  const handleUpdateChannel = async () => {
    if (!editChannelName.trim() || !editingChannel) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${editingChannel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: editChannelName, 
          description: editChannelDesc 
        }),
      });
      if (res.ok) {
        toast.success('Channel updated!');
        setShowEditDialog(false);
        setEditingChannel(null);
        fetchChannels();
      } else {
        toast.error('Failed to update channel');
      }
    } catch (error) {
      toast.error('Failed to update channel');
    }
    setLoading(false);
  };

  const handleDeleteChannel = async (channelId: string, channelName: string) => {
    if (!confirm(`Are you sure you want to delete "${channelName}"? This will delete all messages in this channel.`)) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Channel deleted!');
        if (selectedChannel?.id === channelId) {
          setSelectedChannel(null);
        }
        fetchChannels();
      } else {
        toast.error('Failed to delete channel');
      }
    } catch (error) {
      toast.error('Failed to delete channel');
    }
    setLoading(false);
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/requests/${requestId}/approve`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Request approved!');
        fetchRequests();
        fetchChannels();
      }
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/chat/requests/${requestId}/decline`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success('Request declined');
        fetchRequests();
      }
    } catch (error) {
      toast.error('Failed to decline');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChannel) return;
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${selectedChannel.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          body: messageText,
          userId: 'admin-user-id',
          mentions: []
        }),
      });
      if (res.ok) {
        toast.success('Message sent!');
        setMessageText('');
        fetchChannelData(selectedChannel.id);
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || !selectedChannel) return;
    const validOptions = pollOptions.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast.error('Need at least 2 options');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${selectedChannel.id}/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: pollQuestion, options: validOptions }),
      });
      if (res.ok) {
        toast.success('Poll created!');
        setPollQuestion('');
        setPollOptions(['', '', '']);
        fetchChannelData(selectedChannel.id);
      }
    } catch (error) {
      toast.error('Failed to create poll');
    }
  };

  // Calculate stats
  const totalMembers = channels.reduce((sum, ch) => sum + (ch.memberCount || 0), 0);
  const publicChannels = channels.filter(ch => ch.is_public).length;

  // Handle image selection for announcement
  const handleAnnouncementImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnnouncementImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnouncementImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle send announcement
  const handleSendAnnouncement = async () => {
    if (!announcementText.trim() || selectedChannelsForAnnouncement.length === 0) {
      toast.error('Please select channels and add text');
      return;
    }

    setLoading(true);
    try {
      // Send to each selected channel
      for (const channelId of selectedChannelsForAnnouncement) {
        let imageUrl = '';
        
        // Upload image if provided
        if (announcementImage) {
          const formData = new FormData();
          formData.append('image', announcementImage);
          const imgRes = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/images`, {
            method: 'POST',
            body: formData,
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            imageUrl = imgData.imageUrl || '';
          }
        }

        // Build message body with proper formatting
        let messageBody = announcementTitle 
          ? `📢 **${announcementTitle}**\n\n${announcementText}`
          : `📢 ${announcementText}`;

        // Send message with image URL embedded
        const msgRes = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            body: messageBody,
            userId: 'Admin',
            userHandle: 'admin',
            mentions: ['@everyone'], // Notify everyone
            imageUrl: imageUrl || undefined, // Include image URL in message
            isAnnouncement: true // Flag as announcement
          }),
        });

        if (!msgRes.ok) {
          console.error('Failed to send message to channel:', channelId);
        }
      }

      toast.success(`📢 Announcement sent to ${selectedChannelsForAnnouncement.length} channel(s)! Students will be notified.`);
      setAnnouncementTitle('');
      setAnnouncementText('');
      setAnnouncementImage(null);
      setAnnouncementImagePreview('');
      setSelectedChannelsForAnnouncement([]);
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error('Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminNavbar />
      
      {/* Add proper spacing below navbar */}
      <div className="container mx-auto px-6 pt-24 pb-6 max-w-[1800px]">
        {/* Header Section with proper spacing */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Social Wall Admin
              </h1>
              <p className="text-slate-400 text-base">Manage channels, content, and community</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 h-11 px-6 text-base font-semibold shadow-lg shadow-purple-500/20">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Channel
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Channel Name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <Textarea
                      placeholder="Description"
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                    <Button onClick={handleCreateChannel} disabled={loading} className="w-full">
                      {loading ? 'Creating...' : 'Create Channel'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Edit Channel Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Channel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Channel Name</label>
                  <Input
                    placeholder="Channel Name"
                    value={editChannelName}
                    onChange={(e) => setEditChannelName(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                  <Textarea
                    placeholder="Description"
                    value={editChannelDesc}
                    onChange={(e) => setEditChannelDesc(e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpdateChannel} 
                    disabled={loading || !editChannelName.trim()} 
                    className="flex-1"
                  >
                    {loading ? 'Updating...' : 'Update Channel'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Stats Cards with better spacing */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Active Channels</p>
                  <p className="text-4xl font-bold text-white">{channels.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Hash className="h-7 w-7 text-purple-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Total Members</p>
                  <p className="text-4xl font-bold text-white">{totalMembers}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Users className="h-7 w-7 text-cyan-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Pending Requests</p>
                  <p className="text-4xl font-bold text-white">{requests.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-orange-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Support Tickets</p>
                  <p className="text-4xl font-bold text-white">{tickets.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <MessageSquare className="h-7 w-7 text-red-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="channels" className="data-[state=active]:bg-purple-600">
              <Hash className="h-4 w-4 mr-2" />
              Channel Management
            </TabsTrigger>
            <TabsTrigger value="announcements" className="data-[state=active]:bg-purple-600">
              <Megaphone className="h-4 w-4 mr-2" />
              Announcements
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0">
            {/* Pending Requests Banner */}
            {requests.length > 0 && (
          <Card className="bg-orange-500/10 border-orange-500/30 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                Pending Channel Requests
                <Badge className="bg-orange-500">{requests.length}</Badge>
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requests.map((req) => (
                <Card key={req.id} className="bg-slate-800/50 border-slate-700 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{req.name}</h4>
                      <p className="text-sm text-slate-400 mt-1">{req.description}</p>
                      <p className="text-xs text-slate-500 mt-2">Requested {new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 ml-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveRequest(req.id)}
                        className="bg-green-500/20 border-green-500/50 hover:bg-green-500/30 text-green-400"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeclineRequest(req.id)}
                        className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Main Content: Channel Grid + Detail Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Channel Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">All Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <Card
                  key={channel.id}
                  className={`bg-slate-800/50 border-slate-700 p-4 cursor-pointer transition-all hover:bg-slate-800 hover:border-purple-500/50 ${
                    selectedChannel?.id === channel.id ? 'ring-2 ring-purple-500 border-purple-500' : ''
                  }`}
                  onClick={() => handleSelectChannel(channel)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Hash className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{channel.name}</h3>
                        <p className="text-xs text-slate-400">#{channel.slug}</p>
                      </div>
                    </div>
                    <Badge variant={channel.is_public ? "default" : "secondary"} className="text-xs">
                      {channel.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{channel.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {channel.memberCount || 0} members
                    </span>
                    {selectedChannel?.id === channel.id && (
                      <span className="text-purple-400 font-semibold">Selected</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Selected Channel Detail */}
          <div className="lg:col-span-1">
            {selectedChannel ? (
              <div className="sticky top-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  {/* Channel Header */}
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedChannel.name}</h3>
                        <p className="text-sm text-slate-400">#{selectedChannel.slug}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedChannel(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={selectedChannel.is_public ? "default" : "secondary"} className="text-xs">
                        {selectedChannel.is_public ? 'Public' : 'Private'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {selectedChannel.memberCount || 0}
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 border-b border-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Quick Actions</p>
                    <div className="space-y-3">
                      {/* Send Message */}
                      <div>
                        <Textarea
                          placeholder="Post a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          className="bg-slate-900 border-slate-600 text-white text-sm mb-2"
                          rows={2}
                        />
                        <Button size="sm" onClick={handleSendMessage} className="w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Post Message
                        </Button>
                      </div>

                      {/* Create Poll */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="w-full">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Create Poll
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Create Poll</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Input
                              placeholder="Poll question"
                              value={pollQuestion}
                              onChange={(e) => setPollQuestion(e.target.value)}
                              className="bg-slate-800 border-slate-600 text-white"
                            />
                            {pollOptions.map((opt, i) => (
                              <Input
                                key={i}
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...pollOptions];
                                  newOpts[i] = e.target.value;
                                  setPollOptions(newOpts);
                                }}
                                className="bg-slate-800 border-slate-600 text-white"
                              />
                            ))}
                            <Button onClick={handleCreatePoll} className="w-full">
                              Create Poll
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400 mb-3">Recent Activity</p>
                    <div className="space-y-4">
                      {/* Messages */}
                      <div>
                        <p className="text-sm font-semibold text-white mb-2">Messages ({messages.length})</p>
                        <div className="space-y-2">
                          {messages.slice(0, 3).map((msg, i) => (
                            <div key={i} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                              <p className="line-clamp-2">{msg.body}</p>
                            </div>
                          ))}
                          {messages.length === 0 && (
                            <p className="text-xs text-slate-500">No messages yet</p>
                          )}
                        </div>
                      </div>

                      {/* Polls */}
                      <div>
                        <p className="text-sm font-semibold text-white mb-2">Polls ({polls.length})</p>
                        <div className="space-y-2">
                          {polls.slice(0, 2).map((poll, i) => (
                            <div key={i} className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                              <p className="font-semibold text-white">{poll.question}</p>
                              <p className="text-xs text-slate-500 mt-1">{poll.options?.length || 0} options</p>
                            </div>
                          ))}
                          {polls.length === 0 && (
                            <p className="text-xs text-slate-500">No polls yet</p>
                          )}
                        </div>
                      </div>

                      {/* Images */}
                      {images.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-white mb-2">Images ({images.length})</p>
                          <div className="grid grid-cols-3 gap-2">
                            {images.slice(0, 6).map((img, i) => (
                              <div key={i} className="aspect-square rounded bg-slate-900/50 overflow-hidden">
                                <img
                                  src={img.imageUrl}
                                  alt="Channel image"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
                <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Channel Selected</h3>
                <p className="text-sm text-slate-500">Select a channel from the grid to view details and take actions</p>
              </Card>
            )}
          </div>
        </div>
          </TabsContent>

          {/* CHANNELS TAB */}
          <TabsContent value="channels" className="mt-0">
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Hash className="h-6 w-6 text-purple-400" />
                  Active Channels
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channels.map((channel) => (
                    <Card
                      key={channel.id}
                      className="bg-slate-900/50 border-slate-600 p-4 hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Hash className="h-5 w-5 text-purple-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-sm">{channel.name}</h3>
                            <p className="text-xs text-slate-400">#{channel.slug}</p>
                          </div>
                        </div>
                        <Badge variant={channel.is_public ? "default" : "secondary"} className="text-xs">
                          {channel.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{channel.description || 'No description'}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Users className="h-3 w-3" />
                          {channel.memberCount || 0} members
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditChannel(channel)}
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-7 px-2"
                            title="Edit channel"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChannel(channel.id, channel.name)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                            title="Delete channel"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ANNOUNCEMENTS TAB */}
          <TabsContent value="announcements" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create Announcement Form */}
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Megaphone className="h-6 w-6 text-purple-400" />
                  Create Announcement
                </h2>
                <p className="text-sm text-slate-400 mb-6">
                  Send announcements with optional images to multiple channels
                </p>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Title (Optional)
                    </label>
                    <Input
                      placeholder="Announcement title..."
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Message *
                    </label>
                    <Textarea
                      placeholder="Write your announcement message..."
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="bg-slate-900 border-slate-600 text-white min-h-[120px]"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Image (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleAnnouncementImageChange}
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAnnouncementImage(null);
                          setAnnouncementImagePreview('');
                        }}
                        disabled={!announcementImage}
                        className="shrink-0"
                      >
                        Clear
                      </Button>
                    </div>
                    {announcementImagePreview && (
                      <div className="mt-3">
                        <img
                          src={announcementImagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-slate-600"
                        />
                      </div>
                    )}
                  </div>

                  {/* Channel Selection */}
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Select Channels *
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto bg-slate-900 border border-slate-600 rounded-lg p-3">
                      {channels.map((channel) => (
                        <label
                          key={channel.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedChannelsForAnnouncement.includes(channel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedChannelsForAnnouncement([...selectedChannelsForAnnouncement, channel.id]);
                              } else {
                                setSelectedChannelsForAnnouncement(
                                  selectedChannelsForAnnouncement.filter((id) => id !== channel.id)
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-white">
                            {channel.name}
                            <span className="text-xs text-slate-400 ml-2">
                              ({channel.memberCount || 0} members)
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Selected: {selectedChannelsForAnnouncement.length} channels
                    </p>
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={handleSendAnnouncement}
                    disabled={!announcementText.trim() || selectedChannelsForAnnouncement.length === 0}
                    className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement to {selectedChannelsForAnnouncement.length} Channel(s)
                  </Button>
                </div>
              </Card>

              {/* Preview */}
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">Preview</h2>
                <p className="text-sm text-slate-400 mb-6">
                  How your announcement will appear
                </p>

                {announcementText || announcementImage ? (
                  <Card className="bg-slate-900 border-slate-600 p-4">
                    {announcementTitle && (
                      <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        {announcementTitle}
                      </h3>
                    )}
                    {!announcementTitle && (
                      <div className="flex items-center gap-2 mb-2">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Announcement</span>
                      </div>
                    )}
                    {announcementImagePreview && (
                      <img
                        src={announcementImagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="text-white whitespace-pre-wrap">{announcementText}</p>
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-xs text-slate-500">
                        Will be sent to: {selectedChannelsForAnnouncement.length > 0 
                          ? selectedChannelsForAnnouncement.map(id => 
                              channels.find(ch => ch.id === id)?.name
                            ).join(', ')
                          : 'No channels selected'
                        }
                      </p>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-900 border-slate-600 p-8 text-center">
                    <Megaphone className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500">
                      Start typing to see preview
                    </p>
                  </Card>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SocialAdminImproved;


import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Ticket as TicketIcon, AlertCircle, CheckCircle, Clock, Search, Filter,
  User, Building, Tag, MessageSquare, Send, Eye, BarChart3, TrendingUp, XCircle, Trash, X
} from 'lucide-react';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  department: string;
  assignedTo: string | null;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

const TicketTracker = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Reply
  const [replyText, setReplyText] = useState('');
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  const statuses = ['open', 'in_progress', 'resolved', 'closed'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const categories = ['technical', 'academic', 'facilities', 'billing', 'other', 'general'];
  const departments = ['it', 'admin', 'finance', 'facilities', 'academic', 'support'];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, categoryFilter, departmentFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/tickets');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    }
  };

  const filterTickets = () => {
    let filtered = [...tickets];

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(t => t.department === departmentFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updatedTicket = await res.json();
        toast.success(`Ticket status updated to ${newStatus.replace('_', ' ')}`);
        
        // Emit socket event for real-time update to student
        // The backend should handle this, but we'll fetch updated data
        fetchTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDepartment = async (ticketId: string, department: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ department }),
      });

      if (res.ok) {
        toast.success(`Ticket assigned to ${department}`);
        fetchTickets();
      }
    } catch (error) {
      toast.error('Failed to assign department');
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminReply: replyText,
          status: 'resolved',
        }),
      });

      if (res.ok) {
        toast.success('✅ Reply sent and ticket resolved! Student will be notified.');
        setReplyText('');
        setShowReplyDialog(false);
        fetchTickets();
        setSelectedTicket(null);
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string, ticketTitle: string) => {
    if (!confirm(`Are you sure you want to delete ticket: "${ticketTitle}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/tickets/${ticketId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Ticket deleted successfully');
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(null);
        }
        fetchTickets();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete ticket');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-slate-500';
      default: return 'bg-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'normal': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'low': return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
      default: return 'text-slate-400 bg-slate-500/20 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminNavbar />

      <div className="container mx-auto px-6 pt-24 pb-6 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Support Ticket Tracker
              </h1>
              <p className="text-slate-400 text-base">Manage and resolve student support tickets</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Open Tickets</p>
                  <p className="text-4xl font-bold text-white">{openTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-red-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">In Progress</p>
                  <p className="text-4xl font-bold text-white">{inProgressTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-yellow-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Resolved</p>
                  <p className="text-4xl font-bold text-white">{resolvedTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Urgent</p>
                  <p className="text-4xl font-bold text-white">{urgentTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-purple-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border-slate-600 text-white pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Department Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept} className="capitalize">{dept.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="all">All Priorities</SelectItem>
                {priorities.map(priority => (
                  <SelectItem key={priority} value={priority} className="capitalize">{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Ticket Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={`bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-4 cursor-pointer ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-purple-500 border-purple-500' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          ticket.priority === 'urgent' ? 'bg-red-500/20' :
                          ticket.priority === 'high' ? 'bg-orange-500/20' :
                          'bg-slate-700'
                        }`}>
                          <TicketIcon className={`h-5 w-5 ${
                            ticket.priority === 'urgent' ? 'text-red-400' :
                            ticket.priority === 'high' ? 'text-orange-400' :
                            'text-slate-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg mb-1">{ticket.title}</h3>
                          <p className="text-sm text-slate-400 line-clamp-2">{ticket.description}</p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          <Tag className="h-3 w-3 mr-1" />
                          {ticket.category}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-slate-600">
                          <Building className="h-3 w-3 mr-1" />
                          {ticket.department.toUpperCase()}
                        </Badge>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.userId}
                        </span>
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2">
                      {ticket.status === 'open' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(ticket.id, 'in_progress');
                          }}
                          className="bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 text-yellow-400 h-8"
                        >
                          Start
                        </Button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicket(ticket);
                            setShowReplyDialog(true);
                          }}
                          className="bg-green-500/20 border-green-500/50 hover:bg-green-500/30 text-green-400 h-8"
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {filteredTickets.length === 0 && (
                <Card className="bg-slate-800/50 border-slate-700 p-12 text-center">
                  <TicketIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">No Tickets Found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No support tickets yet'}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Ticket Detail Sidebar */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="sticky top-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  {/* Header */}
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">Ticket Details</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTicket(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Ticket Info */}
                  <div className="p-4 border-b border-slate-700">
                    <h4 className="font-semibold text-white mb-2">{selectedTicket.title}</h4>
                    <p className="text-sm text-slate-400 whitespace-pre-wrap mb-4">{selectedTicket.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>Student: {selectedTicket.userId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Tag className="h-4 w-4" />
                        <span>Category: {selectedTicket.category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Building className="h-4 w-4" />
                        <span>Department: {selectedTicket.department.toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Created: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply */}
                  {selectedTicket.adminReply && (
                    <div className="p-4 border-b border-slate-700 bg-green-500/5">
                      <p className="text-xs uppercase tracking-wide text-green-400 font-semibold mb-2">Admin Reply</p>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedTicket.adminReply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">Actions</p>

                    {/* Update Status */}
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">Update Status</label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {statuses.map(status => (
                            <SelectItem key={status} value={status} className="capitalize">
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Assign Department */}
                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">Assign Department</label>
                      <Select
                        value={selectedTicket.department}
                        onValueChange={(value) => handleAssignDepartment(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept} className="capitalize">
                              {dept.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reply Button */}
                    {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                      <Button
                        onClick={() => setShowReplyDialog(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Reply & Resolve
                      </Button>
                    )}

                    {/* Delete Ticket Button */}
                    <div className="pt-3 border-t border-slate-700">
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteTicket(selectedTicket.id, selectedTicket.title)}
                        className="w-full bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Ticket
                      </Button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        This action cannot be undone
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700 p-8 text-center sticky top-6">
                <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-400 mb-2">No Ticket Selected</h3>
                <p className="text-sm text-slate-500">Click a ticket to view details and take action</p>
              </Card>
            )}
          </div>
        </div>

        {/* Reply Dialog */}
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Reply to Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">
                  Ticket: {selectedTicket?.title}
                </label>
                <Textarea
                  placeholder="Type your reply to the student..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply & Resolve
                </Button>
                <Button variant="outline" onClick={() => setShowReplyDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TicketTracker;


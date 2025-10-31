import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Ticket as TicketIcon, Clock, CheckCircle, AlertCircle, 
  MessageSquare, Calendar, Tag, Building, Eye, Plus
} from 'lucide-react';
import SubmitTicket from '@/components/SubmitTicket';
import { useSocket } from '@/lib/useSocket';
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
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

const MyTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userId] = useState('student-123'); // TODO: Get from auth
  const { socket } = useSocket(userId, handleSocketEvent);

  function handleSocketEvent(evt: any) {
    if (evt.type === 'ticket:updated' && evt.userId === userId) {
      // Real-time ticket update notification
      toast.success(`🎫 Ticket Updated: ${evt.ticket.title} - Status: ${evt.ticket.status}`);
      
      // Update ticket in list
      setTickets(curr => curr.map(t => 
        t.id === evt.ticket.id ? evt.ticket : t
      ));
      
      // Update selected ticket if it's the one that changed
      if (selectedTicket?.id === evt.ticket.id) {
        setSelectedTicket(evt.ticket);
      }
    }
  }

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // Sort by newest first
        setTickets(data.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load your tickets');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'open':
        return { 
          color: 'bg-red-500', 
          textColor: 'text-red-400',
          icon: AlertCircle,
          label: 'Open',
          description: 'Waiting for admin response'
        };
      case 'in_progress':
        return { 
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-400',
          icon: Clock,
          label: 'In Progress',
          description: 'Being worked on'
        };
      case 'resolved':
        return { 
          color: 'bg-green-500', 
          textColor: 'text-green-400',
          icon: CheckCircle,
          label: 'Resolved',
          description: 'Issue resolved'
        };
      case 'closed':
        return { 
          color: 'bg-slate-500', 
          textColor: 'text-slate-400',
          icon: CheckCircle,
          label: 'Closed',
          description: 'Ticket closed'
        };
      default:
        return { 
          color: 'bg-slate-500', 
          textColor: 'text-slate-400',
          icon: TicketIcon,
          label: status,
          description: ''
        };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 text-red-400';
      case 'high': return 'border-orange-500 text-orange-400';
      case 'normal': return 'border-blue-500 text-blue-400';
      case 'low': return 'border-slate-500 text-slate-400';
      default: return 'border-slate-500 text-slate-400';
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A]">
      <Navbar />

      <div className="container mx-auto px-6 pt-24 pb-12 max-w-[1400px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                My Support Tickets
              </h1>
              <p className="text-slate-600 dark:text-slate-400">Track and manage your support requests</p>
            </div>
            <SubmitTicket userId={userId} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="neo-card p-4 border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Open</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">{openTickets}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </Card>
            <Card className="neo-card p-4 border-l-4 border-l-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">{inProgressTickets}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </Card>
            <Card className="neo-card p-4 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">{resolvedTickets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </Card>
            <Card className="neo-card p-4 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-1">Total</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">{tickets.length}</p>
                </div>
                <TicketIcon className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </Card>
          </div>
        </div>

        {/* Tickets List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Cards */}
          <div className="lg:col-span-2 space-y-4">
            {tickets.length === 0 ? (
              <Card className="neo-card p-12 text-center">
                <TicketIcon className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Tickets Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  You haven't submitted any support tickets. Need help? Create your first ticket!
                </p>
                <SubmitTicket userId={userId} />
              </Card>
            ) : (
              tickets.map((ticket) => {
                const statusInfo = getStatusInfo(ticket.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <Card
                    key={ticket.id}
                    className={`neo-card p-5 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTicket?.id === ticket.id 
                        ? 'ring-2 ring-purple-500 dark:ring-purple-400' 
                        : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`w-12 h-12 rounded-lg ${statusInfo.color}/20 flex items-center justify-center shrink-0`}>
                        <StatusIcon className={`h-6 w-6 ${statusInfo.textColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-slate-800 dark:text-white">
                            {ticket.title}
                          </h3>
                          <Badge className={`${statusInfo.color} shrink-0`}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {ticket.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-slate-600 dark:text-slate-400">
                            <Tag className="h-3 w-3 mr-1" />
                            {ticket.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-slate-600 dark:text-slate-400">
                            <Building className="h-3 w-3 mr-1" />
                            {ticket.department.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                          <span>{statusInfo.description}</span>
                        </div>

                        {/* Admin Reply Preview */}
                        {ticket.adminReply && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-4 w-4 text-green-500" />
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400">Admin Reply</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                              {ticket.adminReply}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Ticket Detail Sidebar */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <div className="sticky top-24">
                <Card className="neo-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-white">Ticket Details</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicket(null)}
                      className="text-slate-500 dark:text-slate-400"
                    >
                      ✕
                    </Button>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-6">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedTicket.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <div className={`${statusInfo.color}/20 rounded-lg p-4 border-l-4 ${statusInfo.color}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
                            <span className={`font-semibold ${statusInfo.textColor}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {statusInfo.description}
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Ticket Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{selectedTicket.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</p>
                        <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                          {selectedTicket.priority}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Category</p>
                        <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Department</p>
                        <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                          {selectedTicket.department.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {new Date(selectedTicket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Reply */}
                  {selectedTicket.adminReply && (
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <span className="font-semibold text-green-700 dark:text-green-300">Support Team Reply</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {selectedTicket.adminReply}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        Replied on {new Date(selectedTicket.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
                      Ticket Timeline
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Ticket Created</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(selectedTicket.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {selectedTicket.status !== 'open' && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Status Updated</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Changed to {selectedTicket.status.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      )}
                      {selectedTicket.adminReply && (
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">Admin Replied</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(selectedTicket.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="neo-card p-8 text-center sticky top-24">
                <Eye className="h-12 w-12 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  No Ticket Selected
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Click a ticket to view full details and admin replies
                </p>
                <SubmitTicket userId={userId} />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;


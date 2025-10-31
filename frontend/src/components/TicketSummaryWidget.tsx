import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import SubmitTicket from './SubmitTicket';

interface TicketSummaryWidgetProps {
  userId: string;
}

const TicketSummaryWidget = ({ userId }: TicketSummaryWidgetProps) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/tickets?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const recentTickets = tickets.slice(0, 2);

  return (
    <Card className="neo-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Ticket className="h-5 w-5 text-purple-500" />
          My Tickets
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/my-tickets')}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
        >
          View All <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border-l-4 border-red-500">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{openTickets}</p>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Open</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{inProgressTickets}</p>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">In Progress</p>
        </div>
        <div className="text-center p-3 bg-green-50 dark:bg-green-500/10 rounded-lg border-l-4 border-green-500">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{resolvedTickets}</p>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Resolved</p>
        </div>
      </div>

      {/* Recent Tickets */}
      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">Loading tickets...</p>
      ) : tickets.length > 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
            Recent Tickets
          </p>
          {recentTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate('/my-tickets')}
              className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 cursor-pointer transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-1">
                  {ticket.title}
                </p>
                <Badge className={
                  ticket.status === 'open' ? 'bg-red-500' :
                  ticket.status === 'in_progress' ? 'bg-yellow-500' :
                  ticket.status === 'resolved' ? 'bg-green-500' :
                  'bg-slate-500'
                }>
                  {ticket.status === 'in_progress' ? 'In Progress' : ticket.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 mb-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No tickets yet</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <SubmitTicket userId={userId} />
        {tickets.length > 0 && (
          <Button
            variant="outline"
            onClick={() => navigate('/my-tickets')}
            className="w-full"
          >
            View All {tickets.length} Ticket{tickets.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default TicketSummaryWidget;


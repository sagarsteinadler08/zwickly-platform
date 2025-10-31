import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Users, Calendar, MessageSquare, Ticket, 
  Hash, Activity, Bell, CheckCircle, Clock, AlertCircle,
  BarChart3, PieChart, ArrowUp, ArrowDown, Eye, Download,
  Sparkles, Zap, Target
} from "lucide-react";
import { toast } from "sonner";
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { EQIGaugeChart } from "@/components/admin/charts/EQIGaugeChart";
import { fetchEQIAnalytics, fetchRetentionAnalytics, fetchPixiAnalytics, fetchAISummary } from "@/lib/analyticsApi";

const AdminHomeImproved = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Real-time stats
  const [stats, setStats] = useState({
    totalStudents: 913,
    activeChannels: 5,
    totalEvents: 12,
    openTickets: 1,
    resolvedTickets: 0,
    totalMessages: 1247,
    upcomingEvents: 8,
    completedEvents: 4,
  });

  // Data for charts
  const [eventTrends, setEventTrends] = useState<any[]>([]);
  const [ticketStats, setTicketStats] = useState<any[]>([]);
  const [channelActivity, setChannelActivity] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  
  // Recent activity
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);

  // Enhanced Analytics State
  const [eqiData, setEqiData] = useState<any>(null);
  const [retentionData, setRetentionData] = useState<any>(null);
  const [pixiData, setPixiData] = useState<any>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [showEnhancedAnalytics, setShowEnhancedAnalytics] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchEnhancedAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchEnhancedAnalytics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEnhancedAnalytics = async () => {
    try {
      const [eqi, retention, pixi] = await Promise.all([
        fetchEQIAnalytics(),
        fetchRetentionAnalytics(),
        fetchPixiAnalytics(30),
      ]);
      
      setEqiData(eqi);
      setRetentionData(retention);
      setPixiData(pixi);
    } catch (error) {
      console.error('Error fetching enhanced analytics:', error);
    }
  };

  const handleGenerateAISummary = async () => {
    try {
      toast.info('Generating AI summary...');
      const summary = await fetchAISummary({});
      setAiSummary(summary);
      toast.success('AI summary generated!');
    } catch (error) {
      toast.error('Failed to generate AI summary');
    }
  };

  const handleExportPDF = () => {
    toast.info('Export PDF feature coming soon!');
    // Would implement PDF export here
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch events
      const eventsRes = await fetch('http://localhost:3000/api/events');
      const events = await eventsRes.json();
      
      // Fetch channels
      const channelsRes = await fetch('http://localhost:3000/api/chat/channels');
      const channels = await channelsRes.json();
      
      // Fetch tickets
      const ticketsRes = await fetch('http://localhost:3000/api/tickets');
      const tickets = await ticketsRes.json();

      // Calculate stats
      const now = new Date();
      const upcoming = Array.isArray(events) ? events.filter((e: any) => 
        e.event_date && new Date(e.event_date) >= now
      ).length : 0;
      
      const completed = Array.isArray(events) ? events.filter((e: any) => 
        e.event_date && new Date(e.event_date) < now
      ).length : 0;

      const openTickets = Array.isArray(tickets) ? tickets.filter((t: any) => t.status === 'open').length : 0;
      const resolvedTickets = Array.isArray(tickets) ? tickets.filter((t: any) => t.status === 'resolved').length : 0;

      setStats({
        totalStudents: 913,
        activeChannels: Array.isArray(channels) ? channels.length : 0,
        totalEvents: Array.isArray(events) ? events.length : 0,
        openTickets,
        resolvedTickets,
        totalMessages: 1247, // Mock - would come from messages API
        upcomingEvents: upcoming,
        completedEvents: completed,
      });

      // Event trends (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          events: Math.floor(Math.random() * 5) + 1,
          registrations: Math.floor(Math.random() * 20) + 5,
        };
      });
      setEventTrends(last7Days);

      // Ticket stats by status
      const inProgressTickets = Array.isArray(tickets) ? tickets.filter((t: any) => t.status === 'in_progress').length : 0;
      const closedTickets = Array.isArray(tickets) ? tickets.filter((t: any) => t.status === 'closed').length : 0;
      
      const ticketsByStatus = [
        { name: 'Open', value: openTickets || 0, color: '#ef4444' },
        { name: 'In Progress', value: inProgressTickets, color: '#eab308' },
        { name: 'Resolved', value: resolvedTickets || 0, color: '#22c55e' },
        { name: 'Closed', value: closedTickets, color: '#64748b' },
      ];
      
      console.log('Ticket Stats:', ticketsByStatus);
      setTicketStats(ticketsByStatus);

      // Channel activity
      let channelData: any[] = [];
      if (Array.isArray(channels) && channels.length > 0) {
        channelData = channels.slice(0, 5).map((ch: any) => ({
          name: ch.name,
          members: ch.memberCount || 0,
          messages: Math.floor(Math.random() * 100) + 10,
        }));
      } else {
        // Provide mock data if no channels
        channelData = [
          { name: 'Campus Events', value: 89 },
          { name: 'Study Groups', value: 67 },
          { name: 'General', value: 45 },
        ];
      }
      
      console.log('Channel Activity:', channelData);
      setChannelActivity(channelData);

      // Event category breakdown
      if (Array.isArray(events) && events.length > 0) {
        const categories = events.reduce((acc: any, event: any) => {
          const cat = event.category || 'Other';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});
        
        const categoryData = Object.entries(categories).map(([name, value]) => ({
          name: String(name),
          value: Number(value),
        }));
        
        console.log('Category Breakdown:', categoryData);
        setCategoryBreakdown(categoryData);
      } else {
        // Set default data if no events
        setCategoryBreakdown([
          { name: 'Tech', value: 5 },
          { name: 'Workshop', value: 3 },
          { name: 'Academic', value: 4 },
          { name: 'Career', value: 2 },
          { name: 'Social', value: 3 },
        ]);
      }

      // Mock recent activity
      setRecentActivity([
        { type: 'event', text: 'New event created: Campus Hackathon', time: '2 hours ago', icon: Calendar },
        { type: 'ticket', text: 'Support ticket resolved #T001', time: '3 hours ago', icon: CheckCircle },
        { type: 'message', text: '45 new messages in General channel', time: '5 hours ago', icon: MessageSquare },
        { type: 'user', text: '12 new student registrations', time: '1 day ago', icon: Users },
      ]);

      // Mock pending actions
      setPendingActions([
        { type: 'ticket', text: `${openTickets} open support tickets`, action: 'Review', link: '/admin/tickets', priority: 'high' },
        { type: 'event', text: `${upcoming} upcoming events`, action: 'Manage', link: '/admin/events-v2', priority: 'normal' },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444', '#22c55e'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminNavbar />
      
      <div className="container mx-auto px-6 pt-24 pb-6 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 text-base">Real-time metrics and insights for campus management</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-semibold">Live Data</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Total Students</p>
                  <p className="text-4xl font-bold text-white">{stats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <ArrowUp className="h-4 w-4" />
                <span>12% from last month</span>
              </div>
            </Card>

            {/* Active Channels */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Active Channels</p>
                  <p className="text-4xl font-bold text-white">{stats.activeChannels}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Hash className="h-7 w-7 text-cyan-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-cyan-400 text-sm">
                <Activity className="h-4 w-4" />
                <span>{stats.totalMessages} messages</span>
              </div>
            </Card>

            {/* Total Events */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Total Events</p>
                  <p className="text-4xl font-bold text-white">{stats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-sm">
                <span>{stats.upcomingEvents} upcoming</span>
                <span className="text-slate-600">•</span>
                <span>{stats.completedEvents} completed</span>
              </div>
            </Card>

            {/* Support Tickets */}
            <Card className="bg-slate-800/50 border-slate-700 hover:border-red-500/50 transition-all p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Support Tickets</p>
                  <p className="text-4xl font-bold text-white">{stats.openTickets}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Ticket className="h-7 w-7 text-red-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle className="h-4 w-4" />
                <span>{stats.resolvedTickets} resolved</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Event Trends Chart */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-1">Event Activity Trends</h3>
              <p className="text-sm text-slate-400">Events and registrations over the last 7 days</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={eventTrends}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Area type="monotone" dataKey="events" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEvents)" name="Events" />
                <Area type="monotone" dataKey="registrations" stroke="#06b6d4" fillOpacity={1} fill="url(#colorReg)" name="Registrations" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Ticket Status Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-1">Support Ticket Status</h3>
              <p className="text-sm text-slate-400">Current ticket distribution by status</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={ticketStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </Card>

          {/* Channel Activity */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-1">Top Channels by Activity</h3>
              <p className="text-sm text-slate-400">Message count per channel</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="messages" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Event Category Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-1">Event Categories</h3>
              <p className="text-sm text-slate-400">Distribution of events by category</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-purple-500/50 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.text}</p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Pending Actions */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Pending Actions
              {pendingActions.length > 0 && (
                <Badge className="bg-orange-500">{pendingActions.length}</Badge>
              )}
            </h3>
            <div className="space-y-3">
              {pendingActions.map((action, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    action.priority === 'high'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-slate-900/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className={`h-4 w-4 ${action.priority === 'high' ? 'text-red-400' : 'text-slate-400'}`} />
                        <p className="text-sm font-semibold text-white">{action.text}</p>
                      </div>
                      {action.priority === 'high' && (
                        <Badge className="bg-red-500 text-xs">Requires Attention</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(action.link)}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 ml-3"
                    >
                      {action.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-3">Quick Access</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/events-v2')}
                  className="justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Events
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/social')}
                  className="justify-start"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Social
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin/tickets')}
                  className="justify-start"
                >
                  <Ticket className="h-4 w-4 mr-2" />
                  Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/users')}
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Products
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-400" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Engagement Rate */}
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl font-bold text-purple-400 mb-1">84%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Student Engagement</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>+5.2%</span>
              </div>
            </div>

            {/* Response Time */}
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl font-bold text-cyan-400 mb-1">2.3h</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Response Time</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-xs">
                <ArrowDown className="h-3 w-3" />
                <span>-15%</span>
              </div>
            </div>

            {/* Event Attendance */}
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl font-bold text-green-400 mb-1">78%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Event Attendance</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>+8.1%</span>
              </div>
            </div>

            {/* Ticket Resolution */}
            <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="text-3xl font-bold text-orange-400 mb-1">92%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Ticket Resolution</div>
              <div className="mt-2 flex items-center justify-center gap-1 text-green-400 text-xs">
                <TrendingUp className="h-3 w-3" />
                <span>+3.5%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ENHANCED ANALYTICS SECTION */}
      {showEnhancedAnalytics && (
        <>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6 mt-12">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Zap className="h-6 w-6 text-purple-400" />
                Enhanced Analytics
              </h2>
              <p className="text-slate-400 text-sm mt-1">AI-powered insights and engagement metrics</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateAISummary}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Summary
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="border-slate-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Enhanced Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* EQI Score - Large Card */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-slate-200">Engagement Quality Index</h3>
              </div>
              
              {eqiData ? (
                <div>
                  <EQIGaugeChart
                    score={eqiData.current.score}
                    grade={eqiData.metadata.grade}
                    trend={eqiData.metadata.trend}
                  />
                  
                  {/* Factor Breakdown */}
                  <div className="mt-6 space-y-3">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Factor Breakdown</div>
                    {Object.entries(eqiData.current.factors).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-300 w-12 text-right">
                            {value.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Target & Benchmark */}
                  <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-amber-400">{eqiData.metadata.target}</div>
                      <div className="text-xs text-slate-400">Target</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-400">{eqiData.metadata.benchmark}</div>
                      <div className="text-xs text-slate-400">Benchmark</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  Loading EQI data...
                </div>
              )}
            </Card>

            {/* Retention Metrics */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-200">User Retention</h3>
              </div>

              {retentionData ? (
                <div className="space-y-6">
                  {/* DAU/WAU/MAU */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">Daily Active Users</div>
                        <div className="text-2xl font-bold text-cyan-400 mt-1">
                          {retentionData.metadata.currentDAU}
                        </div>
                      </div>
                      <Activity className="h-8 w-8 text-cyan-400/30" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">Weekly Active Users</div>
                        <div className="text-2xl font-bold text-purple-400 mt-1">
                          {retentionData.metadata.currentWAU}
                        </div>
                      </div>
                      <Users className="h-8 w-8 text-purple-400/30" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-400">Monthly Active Users</div>
                        <div className="text-2xl font-bold text-emerald-400 mt-1">
                          {retentionData.metadata.currentMAU}
                        </div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-emerald-400/30" />
                    </div>
                  </div>

                  {/* Stickiness & Growth */}
                  <div className="pt-4 border-t border-slate-700 grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-xl font-bold text-amber-400">
                        {retentionData.metadata.stickinessRatio.toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Stickiness</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/30 rounded-lg">
                      <div className="text-xl font-bold text-green-400">
                        +{retentionData.metadata.growthRate}%
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Growth</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  Loading retention data...
                </div>
              )}
            </Card>

            {/* Pixi Analytics */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-slate-200">Pixi Bot Analytics</h3>
              </div>

              {pixiData ? (
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {pixiData.metadata.totalInteractions}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Total Interactions</div>
                    </div>
                    <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-400">
                        {pixiData.metadata.avgResponseTime}s
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Avg Response</div>
                    </div>
                  </div>

                  {/* Top Topics */}
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Top Topics</div>
                    <div className="space-y-2">
                      {pixiData.topicBreakdown.labels.slice(0, 5).map((label: string, idx: number) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{
                                  width: `${(pixiData.topicBreakdown.values[idx] / Math.max(...pixiData.topicBreakdown.values)) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-300 w-8 text-right">
                              {pixiData.topicBreakdown.values[idx]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Satisfaction Score */}
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <div>
                        <div className="text-sm text-slate-400">Satisfaction Score</div>
                        <div className="text-3xl font-bold text-purple-400 mt-1">
                          {pixiData.metadata.satisfactionScore}/5
                        </div>
                      </div>
                      <div className="text-4xl">⭐</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  Loading Pixi data...
                </div>
              )}
            </Card>
          </div>

          {/* AI Summary Section */}
          {aiSummary && (
            <Card className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30 p-6 mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-semibold text-slate-200">AI-Powered Insights</h3>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Generated by AI
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Headline */}
                <div className="text-lg font-medium text-slate-200 mb-4">
                  {aiSummary.summary.headline}
                </div>

                {/* Key Insights */}
                <div>
                  <div className="text-sm font-semibold text-slate-300 mb-2">📊 Key Insights:</div>
                  <ul className="space-y-2">
                    {aiSummary.summary.keyInsights.map((insight: string, idx: number) => (
                      <li key={idx} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grid for Recommendations and Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Recommendations */}
                  <div>
                    <div className="text-sm font-semibold text-emerald-300 mb-2">✅ Recommendations:</div>
                    <ul className="space-y-1">
                      {aiSummary.summary.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-400">• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Concerns */}
                  <div>
                    <div className="text-sm font-semibold text-amber-300 mb-2">⚠️ Areas to Watch:</div>
                    <ul className="space-y-1">
                      {aiSummary.summary.concerns.map((concern: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-400">• {concern}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AdminHomeImproved;


import { useState, useEffect } from 'react';
import AdminNavbar from '@/components/AdminNavbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, Shield, Activity, Search, Filter, 
  MoreVertical, Ban, CheckCircle, XCircle, Clock,
  Mail, Phone, Calendar, LogOut, UserCog, Trash2,
  Eye, Edit, Lock, Unlock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  joinedDate: string;
  sessions: number;
  totalEvents: number;
  totalTickets: number;
}

interface Session {
  id: string;
  userId: string;
  userName: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  loginTime: string;
  lastActivity: string;
  status: 'active' | 'idle' | 'expired';
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeSessions: 0,
    suspendedUsers: 0,
    newUsersThisWeek: 0,
    adminUsers: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchSessions();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/sessions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/users/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to default values
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        activeSessions: 0,
        suspendedUsers: 0,
        newUsersThisWeek: 0,
        adminUsers: 0,
      });
    }
  };

  const handleSuspendUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to suspend ${userName}?`)) {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' }),
        });

        if (!response.ok) throw new Error('Failed to suspend user');

        toast.success(`${userName} has been suspended`);
        fetchUsers();
        fetchStats();
      } catch (error) {
        toast.error('Failed to suspend user');
        console.error(error);
      }
    }
  };

  const handleActivateUser = async (userId: string, userName: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });

      if (!response.ok) throw new Error('Failed to activate user');

      toast.success(`${userName} has been activated`);
      fetchUsers();
      fetchStats();
    } catch (error) {
      toast.error('Failed to activate user');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete user');

        toast.success(`${userName} has been deleted`);
        setSelectedUser(null);
        fetchUsers();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete user');
        console.error(error);
      }
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to terminate this session?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/admin/sessions/${sessionId}/terminate`, {
          method: 'POST',
        });

        if (!response.ok) throw new Error('Failed to terminate session');

        toast.success('Session terminated successfully');
        fetchSessions();
        fetchStats();
      } catch (error) {
        toast.error('Failed to terminate session');
        console.error(error);
      }
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to update role');

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
      console.error(error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'student': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
                User Management
              </h1>
              <p className="text-slate-400 text-base">Manage users, sessions, and permissions</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 h-11 px-6 text-base font-semibold shadow-lg shadow-purple-500/20">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New User</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Create a new user account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input placeholder="Full Name" className="bg-slate-900 border-slate-700 text-white" />
                    <Input placeholder="Email" type="email" className="bg-slate-900 border-slate-700 text-white" />
                    <Select>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600">
                      Create User
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-400">{stats.activeUsers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Active Sessions</p>
                  <p className="text-2xl font-bold text-cyan-400">{stats.activeSessions}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Suspended</p>
                  <p className="text-2xl font-bold text-red-400">{stats.suspendedUsers}</p>
                </div>
                <Ban className="h-8 w-8 text-red-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">New This Week</p>
                  <p className="text-2xl font-bold text-amber-400">{stats.newUsersThisWeek}</p>
                </div>
                <UserPlus className="h-8 w-8 text-amber-400" />
              </div>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-1">Admins</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.adminUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sessions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600">
              <Activity className="h-4 w-4 mr-2" />
              Active Sessions
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-cyan-600">
              <Shield className="h-4 w-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Filters */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                          <Badge className={`${getRoleColor(user.role)} text-xs`}>
                            {user.role}
                          </Badge>
                          <Badge className={`${getStatusColor(user.status)} text-xs`}>
                            {user.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last login: {user.lastLogin || 'Never'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined: {user.joinedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                          <span>{user.sessions} active session{user.sessions !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{user.totalEvents} events</span>
                          <span>•</span>
                          <span>{user.totalTickets} tickets</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                            className="border-slate-600 hover:border-cyan-500"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-white">User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl">
                                  {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                  <h3 className="text-2xl font-bold text-white mb-1">{selectedUser.name}</h3>
                                  <p className="text-slate-400">{selectedUser.email}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-slate-400 text-sm">Role</label>
                                  <Select defaultValue={selectedUser.role} onValueChange={(val) => handleChangeRole(selectedUser.id, val)}>
                                    <SelectTrigger className="mt-1 bg-slate-900 border-slate-700 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="student">Student</SelectItem>
                                      <SelectItem value="moderator">Moderator</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <label className="text-slate-400 text-sm">Status</label>
                                  <div className="mt-1">
                                    <Badge className={`${getStatusColor(selectedUser.status)}`}>
                                      {selectedUser.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-cyan-400">{selectedUser.sessions}</div>
                                  <div className="text-slate-400 text-sm">Active Sessions</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-400">{selectedUser.totalEvents}</div>
                                  <div className="text-slate-400 text-sm">Total Events</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-amber-400">{selectedUser.totalTickets}</div>
                                  <div className="text-slate-400 text-sm">Total Tickets</div>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-4 border-t border-slate-700">
                                {selectedUser.status === 'active' ? (
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-red-500/30 hover:bg-red-500/20 text-red-400"
                                    onClick={() => handleSuspendUser(selectedUser.id, selectedUser.name)}
                                  >
                                    <Ban className="h-4 w-4 mr-2" />
                                    Suspend User
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    className="flex-1 border-green-500/30 hover:bg-green-500/20 text-green-400"
                                    onClick={() => handleActivateUser(selectedUser.id, selectedUser.name)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate User
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  className="flex-1 border-slate-600 hover:border-red-500"
                                  onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {user.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendUser(user.id, user.name)}
                          className="border-red-500/30 hover:bg-red-500/20 text-red-400"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : user.status === 'suspended' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivateUser(user.id, user.name)}
                          className="border-green-500/30 hover:bg-green-500/20 text-green-400"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{session.userName}</h3>
                        <Badge className={`${session.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'} text-xs`}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Device:</span>
                          <span className="text-white ml-2">{session.device}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Browser:</span>
                          <span className="text-white ml-2">{session.browser}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Location:</span>
                          <span className="text-white ml-2">{session.location}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">IP:</span>
                          <span className="text-white ml-2">{session.ipAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                        <span>Login: {session.loginTime}</span>
                        <span>•</span>
                        <span>Last activity: {session.lastActivity}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      className="border-red-500/30 hover:bg-red-500/20 text-red-400"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Terminate
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Student</h3>
                    <p className="text-sm text-slate-400">Basic access</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    View events
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Register for events
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Submit tickets
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Access social wall
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <XCircle className="h-4 w-4" />
                    Manage users
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <XCircle className="h-4 w-4" />
                    Admin dashboard
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <UserCog className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Moderator</h3>
                    <p className="text-sm text-slate-400">Content management</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    All student permissions
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Moderate social wall
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Manage tickets
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Create announcements
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <XCircle className="h-4 w-4" />
                    Manage users
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <XCircle className="h-4 w-4" />
                    System settings
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Admin</h3>
                    <p className="text-sm text-slate-400">Full control</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    All moderator permissions
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Manage users & roles
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    System settings
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Analytics dashboard
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Full system access
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Audit logs
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagement;


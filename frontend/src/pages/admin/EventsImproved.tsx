import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Calendar, MapPin, Clock, Users, Plus, Edit, Trash, Search, Filter,
  CheckCircle, XCircle, Eye, LayoutDashboard, CalendarPlus, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  location: string | null;
  event_date: string | null;
  event_time: string | null;
  image_url: string | null;
  category: string | null;
  description: string | null;
  registration_info: string | null;
  likes: number;
  prosts: number;
}

const EventsImproved = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [eventFilter, setEventFilter] = useState('all'); // all, upcoming, completed
  
  // Form data
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    event_date: "",
    event_time: "",
    image_url: "",
    category: "",
    description: "",
    registration_info: "",
    publishToSocial: false,
    selectedChannel: "",
    publishToBanner: false,
  });

  const categories = ["Career", "Tech", "Music", "Sports", "Social", "Academic", "Workshop"];

  useEffect(() => {
    fetchEvents();
    fetchChannels();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory, eventFilter]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load events");
    }
  };

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

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Date filter (upcoming/completed)
    const now = new Date();
    if (eventFilter === 'upcoming') {
      filtered = filtered.filter(event => {
        if (!event.event_date) return false;
        return new Date(event.event_date) >= now;
      });
    } else if (eventFilter === 'completed') {
      filtered = filtered.filter(event => {
        if (!event.event_date) return false;
        return new Date(event.event_date) < now;
      });
    }

    setFilteredEvents(filtered);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.event_date) {
      toast.error("Please fill in title and date");
      return;
    }

    setLoading(true);
    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title: formData.title,
            location: formData.location,
            event_date: formData.event_date,
            event_time: formData.event_time,
            image_url: formData.image_url,
            category: formData.category,
            description: formData.description,
            registration_info: formData.registration_info,
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success("Event updated!");
      } else {
        // Create new event with publish options
        const res = await fetch('http://localhost:3000/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            publishToSocial: formData.publishToSocial,
            selectedChannel: formData.selectedChannel,
            publishToBanner: formData.publishToBanner,
          }),
        });

        if (!res.ok) throw new Error('Failed to create event');
        
        const result = await res.json();
        toast.success(
          formData.publishToSocial 
            ? "Event created and published to social wall!" 
            : "Event created successfully!"
        );
      }

      resetForm();
      setShowCreateDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to save event");
    }
    setLoading(false);
  };

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Delete "${eventTitle}"?`)) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success("Event deleted!");
      fetchEvents();
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      location: event.location || "",
      event_date: event.event_date || "",
      event_time: event.event_time || "",
      image_url: event.image_url || "",
      category: event.category || "",
      description: event.description || "",
      registration_info: event.registration_info || "",
      publishToSocial: false,
      selectedChannel: "",
      publishToBanner: false,
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      event_date: "",
      event_time: "",
      image_url: "",
      category: "",
      description: "",
      registration_info: "",
      publishToSocial: false,
      selectedChannel: "",
      publishToBanner: false,
    });
    setEditingEvent(null);
  };

  // Calculate stats
  const upcomingEvents = events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length;
  const completedEvents = events.filter(e => e.event_date && new Date(e.event_date) < new Date()).length;
  const categoryCounts = events.reduce((acc, e) => {
    if (e.category) {
      acc[e.category] = (acc[e.category] || 0) + 1;
    }
    return acc;
  }, {} as { [key: string]: number });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AdminNavbar />
      
      <div className="container mx-auto px-6 pt-24 pb-6 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                Events Management
              </h1>
              <p className="text-slate-400 text-base">Create, manage, and publish campus events</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setShowCreateDialog(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 h-11 px-6 text-base font-semibold shadow-lg shadow-purple-500/20"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Total Events</p>
                  <p className="text-4xl font-bold text-white">{events.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Calendar className="h-7 w-7 text-purple-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Upcoming</p>
                  <p className="text-4xl font-bold text-white">{upcomingEvents}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <CalendarPlus className="h-7 w-7 text-cyan-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Completed</p>
                  <p className="text-4xl font-bold text-white">{completedEvents}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-400" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 hover:border-orange-500/50 transition-all p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold mb-2">Categories</p>
                  <p className="text-4xl font-bold text-white">{Object.keys(categoryCounts).length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-orange-400" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border-slate-700 mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Events Overview
            </TabsTrigger>
            <TabsTrigger value="planned" className="data-[state=active]:bg-purple-600">
              <Calendar className="h-4 w-4 mr-2" />
              Planned Events
            </TabsTrigger>
            <TabsTrigger value="registrations" className="data-[state=active]:bg-purple-600">
              <Users className="h-4 w-4 mr-2" />
              Registrations
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="mt-0">
            {/* Filters */}
            <Card className="bg-slate-800/50 border-slate-700 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border-slate-600 text-white pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Events" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="upcoming">Upcoming Only</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const isUpcoming = event.event_date && new Date(event.event_date) >= new Date();
                return (
                  <Card
                    key={event.id}
                    className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all overflow-hidden"
                  >
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="h-40 overflow-hidden bg-slate-900">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white text-lg mb-1 line-clamp-2">{event.title}</h3>
                          {event.category && (
                            <Badge className="text-xs">{event.category}</Badge>
                          )}
                        </div>
                        <Badge variant={isUpcoming ? "default" : "secondary"} className="ml-2">
                          {isUpcoming ? 'Upcoming' : 'Past'}
                        </Badge>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        {event.location && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}
                        {event.event_date && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {event.event_time && (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="h-4 w-4" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {event.description && (
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{event.description}</p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                          className="flex-1 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(event.id, event.title)}
                          className="flex-1 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {filteredEvents.length === 0 && (
                <div className="col-span-3 text-center py-12">
                  <Calendar className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">No events found</p>
                  <p className="text-slate-500 text-sm mt-2">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Create your first event to get started'
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* PLANNED EVENTS TAB */}
          <TabsContent value="planned" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CalendarPlus className="h-6 w-6 text-cyan-400" />
                  Upcoming Events
                  <Badge className="bg-cyan-500">{upcomingEvents}</Badge>
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {events
                    .filter(e => e.event_date && new Date(e.event_date) >= new Date())
                    .sort((a, b) => new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime())
                    .map((event) => (
                      <Card key={event.id} className="bg-slate-900/50 border-slate-600 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm mb-1">{event.title}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                              {event.event_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                              )}
                              {event.category && <Badge variant="outline" className="text-xs">{event.category}</Badge>}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(event)} className="h-7 px-2">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {upcomingEvents === 0 && (
                    <p className="text-slate-500 text-center py-8">No upcoming events</p>
                  )}
                </div>
              </Card>

              {/* Completed Events */}
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  Completed Events
                  <Badge className="bg-green-500">{completedEvents}</Badge>
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {events
                    .filter(e => e.event_date && new Date(e.event_date) < new Date())
                    .sort((a, b) => new Date(b.event_date!).getTime() - new Date(a.event_date!).getTime())
                    .map((event) => (
                      <Card key={event.id} className="bg-slate-900/50 border-slate-600 p-3 opacity-75">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm mb-1">{event.title}</h4>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                              {event.event_date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                              )}
                              {event.category && <Badge variant="outline" className="text-xs">{event.category}</Badge>}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id, event.title)} className="h-7 px-2 text-red-400">
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  {completedEvents === 0 && (
                    <p className="text-slate-500 text-center py-8">No completed events</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* REGISTRATIONS TAB */}
          <TabsContent value="registrations" className="mt-0">
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-purple-400" />
                Event Registrations
              </h2>
              <p className="text-sm text-slate-400 mb-6">Track student registrations for all events</p>

              {/* Registration Stats by Event */}
              <div className="space-y-4">
                {events
                  .filter(e => e.event_date && new Date(e.event_date) >= new Date())
                  .map((event) => (
                    <Card key={event.id} className="bg-slate-900/50 border-slate-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{event.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.event_date && new Date(event.event_date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location || 'TBA'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-400">0</div>
                          <div className="text-xs text-slate-500">registrations</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                {events.filter(e => e.event_date && new Date(e.event_date) >= new Date()).length === 0 && (
                  <p className="text-slate-500 text-center py-8">No upcoming events to track registrations</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Event Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Title */}
              <div className="col-span-2">
                <Label className="text-slate-300">Event Title *</Label>
                <Input
                  placeholder="e.g., Annual Campus Hackathon 2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              {/* Date & Time */}
              <div>
                <Label className="text-slate-300">Date *</Label>
                <Input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Time *</Label>
                <Input
                  type="time"
                  value={formData.event_time}
                  onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              {/* Location & Category */}
              <div>
                <Label className="text-slate-300">Location *</Label>
                <Input
                  placeholder="e.g., Main Auditorium"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>
              <div>
                <Label className="text-slate-300">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Image URL */}
              <div className="col-span-2">
                <Label className="text-slate-300">Image URL</Label>
                <Input
                  placeholder="https://example.com/event-image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  placeholder="Describe the event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  rows={3}
                />
              </div>

              {/* Registration Info */}
              <div className="col-span-2">
                <Label className="text-slate-300">Registration Info</Label>
                <Textarea
                  placeholder="How to register..."
                  value={formData.registration_info}
                  onChange={(e) => setFormData({ ...formData, registration_info: e.target.value })}
                  className="bg-slate-800 border-slate-600 text-white mt-1"
                  rows={2}
                />
              </div>

              {/* Publishing Options */}
              <div className="col-span-2 border-t border-slate-700 pt-4">
                <h4 className="text-slate-300 font-semibold mb-3">Publishing Options</h4>
                
                <div className="space-y-3">
                  {/* Publish to Banner */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.publishToBanner}
                      onChange={(e) => setFormData({ ...formData, publishToBanner: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 text-sm">Publish to Banner Slider</span>
                  </label>

                  {/* Publish to Social */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.publishToSocial}
                      onChange={(e) => setFormData({ ...formData, publishToSocial: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-slate-300 text-sm">Publish to Social Wall</span>
                  </label>

                  {/* Channel Selection */}
                  {formData.publishToSocial && (
                    <div className="ml-6">
                      <Label className="text-slate-400 text-xs">Select Channel</Label>
                      <Select
                        value={formData.selectedChannel}
                        onValueChange={(value) => setFormData({ ...formData, selectedChannel: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white mt-1">
                          <SelectValue placeholder="Choose a channel" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700">
                          {channels.map(ch => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-span-2 flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                >
                  {loading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
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

export default EventsImproved;


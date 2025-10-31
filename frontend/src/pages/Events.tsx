import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Beer, Briefcase, Music, Code, Users, Trophy, ArrowLeft, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  location: string;
  event_date: string;
  event_time: string;
  image_url: string;
  category: string;
  likes: number;
  prosts: number;
  description?: string;
  language?: string;
  registration_info?: string;
}

const Events = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      // Filter out events with empty titles
      const validEvents = (data || []).filter((event: Event) => event.title && event.title.trim() !== '');
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "all", name: "All Events", icon: Users },
    { id: "social", name: "Big Beer Cup", icon: Beer },
    { id: "career", name: "Career Scholar", icon: Briefcase },
    { id: "music", name: "Music Fest", icon: Music },
    { id: "tech", name: "Tech & Coding", icon: Code },
    { id: "sports", name: "Sports Arena", icon: Trophy },
  ];

  const trendingCategories = [
    {
      id: "career",
      name: "Career King",
      icon: Briefcase,
      event: "WHZ Career Summit 2025",
      prosts: 521,
      registered: 800,
      likes: 1321,
      gradient: "from-blue-400 to-cyan-400"
    },
    {
      id: "music",
      name: "Rockstar Event",
      icon: Music,
      event: "Spring Music Festival",
      prosts: 634,
      registered: 1250,
      likes: 1842,
      gradient: "from-pink-400 to-orange-400"
    },
    {
      id: "sports",
      name: "Champion Meet",
      icon: Trophy,
      event: "Basketball Championship Finals",
      prosts: 412,
      registered: 650,
      likes: 889,
      gradient: "from-cyan-400 to-blue-400"
    }
  ];

  const allEvents = [
    {
      title: "Career Fair 2025",
      location: "Main Auditorium",
      time: "17:00-19:30",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
      category: "career",
      trending: true
    },
    {
      title: "Oktoberfest Night",
      location: "Campus Garden",
      time: "19:00-23:00",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
      category: "social",
      trending: true
    },
    {
      title: "Tech Meetup",
      location: "Innovation Lab",
      time: "18:00-20:00",
      image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
      category: "tech",
      trending: true
    },
    {
      title: "Music Festival",
      location: "Campus Ground",
      time: "16:00-22:00",
      image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
      category: "music",
      trending: true
    },
    {
      title: "Football Tournament",
      location: "Sports Field",
      time: "15:00-18:00",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
      category: "sports",
      trending: false
    },
    {
      title: "Coding Workshop",
      location: "Computer Lab 3",
      time: "14:00-17:00",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
      category: "tech",
      trending: false
    },
    {
      title: "Job Interview Prep",
      location: "Career Center",
      time: "10:00-12:00",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      category: "career",
      trending: false
    },
    {
      title: "Beer Pong Championship",
      location: "Student Union",
      time: "20:00-23:00",
      image: "https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800&q=80",
      category: "social",
      trending: false
    },
  ];

  const trendingEvents = allEvents.filter(event => event.trending);

  // Filter and search events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event =>
        event.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-6 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center gradient-text mb-4">
            Campus Events
          </h1>
          <p className="text-center text-muted-foreground mb-6">
            Discover and join exciting events on campus
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search events by title, location, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-6 text-base search-input"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <button
              onClick={() => setSelectedCategory("all")}
              className={`filter-chip ${selectedCategory === "all" ? "active" : ""}`}
            >
              All Events
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`filter-chip ${selectedCategory === cat.id ? "active" : ""} flex items-center gap-2`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== "all"
                ? "No events match your search criteria."
                : "No events available yet."}
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                time={event.event_time}
                image={event.image_url}
                category={event.category}
                initialLikes={event.likes}
                initialProsts={event.prosts}
                description={event.description}
                language={event.language}
                registrationInfo={event.registration_info}
                eventDate={event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : undefined}
              />
            ))}
          </div>
        )}

        {/* Results Count */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;

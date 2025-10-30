import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import EventCard from "./EventCard";
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

const TrendingEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(4);

      if (error) throw error;
      // Filter out events with empty titles
      const validEvents = (data || []).filter(e => e.title && e.title.trim() !== '');
      setEvents(validEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <h3 className="text-2xl font-bold gradient-text mb-6">Upcoming Events</h3>
        <p className="text-center text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Upcoming Events
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-2">No upcoming events yet.</p>
        ) : (
          events.map((event) => (
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
              }) : 'Date TBD'}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TrendingEvents;

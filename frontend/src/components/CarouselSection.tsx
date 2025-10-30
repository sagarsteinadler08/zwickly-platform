import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, UtensilsCrossed, Calendar, Newspaper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchMensaSchedule, MensaMeal } from "@/lib/mensaApi";
import { fetchCampusNews, NewsItem } from "@/lib/newsApi";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  location: string;
  event_date: string;
  event_time: string;
  image_url: string;
  category: string;
  description?: string;
}

const CarouselSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mensaMeals, setMensaMeals] = useState<MensaMeal[]>([]);
  const [loadingMensa, setLoadingMensa] = useState(true);
  const [campusNews, setCampusNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const loadMensaData = async () => {
      setLoadingMensa(true);
      const meals = await fetchMensaSchedule();
      setMensaMeals(meals);
      setLoadingMensa(false);
    };
    
    loadMensaData();
  }, []);

  useEffect(() => {
    const loadNewsData = async () => {
      setLoadingNews(true);
      const news = await fetchCampusNews();
      setCampusNews(news);
      setLoadingNews(false);
    };
    
    loadNewsData();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      setLoadingEvents(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })
          .limit(6);
        
        if (error) throw error;
        // Filter out events with empty titles
        const validEvents = (data || []).filter(e => e.title && e.title.trim() !== '');
        setEvents(validEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    
    loadEvents();
  }, []);

  const slides = [
    {
      title: "🥗 Mensa Menu",
      subtitle: "Delicious meals at student-friendly prices. Fresh ingredients daily with vegetarian and vegan options available.",
      icon: UtensilsCrossed,
      color: "from-green-500/20 to-emerald-500/20",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-primary">Today's Menu</h4>
          {loadingMensa ? (
            <div className="text-center text-muted-foreground py-8">Loading menu...</div>
          ) : mensaMeals.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No menu available today</div>
          ) : (
            <div className="grid gap-4">
              {mensaMeals.map((meal, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/20 border border-primary/10">
                  <div className="flex gap-4">
                    {meal.imageUrl && (
                      <img 
                        src={meal.imageUrl} 
                        alt={meal.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{meal.title}</p>
                        {meal.isVegetarian && (
                          <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                            🌱 Veggie
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                      <div className="flex gap-3 text-xs text-primary">
                        <span>S: {meal.priceSmall}</span>
                        <span>M: {meal.priceMedium}</span>
                        <span>G: {meal.priceLarge}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: "🎉 Upcoming Events",
      subtitle: "Join exciting campus events, workshops, and networking opportunities. Connect with fellow students and industry professionals.",
      icon: Calendar,
      color: "from-blue-500/20 to-cyan-500/20",
      image: events.length > 0 && events[0]?.image_url ? events[0].image_url : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      content: (
        <div className="space-y-4">
          <h4 className="font-semibold text-lg text-primary">Upcoming Events</h4>
          {loadingEvents ? (
            <div className="text-center text-muted-foreground py-8">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No upcoming events yet. Check back soon!</div>
          ) : (
            <div className="grid gap-3">
              {events.map((event) => {
                const eventDate = event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Date TBD';
                return (
                  <div key={event.id} className="p-4 rounded-lg bg-muted/20 border border-primary/10 hover:border-primary/30 transition-all">
                    <div className="flex gap-4">
                      {event.image_url && (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-foreground mb-1">{event.title || 'Untitled Event'}</p>
                        <p className="text-sm text-muted-foreground mb-1">{eventDate} {event.event_time ? `• ${event.event_time}` : ''}</p>
                        {event.location && (
                          <p className="text-sm text-muted-foreground mb-2">📍 {event.location}</p>
                        )}
                        {event.category && (
                          <span className="inline-block text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                            {event.category}
                          </span>
                        )}
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )
    },
    {
      title: "📰 Campus News",
      subtitle: "Stay informed with the latest campus announcements, facility updates, and important notices for the student community.",
      icon: Newspaper,
      color: "from-purple-500/20 to-pink-500/20",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
      content: (
        <div className="space-y-4">
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg text-primary">Recent News</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://www.whz.de/hochschule/informationen/pressemitteilungen/?no_cache=1', '_blank')}
                className="text-xs hover:bg-primary/10"
              >
                View All News →
              </Button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stay up to date with the latest announcements, research achievements, events, and important updates from WHZ. 
              Get insights into campus developments, student activities, and academic excellence.
            </p>
          </div>
          {loadingNews ? (
            <div className="text-center text-muted-foreground py-8">Loading news...</div>
          ) : (
            <div className="grid gap-4">
              {(campusNews.length ? campusNews : [
                {
                  id: "fallback-1",
                  title: "Visit the WHZ News Portal",
                  summary: "Latest campus updates, events and research highlights from Westsächsische Hochschule Zwickau.",
                  imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop"
                }
              ]).map((news) => (
                <div key={news.id} className="p-4 rounded-lg bg-muted/20 border border-primary/10 hover:border-primary/30 transition-all">
                  <div className="flex gap-4">
                    {news.imageUrl && (
                      <img 
                        src={news.imageUrl} 
                        alt={news.title}
                        className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-2">{news.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{news.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto-play carousel - DISABLED
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     nextSlide();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, [currentSlide]);

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <Card className="event-carousel-card hover-glow p-6 animate-fade-in">
      <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border border-white/60 shadow-xl`}>
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
        />
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-accent">
                  <CurrentIcon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl font-bold gradient-text">{slides[currentSlide].title}</h3>
              </div>
              <p className="text-gray-700 text-base leading-relaxed max-w-2xl">{slides[currentSlide].subtitle}</p>
            </div>
          
            <div className="flex items-center gap-3 ml-6">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                className="rounded-full bg-white/80 backdrop-blur-sm border-white/60 hover:bg-white/90 hover:scale-110 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-primary" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                className="rounded-full bg-white/80 backdrop-blur-sm border-white/60 hover:bg-white/90 hover:scale-110 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>

          <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all font-semibold px-6 py-3">
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur-xl border-primary/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="gradient-text text-xl">{slides[currentSlide].title}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[500px] pr-4">
              {slides[currentSlide].content}
            </ScrollArea>
          </DialogContent>
        </Dialog>

          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? "bg-gradient-to-r from-primary to-accent w-10 h-2 shadow-md" 
                    : "bg-gray-300 w-2 h-2 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CarouselSection;

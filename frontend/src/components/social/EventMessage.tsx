import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface EventMessageProps {
  event: {
    title: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    imageUrl?: string;
  };
}

const EventMessage: React.FC<EventMessageProps> = ({ event }) => {
  return (
    <div className="bg-white border-2 border-purple-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {event.imageUrl && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
            📅 EVENT
          </div>
        </div>
      )}
      
      <div className="p-4 space-y-3">
        <h3 className="font-bold text-lg text-gray-900">{event.title}</h3>
        
        {event.description && (
          <p className="text-sm text-gray-600">{event.description}</p>
        )}
        
        <div className="space-y-2 pt-2 border-t border-gray-200">
          {event.date && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>{event.date}</span>
            </div>
          )}
          
          {event.time && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>{event.time}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Register for Event
        </button>
      </div>
    </div>
  );
};

export default EventMessage;


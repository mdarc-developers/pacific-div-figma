import { Conference } from '@/types/conference';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface ConferenceHeaderProps {
  conference: Conference;
}

export function ConferenceHeader({ conference }: ConferenceHeaderProps) {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    };
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'long' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{conference.name}</h1>
      
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>{formatDateRange(conference.startDate, conference.endDate)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <span>{conference.venue} - {conference.location}</span>
        </div>
        
        <a 
          href={conference.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Visit Conference Website</span>
        </a>
      </div>
    </div>
  );
}

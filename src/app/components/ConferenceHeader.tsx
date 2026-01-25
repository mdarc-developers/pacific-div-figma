import { Conference } from '@/types/conference';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface ConferenceHeaderProps {
  conference: Conference;
}

function formatHeaderFull(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat ('en-US', {
    timeZone: tzString,
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return timeFormatter.format(isoDate);
}

function formatHeaderMonth(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat ('en-US', {
    timeZone: tzString,
    month: 'long',
  });
  return timeFormatter.format(isoDate);
};

// had tz difficulties, used split instead
//function formatHeaderDay(isoDate: Date, tzString: string) {
//  const timeFormatter = new Intl.DateTimeFormat ('en-US', {
//    timeZone: tzString,
//    day: 'numeric',
//  });
//  return timeFormatter.format(isoDate);
//};

function formatHeaderYear(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat ('en-US', {
    timeZone: tzString,
    year: 'numeric'
  });
  return timeFormatter.format(isoDate);
}

export function ConferenceHeader({ conference }: ConferenceHeaderProps) {
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDateNum = start.split('-')[2];
    const endDateNum = end.split('-')[2];
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${formatHeaderMonth(startDate, conference.timezone)} ${startDateNum}-${endDateNum}, ${formatHeaderYear(startDate, conference.timezone)}`;
    }

    return `${formatHeaderFull(startDate, conference.timezone)} - ${formatHeaderFull(endDate, conference.timezone)}`;
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
      </div>
    </div>
  );
}

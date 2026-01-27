import { useState } from 'react';
import { Conference } from '@/types/conference';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
interface ConferenceHeaderProps {
  conference: Conference;
  onToggleHeaderCollapsed?: (setHeaderCollapsed: boolean) => void;
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

export function ConferenceHeader({ conference, onToggleHeaderCollapsed }: ConferenceHeaderProps) {
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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  return (
  <div className="flex items-center gap-2">
    <button
    onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
    className="text-gray-600 hover:text-gray-900 transition-colors align-top self-stretch"
    aria-label={isHeaderCollapsed ? "Expand" : "Collapse"
    }
  >
    <svg
      className={`w-5 h-5 transition-transform flex ${isHeaderCollapsed ? '-rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg> </button>
    
    <div className="mb-6">
      {isHeaderCollapsed ? (
      <h1 className="text-3xl md:text-4xl font-bold">{conference.name}</h1>
    ) : (
      <>
      <h1 className="text-3xl md:text-4xl font-bold mb-3">{conference.name}
        &nbsp;&nbsp;<a 
          href={conference.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
        <ExternalLink className="h-4 w-4" />
        website
        </a>
      </h1>
      
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span>{formatDateRange(conference.startDate, conference.endDate)}
            &nbsp;<a
                href="/pacificon-2026.ics"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
              <ExternalLink className="h-4 w-4" />
              iCal
            </a>
            &nbsp;<a
                href="https://calendar.google.com/calendar/event?action=TEMPLATE&amp;tmeid=MW9yajdlbDEwNmYwczN2bzl1aTM0OGwzbDEgZ3JhbnRib3dAbWRhcmMub3Jn&amp;tmsrc=grantbow%40mdarc.org"
                target="_blank"
                rel="noopener noreferrer"
              >
              <img
                src="https://calendar.google.com/calendar/images/ext/gc_button1_en.gif"
                alt="Google Calendar"
              />
            </a>
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span><a
            href={conference.venueWebsite} target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline">
              <ExternalLink className="h-4 w-4" />
            {conference.venue}</a>,
            &nbsp;{conference.location}
            &nbsp;&nbsp;<a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location) || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
              <ExternalLink className="h-4 w-4" />
              <MapPin className="flex h-5 w-5" />map
            </a>
            &nbsp;&nbsp;{conference.venueGPS}
            &nbsp;&nbsp;{conference.venueGridsquare}
          </span>
        </div>
      </div>
      </>
    )}
    </div>
    </div>
  );
}

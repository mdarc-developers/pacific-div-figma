import { useState } from 'react';
import { Conference } from '@/types/conference';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
interface ConferenceHeaderProps {
  conference: Conference;
  onToggleHeaderCollapsed?: (setHeaderCollapsed: boolean) => void;
}

function formatHeaderFull(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tzString,
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  return timeFormatter.format(isoDate);
}

function formatHeaderMonth(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
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
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tzString,
    year: 'numeric'
  });
  return timeFormatter.format(isoDate);
}

function contrastingColor(color: string) {
  // Convert hex to RGB array if needed (example function below)
  const rgb = (typeof color === 'string') ? hexToRGBArray(color) : color;
  // Calculate Luma (brightness)
  const luma = (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
  // Use black text if the background is light, white text if the background is dark
  return (luma >= 165) ? '#000000' : '#FFFFFF';
}
function hexToRGBArray(hex: string) {
  if (hex.startsWith('#')) hex = hex.substring(1);
  if (hex.length === 3) hex = hex.replace(/./g, '$&$&'); // Expand shorthand
  if (hex.length !== 6) throw new Error(`Invalid HEX color: ${hex}`);
  const rgb = [];
  for (let i = 0; i <= 2; i++) {
    rgb[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return rgb;
}

//export function ConferenceHeader({ conference, onToggleHeaderCollapsed }: ConferenceHeaderProps) {
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
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const headerTextColor = contrastingColor(conference.primaryColor);

  return (
    <div className="flex items-center gap-2 px-2">
      <button
        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        className="bg-muted hover:text-gray-900 transition-colors self-stretch rounded-xl mb-3"
        aria-label={isHeaderCollapsed ? "Expand" : "Collapse"}
      >
        <svg
          className={`w-5 h-5 transition-transform flex ${isHeaderCollapsed ? '-rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg> </button>

      <div className="mb-6 self-stretch w-full rounded-xl p-4"
        style={{ backgroundColor: conference.primaryColor, color: headerTextColor }}
      >
        {isHeaderCollapsed ? (
          <h1 className="text-3xl md:text-4xl font-bold">{conference.name}</h1>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{conference.name}
              &nbsp;&nbsp;<a
                href={conference.venueWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                website<ExternalLink className="h-4 w-4" />
              </a>
            </h1>

            <div className="space-y-2"
              // text-gray-700 dark:text-gray-300"
              style={{ backgroundColor: conference.primaryColor, color: headerTextColor }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDateRange(conference.startDate, conference.endDate)}
                  &nbsp;<a
                    href={conference.icalUrl}
                    download
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    &nbsp;iCal<ExternalLink className="h-4 w-4" />
                  </a>
                  &nbsp;&nbsp;&nbsp;<a
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
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {conference.venue}<ExternalLink className="h-4 w-4" /></a>,
                  &nbsp;{conference.location}
                  &nbsp;&nbsp;<a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(conference.location) || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <MapPin className="flex h-5 w-5" />map<ExternalLink className="h-4 w-4" />
                  </a>
                  &nbsp;&nbsp;&nbsp;{conference.venueGPS}
                  &nbsp;&nbsp;&nbsp;{conference.venueGridsquare}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

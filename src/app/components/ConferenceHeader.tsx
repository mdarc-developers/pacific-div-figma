import { useState } from 'react';
import { Conference } from '@/types/conference';
import { Bell, ChevronDown, Calendar, ExternalLink, MapPin, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { useConference } from '@/app/contexts/ConferenceContext';
import { NavLink } from 'react-router-dom';


//import { forwardRef } from 'react';
//
//const Button = forwardRef<HTMLButtonElement, ButtonProps>(
//  ({ className, variant, size, ...props }, ref) => {
//    return (
//      <button
//        ref={ref}
//        className={/* your classes */}
//        {...props}
//      />
//    );
//  }
//);
//
//Button.displayName = 'Button';
//
//export { Button };

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

function contrastingLinkColor(color: string) {
  // Convert hex to RGB array if needed (example function below)
  const rgb = (typeof color === 'string') ? hexToRGBArray(color) : color;
  // Calculate Luma (brightness)
  const luma = (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]);
  // Use black text if the background is light, white text if the background is dark
  //    light 155dfc blue-600 oklch(54.6% 0.245 262.881)
  // or dark  9098dc blue-400 oklch(70.7% 0.165 254.624)
  return (luma >= 165) ? '#155dfc' : '#9098dc';
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

export function ConferenceHeader() {

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { activeConference, allConferencesList, setActiveConference } = useConference();

  const headerTextColor = contrastingColor(activeConference.primaryColor);
  const headerLinkColor = contrastingLinkColor(activeConference.primaryColor);

  const icalUrlDisplay = (iurl: string) => {
    if (iurl === '')
      return '';
    else
      return <a
        href={iurl}
        download
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline"
        style={{ color: headerLinkColor }}
      >
        &nbsp;iCal<ExternalLink className="h-4 w-4" />
      </a>;
  };
  const googlecalUrlDisplay = (gurl: string) => {
    if (gurl === '')
      return '';
    else
      return <a
        href={gurl}
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          src="https://calendar.google.com/calendar/images/ext/gc_button1_en.gif"
          alt="Google Calendar"
        />
      </a>;
  };
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDateNum = start.split('-')[2];
    const endDateNum = end.split('-')[2];

    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${formatHeaderMonth(startDate, activeConference.timezone)} ${startDateNum}-${endDateNum}, ${formatHeaderYear(startDate, activeConference.timezone)}`;
    }

    return `${formatHeaderFull(startDate, activeConference.timezone)} - ${formatHeaderFull(endDate, activeConference.timezone)}`;
  };

  const isUpcoming = (conference: Conference) => {
    const startDate = new Date(conference.startDate);
    const today = new Date();
    return startDate > today;
  };

  const isCurrent = (conference: Conference) => {
    const startDate = new Date(conference.startDate);
    const endDate = new Date(conference.endDate);
    const today = new Date();
    return today >= startDate && today <= endDate;
  };

  const handleSelectConference = (conference: Conference) => {
    //onSelectConference(conference);
    setActiveConference(conference);
    //console.log(conference);
    setIsSelectOpen(false);
  };

  const navItems = [
    { to: '/alerts', icon: Bell, label: 'Alert' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex items-center gap-2 px-2">
      <button
        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
        className="bg-muted hover:text-gray-900 transition-colors self-stretch rounded-xl mb-3"
        aria-label={isHeaderCollapsed ? "Expand" : "Collapse"}
        title="Collapse / Expand"
      >
        <svg
          className={`w-5 h-5 transition-transform flex ${isHeaderCollapsed ? '-rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`mb-6 self-stretch w-full rounded-xl p-4 ${isHeaderCollapsed ?
        'cursor-pointer hover:opacity-90 transition-opacity' :
        ''}`}
        style={{ backgroundColor: activeConference.primaryColor, color: headerTextColor }}
        onClick={isHeaderCollapsed ? () => setIsHeaderCollapsed(false) : undefined}
      >
        {isHeaderCollapsed ? (
          <h1 className="text-3xl md:text-4xl font-bold">{activeConference.name}</h1>
        ) : (
          <>
            <div className="flex self-stretch w-full">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 flex">{activeConference.name}
                  &nbsp;&nbsp;<a
                    href={activeConference.conferenceWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: headerLinkColor }}
                  >
                    website<ExternalLink className="h-4 w-4" />
                  </a>
                </h1>
              </div>
              {(activeConference.logoUrl && !isHeaderCollapsed) ? (
                <a
                  href={activeConference.conferenceWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline"
                  style={{ color: headerLinkColor }}
                >
                  <img src={activeConference.logoUrl} alt="Conference Logo"></img>
                </a>
              ) : ""}
              <div className="ml-auto">

                <Dialog open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 max-w-[200px] sm:max-w-none"
                    >
                      <span className="truncate">{activeConference.name}</span>
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Select Conference</DialogTitle>
                      <DialogDescription>
                        Amateur radio
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                      {allConferencesList.map((conference) => {
                        const isActive = conference.id === activeConference.id;
                        const upcoming = isUpcoming(conference);
                        //const upcoming = true;
                        const current = isCurrent(conference);
                        //const current = true;

                        return (
                          <Card
                            key={conference.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${isActive ?
                              'ring-2 ring-blue-500' :
                              ''
                              }`}
                            onClick={() => handleSelectConference(conference)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <h3 className="font-semibold text-lg">
                                      {conference.name}
                                    </h3>
                                    {current && (
                                      <Badge className="bg-green-600">
                                        Currently Active
                                      </Badge>
                                    )}
                                    {upcoming && !current && (
                                      <Badge variant="secondary">
                                        Upcoming
                                      </Badge>
                                    )}
                                    {!upcoming && !current && (
                                      <Badge variant="outline">
                                        Past Event
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">

                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {formatDateRange(conference.startDate, conference.endDate)}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 flex-shrink-0" />
                                      <span className="truncate">
                                        {conference.venue}<br />{conference.location}
                                      </span>
                                    </div>


                                  </div>

                                </div>

                                {isActive && (
                                  <div className="flex-shrink-0">
                                    <Badge variant="default">
                                      Selected
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="space-y-2"
              // text-gray-700 dark:text-gray-300"
              style={{ backgroundColor: activeConference.primaryColor, color: headerTextColor }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDateRange(activeConference.startDate, activeConference.endDate)}
                  &nbsp;
                  {icalUrlDisplay(activeConference.icalUrl)}
                  &nbsp;&nbsp;&nbsp;
                  {googlecalUrlDisplay(activeConference.googlecalUrl)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span><a
                  href={activeConference.venueWebsite}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="flex items-center gap-2 hover:underline"
                  style={{ color: headerLinkColor }}
                >
                  {activeConference.venue}<ExternalLink className="h-4 w-4" /></a>,
                  &nbsp;{activeConference.location}
                  &nbsp;&nbsp;<a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeConference.location) || ''}`}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="flex items-center gap-2 hover:underline"
                    style={{ color: headerLinkColor }}
                  >
                    <MapPin className="flex h-5 w-5" />map<ExternalLink className="h-4 w-4" />
                  </a>
                  &nbsp;&nbsp;&nbsp;{activeConference.venueGPS}
                  &nbsp;&nbsp;&nbsp;{activeConference.venueGridSquare}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `self-stretch mb-3 flex flex-col items-center justify-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors ${isActive
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium'
            }`
          }
        >
          <Icon className="" size={30} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div> // container
  ); // return
} // export function ConferenceHeader


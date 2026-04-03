import {
  Bell,
  Calendar,
  ExternalLink,
  FileDown,
  MapPin,
  User,
} from "lucide-react";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useHeaderCollapsed } from "@/app/contexts/HeaderCollapsedContext";
import { NavLink } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { contrastingColor, secondaryLinkColor } from "@/lib/colorUtils";
import { formatDateRange } from "@/lib/dateUtils";
import { ConferenceHeaderSelector } from "@/app/components/ConferenceHeaderSelector";

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

// had tz difficulties, used split instead
//function formatHeaderDay(isoDate: Date, tzString: string) {
//  const timeFormatter = new Intl.DateTimeFormat ('en-US', {
//    timeZone: tzString,
//    day: 'numeric',
//  });
//  return timeFormatter.format(isoDate);
//};

export function ConferenceHeader() {
  const { isHeaderCollapsed, setIsHeaderCollapsed } = useHeaderCollapsed();
  const { activeConference } = useConference();

  const headerTextColor = contrastingColor(activeConference.primaryColor);
  const headerLinkColor = secondaryLinkColor(
    activeConference.primaryColor,
    activeConference.secondaryColor,
  );

  // --- URL display helpers ---

  const venueUrlDisplay = (iurl: string) => {
    if (!iurl || iurl === "") return "";
    else
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={iurl}
              rel="noopener noreferrer"
              target="_blank"
              className="flex items-center gap-2 hover:underline"
              style={{ color: headerLinkColor }}
            >
              {activeConference.venue}
              <ExternalLink className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Venue Website</TooltipContent>
        </Tooltip>
      );
  };

  const conferenceProgramUrlDisplay = (iurl: string, linkcolor: string) => {
    if (!iurl || iurl === "") return "";
    const isLocal = iurl.startsWith("/");
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={iurl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
            style={{ color: linkcolor }}
          >
            program
            {isLocal ? (
              <FileDown className="h-4 w-4" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
          </a>
        </TooltipTrigger>
        <TooltipContent>
          {isLocal
            ? "Conference Program (locally cached)"
            : "Conference Program"}
        </TooltipContent>
      </Tooltip>
    );
  };

  const conferenceAppPageUrlDisplay = (iurl: string, linkcolor: string) => {
    if (!iurl || iurl === "") return "";
    else
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={iurl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
              style={{ color: linkcolor }}
            >
              app
              <ExternalLink className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Conference App</TooltipContent>
        </Tooltip>
      );
  };

  const icalUrlDisplay = (iurl: string) => {
    if (!iurl || iurl === "") return "";
    else
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={iurl}
              download
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:underline"
              style={{ color: headerLinkColor }}
            >
              &nbsp;iCal
              <ExternalLink className="h-4 w-4" />
            </a>
          </TooltipTrigger>
          <TooltipContent>Download iCal / Add to Calendar</TooltipContent>
        </Tooltip>
      );
  };

  const googlecalUrlDisplay = (gurl: string) => {
    if (!gurl || gurl === "") return "";
    else
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <a href={gurl} rel="noopener noreferrer" target="_blank">
              <img
                src="https://calendar.google.com/calendar/images/ext/gc_button1_en.gif"
                alt="Google Calendar"
              />
            </a>
          </TooltipTrigger>
          <TooltipContent>Add to Google Calendar</TooltipContent>
        </Tooltip>
      );
  };

  const googleMapsUrlDisplay = (location: string) => {
    if (!location || location === "") return "";
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center gap-2 hover:underline"
            style={{ color: headerLinkColor }}
          >
            map
            <MapPin className="h-5 w-5" />
          </a>
        </TooltipTrigger>
        <TooltipContent>Open in Google Maps</TooltipContent>
      </Tooltip>
    );
  };


  // --- Navigation items ---

  const navItems = [
    { to: "/alerts", icon: Bell, label: "Alert" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  // --- Render functions for major header sections ---

  // Collapse/expand toggle button (chevron)
  const renderCollapseButton = () => (
    <button
      onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
      className="bg-muted hover:text-gray-900 transition-colors self-stretch rounded-xl mb-3"
      aria-label={isHeaderCollapsed ? "Expand" : "Collapse"}
      title="Collapse / Expand"
    >
      <svg
        className={`w-5 h-5 transition-transform flex ${isHeaderCollapsed ? "-rotate-90" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );

  // Conference name with website link, logo, and conference selector dropdown
  const renderNameAndLogoRow = () => (
    <div className="flex justify-between items-start flex-wrap self-stretch w-full gap-3">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 flex">
          {activeConference.name}
          &nbsp;&nbsp;
          {/* Conference website link */}
          <a
            href={activeConference.conferenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
            style={{ color: headerLinkColor }}
          >
            website
            <ExternalLink className="h-4 w-4" />
          </a>
        </h1>
      </div>

      {/* Conference official app link (optional) */}
      {conferenceAppPageUrlDisplay(
        activeConference.conferenceAppPageUrl,
        headerLinkColor,
      )}

      {/* Conference logo (linked to website) */}
      {activeConference.logoUrl && !isHeaderCollapsed ? (
        <a
          href={activeConference.conferenceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline"
          style={{ color: headerLinkColor }}
        >
          <img
            src={activeConference.logoUrl}
            alt="Conference Logo"
            className="h-20 w-auto"
          ></img>
        </a>
      ) : (
        ""
      )}

      {/* Conference selector dropdown */}
      <ConferenceHeaderSelector />
    </div>
  );

  // Date range with iCal download and Google Calendar links
  const renderDateRow = () => (
    <div className="flex items-center gap-4">
      <Calendar className="h-5 w-5" />
      <span>
        {formatDateRange(activeConference.startDate, activeConference.endDate, activeConference.timezoneNumeric, activeConference.timezone)}
      </span>
      <span>
        {/* Year first established */}
        {activeConference.firstConferenceYear && (
          <>
            &nbsp;&nbsp;&nbsp;established {activeConference.firstConferenceYear}
          </>
        )}
      </span>
      <span>
        {/* iCal download link */}
        {icalUrlDisplay(activeConference.icalUrl)}
        &nbsp;&nbsp;
        {/* Add to Google Calendar link */}
        {googlecalUrlDisplay(activeConference.googlecalUrl)}
      </span>
    </div>
  );

  // Venue name/link, city location, Google Maps link, GPS coords, Maidenhead grid square, app/program links
  const renderLocationRow = () => (
    <div className="flex items-start gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1">
          {/* Venue name linked to venue website */}
          {venueUrlDisplay(activeConference.venueUrl)}
        </span>
        <span className="flex items-center gap-1">
          {/* City/location text */}
          {activeConference.location}
        </span>
        <span className="flex items-center gap-1">
          {/* Google Maps link */}
          {googleMapsUrlDisplay(activeConference.location)}
        </span>
        <div>
          {/* GPS coordinates */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span title="GPS Coordinates">{activeConference.venueGPS}</span>
            </TooltipTrigger>
            <TooltipContent>GPS Coordinates</TooltipContent>
          </Tooltip>
          {/* Maidenhead grid square */}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                //href={`https://www.levinecentral.com/ham/grid_square.php?Grid=${encodeURIComponent(activeConference.venueGridSquare)}`}
                href={`https://www.karhukoti.com/maidenhead-grid-square-locator/?grid=${encodeURIComponent(activeConference.venueGridSquare)}`}
                rel="noopener noreferrer"
                target="_blank"
                className="hover:underline"
                style={{ color: headerLinkColor }}
                title="Maidenhead Gridsquare"
              >
                {activeConference.venueGridSquare}
              </a>
            </TooltipTrigger>
            <TooltipContent>Maidenhead Gridsquare</TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {/* Conference printed program links */}
          {conferenceProgramUrlDisplay(
            activeConference.conferenceProgramUrl,
            headerLinkColor,
          )}
        </div>
      </div>
    </div>
  );

  // Sidebar navigation links (Alert, Profile)
  const renderNavLinks = () => (
    <>
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          title={label}
          className={({ isActive }) =>
            `self-stretch mb-3 flex flex-col items-center justify-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-md transition-colors ${
              isActive
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm font-medium"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium"
            }`
          }
        >
          <Icon className="" size={30} />
          <span>{label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="flex items-center gap-4 px-4">
      {/* Collapse/expand toggle button */}
      {renderCollapseButton()}

      {/* Main header panel (colored by conference primary color) */}
      <div
        className={`mb-6 self-stretch w-full rounded-xl p-6 ${
          isHeaderCollapsed
            ? "cursor-pointer hover:opacity-90 transition-opacity"
            : ""
        }`}
        style={{
          backgroundColor: activeConference.primaryColor,
          color: headerTextColor,
        }}
        onClick={
          isHeaderCollapsed ? () => setIsHeaderCollapsed(false) : undefined
        }
      >
        {isHeaderCollapsed ? (
          // Collapsed view: conference name only
          <h1 className="text-3xl md:text-4xl font-bold">
            {activeConference.name}
          </h1>
        ) : (
          // Expanded view: full conference details
          <>
            {/* Row 1: name, website, logo, conference selector */}
            {renderNameAndLogoRow()}

            <div
              className="space-y-2"
              style={{
                backgroundColor: activeConference.primaryColor,
                color: headerTextColor,
              }}
            >
              {/* Row 2: date range with calendar links */}
              {renderDateRow()}

              {/* Row 3: venue, location, GPS, grid square, program links */}
              {renderLocationRow()}
            </div>
          </>
        )}
      </div>

      {/* Sidebar nav links: Alert, Profile */}
      {renderNavLinks()}
    </div> // container
  ); // return
} // export function ConferenceHeader

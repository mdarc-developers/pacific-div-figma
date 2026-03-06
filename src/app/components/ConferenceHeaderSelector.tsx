import { useState } from "react";
import { Conference } from "@/types/conference";
import {
  ChevronDown,
  Calendar,
  MapPin,
  MonitorCog,
  Moon,
  Sun,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { useConference } from "@/app/contexts/ConferenceContext";
import { useTheme, type Theme } from "@/app/contexts/ThemeContext";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import { contrastingColor } from "@/lib/colorUtils";

function formatHeaderFull(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return timeFormatter.format(isoDate);
}

function formatHeaderMonth(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    month: "long",
  });
  return timeFormatter.format(isoDate);
}

function formatHeaderYear(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    year: "numeric",
  });
  return timeFormatter.format(isoDate);
}

export function ConferenceHeaderSelector() {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const { theme, setTheme } = useTheme();

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const startDateNum = start.split("-")[2];
    const endDateNum = end.split("-")[2];

    if (
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()
    ) {
      return `${formatHeaderMonth(startDate, activeConference.timezone)} ${startDateNum}-${endDateNum}, ${formatHeaderYear(startDate, activeConference.timezone)}`;
    }

    return `${formatHeaderFull(startDate, activeConference.timezone)} - ${formatHeaderFull(endDate, activeConference.timezone)}`;
  };

  const isUpcoming = (conference: Conference) => {
    const startDate = new Date(
      `${conference.startDate}T00:00:00${conference.timezoneNumeric}`,
    );
    const today = new Date();
    return startDate > today;
  };

  const isCurrent = (conference: Conference) => {
    const startDate = new Date(
      `${conference.startDate}T00:00:00${conference.timezoneNumeric}`,
    );
    const endDate = new Date(
      `${conference.endDate}T23:59:59${conference.timezoneNumeric}`,
    );
    const today = new Date();
    return today >= startDate && today <= endDate;
  };

  const handleSelectConference = (conference: Conference) => {
    setActiveConference(conference);
    setIsSelectOpen(false);
  };

  return (
    <div className="ml-auto flex flex-col items-end gap-2">
      {/* Conference Selector (top) */}
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
            <DialogDescription>Amateur radio</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {allConferencesList.map((conference, index) => {
              if (conference.id === "---") {
                return (
                  <Card
                    key={`separator-${index}`}
                    className="border-0 shadow-lg pointer-events-none"
                    style={{ backgroundColor: activeConference.primaryColor }}
                  >
                    <CardContent className="px-4 py-4">
                      <hr className="border-t-2" style={{ borderColor: contrastingColor(activeConference.primaryColor) }} />
                      <hr className="border-t-2 mt-3" style={{ borderColor: contrastingColor(activeConference.primaryColor) }} />
                    </CardContent>
                  </Card>
                );
              }

              const isActive = conference.id === activeConference.id;
              const upcoming = isUpcoming(conference);
              const current = isCurrent(conference);

              return (
                <Card
                  key={conference.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isActive ? "ring-2 ring-blue-500" : ""
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
                              {formatDateRange(
                                conference.startDate,
                                conference.endDate,
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">
                              {conference.venue}
                              <br />
                              {conference.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex-shrink-0">
                          <Badge variant="default">Selected</Badge>
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
      {/* NEW: 3-way theme toggle */}
      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(value) => {
          // Radix returns "" when deselecting; ignore that.
          if (!value) return;
          setTheme(value as Theme);
        }}
        variant="outline"
        size="sm"
        aria-label="Theme"
        className="bg-white/30 dark:bg-black/20 backdrop-blur-sm"
      >
        <ToggleGroupItem
          value="light"
          aria-label="Light theme"
          title="Light theme"
        >
          <Sun className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="system"
          aria-label="System theme"
          title="System Theme"
        >
          <MonitorCog className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          aria-label="Dark theme"
          title="Dark theme"
        >
          <Moon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

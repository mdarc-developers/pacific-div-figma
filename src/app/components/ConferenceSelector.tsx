import { useState } from 'react';
import { Conference } from '@/types/conference';
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
import { ChevronDown, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

interface ConferenceSelectorProps {
  conferences: Conference[];
  activeConference: Conference;
  onSelectConference: (conference: Conference) => void;
}

export function ConferenceSelector({ 
  conferences, 
  activeConference, 
  onSelectConference 
}: ConferenceSelectorProps) {
  const [open, setOpen] = useState(false);

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.toLocaleDateString('en-US', { month: 'short' })} ${startDate.getDate()}-${endDate.getDate()}, ${startDate.getFullYear()}`;
    }
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
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
    onSelectConference(conference);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Choose which amateur radio conference to view
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {conferences.map((conference) => {
            const isActive = conference.id === activeConference.id;
            const upcoming = isUpcoming(conference);
            const current = isCurrent(conference);
            
            return (
              <Card 
                key={conference.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500' : ''
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
                            {conference.venue}, {conference.location}
                          </span>
                        </div>
                        
                        <a 
                          href={conference.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Website</span>
                        </a>
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
  );
}
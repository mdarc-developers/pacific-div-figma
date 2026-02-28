import { useRef, useEffect } from "react";
import { useState } from "react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Bookmark, MapPin } from "lucide-react";
import { Exhibitor } from "@/types/conference";
//import { EventInput } from "@fullcalendar/core";
import { useConference } from "@/app/contexts/ConferenceContext";

interface ExhibitorViewProps {
  bookmarkedExhibitors?: string[];
  onToggleBookmark?: (exhibitorId: string) => void;
  highlightExhibitorId?: string;
}

// NEW: Separate component for individual exhibitor
interface ExhibitorCardProps {
  exhibitor: Exhibitor;
  isBookmarked: boolean;
  isHighlighted: boolean;
  onToggleBookmark?: (exhibitorId: string) => void;
}

function ExhibitorCard({
  exhibitor,
  isBookmarked,
  isHighlighted,
  onToggleBookmark,
}: ExhibitorCardProps) {
  const exhibitorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && exhibitorRef.current) {
      exhibitorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={exhibitorRef}
      id={`${exhibitor.id}`}
      className={`mb-4 transition-all ${
        isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""
      }`}
    >
      <Card
        className={`transition-all ${isHighlighted ? "ring-2 ring-blue-500 shadow-lg scale-105" : ""}`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <a href={exhibitor.url} rel="noopener noreferrer" target="_blank">
                <CardTitle className="text-lg mb-2">{exhibitor.name}</CardTitle>
              </a>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{exhibitor.type}</Badge>
              </div>
            </div>
            {onToggleBookmark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleBookmark(exhibitor.id)}
                className="ml-2"
              >
                <Bookmark
                  className={`h-5 w-5 ${
                    isBookmarked ? "fill-current text-blue-600" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {exhibitor.description}
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <MapPin className="h-4 w-4" />
              <span>
                {exhibitor.locationZone}&nbsp;
                {exhibitor.location}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExhibitorModule {
  mapExhibitors?: [string, Exhibitor[]];
  [key: string]: unknown;
}

// Import all session data files at once using Vite's glob import
const conferenceModules = import.meta.glob("../../data/*-20[0-9][0-9].ts", {
  eager: true,
});

// Process the modules into a lookup object
const EXHIBITOR_DATA: Record<string, Exhibitor[]> = {};
Object.entries(conferenceModules).forEach(([path, module]) => {
  const conferenceId = path.split("/").pop()?.replace(".ts", "") || "";
  const typedModule = module as ExhibitorModule;
  if (typedModule.mapExhibitors) {
    EXHIBITOR_DATA[conferenceId] = typedModule.mapExhibitors;
  }
});

export function ExhibitorView({
  bookmarkedExhibitors = [],
  onToggleBookmark,
  highlightExhibitorId,
}: ExhibitorViewProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const exhibitors = EXHIBITOR_DATA[activeConference.id]?.[1] ?? [];

  // Group exhibitors by type
  const groupExhibitorsByType = (exhibitors: Exhibitor[]) => {
    const grouped: Record<string, Exhibitor[]> = {};
    exhibitors.forEach((exhibitor) => {
      const type = exhibitor.type;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(exhibitor);
    });
    return grouped;
  };

  const groupedExhibitors = groupExhibitorsByType(exhibitors);
  const typeKeys = Object.keys(groupedExhibitors).sort();

  return (
    <div className="w-full">
      <Tabs
        value={selectedType}
        onValueChange={setSelectedType}
        className="w-full"
      >
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-6 w-full">
          <TabsList className="w-full flex-wrap h-auto bg-transparent">
            <TabsTrigger value="all">All Types</TabsTrigger>
            {typeKeys.map((type) => (
              <TabsTrigger key={type} value={type}>
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="all">
          {typeKeys.map((type) => (
            <div key={type} className="mb-8">
              <h3 className="text-xl font-semibold mb-4">{type}</h3>
              {groupedExhibitors[type]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((exhibitor) => (
                  <ExhibitorCard
                    key={exhibitor.id}
                    exhibitor={exhibitor}
                    isBookmarked={bookmarkedExhibitors.includes(exhibitor.id)}
                    isHighlighted={highlightExhibitorId === exhibitor.id}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
            </div>
          ))}
        </TabsContent>

        {typeKeys.map((type) => (
          <TabsContent key={type} value={type}>
            {groupedExhibitors[type]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((exhibitor) => (
                <ExhibitorCard
                  key={exhibitor.id}
                  exhibitor={exhibitor}
                  isBookmarked={bookmarkedExhibitors.includes(exhibitor.id)}
                  isHighlighted={highlightExhibitorId === exhibitor.id}
                  onToggleBookmark={onToggleBookmark}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

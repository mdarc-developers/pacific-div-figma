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
import { blendWithWhite, contrastingColor } from "@/lib/colorUtils";
import { EXHIBITOR_DATA } from "@/lib/sessionData";

interface ExhibitorViewProps {
  bookmarkedExhibitors?: string[];
  onToggleBookmark?: (exhibitorId: string) => void;
  highlightExhibitorId?: string;
  onLocationClick?: (exhibitorId: string) => void;
}

// NEW: Separate component for individual exhibitor
interface ExhibitorCardProps {
  exhibitor: Exhibitor;
  isBookmarked: boolean;
  isHighlighted: boolean;
  onToggleBookmark?: (exhibitorId: string) => void;
  onLocationClick?: (exhibitorId: string) => void;
}

function ExhibitorCard({
  exhibitor,
  isBookmarked,
  isHighlighted,
  onToggleBookmark,
  onLocationClick,
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
            <div
              className={`flex items-center gap-2 text-gray-700 dark:text-gray-300 ${
                onLocationClick
                  ? "cursor-pointer hover:text-amber-500 transition-colors"
                  : ""
              }`}
              onClick={
                onLocationClick
                  ? () => onLocationClick(exhibitor.id)
                  : undefined
              }
              onKeyDown={
                onLocationClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onLocationClick(exhibitor.id);
                      }
                    }
                  : undefined
              }
              role={onLocationClick ? "button" : undefined}
              tabIndex={onLocationClick ? 0 : undefined}
              aria-label={
                onLocationClick
                  ? `Highlight booth for ${exhibitor.name}`
                  : undefined
              }
            >
              <MapPin className="h-4 w-4" />
              <span>{exhibitor.boothName}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExhibitorView({
  bookmarkedExhibitors = [],
  onToggleBookmark,
  highlightExhibitorId,
  onLocationClick,
}: ExhibitorViewProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const exhibitorEntry = EXHIBITOR_DATA[activeConference.id];
  const exhibitors: Exhibitor[] = exhibitorEntry ? exhibitorEntry[1] : [];

  // Group exhibitors by type
  const groupExhibitorsByType = (exhibitors: Exhibitor[]) => {
    const grouped: Record<string, Exhibitor[]> = {};
    exhibitors.forEach((exhibitor) => {
      const type = exhibitor.type ?? "other";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(exhibitor);
    });
    return grouped;
  };

  const groupedExhibitors = groupExhibitorsByType(exhibitors);
  const typeKeys = Object.keys(groupedExhibitors).sort();
  const tabBg = blendWithWhite(activeConference.primaryColor);
  const tabText = contrastingColor(tabBg);

  return (
    <div className="w-full">
      <Tabs
        value={selectedType}
        onValueChange={setSelectedType}
        className="w-full"
      >
        <div
          className="rounded-lg p-2 mb-6 w-full"
          style={{ backgroundColor: tabBg, color: tabText }}
        >
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
                    onLocationClick={onLocationClick}
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
                  onLocationClick={onLocationClick}
                />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

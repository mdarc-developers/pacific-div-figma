import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

export interface ContextData {
  conferenceAppPageUrl: string;
  firstConferenceYear: string;
  estimatedAttendees: string;
  conferenceProgramSourceUrl: string;
}

interface Props {
  data: ContextData;
  onChange: (data: ContextData) => void;
}

export function SubmitConventionContext({ data, onChange }: Props) {
  const set =
    (key: keyof ContextData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Context</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="submit-app-page"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Conference app page URL (optional)
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            Public web page where attendees access the app (e.g.{" "}
            <code>https://www.pacificon.org/app</code>). Leave blank to use the
            default Pacific Division URL.
          </p>
          <Input
            id="submit-app-page"
            type="url"
            placeholder="https://your-conference.org/app"
            value={data.conferenceAppPageUrl}
            onChange={set("conferenceAppPageUrl")}
          />
        </div>

        <div>
          <label
            htmlFor="submit-first-year"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            First year of conference
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            Four-digit year the conference first took place (actual or
            estimated).
          </p>
          <Input
            id="submit-first-year"
            type="number"
            min={1900}
            max={2100}
            placeholder="1975"
            value={data.firstConferenceYear}
            onChange={set("firstConferenceYear")}
            className="w-28"
          />
        </div>

        <div>
          <label
            htmlFor="submit-attendees"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Estimated attendees
          </label>
          <Input
            id="submit-attendees"
            type="number"
            min={0}
            placeholder="500"
            value={data.estimatedAttendees}
            onChange={set("estimatedAttendees")}
            className="w-32"
          />
        </div>

        <div>
          <label
            htmlFor="submit-program-source"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Program source URL <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            Public URL where the conference program PDF is hosted online (e.g.
            your conference website). Must begin with{" "}
            <code>https://</code>.
          </p>
          <Input
            id="submit-program-source"
            type="url"
            placeholder="https://your-conference.org/program.pdf"
            value={data.conferenceProgramSourceUrl}
            onChange={set("conferenceProgramSourceUrl")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

// US and territory time zones.
// Guide: https://www.timeanddate.com/time/us/daylight-saving-usa.html
const US_TIMEZONES = [
  {
    value: "America/New_York",
    label: "Eastern (ET) — New York, Miami, Atlanta",
  },
  {
    value: "America/Chicago",
    label: "Central (CT) — Chicago, Dallas, Minneapolis",
  },
  {
    value: "America/Denver",
    label: "Mountain (MT) — Denver, Salt Lake City, Boise",
  },
  {
    value: "America/Phoenix",
    label: "Mountain no-DST (MST) — Arizona (except Navajo Nation)",
  },
  {
    value: "America/Los_Angeles",
    label: "Pacific (PT) — Los Angeles, San Francisco, Seattle",
  },
  {
    value: "America/Anchorage",
    label: "Alaska (AKT) — Anchorage, Fairbanks",
  },
  {
    value: "Pacific/Honolulu",
    label: "Hawaii (HST) — Honolulu, no DST",
  },
  {
    value: "America/Puerto_Rico",
    label: "Atlantic (AST) — Puerto Rico, no DST",
  },
  {
    value: "America/St_Thomas",
    label: "Atlantic (AST) — U.S. Virgin Islands",
  },
  {
    value: "Pacific/Guam",
    label: "Chamorro (ChST, UTC+10) — Guam, Northern Mariana Islands",
  },
  {
    value: "Pacific/Pago_Pago",
    label: "Samoa (SST, UTC−11) — American Samoa",
  },
];

/**
 * Calculate the UTC numeric offset string (e.g. "-0700") for the given IANA
 * timezone and a reference date string ("yyyy-mm-dd"), taking daylight saving
 * time into account.
 */
export function calcTimezoneNumeric(timezone: string, dateStr: string): string {
  if (!timezone || !dateStr) return "";
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    if (isNaN(d.getTime())) return "";
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    }).formatToParts(d);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    // "GMT-7", "GMT+5:30", or plain "GMT"
    const m = tzName.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
    if (!m) return "+0000";
    const sign = m[1];
    const h = m[2].padStart(2, "0");
    const min = (m[3] ?? "00").padStart(2, "0");
    return `${sign}${h}${min}`;
  } catch {
    return "";
  }
}

export interface WhenData {
  startDate: string;
  endDate: string;
  timezone: string;
  timezoneNumeric: string;
  icalUrl: string;
  googlecalUrl: string;
}

interface Props {
  data: WhenData;
  onChange: (data: WhenData) => void;
}

export function SubmitConferenceWhenCard({ data, onChange }: Props) {
  const set =
    (key: keyof WhenData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>When</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="submit-start"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Start date <span className="text-red-500">*</span>
            </label>
            <Input
              id="submit-start"
              type="date"
              value={data.startDate}
              onChange={set("startDate")}
            />
          </div>
          <div>
            <label
              htmlFor="submit-end"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              End date <span className="text-red-500">*</span>
            </label>
            <Input
              id="submit-end"
              type="date"
              value={data.endDate}
              onChange={set("endDate")}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Time zone <span className="text-red-500">*</span>
          </label>
          <Select
            value={data.timezone}
            onValueChange={(v) => onChange({ ...data, timezone: v })}
          >
            <SelectTrigger id="submit-timezone">
              <SelectValue placeholder="Select a time zone…" />
            </SelectTrigger>
            <SelectContent>
              {US_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="submit-tz-numeric"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            UTC offset
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            Automatically calculated from the time zone and start date,
            accounting for daylight saving time (e.g. <code>-0700</code> for
            PDT). Confirm or correct if needed.
          </p>
          <Input
            id="submit-tz-numeric"
            placeholder="-0700"
            value={data.timezoneNumeric}
            onChange={set("timezoneNumeric")}
            className="font-mono w-32"
          />
        </div>

        <div>
          <label
            htmlFor="submit-ical"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            iCal URL (optional)
          </label>
          <Input
            id="submit-ical"
            type="url"
            placeholder="https://..."
            value={data.icalUrl}
            onChange={set("icalUrl")}
          />
        </div>

        <div>
          <label
            htmlFor="submit-gcal"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Google Calendar URL (optional)
          </label>
          <Input
            id="submit-gcal"
            type="url"
            placeholder="https://..."
            value={data.googlecalUrl}
            onChange={set("googlecalUrl")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

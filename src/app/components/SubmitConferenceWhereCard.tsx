import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

export interface WhereData {
  name: string;
  conferenceUrl: string;
  conferenceContactEmail: string;
  location: string;
  venue: string;
  venuePhone: string;
  venueGPS: string;
  venueGridSquare: string;
  parkingUrl: string;
}

interface Props {
  data: WhereData;
  onChange: (data: WhereData) => void;
}

function Field({
  id,
  label,
  hint,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && (
        <p className="text-xs text-muted-foreground mb-1">{hint}</p>
      )}
      {children}
    </div>
  );
}

export function SubmitConferenceWhereCard({ data, onChange }: Props) {
  const set =
    (key: keyof WhereData) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: e.target.value });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field id="submit-name" label="Conference full name" required>
          <Input
            id="submit-name"
            placeholder="Pacificon Amateur Radio Convention 2026"
            value={data.name}
            onChange={set("name")}
          />
        </Field>

        <Field
          id="submit-conf-url"
          label="Conference website URL"
          hint="Include https://"
          required
        >
          <Input
            id="submit-conf-url"
            type="url"
            placeholder="https://www.pacificon.org"
            value={data.conferenceUrl}
            onChange={set("conferenceUrl")}
          />
        </Field>

        <Field
          id="submit-contact-email"
          label="Conference contact email"
          required
        >
          <Input
            id="submit-contact-email"
            type="email"
            placeholder="info@pacificon.org"
            value={data.conferenceContactEmail}
            onChange={set("conferenceContactEmail")}
          />
        </Field>

        <Field
          id="submit-location"
          label="Street address"
          hint="Full street address used for Google Maps links."
          required
        >
          <Input
            id="submit-location"
            placeholder="1 Civic Center Dr, San Ramon, CA 94583"
            value={data.location}
            onChange={set("location")}
          />
        </Field>

        <Field
          id="submit-venue"
          label="Venue name"
          hint="Common name of the building or facility."
          required
        >
          <Input
            id="submit-venue"
            placeholder="San Ramon Community Center"
            value={data.venue}
            onChange={set("venue")}
          />
        </Field>

        <Field id="submit-venue-phone" label="Venue phone">
          <Input
            id="submit-venue-phone"
            type="tel"
            placeholder="+1-555-555-5555"
            value={data.venuePhone}
            onChange={set("venuePhone")}
          />
        </Field>

        <Field
          id="submit-gps"
          label="Venue GPS coordinates"
          hint={
            <>
              Decimal lat/long, e.g.{" "}
              <code>37.7749,-122.4194</code>. Find by opening{" "}
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                maps.google.com
              </a>
              , right-clicking the venue, and choosing{" "}
              <em>What&apos;s here?</em>
            </>
          }
        >
          <Input
            id="submit-gps"
            placeholder="37.7749,-122.4194"
            value={data.venueGPS}
            onChange={set("venueGPS")}
          />
        </Field>

        <Field
          id="submit-grid"
          label="Venue grid square"
          hint={
            <>
              Maidenhead locator, e.g. <code>CM87wj</code>. Calculate at{" "}
              <a
                href="https://www.levinecentral.com/ham/grid_square.php"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                levinecentral.com/ham/grid_square.php
              </a>
              .
            </>
          }
        >
          <Input
            id="submit-grid"
            placeholder="CM87wj"
            value={data.venueGridSquare}
            onChange={set("venueGridSquare")}
          />
        </Field>

        <Field
          id="submit-parking"
          label="Parking URL (optional)"
          hint="Include https://"
        >
          <Input
            id="submit-parking"
            type="url"
            placeholder="https://..."
            value={data.parkingUrl}
            onChange={set("parkingUrl")}
          />
        </Field>
      </CardContent>
    </Card>
  );
}

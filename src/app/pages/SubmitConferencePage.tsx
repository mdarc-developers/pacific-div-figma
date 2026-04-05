import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  getGoogleAccessToken,
  uploadFileToDrive,
  uploadTextToDrive,
  logoAssetPath,
  programAssetPath,
  mapAssetPath,
  conferenceYear,
} from "@/lib/googleDrive";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import {
  SubmitConferenceTitleCard,
  type TitleData,
} from "@/app/components/SubmitConferenceTitleCard";
import {
  SubmitConferenceAssetsCard,
  type AssetsData,
} from "@/app/components/SubmitConferenceAssetsCard";
import {
  SubmitConferenceColorCard,
  type ColorData,
} from "@/app/components/SubmitConferenceColorCard";
import {
  SubmitConferenceWhereCard,
  type WhereData,
} from "@/app/components/SubmitConferenceWhereCard";
import {
  SubmitConferenceWhenCard,
  type WhenData,
  calcTimezoneNumeric,
} from "@/app/components/SubmitConferenceWhenCard";
import {
  SubmitConferenceContextCard,
  type ContextData,
} from "@/app/components/SubmitConferenceContextCard";

// ---------------------------------------------------------------------------
// Google Drive upload helpers
// ---------------------------------------------------------------------------

const DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as
  | string
  | undefined;

// ---------------------------------------------------------------------------
// TypeScript data file generator
// ---------------------------------------------------------------------------

function generateConferenceTs(
  title: TitleData,
  assets: AssetsData,
  color: ColorData,
  where: WhereData,
  when: WhenData,
  context: ContextData,
): string {
  const { slug } = title;
  const logoUrl = logoAssetPath(assets.logoFile!.name);
  const conferenceProgramUrl = programAssetPath(assets.programFile!.name);

  const maps = assets.mapFiles.map((f, i) => ({
    id: `${slug}-map-${i + 1}`,
    name: `Map ${i + 1}`,
    url: mapAssetPath(f.name),
    order: i + 1,
    origWidthNum: 0,
    origHeightNum: 0,
  }));

  const conf = {
    id: conferenceYear(when.startDate, slug),
    name: where.name,
    venue: where.venue,
    startDate: when.startDate,
    endDate: when.endDate,
    timezone: when.timezone,
    primaryColor: color.primaryColor,
    secondaryColor: color.secondaryColor,
    location: where.location,
    conferenceUrl: where.conferenceUrl,
    venuePhone: where.venuePhone,
    venueGPS: where.venueGPS,
    venueGridSquare: where.venueGridSquare,
    venueUrl: where.conferenceUrl,
    timezoneNumeric: when.timezoneNumeric,
    parkingUrl: where.parkingUrl,
    icalUrl: when.icalUrl,
    googlecalUrl: when.googlecalUrl,
    conferenceContactEmail: where.conferenceContactEmail,
    logoUrl,
    conferenceProgramUrl,
    conferenceProgramSourceUrl: context.conferenceProgramSourceUrl || undefined,
    conferenceAppPageUrl: context.conferenceAppPageUrl || undefined,
    firstConferenceYear: context.firstConferenceYear
      ? parseInt(context.firstConferenceYear, 10)
      : undefined,
    estimatedAttendees: context.estimatedAttendees
      ? parseInt(context.estimatedAttendees, 10)
      : undefined,
  };

  return [
    `// Submitted by: ${title.submitterEmail}`,
    `// Submitted at: ${new Date().toISOString()}`,
    `// Status: pending review`,
    `import { Conference, MapImage } from "@/types/conference";`,
    ``,
    `export const conference: Conference = ${JSON.stringify(conf, null, 2)};`,
    ``,
    `export const conferenceMaps: MapImage[] = ${JSON.stringify(maps, null, 2)};`,
    ``,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validate(
  title: TitleData,
  assets: AssetsData,
  color: ColorData,
  where: WhereData,
  when: WhenData,
  context: ContextData,
): string[] {
  const errors: string[] = [];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hexRe = /^#[0-9A-Fa-f]{6}$/;

  if (!title.submitterEmail.trim())
    errors.push("Submitter email is required.");
  else if (!emailRe.test(title.submitterEmail))
    errors.push("Submitter email is not valid.");

  if (!title.slug) errors.push("Slug is required.");
  else if (title.slug.length < 3 || title.slug.length > 12)
    errors.push("Slug must be 3–12 characters.");

  if (!assets.logoFile) errors.push("Logo image is required.");
  if (!assets.programFile) errors.push("Conference program PDF is required.");
  if (assets.mapFiles.length === 0)
    errors.push("At least one map file is required.");

  if (!color.primaryColor) errors.push("Primary color is required.");
  else if (!hexRe.test(color.primaryColor))
    errors.push("Primary color must be a 6-digit hex value (e.g. #1A2B3C).");

  if (!color.secondaryColor) errors.push("Secondary color is required.");
  else if (!hexRe.test(color.secondaryColor))
    errors.push("Secondary color must be a 6-digit hex value (e.g. #FFFFFF).");

  if (!where.name.trim()) errors.push("Conference full name is required.");
  if (!where.conferenceUrl.trim())
    errors.push("Conference website URL is required.");
  if (!where.conferenceContactEmail.trim())
    errors.push("Conference contact email is required.");
  if (!where.location.trim()) errors.push("Street address is required.");
  if (!where.venue.trim()) errors.push("Venue name is required.");

  if (!when.startDate) errors.push("Start date is required.");
  if (!when.endDate) errors.push("End date is required.");
  if (when.startDate && when.endDate && when.endDate < when.startDate)
    errors.push("End date must be on or after start date.");
  if (!when.timezone) errors.push("Time zone is required.");

  if (!context.conferenceProgramSourceUrl.trim())
    errors.push("Program source URL is required.");

  return errors;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function SubmitConferencePage() {
  const [title, setTitle] = useState<TitleData>({
    submitterEmail: "",
    slug: "",
  });
  const [assets, setAssets] = useState<AssetsData>({
    logoFile: null,
    programFile: null,
    mapFiles: [],
  });
  const [color, setColor] = useState<ColorData>({
    primaryColor: "",
    secondaryColor: "",
  });
  const [where, setWhere] = useState<WhereData>({
    name: "",
    conferenceUrl: "",
    conferenceContactEmail: "",
    location: "",
    venue: "",
    venuePhone: "",
    venueGPS: "",
    venueGridSquare: "",
    parkingUrl: "",
  });
  const [when, setWhen] = useState<WhenData>({
    startDate: "",
    endDate: "",
    timezone: "",
    timezoneNumeric: "",
    icalUrl: "",
    googlecalUrl: "",
  });
  const [context, setContext] = useState<ContextData>({
    conferenceAppPageUrl: "",
    firstConferenceYear: "",
    estimatedAttendees: "",
    conferenceProgramSourceUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-calculate timezoneNumeric in the parent so the child component stays
  // stateless with respect to this derived value (avoids stale closure issues).
  const handleWhenChange = (newWhen: WhenData) => {
    if (
      (newWhen.timezone !== when.timezone ||
        newWhen.startDate !== when.startDate) &&
      newWhen.timezone &&
      newWhen.startDate
    ) {
      const numeric = calcTimezoneNumeric(newWhen.timezone, newWhen.startDate);
      if (numeric && numeric !== newWhen.timezoneNumeric) {
        setWhen({ ...newWhen, timezoneNumeric: numeric });
        return;
      }
    }
    setWhen(newWhen);
  };

  const handleSubmit = async () => {
    const validationErrors = validate(
      title,
      assets,
      color,
      where,
      when,
      context,
    );
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors([]);
    setSubmitError(null);
    setSubmitting(true);

    try {
      const { slug } = title;
      const logoUrl = logoAssetPath(assets.logoFile!.name);
      const conferenceProgramUrl = programAssetPath(assets.programFile!.name);
      const conferenceId = conferenceYear(when.startDate, slug);

      let driveLogoFileId = "";
      let driveProgramFileId = "";
      const driveMapFileIds: string[] = [];
      let driveTsFileId = "";

      if (DRIVE_FOLDER_ID) {
        const accessToken = await getGoogleAccessToken();

        driveLogoFileId = await uploadFileToDrive(
          accessToken,
          DRIVE_FOLDER_ID,
          `images-${slug}-${assets.logoFile!.name}`,
          assets.logoFile!,
        );

        driveProgramFileId = await uploadFileToDrive(
          accessToken,
          DRIVE_FOLDER_ID,
          `programs-${slug}-${assets.programFile!.name}`,
          assets.programFile!,
        );

        for (const mapFile of assets.mapFiles) {
          const id = await uploadFileToDrive(
            accessToken,
            DRIVE_FOLDER_ID,
            `maps-${slug}-${mapFile.name}`,
            mapFile,
          );
          driveMapFileIds.push(id);
        }

        const tsContent = generateConferenceTs(
          title,
          assets,
          color,
          where,
          when,
          context,
        );
        driveTsFileId = await uploadTextToDrive(
          accessToken,
          DRIVE_FOLDER_ID,
          `${conferenceId}.ts`,
          tsContent,
        );
      }

      await setDoc(doc(db, "submittedConferences", slug), {
        submitterEmail: title.submitterEmail,
        slug,
        conferenceId,
        name: where.name,
        primaryColor: color.primaryColor,
        secondaryColor: color.secondaryColor,
        conferenceUrl: where.conferenceUrl,
        conferenceContactEmail: where.conferenceContactEmail,
        location: where.location,
        venue: where.venue,
        venuePhone: where.venuePhone,
        venueGPS: where.venueGPS,
        venueGridSquare: where.venueGridSquare,
        parkingUrl: where.parkingUrl,
        startDate: when.startDate,
        endDate: when.endDate,
        timezone: when.timezone,
        timezoneNumeric: when.timezoneNumeric,
        icalUrl: when.icalUrl,
        googlecalUrl: when.googlecalUrl,
        conferenceAppPageUrl: context.conferenceAppPageUrl || null,
        firstConferenceYear: context.firstConferenceYear
          ? parseInt(context.firstConferenceYear, 10)
          : null,
        estimatedAttendees: context.estimatedAttendees
          ? parseInt(context.estimatedAttendees, 10)
          : null,
        conferenceProgramSourceUrl: context.conferenceProgramSourceUrl,
        logoUrl,
        conferenceProgramUrl,
        logoFileName: assets.logoFile!.name,
        programFileName: assets.programFile!.name,
        mapFileNames: assets.mapFiles.map((f) => f.name),
        driveLogoFileId,
        driveProgramFileId,
        driveMapFileIds,
        driveTsFileId,
        status: "pending",
        submittedAt: new Date().toISOString(),
      });

      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Submission failed. Try again.";
      setSubmitError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="rounded-lg border border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700 p-6 text-center space-y-3">
          <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">
            Submission received!
          </h2>
          <p className="text-sm text-green-700 dark:text-green-300">
            Thank you for submitting your conference. We will review your
            information and contact you at{" "}
            <strong>{title.submitterEmail}</strong> if we have questions. After
            verification, your conference will be added to the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Introduction */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Submit a Conference</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We are preparing this app in the{" "}
          <strong>ARRL Pacific Division (pacific-div)</strong> to be available
          for attendees of amateur radio hamfests, conferences and conventions,
          especially those listed by the{" "}
          <a
            href="https://www.arrl.org/hamfests-and-conventions-calendar"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            ARRL calendar
          </a>
          . In the beginning, those willing to help us improve the system by
          testing and perhaps GitHub pull requests will be highly prioritized.
          Your information will need to be verified before being added to the
          app, including but not limited to verifying the data submitted.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To use these web and app facilities for your conference attendees,
          please upload five items and submit the data below.
        </p>
      </div>

      <Separator />

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700 p-4">
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
            Please fix the following before submitting:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-600 dark:text-red-400">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {submitError && (
        <div className="rounded-md border border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">
            {submitError}
          </p>
        </div>
      )}

      {/* Cards */}
      <SubmitConferenceTitleCard data={title} onChange={setTitle} />
      <SubmitConferenceAssetsCard
        data={assets}
        slug={title.slug}
        onChange={setAssets}
      />
      <SubmitConferenceColorCard data={color} onChange={setColor} />
      <SubmitConferenceWhereCard data={where} onChange={setWhere} />
      <SubmitConferenceWhenCard data={when} onChange={handleWhenChange} />
      <SubmitConferenceContextCard data={context} onChange={setContext} />

      {/* Submit */}
      <div className="flex flex-col gap-2">
        <Button
          className="w-full"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting…" : "Submit Conference"}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Fields marked <span className="text-red-500">*</span> are required.
          Your submission will be reviewed before being added to the app.
        </p>
      </div>

      <Separator />

      {/* LoFi.so footer note */}
      <div className="space-y-3 text-sm text-muted-foreground">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          About structured data (LoFi.so local-first)
        </p>
        <p className="leading-relaxed">
          Programs can be written to extract conference data from web pages and
          convert it to the correct format. The following structured data types
          are supported and can be provided separately after initial submission:
        </p>
        <ul className="list-disc list-inside space-y-1 leading-relaxed">
          <li>
            <strong>Schedule, Forums &amp; Rooms</strong> — sessions with
            titles, speakers, times, locations, and tracks
          </li>
          <li>
            <strong>Exhibitors &amp; Booths</strong> — vendor listings and
            booth coordinates on floor maps
          </li>
          <li>
            <strong>MapImage</strong> — raster images with coordinate overlay
            or SVG floor plans (
            <code>id, name, url, order, origWidthNum, origHeightNum</code>)
          </li>
          <li>
            <strong>Prize, PrizeWinner</strong> — raffle prizes and drawing
            results
          </li>
          <li>
            <strong>AlertHistoryItem</strong> — push notification history
          </li>
          <li>
            <strong>UserProfile, UserProfileGroups, PublicAttendeeProfile</strong>{" "}
            — at least one validated admin account for prize-admin,
            forums-admin, session-admin, and exhibitor-admin roles is required
          </li>
          <li>
            <strong>Message</strong> — public or directed forum messages
          </li>
        </ul>
      </div>
    </div>
  );
}

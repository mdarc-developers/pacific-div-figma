import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConference } from "@/app/contexts/ConferenceContext";
import { Conference } from "@/types/conference";

/** Returns true if the conference has not yet ended. */
export function isUpcomingOrCurrent(conference: Conference): boolean {
  const endDate = new Date(
    `${conference.endDate}T23:59:59${conference.timezoneNumeric}`,
  );
  return endDate >= new Date();
}

/**
 * Finds the next upcoming (or currently active) conference whose id starts
 * with the given slug (case-insensitive). Returns undefined when no match.
 */
export function findNextConferenceBySlug(
  conferences: Conference[],
  slug: string,
): Conference | undefined {
  const lower = slug.toLowerCase();
  return conferences
    .filter((c) => c.id.toLowerCase().startsWith(lower))
    .filter(isUpcomingOrCurrent)
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];
}

/**
 * Selects the next upcoming (or currently active) conference whose id starts
 * with the `:conferenceSlug` URL param, then redirects to /schedule.
 *
 * Example: visiting /pacificon selects the next future Pacificon conference.
 */
export function ConferenceRedirectPage() {
  const { conferenceSlug } = useParams<{ conferenceSlug: string }>();
  const { allConferencesList, setActiveConference } = useConference();
  const navigate = useNavigate();

  useEffect(() => {
    if (conferenceSlug) {
      const match = findNextConferenceBySlug(allConferencesList, conferenceSlug);
      if (match) {
        setActiveConference(match);
      }
    }

    navigate("/schedule", { replace: true });
  }, [conferenceSlug, allConferencesList, setActiveConference, navigate]);

  return null;
}

import { useConference } from "@/app/contexts/ConferenceContext";

export function ConferenceFooter() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const sha = import.meta.env.VITE_GIT_SHA;
  const shortSha = sha ? sha.slice(0, 7) : null;
  const buildDate = import.meta.env.VITE_BUILD_DATE;
  const buildSource = import.meta.env.VITE_BUILD_SOURCE;
  const buildRunId = import.meta.env.VITE_BUILD_RUN_ID;
  const buildTooltip = shortSha
    ? buildSource === "gha"
      ? `${shortSha} • gha${buildRunId ? ` #${buildRunId}` : ""}`
      : `${shortSha} • ${buildSource}`
    : undefined;
  const formattedDate = buildDate
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      }).format(new Date(buildDate))
    : null;
  return (
    <>
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Conference questions or suggestions?{" "}
          <a
            href={"mailto:" + activeConference.contactEmail}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {activeConference.contactEmail}
          </a>
        </p>
        <p className="mt-2">Built for offline use</p>
        {formattedDate && (
          <p className="mt-2">
            <span title={buildTooltip} className="cursor-default">
              Updated: {formattedDate}
            </span>
          </p>
        )}
      </footer>
    </>
  );
}

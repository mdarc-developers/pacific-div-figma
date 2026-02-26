import { useConference } from "@/app/contexts/ConferenceContext";

const REPO_URL = "https://github.com/mdarc-developers/pacific-div-figma";

export function ConferenceFooter() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { activeConference, allConferencesList, setActiveConference } =
    useConference();
  const sha = import.meta.env.VITE_GIT_SHA;
  const shortSha = sha ? sha.slice(0, 7) : null;
  return (
    <>
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Questions or suggestions?{" "}
          <a
            href={"mailto:" + activeConference.contactEmail}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {activeConference.contactEmail}
          </a>
        </p>
        <p className="mt-2">
          Multi-conference support • Offline capable planned
        </p>
        {shortSha && (
          <p className="mt-2">
            Build:{" "}
            <a
              href={`${REPO_URL}/commit/${sha}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-blue-600 dark:text-blue-400 hover:underline"
            >
              {shortSha}
            </a>
          </p>
        )}
      </footer>
    </>
  );
}

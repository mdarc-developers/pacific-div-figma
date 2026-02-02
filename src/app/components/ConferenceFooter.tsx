import { Conference } from '@/types/conference';

interface ConferenceFooterProps {
  conference: Conference;
}

export function ConferenceFooter({ conference }: ConferenceFooterProps) {
  return (
    <>
      <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Questions or suggestions? {' '}
          <a
            href={"mailto:" + (conference.contactEmail)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {conference.contactEmail}
          </a>
        </p>
        <p className="mt-2">
          Multi-conference support planned • Offline capable planned
        </p>
      </footer>
    </>
  )
}
import { createContext, useContext, useEffect, useState } from "react";
//import { auth } from '../../lib/firebase';
import { Conference } from "@/types/conference";
import { allConferences } from "@/data/all-conferences";

const CONFERENCE_STORAGE_KEY = "activeConference";

interface ConferenceContextType {
  activeConference: Conference;
  allConferencesList: Conference[];
  setActiveConference: (conference: Conference) => void;
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(
  undefined,
);

function readStoredConference(): Conference {
  try {
    const id = localStorage.getItem(CONFERENCE_STORAGE_KEY);
    if (id) {
      const found = allConferences.find((c) => c.id === id);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return allConferences[0];
}

export const useConference = () => {
  const context = useContext(ConferenceContext);
  if (!context) {
    throw new Error("useConference must be used within ConferenceProvider");
  }
  return context;
};

export const ConferenceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeConference, setActiveConference] = useState<Conference>(() =>
    readStoredConference(),
  );

  // Persist active conference ID to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFERENCE_STORAGE_KEY, activeConference.id);
    } catch {
      // ignore
    }
  }, [activeConference]);

  const conferenceValue = {
    activeConference,
    allConferencesList: allConferences,
    setActiveConference,
  };

  return (
    <ConferenceContext.Provider value={conferenceValue}>
      {children}
    </ConferenceContext.Provider>
  );
};

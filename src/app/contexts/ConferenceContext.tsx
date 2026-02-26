import { createContext, useContext, useState } from "react";
//import { auth } from '../../lib/firebase';
import { Conference } from "@/types/conference";
import { allConferences } from "@/data/all-conferences";

interface ConferenceContextType {
  activeConference: Conference;
  allConferencesList: Conference[];
  setActiveConference: (conference: Conference) => void;
}

const ConferenceContext = createContext<ConferenceContextType | undefined>(
  undefined,
);

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
  const [activeConference, setActiveConference] = useState<Conference>(
    allConferences[0], // initial value
  );

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

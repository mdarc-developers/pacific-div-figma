import {
  Session,
} from "@/types/conference";

export const mapSessions: [string, Session[]] = [
  "/assets/maps/hamcation-2026-pavilion.png",
  // must match mapRooms URL
  [
    {
      id: "session-1",
      title: "Florida AUXCOMM ESF2 Stakeholder Forum",
      description:
        "Hear from Floridas Statewide Interoperability Coordinator (SWIC) and from Floridas ESF2 team on the year in review for Floridas AUXCOMM program, ICT Communications updates, exercise and training opportunities and presentation of Flroidas annual AUXCOMM Service Award",
      speaker: ["Roger Lord (FDEM SWIC)", "David Byrun (FL AUXCOMM)"],
      location: "Pavilion Tent 1",
      startTime: "2027-02-13T09:15:00",
      endTime: "2027-02-13T10:15:00",
      category: "EmComm",
      track: ["EmComm"],
    },
    {
      id: "session-2",
      title: "Getting Started in QRP",
      description: "Steve has been a ham for more than five decades...",
      speaker: ["Steve Hudson, AA4BW"],
      location: "Pavilion Tent 3",
      startTime: "2027-02-13T09:15:00",
      endTime: "2027-02-13T10:15:00",
      category: "Operating",
      track: ["QRP"],
    },
    {
      id: "session-3",
      title:
        "High Performance HF multi-band Antenna and Lightning Protection System",
      description:
        "Gary from trueladderline.com, will discuss the high efficiency HF multi-band antenna model and methods of lightning protection for it.",
      speaker: ["Gary Baker, K7EMF"],
      location: "Pavilion Tent 2",
      startTime: "2027-02-13T09:15:00",
      endTime: "2027-02-13T10:15:00",
      category: "Technical",
      track: ["Station"],
    },
    {
      id: "session-4",
      title: "D-STAR",
      description:
        "Join D-STAR enthusiasts for whats new and how to get the most from your D-STAR equipment. Well discuss how easy it is to get on the air, connect with others around the world, the easiest programming of your radio, how to update your radio with the current list of repeaters and get your hotspot connection for D-STAR.F",
      speaker: ["John Davis, WB4QDX"],
      location: "Pavilion Tent 2",
      startTime: "2027-02-13T10:30:00",
      endTime: "2027-02-13T11:30:00",
      category: "Operating",
      track: ["Digital"],
    },
    {
      id: "session-5",
      title: "DX Marathon",
      description:
        "Join the Chase: Why the DX Marathon Should Be Your Next Ham Radio Challenge",
      speaker: ["Mark Wohlschlegel, WC3W"],
      location: "Pavilion Tent 3",
      startTime: "2027-02-13T10:30:00",
      endTime: "2027-02-13T11:30:00",
      category: "Contesting",
      track: ["DX"],
    },
    {
      id: "session-6",
      title: "Elecraft K4 Update with Q&A",
      description:
        "Eric Swartz, WA6HHQ, Elecraft Co-Founder, will discuss: K4 Transceiver, K4 Software Eleases and Updates, K$/0 TRemote System, Q&A on all Elecraft products",
      speaker: ["Eric Swartz, WA6HHQ"],
      location: "Pavilion Tent 2",
      startTime: "2027-02-13T10:30:00",
      endTime: "2027-02-13T11:30:00",
      category: "Equipment",
      track: ["Product"],
    },
    {
      id: "session-7",
      title: "DX Contesting from V26B in Antigua",
      description:
        "The presentation will introduce the fun and challenges of HF contesting...",
      speaker: ["Ray Conrad, NM2O"],
      location: "Pavilion Tent 3",
      startTime: "2027-02-13T11:45:00",
      endTime: "2027-02-13T12:45:00",
      category: "Contesting",
      track: ["DX"],
    },
  ],
];


//converted from 2026 dates to 2027 dates using this sed command
//
// sed 's/2026-02-28/2027-02-27/g; s/2026-02-27/2027-02-26/g' yuma-2027-session-x.ts > yuma-2027-session-20260302.ts
//
import { Session } from "@/types/conference";

export const mapSessions: [string, Session[]] = [
  "/assets/maps/yuma_map_2026-01-06_160549-1.png",
  // must match mapRooms URL
  // Source: https://www.yumahamfest.com/seminars.html (extracted 2026-02-25)
  [
    // ── Seminar Room 1 (C Fine Arts Building) ──────────────────────────────────
    {
      id: "yuma-session-1",
      title: "Kit Building Techniques for Success",
      description:
        "A look at hints and tips for kit builders from beginners to advanced. We look at the proper tools, test equipment and work surface needed to have the best chance at success enjoying this very rewarding part of amateur radio.",
      speaker: ["Joe Eisenberg (K0NEB)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-26T13:00:00",
      endTime: "2027-02-26T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-2",
      title: "VSWR and NANO VNAs",
      description:
        "Review of VSWR how it affects transmitting and receiving and followed by how to measure VSWR using an inexpensive Nano VNA.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-26T14:20:00",
      endTime: "2027-02-26T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-3",
      title: "ABC's of RFI for Hams",
      description:
        "Is your transmitter the SOURCE of RFI affecting electronic devices in your own house or your neighbor's house? Are you the VICTIM of RFI from your own electronic devices or from devices in your neighborhood? Do you want to reduce your receiver noise floor so you can hear local contacts and more DX? If you answered YES to any of these questions and would you like to find a quick and easy solution, then you should attend this presentation.",
      speaker: ["Bob Brehm (AK6R)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-26T15:40:00",
      endTime: "2027-02-26T16:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-4",
      title: "Meshtastic vs Meshcore",
      description:
        "This talk will give a basic overview of the underlying technology (LoRa), the similarities and differences between Meshtastic and Meshcore, as well as some recommendations for which to use in different scenarios. I will also have a variety of devices to show.",
      speaker: ["Michael Rickey (AF6FB)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T09:00:00",
      endTime: "2027-02-27T10:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-5",
      title: "FlexRadio - Aurora: The Future of Ham Radio",
      description:
        "Join us as Steve Hicks, FlexRadio CTO, N5AC, presents an exclusive look at the new Aurora transceiver from FlexRadio, Inc. Drawing on his technical expertise and leadership in software-defined radio innovation, Steve will highlight how Aurora sets a new standard in performance, advanced signal processing, and operator flexibility. Discover how these cutting-edge features deliver real-world benefits for the amateur radio community.",
      speaker: ["Steve Hicks (N5AC)", "CTO & VP Engineering, FlexRadio"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T10:20:00",
      endTime: "2027-02-27T11:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-6",
      title: "Are you compliant with FCC RF exposure rules?",
      description:
        "Carl, KB7AZ, is the Arizona Section Technical Coordinator. He will present the new rules and how to be compliant with those rules. Compliance is not difficult, but just takes a little time and effort.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T11:40:00",
      endTime: "2027-02-27T12:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-7",
      title: "Slow Scan Television (SSTV)",
      description:
        "SSTV is another mode of amateur radio communication. The first SSTV images were displayed on a long-persistence phosphor CRT. Today amateurs can send and receive color images across the country, and around the world. As Cycle 25 improves propagation, working DX on SSTV will be possible on the HF bands. This seminar will show how easy it is to get on the air with SSTV using the same setup that is used for FT8 and AFSK RTTY. All that is required is a computer with a sound card interface to a transceiver. The software is free and easy to set up. Sending and receiving color pictures on the HF bands is a great addition to CW, SSB, RTTY, and digital modes.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T13:00:00",
      endTime: "2027-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-8",
      title: "Consumer Electronics Show 2026",
      description:
        "Joe will share his experience at the Consumer Electronics Show 2026 in Las Vegas. Included will be the up and coming and new innovations. Joe will have a slideshow of his experience.",
      speaker: ["Joe Eisenberg (K0NEB)"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T14:20:00",
      endTime: "2027-02-27T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-9",
      title: "ARRL Updates and Forum",
      description:
        "The Southwestern Division Director and other ARRL officers will provide updates and lead the ARRL Forum. The forum is an opportunity for hams to find out about new developments within the ARRL, and to get their questions answered by their ARRL leadership. It is open to all hams and discussion and feedback are welcome.",
      speaker: ["Dick Norton (N6AA)", "ARRL Southwestern Division Director"],
      location: "Seminar Room 1 (C Fine Arts Building)",
      startTime: "2027-02-27T15:40:00",
      endTime: "2027-02-27T17:00:00",
      category: "Forums",
    },
    // ── Seminar Room 2 (D 4H Building) ─────────────────────────────────────────
    {
      id: "yuma-session-10",
      title:
        "End Fed Antenna Secrets for Portable, Emergency and Stealth Installations",
      description:
        "Learn how to select, choose and setup an end fed antenna system that works on multiple bands, is stealthy and radiates well at low heights. Find out the secrets of antenna matching, reducing RFI and minimizing noise present on many end fed antennas. Example installations and antenna dimensions will be shown for 160-6 meter operations.",
      speaker: ["Bob Brehm (AK6R)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-26T13:00:00",
      endTime: "2027-02-26T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-11",
      title: "Red Cross Ready",
      description:
        'Everyone knows the Red Cross helps people during emergencies. But you may not know that it\'s also part of our mission to help you help yourself! Becoming "Red Cross Ready" for an emergency means following our simple steps in advance to ensure you can weather a crisis safely and comfortably. This session will offer tips on building a kit to prepare for various emergencies like wildfires, flash floods or earthquakes. Being prepared may not prevent a disaster, but it will give you confidence to meet the challenge.',
      speaker: ["Red Cross"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-26T14:20:00",
      endTime: "2027-02-26T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-12",
      title: "Red Cross - Hands Only CPR",
      description:
        "Recent studies report about 90 percent of people who suffer out-of-hospital cardiac arrests die. CPR, especially if performed immediately, can double or triple a cardiac arrest victim's chance of survival. People who survive a cardiac emergency are often helped by a bystander. In this short, free session, you can learn how to perform Hands-Only CPR \u2013 so that you can help deliver life-saving care until professional responders arrive.",
      speaker: ["Red Cross"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-26T15:40:00",
      endTime: "2027-02-26T16:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-13",
      title:
        "Wheels On The Air (WOTA): A Mobility Forward Twist on Ham Radio Activations",
      description:
        "Members of the Amateur Radio Club of El Cajon, CA convert access and functional-need amateur radio operators into contest rovers utilizing only public transportation. This seminar outlines mission planning using the Incident Command System (ICS), explores expanded ARRL rules, and examines the real-world challenges of coordinating operations across disabled and public transit systems. The After Action Report will provide a practical, repeatable template for other amateur radio clubs seeking inclusive, mobility-forward activations.",
      speaker: ["Grant Warren (KO6IHG)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T09:00:00",
      endTime: "2027-02-27T10:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-14",
      title: "Remote DXpeditioning",
      description:
        'The Radio-In-a-Box (RIB) technology has made a big impact in the DX (and contesting) realm. Its use in high-profile DXpeditions has changed the DXing game forever. The use of RIBs in DXpeditions can provide numerous benefits such as reduced project costs, lower environmental impact and safer operations. The "Remote DXpedition" presentation will provide AA7A\'s perspective on the nearly seven-year development effort of the RIB concept and other emerging technologies and how their application to DXing is an exciting step forward in amateur radio.',
      speaker: ["Ned Stearns (AA7A)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T10:20:00",
      endTime: "2027-02-27T11:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-15",
      title: "A Life of Ham Radio Adventures",
      description:
        "An active DXer and contester, first licensed as WN9EBT in Chicago in 1962. He is Top of DXCC Honor Roll with all 340 current entities confirmed, has 3,030 entities confirmed in DXCC Challenge, and holds 5 Band Worked All Zones (5BWAZ). An avid CW operator, Lee is a member of both FOC and CWops but has also been very active on digital modes in recent years. Lee will talk about his path in ham radio from building a Knight-Kit SpanMaster in 1960 to honing his CW skills in high school by handling messages for the National Traffic System and on through his evolution as a DXer and contester to becoming a pioneer today in the evolution of remote station operation.",
      speaker: ["Lee Finkel (KY7M)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T11:40:00",
      endTime: "2027-02-27T12:40:00",
      category: "Forums",
    },
    {
      id: "yuma-session-16",
      title: "Transformers, More Than Meets the Eye",
      description:
        "The lowly transformer. It doesn't get much attention. We mostly know what it does when we poke it with some voltage or current, but what is really going on? Let's talk about it from Maxwell on up, and see if we can understand these simple, yet deep devices. You might be surprised at what they can do and how they do it.",
      speaker: ["Kristen McIntyre (K6WX)", "ARRL 1st Vice President"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T13:00:00",
      endTime: "2027-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-17",
      title: "Vero Telecom Radio (VGC NR-7x Radios)",
      description:
        "Vero makes mobile and handheld radios with some unique capabilities and an affordable price. This talk will discuss the radios from VGC and the other brands with compatible radios. These radios are unique in that they offer programming via a mobile app, APRS, network channels, text messaging, satellite operations, Bluetooth TNC, and more.",
      speaker: ["Michael Rickey (AF6FB)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T14:20:00",
      endTime: "2027-02-27T15:20:00",
      category: "Forums",
    },
    {
      id: "yuma-session-18",
      title: "How to set up MMTTY and other RTTY software and get on the air",
      description:
        "Amateurs have been using RTTY since the 1940s. Originally, they used mechanical machines to send and receive messages. Around 1980, they slowly switched to using computers to generate and receive RTTY signals. However, there are a lot of amateurs who still use machinery instead of computers. The over-the-air signals are the same, so it doesn't matter which method you use. Learn how to easily set up a PC with an SSB transceiver to get on the air with this digital mode.",
      speaker: ["Carl Foster (KB7AZ)"],
      location: "Seminar Room 2 (D 4H Building)",
      startTime: "2027-02-27T15:40:00",
      endTime: "2027-02-27T17:00:00",
      category: "Forums",
    },
    // ── Hospitality Seminars (B Old Theater Building) ───────────────────────────
    {
      id: "yuma-session-19",
      title: "Skywarn Spotter Training - Refresher",
      description:
        "A condensed version of the National Weather Service Skywarn Spotter Training Refresher. This refresher is recommended every other year in order to keep you up to date and informed as a Skywarn Spotter.",
      speaker: [
        "Tom Frieders (National Weather Service)",
        "Ted Whittock (National Weather Service)",
      ],
      location: "Hospitality (B Old Theater Building)",
      startTime: "2027-02-26T13:00:00",
      endTime: "2027-02-26T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-20",
      title: "Rope Baskets",
      description:
        "I became interested in designs using rope and fabric two years ago when a friend shared what she had learned at a quilt store class. I was immediately hooked, and as my hubby says, addicted. Soon I had baskets, trivets, wall hangings and table runners galore! My favorite challenge is to create rope art that looks like pottery. Come enjoy creating Rope Baskets with me!",
      speaker: ["Patti Tellechia (Rope Art By Patti T)"],
      location: "Hospitality (B Old Theater Building)",
      startTime: "2027-02-26T14:00:00",
      endTime: "2027-02-26T15:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-21",
      title: "Family Search",
      description:
        "I am a Family Search Consultant. Over the years I have gathered many stories, pictures, and worked with Ancestory.com, Family Search and other genealogy sites. I hope I will be able answer your questions that you may have, how to begin, finding one special story, or that one relative you do not know anything about or are just curious who you look like. Come search with me!",
      speaker: ["Marsha Spates"],
      location: "Hospitality (B Old Theater Building)",
      startTime: "2027-02-27T13:00:00",
      endTime: "2027-02-27T14:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-22",
      title: "Sewing Tips",
      description:
        "Brenda's Quilting Studio is a small, family owned, longarm quilting business located in the Yuma foothills area for over 20 years. With a background in custom tailoring-including formals and wedding alterations-Brenda brings deep expertise in fabric, fit and finishing to all she does. Today, she is passionate about helping quilters of all skill levels achieve a beautiful, professional finish on their hand-created quilts. Come join Brenda for Sewing tips!",
      speaker: ["Brenda Farris (Brenda's Quilting Studio)"],
      location: "Hospitality (B Old Theater Building)",
      startTime: "2027-02-27T14:00:00",
      endTime: "2027-02-27T15:00:00",
      category: "Forums",
    },
    {
      id: "yuma-session-23",
      title: "Chair Yoga",
      description:
        "Michelle has practiced yoga for over 15 years and became a certified yoga teacher in 2025. Michelle is passionate about sharing the gift of yoga with others. Her classes welcome both beginners and seasoned yogis, offering a supportive space for self-discovery and growth\u2014physically and spiritually. Her compassionate teaching style focuses on the whole client and their personal intention for practice. She strives to empower clients to explore their goals fully through self-awareness and the intentional development of mobility, range of motion, strength, and flexibility. Come try Chair Yoga with Michelle!",
      speaker: ["Michelle Estes (Certified Yoga Teacher, 2025)"],
      location: "Hospitality (B Old Theater Building)",
      startTime: "2027-02-27T15:00:00",
      endTime: "2027-02-27T16:00:00",
      category: "Forums",
    },
  ],
];

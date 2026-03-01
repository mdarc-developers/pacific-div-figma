// Import all conference data files at once using Vite's glob import
export const conferenceModules = import.meta.glob(
  "../data/*-20[0-9][0-9].ts",
  { eager: true },
);

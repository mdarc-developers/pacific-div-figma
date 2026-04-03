export function formatHeaderFull(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return timeFormatter.format(isoDate);
}

export function formatHeaderMonth(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    month: "long",
  });
  return timeFormatter.format(isoDate);
}

export function formatHeaderYear(isoDate: Date, tzString: string) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tzString,
    year: "numeric",
  });
  return timeFormatter.format(isoDate);
}

export function formatDateRange(
  start: string,
  end: string,
  timezoneNumeric: string,
  timezone: string,
): string {
  const startDate = new Date(`${start}T00:00:00${timezoneNumeric}`);
  const endDate = new Date(`${end}T00:00:00${timezoneNumeric}`);
  const startDateNum = start.split("-")[2];
  const endDateNum = end.split("-")[2];

  if (
    startDateNum === endDateNum &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${formatHeaderFull(startDate, timezone)}`;
  }

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return `${formatHeaderMonth(startDate, timezone)} ${startDateNum}-${endDateNum}, ${formatHeaderYear(startDate, timezone)}`;
  }

  return `${formatHeaderFull(startDate, timezone)} - ${formatHeaderFull(endDate, timezone)}`;
}

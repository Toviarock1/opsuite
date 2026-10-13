// Lagos (Africa/Lagos) is fixed at UTC+1 with no daylight saving,
// so midnight Lagos = 23:00 UTC the previous day.
// We build the day bounds from the Lagos calendar date to keep
// "today" correct regardless of where the server runs.

export function getLagosDayRange(now: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD

  const start = new Date(`${datePart}T00:00:00+01:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

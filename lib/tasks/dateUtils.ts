const jstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
});

export function todayDateString(): string {
  return jstFormatter.format(new Date());
}

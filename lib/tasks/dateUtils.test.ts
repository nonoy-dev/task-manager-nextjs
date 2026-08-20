import { describe, expect, it } from "vitest";
import { classifyDueDateUrgency } from "./dateUtils";

describe("classifyDueDateUrgency", () => {
  const now = new Date("2026-08-20T00:00:00+09:00");

  it("returns none when due date is missing", () => {
    expect(classifyDueDateUrgency(null, now)).toBe("none");
    expect(classifyDueDateUrgency(undefined, now)).toBe("none");
    expect(classifyDueDateUrgency("", now)).toBe("none");
  });

  it("returns overdue when due date is before today", () => {
    expect(classifyDueDateUrgency("2026-08-19", now)).toBe("overdue");
  });

  it("returns today when due date is today", () => {
    expect(classifyDueDateUrgency("2026-08-20", now)).toBe("today");
    expect(
      classifyDueDateUrgency("2026-08-20T00:00:00+09:00", now),
    ).toBe("today");
  });

  it("returns this_week for 1 to 6 days ahead", () => {
    expect(classifyDueDateUrgency("2026-08-21", now)).toBe("this_week");
    expect(classifyDueDateUrgency("2026-08-26", now)).toBe("this_week");
  });

  it("returns later for 7 or more days ahead", () => {
    expect(classifyDueDateUrgency("2026-08-27", now)).toBe("later");
  });
});

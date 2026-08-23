import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classifyDueDateUrgency } from "./dateUtils";

describe("classifyDueDateUrgency", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-20T00:00:00+09:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns none when due date is missing", () => {
    expect(classifyDueDateUrgency(null)).toBe("none");
  });

  it("returns overdue when due date is before today", () => {
    expect(classifyDueDateUrgency("2026-08-19")).toBe("overdue");
  });

  it("returns today when due date is today", () => {
    expect(classifyDueDateUrgency("2026-08-20")).toBe("today");
    expect(classifyDueDateUrgency("2026-08-20T00:00:00+09:00")).toBe("today");
  });

  it("returns this_week for 1 to 6 days ahead", () => {
    expect(classifyDueDateUrgency("2026-08-21")).toBe("this_week");
    expect(classifyDueDateUrgency("2026-08-26")).toBe("this_week");
  });

  it("returns later for 7 or more days ahead", () => {
    expect(classifyDueDateUrgency("2026-08-27")).toBe("later");
  });
});

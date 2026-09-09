import { describe, expect, it } from "vitest";
import {
  parseTaskListQuery,
  taskListQueryString,
} from "./taskListQuery";

describe("parseTaskListQuery", () => {
  it("returns an empty query for missing or blank params", () => {
    expect(parseTaskListQuery()).toEqual({});
    expect(
      parseTaskListQuery({
        q: "  ",
        status: "",
        priority: [],
        sort: undefined,
        direction: " ",
      }),
    ).toEqual({});
  });

  it("keeps valid filter and sort values", () => {
    expect(
      parseTaskListQuery({
        q: "  会議  ",
        status: "todo",
        priority: "high",
        sort: "due_date",
        direction: "ASC",
      }),
    ).toEqual({
      q: "会議",
      status: "todo",
      priority: "high",
      sort: "due_date",
      direction: "asc",
    });
  });

  it("drops unknown status, priority, sort, and direction", () => {
    expect(
      parseTaskListQuery({
        q: "ok",
        status: "archived",
        priority: "urgent",
        sort: "title",
        direction: "sideways",
      }),
    ).toEqual({ q: "ok" });
  });

  it("uses the first value when a param is an array", () => {
    expect(
      parseTaskListQuery({
        q: ["alpha", "beta"],
        status: ["done", "todo"],
        page: ["3", "1"],
      }),
    ).toEqual({
      q: "alpha",
      status: "done",
      page: 3,
    });
  });

  it("keeps page when it is greater than 1", () => {
    expect(parseTaskListQuery({ page: "2" })).toEqual({ page: 2 });
  });

  it("omits page when missing, 1, or invalid (treated as page 1)", () => {
    expect(parseTaskListQuery({})).toEqual({});
    expect(parseTaskListQuery({ page: "1" })).toEqual({});
    expect(parseTaskListQuery({ page: "0" })).toEqual({});
    expect(parseTaskListQuery({ page: "-2" })).toEqual({});
    expect(parseTaskListQuery({ page: "abc" })).toEqual({});
    expect(parseTaskListQuery({ page: "  " })).toEqual({});
  });
});

describe("taskListQueryString", () => {
  it("returns an empty string when there are no filters", () => {
    expect(taskListQueryString({})).toBe("");
  });

  it("omits empty keys and keeps a stable key order", () => {
    expect(
      taskListQueryString({
        direction: "asc",
        q: "会議",
        sort: "created_at",
      }),
    ).toBe("q=%E4%BC%9A%E8%AD%B0&sort=created_at&direction=asc");
  });

  it("includes page only when it is greater than 1", () => {
    expect(taskListQueryString({ page: 1 })).toBe("");
    expect(taskListQueryString({ page: 2 })).toBe("page=2");
    expect(
      taskListQueryString({
        q: "Rails",
        page: 3,
        status: "todo",
      }),
    ).toBe("q=Rails&status=todo&page=3");
  });

  it("round-trips through parseTaskListQuery", () => {
    const query = parseTaskListQuery({
      q: "Rails",
      status: "in_progress",
      priority: "low",
      sort: "due_date",
      direction: "desc",
      page: "2",
    });

    expect(taskListQueryString(query)).toBe(
      "q=Rails&status=in_progress&priority=low&sort=due_date&direction=desc&page=2",
    );
  });
});

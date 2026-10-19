import { describe, expect, it } from "vitest";
import {
  hasTaskListFilters,
  parseTaskListQuery,
  taskListPageHref,
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
        project: "12",
        sort: "due_date",
        direction: "ASC",
      }),
    ).toEqual({
      q: "会議",
      status: "todo",
      priority: "high",
      project: 12,
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

  it("drops invalid project ids", () => {
    expect(parseTaskListQuery({ project: "0" })).toEqual({});
    expect(parseTaskListQuery({ project: "-1" })).toEqual({});
    expect(parseTaskListQuery({ project: "abc" })).toEqual({});
    expect(parseTaskListQuery({ project: "1.5" })).toEqual({});
    expect(parseTaskListQuery({ project: "  " })).toEqual({});
  });

  it("uses the first value when a param is an array", () => {
    expect(
      parseTaskListQuery({
        q: ["alpha", "beta"],
        status: ["done", "todo"],
        project: ["7", "2"],
        page: ["3", "1"],
      }),
    ).toEqual({
      q: "alpha",
      status: "done",
      project: 7,
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

  it("includes project in stable key order", () => {
    expect(
      taskListQueryString({
        project: 5,
        q: "Rails",
        status: "todo",
      }),
    ).toBe("q=Rails&status=todo&project=5");
  });

  it("round-trips through parseTaskListQuery", () => {
    const query = parseTaskListQuery({
      q: "Rails",
      status: "in_progress",
      priority: "low",
      project: "9",
      sort: "due_date",
      direction: "desc",
      page: "2",
    });

    expect(taskListQueryString(query)).toBe(
      "q=Rails&status=in_progress&priority=low&project=9&sort=due_date&direction=desc&page=2",
    );
  });
});

describe("hasTaskListFilters", () => {
  it("is true when project filter is set", () => {
    expect(hasTaskListFilters({ project: 3 })).toBe(true);
    expect(hasTaskListFilters({})).toBe(false);
  });
});

describe("taskListPageHref", () => {
  it("returns / when there are no filters and page is 1", () => {
    expect(taskListPageHref({}, 1)).toBe("/");
  });

  it("omits page from the href when the target page is 1", () => {
    expect(
      taskListPageHref(
        {
          q: "Rails",
          status: "todo",
          page: 3,
        },
        1,
      ),
    ).toBe("/?q=Rails&status=todo");
  });

  it("keeps filters and sets page when the target page is greater than 1", () => {
    expect(
      taskListPageHref(
        {
          q: "Rails",
          status: "todo",
          priority: "high",
          project: 4,
          sort: "due_date",
          direction: "asc",
          page: 1,
        },
        2,
      ),
    ).toBe(
      "/?q=Rails&status=todo&priority=high&project=4&sort=due_date&direction=asc&page=2",
    );
  });

  it("replaces an existing page value with the target page", () => {
    expect(taskListPageHref({ page: 4, q: "memo" }, 3)).toBe(
      "/?q=memo&page=3",
    );
  });

  it("treats pages below 1 as page 1", () => {
    expect(taskListPageHref({ q: "Rails", page: 2 }, 0)).toBe("/?q=Rails");
    expect(taskListPageHref({ q: "Rails", page: 2 }, -1)).toBe("/?q=Rails");
  });
});

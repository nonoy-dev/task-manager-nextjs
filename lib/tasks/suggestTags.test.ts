import { describe, expect, it } from "vitest";
import {
  normalizeTagsInput,
  replaceLastTag,
  suggestTags,
} from "./suggestTags";

describe("suggestTags", () => {
  const existing = ["work", "urgent", "personal", "仕事"];

  it("returns prefix matches for the last comma-separated token", () => {
    expect(suggestTags("wo", existing)).toEqual(["work"]);
    expect(suggestTags("a,ur", existing)).toEqual(["urgent"]);
  });

  it("matches Japanese prefixes", () => {
    expect(suggestTags("仕", existing)).toEqual(["仕事"]);
  });

  it("returns no suggestions when the draft token is empty", () => {
    expect(suggestTags("", existing)).toEqual([]);
    expect(suggestTags("work,", existing)).toEqual([]);
    expect(suggestTags("work,  ", existing)).toEqual([]);
  });

  it("excludes tags already used in earlier segments", () => {
    expect(suggestTags("work,w", existing)).toEqual([]);
  });

  it("preserves existing order and limits to five", () => {
    const many = ["aa", "ab", "ac", "ad", "ae", "af"];
    expect(suggestTags("a", many)).toEqual(["aa", "ab", "ac", "ad", "ae"]);
  });

  it("matches prefixes case-insensitively", () => {
    expect(suggestTags("W", existing)).toEqual(["work"]);
    expect(suggestTags("WORK,u", existing)).toEqual(["urgent"]);
  });

  it("treats earlier segments as used case-insensitively", () => {
    expect(suggestTags("Work,w", existing)).toEqual([]);
  });

  it("hides a tag that already exactly matches the draft", () => {
    expect(suggestTags("work", existing)).toEqual([]);
    expect(suggestTags("WORK", existing)).toEqual([]);
    expect(suggestTags("a,urgent", existing)).toEqual([]);
  });
});

describe("replaceLastTag", () => {
  it("replaces only the last segment", () => {
    expect(replaceLastTag("wo", "work")).toEqual("work");
    expect(replaceLastTag("a, ur", "urgent")).toEqual("a,urgent");
  });
});

describe("normalizeTagsInput", () => {
  it("trims tags and joins with a single comma", () => {
    expect(normalizeTagsInput(" work , urgent ")).toBe("work,urgent");
  });

  it("removes duplicate tags while preserving first-seen order", () => {
    expect(normalizeTagsInput("work,urgent,work")).toBe("work,urgent");
  });

  it("lowercases tags and treats case variants as duplicates", () => {
    expect(normalizeTagsInput("Work,URGENT,work")).toBe("work,urgent");
  });

  it("drops blank segments", () => {
    expect(normalizeTagsInput("work,, ,urgent")).toBe("work,urgent");
  });

  it("returns an empty string when nothing remains", () => {
    expect(normalizeTagsInput(" ,  , ")).toBe("");
  });
});

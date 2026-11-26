const DEFAULT_LIMIT = 5;

export function lastTagParts(tagsInput: string): {
  completed: string[];
  draft: string;
} {
  const parts = tagsInput.split(",");
  const draft = parts.at(-1) ?? "";
  const completed = parts
    .slice(0, -1)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  return { completed, draft };
}

export function joinTagsInput(
  completed: readonly string[],
  draft: string,
): string {
  if (completed.length === 0) {
    return draft;
  }
  return `${completed.join(",")},${draft}`;
}

export function suggestTags(
  tagsInput: string,
  existingTags: readonly string[],
  limit: number = DEFAULT_LIMIT,
): string[] {
  const { completed, draft } = lastTagParts(tagsInput);
  const query = draft.trim();
  if (query.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const used = new Set(completed.map((tag) => tag.toLowerCase()));
  return existingTags
    .filter((tag) => {
      const tagLower = tag.toLowerCase();
      return (
        !used.has(tagLower) &&
        tagLower.startsWith(queryLower) &&
        tagLower !== queryLower
      );
    })
    .slice(0, limit);
}

export function replaceLastTag(tagsInput: string, suggestion: string): string {
  const { completed } = lastTagParts(tagsInput);
  return joinTagsInput([...completed, suggestion], "");
}

export function normalizeTagsInput(tagsInput: string): string {
  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of tagsInput.split(",")) {
    const tag = part.trim().toLowerCase();
    if (tag.length === 0 || seen.has(tag)) {
      continue;
    }
    seen.add(tag);
    tags.push(tag);
  }

  return tags.join(",");
}

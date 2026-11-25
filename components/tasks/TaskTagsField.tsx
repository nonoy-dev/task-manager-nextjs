"use client";

import { useEffect, useId, useState } from "react";
import { fieldClass, labelClass } from "@/components/shared/form";
import { TAGS_MAX_LENGTH } from "@/lib/tasks/validateTaskForm";
import { replaceLastTag, suggestTags } from "@/lib/tasks/suggestTags";

type TaskTagsFieldProps = {
  value: string;
  onChange: (value: string) => void;
  existingTags?: readonly string[];
  error?: string;
  maxLength?: number;
};

export function TaskTagsField({
  value,
  onChange,
  existingTags = [],
  error,
  maxLength = TAGS_MAX_LENGTH,
}: TaskTagsFieldProps) {
  const errorId = useId();
  const listId = useId();
  const optionIdPrefix = useId();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listDismissed, setListDismissed] = useState(false);

  const suggestions = listDismissed ? [] : suggestTags(value, existingTags);

  useEffect(() => {
    setActiveIndex(suggestions.length > 0 ? 0 : -1);
  }, [value, suggestions.length]);

  function applySuggestion(tag: string) {
    onChange(replaceLastTag(value, tag));
    setListDismissed(true);
    setActiveIndex(-1);
  }

  function handleChange(next: string) {
    setListDismissed(false);
    onChange(next);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        index < suggestions.length - 1 ? index + 1 : index,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index > 0 ? index - 1 : index));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      applySuggestion(suggestions[activeIndex]!);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setListDismissed(true);
      setActiveIndex(-1);
    }
  }

  const activeOptionId =
    activeIndex >= 0 ? `${optionIdPrefix}-${activeIndex}` : undefined;

  return (
    <div>
      <label>
        <span className={labelClass}>タグ（カンマ区切り）</span>
        <input
          type="text"
          className={fieldClass(Boolean(error))}
          value={value}
          maxLength={maxLength}
          placeholder="work,urgent"
          role="combobox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-autocomplete="list"
          aria-controls={suggestions.length > 0 ? listId : undefined}
          aria-expanded={suggestions.length > 0}
          aria-activedescendant={activeOptionId}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </label>
      {suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="タグの候補"
          className="mt-1 rounded-md border border-foreground/15 bg-background"
        >
          {suggestions.map((tag, index) => {
            const selected = index === activeIndex;
            return (
              <li
                key={tag}
                id={`${optionIdPrefix}-${index}`}
                role="option"
                aria-selected={selected}
                className={
                  selected
                    ? "cursor-pointer bg-foreground/10 px-3 py-1.5 text-sm"
                    : "cursor-pointer px-3 py-1.5 text-sm hover:bg-foreground/5"
                }
                onMouseDown={(event) => {
                  event.preventDefault();
                  applySuggestion(tag);
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {tag}
              </li>
            );
          })}
        </ul>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

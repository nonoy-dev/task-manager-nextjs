"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fieldClass, labelClass } from "@/components/shared/form";
import { TAGS_MAX_LENGTH } from "@/lib/tasks/validateTaskForm";
import {
  joinTagsInput,
  lastTagParts,
  replaceLastTag,
  suggestTags,
} from "@/lib/tasks/suggestTags";

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
  const hintId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const allowHoverHighlightRef = useRef(false);
  const ignoreDraftRef = useRef<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [listDismissed, setListDismissed] = useState(false);

  const { completed, draft } = lastTagParts(value);
  const suggestions = listDismissed ? [] : suggestTags(value, existingTags);
  const suggestionKey = suggestions.join("\0");
  const draftMaxLength = Math.max(
    0,
    maxLength - joinTagsInput(completed, "").length,
  );
  const describedBy = [hintId, error ? errorId : null].filter(Boolean).join(" ");

  useEffect(() => {
    allowHoverHighlightRef.current = false;
    setActiveIndex(-1);
  }, [value, suggestionKey]);

  function applySuggestion(tag: string) {
    ignoreDraftRef.current = draft;
    onChange(replaceLastTag(value, tag));
    setListDismissed(true);
    setActiveIndex(-1);
  }

  function handleDraftChange(nextDraft: string) {
    if (ignoreDraftRef.current !== null) {
      const ignoredDraft = ignoreDraftRef.current;
      ignoreDraftRef.current = null;
      if (nextDraft === ignoredDraft) {
        return;
      }
    }

    setListDismissed(false);
    allowHoverHighlightRef.current = false;
    setActiveIndex(-1);

    if (!nextDraft.includes(",")) {
      onChange(joinTagsInput(completed, nextDraft));
      return;
    }

    const parts = nextDraft.split(",");
    const trailingDraft = parts.at(-1) ?? "";
    const confirmed = parts
      .slice(0, -1)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
    onChange(joinTagsInput([...completed, ...confirmed], trailingDraft));
  }

  function removeChip(index: number) {
    const nextCompleted = completed.filter((_, i) => i !== index);
    onChange(joinTagsInput(nextCompleted, draft));
    inputRef.current?.focus();
  }

  function confirmDraft() {
    const tag = draft.trim();
    if (tag.length === 0) {
      return false;
    }
    ignoreDraftRef.current = draft;
    onChange(joinTagsInput([...completed, tag], ""));
    setListDismissed(true);
    setActiveIndex(-1);
    return true;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Backspace" && draft.length === 0 && completed.length > 0) {
      event.preventDefault();
      removeChip(completed.length - 1);
      return;
    }

    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((index) =>
        index < suggestions.length - 1 ? index + 1 : index,
      );
      return;
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index >= 0 ? index - 1 : -1));
      return;
    }

    if (event.key === ",") {
      if (confirmDraft()) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Enter") {
      if (suggestions.length > 0 && activeIndex >= 0) {
        event.preventDefault();
        applySuggestion(suggestions[activeIndex]!);
        return;
      }
      if (confirmDraft()) {
        event.preventDefault();
      }
      return;
    }

    if (event.key === "Escape" && suggestions.length > 0) {
      event.preventDefault();
      setListDismissed(true);
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      <label htmlFor={inputId} className={labelClass}>
        タグ
      </label>
      <div
        className={`${fieldClass(Boolean(error))} flex flex-wrap items-center gap-1.5`}
        onClick={() => inputRef.current?.focus()}
      >
        {completed.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-foreground/10 px-2 py-0.5 text-sm"
          >
            {tag}
            <button
              type="button"
              aria-label={`${tag}を削除`}
              className="text-foreground/60 hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                removeChip(index);
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none"
          value={draft}
          maxLength={draftMaxLength}
          placeholder={completed.length === 0 ? "work,urgent" : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => handleDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
      {suggestions.length > 0 ? (
        <ul
          className="mt-1 rounded-md border border-foreground/15 bg-background"
          onMouseMove={() => {
            allowHoverHighlightRef.current = true;
          }}
        >
          {suggestions.map((tag, index) => {
            const selected = index === activeIndex;
            return (
              <li key={tag}>
                <button
                  type="button"
                  tabIndex={-1}
                  className={
                    selected
                      ? "w-full cursor-pointer bg-foreground/10 px-3 py-1.5 text-left text-sm"
                      : "w-full cursor-pointer px-3 py-1.5 text-left text-sm hover:bg-foreground/5"
                  }
                  onMouseDown={(event) => {
                    event.preventDefault();
                    applySuggestion(tag);
                  }}
                  onMouseEnter={() => {
                    if (!allowHoverHighlightRef.current) {
                      return;
                    }
                    setActiveIndex(index);
                  }}
                >
                  {tag}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      <p id={hintId} className="mt-1 text-sm text-foreground/60">
        カンマまたは Enter で追加。↑↓で候補
      </p>
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

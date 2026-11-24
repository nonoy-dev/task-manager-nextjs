"use client";

import { useEffect, useRef } from "react";
import { TaskCreateForm } from "./TaskCreateForm";

type TaskCreateModalProps = {
  projects?: readonly { id: number; name: string }[];
};

function supportsDialogClosedBy() {
  return "closedBy" in HTMLDialogElement.prototype;
}

function isClickOnDialogBackdrop(
  dialog: HTMLDialogElement,
  event: MouseEvent,
) {
  if (event.target !== dialog) {
    return false;
  }

  const rect = dialog.getBoundingClientRect();
  const insidePanel =
    rect.top <= event.clientY &&
    event.clientY <= rect.bottom &&
    rect.left <= event.clientX &&
    event.clientX <= rect.right;

  return !insidePanel;
}

function attachBackdropClickClose(dialog: HTMLDialogElement) {
  function handleClick(event: MouseEvent) {
    if (!isClickOnDialogBackdrop(dialog, event)) {
      return;
    }
    dialog.close();
  }

  dialog.addEventListener("click", handleClick);
  return () => dialog.removeEventListener("click", handleClick);
}

export function TaskCreateModal({ projects = [] }: TaskCreateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || supportsDialogClosedBy()) {
      return;
    }

    return attachBackdropClickClose(dialog);
  }, []);

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
      >
        追加
      </button>
      <dialog
        ref={dialogRef}
        closedby="any"
        className="fixed left-1/2 top-1/2 z-50 m-0 w-[min(100%-2rem,32rem)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-foreground/10 bg-background p-0 shadow-lg backdrop:bg-black/40"
      >
        <div className="p-4">
          <TaskCreateForm
            projects={projects}
            onCreated={closeDialog}
            onCancel={closeDialog}
          />
        </div>
      </dialog>
    </>
  );
}

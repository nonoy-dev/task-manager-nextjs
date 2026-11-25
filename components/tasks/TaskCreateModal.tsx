"use client";

import { useEffect, useRef, useState } from "react";
import { TaskCreateForm } from "./TaskCreateForm";

type TaskCreateModalProps = {
  projects?: readonly { id: number; name: string }[];
  existingTags?: readonly string[];
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

export function TaskCreateModal({
  projects = [],
  existingTags = [],
}: TaskCreateModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || supportsDialogClosedBy()) {
      return;
    }

    return attachBackdropClickClose(dialog);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    function handleClose() {
      setFormKey((key) => key + 1);
    }

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
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
            key={formKey}
            projects={projects}
            existingTags={existingTags}
            onCreated={closeDialog}
            onCancel={closeDialog}
          />
        </div>
      </dialog>
    </>
  );
}

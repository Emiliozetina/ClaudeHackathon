"use client";

import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui";
import { formatSize } from "@/lib/cv/format";
import { IconFile, IconUpload } from "./CvIcons";

export type UploadState =
  | { status: "idle" }
  | { status: "reading"; fileName: string }
  | { status: "error"; message: string }
  | { status: "done"; fileName: string; size: number };

/**
 * The uploaded-file row from the NEXA frame ("Amara_Okafor_CV.pdf · PDF · 240 KB
 * · uploaded" + Replace). The empty drop zone, the "reading" state and the error
 * state are not in Figma yet, so they reuse the same card and tokens.
 */
export function CvUpload({ state, onFile }: { state: UploadState; onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => inputRef.current?.click();

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFile(file);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      aria-label="Upload your CV (PDF)"
      onChange={(event) => {
        const file = event.target.files?.[0];
        // Reset so choosing the same file again still fires onChange.
        event.target.value = "";
        if (file) onFile(file);
      }}
    />
  );

  if (state.status === "done" || state.status === "reading") {
    const reading = state.status === "reading";
    return (
      <div className="flex items-center gap-4 rounded-md border border-border-default bg-surface-page p-[15px]">
        {input}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <IconFile className="size-5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="type-label truncate text-text-primary">{state.fileName}</span>
          <span className="type-caption text-text-secondary" aria-live="polite">
            {reading ? "Claude is reading your CV…" : `PDF · ${formatSize(state.size)} · uploaded`}
          </span>
        </div>
        {reading ? (
          <span
            role="status"
            aria-label="Reading your CV"
            className="mr-3 size-5 shrink-0 animate-spin rounded-pill border-2 border-border-default border-t-teal-700"
          />
        ) : (
          <Button variant="ghost" onClick={openPicker}>
            Replace
          </Button>
        )}
      </div>
    );
  }

  const error = state.status === "error" ? state.message : null;
  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-3 rounded-md border border-dashed px-6 py-8 text-center ${
          dragging ? "border-teal-700 bg-teal-50" : "border-teal-700 bg-surface-page"
        }`}
      >
        {input}
        <span className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
          <IconUpload className="size-5" />
        </span>
        <p className="type-label text-text-primary">Drop your CV here, or choose a file</p>
        <p className="type-caption text-text-secondary">PDF only, up to 4 MB</p>
        <Button variant="secondary" onClick={openPicker}>
          Choose a PDF
        </Button>
      </div>
      {error && (
        <p role="alert" className="type-body-sm rounded-md bg-status-error-bg p-3 text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}

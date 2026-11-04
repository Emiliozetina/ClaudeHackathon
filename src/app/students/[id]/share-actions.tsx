"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

/** Portfolio link with a Copy button (Figma 14: "Share" card). */
export function CopyLinkField({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex items-center gap-[8px] rounded-md border border-border-default bg-surface-page py-[11px] pr-[12px] pl-[13px]">
      <Icon name="link-5b6472-16" />
      <span className="type-body-sm min-w-0 flex-1 truncate text-text-primary">
        nexa.work{path}
      </span>
      <Button variant="ghost" onClick={copy} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

/** Uses the browser's print dialog, which can save the page as a PDF. */
export function DownloadPdfButton() {
  return (
    <Button variant="secondary" className="w-full" onClick={() => window.print()}>
      Download as PDF
    </Button>
  );
}

import { useEffect, useState } from "react";
import Stamp from "../components/Stamp";
import StatusPill from "../components/StatusPill";
import { nextStep } from "../lib/nextStep";
import { shortDay } from "../lib/dates";
import type { SavedJob } from "../types";
import "./SavedDetails.css";

type SavedDetailsProps = {
  job: SavedJob;
  entryNo: number;
  onBack: () => void;
};

type Copied = "id" | "description" | null;

// green check shown for a moment after copying; the hidden text is read by screen readers
function CopiedMark() {
  return (
    <>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 13l4 4L19 7" />
      </svg>
      <span className="details__sr">copied</span>
    </>
  );
}

export default function SavedDetails({
  job,
  entryNo,
  onBack,
}: SavedDetailsProps) {
  const [copied, setCopied] = useState<Copied>(null);
  const next = nextStep(job);

  // start at the top of the page, not wherever the list was scrolled to
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function copy(text: string, what: Copied) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // clipboard can fail if the panel isn't focused; nothing else to do
    }
  }

  return (
    <main className="page details">
      <button type="button" className="details__back" onClick={onBack}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
        journal
      </button>

      {job.site && <Stamp site={job.site} />}

      <div className="details__head">
        <p className="details__label">
          ENTRY NO. {String(entryNo).padStart(3, "0")}
        </p>
        <h1 className="details__title">{job.title}</h1>
        <p className="details__company">
          {[job.company, job.location].filter(Boolean).join(" · ")}
        </p>
      </div>

      <div className="details__status">
        <StatusPill status={job.status} />
        <span
          className={
            next.tone ? `entry__next entry__next--${next.tone}` : "entry__next"
          }
        >
          {next.text}
        </span>
      </div>

      <hr className="details__rule" />

      <dl className="details__facts">
        <div>
          <dt>JOB ID</dt>
          <dd>
            {job.jobId ? (
              <>
                {job.jobId}
                <button
                  type="button"
                  className={
                    copied === "id"
                      ? "details__copy details__copy--done"
                      : "details__copy"
                  }
                  onClick={() => copy(job.jobId, "id")}
                >
                  {copied === "id" ? <CopiedMark /> : "copy"}
                </button>
              </>
            ) : (
              <span className="details__none">not listed</span>
            )}
          </dd>
        </div>
        <div>
          <dt>APPLY BY</dt>
          <dd>
            {job.applyBy || <span className="details__none">not listed</span>}
          </dd>
        </div>
        <div>
          <dt>SAVED</dt>
          <dd>{shortDay(new Date(job.savedAt))}</dd>
        </div>
        {job.appliedAt && (
          <div>
            <dt>APPLIED</dt>
            <dd>{shortDay(new Date(job.appliedAt))}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="details-desc">
        <div className="details__row">
          <p id="details-desc" className="details__label">
            DESCRIPTION
          </p>
          {job.description && (
            <button
              type="button"
              className={
                copied === "description"
                  ? "details__copy details__copy--done"
                  : "details__copy"
              }
              onClick={() => copy(job.description, "description")}
            >
              {copied === "description" ? <CopiedMark /> : "copy"}
            </button>
          )}
        </div>
        {/* tabIndex lets keyboard users scroll the box */}
        <div
          className="details__desc"
          tabIndex={0}
          aria-labelledby="details-desc"
        >
          {job.description || "no description was saved for this job."}
        </div>
      </section>

      {job.url && (
        <div className="details__footer">
          <a href={job.url} target="_blank" rel="noreferrer">
            application on {job.site ? job.site.toLowerCase() : "the site"} ↗
          </a>
          <p className="details__hint">
            postings can be taken down, but your copy stays here
          </p>
        </div>
      )}
    </main>
  );
}

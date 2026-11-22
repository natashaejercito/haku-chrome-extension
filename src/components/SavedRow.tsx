import { useState } from "react";
import StatusPill from "./StatusPill";
import { deleteJob, updateJob } from "../lib/storage";
import { nextStep } from "../lib/nextStep";
import type { JobStatus, SavedJob } from "../types";
import "./SavedRow.css";

const statuses: JobStatus[] = ["saved", "applied", "interview", "rejected"];

type SavedRowProps = {
  job: SavedJob;
  entryNo: number;
  onOpen: (id: string) => void;
};

export default function SavedRow({ job, entryNo, onOpen }: SavedRowProps) {
  const [open, setOpen] = useState(false);
  const next = nextStep(job);
  const detailsId = `entry-${job.id}`;

    function changeStatus(status: JobStatus) {
    if (status === job.status) return;
    const now = new Date().toISOString();
    updateJob(job.id, {
      status,
      statusChangedAt: now,
      // remember the first time you applied, even after it moves on to interview
      ...(status === 'applied' && !job.appliedAt ? { appliedAt: now } : {}),
    });
  }

  return (
    <li className="entry">
      <button
        type="button"
        className="entry__row"
        aria-expanded={open}
        aria-controls={detailsId}
        onClick={() => setOpen(!open)}
      >
        <span className="entry__no">{String(entryNo).padStart(3, "0")}</span>
        <span className="entry__info">
          <span className="entry__title">{job.title}</span>
          <span className="entry__company">
            {[job.company, job.location].filter(Boolean).join(" · ")}
          </span>
          <span className="entry__meta">
            <StatusPill status={job.status} />
            <span
              className={
                next.tone
                  ? `entry__next entry__next--${next.tone}`
                  : "entry__next"
              }
            >
              {next.text}
            </span>
          </span>
        </span>
        <svg
          className="entry__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>

      {open && (
        <div id={detailsId} className="entry__details">
          <div className="entry__statuses" role="group" aria-label="Status">
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                className={job.status === status ? "chip chip--on" : "chip"}
                aria-pressed={job.status === status}
                onClick={() => changeStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {job.status === "interview" && (
            <label className="entry__date">
              INTERVIEW DATE
              <input
                type="date"
                value={job.interviewDate ?? ""}
                onChange={(e) =>
                  updateJob(job.id, { interviewDate: e.target.value })
                }
              />
            </label>
          )}

          <div className="entry__links">
            <button
              type="button"
              className="entry__more"
              onClick={() => onOpen(job.id)}
            >
              more details →
            </button>
            <button
              type="button"
              className="entry__remove"
              onClick={() => deleteJob(job.id)}
            >
              remove
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

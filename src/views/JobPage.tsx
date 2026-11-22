import { useCallback, useEffect, useState } from "react";
import Field from "../components/Field";
import PressedClover from "../components/PressedClover";
import ThisWeek from "../components/ThisWeek";
import { readCurrentJob } from "../lib/extract";
import { countThisWeek, getJobs, saveJob } from "../lib/storage";
import { findDuplicate } from "../lib/duplicates";
import type { ExtractedJob, JobDraft, SavedJob } from "../types";
import "./JobPage.css";

type Status = "reading" | "ready" | "nothing" | "saved";

const emptyJob: ExtractedJob = {
  title: "",
  company: "",
  location: "",
  jobId: "",
  applyBy: "",
  description: "",
  site: "",
  url: "",
};

function shortDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toLowerCase();
}

function todayLabel(): string {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toLowerCase();
}

export default function JobPage() {
  const [job, setJob] = useState<ExtractedJob>(emptyJob);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [status, setStatus] = useState<Status>("reading");

  // puts what we found on the page into the form
  const showJob = useCallback((found: ExtractedJob | null) => {
    if (found && found.title) {
      setJob(found);
      setStatus("ready");
    } else {
      setJob(emptyJob);
      setStatus("nothing");
    }
  }, []);

  // read the job on the current tab
  // (callers set the 'reading' status first; status already starts as 'reading')
  const loadPage = useCallback(() => readCurrentJob().then(showJob), [showJob]);

  useEffect(() => {
    getJobs().then(setSavedJobs);
    loadPage();

    // LinkedIn loads the job a moment after the URL changes, so wait a bit
    let timer: number | undefined;
    const reloadSoon = () => {
      window.clearTimeout(timer);
      setStatus("reading");
      timer = window.setTimeout(loadPage, 800);
    };
    const onUpdated = (
      _tabId: number,
      info: { url?: string; status?: string },
    ) => {
      if (info.url || info.status === "complete") reloadSoon();
    };

    chrome.tabs.onActivated.addListener(reloadSoon); // switched browser tabs
    chrome.tabs.onUpdated.addListener(onUpdated); // clicked another job
    return () => {
      window.clearTimeout(timer);
      chrome.tabs.onActivated.removeListener(reloadSoon);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [loadPage]);

  const update = (key: keyof JobDraft) => (value: string) =>
    setJob((prev) => ({ ...prev, [key]: value }));

  const duplicate = job.title ? findDuplicate(job, savedJobs) : undefined;
  const entryNo = String(savedJobs.length + 1).padStart(3, "0");

  let message = "";
  if (status === "reading") message = "reading this page…";
  else if (status === "saved") message = "pressed into your journal!";
  else if (duplicate)
    message = `already in your journal · saved ${shortDate(new Date(duplicate.savedAt))}`;
  else if (status === "nothing")
    message = "no job found here. open a job posting, or fill it in yourself.";

  function rereadPage() {
    setStatus("reading");
    loadPage();
  }

  async function handleSave() {
    if (duplicate || !job.title.trim()) return;
    await saveJob(job);
    setSavedJobs(await getJobs());
    setStatus("saved");
  }

  return (
    <>
      <main className="page">
        <PressedClover />

        <div>
          <p className="entry__no">ENTRY NO. {entryNo}</p>
          <h1 className="entry__date">{todayLabel()}</h1>
          <svg
            className="entry__squiggle"
            width="120"
            height="8"
            aria-hidden="true"
          >
            <path d="M2 5 C 30 2, 60 7, 90 4 S 116 3, 118 5" />
          </svg>
        </div>

        <p
          role="status"
          className={
            duplicate && status !== "saved"
              ? "page__status page__status--warn"
              : "page__status"
          }
        >
          {message}
        </p>

        <form
          className="page__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Field
            label="Job title"
            value={job.title}
            onChange={update("title")}
          />

          <div className="page__row">
            <Field
              label="Company"
              value={job.company}
              onChange={update("company")}
            />
            <Field
              label="Location"
              value={job.location}
              onChange={update("location")}
            />
          </div>

          <div className="page__row">
            <Field
              label="Job ID"
              variant="mono"
              value={job.jobId}
              onChange={update("jobId")}
            />
            <Field
              label="Apply by"
              variant="deadline"
              placeholder="not listed"
              value={job.applyBy}
              onChange={update("applyBy")}
            />
          </div>

          <div className="field">
            <label htmlFor="job-description" className="field__label">
              Description
            </label>
            <textarea
              id="job-description"
              className="desc__box"
              value={job.description}
              onChange={(e) => update("description")(e.target.value)}
            />
          </div>

          <div className="page__actions">
            <button
              type="submit"
              className="btn-save"
              disabled={!job.title.trim() || Boolean(duplicate)}
            >
              {duplicate ? "already saved" : "save to journal"}
            </button>
            <button type="button" className="btn-link" onClick={rereadPage}>
              read page again
            </button>
          </div>
        </form>
      </main>

      <ThisWeek count={countThisWeek(savedJobs)} />
    </>
  );
}

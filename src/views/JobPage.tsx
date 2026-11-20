import { useState } from "react";
import Field from "../components/Field";
import PressedClover from "../components/PressedClover";
import Stamp from "../components/Stamp";
import ThisWeek from "../components/ThisWeek";
import "./JobPage.css";

type JobDraft = {
  title: string;
  company: string;
  location: string;
  jobId: string;
  applyBy: string;
  description: string;
};

const sampleJob: JobDraft = {
  title: "Junior Software Developer",
  company: "Northwind Labs",
  location: "Toronto, ON",
  jobId: "R-12345",
  applyBy: "Nov 30",
  description:
    "You'll build features in React and TypeScript and work with our Node.js APIs.",
};

function todayLabel() {
  return new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
    .toLowerCase(); // e.g. "wed, nov 18"
}

export default function JobPage() {
  const [job, setJob] = useState<JobDraft>(sampleJob);

  // returns a function that updates one field, e.g. update('title')
  const update = (key: keyof JobDraft) => (value: string) =>
    setJob((prev) => ({ ...prev, [key]: value }));

  function handleSave() {
    console.log("Saving job:", job); // replaced with chrome.storage later
  }

  return (
    <>
      <main className="page">
        <PressedClover />

        <div>
          <p className="entry__no">ENTRY NO. 018</p>
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
            <button type="submit" className="btn-save">
              save to journal
            </button>
            <button type="button" className="btn-link">
              autofill
            </button>
          </div>
        </form>

        <Stamp site="LinkedIn" />
      </main>

      <ThisWeek count={5} />
    </>
  );
}

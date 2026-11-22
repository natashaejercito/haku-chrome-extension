import { useEffect, useState } from "react";
import SavedRow from "../components/SavedRow";
import { getJobs, onJobsChanged } from "../lib/storage";
import { weekLabel } from "../lib/dates";
import type { JobStatus, SavedJob } from "../types";
import "./SavedPage.css";

type Filter = "all" | JobStatus;
const filters: Filter[] = ["all", "saved", "applied", "interview", "rejected"];

export default function SavedPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    getJobs().then(setJobs);
    return onJobsChanged(setJobs); // stops listening when the page closes
  }, []);

  // entry numbers follow the order jobs were saved in
  const entryNo = new Map(jobs.map((job, i) => [job.id, i + 1]));
  const count = (f: Filter) =>
    f === "all" ? jobs.length : jobs.filter((j) => j.status === f).length;

  // newest first, then grouped by week
  const shown = jobs
    .filter((job) => filter === "all" || job.status === filter)
    .reverse();
  const groups: { label: string; jobs: SavedJob[] }[] = [];
  for (const job of shown) {
    const label = weekLabel(job.savedAt);
    const group = groups.find((g) => g.label === label);
    if (group) group.jobs.push(job);
    else groups.push({ label, jobs: [job] });
  }

  return (
    <>
      <main className="page">
        <div className="journal__head">
          <h1 className="journal__title">your journal</h1>
          <p className="journal__count">
            {jobs.length} {jobs.length === 1 ? "ENTRY" : "ENTRIES"}
          </p>
        </div>

        <div
          className="journal__filters"
          role="group"
          aria-label="Filter by status"
        >
          {filters
            .filter((f) => f === "all" || f === filter || count(f) > 0) // hide empty filters
            .map((f) => (
              <button
                key={f}
                type="button"
                className={filter === f ? "chip chip--on" : "chip"}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f} {count(f)}
              </button>
            ))}
        </div>

        {jobs.length === 0 && (
          <p className="journal__empty">
            nothing pressed yet. save a job from the job tab and it'll show up
            here.
          </p>
        )}

        {groups.map((group) => (
          <section key={group.label} aria-label={group.label.toLowerCase()}>
            <p className="journal__week">{group.label}</p>
            <ul className="journal__list">
              {group.jobs.map((job) => (
                <SavedRow
                  key={job.id}
                  job={job}
                  entryNo={entryNo.get(job.id) ?? 0}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>

      <aside className="journal__note" aria-label="Encouragement">
        <p>
          and let us not be weary in well doing: for in due season we shall
          reap, if we faint not.
        </p>
        <p className="journal__ref">— galatians 6:9</p>
      </aside>
    </>
  );
}

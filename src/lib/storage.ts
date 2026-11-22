import type { ExtractedJob, SavedJob } from "../types";

export async function getJobs(): Promise<SavedJob[]> {
  const { jobs } = await chrome.storage.local.get("jobs");
  const list = (jobs as SavedJob[] | undefined) ?? [];
  // jobs saved before statuses existed count as "saved"
  return list.map((job) => ({
    ...job,
    status: job.status ?? "saved",
    statusChangedAt: job.statusChangedAt ?? job.savedAt,
  }));
}

export async function saveJob(job: ExtractedJob): Promise<SavedJob> {
  const jobs = await getJobs();
  const now = new Date().toISOString();
  const saved: SavedJob = {
    ...job,
    id: crypto.randomUUID(),
    savedAt: now,
    status: "saved",
    statusChangedAt: now,
  };
  await chrome.storage.local.set({ jobs: [...jobs, saved] });
  return saved;
}

// change some fields of one saved job, e.g. its status
export async function updateJob(
  id: string,
  changes: Partial<SavedJob>,
): Promise<void> {
  const jobs = await getJobs();
  await chrome.storage.local.set({
    jobs: jobs.map((job) => (job.id === id ? { ...job, ...changes } : job)),
  });
}

export async function deleteJob(id: string): Promise<void> {
  const jobs = await getJobs();
  await chrome.storage.local.set({ jobs: jobs.filter((job) => job.id !== id) });
}

// runs `callback` with the new list whenever saved jobs change.
// Returns a function that stops listening (use it as a useEffect cleanup).
export function onJobsChanged(
  callback: (jobs: SavedJob[]) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string,
  ) => {
    if (area === "local" && changes.jobs) getJobs().then(callback);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export function countThisWeek(jobs: SavedJob[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return jobs.filter((job) => Date.parse(job.savedAt) >= weekAgo).length;
}
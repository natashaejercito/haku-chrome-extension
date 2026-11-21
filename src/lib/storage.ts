import type { ExtractedJob, SavedJob } from "../types";

export async function getJobs(): Promise<SavedJob[]> {
  const { jobs } = await chrome.storage.local.get("jobs");
  return (jobs as SavedJob[] | undefined) ?? [];
}

export async function saveJob(job: ExtractedJob): Promise<SavedJob> {
  const jobs = await getJobs();
  const saved: SavedJob = {
    ...job,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  await chrome.storage.local.set({ jobs: [...jobs, saved] });
  return saved;
}

export function countThisWeek(jobs: SavedJob[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return jobs.filter((job) => Date.parse(job.savedAt) >= weekAgo).length;
}

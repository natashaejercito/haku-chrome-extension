import type { ExtractedJob, SavedJob } from "../types";

// "Northwind Labs, Inc." and "northwind labs" become the same text
function clean(text: string): string {
  return text
    .toLowerCase()
    .replace(/\b(inc|ltd|llc|corp|corporation)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// drops tracking bits like ?utm_source=... from links
function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.origin + u.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function findDuplicate(
  job: ExtractedJob,
  saved: SavedJob[],
): SavedJob | undefined {
  return saved.find((s) => {
    const sameId =
      job.jobId !== "" && s.jobId === job.jobId && s.site === job.site;
    const sameUrl = job.url !== "" && cleanUrl(s.url) === cleanUrl(job.url);
    const sameRole =
      clean(job.company) !== "" &&
      clean(job.title) !== "" &&
      clean(s.company) === clean(job.company) &&
      clean(s.title) === clean(job.title);
    return sameId || sameUrl || sameRole;
  });
}

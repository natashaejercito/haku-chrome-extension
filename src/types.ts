// what you can edit in the form
export type JobDraft = {
  title: string;
  company: string;
  location: string;
  jobId: string;
  applyBy: string;
  description: string;
};

// what Haku reads from a page: the form fields + where it came from
export type ExtractedJob = JobDraft & {
  site: string; // e.g. "LinkedIn"
  url: string;
};

// what gets stored in your journal
export type JobStatus = "saved" | "applied" | "interview" | "rejected";

// what gets stored in your journal
export type SavedJob = ExtractedJob & {
  id: string;
  savedAt: string;
  status: JobStatus;
  statusChangedAt: string;
  appliedAt?: string; // ISO date, the first time it was marked applied
  interviewDate?: string;
};

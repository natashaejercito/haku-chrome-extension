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

export type QuestionType = 'technical' | 'behavioural' | 'company';

export type PrepQuestion = {
  id: string;
  type: QuestionType;
  text: string;
  answer?: string;
  practicedAt?: string; // when you pressed it
};

export type Prep = {
  skills: string[];
  questions: PrepQuestion[];
  createdAt: string;
};

export type SavedJob = ExtractedJob & {
  id: string;
  savedAt: string;
  status: JobStatus;
  statusChangedAt: string;
  appliedAt?: string;
  interviewDate?: string;
  prep?: Prep; // saved once, so Gemini is only asked once per job
};


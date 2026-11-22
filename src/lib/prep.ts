import { daysFromToday, localDate } from "./dates";
import type { PrepQuestion, SavedJob } from "../types";

// the soonest interview that is today or later
export function nextInterview(jobs: SavedJob[]): SavedJob | undefined {
  return jobs
    .filter((job) => job.status === "interview" && job.interviewDate)
    .filter((job) => daysFromToday(localDate(job.interviewDate!)) >= 0)
    .sort((a, b) => a.interviewDate!.localeCompare(b.interviewDate!))[0];
}

function practicedToday(q: PrepQuestion): boolean {
  return !!q.practicedAt && daysFromToday(new Date(q.practicedAt)) === 0;
}

// up to 3 a day: ones you pressed today stay, then the next ones not done yet
export function todaysQuestions(questions: PrepQuestion[]): PrepQuestion[] {
  return questions
    .filter((q) => practicedToday(q) || !q.practicedAt)
    .slice(0, 3);
}

// "6 days to go. you've got this!"
export function countdownNote(days: number): string {
  if (days === 0) return "it's today. you've got this!";
  if (days === 1) return "it's tomorrow. you've got this!";
  return `${days} days to go. you've got this!`;
}

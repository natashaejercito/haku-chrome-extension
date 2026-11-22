import { daysFromToday, localDate, shortDay } from "./dates";
import type { SavedJob } from "../types";

export type NextStep = { text: string; tone?: "soon" | "deadline" };

export function nextStep(job: SavedJob): NextStep {
  if (job.status === "interview") {
    if (!job.interviewDate) return { text: "add interview date" };
    const date = localDate(job.interviewDate);
    const days = daysFromToday(date);
    if (days === 0) return { text: "today", tone: "soon" };
    if (days === 1) return { text: "tomorrow", tone: "soon" };
    if (days > 1)
      return { text: `in ${days} days · ${shortDay(date)}`, tone: "soon" };
    return { text: `was ${shortDay(date)}` };
  }

  if (job.status === "applied") {
    const days = -daysFromToday(new Date(job.statusChangedAt));
    if (days <= 0) return { text: "today" };
    if (days === 1) return { text: "yesterday" };
    return { text: `${days} days ago` };
  }

  if (job.status === "rejected") return { text: "not this time" };

  // saved
  return job.applyBy
    ? { text: `apply by ${job.applyBy.toLowerCase()}`, tone: "deadline" }
    : { text: "no deadline" };
}

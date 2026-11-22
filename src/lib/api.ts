import type { Prep, QuestionType, SavedJob } from "../types";

const SERVER = import.meta.env.VITE_SERVER_URL as string;

type PrepReply = {
  skills: string[];
  questions: { type: QuestionType; text: string }[];
};

// Render's free tier sleeps after 15 minutes; this wakes it early, and errors are ignored
export function wakeServer() {
  fetch(`${SERVER}/health`).catch(() => {});
}

export async function fetchPrep(job: SavedJob): Promise<Prep> {
  let res: Response;
  try {
    res = await fetch(`${SERVER}/prep/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: job.title,
        company: job.company,
        description: job.description,
      }),
    });
  } catch {
    // fetch only throws when it can't reach the server at all
    throw new Error(
      "can't reach the haku server. is it running? (npm run dev in /server)",
    );
  }

  if (res.status === 400) throw new Error("this job needs a description first");
  if (!res.ok) throw new Error("gemini had trouble. try again in a minute");

  const data: PrepReply = await res.json();
  return {
    skills: data.skills.slice(0, 6),
    questions: data.questions.map((q) => ({
      id: crypto.randomUUID(),
      type: q.type,
      text: q.text,
    })),
    createdAt: new Date().toISOString(),
  };
}

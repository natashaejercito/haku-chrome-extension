import { useEffect, useRef, useState } from "react";
import clover from "../assets/clover.svg";
import QuestionCard from "../components/QuestionCard";
import { fetchPrep, wakeServer } from "../lib/api";
import { daysFromToday, localDate } from "../lib/dates";
import { countdownNote, nextInterview, todaysQuestions } from "../lib/prep";
import { getJobs, onJobsChanged, updateJob } from "../lib/storage";
import type { SavedJob } from "../types";
import "./PrepPage.css";

const tilts = [-10, 12, -4, 18, -14, 6, -8, 14, -2, 10];

export default function PrepPage() {
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const asked = useRef(new Set<string>()); // jobs we already asked Gemini about

  useEffect(() => {
    wakeServer();
    getJobs().then((all) => {
      setJobs(all);
      setLoaded(true);
    });
    return onJobsChanged(setJobs);
  }, []);

  const job = nextInterview(jobs);

  function generate(target: SavedJob) {
    asked.current.add(target.id);
    fetchPrep(target)
      .then((prep) => updateJob(target.id, { prep }))
      .catch((err: Error) => setError(err.message));
  }

  // ask Gemini once, the first time an interview job has no questions yet
  useEffect(() => {
    if (job && !job.prep && !asked.current.has(job.id)) generate(job);
  }, [job]);

  function retry() {
    if (!job) return;
    setError("");
    generate(job);
  }

  if (!loaded) return null;

  if (!job) {
    return (
      <main className="page prep">
        <p className="prep__lbl">NEXT INTERVIEW</p>
        <p className="prep__empty">
          no interviews yet. when you get one, open the job in your journal, set
          it to interview and add the date. your questions will show up here.
        </p>
      </main>
    );
  }

  const date = localDate(job.interviewDate!);
  const days = daysFromToday(date);
  const questions = job.prep?.questions ?? [];
  const practiced = questions.filter((q) => q.practicedAt).length;
  const today = todaysQuestions(questions);
  const openQuestion =
    openId ?? today.find((q) => !q.practicedAt)?.id ?? today[0]?.id;

  function press(questionId: string, answer: string) {
    if (!job?.prep) return;
    const now = new Date().toISOString();
    const updated = job.prep.questions.map((q) =>
      q.id === questionId ? { ...q, answer, practicedAt: now } : q,
    );
    updateJob(job.id, { prep: { ...job.prep, questions: updated } });
    setOpenId(null); // opens the next one you haven't done
  }

  return (
    <main className="page prep">
      <section className="prep__section" aria-labelledby="prep-next">
        <p id="prep-next" className="prep__lbl">
          NEXT INTERVIEW
        </p>
        <div className="prep__next">
          <div className="prep__cal" aria-hidden="true">
            <span className="prep__cal-month">
              {date
                .toLocaleDateString("en-US", { month: "short" })
                .toUpperCase()}
            </span>
            <span className="prep__cal-day">{date.getDate()}</span>
            <span className="prep__cal-week">
              {date
                .toLocaleDateString("en-US", { weekday: "short" })
                .toUpperCase()}
            </span>
          </div>
          <div className="prep__job">
            <h1 className="prep__title">{job.title}</h1>
            <p className="prep__company">
              {job.company}
              {job.location && ` · ${job.location}`}
            </p>
            <p className="prep__note">{countdownNote(days)}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="prep__error" role="alert">
          <p>{error}</p>
          <button type="button" className="chip" onClick={retry}>
            try again
          </button>
        </div>
      )}

      {!job.prep && !error && (
        <p className="prep__loading">
          writing your questions… this can take up to a minute the first time.
        </p>
      )}

      {job.prep && (
        <>
          <section className="prep__section" aria-labelledby="prep-practiced">
            <div className="prep__row">
              <p id="prep-practiced" className="prep__lbl">
                PRACTICED
              </p>
              <p className="prep__count">
                {practiced} of {questions.length}
              </p>
            </div>
            <div
              className="prep__clovers"
              role="img"
              aria-label={`${practiced} of ${questions.length} questions practiced`}
            >
              {questions.map((q, i) => (
                <img
                  key={q.id}
                  src={clover}
                  alt=""
                  className={
                    q.practicedAt
                      ? "prep__clover"
                      : "prep__clover prep__clover--empty"
                  }
                  style={
                    q.practicedAt
                      ? { transform: `rotate(${tilts[i % tilts.length]}deg)` }
                      : undefined
                  }
                />
              ))}
            </div>
          </section>

          {job.prep.skills.length > 0 && (
            <section className="prep__section" aria-labelledby="prep-skills">
              <p id="prep-skills" className="prep__lbl">
                FROM THE POSTING
              </p>
              <div className="prep__skills">
                {job.prep.skills.map((skill) => (
                  <span key={skill} className="prep__skill">
                    {skill.toUpperCase()}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="prep__section" aria-labelledby="prep-today">
            <p id="prep-today" className="prep__lbl">
              TODAY'S QUESTIONS · {today.length}
            </p>
            {today.length === 0 ? (
              <p className="prep__note">
                all {questions.length} pressed. you're ready!
              </p>
            ) : (
              <div className="prep__questions">
                {today.map((q) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    open={q.id === openQuestion}
                    onOpen={() => setOpenId(q.id)}
                    onPress={(answer) => press(q.id, answer)}
                  />
                ))}
              </div>
            )}
            {today.length > 0 && today.every((q) => q.practicedAt) && (
              <p className="prep__note">
                done for today. come back tomorrow for more.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}

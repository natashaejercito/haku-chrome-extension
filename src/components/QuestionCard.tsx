import { useState } from "react";
import clover from "../assets/clover.svg";
import { speechSupported, useSpeech } from "../lib/speech";
import type { PrepQuestion } from "../types";

type Props = {
  question: PrepQuestion;
  open: boolean;
  onOpen: () => void;
  onPress: (answer: string) => void;
};

export default function QuestionCard({
  question,
  open,
  onOpen,
  onPress,
}: Props) {
  const [answer, setAnswer] = useState(question.answer ?? "");
  // each finished sentence you say is added to the end of the answer
  const speech = useSpeech((text) =>
    setAnswer((prev) => (prev ? `${prev} ${text}` : text)),
  );
  const pressed = !!question.practicedAt;
  const badge = (
    <span className={`qcard__type qcard__type--${question.type}`}>
      {question.type.toUpperCase()}
    </span>
  );

  if (!open) {
    return (
      <button type="button" className="qcard__row" onClick={onOpen}>
        {badge}
        <span className="qcard__row-text">{question.text}</span>
        {pressed && (
          <img src={clover} alt="practiced" className="qcard__done" />
        )}
      </button>
    );
  }

  return (
    <article className="qcard">
      {badge}
      <p className="qcard__q">{question.text}</p>
      <label className="prep__lbl" htmlFor={`answer-${question.id}`}>
        YOUR ANSWER
      </label>
      <div className="qcard__field">
        <textarea
          id={`answer-${question.id}`}
          className="qcard__answer"
          rows={4}
          placeholder={
            speechSupported
              ? "say it out loud, or type it here…"
              : "type your answer here…"
          }
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        {speechSupported && (
          <button
            type="button"
            className={
              speech.listening ? "qcard__mic qcard__mic--on" : "qcard__mic"
            }
            aria-label={
              speech.listening ? "Stop listening" : "Speak your answer"
            }
            aria-pressed={speech.listening}
            onClick={speech.toggle}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </button>
        )}
      </div>
      {speech.error ? (
        <p className="qcard__mic-error" role="alert">
          {speech.error}
        </p>
      ) : (
        <p className="qcard__tip">
          {speech.listening
            ? "listening… tap the mic again when you're done"
            : "tip: answer out loud, like the real thing"}
        </p>
      )}
      <button
        type="button"
        className="qcard__press"
        disabled={answer.trim() === ""}
        onClick={() => {
          speech.stop();
          onPress(answer.trim());
        }}
      >
        {pressed ? "press again" : "press it"}
      </button>
    </article>
  );
}

import clover from "../assets/clover.svg";
import "./ThisWeek.css";

const tilts = [-10, 14, -4, 20, -16, 8, -12];

export default function ThisWeek({ count }: { count: number }) {
  return (
    <section className="week" aria-label={`${count} applications this week`}>
      <span className="week__label">THIS WEEK</span>
      <span className="week__clovers" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <img
            key={i}
            src={clover}
            alt=""
            style={{ transform: `rotate(${tilts[i % tilts.length]}deg)` }}
          />
        ))}
      </span>
      <span className="week__note">{count} pressed!</span>
    </section>
  );
}

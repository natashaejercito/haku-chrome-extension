import clover from "../assets/clover.svg";
import type { JobStatus } from "../types";
import "./StatusPill.css";

export default function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span className={`pill pill--${status}`}>
      {status === "interview" && (
        <img src={clover} alt="" width={10} height={13} />
      )}
      {status.toUpperCase()}
    </span>
  );
}

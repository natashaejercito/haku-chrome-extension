import clover from "../assets/clover.svg";
import petal from "../assets/petal.svg";
import "./Tab.css";

type TabProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

export default function Tab({ label, active = false, onClick }: TabProps) {
  return (
    <button
      type="button"
      className={active ? "tab tab--active" : "tab"}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <span aria-hidden="true">
        <img src={clover} alt="" className="tab__bit tab__bit--1" />
        <img src={petal} alt="" className="tab__bit tab__bit--2" />
        <img src={petal} alt="" className="tab__bit tab__bit--3" />
        <img src={petal} alt="" className="tab__bit tab__bit--4" />
        <img src={clover} alt="" className="tab__bit tab__bit--5" />
      </span>
      {label}
    </button>
  );
}

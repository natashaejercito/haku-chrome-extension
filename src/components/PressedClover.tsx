import clover from "../assets/clover.svg";
import "./PressedClover.css";


export default function PressedClover() {
  return (
    <div className="pressed" aria-hidden="true">
      <img src={clover} alt="" className="pressed__clover" />
      <span className="pressed__tape" />
    </div>
  );
}

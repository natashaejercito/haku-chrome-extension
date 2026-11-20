import { useEffect } from "react";
import bg from "../assets/splash-bg.png";
import clovers from "../assets/splash-clovers.png";
import "./Splash.css";

export default function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = window.setTimeout(onDone, reduceMotion ? 300 : 2200);
    return () => window.clearTimeout(timer); // cleans up if the splash closes early
  }, [onDone]);

  return (
    <div className="splash" style={{ backgroundImage: `url(${bg})` }}>
      <img
        src={clovers}
        alt=""
        aria-hidden="true"
        className="splash__clovers"
      />
      <div className="splash__text">
        <p className="splash__logo">haku</p>
        <p className="splash__tagline">your guide through the job search</p>
      </div>
    </div>
  );
}

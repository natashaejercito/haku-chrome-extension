import { useCallback, useState } from "react";
import Splash from "./views/Splash.tsx";
import JobPage from "./views/JobPage.tsx";
import Tab from "./components/Tab.tsx";
import SavedPage from "./views/SavedPage";
import PrepPage from "./views/PrepPage";
import "./App.css";

type View = "job" | "saved" | "prep";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<View>("job");

  // useCallback keeps the same function between renders,
  // so the splash timer doesn't restart
  const finishSplash = useCallback(() => setShowSplash(false), []);

  if (showSplash) return <Splash onDone={finishSplash} />;

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__logo">haku</p>
        {view === "job" && (
          <p className="app__note">found a job? let's save it</p>
        )}
      </header>

      <nav className="app__tabs" aria-label="Haku sections">
        <Tab
          label="job"
          active={view === "job"}
          onClick={() => setView("job")}
        />
        <Tab
          label="saved"
          active={view === "saved"}
          onClick={() => setView("saved")}
        />
        <Tab
          label="prep"
          active={view === "prep"}
          onClick={() => setView("prep")}
        />
      </nav>

      {view === "job" && <JobPage />}
      {view === "saved" && <SavedPage />}
      {view === "prep" && <PrepPage />}
    </div>
  );
}

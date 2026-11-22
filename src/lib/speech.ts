import { useEffect, useRef, useState } from "react";

type SpeechResult = { isFinal: boolean; 0: { transcript: string } };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type RecognitionClass = new () => Recognition;

const speechWindow = window as unknown as {
  SpeechRecognition?: RecognitionClass;
  webkitSpeechRecognition?: RecognitionClass;
};
const Recognition =
  speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

export const speechSupported = !!Recognition;

async function micAllowed(): Promise<boolean> {
  const status = await navigator.permissions.query({
    name: "microphone" as PermissionName,
  });
  return status.state === "granted";
}

// onText gets each finished sentence you say
export function useSpeech(onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognition = useRef<Recognition | null>(null);

  // stop listening if the card closes
  useEffect(() => () => recognition.current?.stop(), []);

  async function start() {
    if (!Recognition) return;
    setError("");

    if (!(await micAllowed())) {
      chrome.tabs.create({ url: chrome.runtime.getURL("permission.html") });
      setError("allow the mic in the new tab, then tap the mic here again");
      return;
    }

    const r = new Recognition();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      let text = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) text += e.results[i][0].transcript;
      }
      if (text.trim()) onText(text.trim());
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed")
        setError("the mic is blocked. allow it for haku in chrome settings");
      else if (e.error !== "no-speech" && e.error !== "aborted")
        setError(`mic problem: ${e.error}`);
    };
    r.onend = () => setListening(false);

    recognition.current = r;
    r.start();
    setListening(true);
  }

  function stop() {
    recognition.current?.stop();
  }

  return {
    listening,
    error,
    start,
    stop,
    toggle: () => (listening ? stop() : start()),
  };
}

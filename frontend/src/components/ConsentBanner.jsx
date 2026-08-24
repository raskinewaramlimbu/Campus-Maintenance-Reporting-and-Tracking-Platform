import { useEffect, useState } from "react";

const STORAGE_KEY = "fmc-consent-acknowledged";


export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="consent-banner" role="region" aria-label="Privacy notice">
      <p>
        We only store what you type into a report &mdash; category, location, description and an
        optional photo link. No account or personal details are required.{" "}
        <a href="/privacy">Read the full privacy notice</a>.
      </p>
      <button type="button" onClick={dismiss} className="btn btn-ghost">
        Got it
      </button>
    </div>
  );
}

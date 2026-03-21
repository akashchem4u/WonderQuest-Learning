"use client";

import { useEffect, useState } from "react";

type UiMode = "standard" | "focus";

const STORAGE_KEY = "wq-ui-mode";

export function DisplayModeToggle() {
  const [mode, setMode] = useState<UiMode>("standard");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as UiMode | null;

    if (saved === "focus" || saved === "standard") {
      setMode(saved);
      document.documentElement.dataset.uiMode = saved;
      return;
    }

    document.documentElement.dataset.uiMode = "standard";
  }, []);

  function applyMode(nextMode: UiMode) {
    setMode(nextMode);
    document.documentElement.dataset.uiMode = nextMode;
    window.localStorage.setItem(STORAGE_KEY, nextMode);
  }

  return (
    <div className="display-mode" aria-label="Display mode">
      <button
        className={`display-mode-button ${mode === "standard" ? "is-active" : ""}`}
        onClick={() => applyMode("standard")}
        type="button"
      >
        Standard
      </button>
      <button
        className={`display-mode-button ${mode === "focus" ? "is-active" : ""}`}
        onClick={() => applyMode("focus")}
        type="button"
      >
        Focus
      </button>
    </div>
  );
}

import React from "react";

export default function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.min(100, Math.round((value / Math.max(max, 1)) * 100));
  const over = value > max;
  return (
    <div className={`progress ${over ? "over" : ""}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      <span className="progress-text">{pct}%</span>
    </div>
  );
}

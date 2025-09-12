import React from "react";

export default function SummaryCard({ title, value }) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="card-value">{Intl.NumberFormat("en-IN").format(value)}</div>
    </div>
  );
}

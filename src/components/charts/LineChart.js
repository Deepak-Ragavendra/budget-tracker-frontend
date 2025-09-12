import React from "react";
import { Line } from "react-chartjs-2";
import "./ChartsRegister";

export default function LineChart({ labels, values, label = "Trend" }) {
  return (
    <div className="chart-card">
      <Line
        data={{
          labels,
          datasets: [
            {
              label,
              data: values,
              borderColor: "#f28e2b", // orange line
              backgroundColor: "rgba(242, 142, 43, 0.3)", // light orange fill
              tension: 0.3,
              fill: true,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e6ecff" } },
          },
          scales: {
            x: { ticks: { color: "#e6ecff" } },
            y: { ticks: { color: "#e6ecff" } },
          },
        }}
      />
    </div>
  );
}

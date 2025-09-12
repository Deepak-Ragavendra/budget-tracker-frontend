import React from "react";
import { Bar } from "react-chartjs-2";
import "./ChartsRegister";

export default function BarChart({ labels, values, label = "Series" }) {
  return (
    <div className="chart-card">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label,
              data: values,
              backgroundColor: ["#4e79a7", "#e15759"], // Income blue, Expense red
              borderRadius: 6,
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

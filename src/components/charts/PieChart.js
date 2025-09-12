import React from "react";
import { Pie } from "react-chartjs-2";
import "./ChartsRegister";

export default function PieChart({ labels, values }) {
  const colors = ["#4e79a7", "#f28e2b", "#76b7b2", "#e15759", "#b07aa1", "#edc949"];

  return (
    <div className="chart-card">
      <Pie
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderColor: "#0b0f14", // matches dark bg
              borderWidth: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: "#e6ecff" } }, // white text
          },
        }}
      />
    </div>
  );
}

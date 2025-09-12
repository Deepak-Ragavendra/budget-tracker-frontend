import React, { useMemo } from "react";
import { useApp } from "../state/AppContext";
import SummaryCard from "../components/Summarycard";
import PieChart from "../components/charts/PieChart";
import BarChart from "../components/charts/BarChart";
import LineChart from "../components/charts/LineChart";

export default function Dashboard() {
  const { state, totals } = useApp();

  // category-wise expense
  const byCategory = useMemo(() => {
    const map = {};
    state.transactions
      .filter(t => t.type === "expense")
      .forEach(t => { map[t.category] = (map[t.category] || 0) + Number(t.amount || 0); });
    const labels = Object.keys(map);
    const values = labels.map(l => map[l]);
    return { labels, values };
  }, [state.transactions]);

  // simple month trend (by date string)
  const trend = useMemo(() => {
    const sorted = [...state.transactions]
      .sort((a, b) => a.date.localeCompare(b.date));
    const labels = sorted.map(t => t.date.slice(5)); // MM-DD
    const incomeVals = sorted.map(t => (t.type === "income" ? Number(t.amount) : 0));
    const expenseVals = sorted.map(t => (t.type === "expense" ? Number(t.amount) : 0));
    return { labels, incomeVals, expenseVals };
  }, [state.transactions]);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid-3">
        <SummaryCard title="Total Income" value={totals.income} />
        <SummaryCard title="Total Expenses" value={totals.expense} />
        <SummaryCard title="Savings" value={totals.savings} />
      </div>

      <div className="grid-2 mt">
        <div>
          <h3>Category-wise Spending</h3>
          <div className="chart-h300">
            <PieChart labels={byCategory.labels} values={byCategory.values} />
          </div>
        </div>

        <div>
          <h3>Income vs Expense (Bar)</h3>
          <div className="chart-h300">
            <BarChart
              labels={["Income", "Expense"]}
              values={[totals.income, totals.expense]}
              label="Totals"
            />
          </div>
        </div>
      </div>

      <div className="mt">
        <h3>Daily Trend</h3>
        <div className="chart-h300">
          <LineChart labels={trend.labels} values={trend.expenseVals.map((v, i) => v - trend.incomeVals[i])} label="Net (Expense - Income)" />
        </div>
      </div>
    </>
  );
}

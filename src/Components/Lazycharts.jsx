import React, { useMemo } from "react";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

// Register the chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

const LazyCharts = ({ counts, categoryWiseCounts }) => {
  // Memoized chart data
  const pieChartData = useMemo(
    () => ({
      labels: ["Approved", "Pending", "Rejected", "Completed"],
      datasets: [
        {
          data: [
            counts?.documentStatus?.find(({ status }) => status === "Approved")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Pending")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Rejected")
              ?.count || 0,
            counts?.documentStatus?.find(({ status }) => status === "Completed")
              ?.count || 0,
          ],
          backgroundColor: ["#4CAF50", "#FF9800", "#F44336", "#2196F3"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }),
    [counts]
  );

  const barChartData = useMemo(
    () => ({
      labels: [
        "Users",
        "Distributors",
        "Documents",
        "Categories",
        "Subcategories",
      ],
      datasets: [
        {
          label: "Total Counts",
          data: [
            counts?.users || 0,
            counts?.distributors || 0,
            counts?.documents || 0,
            counts?.categories || 0,
            counts?.subcategories || 0,
          ],
          backgroundColor: "#36A2EB",
          borderColor: "#1D4ED8",
          borderWidth: 1,
        },
      ],
    }),
    [counts]
  );

  const doughnutChartData = useMemo(
    () => ({
      labels: categoryWiseCounts?.map(({ categoryName }) => categoryName) || [],
      datasets: [
        {
          label: "Category Wise Document Count",
          data:
            categoryWiseCounts?.map(({ documentCount }) =>
              parseInt(documentCount, 10)
            ) || [],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FF9F40"],
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    }),
    [categoryWiseCounts]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Daily Document Status</h2>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </div>
      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Daily Counts</h2>
        <Bar data={barChartData} options={{ responsive: true }} />
      </div>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Daily Category-wise Tasks</h2>
        <Doughnut data={doughnutChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default LazyCharts;

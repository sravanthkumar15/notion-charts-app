import React, { useState } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_TYPES = [
  { label: "Bar", value: "bar" },
  { label: "Line", value: "line" },
  { label: "Pie", value: "pie" },
];

function App() {
  const [databaseId, setDatabaseId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [xProp, setXProp] = useState("");
  const [yProp, setYProp] = useState("");
  const [chartType, setChartType] = useState("bar");

  const fetchDatabase = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setXProp("");
    setYProp("");
    try {
      const res = await axios.post("/.netlify/functions/fetch-database", { databaseId });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Unknown error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  // Extract property options from the first page
  let propertyOptions = [];
  let numericOptions = [];
  if (result && result.results && result.results.length > 0) {
    const props = result.results[0].properties;
    propertyOptions = Object.keys(props).map((prop) => ({
      label: prop,
      value: prop,
      type: props[prop].type,
    }));
    numericOptions = propertyOptions.filter(
      (opt) => props[opt.value].type === "number"
    );
  }

  // Prepare data for chart
  let chartData = null;
  let labels = [];
  let yValues = [];
  if (xProp && yProp && result && result.results) {
    labels = result.results.map((page) => {
      const prop = page.properties[xProp];
      if (!prop) return "";
      if (prop.type === "title" && prop.title.length > 0) {
        return prop.title[0].plain_text;
      }
      if (prop.type === "rich_text" && prop.rich_text.length > 0) {
        return prop.rich_text[0].plain_text;
      }
      if (prop.type === "select") {
        return prop.select?.name || "";
      }
      if (prop.type === "multi_select") {
        return prop.multi_select.map((s) => s.name).join(", ");
      }
      if (prop.type === "number") {
        return prop.number?.toString() || "";
      }
      return "";
    });
    yValues = result.results.map((page) => {
      const prop = page.properties[yProp];
      if (!prop) return 0;
      if (prop.type === "number") return prop.number ?? 0;
      return 0;
    });
    chartData = {
      labels,
      datasets: [
        {
          label: yProp,
          data: yValues,
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
      ],
    };
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Notion Database Chart Generator</h1>
      <input
        style={{ width: "100%", padding: 8, fontSize: 16, marginBottom: 12 }}
        type="text"
        placeholder="Enter Notion Database ID"
        value={databaseId}
        onChange={e => setDatabaseId(e.target.value)}
      />
      <button
        onClick={fetchDatabase}
        style={{ padding: "8px 24px", fontSize: 16 }}
        disabled={loading || !databaseId.trim()}
      >
        {loading ? "Fetching..." : "Fetch Database"}
      </button>
      {error && <div style={{ color: "red", marginTop: 16 }}>Error: {error}</div>}

      {result && propertyOptions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ marginRight: 8 }}>X Axis:</label>
            <select value={xProp} onChange={e => setXProp(e.target.value)}>
              <option value="">Select Property</option>
              {propertyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} ({opt.type})</option>
              ))}
            </select>
            <label style={{ marginLeft: 24, marginRight: 8 }}>Y Axis:</label>
            <select value={yProp} onChange={e => setYProp(e.target.value)}>
              <option value="">Select Numeric Property</option>
              {numericOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label style={{ marginLeft: 24, marginRight: 8 }}>Chart Type:</label>
            <select value={chartType} onChange={e => setChartType(e.target.value)}>
              {CHART_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {xProp && yProp && chartData && (
            <div style={{ background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 2px 8px #0001" }}>
              {chartType === "bar" && <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: `${yProp} by ${xProp}` } } }} />}
              {chartType === "line" && <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: `${yProp} by ${xProp}` } } }} />}
              {chartType === "pie" && <Pie data={{ labels: chartData.labels, datasets: [{ data: chartData.datasets[0].data, backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#B4FF9F", "#F5B7B1"] }] }} options={{ responsive: true, plugins: { legend: { position: "top" }, title: { display: true, text: `${yProp} by ${xProp}` } } }} />}
            </div>
          )}
        </div>
      )}

      {result && (
        <pre style={{ marginTop: 24, background: "#f4f4f4", padding: 16, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;

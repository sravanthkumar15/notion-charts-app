import React, { useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export default function App() {
  const [databaseId, setDatabaseId] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);
  const [embedUrl, setEmbedUrl] = useState('');
  const [error, setError] = useState('');
  const chartRef = React.useRef(null);

  async function fetchDatabase() {
    setError('');
    setColumns([]);
    setData([]);
    setEmbedUrl('');
    try {
      const res = await axios.post('/api/fetch-database', { databaseId });
      if (res.data.success) {
        const rows = res.data.data;
        if (!rows.length) throw new Error('No data found in Notion database');
        // Extract columns (only number, select, title, rich_text for demo)
        const props = Object.keys(rows[0].properties).filter(
          k => ['number', 'select', 'title', 'rich_text'].includes(rows[0].properties[k].type)
        );
        setColumns(props);
        setData(rows);
      } else {
        throw new Error(res.data.error);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function renderChart() {
    if (!columns.length || !data.length) return;
    const xKey = columns[0];
    const yKey = columns[1];
    const labels = data.map(row => {
      const prop = row.properties[xKey];
      if (prop.type === 'title' && prop.title.length) return prop.title[0].plain_text;
      if (prop.type === 'rich_text' && prop.rich_text.length) return prop.rich_text[0].plain_text;
      if (prop.type === 'select' && prop.select) return prop.select.name;
      return '';
    });
    const values = data.map(row => {
      const prop = row.properties[yKey];
      if (prop.type === 'number') return prop.number;
      return 0;
    });
    if (chartRef.current) chartRef.current.destroy();
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    chartRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [{ label: yKey, data: values, backgroundColor: '#4f8cff' }]
      },
      options: { responsive: true }
    });
    setEmbedUrl(window.location.origin + `/embed?db=${databaseId}&x=${xKey}&y=${yKey}&type=${chartType}`);
  }

  React.useEffect(() => {
    if (columns.length && data.length) renderChart();
    // eslint-disable-next-line
  }, [columns, data, chartType]);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <h1>Notion Database Chart Generator</h1>
      <input
        placeholder="Enter Notion Database ID"
        value={databaseId}
        onChange={e => setDatabaseId(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 8 }}
      />
      <button onClick={fetchDatabase} style={{ padding: '8px 16px', marginBottom: 12 }}>
        Fetch Database
      </button>
      <div>
        <label>Chart Type: </label>
        <select value={chartType} onChange={e => setChartType(e.target.value)}>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="pie">Pie</option>
        </select>
      </div>
      {error && <div style={{ color: 'red', margin: 12 }}>{error}</div>}
      {columns.length >= 2 && (
        <div style={{ marginTop: 24 }}>
          <canvas id="chartCanvas" width="600" height="350"></canvas>
        </div>
      )}
      {embedUrl && (
        <div style={{ marginTop: 24 }}>
          <h3>Embed in Notion</h3>
          <textarea value={`<iframe src='${embedUrl}' width='700' height='400' style='border:none'></iframe>`} readOnly style={{ width: '100%', height: 64 }} />
        </div>
      )}
    </div>
  );
}

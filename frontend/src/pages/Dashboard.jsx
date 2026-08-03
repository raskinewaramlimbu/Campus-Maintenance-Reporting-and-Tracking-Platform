import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getAnalyticsSummary, getReminders, downloadExport } from "../api/client.js";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    Promise.all([getAnalyticsSummary(), getReminders()])
      .then(([summaryData, reminderData]) => {
        setSummary(summaryData);
        setReminders(reminderData);
      })
      .catch(() => setError("Couldn't load the dashboard - is the API running?"))
      .finally(() => setLoading(false));
  }, []);

  async function handleExport(format) {
    setExporting(format);
    try {
      await downloadExport(format);
    } catch {
      alert("Export failed, try again");
    } finally {
      setExporting(null);
    }
  }

  if (loading) return <div className="page">Loading dashboard...</div>;
  if (error) return <div className="page"><p className="field-error">{error}</p></div>;

  const categoryData = summary.byCategory.map((c) => ({ name: c._id, count: c.count }));
  const res = summary.resolutionTimes;

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1>Staff dashboard</h1>
          <p className="page-intro">Common categories, hotspots and how quickly things get resolved.</p>
        </div>
        <div className="export-buttons">
          <button className="btn btn-secondary" onClick={() => handleExport("csv")} disabled={exporting}>
            {exporting === "csv" ? "Preparing..." : "Export CSV"}
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport("pdf")} disabled={exporting}>
            {exporting === "pdf" ? "Preparing..." : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="stat-strip">
        <div className="stat-box">
          <span className="stat-value">{summary.totalReports}</span>
          <span className="stat-label">Total reports</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">
            {res.avgHours != null ? `${res.avgHours.toFixed(1)}h` : "—"}
          </span>
          <span className="stat-label">Avg resolution time</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{reminders.overdue.length}</span>
          <span className="stat-label">Overdue ({reminders.thresholdDays}+ days)</span>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Reports by category</h2>
        {categoryData.length === 0 ? (
          <p className="muted">No reports yet.</p>
        ) : (
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d7dce3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f5b700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Hotspots</h2>
        <p className="muted">Locations with the most reports.</p>
        {summary.hotspots.length === 0 ? (
          <p className="muted">Nothing to show yet.</p>
        ) : (
          <ol className="hotspot-list">
            {summary.hotspots.map((h) => (
              <li key={h._id}>
                <span>{h._id}</span>
                <span className="hotspot-count">{h.count}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Needs attention</h2>
        <p className="muted">
          Open longer than {reminders.thresholdDays} day(s). A daily email digest of this same list
          goes out to staff accounts (or gets logged to the server console if SMTP isn't configured).
        </p>
        {reminders.overdue.length === 0 ? (
          <p className="muted">Nothing overdue right now.</p>
        ) : (
          <ul className="overdue-list">
            {reminders.overdue.map((r) => (
              <li key={r._id}>
                <span className="pill category-pill">{r.category}</span>
                <span>{r.location}</span>
                <span className="muted">{new Date(r.dateReported).toLocaleDateString("en-GB")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

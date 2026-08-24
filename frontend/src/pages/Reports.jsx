import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports } from "../api/client.js";
import ReportCard from "../components/ReportCard.jsx";
import FilterBar from "../components/FilterBar.jsx";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ category: "", location: "", status: "" });

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    getReports(filters)
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load reports right now");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h1>Reported issues</h1>
          <p className="page-intro">See what's been reported and where things stand.</p>
        </div>
        <Link to="/submit" className="btn btn-primary">
          + New report
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading && <p className="muted">Loading reports...</p>}
      {error && <p className="field-error">{error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p className="muted">No reports match those filters yet.</p>
      )}

      <div className="report-grid">
        {reports.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

const STATUS_CLASS = {
  New: "status-new",
  "In Progress": "status-progress",
  Resolved: "status-resolved",
};

function timeAgo(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function ReportCard({ report }) {
  return (
    <Link to={`/reports/${report.id}`} className="report-card">
      <div className="report-card-top">
        <span className="pill category-pill">{report.category}</span>
        <span className={`pill status-pill ${STATUS_CLASS[report.status] || ""}`}>
          {report.status}
        </span>
      </div>
      <h3 className="report-location">{report.location}</h3>
      <p className="report-description">{report.description}</p>
      <div className="report-card-bottom">
        <span>{timeAgo(report.dateReported)}</span>
        {report.geo && <span>&middot; location pinned</span>}
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getReport, updateReport, updateReportStatus, deleteReport } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUSES = ["New", "In Progress", "Resolved"];
const STATUS_CLASS = { New: "status-new", "In Progress": "status-progress", Resolved: "status-resolved" };

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReport(id)
      .then((data) => {
        setReport(data);
        setEditForm(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(newStatus) {
    setStatusSaving(true);
    try {
      const updated = await updateReportStatus(id, newStatus);
      setReport(updated);
    } catch {
      alert("Couldn't update the status, try again");
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateReport(id, {
        category: editForm.category,
        location: editForm.location,
        description: editForm.description,
        photoUrl: editForm.photoUrl,
      });
      setReport(updated);
      setEditing(false);
    } catch {
      alert("Couldn't save changes, try again");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this report? This can't be undone.")) return;
    try {
      await deleteReport(id);
      navigate("/reports");
    } catch {
      alert("Couldn't delete the report, try again");
    }
  }

  if (loading) return <div className="page">Loading...</div>;

  if (notFound || !report) {
    return (
      <div className="page">
        <h1>Report not found</h1>
        <p>
          It might have been deleted. <Link to="/reports">Back to all reports</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      {location.state?.justSubmitted && (
        <div className="banner-success">Thanks - your report has been submitted.</div>
      )}

      <Link to="/reports" className="back-link">
        &larr; Back to reports
      </Link>

      {!editing ? (
        <>
          <div className="detail-header">
            <div>
              <span className="pill category-pill">{report.category}</span>
              <h1>{report.location}</h1>
            </div>
            {user ? (
              <div className="status-control">
                <label htmlFor="status-select">Status</label>
                <select
                  id="status-select"
                  value={report.status}
                  disabled={statusSaving}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className={`pill status-pill ${STATUS_CLASS[report.status] || ""}`}>{report.status}</span>
            )}
          </div>

          <p className="report-description-full">{report.description}</p>

          {report.photoUrl && (
            <p>
              Photo: <a href={report.photoUrl} target="_blank" rel="noreferrer">{report.photoUrl}</a>
            </p>
          )}

          {report.geo && (
            <p>
              Map reference: {report.geo.label}{" "}
              <a
                href={`https://www.openstreetmap.org/?mlat=${report.geo.lat}&mlon=${report.geo.lon}#map=18/${report.geo.lat}/${report.geo.lon}`}
                target="_blank"
                rel="noreferrer"
              >
                view on map
              </a>
            </p>
          )}

          <dl className="meta-list">
            <dt>Reported by</dt>
            <dd>{report.reportedBy}</dd>
            <dt>Reported</dt>
            <dd>{new Date(report.dateReported).toLocaleString("en-GB")}</dd>
            <dt>Last updated</dt>
            <dd>{new Date(report.lastUpdated).toLocaleString("en-GB")}</dd>
          </dl>

          {user ? (
            <div className="detail-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                Edit report
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete report
              </button>
            </div>
          ) : (
            <p className="muted">
              <Link to="/login">Log in as staff</Link> to edit the status, edit details, or delete this report.
            </p>
          )}
        </>
      ) : (
        <form className="report-form" onSubmit={handleSaveEdit}>
          <h1>Edit report</h1>
          <div className="form-field">
            <label htmlFor="edit-location">Location</label>
            <input
              id="edit-location"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              rows={5}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label htmlFor="edit-photo">Photo link</label>
            <input
              id="edit-photo"
              value={editForm.photoUrl}
              onChange={(e) => setEditForm({ ...editForm, photoUrl: e.target.value })}
            />
          </div>
          <div className="detail-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

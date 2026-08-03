import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReport, geocodeLocation } from "../api/client.js";

const CATEGORIES = ["Plumbing", "Electrical", "Heating/Cooling", "Accessibility", "Cleaning", "Other"];

const EMPTY_FORM = {
  category: "",
  location: "",
  description: "",
  photoUrl: "",
  reportedBy: "student",
};

export default function SubmitReport() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // geocoding state - kept separate from the form since it's a helper, not
  // a required field
  const [geoQuery, setGeoQuery] = useState("");
  const [geoResults, setGeoResults] = useState([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [pickedGeo, setPickedGeo] = useState(null);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLocate() {
    const query = geoQuery.trim() || form.location.trim();
    if (query.length < 3) {
      setGeoError("Type at least 3 characters to search for a location");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    setGeoResults([]);
    try {
      const results = await geocodeLocation(query);
      if (results.length === 0) {
        setGeoError("No matches found - you can still submit the report without pinning it");
      }
      setGeoResults(results);
    } catch (err) {
      setGeoError("Couldn't reach the map lookup service, try again in a moment");
    } finally {
      setGeoLoading(false);
    }
  }

  function pickGeoResult(result) {
    setPickedGeo(result);
    setGeoResults([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.category || !form.location || !form.description) {
      setError("Category, location and description are all required.");
      return;
    }
    if (!consent) {
      setError("Please confirm you've read the privacy notice before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        consentGiven: true,
        geo: pickedGeo ? { lat: pickedGeo.lat, lon: pickedGeo.lon, label: pickedGeo.displayName } : null,
      };
      const created = await createReport(payload);
      navigate(`/reports/${created.id}`, { state: { justSubmitted: true } });
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong submitting your report");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <h1>Report a maintenance issue</h1>
      <p className="page-intro">
        Give as much detail on the location as you can &mdash; it's the single biggest thing that
        speeds up a fix.
      </p>

      <form className="report-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="location">Location / building *</label>
          <input
            id="location"
            type="text"
            placeholder="e.g. Sackville Building, 2nd floor toilets"
            value={form.location}
            onChange={(e) => updateField("location", e.target.value)}
            required
          />
        </div>

        <div className="form-field geo-lookup">
          <label htmlFor="geo-query">Pin it on the map (optional)</label>
          <div className="geo-lookup-row">
            <input
              id="geo-query"
              type="text"
              placeholder="Search a building or address"
              value={geoQuery}
              onChange={(e) => setGeoQuery(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleLocate} disabled={geoLoading}>
              {geoLoading ? "Searching..." : "Find on map"}
            </button>
          </div>
          <p className="field-hint">
            Uses OpenStreetMap's search to attach coordinates to your report. Skip this if you're
            not sure - it's not required.
          </p>

          {geoError && <p className="field-error">{geoError}</p>}

          {geoResults.length > 0 && (
            <ul className="geo-results">
              {geoResults.map((r, i) => (
                <li key={i}>
                  <button type="button" onClick={() => pickGeoResult(r)}>
                    {r.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {pickedGeo && (
            <div className="geo-picked">
              Pinned: {pickedGeo.displayName}{" "}
              <button type="button" className="btn-link" onClick={() => setPickedGeo(null)}>
                remove
              </button>
            </div>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="description">What's wrong? *</label>
          <textarea
            id="description"
            rows={5}
            placeholder="Describe the issue - what you saw, when, and anything that seems relevant"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="photoUrl">Photo link (optional)</label>
          <input
            id="photoUrl"
            type="url"
            placeholder="https://..."
            value={form.photoUrl}
            onChange={(e) => updateField("photoUrl", e.target.value)}
          />
          <p className="field-hint">We don't host uploads yet - paste a link if you have a photo somewhere.</p>
        </div>

        <div className="form-field">
          <label htmlFor="reportedBy">I'm reporting as</label>
          <select id="reportedBy" value={form.reportedBy} onChange={(e) => updateField("reportedBy", e.target.value)}>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="anonymous">Prefer not to say</option>
          </select>
        </div>

        <label className="consent-checkbox">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            I understand this report and its contents will be stored and visible to Estates staff.
            See the <a href="/privacy">privacy notice</a>.
          </span>
        </label>

        {error && <p className="field-error form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </div>
  );
}

const CATEGORIES = ["Plumbing", "Electrical", "Heating/Cooling", "Accessibility", "Cleaning", "Other"];
const STATUSES = ["New", "In Progress", "Resolved"];

export default function FilterBar({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  function clear() {
    onChange({ category: "", location: "", status: "" });
  }

  const hasFilters = filters.category || filters.location || filters.status;

  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-location">Location contains</label>
        <input
          id="filter-location"
          type="text"
          placeholder="e.g. Library"
          value={filters.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-status">Status</label>
        <select id="filter-status" value={filters.status} onChange={(e) => update("status", e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button type="button" className="btn btn-ghost" onClick={clear}>
          Clear filters
        </button>
      )}
    </div>
  );
}

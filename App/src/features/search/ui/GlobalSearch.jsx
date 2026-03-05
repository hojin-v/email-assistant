import { Search } from "lucide-react";

export function GlobalSearch({ open, query, setQuery, onToggle, onClose }) {
  return (
    <div className="top-item">
      <button type="button" className="top-trigger" onClick={onToggle}>
        <Search size={16} />
        <span>Search</span>
      </button>

      {open && (
        <div className="floating-panel floating-panel--search" role="dialog" aria-label="Global search">
          <div className="panel-title">Global Search</div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, schedules, templates"
            className="search-input"
          />
          <div className="panel-list">
            {query.trim() ? (
              <button type="button" className="panel-list-item" onClick={onClose}>
                Result for "{query}" (mock)
              </button>
            ) : (
              <p className="panel-empty">Type to search</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

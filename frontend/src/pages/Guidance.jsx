import { useEffect, useState } from "react";
import { getGuidance } from "../api/client.js";

export default function Guidance() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGuidance()
      .then(setArticles)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>Guidance</h1>
      <p className="page-intro">A few things worth knowing before you submit a report.</p>

      {loading && <p className="muted">Loading guidance...</p>}

      <div className="guidance-list">
        {articles.map((a) => (
          <article key={a.id} className="guidance-article">
            <h2>{a.title}</h2>
            <p className="guidance-summary">{a.summary}</p>
            <p>{a.body}</p>
          </article>
        ))}
      </div>

      <div className="guidance-doc-link">
        <p>Prefer the full written policy?</p>
        <a href="/guidance-docs/reporting-policy.txt" target="_blank" rel="noreferrer">
          Read the reporting policy (plain text)
        </a>
      </div>
    </div>
  );
}

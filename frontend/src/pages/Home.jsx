import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page home-page">
      <section className="hero">
        <span className="eyebrow">Campus maintenance, sorted</span>
        <h1>Something broken on campus? Tell us once, we'll take it from there.</h1>
        <p>
          FixMyCampus replaces the mess of emails, phone calls and hallway complaints with one
          place to report a problem and actually see what's happening with it.
        </p>
        <div className="hero-actions">
          <Link to="/submit" className="btn btn-primary">
            Report an issue
          </Link>
          <Link to="/reports" className="btn btn-secondary">
            Track existing reports
          </Link>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <span className="step-num">1</span>
            <h3>Report it</h3>
            <p>Pick a category, tell us where and what's wrong. Takes about a minute.</p>
          </div>
          <div className="step">
            <span className="step-num">2</span>
            <h3>We triage it</h3>
            <p>Estates staff review new reports and move them into progress.</p>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <h3>You track it</h3>
            <p>Check status any time &mdash; New, In Progress or Resolved.</p>
          </div>
        </div>
      </section>

      <section className="callout">
        <h2>Not sure how to describe the problem?</h2>
        <p>The guidance page has quick tips on categories and what details actually help.</p>
        <Link to="/guidance" className="btn btn-secondary">
          Read the guidance
        </Link>
      </section>
    </div>
  );
}

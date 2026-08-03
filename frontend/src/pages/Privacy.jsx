export default function Privacy() {
  return (
    <div className="page privacy-page">
      <h1>Privacy &amp; consent</h1>
      <p className="page-intro">
        This is a coursework project, not a live university service, but it's built around the
        same principles a real one should follow.
      </p>

      <section>
        <h2>What we collect</h2>
        <p>
          When you submit a report we store: the category, location text, description, an
          optional photo link, and whether you identified as a student, staff member, or preferred
          not to say. If you use the map lookup, we also store the coordinates you picked.
        </p>
        <p>We do not require a name, email address or login to submit a report.</p>
      </section>

      <section>
        <h2>Why we ask for consent</h2>
        <p>
          Before anything is submitted, you have to tick a box confirming you understand the
          report will be stored and visible to staff reviewing issues. We ask for this explicitly
          rather than assuming it, because a maintenance report can sometimes include details
          about where you are or work that people might not want stored without knowing.
        </p>
      </section>

      <section>
        <h2>Third-party services</h2>
        <p>
          If you use the "find on map" feature when submitting a report, your search text is sent
          to OpenStreetMap's Nominatim service to look up coordinates. Nothing else about you is
          sent - just the text you typed into that search box.
        </p>
      </section>

      <section>
        <h2>How long we keep reports</h2>
        <p>
          For this project reports are kept indefinitely so status history stays useful for
          tracking. In a real deployment resolved reports would be archived or anonymised after a
          set period.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          There's no way to identify which reports belong to "you" specifically since the public
          side of the app doesn't use accounts. If you need a report removed, get in touch with
          Estates staff and reference the location and date you submitted it.
        </p>
      </section>

      <section>
        <h2>Staff accounts</h2>
        <p>
          Editing, deleting, or changing a report's status - along with viewing the analytics
          dashboard and exporting data - requires a staff login. Staff accounts store a name,
          email address, and a password (hashed with bcrypt, never stored or logged in plain
          text). Sessions use a signed token that expires automatically rather than staying valid
          forever.
        </p>
      </section>
    </div>
  );
}

import jwt from "jsonwebtoken";

// Attaches req.user if a valid token is present, otherwise rejects.
// Reports can still be *submitted and viewed* without logging in - this
// only guards the staff-side actions (edit, delete, status changes,
// analytics, export).
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "You need to be logged in to do that" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Your session has expired, please log in again" });
  }
}

// stricter version for things only admins should do (currently unused but
// left here since the User model already supports an admin role and it's
// an easy hook for e.g. deleting other staff accounts later)
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

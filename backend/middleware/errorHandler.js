// Catch-all error handler. Kept deliberately simple - logs to the console
// and sends a generic message back so we're not leaking stack traces to
// whoever's calling the API.
export default function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Something went wrong on our end" });
}

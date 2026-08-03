import { Router } from "express";
import Report from "../models/Report.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All analytics are staff-only - the raw counts aren't sensitive exactly,
// but there's no reason to expose them publicly and it keeps the dashboard
// consistent with "manage reports" being a staff feature.
router.use(requireAuth);

// GET /api/analytics/summary
// One endpoint that returns everything the dashboard needs in one round
// trip, rather than the frontend firing off four separate requests.
router.get("/summary", async (req, res, next) => {
  try {
    const [byCategory, byStatus, hotspots, resolutionTimes, totals] = await Promise.all([
      // common categories
      Report.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

      Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

      // hotspots: locations with the most reports, top 8
      Report.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // average resolution time in hours, only for reports that have
      // actually been resolved
      Report.aggregate([
        { $match: { status: "Resolved", resolvedAt: { $ne: null } } },
        {
          $project: {
            hoursToResolve: {
              $divide: [{ $subtract: ["$resolvedAt", "$dateReported"] }, 1000 * 60 * 60],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$hoursToResolve" },
            fastest: { $min: "$hoursToResolve" },
            slowest: { $max: "$hoursToResolve" },
            sampleSize: { $sum: 1 },
          },
        },
      ]),

      Report.countDocuments(),
    ]);

    res.json({
      totalReports: totals,
      byCategory,
      byStatus,
      hotspots,
      resolutionTimes: resolutionTimes[0] || { avgHours: null, fastest: null, slowest: null, sampleSize: 0 },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/analytics/reminders
// Reports that have sat in New or In Progress for longer than the
// configured threshold - this is the "notifications/reminders" feature,
// surfaced in-app rather than only as an email (see utils/reminderMailer.js
// for the optional email side of this).
router.get("/reminders", async (req, res, next) => {
  try {
    const thresholdDays = parseInt(process.env.REMINDER_THRESHOLD_DAYS, 10) || 3;
    const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

    const overdue = await Report.find({
      status: { $ne: "Resolved" },
      dateReported: { $lt: cutoff },
    }).sort({ dateReported: 1 });

    res.json({ thresholdDays, overdue });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import Report from "../models/Report.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();


router.use(requireAuth);


router.get("/summary", async (req, res, next) => {
  try {
    const [byCategory, byStatus, hotspots, resolutionTimes, totals] = await Promise.all([

      Report.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),

      Report.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),


      Report.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),


      Report.aggregate([
        { $match: { status: "Resolved", resolvedAt: { $ne: null },$expr: { $gte: ["$resolvedAt", "$dateReported"] } } },
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

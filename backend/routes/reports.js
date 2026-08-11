import { Router } from "express";
import Report, { CATEGORY_VALUES, STATUS_VALUES } from "../models/Report.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();


router.get("/", async (req, res, next) => {
  try {
    const { category, location, status } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: "i" }; // simple contains-match


    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const reports = await Report.find(query)
      .sort({ dateReported: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(reports);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (err) {

    if (err.name === "CastError") return res.status(404).json({ error: "Report not found" });
    next(err);
  }
});


router.post("/", async (req, res, next) => {
  try {
    const { category, location, description, photoUrl, reportedBy, consentGiven, geo } = req.body;

    if (!category || !location || !description) {
      return res.status(400).json({ error: "category, location and description are required" });
    }
    if (!CATEGORY_VALUES.includes(category)) {
      return res.status(400).json({ error: `category must be one of ${CATEGORY_VALUES.join(", ")}` });
    }
    if (!consentGiven) {
      return res.status(400).json({ error: "You need to confirm the privacy notice before submitting" });
    }

    const report = await Report.create({
      category,
      location,
      description,
      photoUrl: photoUrl || "",
      reportedBy: reportedBy || "anonymous",
      consentGiven: true,
      geo: geo || null,
    });

    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
});


router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { category, location, description, photoUrl } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    if (category) report.category = category;
    if (location) report.location = location;
    if (description) report.description = description;
    if (photoUrl !== undefined) report.photoUrl = photoUrl;
    report.lastUpdatedBy = req.user.id;

    await report.save();
    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUS_VALUES.includes(status)) {
      return res.status(400).json({ error: `status must be one of ${STATUS_VALUES.join(", ")}` });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    report.status = status;
    report.lastUpdatedBy = req.user.id;
    await report.save();

    res.json(report);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ deleted: report._id });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router } from "express";
import PDFDocument from "pdfkit";
import Report from "../models/Report.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

function toCsvValue(value) {
  const str = String(value ?? "");

  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}


router.get("/csv", async (req, res, next) => {
  try {
    const { category, status, location } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: "i" };

    const reports = await Report.find(query).sort({ dateReported: -1 });

    const header = [
      "id",
      "category",
      "location",
      "description",
      "status",
      "reportedBy",
      "dateReported",
      "resolvedAt",
    ];
    const rows = reports.map((r) =>
      [r._id, r.category, r.location, r.description, r.status, r.reportedBy, r.dateReported.toISOString(), r.resolvedAt ? r.resolvedAt.toISOString() : ""]
        .map(toCsvValue)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="fixmycampus-reports-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    next(err);
  }
});


router.get("/pdf", async (req, res, next) => {
  try {
    const { category, status, location } = req.query;
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = { $regex: location, $options: "i" };

    const reports = await Report.find(query).sort({ dateReported: -1 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="fixmycampus-reports-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    doc.fontSize(18).text("FixMyCampus - Maintenance Reports", { align: "left" });
    doc.fontSize(10).fillColor("#555").text(`Generated ${new Date().toLocaleString("en-GB")}  |  ${reports.length} report(s)`);
    doc.moveDown(1);

    reports.forEach((r, i) => {
      if (doc.y > 700) doc.addPage();

      doc.fillColor("#000").fontSize(12).text(`${i + 1}. [${r.category}] ${r.location}`, { continued: false });
      doc.fontSize(9).fillColor("#555").text(`Status: ${r.status}  |  Reported: ${r.dateReported.toLocaleDateString("en-GB")}`);
      doc.fontSize(10).fillColor("#222").text(r.description, { width: 480 });
      doc.moveDown(0.8);
    });

    doc.end();
  } catch (err) {
    next(err);
  }
});

export default router;

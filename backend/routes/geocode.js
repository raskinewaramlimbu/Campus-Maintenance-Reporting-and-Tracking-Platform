import { Router } from "express";
import fetch from "node-fetch";

const router = Router();


router.get("/", async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ error: "Query string 'q' must be at least 3 characters" });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "3");

    const response = await fetch(url, {
      headers: {

        "User-Agent": "FixMyCampus-CourseworkApp/1.0 (student project, CPS7005C)",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Geocoding service is unavailable right now" });
    }

    const results = await response.json();


    const simplified = results.map((r) => ({
      displayName: r.display_name,
      lat: r.lat,
      lon: r.lon,
    }));

    res.json(simplified);
  } catch (err) {
    next(err);
  }
});

export default router;

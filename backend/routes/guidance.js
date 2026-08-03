import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDANCE_FILE = path.join(__dirname, "..", "data", "guidance.json");

const router = Router();

// This is intentionally just a read of a JSON file - the brief only asks for
// static guidance content served from Express, no need to over-engineer it
// with a database table for something that basically never changes.
router.get("/", async (req, res, next) => {
  try {
    const raw = await fs.readFile(GUIDANCE_FILE, "utf-8");
    res.json(JSON.parse(raw));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const raw = await fs.readFile(GUIDANCE_FILE, "utf-8");
    const items = JSON.parse(raw);
    const item = items.find((g) => g.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Guidance article not found" });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

export default router;

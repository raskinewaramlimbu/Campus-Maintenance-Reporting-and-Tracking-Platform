import cron from "node-cron";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { sendReminderDigest } from "./reminderMailer.js";

// Runs once a day at 8am server time. Kept separate from the on-demand
// GET /api/analytics/reminders route (which staff can check any time in
// the dashboard) - this is the proactive push side of the same feature.
export function scheduleReminderDigest() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const thresholdDays = parseInt(process.env.REMINDER_THRESHOLD_DAYS, 10) || 3;
      const cutoff = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);

      const overdue = await Report.find({
        status: { $ne: "Resolved" },
        dateReported: { $lt: cutoff },
      });

      if (overdue.length === 0) return;

      // send to every staff account rather than a single fixed inbox -
      // simple for coursework, an admin-only digest would be the next step
      const staff = await User.find({}, "email");
      for (const person of staff) {
        await sendReminderDigest(overdue, person.email);
      }
    } catch (err) {
      console.error("Reminder digest job failed:", err.message);
    }
  });

  console.log("Reminder digest scheduled for 08:00 daily");
}

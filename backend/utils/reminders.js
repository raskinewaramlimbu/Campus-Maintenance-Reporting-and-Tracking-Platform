import cron from "node-cron";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { sendReminderDigest } from "./reminderMailer.js";


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

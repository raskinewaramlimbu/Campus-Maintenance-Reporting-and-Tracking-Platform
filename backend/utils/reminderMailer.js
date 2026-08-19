import nodemailer from "nodemailer";


function getTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export async function sendReminderDigest(overdueReports, toAddress) {
  const subject = `FixMyCampus: ${overdueReports.length} report(s) need attention`;
  const lines = overdueReports.map(
    (r) => `- [${r.category}] ${r.location} - reported ${r.dateReported.toLocaleDateString("en-GB")}`
  );
  const body = `The following reports have been open longer than the reminder threshold:\n\n${lines.join("\n")}`;

  const transport = getTransport();
  if (!transport) {
    console.log(`[reminder email - SMTP not configured, logging instead]\nTo: ${toAddress}\nSubject: ${subject}\n${body}`);
    return { sent: false, reason: "SMTP not configured" };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || "fixmycampus@example.com",
    to: toAddress,
    subject,
    text: body,
  });
  return { sent: true };
}

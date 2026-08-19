import "dotenv/config";
import connectDB from "../config/db.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

const sampleReports = [
  {
    category: "Plumbing",
    location: "Sackville Building, 2nd floor toilets",
    description:
      "Cold tap in the men's toilets nearest the lift won't turn off, water has been running since at least Monday morning.",
    status: "In Progress",
    reportedBy: "student",
    consentGiven: true,
  },
  {
    category: "Electrical",
    location: "Library, silent study room 3",
    description:
      "Three of the desk lamps are flickering and one has a scorch mark on the plug socket - feels unsafe.",
    status: "New",
    reportedBy: "staff",
    consentGiven: true,
  },
  {
    category: "Heating/Cooling",
    location: "Portland House, lecture theatre A",
    description: "No heating at all this week, students keep leaving early because it's freezing.",
    status: "Resolved",
    reportedBy: "staff",
    consentGiven: true,
  },
  {
    category: "Accessibility",
    location: "Student Union entrance",
    description:
      "Automatic door button on the ramp side has stopped working, wheelchair users have to buzz for someone to let them in.",
    status: "New",
    reportedBy: "student",
    consentGiven: true,
  },
  {
    category: "Cleaning",
    location: "Deane Road canteen",
    description: "Spillage near the drinks fridge hasn't been cleaned up since yesterday lunchtime.",
    status: "Resolved",
    reportedBy: "student",
    consentGiven: true,
  },
  {
    category: "Electrical",
    location: "Sackville Building, ground floor corridor",
    description: "Flickering corridor lights outside room G12.",
    status: "In Progress",
    reportedBy: "staff",
    consentGiven: true,
  },
];

async function seed() {
  await connectDB();

  await Report.deleteMany({});
  const created = await Report.insertMany(sampleReports);


  await Report.findByIdAndUpdate(created[0]._id, {
    dateReported: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });
  await Report.findByIdAndUpdate(created[1]._id, {
    dateReported: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  });
  const resolvedOne = await Report.findById(created[2]._id);
  resolvedOne.dateReported = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  resolvedOne.resolvedAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  await resolvedOne.save({ validateBeforeSave: false });

  console.log(`Seeded ${created.length} sample reports`);

  const existingDemo = await User.findOne({ email: "staff@fixmycampus.test" });
  if (!existingDemo) {
    await User.create({
      name: "Demo Estates Staff",
      email: "staff@fixmycampus.test",
      passwordHash: await User.hashPassword("password123"),
      role: "admin",
    });
    console.log("Created demo staff login: staff@fixmycampus.test / password123");
  } else {
    console.log("Demo staff account already exists, skipped");
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

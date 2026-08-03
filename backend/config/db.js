import mongoose from "mongoose";

// Kept as its own module so server.js doesn't get cluttered and so tests
// (if we ever add them) can import just the connection logic.
export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set - copy .env.example to .env and fill it in");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri);
  console.log(`MongoDB connected -> ${mongoose.connection.name}`);

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
}

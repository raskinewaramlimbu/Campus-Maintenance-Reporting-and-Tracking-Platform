import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Kept intentionally small - this app doesn't need a public "student"
// account system since reports can be submitted without logging in. Users
// here represent Estates staff who need to manage reports.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["staff", "admin"], default: "staff" },
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 12);
};

// never send the hash back out by accident
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

export default mongoose.model("User", userSchema);

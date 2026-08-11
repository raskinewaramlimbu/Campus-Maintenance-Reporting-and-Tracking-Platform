import mongoose from "mongoose";

const CATEGORIES = ["Plumbing", "Electrical", "Heating/Cooling", "Accessibility", "Cleaning", "Other"];
const STATUSES = ["New", "In Progress", "Resolved"];

const geoSchema = new mongoose.Schema(
  {
    lat: Number,
    lon: Number,
    label: String,
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, enum: CATEGORIES },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    photoUrl: { type: String, default: "", trim: true },
    status: { type: String, enum: STATUSES, default: "New" },
    reportedBy: { type: String, default: "anonymous", trim: true, maxlength: 100 },
    consentGiven: { type: Boolean, required: true },
    geo: { type: geoSchema, default: null },


      resolvedAt: {
    type: Date,
    default: null,
    validate: {
      validator: function (value) {
        if (!value || this.isNew || !this.dateReported) return true;
        return value >= this.dateReported;
      },
      message: "resolvedAt cannot be earlier than dateReported",
    },
  },

    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: { createdAt: "dateReported", updatedAt: "lastUpdated" },
  }
);


reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ location: "text" });

reportSchema.pre("save", function (next) {
  
  if (this.isModified("status") && this.status === "Resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

reportSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const CATEGORY_VALUES = CATEGORIES;
export const STATUS_VALUES = STATUSES;

export default mongoose.model("Report", reportSchema);

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

    // set once, the first time a report moves to Resolved - this is what
    // the resolution-time analytics are built from
    resolvedAt: { type: Date, default: null },

    // who (if anyone) actioned this - only populated once staff accounts
    // start updating reports
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: { createdAt: "dateReported", updatedAt: "lastUpdated" },
  }
);

// indexes for the filters/analytics we actually query on
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ location: "text" });

reportSchema.pre("save", function (next) {
  // stamp resolvedAt the moment a report first becomes Resolved, don't
  // touch it again if it's edited afterwards
  if (this.isModified("status") && this.status === "Resolved" && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// the frontend was originally written against the JSON-file version of this
// API where every record had a plain `id` string - rather than rewrite
// every component to use Mongo's `_id`, just expose both
reportSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

export const CATEGORY_VALUES = CATEGORIES;
export const STATUS_VALUES = STATUSES;

export default mongoose.model("Report", reportSchema);

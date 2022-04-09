import mongoose from "mongoose";

const request = mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      default: "notApproved",
    },
    when: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

request.index({ from: 1, to: 1 }, { unique: true });
export default mongoose.model("Request", request);

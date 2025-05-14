import mongoose from "mongoose";

const sportsSchema = new mongoose.Schema(
  {
    sportsName: {
      type: String,
      required: [true, "Sports name is required"],
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export default mongoose.model("Sports", sportsSchema);
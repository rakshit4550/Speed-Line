import mongoose from "mongoose";

const marketSchema = new mongoose.Schema(
  {
    marketName: {
      type: String,
      required: [true, "MarketName is required"],
      trim: true,
    },
  },
);

export default mongoose.model("Market", marketSchema);
import mongoose from "mongoose";

const proofSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
});

export default mongoose.model("Proof", proofSchema);
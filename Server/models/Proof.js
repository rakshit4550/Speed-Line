import mongoose from 'mongoose';

const proofSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "Technical Malfunction",
      "Odds Manipulating Or Odds Hedging",
      "Live Line and Ground Line",
      "Live Line Betting"
    ],
    default: "Technical Malfunction"
  },
  user: {
    type: String,
    ref: 'whitelabel',
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

export default mongoose.model('Proof', proofSchema);
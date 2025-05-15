import mongoose from 'mongoose';

const proofSchema = new mongoose.Schema({
  type: {
    type: String,
    required : true,
    unique : true,
    trim: true,
  },
  content: {
    type : String,
    required : true
  },
});

proofSchema.index({ type: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('Proof', proofSchema);
import mongoose from 'mongoose';

const sportsSchema = new mongoose.Schema({
  sportsName: {
    type: String,
    required: true,
    unique: true, // Enforce uniqueness at the database level
    trim: true,
  },
},
);

// Ensure unique index is case-insensitive
sportsSchema.index({ sportsName: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const Sports = mongoose.model('Sports', sportsSchema);

export default Sports;
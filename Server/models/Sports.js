import mongoose from 'mongoose';

const sportsSchema = new mongoose.Schema({
  sportsName: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
  },
},
);

const Sports = mongoose.model('Sports', sportsSchema);

export default Sports;
// import mongoose from "mongoose";

// const betDetailSchema = new mongoose.Schema({
//   odds: { type: Number},
//   stack: { type: Number},
//   time: { type: String}
// });

// const reportSchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   userName: { type: String, required: true },
//   agent: { type: String, required: true },
//   origin: { type: String, required: true },
//   sportName: { type: String, required: true },
//   eventName: { type: String, required: true },
//   marketName: { type: String, required: true },
//   acBalance: { type: Number, required: true },
//   afterVoidBalance: { type: Number, required: true },
//   pl: { type: Number, required: true }, 
//   betDetails: [betDetailSchema], 
//   catchBy: { type: String, required: true },
//   remark1: { type: String },
//   remark2: { type: String }
// });

// export default mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';

const betDetailSchema = new mongoose.Schema({
  odds: { type: Number, required: true },
  stack: { type: Number, required: true },
  time: { type: String, required: true }
});

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userName: { type: String, required: true },
  agent: { type: String, required: true },
  origin: { type: String, required: true },
  sportName: { type: String, required: true },
  eventName: { type: String, required: true },
  marketName: { type: String, required: true },
  acBalance: { type: Number, required: true },
  afterVoidBalance: { type: Number, required: true },
  pl: { type: Number, required: true }, 
  betDetails: [betDetailSchema], 
  catchBy: { type: String, required: true },
  remark1: { type: String },
  remark2: { type: String }
});

export default mongoose.model('Report', reportSchema);
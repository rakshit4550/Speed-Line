// import mongoose from 'mongoose';

// const betDetailSchema = new mongoose.Schema({
//   odds: { type: Number, required: true },
//   stack: { type: Number, required: true },
//   time: { type: String, required: true }
// });

// const reportSchema = new mongoose.Schema({
//   date: { type: Date, required: true },
//   userName: { type: String, required: true },
//   agent: { type: String, required: true },
//   origin: { type: String, required: true },
//   sportName: { 
//     type: String, 
//     required: true,
//     enum: [
//       'Cricket',
//       'Kabaddi',
//       'Socceraa',
//       'Tennis',
//       'Casino',
//       'Original',
//       'All Caino',
//       'Int Casino',
//       'Basketball',
//       'Multi Sports'
//     ]
//   },
//   eventName: { type: String, required: true },
//   marketName: { 
//     type: String, 
//     required: true,
//     enum: [
//       'Match Odds',
//       'Moneyline',
//       'Multi Market'
//     ]
//   },
//   acBalance: { type: Number, required: true },
//   afterVoidBalance: { type: Number, required: true },
//   pl: { type: Number, required: true }, 
//   betDetails: [betDetailSchema], 
//   catchBy: { 
//     type: String, 
//     required: true,
//     enum: [
//       'Niket',
//       'Dhruv',
//       'Jaydeep',
//       'Krunal',
//       'Sachin',
//       'Vivek',
//       'Rahul',
//       'Harsh B.'
//     ]
//   },
//   proofType: { 
//     type: String, 
//     required: true, 
//     enum: [
//       'Live Line Betting or Ground Line Betting',
//       'Live Line Betting, Ground Line and Group Betting',
//       'Odds Manipulating or Odds Hedging',
//       'Odds Manipulating or Odds Hedging and Group Betting',
//       'Offside Goal and Goal Cancel'
//     ], 
//     default: 'Live Line Betting or Ground Line Betting' 
//   },
//   proofStatus: { 
//     type: String, 
//     enum: ['Submitted', 'Not Submitted'], 
//     default: 'Not Submitted' 
//   },
//   remark: { type: String }
// });

// export default mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';

const betDetailSchema = new mongoose.Schema({
  odds: { type: Number, required: true },
  stack: { type: Number, required: true },
  time: { type: String, required: true } // Stored in 24-hour format (HH:mm:ss), but API expects 12-hour format (HH:mm:ss AM/PM)
});

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userName: { type: String, required: true },
  agent: { type: String, required: true },
  origin: { type: String, required: true },
  sportName: { 
    type: String, 
    required: true,
    enum: [
      'Cricket',
      'Kabaddi',
      'Socceraa',
      'Tennis',
      'Casino',
      'Original',
      'All Caino',
      'Int Casino',
      'Basketball',
      'Multi Sports'
    ]
  },
  eventName: { type: String, required: true },
  marketName: { 
    type: String, 
    required: true,
    enum: [
      'Match Odds',
      'Moneyline',
      'Multi Market'
    ]
  },
  acBalance: { type: Number, required: true },
  afterVoidBalance: { type: Number, required: true },
  pl: { type: Number, required: true }, 
  betDetails: [betDetailSchema], 
  catchBy: { 
    type: String, 
    required: true,
    enum: [
      'Niket',
      'Dhruv',
      'Jaydeep',
      'Krunal',
      'Sachin',
      'Vivek',
      'Rahul',
      'Harsh B.'
    ]
  },
  proofType: { 
    type: String, 
    required: true, 
    enum: [
      'Live Line Betting or Ground Line Betting',
      'Live Line Betting, Ground Line and Group Betting',
      'Odds Manipulating or Odds Hedging',
      'Odds Manipulating or Odds Hedging and Group Betting',
      'Offside Goal and Goal Cancel'
    ], 
    default: 'Live Line Betting or Ground Line Betting' 
  },
  proofStatus: { 
    type: String, 
    enum: ['Submitted', 'Not Submitted'], 
    default: 'Not Submitted' 
  },
  remark: { type: String }
});

export default mongoose.model('Report', reportSchema);
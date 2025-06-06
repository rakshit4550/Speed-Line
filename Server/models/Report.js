// import mongoose from 'mongoose';

// const betDetailSchema = new mongoose.Schema({
//   odds: { type: Number, required: true },
//   stack: { type: Number, required: true },
//   time: { type: String, required: true } // Stored in 24-hour format (HH:mm:ss), but API expects 12-hour format (HH:mm:ss AM/PM)
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
//   multiSport: {
//     type: String,
//     enum: [
//       '',
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
//     ],
//     default: ''
//   },
//   multiEvent: { type: String, default: '' },
//   multiMarket: {
//     type: String,
//     enum: [
//       '',
//       'Match Odds',
//       'Moneyline',
//       'Multi Market'
//     ],
//     default: ''
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
  time: { type: String, required: true },
});

const reportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  userName: { type: String, required: true },
  agent: { type: String, required: true },
  origin: { type: String, default: '' },
  original: {
    sportNames: [{
      type: String,
      required: true,
      enum: [
        'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
        'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
      ]
    }],
    eventNames: [{ type: String, required: true }],
    marketNames: [{
      type: String,
      required: true,
      enum: ['Match Odds', 'Moneyline', 'Multi Market']
    }],
    betDetails: { 
      type: [betDetailSchema], 
      required: true, 
      validate: [v => v.length > 0, 'At least one bet detail is required'] 
    }
  },
  multiple: {
    enabled: { type: Boolean, default: false },
    sportName: {
      type: String,
      enum: ['', 'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
             'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'],
      default: ''
    },
    eventName: { type: String, default: '' },
    marketName: {
      type: String,
      enum: ['', 'Match Odds', 'Moneyline', 'Multi Market'],
      default: ''
    },
    betDetails: { type: [betDetailSchema], default: [] }
  },
  acBalance: { type: Number, default: 0 },
  afterVoidBalance: { type: Number, default: 0 },
  pl: { type: Number, default: 0 },
  catchBy: {
    type: String,
    required: true,
    enum: ['Niket', 'Dhruv', 'Jaydeep', 'Krunal', 'Sachin', 'Vivek', 'Rahul', 'Harsh B.']
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
    ]
  },
  proofStatus: {
    type: String,
    enum: ['Submitted', 'Not Submitted'],
    default: 'Not Submitted'
  },
  remark: { type: String, default: '' }
});

export default mongoose.model('Report', reportSchema);
// import mongoose from 'mongoose';
// import { whitelabel } from '../models/WhiteLabel.js';
// import Proof from '../models/Proof.js';
// import Sports from '../models/Sports.js';
// import Market from '../models/Market.js';

// const clientSchema = new mongoose.Schema({
//   agentname: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   whitelabel_user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'whitelabel',
//     required: true,
//     validate: {
//       validator: async function (value) {
//         const wl = await whitelabel.findById(value);
//         return !!wl;
//       },
//       message: 'Invalid username: User not found in whitelabel',
//     },
//   },
//   user: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   amount: {
//     type: Number,
//     required: true,
//     min: 0,
//   },
//   prooftype: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Proof',
//     required: true,
//     validate: {
//       validator: async function (value) {
//         const proof = await Proof.findById(value);
//         return !!proof;
//       },
//       message: 'Invalid proof type: Proof not found',
//     },
//   },
//   sportname: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Sports',
//     required: true,
//     validate: {
//       validator: async function (value) {
//         const sport = await Sports.findById(value);
//         return !!sport;
//       },
//       message: 'Invalid sport name: Sport not found',
//     },
//   },
//   marketname: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Market',
//     required: true,
//     validate: {
//       validator: async function (value) {
//         const market = await Market.findById(value);
//         return !!market;
//       },
//       message: 'Invalid event name: Market not found',
//     },
//   },
//   eventname: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   navigation: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   profitAndLoss: {
//     type: Number,
//     required: true,
//   },
//   proofMaker: {
//     type: String,
//     trim: true,
//   },
//   images: [
//     {
//       path: {
//         type: String,
//         required: true,
//       },
//       filename: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
//   navigation2: {
//     type: String,
//     trim: true,
//   },
//   navigation2Images: [
//     {
//       path: {
//         type: String,
//       },
//       filename: {
//         type: String,
//       },
//     },
//   ],
// });

// export default mongoose.model('Client', clientSchema);

import mongoose from 'mongoose';
import { whitelabel } from '../models/WhiteLabel.js';
import Proof from '../models/Proof.js';
import Sports from '../models/Sports.js';
import Market from '../models/Market.js';

const clientSchema = new mongoose.Schema({
  agentname: {
    type: String,
    required: true,
    trim: true,
  },
  whitelabel_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'whitelabel',
    required: true,
    validate: {
      validator: async function (value) {
        const wl = await whitelabel.findById(value);
        return !!wl;
      },
      message: 'Invalid username: User not found in whitelabel',
    },
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  prooftype: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proof',
    required: true,
    validate: {
      validator: async function (value) {
        const proof = await Proof.findById(value);
        return !!proof;
      },
      message: 'Invalid proof type: Proof not found',
    },
  },
  sportname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sports',
    required: true,
    validate: {
      validator: async function (value) {
        const sport = await Sports.findById(value);
        return !!sport;
      },
      message: 'Invalid sport name: Sport not found',
    },
  },
  marketname: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Market',
    required: true,
    validate: {
      validator: async function (value) {
        const market = await Market.findById(value);
        return !!market;
      },
      message: 'Invalid event name: Market not found',
    },
  },
  eventname: {
    type: String,
    required: true,
    trim: true,
  },
  navigation: {
    type: String,
    required: true,
    trim: true,
  },
  profitAndLoss: {
    type: Number,
    required: true,
  },
  proofMaker: {
    type: String,
    trim: true,
  },
  images: [
    {
      path: {
        type: String,
        required: true,
      },
      filename: {
        type: String,
        required: true,
      },
    },
  ],
  navigation2: {
    type: String,
    trim: true,
  },
  navigation2Images: [
    {
      path: {
        type: String,
      },
      filename: {
        type: String,
      },
    },
  ],
});

export default mongoose.model('Client', clientSchema);
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
  username: {
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
  profitAndLoss: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('Client', clientSchema);
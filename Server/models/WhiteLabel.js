import mongoose from "mongoose";

const whitelabelSchema = new mongoose.Schema({
    whitelabel_user:{type:String,require:true},
    group:{type:String,require:true,unique:true},
    logo:{type:String,require:true},
    hexacode: { 
        type: String, 
        required: true,
        match: [/^#/, "Hexacode must start with '#'"]
    },
    url:{type:String, require:true},
    prooftype: {
        type: String,
        enum: ["Technical Malfunction", "Odds Manipulating Or Odds Hedging", "Live Line and Ground Line", "Live Line Betting"],
        default: "Technical Malfunction",
      },
    createdAt:{type:Date,default:Date.now},
})

export const whitelabel = mongoose.model("whitelabel", whitelabelSchema)
import mongoose from "mongoose";
import { whitelabel } from "./WhiteLabel.js";

const sportsSchema = new mongoose.Schema(
  {
    sportsName: {
      type: String,
      required: [true, "Sports name is required"],
      enum: {
        values: [
          "Cricket",
          "Kabaddi",
          "Football",
          "Basketball",
          "Hockey",
          "Volleyball",
          "Tennis",
          "Badminton",
          "Athletics",
          "Wrestling",
        ],
        message: "{VALUE} is not a supported sport",
      },
      trim: true,
    },
    user: {
      type: String,
      required: [true, "User is required"],
      trim: true,
      validate: {
        validator: async function (value) {
          const userExists = await whitelabel.findOne({ user: value });
          return !!userExists;
        },
        message: "User {VALUE} does not exist in whitelabel collection",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Sports", sportsSchema);
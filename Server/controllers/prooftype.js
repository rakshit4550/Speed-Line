import Proof from "../models/Proof.js";
import { whitelabel } from "../models/WhiteLabel.js";

export const getProofByType = async (req, res) => {
  try {
    const user = req.query.user;
    const proofType = req.params.type;
    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      console.log(`User ${user} not found in whitelabel`);
      return res
        .status(400)
        .json({ message: "Invalid user: User not found in whitelabel" });
    }

    console.log(`Querying proof for type: ${proofType}, user: ${user}`);
    let proof = await Proof.findOne({
      type: { $regex: new RegExp(`^${proofType}$`, "i") },
      user,
    });

    if (!proof) {
      console.log(`Proof type ${proofType} not found for user ${user}. Creating new proof.`);
      const defaultContents = {
        "Technical Malfunction": "Default content for technical malfunction...",
        "Odds Manipulating Or Odds Hedging": "Default content for odds manipulation...",
        "Live Line and Ground Line": "Default content for live line and ground line...",
        "Live Line Betting": "Default content for live line betting...",
      };
      const defaultContent = defaultContents[proofType] || `Default content for ${proofType}...`;
      proof = await Proof.create({
        type: proofType,
        content: defaultContent,
        user,
      });
      console.log(`Created new proof for type ${proofType}, user ${user}`);
    }

    res.json({ type: proof.type, content: proof.content, user: proof.user });
  } catch (error) {
    console.error(`Error in getProofByType for type ${req.params.type}, user ${req.query.user}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProofs = async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      console.log(`User ${user} not found in whitelabel`);
      return res
        .status(400)
        .json({ message: "Invalid user: User not found in whitelabel" });
    }

    const proofs = await Proof.find({ user });
    console.log(`Found ${proofs.length} proofs for user ${user}`);
    res.json(proofs);
  } catch (error) {
    console.error(`Error in getAllProofs for user ${req.query.user}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProofContent = async (req, res) => {
  try {
    const { content } = req.body;
    const user = req.query.user;
    const proofType = req.params.type;

    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    if (!content && req.method === "GET") {
      const proofs = await Proof.find().select("type content");
      return res.json({
        message: "Available proof types and their content",
        proofTypes: proofs.map((proof) => ({
          type: proof.type,
          content: proof.content,
        })),
      });
    }

    const validProofTypes = [
      "Technical Malfunction",
      "Odds Manipulating Or Odds Hedging",
      "Live Line and Ground Line",
      "Live Line Betting",
    ];
    if (!validProofTypes.includes(proofType)) {
      return res.status(400).json({ message: "Invalid proof type" });
    }

    if (!content) {
      return res.status(400).json({ message: "Valid content is required" });
    }

    let proof = await Proof.findOne({
      type: { $regex: new RegExp(`^${proofType}$`, "i") },
      user,
    });

    if (!proof) {
      console.log(`Proof type ${proofType} not found for user ${user}. Creating new proof.`);
      const defaultContents = {
        "Technical Malfunction": "Default content for technical malfunction...",
        "Odds Manipulating Or Odds Hedging": "Default content for odds manipulation...",
        "Live Line and Ground Line": "Default content for live line and ground line...",
        "Live Line Betting": "Default content for live line betting...",
      };
      proof = await Proof.create({
        type: proofType,
        content: content.trim(),
        user,
      });
      console.log(`Created new proof for type ${proofType}, user ${user}`);
    } else {
      proof = await Proof.findOneAndUpdate(
        { type: { $regex: new RegExp(`^${proofType}$`, "i") }, user },
        { content: content.trim() },
        { new: true, writeConcern: { w: "majority" } }
      );
    }

    if (!proof) {
      console.log(`Failed to update or create proof type ${proofType} for user ${user}`);
      return res.status(500).json({ message: "Failed to update or create proof" });
    }

    res.json({ message: "Content updated successfully", proof });
  } catch (error) {
    console.error(`Error in updateProofContent for type ${req.params.type}, user ${req.query.user}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const initializeProofs = async () => {
  try {
    const whitelabels = await whitelabel.find().select("user");

    if (!whitelabels.length) {
      console.log("No whitelabel users found for proof initialization");
      return;
    }

    const proofTypes = [
      {
        type: "Technical Malfunction",
        content: "Default content for technical malfunction...",
      },
      {
        type: "Odds Manipulating Or Odds Hedging",
        content: "Default content for odds manipulation...",
      },
      {
        type: "Live Line and Ground Line",
        content: "Default content for live line and ground line...",
      },
      {
        type: "Live Line Betting",
        content: "Default content for live line betting...",
      },
    ];

    for (const wl of whitelabels) {
      for (const proof of proofTypes) {
        const exists = await Proof.findOne({
          type: proof.type,
          user: wl.user,
        });
        if (!exists) {
          await Proof.create({
            ...proof,
            user: wl.user,
          });
          console.log(`Initialized proof ${proof.type} for user ${wl.user}`);
        } else {
          console.log(`Proof ${proof.type} already exists for user ${wl.user}`);
        }
      }
    }
    console.log("Proof initialization completed");
  } catch (error) {
    console.error("Error in initializeProofs:", error);
  }
};
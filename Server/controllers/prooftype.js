import Proof from "../models/Proof.js";
import { whitelabel } from "../models/WhiteLabel.js";

export const getProofByType = async (req, res) => {
  try {
    const user = req.query.user;
    if (!user) {
      return res.status(400).json({ message: "User parameter is required" });
    }

    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      return res
        .status(400)
        .json({ message: "Invalid user: User not found in whitelabel" });
    }

    const proof = await Proof.findOne({
      type: req.params.type,
      user,
    });
    if (!proof) {
      return res
        .status(404)
        .json({ message: "Proof type not found for this user" });
    }
    res.json({ type: proof.type, content: proof.content, user: proof.user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
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
      return res
        .status(400)
        .json({ message: "Invalid user: User not found in whitelabel" });
    }

    const proofs = await Proof.find({ user });
    res.json(proofs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProofContent = async (req, res) => {
  try {
    const { content } = req.body;
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
    const proofType = req.params.type;
    if (!validProofTypes.includes(proofType)) {
      return res.status(400).json({ message: "Invalid proof type" });
    }

    if (!content) {
      return res.status(400).json({ message: "Valid content is required" });
    }

    const proof = await Proof.findOneAndUpdate(
      { type: proofType },
      { content: content.trim() },
      { new: true }
    );

    if (!proof) {
      return res.status(404).json({ message: "Proof type not found" });
    }

    res.json({ message: "Content updated successfully", proof });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const initializeProofs = async () => {
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
      }
    }
  }
};
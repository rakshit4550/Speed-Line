import Sports from "../models/Sports.js";
import { whitelabel } from "../models/WhiteLabel.js";

// Create a new sports entry
export const createSports = async (req, res) => {
  try {
    const { sportsName, user } = req.body;

    if (!sportsName || !user) {
      return res.status(400).json({ message: "Sports name and user are required" });
    }

    // Additional validation for user existence (optional, since model validates)
    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      return res.status(400).json({ message: `User ${user} does not exist in whitelabel collection` });
    }

    const sports = await Sports.create({ sportsName, user });
    res.status(201).json({ message: "Sports created successfully", sports });
  } catch (error) {
    console.error("Error in createSports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all sports entries
export const getAllSports = async (req, res) => {
  try {
    const { user } = req.query;
    let query = {};
    if (user) {
      query.user = user;
      const userExists = await whitelabel.findOne({ user });
      if (!userExists) {
        return res.status(400).json({ message: `User ${user} does not exist in whitelabel collection` });
      }
    }

    const sports = await Sports.find(query);
    res.json({ message: "Sports retrieved successfully", sports });
  } catch (error) {
    console.error("Error in getAllSports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single sports entry by ID
export const getSportsById = async (req, res) => {
  try {
    const sports = await Sports.findById(req.params.id);
    if (!sports) {
      return res.status(404).json({ message: "Sports entry not found" });
    }
    res.json({ message: "Sports retrieved successfully", sports });
  } catch (error) {
    console.error("Error in getSportsById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a sports entry
export const updateSports = async (req, res) => {
  try {
    const { sportsName, user } = req.body;

    if (!sportsName || !user) {
      return res.status(400).json({ message: "Sports name and user are required" });
    }

    // Validate user existence
    const userExists = await whitelabel.findOne({ user });
    if (!userExists) {
      return res.status(400).json({ message: `User ${user} does not exist in whitelabel collection` });
    }

    const sports = await Sports.findByIdAndUpdate(
      req.params.id,
      { sportsName, user },
      { new: true, runValidators: true }
    );

    if (!sports) {
      return res.status(404).json({ message: "Sports entry not found" });
    }

    res.json({ message: "Sports updated successfully", sports });
  } catch (error) {
    console.error("Error in updateSports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a sports entry
export const deleteSports = async (req, res) => {
  try {
    const sports = await Sports.findByIdAndDelete(req.params.id);
    if (!sports) {
      return res.status(404).json({ message: "Sports entry not found" });
    }
    res.json({ message: "Sports deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSports:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
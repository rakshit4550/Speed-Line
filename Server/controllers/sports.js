import Sports from "../models/Sports.js"; // Adjust path to your model file

// Create a new sport
export const createSport = async (req, res) => {
  try {
    const { sportsName } = req.body;
    
    if (!sportsName) {
      return res.status(400).json({ message: "Sports name is required" });
    }

    // Check if sport already exists (case-insensitive)
    const existingSport = await Sports.findOne({
      sportsName: { $regex: new RegExp(`^${sportsName}$`, "i") },
    });
    
    if (existingSport) {
      return res.status(409).json({ message: "Sport already exists" });
    }

    const newSport = await Sports.create({ sportsName });
    res.status(201).json({
      message: "Sport created successfully",
      data: newSport,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all sports
export const getAllSports = async (req, res) => {
  try {
    const sports = await Sports.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Sports retrieved successfully",
      data: sports,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single sport by ID
export const getSportById = async (req, res) => {
  try {
    const sport = await Sports.findById(req.params.id);
    
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }
    
    res.status(200).json({
      message: "Sport retrieved successfully",
      data: sport,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a sport
export const updateSport = async (req, res) => {
  try {
    const { sportsName } = req.body;
    const sport = await Sports.findById(req.params.id);
    
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    if (sportsName) sport.sportsName = sportsName;
    
    const updatedSport = await sport.save();
    res.status(200).json({
      message: "Sport updated successfully",
      data: updatedSport,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a sport
export const deleteSport = async (req, res) => {
  try {
    const sport = await Sports.findById(req.params.id);
    
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }
    
    await Sports.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Sport deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
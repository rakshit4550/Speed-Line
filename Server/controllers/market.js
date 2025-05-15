import Market from "../models/Market.js";

export const createMarket = async (req, res) => {
  try {
    const { marketName } = req.body;

    const existingMarket = await Market.findOne({ marketName: marketName.trim() });
    if (existingMarket) {
      return res.status(409).json({
        success: false,
        message: "Market name already exists. Please choose a different name.",
      });
    }

    const newMarket = new Market({ marketName: marketName.trim() });
    const savedMarket = await newMarket.save();
    res.status(201).json({
      success: true,
      data: savedMarket,
      message: "Market created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message: "Error creating market",
    });
  }
};


export const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find();
    res.status(200).json({
      success: true,
      data: markets,
      message: "Markets retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error retrieving markets",
    });
  }
};

export const getMarketById = async (req, res) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }
    res.status(200).json({
      success: true,
      data: market,
      message: "Market retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error retrieving market",
    });
  }
};

export const updateMarket = async (req, res) => {
  try {
    const { marketName } = req.body;
    const market = await Market.findByIdAndUpdate(
      req.params.id,
      { marketName },
      { new: true, runValidators: true }
    );
    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }
    res.status(200).json({
      success: true,
      data: market,
      message: "Market updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      message: "Error updating market",
    });
  }
};

export const deleteMarket = async (req, res) => {
  try {
    const market = await Market.findByIdAndDelete(req.params.id);
    if (!market) {
      return res.status(404).json({
        success: false,
        message: "Market not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Market deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Error deleting market",
    });
  }
};
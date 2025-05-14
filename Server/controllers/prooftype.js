import Proof from '../models/proof.js';

// Create a new proof
export const createProof = async (req, res) => {
  try {
    const { type, content } = req.body;
    
    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    const proof = new Proof({ type, content });
    await proof.save();
    
    res.status(201).json({ message: 'Proof created successfully', proof });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all proofs
export const getAllProofs = async (req, res) => {
  try {
    const proofs = await Proof.find().sort({ createdAt: -1 });
    res.status(200).json(proofs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single proof by ID
export const getProofById = async (req, res) => {
  try {
    const proof = await Proof.findById(req.params.id);
    
    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    
    res.status(200).json(proof);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a proof
export const updateProof = async (req, res) => {
  try {
    const { type, content } = req.body;
    
    const proof = await Proof.findById(req.params.id);
    
    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    
    proof.type = type || proof.type;
    proof.content = content || proof.content;
    
    await proof.save();
    
    res.status(200).json({ message: 'Proof updated successfully', proof });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a proof
export const deleteProof = async (req, res) => {
  try {
    const proof = await Proof.findById(req.params.id);
    
    if (!proof) {
      return res.status(404).json({ message: 'Proof not found' });
    }
    
    await proof.deleteOne();
    
    res.status(200).json({ message: 'Proof deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// import Proof from '../models/Proof.js';

// // Create a new proof
// export const createProof = async (req, res) => {
//   try {
//     const { type, content } = req.body;

//     // Validate required fields
//     if (!type || !content) {
//       return res.status(400).json({ message: 'Type and content are required' });
//     }

//     // Normalize type for case-insensitive comparison
//     const normalizedType = type.trim().toLowerCase();

//     // Check for existing proof with the same type (case-insensitive)
//     const existingProof = await Proof.findOne({ type: { $regex: `^${normalizedType}$`, $options: 'i' } });
//     if (existingProof) {
//       return res.status(400).json({ message: 'Proof with this type already exists' });
//     }

//     // Create and save new proof
//     const proof = new Proof({ type: type.trim(), content: content.trim() });
//     await proof.save();

//     res.status(201).json({ message: 'Proof created successfully', proof });
//   } catch (error) {
//     console.error('Error creating proof:', error); // Log error for debugging
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
// // Get all proofs
// export const getAllProofs = async (req, res) => {
//   try {
//     const proofs = await Proof.find().sort({ createdAt: -1 });
//     res.status(200).json(proofs);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Get a single proof by ID
// export const getProofById = async (req, res) => {
//   try {
//     const proof = await Proof.findById(req.params.id);
    
//     if (!proof) {
//       return res.status(404).json({ message: 'Proof not found' });
//     }
    
//     res.status(200).json(proof);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Update a proof
// export const updateProof = async (req, res) => {
//   try {
//     const { type, content } = req.body;
    
//     const proof = await Proof.findById(req.params.id);
    
//     if (!proof) {
//       return res.status(404).json({ message: 'Proof not found' });
//     }
    
//     proof.type = type || proof.type;
//     proof.content = content || proof.content;
    
//     await proof.save();
    
//     res.status(200).json({ message: 'Proof updated successfully', proof });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Delete a proof
// export const deleteProof = async (req, res) => {
//   try {
//     const proof = await Proof.findById(req.params.id);
    
//     if (!proof) {
//       return res.status(404).json({ message: 'Proof not found' });
//     }
    
//     await proof.deleteOne();
    
//     res.status(200).json({ message: 'Proof deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

import Proof from '../models/Proof.js';

// Create a new proof
export const createProof = async (req, res) => {
  try {
    const { type, content } = req.body;

    // Validate required fields
    if (!type || !content) {
      return res.status(400).json({ message: 'Type and content are required' });
    }

    // Normalize type for case-insensitive comparison
    const normalizedType = type.trim().toLowerCase();

    // Check for existing proof with the same type (case-insensitive)
    const existingProof = await Proof.findOne({ type: { $regex: `^${normalizedType}$`, $options: 'i' } });
    if (existingProof) {
      return res.status(400).json({ message: 'Proof with this type already exists' });
    }

    // Create and save new proof
    const proof = new Proof({ type: type.trim(), content: content.trim() });
    await proof.save();

    res.status(201).json({ message: 'Proof created successfully', proof });
  } catch (error) {
    console.error('Error creating proof:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllProofs = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { type: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortField = sort || 'createdAt';
    const sortObj = { [sortField]: sortOrder };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch proofs
    const proofs = await Proof.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Proof.countDocuments(query);

    res.status(200).json({
      proofs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Error fetching proofs:', error);
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
    
    // Check for existing proof with the same type (case-insensitive), excluding current proof
    if (type) {
      const normalizedType = type.trim().toLowerCase();
      const existingProof = await Proof.findOne({
        type: { $regex: `^${normalizedType}$`, $options: 'i' },
        _id: { $ne: req.params.id },
      });
      if (existingProof) {
        return res.status(400).json({ message: 'Proof with this type already exists' });
      }
    }

    proof.type = type ? type.trim() : proof.type;
    proof.content = content ? content.trim() : proof.content;
    
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
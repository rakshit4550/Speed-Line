import express from 'express';
import { 
  createProof,
  getAllProofs,
  getProofById,
  updateProof,
  deleteProof 
} from '../controllers/prooftype.js';

const router = express.Router();

router.post('/', createProof);
router.get('/', getAllProofs);
router.get('/:id', getProofById);
router.put('/:id', updateProof);
router.delete('/:id', deleteProof);

export default router;
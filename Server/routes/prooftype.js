import express from 'express';
import { getProofByType, getAllProofs, updateProofContent } from '../controllers/prooftype.js';

const router = express.Router();

router.get('/proof/:type', getProofByType);

router.get('/proofs', getAllProofs);

router.put('/proof/:type', updateProofContent);

// router.post('/initialize', async (req, res) => {
//   try {
//     await initializeProofs();
//     res.status(200).json({ message: 'Proofs initialized successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to initialize proofs', error });
//   }
// });

export default router;
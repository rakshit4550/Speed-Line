import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getProofTypes,
  getSports,
  getMarkets,
  getAllWhitelabels,
  generatePreviewPDF,
} from '../controllers/client.js';

const router = express.Router();

// Define routes
router.post('/create', createClient);
router.get('/prooftypes', getProofTypes);
router.get('/sports', getSports);
router.get('/markets', getMarkets);
router.get('/whitelabels', getAllWhitelabels);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.post('/generate-preview-pdf', generatePreviewPDF)

export default router;
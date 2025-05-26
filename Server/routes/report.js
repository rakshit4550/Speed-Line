import { Router } from 'express';
import { createReport, getAllReports, getReportById, updateReport, deleteReport } from '../controllers/report.js';

const router = Router();

// Routes for Report
router.post('/create', createReport); 
router.get('/all', getAllReports); 
router.get('/:id', getReportById); 
router.put('/:id', updateReport); 
router.delete('/:id', deleteReport); 

export default router;
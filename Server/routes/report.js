import { Router } from 'express';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  exportReportsToExcel,
  importReports,
  validateReport,
  validateImportReports,
} from '../controllers/report.js';

const router = Router();

// Routes for Report
router.post('/create', validateReport, createReport);
router.get('/all', getAllReports);
router.get('/exportExcel', exportReportsToExcel);
router.post('/import', validateImportReports, importReports);
router.get('/:id', getReportById);
router.put('/:id', validateReport, updateReport);
router.delete('/:id', deleteReport);

export default router;
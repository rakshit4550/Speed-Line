// import { body, validationResult } from 'express-validator';
// import Report from '../models/Report.js';

// // Validation middleware for creating/updating reports
// export const validateReport = [
//   body('date').isISO8601().toDate().withMessage('Date must be a valid ISO 8601 date'),
//   body('userName').isString().notEmpty().withMessage('userName is required'),
//   body('agent').isString().notEmpty().withMessage('agent is required'),
//   body('origin').isString().notEmpty().withMessage('origin is required'),
//   body('sportName').isString().notEmpty().withMessage('sportName is required'),
//   body('eventName').isString().notEmpty().withMessage('eventName is required'),
//   body('marketName').isString().notEmpty().withMessage('marketName is required'),
//   body('acBalance').isFloat().withMessage('acBalance must be a number'),
//   body('afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
//   body('pl').isFloat().withMessage('P&L must be a number'),
//   body('betDetails').isArray({ min: 1 }).withMessage('betDetails must be a non-empty array'),
//   body('betDetails.*.odds').isFloat({ min: 0 }).withMessage('Each betDetail odds must be a positive number'),
//   body('betDetails.*.stack').isFloat({ min: 0 }).withMessage('Each betDetail stack must be a positive number'),
//   body('betDetails.*.time').isString().notEmpty().withMessage('Each betDetail time must be a non-empty string'),
//   body('catchBy').isString().notEmpty().withMessage('catchBy is required and must be a non-empty string'),
//   body('remark1').optional().isString().withMessage('remark1 must be a string if provided'),
//   body('remark2').optional().isString().withMessage('remark2 must be a string if provided'),
// ];

// // Create a new report
// export const createReport = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//   }

//   try {
//     const report = new Report(req.body);
//     const savedReport = await report.save();
//     res.status(201).json({ message: 'Report created successfully', data: savedReport });
//   } catch (error) {
//     res.status(400).json({ message: 'Error creating report', error: error.message });
//   }
// };

// // Get all reports
// export const getAllReports = async (req, res) => {
//   try {
//     const reports = await Report.find();
//     res.status(200).json({ message: 'Reports retrieved successfully', data: reports });
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving reports', error: error.message });
//   }
// };

// // Get a single report by ID
// export const getReportById = async (req, res) => {
//   try {
//     const report = await Report.findById(req.params.id);
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }
//     res.status(200).json({ message: 'Report retrieved successfully', data: report });
//   } catch (error) {
//     res.status(500).json({ message: 'Error retrieving report', error: error.message });
//   }
// };

// // Update a report
// export const updateReport = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
//   }

//   try {
//     const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }
//     res.status(200).json({ message: 'Report updated successfully', data: report });
//   } catch (error) {
//     res.status(400).json({ message: 'Error updating report', error: error.message });
//   }
// };

// // Delete a report
// export const deleteReport = async (req, res) => {
//   try {
//     const report = await Report.findByIdAndDelete(req.params.id);
//     if (!report) {
//       return res.status(404).json({ message: 'Report not found' });
//     }
//     res.status(200).json({ message: 'Report deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error deleting report', error: error.message });
//   }
// };

import { body, validationResult } from 'express-validator';
import Report from '../models/Report.js';

// Validation middleware for creating/updating reports
export const validateReport = [
  body('date').isISO8601().toDate().withMessage('Date must be a valid ISO 8601 date'),
  body('userName').isString().notEmpty().withMessage('userName is required'),
  body('agent').isString().notEmpty().withMessage('agent is required'),
  body('origin').isString().notEmpty().withMessage('origin is required'),
  body('sportName').isString().notEmpty().withMessage('sportName is required'),
  body('eventName').isString().notEmpty().withMessage('eventName is required'),
  body('marketName').isString().notEmpty().withMessage('marketName is required'),
  body('acBalance').isFloat().withMessage('acBalance must be a number'),
  body('afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
  body('pl').isFloat().withMessage('P&L must be a number'),
  body('betDetails').isArray({ min: 1 }).withMessage('betDetails must be a non-empty array'),
  body('betDetails.*.odds').exists().isFloat({ min: 0 }).withMessage('Each betDetail odds must be a positive number'),
  body('betDetails.*.stack').exists().isFloat({ min: 0 }).withMessage('Each betDetail stack must be a positive number'),
  body('betDetails.*.time').exists().isString().notEmpty().withMessage('Each betDetail time must be a non-empty string'),
  body('catchBy').isString().notEmpty().withMessage('catchBy is required and must be a non-empty string'),
  body('remark1').optional().isString().withMessage('remark1 must be a string if provided'),
  body('remark2').optional().isString().withMessage('remark2 must be a string if provided'),
];

// Create a new report
export const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const report = new Report(req.body);
    const savedReport = await report.save();
    res.status(201).json({ message: 'Report created successfully', data: savedReport });
  } catch (error) {
    res.status(400).json({ message: 'Error creating report', error: error.message });
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.status(200).json({ message: 'Reports retrieved successfully', data: reports });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reports', error: error.message });
  }
};

// Get a single report by ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report retrieved successfully', data: report });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving report', error: error.message });
  }
};

// Update a report
export const updateReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report updated successfully', data: report });
  } catch (error) {
    res.status(400).json({ message: 'Error updating report', error: error.message });
  }
};

// Delete a report
export const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};
import { body, validationResult } from 'express-validator';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import Report from '../models/Report.js';

// convert 12-hour time to 24-hour time
function convert12To24Hour(time12) {
  if (!time12) return '00:00:00';
  const regex = /^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)$/i;
  if (!regex.test(time12)) return '00:00:00';

  const [, hours, minutes, seconds, period] = time12.match(regex);
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const second = parseInt(seconds, 10);

  if (period.toUpperCase() === 'PM' && hour < 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}

// convert 24-hour time to 12-hour time
function convert24To12Hour(time24) {
  if (!time24 || !/^\d{2}:\d{2}:\d{2}$/.test(time24)) return '12:00:00 AM';
  const [hours, minutes, seconds] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
}

// Normalize date 
function normalizeDate(date) {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
  }
  return new Date(parsedDate.setUTCHours(0, 0, 0, 0)).toISOString();
}

export async function importReports(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.warn('Validation errors in importReports:', errors.array());
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const reportsData = req.body.slice(0, 70); // Limit 70 entries
    console.log(`Processing ${reportsData.length} reports for import`);
    const savedReports = [];
    const importErrors = [];
    const uniqueSheets = new Set(reportsData.map(report => report.sheetName)).size;

    for (const [index, reportData] of reportsData.entries()) {
      try {
        // Validate required fields
        const requiredFields = {
          userName: reportData.userName ? String(reportData.userName).trim() : '',
          agent: reportData.agent ? String(reportData.agent).trim() : '',
          sportName: reportData.sportName ? String(reportData.sportName).trim() : '',
          eventName: reportData.eventName ? String(reportData.eventName).trim() : '',
          marketName: reportData.marketName ? String(reportData.marketName).trim() : '',
          catchBy: reportData.catchBy ? String(reportData.catchBy).trim() : '',
          proofType: reportData.proofType ? String(reportData.proofType).trim() : '',
          proofStatus: reportData.proofStatus ? String(reportData.proofStatus).trim() : '',
        };
        const missingFields = Object.entries(requiredFields)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
        if (missingFields.length > 0) {
          importErrors.push({
            msg: `Missing required fields: ${missingFields.join(", ")}`,
            sheetName: reportData.sheetName,
            rowIndex: reportData.rowIndex,
          });
          continue;
        }

        // Validate allowed values
        const validSportNames = [
          'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
          'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
        ];
        const validMarketNames = ['Match Odds', 'Moneyline', 'Multi Market'];
        const validCatchBy = ['Niket', 'Dhruv', 'Jaydeep', 'Krunal', 'Sachin', 'Vivek', 'Rahul', 'Harsh B.'];
        const validProofTypes = [
          'Live Line Betting or Ground Line Betting',
          'Live Line Betting, Ground Line and Group Betting',
          'Odds Manipulating or Odds Hedging',
          'Odds Manipulating or Odds Hedging and Group Betting',
          'Offside Goal and Goal Cancel'
        ];
        const validProofStatus = ['Submitted', 'Not Submitted'];

        const invalidFields = [];
        if (!validSportNames.includes(requiredFields.sportName)) {
          invalidFields.push(`sportName (must be one of: ${validSportNames.join(", ")})`);
        }
        if (!validMarketNames.includes(requiredFields.marketName)) {
          invalidFields.push(`marketName (must be one of: ${validMarketNames.join(", ")})`);
        }
        if (!validCatchBy.includes(requiredFields.catchBy)) {
          invalidFields.push(`catchBy (must be one of: ${validCatchBy.join(", ")})`);
        }
        if (!validProofTypes.includes(requiredFields.proofType)) {
          invalidFields.push(`proofType (must be one of: ${validProofTypes.join(", ")})`);
        }
        if (!validProofStatus.includes(requiredFields.proofStatus)) {
          invalidFields.push(`proofStatus (must be one of: ${validProofStatus.join(", ")})`);
        }
        if (invalidFields.length > 0) {
          importErrors.push({
            msg: `Invalid field values: ${invalidFields.join(", ")}`,
            sheetName: reportData.sheetName,
            rowIndex: reportData.rowIndex,
          });
          continue;
        }

        // Validate betDetails
        if (!Array.isArray(reportData.betDetails) || reportData.betDetails.length === 0) {
          importErrors.push({
            msg: `betDetails must be a non-empty array`,
            sheetName: reportData.sheetName,
            rowIndex: reportData.rowIndex,
          });
          continue;
        }

        for (const [betIndex, detail] of reportData.betDetails.entries()) {
          if (!detail.odds || isNaN(Number(detail.odds)) || Number(detail.odds) === 0) {
            importErrors.push({
              msg: `Invalid or missing odds in betDetails[${betIndex}]`,
              sheetName: reportData.sheetName,
              rowIndex: reportData.rowIndex,
            });
            continue;
          }
          if (!detail.stack || isNaN(Number(detail.stack)) || Number(detail.stack) === 0) {
            importErrors.push({
              msg: `Invalid or missing stack in betDetails[${betIndex}]`,
              sheetName: reportData.sheetName,
              rowIndex: reportData.rowIndex,
            });
            continue;
          }
          if (!detail.time || !/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i.test(detail.time)) {
            importErrors.push({
              msg: `Invalid or missing time in betDetails[${betIndex}] (must be in 12-hour format, e.g., 12:00:00 AM)`,
              sheetName: reportData.sheetName,
              rowIndex: reportData.rowIndex,
            });
            continue;
          }
        }

        // Duplicate checking
        const normalizedDate = normalizeDate(reportData.date);
        const normalizedUserName = requiredFields.userName.toLowerCase();
        const normalizedAgent = requiredFields.agent.toLowerCase();
        const normalizedSportName = requiredFields.sportName.toLowerCase();
        const normalizedEventName = requiredFields.eventName.toLowerCase();
        const normalizedMarketName = requiredFields.marketName.toLowerCase();

        const existingReport = await Report.findOne({
          date: normalizedDate,
          userName: { $regex: `^${normalizedUserName}$`, $options: 'i' },
          agent: { $regex: `^${normalizedAgent}$`, $options: 'i' },
          sportName: { $regex: `^${normalizedSportName}$`, $options: 'i' },
          eventName: { $regex: `^${normalizedEventName}$`, $options: 'i' },
          marketName: { $regex: `^${normalizedMarketName}$`, $options: 'i' },
        });

        if (existingReport) {
          importErrors.push({
            msg: `Duplicate report found`,
            sheetName: reportData.sheetName,
            rowIndex: reportData.rowIndex,
          });
          continue;
        }

        const report = new Report({
          ...reportData,
          date: normalizedDate,
          userName: requiredFields.userName,
          agent: requiredFields.agent,
          origin: reportData.origin ? String(reportData.origin).trim() : '',
          sportName: requiredFields.sportName,
          eventName: requiredFields.eventName,
          marketName: requiredFields.marketName,
          acBalance: Number(reportData.acBalance) || 0,
          afterVoidBalance: Number(reportData.afterVoidBalance) || 0,
          pl: Number(reportData.pl) || 0,
          betDetails: reportData.betDetails.map((detail) => ({
            odds: Number(detail.odds) || 0,
            stack: Number(detail.stack) || 0,
            time: convert12To24Hour(detail.time || '12:00:00 AM'),
          })),
          catchBy: requiredFields.catchBy,
          proofType: requiredFields.proofType,
          proofStatus: requiredFields.proofStatus,
          remark: reportData.remark ? String(reportData.remark).trim() : '',
        });

        const savedReport = await report.save();
        savedReport.betDetails = savedReport.betDetails.map(detail => ({
          ...detail._doc,
          time: convert24To12Hour(detail.time),
        }));
        savedReports.push(savedReport);
      } catch (err) {
        importErrors.push({
          msg: `Failed to process report: ${err.message}`,
          sheetName: reportData.sheetName,
          rowIndex: reportData.rowIndex,
        });
      }
    }

    if (importErrors.length > 0 && savedReports.length === 0) {
      return res.status(400).json({
        message: `No reports imported due to errors or duplicates from ${uniqueSheets} sheets`,
        errors: importErrors,
        data: [],
      });
    }

    return res.status(201).json({
      message: savedReports.length > 0
        ? `${savedReports.length} Report(s) Imported Successfully from ${uniqueSheets} sheets`
        : `No new reports imported from ${uniqueSheets} sheets (all entries were duplicates or invalid)`,
      data: savedReports,
      errors: importErrors.length > 0 ? importErrors : undefined,
    });
  } catch (error) {
    console.error('Import reports error:', error);
    res.status(500).json({
      message: 'Error importing reports',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};


export const exportReportsToExcel = async (req, res) => {
  try {
    console.log('Starting exportReportsToExcel');

    const {
      startDate,
      endDate,
      userName,
      agent,
      origin,
      sportName,
      eventName,
      marketName,
      acBalanceMin,
      acBalanceMax,
      afterVoidBalanceMin,
      afterVoidBalanceMax,
      plMin,
      plMax,
      oddsMin,
      oddsMax,
      stackMin,
      stackMax,
      catchBy,
      proofType,
      proofStatus,
      remark,
      searchTerm,
      sortKey,
      sortDirection,
    } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (userName) query.userName = { $regex: userName, $options: 'i' };
    if (agent) query.agent = { $regex: agent, $options: 'i' };
    if (origin) query.origin = { $regex: origin, $options: 'i' };
    if (sportName) query.sportName = { $regex: sportName, $options: 'i' };
    if (eventName) query.eventName = { $regex: eventName, $options: 'i' };
    if (marketName) query.marketName = { $regex: marketName, $options: 'i' };
    if (catchBy) query.catchBy = { $regex: catchBy, $options: 'i' };
    if (remark) query.remark = { $regex: remark, $options: 'i' };

    if (acBalanceMin || acBalanceMax) {
      query.acBalance = {};
      if (acBalanceMin) query.acBalance.$gte = Number(acBalanceMin);
      if (acBalanceMax) query.acBalance.$lte = Number(acBalanceMax);
    }
    if (afterVoidBalanceMin || afterVoidBalanceMax) {
      query.afterVoidBalance = {};
      if (afterVoidBalanceMin) query.afterVoidBalance.$gte = Number(afterVoidBalanceMin);
      if (afterVoidBalanceMax) query.afterVoidBalance.$lte = Number(afterVoidBalanceMax);
    }
    if (plMin || plMax) {
      query.pl = {};
      if (plMin) query.pl.$gte = Number(plMin);
      if (plMax) query.pl.$lte = Number(plMax);
    }

    if (oddsMin || oddsMax) {
      query['betDetails.odds'] = {};
      if (oddsMin) query['betDetails.odds'].$gte = Number(oddsMin);
      if (oddsMax) query['betDetails.odds'].$lte = Number(oddsMax);
    }
    if (stackMin || stackMax) {
      query['betDetails.stack'] = {};
      if (stackMin) query['betDetails.stack'].$gte = Number(stackMin);
      if (stackMax) query['betDetails.stack'].$lte = Number(stackMax);
    }

    if (proofType) query.proofType = proofType;
    if (proofStatus) query.proofStatus = proofStatus;

    if (searchTerm) {
      query.$or = [
        { userName: { $regex: searchTerm, $options: 'i' } },
        { agent: { $regex: searchTerm, $options: 'i' } },
        { origin: { $regex: searchTerm, $options: 'i' } },
        { sportName: { $regex: searchTerm, $options: 'i' } },
        { eventName: { $regex: searchTerm, $options: 'i' } },
        { marketName: { $regex: searchTerm, $options: 'i' } },
        { catchBy: { $regex: searchTerm, $options: 'i' } },
        { proofType: { $regex: searchTerm, $options: 'i' } },
        { proofStatus: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const validSortKeys = [
      'date',
      'userName',
      'agent',
      'origin',
      'sportName',
      'eventName',
      'marketName',
      'acBalance',
      'afterVoidBalance',
      'pl',
      'catchBy',
      'proofType',
      'proofStatus',
      'remark',
    ];
    let sortOptions = {};
    if (sortKey && validSortKeys.includes(sortKey)) {
      const direction = sortDirection === 'desc' ? -1 : 1;
      sortOptions[sortKey] = direction;
    } else {
      sortOptions.date = -1;
    }

    const reports = await Report.find(query).sort(sortOptions).lean();
    console.log('Reports fetched:', reports.length);

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: 'No reports found matching the criteria' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');
    console.log('Workbook and worksheet created');

    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 1,
      },
    ];

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User Name', key: 'userName', width: 20 },
      { header: 'Agent', key: 'agent', width: 20 },
      { header: 'Origin', key: 'origin', width: 15 },
      { header: 'Sport Name', key: 'sportName', width: 20 },
      { header: 'Event Name', key: 'eventName', width: 20 },
      { header: 'Market Name', key: 'marketName', width: 20 },
      { header: 'Account Balance', key: 'acBalance', width: 15 },
      { header: 'After Void Balance', key: 'afterVoidBalance', width: 15 },
      { header: 'P&L', key: 'pl', width: 15 },
      { header: 'Odds', key: 'odds', width: 20 },
      { header: 'Stack', key: 'stack', width: 20 },
      { header: 'Time', key: 'time', width: 20 },
      { header: 'Catch By', key: 'catchBy', width: 20 },
      { header: 'Proof Type', key: 'proofType', width: 30 },
      { header: 'Proof Status', key: 'proofStatus', width: 20 },
      { header: 'Remark', key: 'remark', width: 20 },
    ];

    worksheet.getColumn('odds').alignment = { wrapText: true };
    worksheet.getColumn('stack').alignment = { wrapText: true };
    worksheet.getColumn('time').alignment = { wrapText: true };
    worksheet.getColumn('proofType').alignment = { wrapText: true };
    worksheet.getColumn('proofStatus').alignment = { wrapText: true };

    reports.forEach((report) => {
      try {
        const betDetails = Array.isArray(report.betDetails) ? report.betDetails : [];
        const odds = betDetails
          .map((detail) => (typeof detail.odds === 'number' ? Number(detail.odds).toFixed(2) : '0.00'))
          .join('\n');
        const stack = betDetails
          .map((detail) => (typeof detail.stack === 'number' ? Number(detail.stack).toFixed(2) : '0.00'))
          .join('\n');
        const time = betDetails
          .map((detail) => convert24To12Hour(detail.time || '00:00:00'))
          .join('\n');

        const normalizedDate = report.date
          ? new Date(new Date(report.date).setUTCHours(0, 0, 0, 0)).toLocaleDateString('en-GB')
          : '';

        const row = worksheet.addRow({
          date: normalizedDate,
          userName: report.userName || '',
          agent: report.agent || '',
          origin: report.origin || '',
          sportName: report.sportName || '',
          eventName: report.eventName || '',
          marketName: report.marketName || '',
          acBalance: typeof report.acBalance === 'number' ? Number(report.acBalance).toFixed(2) : '0.00',
          afterVoidBalance: typeof report.afterVoidBalance === 'number' ? Number(report.afterVoidBalance).toFixed(2) : '0.00',
          pl: typeof report.pl === 'number' ? Number(report.pl).toFixed(2) : '0.00',
          odds: odds || '0.00',
          stack: stack || '0.00',
          time: time || '12:00:00 AM',
          catchBy: report.catchBy || '',
          proofType: report.proofType || 'Live Line Betting or Ground Line Betting',
          proofStatus: report.proofStatus || 'Not Submitted',
          remark: report.remark || '',
        });

        if (betDetails.length > 1) {
          row.height = betDetails.length * 15;
        }
      } catch (err) {
        console.error(`Error adding row for report ${report._id}:`, err);
      }
    });
    console.log('Rows added to worksheet');

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    console.log('Header styled');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');

    await workbook.xlsx.write(res);
    console.log('Excel file written to response');
    res.end();
  } catch (error) {
    console.error('Error in exportReportsToExcel:', error);
    res.status(500).json({ message: 'Server error while exporting reports', error: error.message });
  }
};

export const validateReport = [
  body('date').isISO8601().toDate().withMessage('Date must be a valid ISO 8601 date'),
  body('userName').isString().notEmpty().withMessage('userName is required'),
  body('agent').isString().notEmpty().withMessage('Agent is required'),
  body('origin').optional().isString().withMessage('origin must be a string if provided'),
  body('sportName')
    .isString()
    .notEmpty()
    .isIn([
      'Cricket',
      'Kabaddi',
      'Socceraa',
      'Tennis',
      'Casino',
      'Original',
      'All Caino',
      'Int Casino',
      'Basketball',
      'Multi Sports'
    ])
    .withMessage('sportName must be one of: Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('eventName').isString().notEmpty().withMessage('eventName is required'),
  body('marketName')
    .isString()
    .notEmpty()
    .isIn(['Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('marketName must be one of: Match Odds, Moneyline, Multi Market'),
  body('acBalance').isFloat().withMessage('acBalance must be a number'),
  body('afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
  body('pl').isFloat().withMessage('P&L must be a number (positive or negative)'),
  body('betDetails').isArray({ min: 1 }).withMessage('betDetails must be a non-empty array'),
  body('betDetails.*.odds').isFloat().withMessage('Each betDetail odds must be a number'),
  body('betDetails.*.stack').isFloat().withMessage('Each betDetail stack must be a number'),
  body('betDetails.*.time')
    .isString()
    .notEmpty()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each betDetail time must be in 12-hour format (e.g., 12:00:00 AM)'),
  body('catchBy')
    .isString()
    .notEmpty()
    .isIn(['Niket', 'Dhruv', 'Jaydeep', 'Krunal', 'Sachin', 'Vivek', 'Rahul', 'Harsh B.'])
    .withMessage('catchBy must be one of: Niket, Dhruv, Jaydeep, Krunal, Sachin, Vivek, Rahul, Harsh B.'),
  body('proofType')
    .isString()
    .notEmpty()
    .isIn([
      'Live Line Betting or Ground Line Betting',
      'Live Line Betting, Ground Line and Group Betting',
      'Odds Manipulating or Odds Hedging',
      'Odds Manipulating or Odds Hedging and Group Betting',
      'Offside Goal and Goal Cancel'
    ])
    .withMessage('proofType must be one of: Live Line Betting or Ground Line Betting, Live Line Betting, Ground Line and Group Betting, Odds Manipulating or Odds Hedging, Odds Manipulating or Odds Hedging and Group Betting, Offside Goal and Goal Cancel'),
  body('proofStatus')
    .optional()
    .isString()
    .isIn(['Submitted', 'Not Submitted'])
    .withMessage('proofStatus must be either Submitted or Not Submitted'),
  body('remark').optional().isString().withMessage('remark must be a string if provided'),
];

export const validateImportReports = [
  body().isArray().withMessage('Request body must be an array of reports'),
  body('*.date').isISO8601().toDate().withMessage('Date must be a valid ISO 8601 date'),
  body('*.userName').isString().notEmpty().withMessage('userName is required'),
  body('*.agent').isString().notEmpty().withMessage('Agent is required'),
  body('*.origin').optional().isString().withMessage('origin must be a string if provided'),
  body('*.sportName')
    .isString()
    .notEmpty()
    .isIn([
      'Cricket',
      'Kabaddi',
      'Socceraa',
      'Tennis',
      'Casino',
      'Original',
      'All Caino',
      'Int Casino',
      'Basketball',
      'Multi Sports'
    ])
    .withMessage('sportName must be one of: Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('*.eventName').isString().notEmpty().withMessage('eventName is required'),
  body('*.marketName')
    .isString()
    .notEmpty()
    .isIn(['Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('marketName must be one of: Match Odds, Moneyline, Multi Market'),
  body('*.acBalance').isFloat().withMessage('acBalance must be a number'),
  body('*.afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
  body('*.pl').isFloat().withMessage('P&L must be a number (positive or negative)'),
  body('*.betDetails').isArray().withMessage('betDetails must be a non-empty array'),
  body('*.betDetails.*.odds').isFloat().withMessage('Each betDetail odds must be a number'),
  body('*.betDetails.*.stack').isFloat().withMessage('Each betDetail stack must be a number'),
  body('*.betDetails.*.time')
    .isString()
    .notEmpty()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each betDetail time must be in 12-hour format (e.g., 12:00:00 AM)'),
  body('*.catchBy')
    .isString()
    .notEmpty()
    .isIn(['Niket', 'Dhruv', 'Jaydeep', 'Krunal', 'Sachin', 'Vivek', 'Rahul', 'Harsh B.'])
    .withMessage('catchBy must be one of: Niket, Dhruv, Jaydeep, Krunal, Sachin, Vivek, Rahul, Harsh B.'),
  body('*.proofType')
    .isString()
    .notEmpty()
    .isIn([
      'Live Line Betting or Ground Line Betting',
      'Live Line Betting, Ground Line and Group Betting',
      'Odds Manipulating or Odds Hedging',
      'Odds Manipulating or Odds Hedging and Group Betting',
      'Offside Goal and Goal Cancel'
    ])
    .withMessage('proofType must be one of: Live Line Betting or Ground Line Betting, Live Line Betting, Ground Line and Group Betting, Odds Manipulating or Odds Hedging, Odds Manipulating or Odds Hedging and Group Betting, Offside Goal and Goal Cancel'),
  body('*.proofStatus')
    .optional()
    .isString()
    .isIn(['Submitted', 'Not Submitted'])
    .withMessage('proofStatus must be either Submitted or Not Submitted'),
  body('*.remark').optional().isString().withMessage('remark must be a string if provided'),
];

export const createReport = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const reportData = {
      ...req.body,
      betDetails: req.body.betDetails.map(detail => ({
        ...detail,
        time: convert12To24Hour(detail.time), // Convert to 24-hour for storage
      })),
    };
    const report = new Report(reportData);
    const savedReport = await report.save();
    res.status(201).json({ message: 'Report created successfully', data: savedReport });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(400).json({ message: 'Error creating report', error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().lean();
    // Convert time to 12-hour format for response
    const modifiedReports = reports.map(report => ({
      ...report,
      betDetails: report.betDetails.map(detail => ({
        ...detail,
        time: convert24To12Hour(detail.time),
      })),
    }));
    res.status(200).json({ message: 'Reports retrieved successfully', data: modifiedReports });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ message: 'Error retrieving reports', error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    const report = await Report.findById(id).lean();
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    // Convert time to 12-hour format
    const modifiedReport = {
      ...report,
      betDetails: report.betDetails.map(detail => ({
        ...detail,
        time: convert24To12Hour(detail.time),
      })),
    };
    res.status(200).json({ message: 'Report retrieved successfully', data: modifiedReport });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ message: 'Error retrieving report', error: error.message });
  }
};

export async function updateReport(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    const reportData = {
      ...req.body,
      betDetails: req.body.betDetails.map(detail => ({
        ...detail,
        time: convert12To24Hour(detail.time), // Convert to 24-hour for storage
      })),
    };
    const report = await Report.findByIdAndUpdate(id, reportData, {
      new: true,
      runValidators: true,
    }).lean();
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    // Convert time to 12-hour format for response
    const modifiedReport = {
      ...report,
      betDetails: report.betDetails.map(detail => ({
        ...detail,
        time: convert24To12Hour(detail.time),
      })),
    };
    res.status(200).json({ message: 'Report updated successfully', data: modifiedReport });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(400).json({ message: 'Error updating report', error: error.message });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Error deleting report', error: error.message });
  }
};
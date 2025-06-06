import { body, validationResult } from 'express-validator';
import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import Report from '../models/Report.js';

// Convert 12-hour time to 24-hour time
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

// Convert 24-hour time to 12-hour time
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
    const reportsData = req.body.slice(0, 70); // Limit to 70 entries
    console.log(`Processing ${reportsData.length} reports for import`);
    const savedReports = [];
    const importErrors = [];

    // Define valid options
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
    const validMultiSports = ['', ...validSportNames];
    const validMultiMarkets = ['', ...validMarketNames];

    for (const [index, reportData] of reportsData.entries()) {
      const rowErrors = [];
      let isValid = true;

      // Normalize and validate fields
      const report = {
        date: normalizeDate(reportData.date || ''),
        userName: reportData.userName ? String(reportData.userName).trim() : '',
        agent: reportData.agent ? String(reportData.agent).trim() : '',
        origin: reportData.origin ? String(reportData.origin).trim() : '',
        sportNames: Array.isArray(reportData.sportNames) && reportData.sportNames.length > 0 ? reportData.sportNames.map(s => String(s).trim()) : [''],
        eventNames: Array.isArray(reportData.eventNames) && reportData.eventNames.length > 0 ? reportData.eventNames.map(e => String(e).trim()) : [''],
        marketNames: Array.isArray(reportData.marketNames) && reportData.marketNames.length > 0 ? reportData.marketNames.map(m => String(m).trim()) : [''],
        betDetails: Array.isArray(reportData.betDetails) && reportData.betDetails.length > 0 ? reportData.betDetails : [{ odds: 0, stack: 0, time: '12:00:00 AM' }],
        multiSport: reportData.multiSport ? String(reportData.multiSport).trim() : '',
        multiEvent: reportData.multiEvent ? String(reportData.multiEvent).trim() : '',
        multiMarket: reportData.multiMarket ? String(reportData.multiMarket).trim() : '',
        multiBetDetails: Array.isArray(reportData.multiBetDetails) ? reportData.multiBetDetails : [],
        acBalance: Number(reportData.acBalance) || 0,
        afterVoidBalance: Number(reportData.afterVoidBalance) || 0,
        pl: Number(reportData.pl) || 0,
        catchBy: reportData.catchBy ? String(reportData.catchBy).trim() : '',
        proofType: reportData.proofType ? String(reportData.proofType).trim() : 'Live Line Betting or Ground Line Betting',
        proofStatus: reportData.proofStatus ? String(reportData.proofStatus).trim() : 'Not Submitted',
        remark: reportData.remark ? String(reportData.remark).trim() : '',
        multipleEnabled: reportData.multiple?.enabled ?? !!(reportData.multiSport || reportData.multiEvent || reportData.multiMarket),
      };

      // Validate required fields
      if (!report.userName) {
        rowErrors.push('userName is required');
        isValid = false;
      }
      if (!report.agent) {
        rowErrors.push('agent is required');
        isValid = false;
      }
      if (!report.sportNames[0] || !validSportNames.includes(report.sportNames[0])) {
        rowErrors.push(`sportNames[0] must be one of: ${validSportNames.join(', ')}`);
        isValid = false;
      }
      if (!report.eventNames[0]) {
        rowErrors.push('eventNames[0] is required');
        isValid = false;
      }
      if (!report.marketNames[0] || !validMarketNames.includes(report.marketNames[0])) {
        rowErrors.push(`marketNames[0] must be one of: ${validMarketNames.join(', ')}`);
        isValid = false;
      }
      if (!report.catchBy || !validCatchBy.includes(report.catchBy)) {
        rowErrors.push(`catchBy must be one of: ${validCatchBy.join(', ')}`);
        isValid = false;
      }
      if (!validProofTypes.includes(report.proofType)) {
        rowErrors.push(`proofType must be one of: ${validProofTypes.join(', ')}`);
        isValid = false;
      }
      if (!validProofStatus.includes(report.proofStatus)) {
        rowErrors.push(`proofStatus must be one of: ${validProofStatus.join(', ')}`);
        isValid = false;
      }

      // Validate betDetails
      if (!Array.isArray(report.betDetails) || report.betDetails.length === 0) {
        rowErrors.push('betDetails must be a non-empty array');
        isValid = false;
      } else {
        report.betDetails.forEach((detail, betIndex) => {
          if (!detail.odds || isNaN(Number(detail.odds)) || Number(detail.odds) <= 0) {
            rowErrors.push(`betDetails[${betIndex}].odds must be a positive number`);
            isValid = false;
          }
          if (!detail.stack || isNaN(Number(detail.stack)) || Number(detail.stack) <= 0) {
            rowErrors.push(`betDetails[${betIndex}].stack must be a positive number`);
            isValid = false;
          }
          if (!detail.time || !/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i.test(detail.time)) {
            rowErrors.push(`betDetails[${betIndex}].time must be in 12-hour format (e.g., 12:00:00 AM)`);
            isValid = false;
          }
        });
      }

      // Validate multiBetDetails if multiple section is enabled
      if (report.multipleEnabled) {
        if (report.multiSport && !validMultiSports.includes(report.multiSport)) {
          rowErrors.push(`multiSport must be one of: ${validMultiSports.join(', ')}`);
          isValid = false;
        }
        if (report.multiMarket && !validMultiMarkets.includes(report.multiMarket)) {
          rowErrors.push(`multiMarket must be one of: ${validMultiMarkets.join(', ')}`);
          isValid = false;
        }
        if (Array.isArray(report.multiBetDetails) && report.multiBetDetails.length > 0) {
          report.multiBetDetails.forEach((detail, betIndex) => {
            if (!detail.odds || isNaN(Number(detail.odds)) || Number(detail.odds) <= 0) {
              rowErrors.push(`multiBetDetails[${betIndex}].odds must be a positive number`);
              isValid = false;
            }
            if (!detail.stack || isNaN(Number(detail.stack)) || Number(detail.stack) <= 0) {
              rowErrors.push(`multiBetDetails[${betIndex}].stack must be a positive number`);
              isValid = false;
            }
            if (!detail.time || !/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i.test(detail.time)) {
              rowErrors.push(`multiBetDetails[${betIndex}].time must be in 12-hour format (e.g., 12:00:00 AM)`);
              isValid = false;
            }
          });
        }
      }

      // Check for duplicates
      const existingReport = await Report.findOne({
        date: report.date,
        userName: { $regex: `^${report.userName}$`, $options: 'i' },
        agent: { $regex: `^${report.agent}$`, $options: 'i' },
        'original.sportNames': { $all: report.sportNames },
        'original.eventNames': { $all: report.eventNames },
        'original.marketNames': { $all: report.marketNames },
      });

      if (existingReport) {
        rowErrors.push(`Duplicate report found`);
        isValid = false;
      }

      if (!isValid) {
        importErrors.push({
          msg: `Invalid report at sheet: ${reportData.sheetName || 'Unknown'}, row: ${reportData.rowIndex || (index + 2)} - ${rowErrors.join('; ')}`,
          sheetName: reportData.sheetName || 'Unknown',
          rowIndex: reportData.rowIndex || (index + 2),
          details: rowErrors
        });
        continue;
      }

      // Prepare report for saving
      const reportToSave = new Report({
        date: report.date,
        userName: report.userName,
        agent: report.agent,
        origin: report.origin,
        original: {
          sportNames: report.sportNames,
          eventNames: report.eventNames,
          marketNames: report.marketNames,
          betDetails: report.betDetails.map((detail) => ({
            odds: Number(detail.odds),
            stack: Number(detail.stack),
            time: convert12To24Hour(detail.time),
          })),
        },
        multiple: {
          enabled: report.multipleEnabled,
          sportName: report.multiSport,
          eventName: report.multiEvent,
          marketName: report.multiMarket,
          betDetails: report.multiBetDetails.map((detail) => ({
            odds: Number(detail.odds),
            stack: Number(detail.stack),
            time: convert12To24Hour(detail.time),
          })),
        },
        acBalance: report.acBalance,
        afterVoidBalance: report.afterVoidBalance,
        pl: report.pl,
        catchBy: report.catchBy,
        proofType: report.proofType,
        proofStatus: report.proofStatus,
        remark: report.remark,
      });

      try {
        const savedReport = await reportToSave.save();
        savedReport.original.betDetails = savedReport.original.betDetails.map(detail => ({
          ...detail._doc,
          time: convert24To12Hour(detail.time),
        }));
        if (savedReport.multiple.enabled) {
          savedReport.multiple.betDetails = savedReport.multiple.betDetails.map(detail => ({
            ...detail._doc,
            time: convert24To12Hour(detail.time),
          }));
        }
        savedReports.push(savedReport);
      } catch (err) {
        importErrors.push({
          msg: `Failed to save report at sheet: ${reportData.sheetName || 'Unknown'}, row: ${reportData.rowIndex || (index + 2)} - ${err.message}`,
          sheetName: reportData.sheetName || 'Unknown',
          rowIndex: reportData.rowIndex || (index + 2),
          details: [err.message]
        });
      }
    }

    const uniqueSheets = new Set(reportsData.map(report => report.sheetName)).size;
    return res.status(201).json({
      message: savedReports.length > 0
        ? `${savedReports.length} report(s) imported successfully from ${uniqueSheets} sheet(s)`
        : `No reports imported from ${uniqueSheets} sheet(s)`,
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
}

export const exportReportsToExcel = async (req, res) => {
  try {
    console.log('Starting exportReportsToExcel');

    const {
      startDate, endDate, userName, agent, origin, sportName, eventName, marketName,
      multiSport, multiEvent, multiMarket, acBalanceMin, acBalanceMax,
      afterVoidBalanceMin, afterVoidBalanceMax, plMin, plMax, oddsMin, oddsMax,
      stackMin, stackMax, catchBy, proofType, proofStatus, remark, searchTerm,
      sortKey, sortDirection,
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
    if (sportName) query['original.sportNames'] = { $in: [new RegExp(sportName, 'i')] };
    if (eventName) query['original.eventNames'] = { $in: [new RegExp(eventName, 'i')] };
    if (marketName) query['original.marketNames'] = { $in: [new RegExp(marketName, 'i')] };
    if (multiSport) query['multiple.sportName'] = { $regex: multiSport, $options: 'i' };
    if (multiEvent) query['multiple.eventName'] = { $regex: multiEvent, $options: 'i' };
    if (multiMarket) query['multiple.marketName'] = { $regex: multiMarket, $options: 'i' };
    if (catchBy) query.catchBy = { $regex: catchBy, $options: 'i' };
    if (proofType) query.proofType = proofType;
    if (proofStatus) query.proofStatus = proofStatus;
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
      query['original.betDetails.odds'] = { $gte: Number(oddsMin) || 0, $lte: Number(oddsMax) || Infinity };
    }
    if (stackMin || stackMax) {
      query['original.betDetails.stack'] = { $gte: Number(stackMin) || 0, $lte: Number(stackMax) || Infinity };
    }

    if (searchTerm) {
      query.$or = [
        { userName: { $regex: searchTerm, $options: 'i' } },
        { agent: { $regex: searchTerm, $options: 'i' } },
        { origin: { $regex: searchTerm, $options: 'i' } },
        { 'original.sportNames': { $in: [new RegExp(searchTerm, 'i')] } },
        { 'original.eventNames': { $in: [new RegExp(searchTerm, 'i')] } },
        { 'original.marketNames': { $in: [new RegExp(searchTerm, 'i')] } },
        { 'multiple.sportName': { $regex: searchTerm, $options: 'i' } },
        { 'multiple.eventName': { $regex: searchTerm, $options: 'i' } },
        { 'multiple.marketName': { $regex: searchTerm, $options: 'i' } },
        { catchBy: { $regex: searchTerm, $options: 'i' } },
        { proofType: { $regex: searchTerm, $options: 'i' } },
        { proofStatus: { $regex: searchTerm, $options: 'i' } },
        { remark: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const validSortKeys = [
      'date', 'userName', 'agent', 'origin', 'acBalance', 'afterVoidBalance', 'pl',
      'catchBy', 'proofType', 'proofStatus', 'remark'
    ];
    let sortOptions = {};
    if (sortKey && validSortKeys.includes(sortKey)) {
      const direction = sortDirection === 'desc' ? -1 : 1;
      sortOptions[sortKey] = direction;
    } else {
      sortOptions.date = -1;
    }

    const reports = await Report.find(query).sort(sortOptions).lean();
    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: 'No reports found matching the criteria' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');

    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 },
    ];

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'User Name', key: 'userName', width: 15 },
      { header: 'Agent', key: 'agent', width: 15 },
      { header: 'Origin', key: 'origin', width: 15 },
      { header: 'Sport Names', key: 'sportNames', width: 20 },
      { header: 'Event Names', key: 'eventNames', width: 30 },
      { header: 'Market Names', key: 'marketNames', width: 20 },
      { header: 'Odds', key: 'odds', width: 10 },
      { header: 'Stack', key: 'stack', width: 15 },
      { header: 'Time', key: 'time', width: 15 },
      { header: 'Account Balance', key: 'acBalance', width: 15 },
      { header: 'After Void Balance', key: 'afterVoidBalance', width: 15 },
      { header: 'P&L', key: 'pl', width: 15 },
      { header: 'Catch By', key: 'catchBy', width: 15 },
      { header: 'Proof Type', key: 'proofType', width: 30 },
      { header: 'Proof Status', key: 'proofStatus', width: 15 },
      { header: 'Remark', key: 'remark', width: 20 },
    ];

    reports.forEach((report) => {
  // Prepare arrays for sport names, event names, market names, and bet details
  const sportNames = Array.isArray(report.original?.sportNames) ? [...report.original.sportNames] : [];
  const eventNames = Array.isArray(report.original?.eventNames) ? [...report.original.eventNames] : [];
  const marketNames = Array.isArray(report.original?.marketNames) ? [...report.original.marketNames] : [];
  const betDetails = Array.isArray(report.original?.betDetails) ? [...report.original.betDetails] : [];

  if (report.multiple?.enabled) {
    if (report.multiple.sportName) sportNames.push(report.multiple.sportName);
    if (report.multiple.eventName) eventNames.push(report.multiple.eventName);
    if (report.multiple.marketName) marketNames.push(report.multiple.marketName);
    if (Array.isArray(report.multiple?.betDetails)) {
      betDetails.push(...report.multiple.betDetails);
    }
  }

  // Create a row for each bet detail
  betDetails.forEach((detail, index) => {
    const row = worksheet.addRow({
      date: report.date ? new Date(report.date).toISOString().split('T')[0] : '',
      userName: index === 0 ? report.userName || '' : '', // Show userName only in the first row
      agent: index === 0 ? report.agent || '' : '',
      origin: index === 0 ? report.origin || '' : '',
      sportNames: sportNames[index] || sportNames[0] || '',
      eventNames: eventNames[index] || eventNames[0] || '',
      marketNames: marketNames[index] || marketNames[0] || '',
      odds: Number(detail.odds || 0).toFixed(2),
      stack: Number(detail.stack || 0).toFixed(2),
      time: detail.time || '12:00:00 AM',
      acBalance: typeof report.acBalance === 'number' ? Number(report.acBalance).toFixed(2) : '0.00',
      afterVoidBalance: typeof report.afterVoidBalance === 'number' ? Number(report.afterVoidBalance).toFixed(2) : '0.00',
      pl: typeof report.pl === 'number' ? Number(report.pl).toFixed(2) : '0.00',
      catchBy: report.catchBy || '',
      proofType: report.proofType || '',
      proofStatus: report.proofStatus || '',
      remark: report.remark || '',
    });
  });
});

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reports.xlsx');

    await workbook.xlsx.write(res);
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
  body('sportNames')
    .isArray({ min: 1 })
    .withMessage('sportNames must be a non-empty array'),
  body('sportNames.*')
    .isString()
    .notEmpty()
    .isIn([
      'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
      'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
    ])
    .withMessage('Each sportName must be one of: Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('eventNames')
    .isArray({ min: 1 })
    .withMessage('eventNames must be a non-empty array'),
  body('eventNames.*')
    .isString()
    .notEmpty()
    .withMessage('Each eventName is required'),
  body('marketNames')
    .isArray({ min: 1 })
    .withMessage('marketNames must be a non-empty array'),
  body('marketNames.*')
    .isString()
    .notEmpty()
    .isIn(['Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('Each marketName must be one of: Match Odds, Moneyline, Multi Market'),
  body('betDetails').isArray({ min: 1 }).withMessage('betDetails must be a non-empty array'),
  body('betDetails.*.odds').isFloat({ gt: 0 }).withMessage('Each betDetail odds must be a positive number'),
  body('betDetails.*.stack').isFloat({ gt: 0 }).withMessage('Each betDetail stack must be a positive number'),
  body('betDetails.*.time')
    .isString()
    .notEmpty()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each betDetail time must be in 12-hour format (e.g., 12:00:00 AM)'),
  body('multiSport')
    .optional()
    .isString()
    .isIn([
      '', 'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
      'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
    ])
    .withMessage('multiSport must be one of: <empty>, Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('multiEvent')
    .optional()
    .isString()
    .withMessage('multiEvent must be a string if provided'),
  body('multiMarket')
    .optional()
    .isString()
    .isIn(['', 'Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('multiMarket must be one of: <empty>, Match Odds, Moneyline, Multi Market'),
  body('multiBetDetails')
    .optional()
    .isArray()
    .withMessage('multiBetDetails must be an array if provided'),
  body('multiBetDetails.*.odds')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Each multiBetDetail odds must be a positive number if provided'),
  body('multiBetDetails.*.stack')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Each multiBetDetail stack must be a positive number if provided'),
  body('multiBetDetails.*.time')
    .optional()
    .isString()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each multiBetDetail time must be in 12-hour format (e.g., 12:00:00 AM) if provided'),
  body('acBalance').isFloat().withMessage('acBalance must be a number'),
  body('afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
  body('pl').isFloat().withMessage('P&L must be a number (positive or negative)'),
  body('multiple.enabled')
    .optional()
    .isBoolean()
    .withMessage('multiple.enabled must be a boolean'),
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
  body('*.sportNames')
    .isArray({ min: 1 })
    .withMessage('sportNames must be a non-empty array'),
  body('*.sportNames.*')
    .isString()
    .notEmpty()
    .isIn([
      'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
      'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
    ])
    .withMessage('Each sportName must be one of: Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('*.eventNames')
    .isArray({ min: 1 })
    .withMessage('eventNames must be a non-empty array'),
  body('*.eventNames.*')
    .isString()
    .notEmpty()
    .withMessage('Each eventName is required'),
  body('*.marketNames')
    .isArray({ min: 1 })
    .withMessage('marketNames must be a non-empty array'),
  body('*.marketNames.*')
    .isString()
    .notEmpty()
    .isIn(['Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('Each marketName must be one of: Match Odds, Moneyline, Multi Market'),
  body('*.betDetails').isArray({ min: 1 }).withMessage('betDetails must be a non-empty array'),
  body('*.betDetails.*.odds').isFloat({ gt: 0 }).withMessage('Each betDetail odds must be a positive number'),
  body('*.betDetails.*.stack').isFloat({ gt: 0 }).withMessage('Each betDetail stack must be a positive number'),
  body('*.betDetails.*.time')
    .isString()
    .notEmpty()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each betDetail time must be in 12-hour format (e.g., 12:00:00 AM)'),
  body('*.multiSport')
    .optional()
    .isString()
    .isIn([
      '', 'Cricket', 'Kabaddi', 'Socceraa', 'Tennis', 'Casino', 'Original',
      'All Caino', 'Int Casino', 'Basketball', 'Multi Sports'
    ])
    .withMessage('multiSport must be one of: <empty>, Cricket, Kabaddi, Socceraa, Tennis, Casino, Original, All Caino, Int Casino, Basketball, Multi Sports'),
  body('*.multiEvent')
    .optional()
    .isString()
    .withMessage('multiEvent must be a string if provided'),
  body('*.multiMarket')
    .optional()
    .isString()
    .isIn(['', 'Match Odds', 'Moneyline', 'Multi Market'])
    .withMessage('multiMarket must be one of: <empty>, Match Odds, Moneyline, Multi Market'),
  body('*.multiBetDetails')
    .optional()
    .isArray()
    .withMessage('multiBetDetails must be an array if provided'),
  body('*.multiBetDetails.*.odds')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Each multiBetDetail odds must be a positive number if provided'),
  body('*.multiBetDetails.*.stack')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Each multiBetDetail stack must be a positive number if provided'),
  body('*.multiBetDetails.*.time')
    .optional()
    .isString()
    .matches(/^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i)
    .withMessage('Each multiBetDetail time must be in 12-hour format (e.g., 12:00:00 AM) if provided'),
  body('*.acBalance').isFloat().withMessage('acBalance must be a number'),
  body('*.afterVoidBalance').isFloat().withMessage('afterVoidBalance must be a number'),
  body('*.pl').isFloat().withMessage('P&L must be a number (positive or negative)'),
  body('*.multiple.enabled')
    .optional()
    .isBoolean()
    .withMessage('multiple.enabled must be a boolean'),
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
      date: req.body.date,
      userName: req.body.userName,
      agent: req.body.agent,
      origin: req.body.origin || '',
      original: {
        sportNames: req.body.sportNames,
        eventNames: req.body.eventNames,
        marketNames: req.body.marketNames,
        betDetails: req.body.betDetails.map(detail => ({
          odds: Number(detail.odds),
          stack: Number(detail.stack),
          time: convert12To24Hour(detail.time),
        })),
      },
      multiple: {
        enabled: req.body.multiple?.enabled ?? false, // Use provided enabled value or default to false
        sportName: req.body.multiSport || '',
        eventName: req.body.multiEvent || '',
        marketName: req.body.multiMarket || '',
        betDetails: req.body.multiBetDetails ? req.body.multiBetDetails.map(detail => ({
          odds: Number(detail.odds),
          stack: Number(detail.stack),
          time: convert12To24Hour(detail.time),
        })) : [],
      },
      acBalance: Number(req.body.acBalance) || 0,
      afterVoidBalance: Number(req.body.afterVoidBalance) || 0,
      pl: Number(req.body.pl) || 0,
      catchBy: req.body.catchBy,
      proofType: req.body.proofType,
      proofStatus: req.body.proofStatus || 'Not Submitted',
      remark: req.body.remark || '',
    };
    const report = new Report(reportData);
    const savedReport = await report.save();
    savedReport.original.betDetails = savedReport.original.betDetails.map(detail => ({
      ...detail._doc,
      time: convert24To12Hour(detail.time),
    }));
    if (savedReport.multiple.enabled) {
      savedReport.multiple.betDetails = savedReport.multiple.betDetails.map(detail => ({
        ...detail._doc,
        time: convert24To12Hour(detail.time),
      }));
    }
    res.status(201).json({ message: 'Report created successfully', data: savedReport });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(400).json({ message: 'Error creating report', error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().lean();
    const modifiedReports = reports.map(report => ({
      ...report,
      sportNames: report.original.sportNames,
      eventNames: report.original.eventNames,
      marketNames: report.original.marketNames,
      betDetails: Array.isArray(report.original?.betDetails)
        ? report.original.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
      multiSport: report.multiple.sportName,
      multiEvent: report.multiple.eventName,
      multiMarket: report.multiple.marketName,
      multiBetDetails: report.multiple.enabled && Array.isArray(report.multiple?.betDetails)
        ? report.multiple.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
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
    const modifiedReport = {
      ...report,
      sportNames: report.original.sportNames,
      eventNames: report.original.eventNames,
      marketNames: report.original.marketNames,
      betDetails: Array.isArray(report.original?.betDetails)
        ? report.original.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
      multiSport: report.multiple.sportName,
      multiEvent: report.multiple.eventName,
      multiMarket: report.multiple.marketName,
      multiBetDetails: report.multiple.enabled && Array.isArray(report.multiple?.betDetails)
        ? report.multiple.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
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
      date: req.body.date,
      userName: req.body.userName,
      agent: req.body.agent,
      origin: req.body.origin || '',
      original: {
        sportNames: req.body.sportNames,
        eventNames: req.body.eventNames,
        marketNames: req.body.marketNames,
        betDetails: req.body.betDetails.map(detail => ({
          odds: Number(detail.odds),
          stack: Number(detail.stack),
          time: convert12To24Hour(detail.time),
        })),
      },
      multiple: {
        enabled: req.body.multiple?.enabled ?? false, // Use provided enabled value or default to false
        sportName: req.body.multiSport || '',
        eventName: req.body.multiEvent || '',
        marketName: req.body.multiMarket || '',
        betDetails: req.body.multiBetDetails ? req.body.multiBetDetails.map(detail => ({
          odds: Number(detail.odds),
          stack: Number(detail.stack),
          time: convert12To24Hour(detail.time),
        })) : [],
      },
      acBalance: Number(req.body.acBalance) || 0,
      afterVoidBalance: Number(req.body.afterVoidBalance) || 0,
      pl: Number(req.body.pl) || 0,
      catchBy: req.body.catchBy,
      proofType: req.body.proofType,
      proofStatus: req.body.proofStatus || 'Not Submitted',
      remark: req.body.remark || '',
    };
    const report = await Report.findByIdAndUpdate(id, reportData, {
      new: true,
      runValidators: true,
    }).lean();
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    const modifiedReport = {
      ...report,
      sportNames: report.original.sportNames,
      eventNames: report.original.eventNames,
      marketNames: report.original.marketNames,
      betDetails: Array.isArray(report.original?.betDetails)
        ? report.original.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
      multiSport: report.multiple.sportName,
      multiEvent: report.multiple.eventName,
      multiMarket: report.multiple.marketName,
      multiBetDetails: report.multiple.enabled && Array.isArray(report.multiple?.betDetails)
        ? report.multiple.betDetails.map(detail => ({
            ...detail,
            time: convert24To12Hour(detail.time || '00:00:00'),
          }))
        : [],
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
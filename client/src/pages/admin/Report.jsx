import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaFilter,
} from "react-icons/fa";
import {
  fetchReports,
  createReport,
  updateReport,
  deleteReport,
  importReports,
  exportReports,
  clearError,
} from "../../redux/reportSlice";
import * as XLSX from "xlsx";


// Validate 12-hour time format
function validate12HourTime(time) {
  const regex = /^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i;
  return regex.test(time);
}

// Normalize date
function normalizeDate(dateStr) {
  let parsedDate;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split("/");
    parsedDate = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00.000Z`
    );
  } else {
    parsedDate = new Date(dateStr);
  }
  if (isNaN(parsedDate.getTime())) {
    return new Date().toISOString().split("T")[0] + "T00:00:00.000Z";
  }
  return new Date(parsedDate.setUTCHours(0, 0, 0, 0)).toISOString();
}

const Report = () => {
  const dispatch = useDispatch();
  const { reports, loading, error, importSuccess, importError, exportError } = useSelector(
    (state) => state.reports
  );

  const [view, setView] = useState("list");
  const [editId, setEditId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    userName: "",
    agent: "",
    origin: "",
    original: {
      sportNames: [""],
      eventNames: [""],
      marketNames: [""],
      betDetails: [{ odds: "", stack: "", time: "" }],
    },
    multiple: {
      enabled: false,
      sportName: "",
      eventName: "",
      marketName: "",
      betDetails: [{ odds: "", stack: "", time: "" }],
    },
    acBalance: "",
    afterVoidBalance: "",
    pl: "",
    catchBy: "",
    proofType: "Live Line Betting or Ground Line Betting",
    proofStatus: "Not Submitted",
    remark: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" });
  const [gotoPage, setGotoPage] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterData, setFilterData] = useState({
    startDate: "",
    endDate: "",
    userName: "",
    agent: "",
    origin: "",
    sportName: "",
    eventName: "",
    marketName: "",
    acBalanceMin: "",
    acBalanceMax: "",
    afterVoidBalanceMin: "",
    afterVoidBalanceMax: "",
    plMin: "",
    plMax: "",
    oddsMin: "",
    oddsMax: "",
    stackMin: "",
    stackMax: "",
    catchBy: "",
    proofType: "",
    proofStatus: "",
    remark: "",
  });

  const sportNameOptions = [
    "Cricket",
    "Kabaddi",
    "Socceraa",
    "Tennis",
    "Casino",
    "Original",
    "All Caino",
    "Int Casino",
    "Basketball",
    "Multi Sports",
  ];

  const marketNameOptions = ["Match Odds", "Moneyline", "Multi Market"];

  const proofTypeOptions = [
    "Live Line Betting or Ground Line Betting",
    "Live Line Betting, Ground Line and Group Betting",
    "Odds Manipulating or Odds Hedging",
    "Odds Manipulating or Odds Hedging and Group Betting",
    "Offside Goal and Goal Cancel",
  ];

  const catchByOptions = [
    "Niket",
    "Dhruv",
    "Jaydeep",
    "Krunal",
    "Sachin",
    "Vivek",
    "Rahul",
    "Harsh B.",
  ];

  const proofStatusOptions = ["Submitted", "Not Submitted"];

  useEffect(() => {
    if (view === "list") {
      dispatch(fetchReports());
    }
  }, [view, dispatch]);

  useEffect(() => {
  if (view === "edit" && editId) {
    const report = reports.find((r) => r._id === editId);
    if (report) {
      setFormData({
        date: report.date ? new Date(report.date).toISOString().split("T")[0] : "",
        userName: report.userName || "",
        agent: report.agent || "",
        origin: report.origin || "",
        original: {
          sportNames: Array.isArray(report.sportNames) ? report.sportNames : [""],
          eventNames: Array.isArray(report.eventNames) ? report.eventNames : [""],
          marketNames: Array.isArray(report.marketNames) ? report.marketNames : [""],
          betDetails: Array.isArray(report.betDetails) && report.betDetails.length > 0
            ? report.betDetails.map((detail) => ({
                odds: detail.odds != null ? detail.odds.toString() : "",
                stack: detail.stack != null ? detail.stack.toString() : "",
                time: detail.time || "",
              }))
            : [{ odds: "", stack: "", time: "" }],
        },
        multiple: {
          enabled: report.multiSport || report.multiEvent || report.multiMarket || false,
          sportName: report.multiSport || "",
          eventName: report.multiEvent || "",
          marketName: report.multiMarket || "",
          betDetails: Array.isArray(report.multiBetDetails) && report.multiBetDetails.length > 0
            ? report.multiBetDetails.map((detail) => ({
                odds: detail.odds != null ? detail.odds.toString() : "",
                stack: detail.stack != null ? detail.stack.toString() : "",
                time: detail.time || "",
              }))
            : [{ odds: "", stack: "", time: "" }],
        },
        acBalance: report.acBalance != null ? report.acBalance.toString() : "",
        afterVoidBalance: report.afterVoidBalance != null ? report.afterVoidBalance.toString() : "",
        pl: report.pl != null ? report.pl.toString() : "",
        catchBy: report.catchBy || "",
        proofType: report.proofType || "Live Line Betting or Ground Line Betting",
        proofStatus: report.proofStatus || "Not Submitted",
        remark: report.remark || "",
      });
    }
  } else if (view === "create") {
    setFormData({
      date: "",
      userName: "",
      agent: "",
      origin: "",
      original: {
        sportNames: [""],
        eventNames: [""],
        marketNames: [""],
        betDetails: [{ odds: "", stack: "", time: "" }],
      },
      multiple: {
        enabled: false,
        sportName: "",
        eventName: "",
        marketName: "",
        betDetails: [{ odds: "", stack: "", time: "" }],
      },
      acBalance: "",
      afterVoidBalance: "",
      pl: "",
      catchBy: "",
      proofType: "Live Line Betting or Ground Line Betting",
      proofStatus: "Not Submitted",
      remark: "",
    });
  }
}, [view, editId, reports]);

  const handleInputChange = (e, section, index = null, field = null) => {
    const { name, value } = e.target;

    if (section === "original" && field) {
      setFormData((prev) => {
        const updatedField = [...prev.original[field]];
        updatedField[index] = value;
        return {
          ...prev,
          original: {
            ...prev.original,
            [field]: updatedField,
          },
        };
      });
    } else if (section === "original" && index !== null) {
      setFormData((prev) => {
        const updatedBetDetails = [...prev.original.betDetails];
        updatedBetDetails[index] = {
          ...updatedBetDetails[index],
          [name]: value,
        };
        return {
          ...prev,
          original: {
            ...prev.original,
            betDetails: updatedBetDetails,
          },
        };
      });
    } else if (section === "multiple" && index !== null) {
      setFormData((prev) => {
        const updatedBetDetails = [...prev.multiple.betDetails];
        updatedBetDetails[index] = {
          ...updatedBetDetails[index],
          [name]: value,
        };
        return {
          ...prev,
          multiple: {
            ...prev.multiple,
            betDetails: updatedBetDetails,
          },
        };
      });
    } else if (section === "multiple") {
      setFormData((prev) => ({
        ...prev,
        multiple: {
          ...prev.multiple,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addBetDetail = (section) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        betDetails: [...prev[section].betDetails, { odds: "", stack: "", time: "" }],
      },
    }));
  };

  const removeBetDetail = (section, index) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        betDetails: prev[section].betDetails.filter((_, i) => i !== index),
      },
    }));
  };

  const addFieldEntry = (field) => {
    setFormData((prev) => ({
      ...prev,
      original: {
        ...prev.original,
        [field]: [...prev.original[field], ""],
      },
    }));
  };

  const removeFieldEntry = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      original: {
        ...prev.original,
        [field]: prev.original[field].filter((_, i) => i !== index),
      },
    }));
  };

  const toggleMultipleSection = () => {
    setFormData((prev) => ({
      ...prev,
      multiple: {
        ...prev.multiple,
        enabled: !prev.multiple.enabled,
      },
    }));
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  const reportData = {
    date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
    userName: formData.userName.trim(),
    agent: formData.agent.trim(),
    origin: formData.origin.trim(),
    sportNames: formData.original.sportNames,
    eventNames: formData.original.eventNames,
    marketNames: formData.original.marketNames,
    betDetails: formData.original.betDetails.map((detail) => ({
      odds: parseFloat(detail.odds) || 0,
      stack: parseFloat(detail.stack) || 0,
      time: detail.time.trim(),
    })),
    multiSport: formData.multiple.enabled ? formData.multiple.sportName : "",
    multiEvent: formData.multiple.enabled ? formData.multiple.eventName : "",
    multiMarket: formData.multiple.enabled ? formData.multiple.marketName : "",
    multiBetDetails: formData.multiple.enabled
      ? formData.multiple.betDetails.map((detail) => ({
          odds: parseFloat(detail.odds) || 0,
          stack: parseFloat(detail.stack) || 0,
          time: detail.time.trim(),
        }))
      : [],
    multiple: {
      enabled: formData.multiple.enabled, // Explicitly include the boolean value
    },
    acBalance: parseFloat(formData.acBalance) || 0,
    afterVoidBalance: parseFloat(formData.afterVoidBalance) || 0,
    pl: parseFloat(formData.pl) || 0,
    catchBy: formData.catchBy.trim(),
    proofType: formData.proofType.trim(),
    proofStatus: formData.proofStatus || "Not Submitted",
    remark: formData.remark.trim(),
  };

  // Client-side validation
  if (!reportData.userName) {
    alert("User Name is required");
    return;
  }
    if (!reportData.agent) {
      alert("Agent is required");
      return;
    }
    if (!reportData.sportNames[0] || !sportNameOptions.includes(reportData.sportNames[0])) {
      alert("Please select at least one valid Sport Name in Original section");
      return;
    }
    if (!reportData.eventNames[0]) {
      alert("At least one Event Name is required in Original section");
      return;
    }
    if (!reportData.marketNames[0] || !marketNameOptions.includes(reportData.marketNames[0])) {
      alert("Please select at least one valid Market Name in Original section");
      return;
    }
    if (
      !reportData.betDetails.length ||
      reportData.betDetails.some(
        (detail) => !detail.odds || !detail.stack || !validate12HourTime(detail.time)
      )
    ) {
      alert(
        "At least one complete bet detail (odds, stack, time in 12-hour format, e.g., 12:00:00 AM) is required in Original section"
      );
      return;
    }
    if (formData.multiple.enabled) {
      if (reportData.multiSport && !sportNameOptions.includes(reportData.multiSport)) {
        alert("Please select a valid Sport Name in Multiple section");
        return;
      }
      if (reportData.multiMarket && !marketNameOptions.includes(reportData.multiMarket)) {
        alert("Please select a valid Market Name in Multiple section");
        return;
      }
      if (
        reportData.multiBetDetails.length > 0 &&
        reportData.multiBetDetails.some(
          (detail) =>
            (detail.odds && !detail.stack) ||
            (detail.stack && !detail.odds) ||
            (detail.time && !validate12HourTime(detail.time))
        )
      ) {
        alert(
          "If bet details are provided in Multiple section, they must be complete (odds, stack, time in 12-hour format, e.g., 12:00:00 AM)"
        );
        return;
      }
    }
    if (!reportData.catchBy || !catchByOptions.includes(reportData.catchBy)) {
      alert("Please select a valid Catch By");
      return;
    }
    if (!proofTypeOptions.includes(reportData.proofType)) {
      alert("Please select a valid Proof Type");
      return;
    }
    if (!proofStatusOptions.includes(reportData.proofStatus)) {
      alert("Please select a valid Proof Status");
      return;
    }

if (view === "edit") {
    dispatch(updateReport({ id: editId, data: reportData }))
      .unwrap()
      .then(() => {
        setView("list");
        setEditId(null);
      })
      .catch((err) => {
        alert(`Failed to update report: ${err}`);
      });
  } else {
    dispatch(createReport(reportData))
      .unwrap()
      .then(() => {
        setView("list");
      })
      .catch((err) => {
        alert(`Failed to create report: ${err}`);
      });
  }
};

  const handleEdit = (id) => {
    setEditId(id);
    setView("edit");
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      dispatch(deleteReport(id))
        .unwrap()
        .catch((err) => {
          alert(`Failed to delete report: ${err}`);
        });
    }
  };

  const handlePreview = (report) => {
    setCurrentReport(report);
    setPreviewOpen(true);
  };

  const handleCancel = () => {
    setView("list");
    setEditId(null);
  };

  const handleExportExcel = async () => {
    dispatch(exportReports(filterData))
      .unwrap()
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "reports.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        alert(`Failed to export reports: ${error}`);
      });
  };

   
//      const handleImportExcel = (event) => {
//   const file = event.target.files[0];
//   if (!file) {
//     return; // Silently return if no file is selected
//   }

//   const reader = new FileReader();
//   reader.onload = (e) => {
//     try {
//       const data = new Uint8Array(e.target.result);
//       const workbook = XLSX.read(data, { type: "array", raw: false, dateNF: "yyyy-mm-dd" });
//       let allReports = [];
//       let sheetErrors = [];

//       workbook.SheetNames.forEach((sheetName) => {
//         const worksheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, blankrows: true });

//         if (jsonData.length === 0) {
//           sheetErrors.push(`Sheet "${sheetName}" is empty`);
//           return;
//         }

//         const sheetReports = jsonData
//           .map((row, rowIndex) => {
//             const isRowBlank = Object.values(row).every(
//               (value) => value === undefined || value === null || String(value).trim() === ""
//             );
//             if (isRowBlank) {
//               return null;
//             }

//             const requiredFields = [
//               "User Name",
//               "Agent",
//               "Sport Names",
//               "Event Names",
//               "Market Names",
//               "Catch By",
//               "Odds",
//               "Stack",
//               "Time",
//               "Proof Type",
//               "Proof Status",
//             ];
//             const missingFields = requiredFields.filter(
//               (field) => !row[field] || String(row[field]).trim() === ""
//             );
//             if (missingFields.length > 0) {
//               sheetErrors.push(
//                 `Sheet "${sheetName}", row ${rowIndex + 2}: Missing or blank required fields: ${missingFields.join(", ")}`
//               );
//               return null;
//             }

//             let dateValue = row["Date"] ? String(row["Date"]).trim() : "";
//             let normalizedDate = normalizeDate(dateValue);

//             const betDetailsArray = [];
//             const odds = row["Odds"] ? String(row["Odds"]).split("\n").map((val) => val.trim()) : ["0.00"];
//             const stack = row["Stack"] ? String(row["Stack"]).split("\n").map((val) => val.trim()) : ["0.00"];
//             const time = row["Time"] ? String(row["Time"]).split("\n").map((val) => val.trim()) : ["12:00:00 AM"];
//             const multiOdds = row["Multi Odds"] ? String(row["Multi Odds"]).split("\n").map((val) => val.trim()) : [];
//             const multiStack = row["Multi Stack"] ? String(row["Multi Stack"]).split("\n").map((val) => val.trim()) : [];
//             const multiTime = row["Multi Time"] ? String(row["Multi Time"]).split("\n").map((val) => val.trim()) : [];

//             const maxLength = Math.max(odds.length, stack.length, time.length);
//             for (let i = 0; i < maxLength; i++) {
//               let timeValue = time[i] || "12:00:00 AM";
//               if (timeValue && !validate12HourTime(timeValue)) {
//                 sheetErrors.push(
//                   `Invalid time in sheet "${sheetName}", row ${rowIndex + 2}, bet ${i + 1}: "${timeValue}"`
//                 );
//                 timeValue = "12:00:00 AM";
//               }
//               betDetailsArray.push({
//                 odds: parseFloat(odds[i] || "0.00") || 0,
//                 stack: parseFloat(stack[i] || "0.00") || 0,
//                 time: timeValue,
//               });
//             }

//             const multiBetDetailsArray = [];
//             const multiMaxLength = Math.max(multiOdds.length, multiStack.length, multiTime.length);
//             for (let i = 0; i < multiMaxLength; i++) {
//               let timeValue = multiTime[i] || "";
//               if (timeValue && !validate12HourTime(timeValue)) {
//                 sheetErrors.push(
//                   `Invalid multi time in sheet "${sheetName}", row ${rowIndex + 2}, bet ${i + 1}: "${timeValue}"`
//                 );
//                 timeValue = "";
//               }
//               if (multiOdds[i] || multiStack[i] || timeValue) {
//                 multiBetDetailsArray.push({
//                   odds: parseFloat(multiOdds[i] || "0.00") || 0,
//                   stack: parseFloat(multiStack[i] || "0.00") || 0,
//                   time: timeValue,
//                 });
//               }
//             }

//             const userName = row["User Name"] ? String(row["User Name"]).trim() : "";
//             const agent = row["Agent"] ? String(row["Agent"]).trim() : "";
//             const sportNames = row["Sport Names"]
//               ? String(row["Sport Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
//               : [""];
//             const eventNames = row["Event Names"]
//               ? String(row["Event Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
//               : [""];
//             const marketNames = row["Market Names"]
//               ? String(row["Market Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
//               : [""];
//             const catchBy = row["Catch By"] ? String(row["Catch By"]).trim() : "";
//             const proofType = row["Proof Type"]
//               ? String(row["Proof Type"]).trim()
//               : "Live Line Betting or Ground Line Betting";
//             const proofStatus = row["Proof Status"] ? String(row["Proof Status"]).trim() : "Not Submitted";

//             return {
//               date: normalizedDate,
//               userName,
//               agent,
//               origin: row["Origin"] ? String(row["Origin"]).trim() : "",
//               sportNames,
//               eventNames,
//               marketNames,
//               betDetails: betDetailsArray,
//               multiSport: row["Multi Sport"] ? String(row["Multi Sport"]).trim() : "",
//               multiEvent: row["Multi Event"] ? String(row["Multi Event"]).trim() : "",
//               multiMarket: row["Multi Market"] ? String(row["Multi Market"]).trim() : "",
//               multiBetDetails: multiBetDetailsArray,
//               multiple: {
//                 enabled: !!(row["Multi Sport"] || row["Multi Event"] || row["Multi Market"]),
//               },
//               acBalance: parseFloat(row["Account Balance"]) || 0,
//               afterVoidBalance: parseFloat(row["After Void Balance"]) || 0,
//               pl: parseFloat(row["P&L"]) || 0,
//               catchBy,
//               proofType,
//               proofStatus,
//               remark: row["Remark"] ? String(row["Remark"]).trim() : "",
//               sheetName,
//               rowIndex: rowIndex + 2,
//             };
//           })
//           .filter((report) => report !== null);

//         allReports = [...allReports, ...sheetReports];
//       });

//       if (allReports.length > 70) {
//         return; // Silently return if more than 70 reports
//       }

//       if (allReports.length === 0) {
//         // Dispatch an error to Redux state instead of alert
//         dispatch({
//           type: "reports/importReports/rejected",
//           error: { message: `No valid reports found in the Excel file.\n${sheetErrors.map((msg) => `- ${msg}`).join("\n")}` },
//         });
//         return;
//       }

//       dispatch(importReports(allReports))
//         .unwrap()
//         .then(() => {
//           dispatch(fetchReports()); // Refresh the report list
//         })
//         .catch(() => {
//           // Errors are handled by Redux state and displayed in UI
//         });
//     } catch (error) {
//       // Dispatch error to Redux state instead of alert
//       dispatch({
//         type: "reports/importReports/rejected",
//         error: { message: `Failed to process Excel file: ${error.message}` },
//       });
//     }
//   };
//   reader.onerror = () => {
//     // Dispatch error to Redux state instead of alert
//     dispatch({
//       type: "reports/importReports/rejected",
//       error: { message: "Error reading the file. Please try again with a valid Excel file." },
//     });
//   };
//   reader.readAsArrayBuffer(file);
// };

const handleImportExcel = (event) => {
  console.log("handleImportExcel called with file:", event.target.files[0]?.name);
  const file = event.target.files[0];
  if (!file) {
    dispatch({
      type: "reports/importReports/rejected",
      payload: { message: "Please select a file to import" },
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array", raw: false, dateNF: "yyyy-mm-dd" });
      let allReports = [];
      let totalSheetsProcessed = 0;

      workbook.SheetNames.forEach((sheetName) => {
        totalSheetsProcessed++;
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, blankrows: true });

        const sheetReports = jsonData
          .map((row, rowIndex) => {
            // Skip completely blank rows
            const isRowBlank = Object.values(row).every(
              (value) => value === undefined || value === null || String(value).trim() === ""
            );
            if (isRowBlank) {
              return null;
            }

            // Minimal client-side processing, let backend validate
            let dateValue = row["Date"] ? String(row["Date"]).trim() : "";
            let normalizedDate = normalizeDate(dateValue);

            const userName = row["User Name"] ? String(row["User Name"]).trim() : "";
            const agent = row["Agent"] ? String(row["Agent"]).trim() : "";
            const origin = row["Origin"] ? String(row["Origin"]).trim() : "";
            const sportNames = row["Sport Names"]
              ? String(row["Sport Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
              : [""];
            const eventNames = row["Event Names"]
              ? String(row["Event Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
              : [""];
            const marketNames = row["Market Names"]
              ? String(row["Market Names"]).split("\n").map((val) => val.trim()).filter(Boolean)
              : [""];
            const multiSport = row["Multi Sport"] ? String(row["Multi Sport"]).trim() : "";
            const multiEvent = row["Multi Event"] ? String(row["Multi Event"]).trim() : "";
            const multiMarket = row["Multi Market"] ? String(row["Multi Market"]).trim() : "";
            const catchBy = row["Catch By"] ? String(row["Catch By"]).trim() : "";
            const proofType = row["Proof Type"]
              ? String(row["Proof Type"]).trim()
              : "Live Line Betting or Ground Line Betting";
            const proofStatus = row["Proof Status"] ? String(row["Proof Status"]).trim() : "Not Submitted";
            const acBalance = parseFloat(row["Account Balance"]) || 0;
            const afterVoidBalance = parseFloat(row["After Void Balance"]) || 0;
            const pl = parseFloat(row["P&L"]) || 0;
            const remark = row["Remark"] ? String(row["Remark"]).trim() : "";

            // Process betDetails
            const betDetailsArray = [];
            const odds = row["Odds"] ? String(row["Odds"]).split("\n").map((val) => val.trim()) : ["0.00"];
            const stack = row["Stack"] ? String(row["Stack"]).split("\n").map((val) => val.trim()) : ["0.00"];
            const time = row["Time"] ? String(row["Time"]).split("\n").map((val) => val.trim()) : ["12:00:00 AM"];
            const maxLength = Math.max(odds.length, stack.length, time.length);

            for (let i = 0; i < maxLength; i++) {
              const oddsValue = parseFloat(odds[i] || "0.00") || 0;
              const stackValue = parseFloat(stack[i] || "0.00") || 0;
              const timeValue = time[i] || "12:00:00 AM";
              betDetailsArray.push({
                odds: oddsValue,
                stack: stackValue,
                time: timeValue,
              });
            }

            // Process multiBetDetails
            const multiBetDetailsArray = [];
            const multiOdds = row["Multi Odds"] ? String(row["Multi Odds"]).split("\n").map((val) => val.trim()) : [];
            const multiStack = row["Multi Stack"] ? String(row["Multi Stack"]).split("\n").map((val) => val.trim()) : [];
            const multiTime = row["Multi Time"] ? String(row["Multi Time"]).split("\n").map((val) => val.trim()) : [];
            const multiMaxLength = Math.max(multiOdds.length, multiStack.length, multiTime.length);

            for (let i = 0; i < multiMaxLength; i++) {
              const oddsValue = parseFloat(multiOdds[i] || "0.00") || 0;
              const stackValue = parseFloat(multiStack[i] || "0.00") || 0;
              const timeValue = multiTime[i] || "";
              if (oddsValue > 0 && stackValue > 0 && timeValue) {
                multiBetDetailsArray.push({
                  odds: oddsValue,
                  stack: stackValue,
                  time: timeValue,
                });
              }
            }

            return {
              date: normalizedDate,
              userName,
              agent,
              origin,
              sportNames,
              eventNames,
              marketNames,
              betDetails: betDetailsArray,
              multiSport,
              multiEvent,
              multiMarket,
              multiBetDetails: multiBetDetailsArray,
              multiple: {
                enabled: !!(multiSport || multiEvent || multiMarket || multiBetDetailsArray.length > 0),
              },
              acBalance,
              afterVoidBalance,
              pl,
              catchBy,
              proofType,
              proofStatus,
              remark,
              sheetName,
              rowIndex: rowIndex + 2,
            };
          })
          .filter((report) => report !== null);

        allReports = [...allReports, ...sheetReports];
      });

      if (allReports.length > 70) {
        dispatch({
          type: "reports/importReports/rejected",
          payload: { message: `Cannot import more than 70 reports at a time across ${totalSheetsProcessed} sheets` },
        });
        return;
      }

      if (allReports.length === 0) {
        dispatch({
          type: "reports/importReports/rejected",
          payload: { message: "No valid reports found in the Excel file." },
        });
        return;
      }

      console.log('Dispatching importReports with:', allReports);
      dispatch(importReports(allReports))
        .unwrap()
        .then(() => {
          dispatch(fetchReports()); // Refresh reports after import
        })
        .catch((error) => {
          console.error('Import failed:', error);
          // Error is handled by importReports.rejected reducer
        });
    } catch (error) {
      console.error('Excel processing error:', error);
      dispatch({
        type: "reports/importReports/rejected",
        payload: { message: `Failed to process the Excel file: ${error.message}` },
      });
    }
  };
  reader.onerror = () => {
    dispatch({
      type: "reports/importReports/rejected",
      payload: { message: "Error reading the file. Please try again with a valid Excel file." },
    });
  };
  reader.readAsArrayBuffer(file);
};

  const resetFilters = () => {
    setFilterData({
      startDate: "",
      endDate: "",
      userName: "",
      agent: "",
      origin: "",
      sportName: "",
      eventName: "",
      marketName: "",
      acBalanceMin: "",
      acBalanceMax: "",
      afterVoidBalanceMin: "",
      afterVoidBalanceMax: "",
      plMin: "",
      plMax: "",
      oddsMin: "",
      oddsMax: "",
      stackMin: "",
      stackMax: "",
      catchBy: "",
      proofType: "",
      proofStatus: "",
      remark: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const filteredReports = useMemo(() => {
    let filtered = reports;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          (report.userName && report.userName.toLowerCase().includes(searchLower)) ||
          (report.agent && report.agent.toLowerCase().includes(searchLower)) ||
          (report.origin && report.origin.toLowerCase().includes(searchLower)) ||
          (report.sportNames && report.sportNames.some((name) => name.toLowerCase().includes(searchLower))) ||
          (report.eventNames && report.eventNames.some((name) => name.toLowerCase().includes(searchLower))) ||
          (report.marketNames && report.marketNames.some((name) => name.toLowerCase().includes(searchLower))) ||
          (report.multiSport && report.multiSport.toLowerCase().includes(searchLower)) ||
          (report.multiEvent && report.multiEvent.toLowerCase().includes(searchLower)) ||
          (report.multiMarket && report.multiMarket.toLowerCase().includes(searchLower)) ||
          (report.catchBy && report.catchBy.toLowerCase().includes(searchLower)) ||
          (report.proofType && report.proofType.toLowerCase().includes(searchLower)) ||
          (report.proofStatus && report.proofStatus.toLowerCase().includes(searchLower)) ||
          (report.remark && report.remark.toLowerCase().includes(searchLower))
      );
    }

    if (filterData.startDate || filterData.endDate) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.date);
        const start = filterData.startDate ? new Date(filterData.startDate) : null;
        const end = filterData.endDate ? new Date(filterData.endDate) : null;
        return (!start || reportDate >= start) && (!end || reportDate <= end);
      });
    }

    if (filterData.userName) {
      filtered = filtered.filter((report) =>
        report.userName?.toLowerCase().includes(filterData.userName.toLowerCase())
      );
    }

    if (filterData.agent) {
      filtered = filtered.filter((report) =>
        report.agent?.toLowerCase().includes(filterData.agent.toLowerCase())
      );
    }

    if (filterData.origin) {
      filtered = filtered.filter((report) =>
        report.origin?.toLowerCase().includes(filterData.origin.toLowerCase())
      );
    }

    if (filterData.sportName) {
      filtered = filtered.filter((report) =>
        report.sportNames.includes(filterData.sportName)
      );
    }

    if (filterData.eventName) {
      filtered = filtered.filter((report) =>
        report.eventNames.some((name) =>
          name.toLowerCase().includes(filterData.eventName.toLowerCase())
        )
      );
    }

    if (filterData.marketName) {
      filtered = filtered.filter((report) =>
        report.marketNames.includes(filterData.marketName)
      );
    }

    if (filterData.acBalanceMin || filterData.acBalanceMax) {
      filtered = filtered.filter((report) => {
        const balance = Number(report.acBalance);
        const min = filterData.acBalanceMin ? Number(filterData.acBalanceMin) : null;
        const max = filterData.acBalanceMax ? Number(filterData.acBalanceMax) : null;
        return (!min || balance >= min) && (!max || balance <= max);
      });
    }

    if (filterData.afterVoidBalanceMin || filterData.afterVoidBalanceMax) {
      filtered = filtered.filter((report) => {
        const balance = Number(report.afterVoidBalance);
        const min = filterData.afterVoidBalanceMin ? Number(filterData.afterVoidBalanceMin) : null;
        const max = filterData.afterVoidBalanceMax ? Number(filterData.afterVoidBalanceMax) : null;
        return (!min || balance >= min) && (!max || balance <= max);
      });
    }

    if (filterData.plMin || filterData.plMax) {
      filtered = filtered.filter((report) => {
        const pl = Number(report.pl);
        const min = filterData.plMin ? Number(filterData.plMin) : null;
        const max = filterData.plMax ? Number(filterData.plMax) : null;
        return (!min || pl >= min) && (!max || pl <= max);
      });
    }

    if (filterData.oddsMin || filterData.oddsMax) {
      filtered = filtered.filter((report) =>
        report.betDetails.some((detail) => {
          const odds = Number(detail.odds);
          const min = filterData.oddsMin ? Number(filterData.oddsMin) : null;
          const max = filterData.oddsMax ? Number(filterData.oddsMax) : null;
          return (!min || odds >= min) && (!max || odds <= max);
        })
      );
    }

    if (filterData.stackMin || filterData.stackMax) {
      filtered = filtered.filter((report) =>
        report.betDetails.some((detail) => {
          const stack = Number(detail.stack);
          const min = filterData.stackMin ? Number(filterData.stackMin) : null;
          const max = filterData.stackMax ? Number(filterData.stackMax) : null;
          return (!min || stack >= min) && (!max || stack <= max);
        })
      );
    }

    if (filterData.catchBy) {
      filtered = filtered.filter((report) => report.catchBy === filterData.catchBy);
    }

    if (filterData.proofType) {
      filtered = filtered.filter((report) => report.proofType === filterData.proofType);
    }

    if (filterData.proofStatus) {
      filtered = filtered.filter((report) => report.proofStatus === filterData.proofStatus);
    }

    if (filterData.remark) {
      filtered = filtered.filter((report) =>
        report.remark?.toLowerCase().includes(filterData.remark.toLowerCase())
      );
    }

    return filtered;
  }, [reports, searchTerm, filterData]);

  const sortedReports = useMemo(() => {
    const sorted = [...filteredReports];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const aValue = sortConfig.key.includes(".")
          ? sortConfig.key.split(".").reduce((obj, key) => obj[key] || "", a)
          : a[sortConfig.key];
        const bValue = sortConfig.key.includes(".")
          ? sortConfig.key.split(".").reduce((obj, key) => obj[key] || "", b)
          : b[sortConfig.key];

        if (sortConfig.key === "date") {
          return sortConfig.direction === "asc"
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        } else if (["acBalance", "afterVoidBalance", "pl"].includes(sortConfig.key)) {
          return sortConfig.direction === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        } else if (sortConfig.key === "betDetails.odds") {
          const aOdds = a.betDetails[0]?.odds || 0;
          const bOdds = b.betDetails[0]?.odds || 0;
          return sortConfig.direction === "asc"
            ? aOdds - bOdds
            : bOdds - aOdds;
        } else {
          return sortConfig.direction === "asc"
            ? String(aValue).localeCompare(String(bValue))
            : String(bValue).localeCompare(String(aValue));
        }
      });
    }
    return sorted;
  }, [filteredReports, sortConfig]);

  const totalPages = Math.ceil(sortedReports.length / entriesPerPage);
  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleGotoPage = () => {
    const page = parseInt(gotoPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGotoPage("");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {view === "list" ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Reports</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {exportError && <div className="text-red-500 mb-4">{exportError}</div>}
          {(importError || importSuccess) && (
            <div className="mb-4 p-4 bg-gray-100 rounded relative">
              {importSuccess && (
                <div className="text-green-500 mb-2">{importSuccess}</div>
              )}
              {importError && (
                <div className="text-red-500">
                  <p className="font-semibold">Import Errors:</p>
                  <ul className="list-disc pl-5 whitespace-pre-line">
                    {importError.split('\n').map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={() => dispatch(clearError())}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
              >
                Clear
              </button>
            </div>
          )}
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setView("create")}
              className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Add Report
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleExportExcel}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Export to Excel
              </button>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcel}
                className="hidden"
                id="importExcel"
              />
              <label
                htmlFor="importExcel"
                className="bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer"
              >
                Import from Excel
              </label>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="bg-gray-500 text-white px-4 py-2 rounded flex items-center"
              >
                <FaFilter className="mr-2" /> Filters
              </button>
            </div>
          </div>
          {filterOpen && (
            <div className="bg-gray-100 p-4 rounded mb-4">
              <h2 className="text-lg font-semibold mb-2">Filters</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={filterData.startDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={filterData.endDate}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">User Name</label>
                  <input
                    type="text"
                    name="userName"
                    value={filterData.userName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Agent</label>
                  <input
                    type="text"
                    name="agent"
                    value={filterData.agent}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={filterData.origin}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Sport Name</label>
                  <select
                    name="sportName"
                    value={filterData.sportName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {sportNameOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    value={filterData.eventName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Market Name</label>
                  <select
                    name="marketName"
                    value={filterData.marketName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {marketNameOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Catch By</label>
                  <select
                    name="catchBy"
                    value={filterData.catchBy}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {catchByOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Proof Type</label>
                  <select
                    name="proofType"
                    value={filterData.proofType}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {proofTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Proof Status</label>
                  <select
                    name="proofStatus"
                    value={filterData.proofStatus}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">All</option>
                    {proofStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Remark</label>
                  <input
                    type="text"
                    name="remark"
                    value={filterData.remark}
                    onChange={handleFilterChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <div>
  <table className="min-w-full bg-white border table-fixed">
    <thead>
      <tr className="bg-gray-200">
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("date")}
        >
          Date
          {sortConfig.key === "date" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("userName")}
        >
          User Name
          {sortConfig.key === "userName" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("agent")}
        >
          Agent
          {sortConfig.key === "agent" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("origin")}
        >
          Origin
          {sortConfig.key === "origin" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("sportNames")}
        >
          Sport Names
          {sortConfig.key === "sportNames" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("eventNames")}
        >
          Event Names
          {sortConfig.key === "eventNames" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("marketNames")}
        >
          Market Names
          {sortConfig.key === "marketNames" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("betDetails.odds")}
        >
          Odds
          {sortConfig.key === "betDetails.odds" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th className="px-2 py-1 border text-xs">Stack</th>
        <th className="px-2 py-1 border text-xs">Time</th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("acBalance")}
        >
          Account Balance
          {sortConfig.key === "acBalance" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("afterVoidBalance")}
        >
          After Void Balance
          {sortConfig.key === "afterVoidBalance" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("pl")}
        >
          P&L
          {sortConfig.key === "pl" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("catchBy")}
        >
          Catch By
          {sortConfig.key === "catchBy" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("proofType")}
        >
          Proof Type
          {sortConfig.key === "proofType" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("proofStatus")}
        >
          Proof Status
          {sortConfig.key === "proofStatus" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th
          className="px-2 py-1 border cursor-pointer text-xs"
          onClick={() => handleSort("remark")}
        >
          Remark
          {sortConfig.key === "remark" ? (
            sortConfig.direction === "asc" ? (
              <FaSortUp className="inline ml-1" />
            ) : (
              <FaSortDown className="inline ml-1" />
            )
          ) : (
            <FaSort className="inline ml-1" />
          )}
        </th>
        <th className="px-2 py-1 border text-xs">Actions</th>
      </tr>
    </thead>
    <tbody>
      {paginatedReports.map((report) => {
        const sportNames = Array.isArray(report.sportNames) ? [...report.sportNames] : [];
        const eventNames = Array.isArray(report.eventNames) ? [...report.eventNames] : [];
        const marketNames = Array.isArray(report.marketNames) ? [...report.marketNames] : [];
        const betDetails = Array.isArray(report.betDetails) ? [...report.betDetails] : [];

        if (report.multiple?.enabled) {
          if (report.multiSport) sportNames.push(report.multiSport);
          if (report.multiEvent) eventNames.push(report.multiEvent);
          if (report.multiMarket) marketNames.push(report.multiMarket);
          if (Array.isArray(report.multiBetDetails)) {
            betDetails.push(...report.multiBetDetails);
          }
        }

        return betDetails.map((detail, index) => (
          <tr key={`${report._id}-${index}`} className="border">
            <td className="px-2 py-1 border text-xs truncate">
              {index === 0 ? (report.date ? new Date(report.date).toLocaleDateString() : "N/A") : ""}
            </td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.userName || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.agent || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.origin || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{sportNames[index] || sportNames[0] || "N/A"}</td>
            <td className="px-2 py-1 border text-xs truncate">{eventNames[index] || eventNames[0] || "N/A"}</td>
            <td className="px-2 py-1 border text-xs truncate">{marketNames[index] || marketNames[0] || "N/A"}</td>
            <td className="px-2 py-1 border text-xs truncate">{Number(detail.odds || 0).toFixed(2)}</td>
            <td className="px-2 py-1 border text-xs truncate">{Number(detail.stack || 0).toFixed(2)}</td>
            <td className="px-2 py-1 border text-xs truncate">{detail.time || "N/A"}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? Number(report.acBalance || 0).toFixed(2) : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? Number(report.afterVoidBalance || 0).toFixed(2) : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? Number(report.pl || 0).toFixed(2) : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.catchBy || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.proofType || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.proofStatus || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs truncate">{index === 0 ? report.remark || "N/A" : ""}</td>
            <td className="px-2 py-1 border text-xs">
              {index === 0 && (
                <div className="flex space-x-1">
                  <button onClick={() => handlePreview(report)} className="text-blue-500">
                    <FaEye />
                  </button>
                  <button onClick={() => handleEdit(report._id)} className="text-yellow-500">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(report._id)} className="text-red-500">
                    <FaTrash />
                  </button>
                </div>
              )}
            </td>
          </tr>
        ));
      })}
    </tbody>
  </table>
</div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    className="p-2 border rounded"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="ml-2">
                    Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
                    {Math.min(currentPage * entriesPerPage, sortedReports.length)} of{" "}
                    {sortedReports.length} entries
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                  <input
                    type="number"
                    value={gotoPage}
                    onChange={(e) => setGotoPage(e.target.value)}
                    className="w-16 p-2 border rounded"
                    placeholder="Go to"
                  />
                  <button
                    onClick={handleGotoPage}
                    className="px-4 py-2 border rounded bg-blue-500 text-white"
                  >
                    Go
                  </button>
                </div>
              </div>
            </>
          )}
          {previewOpen && currentReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Report Preview</h2>
                <p><strong>User Name:</strong> {currentReport.userName}</p>
                <p><strong>Agent:</strong> {currentReport.agent}</p>
                <p><strong>Origin:</strong> {currentReport.origin}</p>
                <p><strong>Sport Names:</strong> {currentReport.sportNames.join(", ")}</p>
                <p><strong>Event Names:</strong> {currentReport.eventNames.join(", ")}</p>
                <p><strong>Market Names:</strong> {currentReport.marketNames.join(", ")}</p>
                <p><strong>Multi Sport:</strong> {currentReport.multiSport || "N/A"}</p>
                <p><strong>Multi Event:</strong> {currentReport.multiEvent || "N/A"}</p>
                <p><strong>Multi Market:</strong> {currentReport.multiMarket || "N/A"}</p>
                <p><strong>Account Balance:</strong> {currentReport.acBalance}</p>
                <p><strong>After Void Balance:</strong> {currentReport.afterVoidBalance}</p>
                <p><strong>P&L:</strong> {currentReport.pl}</p>
                <p><strong>Bet Details:</strong></p>
                <ul>
                  {currentReport.betDetails.map((detail, index) => (
                    <li key={index}>
                      Odds: {detail.odds}, Stack: {detail.stack}, Time: {detail.time}
                    </li>
                  ))}
                </ul>
                {currentReport.multiBetDetails.length > 0 && (
                  <>
                    <p><strong>Multi Bet Details:</strong></p>
                    <ul>
                      {currentReport.multiBetDetails.map((detail, index) => (
                        <li key={index}>
                          Odds: {detail.odds}, Stack: {detail.stack}, Time: {detail.time}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <p><strong>Catch By:</strong> {currentReport.catchBy}</p>
                <p><strong>Proof Type:</strong> {currentReport.proofType}</p>
                <p><strong>Proof Status:</strong> {currentReport.proofStatus}</p>
                <p><strong>Remark:</strong> {currentReport.remark}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            {view === "edit" ? "Edit Report" : "Create Report"}
          </h1>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">User Name *</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Agent *</label>
                <input
                  type="text"
                  name="agent"
                  value={formData.agent}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <h2 className="text-lg font-semibold mt-6 mb-2">Original Section *</h2>
            <div className="border p-4 rounded mb-4">
              {formData.original.sportNames.map((sport, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium">Sport Name *</label>
                  <div className="flex items-center space-x-2">
                    <select
                      name="sportNames"
                      value={sport}
                      onChange={(e) => handleInputChange(e, "original", index, "sportNames")}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Sport</option>
                      {sportNameOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {formData.original.sportNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFieldEntry("sportNames", index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                    {index === formData.original.sportNames.length - 1 && (
                      <button
                        type="button"
                        onClick={() => addFieldEntry("sportNames")}
                        className="text-green-500 flex items-center"
                      >
                        <FaPlus className="mr-1" /> Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {formData.original.eventNames.map((event, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium">Event Name *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      name="eventNames"
                      value={event}
                      onChange={(e) => handleInputChange(e, "original", index, "eventNames")}
                      className="w-full p-2 border rounded"
                      required
                    />
                    {formData.original.eventNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFieldEntry("eventNames", index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                    {index === formData.original.eventNames.length - 1 && (
                      <button
                        type="button"
                        onClick={() => addFieldEntry("eventNames")}
                        className="text-green-500 flex items-center"
                      >
                        <FaPlus className="mr-1" /> Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {formData.original.marketNames.map((market, index) => (
                <div key={index} className="mb-4">
                  <label className="block text-sm font-medium">Market Name *</label>
                  <div className="flex items-center space-x-2">
                    <select
                      name="marketNames"
                      value={market}
                      onChange={(e) => handleInputChange(e, "original", index, "marketNames")}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Market</option>
                      {marketNameOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {formData.original.marketNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFieldEntry("marketNames", index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                    {index === formData.original.marketNames.length - 1 && (
                      <button
                        type="button"
                        onClick={() => addFieldEntry("marketNames")}
                        className="text-green-500 flex items-center"
                      >
                        <FaPlus className="mr-1" /> Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <h3 className="text-md font-semibold mt-4 mb-2">Bet Details *</h3>
              {formData.original.betDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium">Odds *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="odds"
                      value={detail.odds}
                      onChange={(e) => handleInputChange(e, "original", index)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Stack *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="stack"
                      value={detail.stack}
                      onChange={(e) => handleInputChange(e, "original", index)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium">Time (12-hour) *</label>
                      <input
                        type="text"
                        name="time"
                        value={detail.time}
                        onChange={(e) => handleInputChange(e, "original", index)}
                        placeholder="e.g., 12:00:00 AM"
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    {formData.original.betDetails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBetDetail("original", index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addBetDetail("original")}
                className="text-green-500 flex items-center mt-2"
              >
                <FaPlus className="mr-1" /> Add Bet Detail
              </button>
            </div>

            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.multiple.enabled}
                onChange={toggleMultipleSection}
                className="mr-2"
              />
              <label className="text-sm font-medium">Enable Multiple Section</label>
            </div>
            {formData.multiple.enabled && (
              <div className="border p-4 rounded mb-4">
                <h2 className="text-lg font-semibold mb-2">Multiple Section</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Sport Name</label>
                    <select
                      name="sportName"
                      value={formData.multiple.sportName}
                      onChange={(e) => handleInputChange(e, "multiple")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Sport</option>
                      {sportNameOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Event Name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.multiple.eventName}
                      onChange={(e) => handleInputChange(e, "multiple")}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Market Name</label>
                    <select
                      name="marketName"
                      value={formData.multiple.marketName}
                      onChange={(e) => handleInputChange(e, "multiple")}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Select Market</option>
                      {marketNameOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <h3 className="text-md font-semibold mt-4 mb-2">Bet Details</h3>
                {formData.multiple.betDetails.map((detail, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-sm font-medium">Odds</label>
                      <input
                        type="number"
                        step="0.01"
                        name="odds"
                        value={detail.odds}
                        onChange={(e) => handleInputChange(e, "multiple", index)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Stack</label>
                      <input
                        type="number"
                        step="0.01"
                        name="stack"
                        value={detail.stack}
                        onChange={(e) => handleInputChange(e, "multiple", index)}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div className="flex items-end space-x-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium">Time (12-hour)</label>
                        <input
                          type="text"
                          name="time"
                          value={detail.time}
                          onChange={(e) => handleInputChange(e, "multiple", index)}
                          placeholder="e.g., 12:00:00 AM"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      {formData.multiple.betDetails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBetDetail("multiple", index)}
                          className="text-red-500"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBetDetail("multiple")}
                  className="text-green-500 flex items-center mt-2"
                >
                  <FaPlus className="mr-1" /> Add Bet Detail
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Account Balance</label>
                <input
                  type="number"
                  step="0.01"
                  name="acBalance"
                  value={formData.acBalance}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">After Void Balance</label>
                <input
                  type="number"
                  step="0.01"
                  name="afterVoidBalance"
                  value={formData.afterVoidBalance}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">P&L</label>
                <input
                  type="number"
                  step="0.01"
                  name="pl"
                  value={formData.pl}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Catch By *</label>
                <select
                  name="catchBy"
                  value={formData.catchBy}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Catch By</option>
                  {catchByOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Proof Type *</label>
                <select
                  name="proofType"
                  value={formData.proofType}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                  required
                >
                  {proofTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium">Proof Status *</label>
                <select
                  name="proofStatus"
                  value={formData.proofStatus}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                  required
                >
                  {proofStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Remark</label>
                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                {view === "edit" ? "Update Report" : "Create Report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Report;
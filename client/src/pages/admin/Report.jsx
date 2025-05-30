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
} from "../../redux/reportSlice";
import axios from "axios";
import * as XLSX from "xlsx";

// validate 12-hour time format
function validate12HourTime(time) {
  const regex = /^\d{1,2}:\d{2}:\d{2}\s*(AM|PM)$/i;
  return regex.test(time);
}

//  convert 24-hour time to 12-hour time
function convert24To12Hour(time24) {
  if (!time24 || !/^\d{2}:\d{2}:\d{2}$/.test(time24)) return "12:00:00 AM";
  const [hours, minutes, seconds] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;
}

// normalize date 
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
  const { reports, loading, error } = useSelector((state) => state.reports);

  const [view, setView] = useState("list");
  const [editId, setEditId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    userName: "",
    agent: "",
    origin: "",
    sportName: "",
    eventName: "",
    marketName: "",
    acBalance: "",
    afterVoidBalance: "",
    pl: "",
    betDetails: [{ odds: "", stack: "", time: "" }],
    catchBy: "",
    proofType: "Live Line Betting or Ground Line Betting",
    proofStatus: "Not Submitted",
    remark: "",
  });
  const [exportError, setExportError] = useState(null);
  const [importError, setImportError] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  // State for search, pagination, sorting, and jump to page
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
    "Soccer",
    "Tennis",
    "Casino",
    "Original",
    "All Casino",
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
          sportName: report.sportName || "",
          eventName: report.eventName || "",
          marketName: report.marketName || "",
          acBalance: report.acBalance != null ? report.acBalance.toString() : "",
          afterVoidBalance: report.afterVoidBalance != null ? report.afterVoidBalance.toString() : "",
          pl: report.pl != null ? report.pl.toString() : "",
          betDetails: Array.isArray(report.betDetails) && report.betDetails.length > 0
            ? report.betDetails.map((detail) => ({
                odds: detail.odds != null ? detail.odds.toString() : "",
                stack: detail.stack != null ? detail.stack.toString() : "",
                time: detail.time || "",
              }))
            : [{ odds: "", stack: "", time: "" }],
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
        sportName: "",
        eventName: "",
        marketName: "",
        acBalance: "",
        afterVoidBalance: "",
        pl: "",
        betDetails: [{ odds: "", stack: "", time: "" }],
        catchBy: "",
        proofType: "Live Line Betting or Ground Line Betting",
        proofStatus: "Not Submitted",
        remark: "",
      });
    }
  }, [view, editId, reports]);

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      // Handle betDetails array inputs
      setFormData((prev) => {
        const updatedBetDetails = [...prev.betDetails];
        updatedBetDetails[index] = {
          ...updatedBetDetails[index],
          [name]: value, // Directly use the name (odds, stack, time)
        };
        return {
          ...prev,
          betDetails: updatedBetDetails,
        };
      });
    } else {
      // Handle top-level form inputs
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

  const addBetDetail = () => {
    setFormData({
      ...formData,
      betDetails: [...formData.betDetails, { odds: "", stack: "", time: "" }],
    });
  };

  const removeBetDetail = (index) => {
    setFormData({
      ...formData,
      betDetails: formData.betDetails.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportData = {
      date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      userName: formData.userName.trim(),
      agent: formData.agent.trim(),
      origin: formData.origin.trim(),
      sportName: formData.sportName,
      eventName: formData.eventName.trim(),
      marketName: formData.marketName,
      acBalance: parseFloat(formData.acBalance) || 0,
      afterVoidBalance: parseFloat(formData.afterVoidBalance) || 0,
      pl: parseFloat(formData.pl) || 0,
      betDetails: formData.betDetails.map((detail) => ({
        odds: parseFloat(detail.odds) || 0,
        stack: parseFloat(detail.stack) || 0,
        time: detail.time.trim(),
      })),
      catchBy: formData.catchBy.trim(),
      proofType: formData.proofType === "None" ? "none" : formData.proofType.trim(),
      proofStatus: formData.proofStatus || "Not Submitted",
      remark: formData.remark.trim(),
    };

    // Frontend validation
    if (!reportData.userName) {
      alert("User Name is required");
      return;
    }
    if (!reportData.agent) {
      alert("Agent is required");
      return;
    }
    if (!reportData.sportName || !sportNameOptions.includes(reportData.sportName)) {
      alert("Please select a valid Sport Name");
      return;
    }
    if (!reportData.eventName) {
      alert("Event Name is required");
      return;
    }
    if (!reportData.marketName || !marketNameOptions.includes(reportData.marketName)) {
      alert("Please select a valid Market Name");
      return;
    }
    if (!reportData.catchBy || !catchByOptions.includes(reportData.catchBy)) {
      alert("Please select a valid Catch By");
      return;
    }
    if (
      !reportData.betDetails.length ||
      reportData.betDetails.some(
        (detail) => !detail.odds || !detail.stack || !validate12HourTime(detail.time)
      )
    ) {
      alert(
        "At least one complete bet detail (odds, stack, time in 12-hour format, e.g., 12:00:00 AM) is required"
      );
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
          alert(`Failed to update report: ${err.message || "Unknown error"}`);
        });
    } else {
      dispatch(createReport(reportData))
        .unwrap()
        .then(() => {
          setView("list");
        })
        .catch((err) => {
          alert(`Failed to create report: ${err.message || "Unknown error"}`);
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
          alert(`Failed to delete report: ${err.message || "Unknown error"}`);
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
    setExportError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (filterData.startDate) params.append("startDate", filterData.startDate);
      if (filterData.endDate) params.append("endDate", filterData.endDate);
      if (filterData.userName) params.append("userName", filterData.userName);
      if (filterData.agent) params.append("agent", filterData.agent);
      if (filterData.origin) params.append("origin", filterData.origin);
      if (filterData.sportName) params.append("sportName", filterData.sportName);
      if (filterData.eventName) params.append("eventName", filterData.eventName);
      if (filterData.marketName) params.append("marketName", filterData.marketName);
      if (filterData.acBalanceMin) params.append("acBalanceMin", filterData.acBalanceMin);
      if (filterData.acBalanceMax) params.append("acBalanceMax", filterData.acBalanceMax);
      if (filterData.afterVoidBalanceMin)
        params.append("afterVoidBalanceMin", filterData.afterVoidBalanceMin);
      if (filterData.afterVoidBalanceMax)
        params.append("afterVoidBalanceMax", filterData.afterVoidBalanceMax);
      if (filterData.plMin) params.append("plMin", filterData.plMin);
      if (filterData.plMax) params.append("plMax", filterData.plMax);
      if (filterData.oddsMin) params.append("oddsMin", filterData.oddsMin);
      if (filterData.oddsMax) params.append("oddsMax", filterData.oddsMax);
      if (filterData.stackMin) params.append("stackMin", filterData.stackMin);
      if (filterData.stackMax) params.append("stackMax", filterData.stackMax);
      if (filterData.catchBy) params.append("catchBy", filterData.catchBy);
      if (filterData.proofType) params.append("proofType", filterData.proofType);
      if (filterData.proofStatus) params.append("proofStatus", filterData.proofStatus);
      if (filterData.remark) params.append("remark", filterData.remark);
      if (sortConfig.key) params.append("sortKey", sortConfig.key);
      if (sortConfig.direction) params.append("sortDirection", sortConfig.direction);

      const response = await axios.get(
        `http://localhost:2030/report/exportExcel?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "reports.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      let errorMessage = "Failed to export reports to Excel";
      if (error.response?.status === 404) {
        errorMessage = "No reports found to export";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      setExportError(errorMessage);
    }
  };

  const handleImportExcel = (event) => {
    setImportError(null);
    setImportSuccess(null);
    const file = event.target.files[0];
    if (!file) {
      setImportError("Please select a file to import");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", raw: false, dateNF: "yyyy-mm-dd" });
        let allReports = [];
        let sheetErrors = [];
        let totalSheetsProcessed = 0;
        let totalReportsImported = 0;

        workbook.SheetNames.forEach((sheetName, sheetIndex) => {
          totalSheetsProcessed++;
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

          if (jsonData.length === 0) {
            sheetErrors.push(`Sheet "${sheetName}" is empty`);
            return;
          }

          const sheetReports = jsonData
            .map((row, rowIndex) => {
              let dateValue = row["Date"] ? String(row["Date"]).trim() : "";
              let normalizedDate = normalizeDate(dateValue);

              const betDetailsArray = [];
              const odds = row["Odds"] ? String(row["Odds"]).split("\n").map((val) => val.trim()) : ["0.00"];
              const stack = row["Stack"] ? String(row["Stack"]).split("\n").map((val) => val.trim()) : ["0.00"];
              const time = row["Time"] ? String(row["Time"]).split("\n").map((val) => val.trim()) : ["12:00:00 AM"];

              const maxLength = Math.max(odds.length, stack.length, time.length);
              for (let i = 0; i < maxLength; i++) {
                let timeValue = time[i] || "12:00:00 AM";
                if (timeValue && !validate12HourTime(timeValue)) {
                  try {
                    const date = new Date(`1970-01-01T${timeValue}Z`);
                    if (!isNaN(date.getTime())) {
                      const hours = date.getHours();
                      const minutes = date.getMinutes();
                      const seconds = date.getSeconds();
                      const period = hours >= 12 ? "PM" : "AM";
                      const hour = hours % 12 === 0 ? 12 : hours % 12;
                      timeValue = `${hour.toString().padStart(2, "0")}:${minutes
                        .toString()
                        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${period}`;
                    } else {
                      sheetErrors.push(
                        `Invalid time in sheet "${sheetName}", row ${rowIndex + 2}, bet ${i + 1}: "${timeValue}"`
                      );
                      timeValue = "12:00:00 AM";
                    }
                  } catch (err) {
                    sheetErrors.push(
                      `Invalid time in sheet "${sheetName}", row ${rowIndex + 2}, bet ${i + 1}: "${timeValue}"`
                    );
                    timeValue = "12:00:00 AM";
                  }
                }

                betDetailsArray.push({
                  odds: parseFloat(odds[i] || "0.00") || 0,
                  stack: parseFloat(stack[i] || "0.00") || 0,
                  time: timeValue,
                });
              }

              const userName = row["User Name"] ? String(row["User Name"]).trim() : "";
              const agent = row["Agent"] ? String(row["Agent"]).trim() : "";
              const sportName = row["Sport Name"] ? String(row["Sport Name"]).trim() : "";
              const eventName = row["Event Name"] ? String(row["Event Name"]).trim() : "";
              const marketName = row["Market Name"] ? String(row["Market Name"]).trim() : "";
              const catchBy = row["Catch By"] ? String(row["Catch By"]).trim() : "";
              const proofType = row["Proof Type"]
                ? String(row["Proof Type"]).trim()
                : "Live Line Betting or Ground Line Betting";
              const proofStatus = row["Proof Status"] ? String(row["Proof Status"]).trim() : "Not Submitted";

              if (
                !userName ||
                !agent ||
                !sportName ||
                !sportNameOptions.includes(sportName) ||
                !eventName ||
                !marketName ||
                !marketNameOptions.includes(marketName) ||
                !catchBy ||
                !catchByOptions.includes(catchBy) ||
                betDetailsArray.length === 0 ||
                betDetailsArray.some(
                  (detail) => detail.odds === 0 || detail.stack === 0 || !validate12HourTime(detail.time)
                ) ||
                !proofTypeOptions.includes(proofType) ||
                !proofStatusOptions.includes(proofStatus)
              ) {
                sheetErrors.push(
                  `Invalid or missing required fields in sheet "${sheetName}", row ${rowIndex + 2}. Ensure User Name, Agent, valid Sport Name, Event Name, valid Market Name, valid Catch By, valid Bet Details (odds, stack, time in 12-hour format), valid Proof Type, and valid Proof Status are provided.`
                );
                return null;
              }

              return {
                date: normalizedDate,
                userName,
                agent,
                origin: row["Origin"] ? String(row["Origin"]).trim() : "",
                sportName,
                eventName,
                marketName,
                acBalance: parseFloat(row["Account Balance"]) || 0,
                afterVoidBalance: parseFloat(row["After Void Balance"]) || 0,
                pl: parseFloat(row["P&L"]) || 0,
                betDetails: betDetailsArray,
                catchBy,
                proofType,
                proofStatus,
                remark: row["Remark"] ? String(row["Remark"]).trim() : "",
                sheetName, // Add sheet name for tracking
                rowIndex: rowIndex + 2, // Add row index for tracking
              };
            })
            .filter((report) => report !== null);

          totalReportsImported += sheetReports.length;
          allReports = [...allReports, ...sheetReports];
        });

        if (allReports.length > 70) {
          setImportError(`Cannot import more than 70 reports at a time across ${totalSheetsProcessed} sheets`);
          return;
        }

        if (allReports.length === 0) {
          setImportError(`No valid reports found in the Excel file across ${totalSheetsProcessed} sheets. Errors: ${sheetErrors.join(", ")}`);
          return;
        }

        dispatch(importReports(allReports))
          .then((action) => {
            if (action.meta.requestStatus === "fulfilled") {
              dispatch(fetchReports());
              if (action.payload && Array.isArray(action.payload.data)) {
                if (action.payload.data.length === 0) {
                  setImportSuccess(
                    `No new reports imported from ${totalSheetsProcessed} sheets. All entries were duplicates based on Date, User Name, Agent, Sport Name, Event Name, and Market Name.`
                  );
                } else {
                  setImportSuccess(
                    `${action.payload.data.length} report(s) imported successfully from ${totalSheetsProcessed} sheets`
                  );
                }
                if (action.payload.errors && action.payload.errors.length > 0) {
                  setImportError(
                    `Some reports were not imported: ${action.payload.errors
                      .map((err) => `Sheet "${err.sheetName}", row ${err.rowIndex}: ${err.msg}`)
                      .join(", ")}`
                  );
                } else if (sheetErrors.length > 0) {
                  setImportError(`Some rows were skipped due to invalid data: ${sheetErrors.join(", ")}`);
                } else {
                  setImportError(null);
                }
              } else {
                setImportError("Unexpected server response format. Please try again or check server logs.");
              }
            } else {
              let errorMessage = "Failed to save imported reports";
              if (action.payload?.message) {
                errorMessage = action.payload.message;
                if (action.payload.errors) {
                  errorMessage += ": " + action.payload.errors.map((err) => `Sheet "${err.sheetName}", row ${err.rowIndex}: ${err.msg}`).join(", ");
                }
              } else if (action.error?.message) {
                errorMessage = action.error.message;
              }
              setImportError(errorMessage);
            }
          })
          .catch((error) => {
            console.error("Error during import dispatch:", error);
            setImportError(`Failed to import reports from ${totalSheetsProcessed} sheets due to a server error: ${error.message}`);
          });
      } catch (error) {
        console.error("Error importing Excel file:", error);
        setImportError(
          `Failed to process the Excel file across ${totalSheetsProcessed} sheets. Ensure it is in the correct format with valid dates, required fields, valid Proof Type, and valid time in 12-hour format (e.g., 12:00:00 AM).`
        );
      }
    };
    reader.onerror = () => {
      setImportError("Error reading the file. Please try again with a valid Excel file.");
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
          (report.sportName && report.sportName.toLowerCase().includes(searchLower)) ||
          (report.eventName && report.eventName.toLowerCase().includes(searchLower)) ||
          (report.marketName && report.marketName.toLowerCase().includes(searchLower)) ||
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
      filtered = filtered.filter((report) => report.sportName === filterData.sportName);
    }

    if (filterData.eventName) {
      filtered = filtered.filter((report) =>
        report.eventName?.toLowerCase().includes(filterData.eventName.toLowerCase())
      );
    }

    if (filterData.marketName) {
      filtered = filtered.filter((report) => report.marketName === filterData.marketName);
    }

    if (filterData.acBalanceMin || filterData.acBalanceMax) {
      filtered = filtered.filter((report) => {
        const balance = Number(report.acBalance) || 0;
        const min = filterData.acBalanceMin ? Number(filterData.acBalanceMin) : null;
        const max = filterData.acBalanceMax ? Number(filterData.acBalanceMax) : null;
        return (!min || balance >= min) && (!max || balance <= max);
      });
    }

    if (filterData.afterVoidBalanceMin || filterData.afterVoidBalanceMax) {
      filtered = filtered.filter((report) => {
        const balance = Number(report.afterVoidBalance) || 0;
        const min = filterData.afterVoidBalanceMin ? Number(filterData.afterVoidBalanceMin) : null;
        const max = filterData.afterVoidBalanceMax ? Number(filterData.afterVoidBalanceMax) : null;
        return (!min || balance >= min) && (!max || balance <= max);
      });
    }

    if (filterData.plMin || filterData.plMax) {
      filtered = filtered.filter((report) => {
        const pl = Number(report.pl) || 0;
        const min = filterData.plMin ? Number(filterData.plMin) : null;
        const max = filterData.plMax ? Number(filterData.plMax) : null;
        return (!min || pl >= min) && (!max || pl <= max);
      });
    }

    if (filterData.oddsMin || filterData.oddsMax) {
      filtered = filtered.filter((report) =>
        Array.isArray(report.betDetails) &&
        report.betDetails.some((detail) => {
          const odds = Number(detail.odds) || 0;
          const min = filterData.oddsMin ? Number(filterData.oddsMin) : null;
          const max = filterData.oddsMax ? Number(filterData.oddsMax) : null;
          return (!min || odds >= min) && (!max || odds <= max);
        })
      );
    }

    if (filterData.stackMin || filterData.stackMax) {
      filtered = filtered.filter((report) =>
        Array.isArray(report.betDetails) &&
        report.betDetails.some((detail) => {
          const stack = Number(detail.stack) || 0;
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
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "date") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (["acBalance", "afterVoidBalance", "pl"].includes(sortConfig.key)) {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredReports, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const totalEntries = sortedReports.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setGotoPage("");
    }
  };

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
    setGotoPage("");
  };

  const handleJumpToPage = () => {
    const pageNum = parseInt(gotoPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGotoPage("");
    } else {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
      setGotoPage("");
    }
  };

  const getPageNumbers = () => {
    const maxPagesToShow = 3;
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

const renderList = () => (
  <div className="mx-auto px-4 py-8 flex">
    {/* Main Content */}
    <div className={`flex-1 transition-all duration-300 ${filterOpen ? "mr-80" : "mr-0"}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Report Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilterOpen(true)}
            className="bg-[#FFA500] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
          >
            <FaFilter className="mr-2" />
            Filter
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-500 text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
          >
            Reset Filters
          </button>
          <label className="bg-[#003465] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center">
            Import Excel
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportExcel}
            className="bg-blue-500 text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
          >
            Export Excel
          </button>
          <button
            onClick={() => setView("create")}
            className="bg-[#00008B] text-white cursor-pointer p-[10px] px-[20px] rounded-2xl text-[16px] font-bold flex justify-center items-center"
          >
            <span className="font-bold text-lg mr-1">
              <FaPlus />
            </span>
            Add Report
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Quick search by user, agent, origin, sport, event, market, catch by, proof type, proof status, or remark..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === "string" ? error : JSON.stringify(error)}
        </div>
      )}
      {exportError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {exportError}
        </div>
      )}
      {importError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-4 rounded mb-4">
          {importError}
        </div>
      )}
      {importSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-4 rounded mb-4">
          {importSuccess}
        </div>
      )}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00008B]"></div>
        </div>
      )}

      {Array.isArray(paginatedReports) && paginatedReports.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "date", label: "Date" },
                  { key: "userName", label: "User Name" },
                  { key: "agent", label: "Agent" },
                  { key: "sportName", label: "Sport" },
                  { key: "eventName", label: "Event" },
                  { key: "marketName", label: "Market" },
                  { key: "acBalance", label: "A/C Balance" },
                  { key: "afterVoidBalance", label: "After Void" },
                  { key: "pl", label: "P&L" },
                  { key: "odds", label: "Odds" },
                  { key: "stack", label: "Stack" },
                  { key: "time", label: "Time" },
                  { key: "catchBy", label: "Catch By" },
                  { key: "proofType", label: "Proof Type" },
                  { key: "proofStatus", label: "Proof Status" },
                  { key: "actions", label: "Actions" },
                ].map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() =>
                      header.key !== "actions" &&
                      !["odds", "stack", "time"].includes(header.key) &&
                      requestSort(header.key)
                    }
                  >
                    <div className="flex items-center">
                      {header.label}
                      {header.key !== "actions" && !["odds", "stack", "time"].includes(header.key) && (
                        <span className="ml-2">
                          {sortConfig.key === header.key ? (
                            sortConfig.direction === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )
                          ) : (
                            <FaSort className="text-gray-300" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReports.map((report) => (
                <tr key={report._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.date ? new Date(report.date).toLocaleDateString("en-GB") : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.userName || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.agent || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.sportName || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.eventName || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.marketName || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof report.acBalance === "number" ? report.acBalance.toFixed(2) : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof report.afterVoidBalance === "number"
                      ? report.afterVoidBalance.toFixed(2)
                      : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof report.pl === "number" ? report.pl.toFixed(2) : "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {Array.isArray(report.betDetails) && report.betDetails.length > 0
                      ? report.betDetails.map((detail) => detail.odds?.toFixed(2) || "0.00").join(", ")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {Array.isArray(report.betDetails) && report.betDetails.length > 0
                      ? report.betDetails.map((detail) => detail.stack?.toFixed(2) || "0.00").join(", ")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {Array.isArray(report.betDetails) && report.betDetails.length > 0
                      ? report.betDetails.map((detail) => detail.time || "12:00:00 AM").join(", ")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.catchBy || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.proofType || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.proofStatus || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handlePreview(report)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(report._id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(report._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-8 text-gray-500">No reports found.</div>
        )
      )}

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, totalEntries)} of {totalEntries} entries
          </span>
          <select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          >
            {[10, 25, 50, 100, 150, 200].map((num) => (
              <option key={num} value={num}>
                {num} entry
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                currentPage === page ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={gotoPage}
              onChange={(e) => setGotoPage(e.target.value)}
              placeholder="Go to page"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleJumpToPage}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Filter Sidebar */}
    {filterOpen && (
      <div className="fixed top-0 right-0 h-full w-80 bg-white p-6 shadow-lg z-50 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Advanced Filter</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Start Date to End Date</label>
              <input
                type="date"
                name="startDate"
                value={filterData.startDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filterData.endDate}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User Name</label>
            <input
              type="text"
              name="userName"
              value={filterData.userName}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <input
              type="text"
              name="agent"
              value={filterData.agent}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Origin</label>
            <input
              type="text"
              name="origin"
              value={filterData.origin}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sport Name</label>
            <select
              name="sportName"
              value={filterData.sportName}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              name="eventName"
              value={filterData.eventName}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Name</label>
            <select
              name="marketName"
              value={filterData.marketName}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Market</option>
              {marketNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Account Balance Min to Max</label>
              <input
                type="number"
                name="acBalanceMin"
                value={filterData.acBalanceMin}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">Account Balance Max</label>
              <input
                type="number"
                name="acBalanceMax"
                value={filterData.acBalanceMax}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">After Void Balance Min to Max</label>
              <input
                type="number"
                name="afterVoidBalanceMin"
                value={filterData.afterVoidBalanceMin}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">After Void Balance Max</label>
              <input
                type="number"
                name="afterVoidBalanceMax"
                value={filterData.afterVoidBalanceMax}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">P&L Min to Max</label>
              <input
                type="number"
                name="plMin"
                value={filterData.plMin}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">P&L Max</label>
              <input
                type="number"
                name="plMax"
                value={filterData.plMax}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Odds Min to Max</label>
              <input
                type="number"
                name="oddsMin"
                value={filterData.oddsMin}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">Odds Max</label>
              <input
                type="number"
                name="oddsMax"
                value={filterData.oddsMax}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Stack Min to Max</label>
              <input
                type="number"
                name="stackMin"
                value={filterData.stackMin}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 opacity-0">Stack Max</label>
              <input
                type="number"
                name="stackMax"
                value={filterData.stackMax}
                onChange={handleFilterChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Catch By</label>
            <select
              name="catchBy"
              value={filterData.catchBy}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
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
            <label className="block text-sm font-medium text-gray-700">Proof Type</label>
            <select
              name="proofType"
              value={filterData.proofType}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Proof Type</option>
              {proofTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proof Status</label>
            <select
              name="proofStatus"
              value={filterData.proofStatus}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Status</option>
              {proofStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Remark</label>
            <input
              type="text"
              name="remark"
              value={filterData.remark}
              onChange={handleFilterChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setFilterOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setFilterOpen(false);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Apply Filters
          </button>
        </div>
      </div>
    )}
  </div>
);

  const renderForm = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">{view === "edit" ? "Edit Report" : "Create Report"}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User Name</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Agent</label>
            <input
              type="text"
              name="agent"
              value={formData.agent}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Origin</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sport Name</label>
            <select
              name="sportName"
              value={formData.sportName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Market Name</label>
            <select
              name="marketName"
              value={formData.marketName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Market</option>
              {marketNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Balance</label>
            <input
              type="number"
              name="acBalance"
              value={formData.acBalance}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">After Void Balance</label>
            <input
              type="number"
              name="afterVoidBalance"
              value={formData.afterVoidBalance}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">P&L</label>
            <input
              type="number"
              name="pl"
              value={formData.pl}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bet Details</label>
            {formData.betDetails.map((detail, index) => (
              <div key={`betDetail-${index}`} className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    name="odds"
                    value={detail.odds}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Odds (e.g., 2.50)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Stack</label>
                  <input
                    type="number"
                    step="0.01"
                    name="stack"
                    value={detail.stack}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Stack (e.g., 100.00)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600">Time</label>
                  <input
                    type="text"
                    name="time"
                    value={detail.time}
                    onChange={(e) => handleInputChange(e, index)}
                    placeholder="Time (e.g., 12:00:00 AM)"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {formData.betDetails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBetDetail(index)}
                    className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addBetDetail}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Bet Detail
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Catch By</label>
            <select
              name="catchBy"
              value={formData.catchBy}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">Proof Type</label>
            <select
              name="proofType"
              value={formData.proofType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {proofTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proof Status</label>
            <select
              name="proofStatus"
              value={formData.proofStatus}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {proofStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Remark</label>
            <input
              type="text"
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {view === "edit" ? "Update Report" : "Create Report"}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Report Preview</h2>
        {currentReport && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>
                <strong>Date:</strong>{" "}
                {currentReport.date ? new Date(currentReport.date).toLocaleDateString("en-GB") : "-"}
              </p>
              <p>
                <strong>User Name:</strong> {currentReport.userName || "-"}
              </p>
              <p>
                <strong>Agent:</strong> {currentReport.agent || "-"}
              </p>
              <p>
                <strong>Origin:</strong> {currentReport.origin || "-"}
              </p>
              <p>
                <strong>Sport Name:</strong> {currentReport.sportName || "-"}
              </p>
              <p>
                <strong>Event Name:</strong> {currentReport.eventName || "-"}
              </p>
              <p>
                <strong>Market Name:</strong> {currentReport.marketName || "-"}
              </p>
              <p>
                <strong>Account Balance:</strong>{" "}
                {typeof currentReport.acBalance === "number"
                  ? currentReport.acBalance.toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div>
              <p>
                <strong>After Void Balance:</strong>{" "}
                {typeof currentReport.afterVoidBalance === "number"
                  ? currentReport.afterVoidBalance.toFixed(2)
                  : "0.00"}
              </p>
              <p>
                <strong>P&L:</strong>{" "}
                {typeof currentReport.pl === "number" ? currentReport.pl.toFixed(2) : "0.00"}
              </p>
              <p>
                <strong>Bet Details:</strong>
              </p>
              {Array.isArray(currentReport.betDetails) && currentReport.betDetails.length > 0 ? (
                <ul className="list-disc pl-5">
                  {currentReport.betDetails.map((detail, index) => (
                    <li key={index}>
                      Odds: {detail.odds?.toFixed(2) || "0.00"}, Stack: {detail.stack?.toFixed(2) || "0.00"}, Time:{" "}
                      {detail.time || "12:00:00 AM"}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>-</p>
              )}
              <p>
                <strong>Catch By:</strong> {currentReport.catchBy || "-"}
              </p>
              <p>
                <strong>Proof Type:</strong> {currentReport.proofType || "-"}
              </p>
              <p>
                <strong>Proof Status:</strong> {currentReport.proofStatus || "-"}
              </p>
              <p>
                <strong>Remark:</strong> {currentReport.remark || "-"}
              </p>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setPreviewOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="antialiased">
      {view === "list" && renderList()}
      {(view === "create" || view === "edit") && renderForm()}
      {previewOpen && renderPreview()}
    </div>
  );
};

export default Report;
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// const API_URL = 'http://localhost:2030/report';

// // Fetch all reports with filtering, sorting, and searching
// export const fetchReports = createAsyncThunk('reports/fetchReports', async (filters = {}, { rejectWithValue }) => {
//   try {
//     const params = new URLSearchParams();
//     if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
//     if (filters.startDate) params.append('startDate', filters.startDate);
//     if (filters.endDate) params.append('endDate', filters.endDate);
//     if (filters.userName) params.append('userName', filters.userName);
//     if (filters.agent) params.append('agent', filters.agent);
//     if (filters.origin) params.append('origin', filters.origin);
//     if (filters.sportName) params.append('sportName', filters.sportName);
//     if (filters.eventName) params.append('eventName', filters.eventName);
//     if (filters.marketName) params.append('marketName', filters.marketName);
//     if (filters.acBalanceMin) params.append('acBalanceMin', filters.acBalanceMin);
//     if (filters.acBalanceMax) params.append('acBalanceMax', filters.acBalanceMax);
//     if (filters.afterVoidBalanceMin) params.append('afterVoidBalanceMin', filters.afterVoidBalanceMin);
//     if (filters.afterVoidBalanceMax) params.append('afterVoidBalanceMax', filters.afterVoidBalanceMax);
//     if (filters.plMin) params.append('plMin', filters.plMin);
//     if (filters.plMax) params.append('plMax', filters.plMax);
//     if (filters.oddsMin) params.append('oddsMin', filters.oddsMin);
//     if (filters.oddsMax) params.append('oddsMax', filters.oddsMax);
//     if (filters.stackMin) params.append('stackMin', filters.stackMin);
//     if (filters.stackMax) params.append('stackMax', filters.stackMax);
//     if (filters.catchBy) params.append('catchBy', filters.catchBy);
//     if (filters.proofType) params.append('proofType', filters.proofType);
//     if (filters.proofStatus) params.append('proofStatus', filters.proofStatus);
//     if (filters.remark) params.append('remark', filters.remark);
//     if (filters.sortKey) params.append('sortKey', filters.sortKey);
//     if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

//     const response = await axios.get(`${API_URL}/all?${params.toString()}`);
//     return response.data.data;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'Error fetching reports');
//   }
// });

// // Create a new report
// export const createReport = createAsyncThunk('reports/createReport', async (reportData, { rejectWithValue }) => {
//   try {
//     const response = await axios.post(`${API_URL}/create`, reportData);
//     return response.data.data;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'Error creating report');
//   }
// });

// // Update an existing report
// export const updateReport = createAsyncThunk('reports/updateReport', async ({ id, data }, { rejectWithValue }) => {
//   try {
//     const response = await axios.put(`${API_URL}/${id}`, data);
//     return response.data.data;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'Error updating report');
//   }
// });

// // Delete a report
// export const deleteReport = createAsyncThunk('reports/deleteReport', async (id, { rejectWithValue }) => {
//   try {
//     await axios.delete(`${API_URL}/${id}`);
//     return id;
//   } catch (error) {
//     return rejectWithValue(error.response?.data?.message || 'Error deleting report');
//   }
// });

// // Import multiple reports
// export const importReports = createAsyncThunk('reports/importReports', async (reportsData, { rejectWithValue }) => {
//   try {
//     const response = await axios.post(`${API_URL}/import`, reportsData);
//     return {
//       message: response.data.message || 'Reports imported successfully',
//       errors: response.data.errors || [],
//       data: response.data.data || [],
//     };
//   } catch (error) {
//     return rejectWithValue({
//       message: error.response?.data?.message || 'Error importing reports',
//       errors: error.response?.data?.errors || [],
//     });
//   }
// });

// // Export reports to Excel
// export const exportReports = createAsyncThunk('reports/exportReports', async (filters = {}, { rejectWithValue }) => {
//   try {
//     const params = new URLSearchParams();
//     if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
//     if (filters.startDate) params.append('startDate', filters.startDate);
//     if (filters.endDate) params.append('endDate', filters.endDate);
//     if (filters.userName) params.append('userName', filters.userName);
//     if (filters.agent) params.append('agent', filters.agent);
//     if (filters.origin) params.append('origin', filters.origin);
//     if (filters.sportName) params.append('sportName', filters.sportName);
//     if (filters.eventName) params.append('eventName', filters.eventName);
//     if (filters.marketName) params.append('marketName', filters.marketName);
//     if (filters.acBalanceMin) params.append('acBalanceMin', filters.acBalanceMin);
//     if (filters.acBalanceMax) params.append('acBalanceMax', filters.acBalanceMax);
//     if (filters.afterVoidBalanceMin) params.append('afterVoidBalanceMin', filters.afterVoidBalanceMin);
//     if (filters.afterVoidBalanceMax) params.append('afterVoidBalanceMax', filters.afterVoidBalanceMax);
//     if (filters.plMin) params.append('plMin', filters.plMin);
//     if (filters.plMax) params.append('plMax', filters.plMax);
//     if (filters.oddsMin) params.append('oddsMin', filters.oddsMin);
//     if (filters.oddsMax) params.append('oddsMax', filters.oddsMax);
//     if (filters.stackMin) params.append('stackMin', filters.stackMin);
//     if (filters.stackMax) params.append('stackMax', filters.stackMax);
//     if (filters.catchBy) params.append('catchBy', filters.catchBy);
//     if (filters.proofType) params.append('proofType', filters.proofType);
//     if (filters.proofStatus) params.append('proofStatus', filters.proofStatus);
//     if (filters.remark) params.append('remark', filters.remark);
//     if (filters.sortKey) params.append('sortKey', filters.sortKey);
//     if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

//     const response = await axios.get(`${API_URL}/exportExcel?${params.toString()}`, {
//       responseType: 'blob',
//     });
//     return response.data;
//   } catch (error) {
//     let errorMessage = 'Failed to export reports to Excel';
//     if (error.response?.status === 404) {
//       errorMessage = 'No reports found to export';
//     } else if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     }
//     return rejectWithValue(errorMessage);
//   }
// });

// const reportSlice = createSlice({
//   name: 'reports',
//   initialState: {
//     reports: [],
//     loading: false,
//     error: null,
//     importSuccess: null,
//     importError: null,
//     exportError: null,
//   },
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//       state.importError = null;
//       state.exportError = null;
//     },
//     clearImportSuccess: (state) => {
//       state.importSuccess = null;
//     },
//     setReports: (state, action) => {
//       state.reports = action.payload;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReports.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reports = action.payload;
//       })
//       .addCase(fetchReports.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(createReport.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(createReport.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reports.push(action.payload);
//       })
//       .addCase(createReport.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(updateReport.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateReport.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.reports.findIndex((report) => report._id === action.payload._id);
//         if (index !== -1) {
//           state.reports[index] = action.payload;
//         }
//       })
//       .addCase(updateReport.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(deleteReport.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteReport.fulfilled, (state, action) => {
//         state.loading = false;
//         state.reports = state.reports.filter((report) => report._id !== action.payload);
//       })
//       .addCase(deleteReport.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(importReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.importError = null;
//         state.importSuccess = null;
//       })
//       .addCase(importReports.fulfilled, (state, action) => {
//         state.loading = false;
//         state.importSuccess = action.payload.message;
//         if (action.payload.errors.length > 0) {
//           state.importError = `Some entries failed to import: ${action.payload.errors.map((e) => e.msg).join('; ')}`;
//         }
//         if (action.payload.data.length > 0) {
//           state.reports = [...state.reports, ...action.payload.data];
//         }
//       })
//       .addCase(importReports.rejected, (state, action) => {
//         state.loading = false;
//         state.importError = action.payload.message;
//         if (action.payload.errors?.length > 0) {
//           state.importError += `: ${action.payload.errors.map((e) => e.msg).join('; ')}`;
//         }
//       })
//       .addCase(exportReports.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.exportError = null;
//       })
//       .addCase(exportReports.fulfilled, (state) => {
//         state.loading = false;
//       })
//       .addCase(exportReports.rejected, (state, action) => {
//         state.loading = false;
//         state.exportError = action.payload;
//       });
//   },
// });

// export const { clearError, clearImportSuccess, setReports } = reportSlice.actions;
// export default reportSlice.reducer;
// export const reportReducer = reportSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:2030/report';

// Fetch all reports with filtering, sorting, and searching
export const fetchReports = createAsyncThunk('reports/fetchReports', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userName) params.append('userName', filters.userName);
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.sportName) params.append('sportName', filters.sportName);
    if (filters.eventName) params.append('eventName', filters.eventName);
    if (filters.marketName) params.append('marketName', filters.marketName);
    if (filters.acBalanceMin) params.append('acBalanceMin', filters.acBalanceMin);
    if (filters.acBalanceMax) params.append('acBalanceMax', filters.acBalanceMax);
    if (filters.afterVoidBalanceMin) params.append('afterVoidBalanceMin', filters.afterVoidBalanceMin);
    if (filters.afterVoidBalanceMax) params.append('afterVoidBalanceMax', filters.afterVoidBalanceMax);
    if (filters.plMin) params.append('plMin', filters.plMin);
    if (filters.plMax) params.append('plMax', filters.plMax);
    if (filters.oddsMin) params.append('oddsMin', filters.oddsMin);
    if (filters.oddsMax) params.append('oddsMax', filters.oddsMax);
    if (filters.stackMin) params.append('stackMin', filters.stackMin);
    if (filters.stackMax) params.append('stackMax', filters.stackMax);
    if (filters.catchBy) params.append('catchBy', filters.catchBy);
    if (filters.proofType) params.append('proofType', filters.proofType);
    if (filters.proofStatus) params.append('proofStatus', filters.proofStatus);
    if (filters.remark) params.append('remark', filters.remark);
    if (filters.sortKey) params.append('sortKey', filters.sortKey);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

    const response = await axios.get(`${API_URL}/all?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching reports');
  }
});

// Create a new report
export const createReport = createAsyncThunk('reports/createReport', async (reportData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/create`, reportData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error creating report');
  }
});

// Update an existing report
export const updateReport = createAsyncThunk('reports/updateReport', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error updating report');
  }
});

// Delete a report
export const deleteReport = createAsyncThunk('reports/deleteReport', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error deleting report');
  }
});

// Import multiple reports
export const importReports = createAsyncThunk('reports/importReports', async (reportsData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/import`, reportsData);
    return {
      message: response.data.message || 'Reports imported successfully',
      errors: response.data.errors || [],
      data: response.data.data || [],
    };
  } catch (error) {
    console.error('importReports error:', error); // Debug log
    const errorPayload = {
      message: error.response?.data?.message || error.message || 'Error importing reports',
      errors: error.response?.data?.errors || [],
    };
    return rejectWithValue(errorPayload);
  }
});

// Export reports to Excel
export const exportReports = createAsyncThunk('reports/exportReports', async (filters = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.userName) params.append('userName', filters.userName);
    if (filters.agent) params.append('agent', filters.agent);
    if (filters.origin) params.append('origin', filters.origin);
    if (filters.sportName) params.append('sportName', filters.sportName);
    if (filters.eventName) params.append('eventName', filters.eventName);
    if (filters.marketName) params.append('marketName', filters.marketName);
    if (filters.acBalanceMin) params.append('acBalanceMin', filters.acBalanceMin);
    if (filters.acBalanceMax) params.append('acBalanceMax', filters.acBalanceMax);
    if (filters.afterVoidBalanceMin) params.append('afterVoidBalanceMin', filters.afterVoidBalanceMin);
    if (filters.afterVoidBalanceMax) params.append('afterVoidBalanceMax', filters.afterVoidBalanceMax);
    if (filters.plMin) params.append('plMin', filters.plMin);
    if (filters.plMax) params.append('plMax', filters.plMax);
    if (filters.oddsMin) params.append('oddsMin', filters.oddsMin);
    if (filters.oddsMax) params.append('oddsMax', filters.oddsMax);
    if (filters.stackMin) params.append('stackMin', filters.stackMin);
    if (filters.stackMax) params.append('stackMax', filters.stackMax);
    if (filters.catchBy) params.append('catchBy', filters.catchBy);
    if (filters.proofType) params.append('proofType', filters.proofType);
    if (filters.proofStatus) params.append('proofStatus', filters.proofStatus);
    if (filters.remark) params.append('remark', filters.remark);
    if (filters.sortKey) params.append('sortKey', filters.sortKey);
    if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

    const response = await axios.get(`${API_URL}/exportExcel?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    let errorMessage = 'Failed to export reports to Excel';
    if (error.response?.status === 404) {
      errorMessage = 'No reports found to export';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    return rejectWithValue(errorMessage);
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    loading: false,
    error: null,
    importSuccess: null,
    importError: null,
    exportError: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.importError = null;
      state.exportError = null;
    },
    clearImportSuccess: (state) => {
      state.importSuccess = null;
    },
    setReports: (state, action) => {
      state.reports = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.push(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex((report) => report._id === action.payload._id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = state.reports.filter((report) => report._id !== action.payload);
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(importReports.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.importError = null;
        state.importSuccess = null;
      })
      .addCase(importReports.fulfilled, (state, action) => {
        state.loading = false;
        state.importSuccess = action.payload.message;
        if (action.payload.errors.length > 0) {
          state.importError = action.payload.errors.map((e) => e.msg).join('\n');
        }
        if (action.payload.data.length > 0) {
          // Merge new reports, avoiding duplicates by _id
          const existingIds = new Set(state.reports.map(r => r._id));
          const newReports = action.payload.data.filter(r => !existingIds.has(r._id));
          state.reports = [...state.reports, ...newReports];
        }
      })
      .addCase(importReports.rejected, (state, action) => {
        state.loading = false;
        // Fallback to a default message if action.payload is undefined
        state.importError = action.payload?.message;
        if (action.payload?.errors?.length > 0) {
          state.importError = action.payload.errors.map((e) => e.msg).join('\n');
        }
      })
      .addCase(exportReports.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.exportError = null;
      })
      .addCase(exportReports.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportReports.rejected, (state, action) => {
        state.loading = false;
        state.exportError = action.payload;
      });
  },
});

export const { clearError, clearImportSuccess, setReports } = reportSlice.actions;
export default reportSlice.reducer;
export const reportReducer = reportSlice.reducer; 
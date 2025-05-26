import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:2030/report';

// Async thunks for API calls
export const fetchReports = createAsyncThunk('reports/fetchReports', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error fetching reports');
  }
});

export const createReport = createAsyncThunk('reports/createReport', async (reportData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/create`, reportData);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error creating report');
  }
});

export const updateReport = createAsyncThunk('reports/updateReport', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error updating report');
  }
});

export const deleteReport = createAsyncThunk('reports/deleteReport', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Error deleting report');
  }
});

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reports
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
      // Create Report
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
      // Update Report
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
      // Delete Report
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
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:2030/sports";

// Fetch all sports
export const fetchAllSports = createAsyncThunk(
  "sports/fetchAllSports",
  async (user, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}?user=${user}`);
      return response.data.sports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch sports");
    }
  }
);

// Create sports
export const createSports = createAsyncThunk(
  "sports/createSports",
  async ({ sportsName, user }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_BASE_URL, { sportsName, user });
      return response.data.sports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create sports");
    }
  }
);

// Update sports
export const updateSports = createAsyncThunk(
  "sports/updateSports",
  async ({ id, sportsName, user }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, { sportsName, user });
      return response.data.sports;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update sports");
    }
  }
);

// Delete sports
export const deleteSports = createAsyncThunk(
  "sports/deleteSports",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete sports");
    }
  }
);

const sportsSlice = createSlice({
  name: "sports",
  initialState: {
    sports: [],
    loading: false,
    error: null,
    message: "",
  },
  reducers: {
    clearMessage: (state) => {
      state.message = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
        state.message = "Sports retrieved successfully";
      })
      .addCase(fetchAllSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports.push(action.payload);
        state.message = "Sports created successfully";
      })
      .addCase(createSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.map((sport) =>
          sport._id === action.payload._id ? action.payload : sport
        );
        state.message = "Sports updated successfully";
      })
      .addCase(updateSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.filter((sport) => sport._id !== action.payload);
        state.message = "Sports deleted successfully";
      })
      .addCase(deleteSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMessage } = sportsSlice.actions;
export default sportsSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:2030/sports";

// Async thunks for CRUD operations
export const fetchSports = createAsyncThunk("sports/fetchSports", async () => {
  const response = await axios.get(API_URL);
  return response.data.data;
});

export const fetchSportById = createAsyncThunk(
  "sports/fetchSportById",
  async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  }
);

export const createSport = createAsyncThunk(
  "sports/createSport",
  async (sportData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, sportData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateSport = createAsyncThunk(
  "sports/updateSport",
  async ({ id, sportData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, sportData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteSport = createAsyncThunk(
  "sports/deleteSport",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const sportsSlice = createSlice({
  name: "sports",
  initialState: {
    sports: [],
    selectedSport: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedSport: (state) => {
      state.selectedSport = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all sports
    builder
      .addCase(fetchSports.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = action.payload;
      })
      .addCase(fetchSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Fetch sport by ID
    builder
      .addCase(fetchSportById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSportById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedSport = action.payload;
      })
      .addCase(fetchSportById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    // Create sport
    builder
      .addCase(createSport.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports.push(action.payload);
      })
      .addCase(createSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create sport";
      });

    // Update sport
    builder
      .addCase(updateSport.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.map((sport) =>
          sport._id === action.payload._id ? action.payload : sport
        );
        state.selectedSport = action.payload;
      })
      .addCase(updateSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update sport";
      });

    // Delete sport
    builder
      .addCase(deleteSport.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSport.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = state.sports.filter((sport) => sport._id !== action.payload);
      })
      .addCase(deleteSport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete sport";
      });
  },
});

export const { clearError, clearSelectedSport } = sportsSlice.actions;
export default sportsSlice.reducer;
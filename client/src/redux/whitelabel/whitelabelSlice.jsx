// src/redux/whitelabel/whitelabelSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Assuming your backend API URL - adjust as needed
const API_URL = "http://localhost:2030";

// Async thunks for API operations
export const fetchWhitelabels = createAsyncThunk(
  "whitelabel/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/whitelabel/all`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch whitelabels"
      );
    }
  }
);

export const fetchWhitelabelById = createAsyncThunk(
  "whitelabel/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/whitelabel/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch whitelabel"
      );
    }
  }
);

export const createWhitelabel = createAsyncThunk(
  "whitelabel/create",
  async (formData, { rejectWithValue }) => {
    try {
      // Use FormData to handle file uploads
      const data = new FormData();
      data.append("whitelabel_user", formData.username);
      data.append("group", formData.group);
      data.append("hexacode", formData.hexacode);
      data.append("url", formData.whitelabelUrl);

      // Only append logo if it exists
      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      const response = await axios.post(`${API_URL}/whitelabel/create`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create whitelabel"
      );
    }
  }
);

export const updateWhitelabel = createAsyncThunk(
  "whitelabel/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const data = new FormData();
      data.append("whitelabel_user", formData.username);
      data.append("group", formData.group);
      data.append("hexacode", formData.hexacode);
      data.append("url", formData.whitelabelUrl);

      // Only append logo if it exists
      if (formData.logo) {
        data.append("logo", formData.logo);
      }

      // Fixed URL path by adding /whitelabel/ to the route
      const response = await axios.put(`${API_URL}/whitelabel/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update whitelabel"
      );
    }
  }
);

export const deleteWhitelabel = createAsyncThunk(
  "whitelabel/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/whitelabel/${id}`);
      return { id, data: response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete whitelabel"
      );
    }
  }
);

const initialState = {
  whitelabels: [],
  currentWhitelabel: null,
  loading: false,
  error: null,
  success: false,
  message: "",
};

const whitelabelSlice = createSlice({
  name: "whitelabel",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch all whitelabels
      .addCase(fetchWhitelabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhitelabels.fulfilled, (state, action) => {
        state.loading = false;
        state.whitelabels = action.payload;
      })
      .addCase(fetchWhitelabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch whitelabel by ID
      .addCase(fetchWhitelabelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWhitelabelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWhitelabel = action.payload;
      })
      .addCase(fetchWhitelabelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create whitelabel
      .addCase(createWhitelabel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createWhitelabel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Whitelabel created successfully";
        state.whitelabels.push(action.payload);
      })
      .addCase(createWhitelabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update whitelabel
      .addCase(updateWhitelabel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateWhitelabel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Whitelabel updated successfully";
        state.whitelabels = state.whitelabels.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
        state.currentWhitelabel = action.payload;
      })
      .addCase(updateWhitelabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete whitelabel
      .addCase(deleteWhitelabel.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteWhitelabel.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = "Whitelabel deleted successfully";
        state.whitelabels = state.whitelabels.filter(
          (item) => item._id !== action.payload.id
        );
        if (
          state.currentWhitelabel &&
          state.currentWhitelabel._id === action.payload.id
        ) {
          state.currentWhitelabel = null;
        }
      })
      .addCase(deleteWhitelabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, resetState } = whitelabelSlice.actions;
export default whitelabelSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:2030/prooftype';

// Fetch all proofs for a user
export const fetchAllProofs = createAsyncThunk(
  'proof/fetchAllProofs',
  async (user, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proofs`, {
        params: { user },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch proofs');
    }
  }
);

// Fetch proof by type
export const fetchProofByType = createAsyncThunk(
  'proof/fetchProofByType',
  async ({ type, user }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proof/${encodeURIComponent(type)}`, {
        params: { user },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch proof');
    }
  }
);

// Update proof notes
export const updateProofContent = createAsyncThunk(
  'proof/updateProofContent',
  async ({ type, notes, user }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/proof/${encodeURIComponent(type)}`, {
        notes,
      }, {
        params: { user },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update proof');
    }
  }
);

const proofSlice = createSlice({
  name: 'proof',
  initialState: {
    proofs: [],
    currentProof: null,
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Proofs
    builder
      .addCase(fetchAllProofs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProofs.fulfilled, (state, action) => {
        state.loading = false;
        state.proofs = action.payload;
      })
      .addCase(fetchAllProofs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Proof By Type
    builder
      .addCase(fetchProofByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProofByType.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProof = action.payload;
      })
      .addCase(fetchProofByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Proof Notes
    builder
      .addCase(updateProofContent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProofContent.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.currentProof = action.payload.proof;
        state.proofs = state.proofs.map((proof) =>
          proof.type === action.payload.proof.type ? action.payload.proof : proof
        );
      })
      .addCase(updateProofContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccess, clearError } = proofSlice.actions;
export default proofSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:2030/prooftype';

// Async thunks for CRUD operations
export const fetchProofs = createAsyncThunk('proof/fetchProofs', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const createProof = createAsyncThunk('proof/createProof', async (proofData, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, proofData);
    return response.data.proof;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const updateProof = createAsyncThunk('proof/updateProof', async ({ id, proofData }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, proofData);
    return response.data.proof;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

export const deleteProof = createAsyncThunk('proof/deleteProof', async (id, { rejectWithValue }) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const proofSlice = createSlice({
  name: 'proof',
  initialState: {
    proofs: [],
    status: 'idle',
    error: null,
    editingProof: null,
  },
  reducers: {
    setEditingProof: (state, action) => {
      state.editingProof = action.payload;
    },
    clearEditingProof: (state) => {
      state.editingProof = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch proofs
      .addCase(fetchProofs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProofs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.proofs = action.payload;
      })
      .addCase(fetchProofs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      // Create proof
      .addCase(createProof.fulfilled, (state, action) => {
        state.proofs.push(action.payload);
        state.error = null;
      })
      .addCase(createProof.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update proof
      .addCase(updateProof.fulfilled, (state, action) => {
        const index = state.proofs.findIndex((proof) => proof._id === action.payload._id);
        if (index !== -1) {
          state.proofs[index] = action.payload;
        }
        state.editingProof = null;
        state.error = null;
      })
      .addCase(updateProof.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete proof
      .addCase(deleteProof.fulfilled, (state, action) => {
        state.proofs = state.proofs.filter((proof) => proof._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProof.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setEditingProof, clearEditingProof, setError } = proofSlice.actions;
export default proofSlice.reducer;

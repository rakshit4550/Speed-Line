import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.baseURL = "http://localhost:2030";

export const fetchProofByType = createAsyncThunk(
  "proofType/fetchProofByType",
  async ({ type, user }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/prooftype/proof/${type}?user=${user}`);
      console.log("fetchProofByType response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "fetchProofByType error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch proof"
      );
    }
  }
);

export const fetchAllProofs = createAsyncThunk(
  "proofType/fetchAllProofs",
  async (user = null, { rejectWithValue }) => {
    try {
      const url = user
        ? `/prooftype/proofs?user=${encodeURIComponent(user)}`
        : `/prooftype/proofs`;
      const response = await axios.get(url);
      console.log("fetchAllProofs response:", response.data);
      const data = Array.isArray(response.data) ? response.data : [];
      const validProofs = data.filter(
        (proof) =>
          proof && typeof proof === "object" && proof.type && proof.user
      );
      if (data.length !== validProofs.length) {
        console.warn(
          "Some proofs were filtered out due to invalid structure:",
          data
        );
      }
      return validProofs;
    } catch (error) {
      console.error(
        "fetchAllProofs error:",
        error.response?.data || error.message
      );
      BIDDER;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch proofs"
      );
    }
  }
);

export const updateProof = createAsyncThunk(
  "proofType/updateProof",
  async ({ type, user, notes }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `/prooftype/proof/${type}?user=${user}`,
        { notes }
      );
      console.log("updateProof response:", response.data);
      return response.data.proof;
    } catch (error) {
      console.error(
        "updateProof error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to update proof"
      );
    }
  }
);

export const deleteProof = createAsyncThunk(
  "proofType/deleteProof",
  async ({ type, user }, { rejectWithValue }) => {
    try {
      await axios.delete(`/prooftype/proof/${type}?user=${user}`);
      console.log("deleteProof success:", { type, user });
      return { type, user };
    } catch (error) {
      console.error(
        "deleteProof error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete proof"
      );
    }
  }
);

export const initializeProofs = createAsyncThunk(
  "proofType/initializeProofs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/prooftype/initialize`);
      console.log("initializeProofs response:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "initializeProofs error:",
        error.response?.data || error.message
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to initialize proofs"
      );
    }
  }
);

export const setPreview = createAsyncThunk(
  "proofType/setPreview",
  async ({ type, user }, { rejectWithValue }) => {
    try {
      const proofResponse = await axios.get(
        `/prooftype/proof/${type}?user=${user}`
      );
      console.log("setPreview response:", proofResponse.data);
      return {
        proof: proofResponse.data,
        whitelabel: { mockData: "This is mock whitelabel data" },
      };
    } catch (error) {
      console.error("setPreview error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch preview"
      );
    }
  }
);

const proofTypeSlice = createSlice({
  name: "proofType",
  initialState: {
    proofs: [],
    preview: null,
    error: null,
    loading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Proof By Type
      .addCase(fetchProofByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProofByType.fulfilled, (state, action) => {
        state.loading = false;
        const existingProof = state.proofs.find(
          (proof) =>
            proof.type === action.payload.type &&
            proof.user === action.payload.user
        );
        if (!existingProof) {
          state.proofs = [...state.proofs, action.payload];
        } else {
          state.proofs = state.proofs.map((proof) =>
            proof.type === action.payload.type &&
            proof.user === action.payload.user
              ? action.payload
              : proof
          );
        }
        state.error = null;
      })
      .addCase(fetchProofByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch All Proofs
      .addCase(fetchAllProofs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProofs.fulfilled, (state, action) => {
        state.loading = false;
        state.proofs = action.payload;
        state.error = null;
      })
      .addCase(fetchAllProofs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.proofs = [];
      })
      // Update Proof
      .addCase(updateProof.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProof.fulfilled, (state, action) => {
        state.loading = false;
        state.proofs = state.proofs.map((proof) =>
          proof.type === action.payload.type &&
          proof.user === action.payload.user
            ? action.payload
            : proof
        );
        state.error = null;
      })
      .addCase(updateProof.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Proof
      .addCase(deleteProof.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProof.fulfilled, (state, action) => {
        state.loading = false;
        state.proofs = state.proofs.filter(
          (proof) =>
            !(
              proof.type === action.payload.type &&
              proof.user === action.payload.user
            )
        );
        state.error = null;
      })
      .addCase(deleteProof.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Initialize Proofs
      .addCase(initializeProofs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeProofs.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(initializeProofs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Set Preview
      .addCase(setPreview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setPreview.fulfilled, (state, action) => {
        state.loading = false;
        state.preview = action.payload;
        state.error = null;
      })
      .addCase(setPreview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = proofTypeSlice.actions;
export default proofTypeSlice.reducer;
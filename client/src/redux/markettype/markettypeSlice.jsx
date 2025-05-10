// // src/redux/proof/proofSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";

// // API URL - adjust as needed
// const API_URL = "http://localhost:2030";

// // Async thunks for API operations
// export const fetchAllProofs = createAsyncThunk(
//   "proof/fetchAll",
//   async (user, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_URL}/proof/all?user=${user}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to fetch proofs");
//     }
//   }
// );

// export const fetchProofByType = createAsyncThunk(
//   "proof/fetchByType",
//   async ({ type, user }, { rejectWithValue }) => {
//     try {
//       const response = await axios.get(`${API_URL}/proof/${type}?user=${user}`);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || "Failed to fetch proof");
//     }
//   }
// );

// export const updateProofContent = createAsyncThunk(
//   "proof/updateContent",
//   async ({ type, content, user }, { rejectWithValue }) => {
//     try {
//       const response = await axios.put(
//         `${API_URL}/proof/${type}`,
//         { content, user },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(
//         error.response?.data || "Failed to update proof content"
//       );
//     }
//   }
// );

// const initialState = {
//   proofs: [],
//   currentProof: null,
//   loading: false,
//   error: null,
//   success: false,
//   message: "",
// };

// const proofSlice = createSlice({
//   name: "proof",
//   initialState,
//   reducers: {
//     clearError: (state) => {
//       state.error = null;
//     },
//     clearSuccess: (state) => {
//       state.success = false;
//       state.message = "";
//     },
//     resetState: () => initialState,
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch all proofs
//       .addCase(fetchAllProofs.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAllProofs.fulfilled, (state, action) => {
//         state.loading = false;
//         state.proofs = action.payload;
//       })
//       .addCase(fetchAllProofs.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Fetch proof by type
//       .addCase(fetchProofByType.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchProofByType.fulfilled, (state, action) => {
//         state.loading = false;
//         state.currentProof = action.payload;
//       })
//       .addCase(fetchProofByType.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })

//       // Update proof content
//       .addCase(updateProofContent.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//         state.success = false;
//       })
//       .addCase(updateProofContent.fulfilled, (state, action) => {
//         state.loading = false;
//         state.success = true;
//         state.message = "Proof content updated successfully";
//         state.currentProof = action.payload.proof;

//         // Update the proof in the proofs array as well
//         state.proofs = state.proofs.map((proof) =>
//           proof.type === action.payload.proof.type
//             ? action.payload.proof
//             : proof
//         );
//       })
//       .addCase(updateProofContent.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//         state.success = false;
//       });
//   },
// });

// export const { clearError, clearSuccess, resetState } = proofSlice.actions;
// export default proofSlice.reducer;


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

// Update proof content
export const updateProofContent = createAsyncThunk(
  'proof/updateProofContent',
  async ({ type, content, user }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/proof/${encodeURIComponent(type)}`, {
        content,
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

    // Update Proof Content
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
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:2030"; // Replace with your API

export const fetchProofTypes = createAsyncThunk(
  "proofTypes/fetchAll",
  async () => {
    const res = await axios.get(API_URL);
    return res.data;
  }
);

export const createProofType = createAsyncThunk(
  "proofTypes/create",
  async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  }
);

export const updateProofType = createAsyncThunk(
  "proofTypes/update",
  async ({ id, data }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  }
);

export const deleteProofType = createAsyncThunk(
  "proofTypes/delete",
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

const proofTypesSlice = createSlice({
  name: "proofTypes",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProofTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProofTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchProofTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createProofType.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateProofType.fulfilled, (state, action) => {
        const index = state.list.findIndex(
          (item) => item._id === action.payload._id
        );
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(deleteProofType.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.payload);
      });
  },
});

export default proofTypesSlice.reducer;

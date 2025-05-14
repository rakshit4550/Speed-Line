import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:2030/market';

// Fetch all markets
export const fetchMarkets = createAsyncThunk('markets/fetchMarkets', async () => {
  const response = await axios.get(`${API_URL}/all`);
  return response.data.data;
});

// Add a new market
export const addMarket = createAsyncThunk('markets/addMarket', async (marketName) => {
  const response = await axios.post(`${API_URL}/add`, { marketName });
  return response.data.data;
});

// Update a market
export const updateMarket = createAsyncThunk('markets/updateMarket', async ({ id, marketName }) => {
  const response = await axios.put(`${API_URL}/${id}`, { marketName });
  return response.data.data;
});

// Delete a market
export const deleteMarket = createAsyncThunk('markets/deleteMarket', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const marketSlice = createSlice({
  name: 'markets',
  initialState: {
    markets: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarkets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarkets.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = action.payload;
      })
      .addCase(fetchMarkets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addMarket.fulfilled, (state, action) => {
        state.markets.push(action.payload);
      })
      .addCase(updateMarket.fulfilled, (state, action) => {
        const index = state.markets.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.markets[index] = action.payload;
        }
      })
      .addCase(deleteMarket.fulfilled, (state, action) => {
        state.markets = state.markets.filter(m => m._id !== action.payload);
      });
  },
});

export default marketSlice.reducer;
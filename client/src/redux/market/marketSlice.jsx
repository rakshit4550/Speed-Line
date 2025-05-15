import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API Service
const API_URL = 'http://localhost:2030/market';

const createMarketApi = async (marketData) => {
  const response = await axios.post(`${API_URL}/add`, marketData, {
    withCredentials: true,
  });
  return response.data;
};

const getAllMarketsApi = async () => {
  const response = await axios.get(`${API_URL}/all`, {
    withCredentials: true,
  });
  return response.data;
};

const getMarketByIdApi = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

const updateMarketApi = async (id, marketData) => {
  const response = await axios.put(`${API_URL}/${id}`, marketData, {
    withCredentials: true,
  });
  return response.data;
};

const deleteMarketApi = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

// Async Thunks
export const createMarket = createAsyncThunk(
  'market/createMarket',
  async (marketData, { rejectWithValue }) => {
    try {
      const response = await createMarketApi(marketData);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getAllMarkets = createAsyncThunk(
  'market/getAllMarkets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllMarketsApi();
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getMarketById = createAsyncThunk(
  'market/getMarketById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getMarketByIdApi(id);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMarket = createAsyncThunk(
  'market/updateMarket',
  async ({ id, marketData }, { rejectWithValue }) => {
    try {
      const response = await updateMarketApi(id, marketData);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteMarket = createAsyncThunk(
  'market/deleteMarket',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteMarketApi(id);
      if (!response.success) {
        return rejectWithValue(response);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Redux Slice
const initialState = {
  markets: [],
  selectedMarket: null,
  loading: false,
  error: null,
  successMessage: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Market
      .addCase(createMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.markets.push(action.payload.data);
        state.successMessage = action.payload.message;
      })
      .addCase(createMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Get All Markets
      .addCase(getAllMarkets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMarkets.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = action.payload.data;
      })
      .addCase(getAllMarkets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Get Market By ID
      .addCase(getMarketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarketById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMarket = action.payload.data;
      })
      .addCase(getMarketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Update Market
      .addCase(updateMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = state.markets.map((market) =>
          market._id === action.payload.data._id ? action.payload.data : market
        );
        state.selectedMarket = null;
        state.successMessage = action.payload.message;
      })
      .addCase(updateMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      // Delete Market
      .addCase(deleteMarket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteMarket.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = state.markets.filter((market) => market._id !== action.meta.arg);
        state.successMessage = action.payload.message;
      })
      .addCase(deleteMarket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export const { clearMessages } = marketSlice.actions;
export default marketSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const CLIENT_API_BASE_URL = 'http://localhost:2030/client';

// Async thunks for API calls
export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${CLIENT_API_BASE_URL}/create`, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create client');
    }
  }
);

export const getAllClients = createAsyncThunk(
  'clients/getAllClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
);

export const getClientById = createAsyncThunk(
  'clients/getClientById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch client');
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, clientData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${CLIENT_API_BASE_URL}/${id}`, clientData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update client');
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${CLIENT_API_BASE_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete client');
    }
  }
);

export const getAllWhitelabels = createAsyncThunk(
  'clients/getAllWhitelabels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/whitelabels`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch whitelabel users');
    }
  }
);

export const getProofTypes = createAsyncThunk(
  'clients/getProofTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/prooftypes`);
      console.log('ProofTypes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getProofTypes error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch proof types');
    }
  }
);

export const getSports = createAsyncThunk(
  'clients/getSports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/sports`);
      console.log('Sports response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getSports error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sports');
    }
  }
);

export const getMarkets = createAsyncThunk(
  'clients/getMarkets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${CLIENT_API_BASE_URL}/markets`);
      console.log('Markets response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getMarkets error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch markets');
    }
  }
);

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    selectedClient: null,
    whitelabelUsers: [],
    proofTypes: [],
    sports: [],
    markets: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(getClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.map((client) =>
          client._id === action.payload._id ? action.payload : client
        );
        state.selectedClient = action.payload;
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter((client) => client._id !== action.payload);
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getAllWhitelabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWhitelabels.fulfilled, (state, action) => {
        state.loading = false;
        state.whitelabelUsers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getAllWhitelabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.whitelabelUsers = [];
      })
      .addCase(getProofTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProofTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.proofTypes = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getProofTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.proofTypes = [];
      })
      .addCase(getSports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSports.fulfilled, (state, action) => {
        state.loading = false;
        state.sports = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getSports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.sports = [];
      })
      .addCase(getMarkets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMarkets.fulfilled, (state, action) => {
        state.loading = false;
        state.markets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMarkets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.markets = [];
      });
  },
});

export const { clearError, clearSelectedClient } = clientSlice.actions;
export default clientSlice.reducer;
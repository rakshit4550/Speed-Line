import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:2030/client';

export const fetchClients = createAsyncThunk('clients/fetchClients', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch clients');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchClientById = createAsyncThunk('clients/fetchClientById', async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch client');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const createClient = createAsyncThunk('clients/createClient', async (clientData, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      body: clientData, // FormData
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData) || 'Failed to create client');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const updateClient = createAsyncThunk('clients/updateClient', async ({ id, clientData }, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      body: clientData, // FormData
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData) || 'Failed to update client');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const deleteClient = createAsyncThunk('clients/deleteClient', async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete client');
    }
    return id;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchWhitelabels = createAsyncThunk('clients/fetchWhitelabels', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/whitelabels`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch whitelabels');
    }
    const data = await response.json();
    return data.data; // Backend returns { message, data }
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchProofTypes = createAsyncThunk('clients/fetchProofTypes', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/prooftypes`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch proof types');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchSports = createAsyncThunk('clients/fetchSports', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/sports`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch sports');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

export const fetchMarkets = createAsyncThunk('clients/fetchMarkets', async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/markets`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch markets');
    }
    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    currentClient: null,
    whitelabels: [],
    proofTypes: [],
    sports: [],
    markets: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetCurrentClient: (state) => {
      state.currentClient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.currentClient = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.clients.push(action.payload);
        state.status = 'succeeded';
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        const index = state.clients.findIndex((client) => client._id === action.payload._id);
        if (index !== -1) state.clients[index] = action.payload;
        state.status = 'succeeded';
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.clients = state.clients.filter((client) => client._id !== action.payload);
        state.status = 'succeeded';
      })
      .addCase(fetchWhitelabels.fulfilled, (state, action) => {
        state.whitelabels = action.payload;
      })
      .addCase(fetchProofTypes.fulfilled, (state, action) => {
        state.proofTypes = action.payload;
      })
      .addCase(fetchSports.fulfilled, (state, action) => {
        state.sports = action.payload;
      })
      .addCase(fetchMarkets.fulfilled, (state, action) => {
        state.markets = action.payload;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.error = action.payload || action.error.message;
        }
      );
  },
});

export const { resetCurrentClient } = clientSlice.actions;
export default clientSlice.reducer;
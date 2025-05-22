
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// const API_BASE_URL = 'http://localhost:2030/client';

// // Async thunks for API calls
// export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
//   const response = await fetch(`${API_BASE_URL}/`);
//   return await response.json();
// });

// export const fetchClientById = createAsyncThunk('clients/fetchClientById', async (id) => {
//   const response = await fetch(`${API_BASE_URL}/${id}`);
//   return await response.json();
// });

// export const createClient = createAsyncThunk('clients/createClient', async (clientData) => {
//   const response = await fetch(`${API_BASE_URL}/create`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(clientData),
//   });
//   return await response.json();
// });

// export const updateClient = createAsyncThunk('clients/updateClient', async ({ id, clientData }) => {
//   const response = await fetch(`${API_BASE_URL}/${id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(clientData),
//   });
//   return await response.json();
// });

// export const deleteClient = createAsyncThunk('clients/deleteClient', async (id) => {
//   await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
//   return id;
// });

// export const fetchWhitelabels = createAsyncThunk('clients/fetchWhitelabels', async () => {
//   const response = await fetch(`${API_BASE_URL}/whitelabels`);
//   return await response.json();
// });

// export const fetchProofTypes = createAsyncThunk('clients/fetchProofTypes', async () => {
//   const response = await fetch(`${API_BASE_URL}/prooftypes`);
//   return await response.json();
// });

// export const fetchProofByType = createAsyncThunk('clients/fetchProofByType', async (type) => {
//   const response = await fetch(`${API_BASE_URL}/prooftypes`);
//   const proofs = await response.json();
//   const proof = proofs.find((p) => p.type.toLowerCase() === type.toLowerCase());
//   if (!proof) {
//     throw new Error('Proof not found for the selected type');
//   }
//   return proof;
// });

// export const fetchSports = createAsyncThunk('clients/fetchSports', async () => {
//   const response = await fetch(`${API_BASE_URL}/sports`);
//   return await response.json();
// });

// export const fetchMarkets = createAsyncThunk('clients/fetchMarkets', async () => {
//   const response = await fetch(`${API_BASE_URL}/markets`);
//   return await response.json();
// });

// const clientSlice = createSlice({
//   name: 'clients',
//   initialState: {
//     clients: [],
//     currentClient: null,
//     whitelabels: [],
//     proofTypes: [],
//     selectedProof: null,
//     sports: [],
//     markets: [],
//     status: 'idle',
//     error: null,
//   },
//   reducers: {
//     resetCurrentClient: (state) => {
//       state.currentClient = null;
//       state.selectedProof = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchClients.fulfilled, (state, action) => {
//         state.clients = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(fetchClientById.fulfilled, (state, action) => {
//         state.currentClient = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(createClient.fulfilled, (state, action) => {
//         state.clients.push(action.payload);
//         state.status = 'succeeded';
//       })
//       .addCase(updateClient.fulfilled, (state, action) => {
//         const index = state.clients.findIndex((client) => client._id === action.payload._id);
//         if (index !== -1) state.clients[index] = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(deleteClient.fulfilled, (state, action) => {
//         state.clients = state.clients.filter((client) => client._id !== action.payload);
//         state.status = 'succeeded';
//       })
//       .addCase(fetchWhitelabels.fulfilled, (state, action) => {
//         state.whitelabels = action.payload.data;
//       })
//       .addCase(fetchProofTypes.fulfilled, (state, action) => {
//         state.proofTypes = action.payload;
//       })
//       .addCase(fetchProofByType.fulfilled, (state, action) => {
//         state.selectedProof = action.payload;
//         state.status = 'succeeded';
//       })
//       .addCase(fetchSports.fulfilled, (state, action) => {
//         state.sports = action.payload;
//       })
//       .addCase(fetchMarkets.fulfilled, (state, action) => {
//         state.markets = action.payload;
//       })
//       .addMatcher(
//         (action) => action.type.endsWith('/pending'),
//         (state) => {
//           state.status = 'loading';
//         }
//       )
//       .addMatcher(
//         (action) => action.type.endsWith('/rejected'),
//         (state, action) => {
//           state.status = 'failed';
//           state.error = action.error.message;
//         }
//       );
//   },
// });

// export const { resetCurrentClient } = clientSlice.actions;
// export default clientSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'http://localhost:2030/client';

// Async thunks for API calls
export const fetchClients = createAsyncThunk('clients/fetchClients', async () => {
  const response = await fetch(`${API_BASE_URL}/`);
  return await response.json();
});

export const fetchClientById = createAsyncThunk('clients/fetchClientById', async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  return await response.json();
});

export const createClient = createAsyncThunk('clients/createClient', async (clientData) => {
  const response = await fetch(`${API_BASE_URL}/create`, {
    method: 'POST',
    body: clientData, // FormData is sent directly
  });
  return await response.json();
});

export const updateClient = createAsyncThunk('clients/updateClient', async ({ id, clientData }) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    body: clientData, // FormData is sent directly
  });
  return await response.json();
});

export const deleteClient = createAsyncThunk('clients/deleteClient', async (id) => {
  await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  return id;
});

export const fetchWhitelabels = createAsyncThunk('clients/fetchWhitelabels', async () => {
  const response = await fetch(`${API_BASE_URL}/whitelabels`);
  return await response.json();
});

export const fetchProofTypes = createAsyncThunk('clients/fetchProofTypes', async () => {
  const response = await fetch(`${API_BASE_URL}/prooftypes`);
  return await response.json();
});

export const fetchProofByType = createAsyncThunk('clients/fetchProofByType', async (type) => {
  const response = await fetch(`${API_BASE_URL}/prooftypes`);
  const proofs = await response.json();
  const proof = proofs.find((p) => p.type.toLowerCase() === type.toLowerCase());
  if (!proof) {
    throw new Error('Proof not found for the selected type');
  }
  return proof;
});

export const fetchSports = createAsyncThunk('clients/fetchSports', async () => {
  const response = await fetch(`${API_BASE_URL}/sports`);
  return await response.json();
});

export const fetchMarkets = createAsyncThunk('clients/fetchMarkets', async () => {
  const response = await fetch(`${API_BASE_URL}/markets`);
  return await response.json();
});

const clientSlice = createSlice({
  name: 'clients',
  initialState: {
    clients: [],
    currentClient: null,
    whitelabels: [],
    proofTypes: [],
    selectedProof: null,
    sports: [],
    markets: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    resetCurrentClient: (state) => {
      state.currentClient = null;
      state.selectedProof = null;
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
        state.whitelabels = action.payload.data;
      })
      .addCase(fetchProofTypes.fulfilled, (state, action) => {
        state.proofTypes = action.payload;
      })
      .addCase(fetchProofByType.fulfilled, (state, action) => {
        state.selectedProof = action.payload;
        state.status = 'succeeded';
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
          state.error = action.error.message;
        }
      );
  },
});

export const { resetCurrentClient } = clientSlice.actions;
export default clientSlice.reducer;
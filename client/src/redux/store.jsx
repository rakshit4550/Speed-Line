import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";

import sportsReducer from "./sports/sportsSlice";

import proofTypeReducer from "./proofType/proofTypeSlice";

export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
   
    sports: sportsReducer,
    proofType: proofTypeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling FormData
    }),
});

export default store;

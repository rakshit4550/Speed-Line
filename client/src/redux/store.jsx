import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
import sportsReducer from "./sports/sportsSlice";
import proofTypeReducer from "./proofType/proofTypeSlice"; 
import marketReducer from "./market/marketSlice"; 

export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
    sports: sportsReducer,
    proof: proofTypeReducer,
    market : marketReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export default store;
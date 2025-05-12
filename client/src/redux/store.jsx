import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
import proofReducer from "./markettype/markettypeSlice";
import sportsReducer from "./sports/sportsSlice";


export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
    proof: proofReducer,
    sports: sportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling FormData
    }),
});

export default store;

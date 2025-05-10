import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
import proofReducer from "./markettype/markettypeSlice";

export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
    proof: proofReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling FormData
    }),
});

export default store;

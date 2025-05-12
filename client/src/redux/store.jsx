import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
import proofTypeReducer from "./proofType/proofTypeSlice";

export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,

    proofType: proofTypeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling FormData
    }),
});

export default store;

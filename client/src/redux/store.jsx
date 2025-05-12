import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
<<<<<<< HEAD
import proofReducer from "./markettype/markettypeSlice";
import sportsReducer from "./sports/sportsSlice";

=======
import proofTypeReducer from "./proofType/proofTypeSlice";
>>>>>>> 78da85c57eb085160a6a5a59b1918f2381aa3733

export const store = configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
<<<<<<< HEAD
    proof: proofReducer,
    sports: sportsReducer,
=======

    proofType: proofTypeReducer,
>>>>>>> 78da85c57eb085160a6a5a59b1918f2381aa3733
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For handling FormData
    }),
});

export default store;

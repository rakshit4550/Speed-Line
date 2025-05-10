import { configureStore } from "@reduxjs/toolkit";
import whitelabelReducer from "./whitelabel/whitelabelSlice";
import proofTypesReducer from "./markettype/markettypeSlice";

export default configureStore({
  reducer: {
    whitelabel: whitelabelReducer,
    proofTypes: proofTypesReducer,
  },
});

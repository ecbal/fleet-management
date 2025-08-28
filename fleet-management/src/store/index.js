// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import selectionReducer from "./selectionSlice";

export const store = configureStore({
  reducer: {
    selection: selectionReducer,
  }
});

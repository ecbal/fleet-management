import { createSlice } from "@reduxjs/toolkit";

const selectionSlice = createSlice({
  name: "selection",
  initialState: {
    selectedStopIds: [],
    selectedVehicleIds: [],
    selectedRouteIds: [],
  },
  reducers: {
    toggleStopId(state, action) {
      const id = action.payload;

      if (state.selectedStopIds.includes(id)) {
        state.selectedStopIds = state.selectedStopIds.filter(sid => sid !== id);
      } else {
        state.selectedStopIds.push(id);
      }
      console.log([...state.selectedStopIds])
    },
    setAllStopIds(state, action) {
      state.selectedStopIds = action.payload;
    },
    clearAllStopIds(state) {
      state.selectedStopIds = [];
    },


    toggleVehicleId(state, action) {
      const id = action.payload;
      if (state.selectedVehicleIds.includes(id)) {
        state.selectedVehicleIds = state.selectedVehicleIds.filter(vid => vid !== id);
      } else {
        state.selectedVehicleIds.push(id);
      }
      console.log([...state.selectedVehicleIds])
    },
    setAllVehicleIds(state, action) {
      state.selectedVehicleIds = action.payload;
    },
    clearAllVehicleIds(state) {
      state.selectedVehicleIds = [];
    },

    toggleRoutesId(state, action) {
      const id = action.payload;
      if (state.selectedRouteIds.includes(id)) {
        state.selectedRouteIds = state.selectedRouteIds.filter(rid => rid !== id);
      }
      else {
        state.selectedRouteIds.push(id);
      }
      console.log([...state.selectedRouteIds])
    }
  }
});

export const { toggleStopId, setAllStopIds, clearAllStopIds, toggleVehicleId, setAllVehicleIds, clearAllVehicleIds,toggleRoutesId } = selectionSlice.actions;
export default selectionSlice.reducer;

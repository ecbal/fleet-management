import { createSlice } from "@reduxjs/toolkit";

const selectionSlice = createSlice({
  name: "selection",
  initialState: {
    selectedStopIds: [],
     selectedVehicleIds: [],
  },
  reducers: {
    toggleStopId(state, action) {
      const id = action.payload;
      if (state.selectedStopIds.includes(id)) {
        state.selectedStopIds = state.selectedStopIds.filter(sid => sid !== id);
      } else {
        state.selectedStopIds.push(id);
      }
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
  },
  setAllVehicleIds(state, action) {
    state.selectedVehicleIds = action.payload;
  },
  clearAllVehicleIds(state) {
    state.selectedVehicleIds = [];
  }

  }
});

export const { toggleStopId, setAllStopIds, clearAllStopIds,toggleVehicleId,setAllVehicleIds,clearAllVehicleIds } = selectionSlice.actions;
export default selectionSlice.reducer;

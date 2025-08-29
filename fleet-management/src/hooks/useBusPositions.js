import { useEffect } from "react";
import { busSocket } from "../lib/busSocket";
import { useDispatch } from "react-redux";
import { updateVehiclePositions } from "../store/mapSlice";

export default function useBusPositions() {
  const dispatch = useDispatch();
  useEffect(() => {
    const onUpdate = (arr) => {
      dispatch(updateVehiclePositions(arr));
    };
    busSocket.on("bus_positions", onUpdate);
    return () => busSocket.off("bus_positions", onUpdate);
  }, [dispatch]);
}

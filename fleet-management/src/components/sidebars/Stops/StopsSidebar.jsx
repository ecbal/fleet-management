import React, { useEffect, useRef, useState, useCallback } from 'react'
import './StopsSidebar.css'
import SearchBar from '../../ui/SearchBar/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from "react-redux";
import { toggleStopId, setAllStopIds, clearAllStopIds } from "../../../store/mapSlice";



const StopsSidebar = ({ onCloseBtn, stops, stopsLoading, stopsHasMore, onSearch, onPageEnd, stopsSearchQuery }) => {
  const dispatch = useDispatch();
  const selectedStopIds = useSelector(state => state.map.selectedStopIds);
  const stopsObserver = useRef();
  const [stopsMinimized, setStopsMinimized] = useState(false);
  const [allStopsIds, setAllStopsIds] = useState(0);
  const [allStopsCount, setAllStopsCount] = useState(0);

  const sentinelRef = useCallback(node => {
    if (stopsLoading) return;
    if (stopsObserver.current) stopsObserver.current.disconnect();

    stopsObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && stopsHasMore) {
        onPageEnd();
      }
    });

    if (node) stopsObserver.current.observe(node);
  }, [stopsLoading, stopsHasMore]);

  useEffect(() => {
  setAllStopsIds([]);
}, [stopsSearchQuery]);

  const handleSelectAll = async (e) => {
    const isChecked = e.target.checked;
    const query = stopsSearchQuery?.trim();

    if (isChecked) {
      const url = query
        ? `http://localhost:8080/stops/ids?search=${encodeURIComponent(query)}`
        : "http://localhost:8080/stops/ids";

      try {
        const res = await fetch(url);
        const data = await res.json();

        setAllStopsIds(data.stopIds);
        setAllStopsCount(data.totalCount);
        dispatch(setAllStopIds(data.stopIds));
      } catch (err) {
        console.error("Durak ID'leri alınamadı:", err);
        alert("Duraklar alınırken hata oluştu.");
      }
    } else {
      dispatch(clearAllStopIds());
    }
  };


  const handleRowCheckbox = (stop_id) => {
    dispatch(toggleStopId(stop_id));
  };

  const query = stopsSearchQuery?.trim();
  const allSelected =
    query
      ? selectedStopIds.length > 0 &&
      stops.every((s) => selectedStopIds.includes(s.stop_id))
      : selectedStopIds.length > 0 &&
      selectedStopIds.length === allStopsIds.length;


  return (
    <div className={`stops-sidebar-container ${stopsMinimized ? "minimized" : ""}`}>
      <div className="stops-header">
        <h2>Stops</h2>
        <div className="top-buttons">
          {stopsMinimized && <FontAwesomeIcon
            icon={faUpRightAndDownLeftFromCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setStopsMinimized(!stopsMinimized)}>
          </FontAwesomeIcon>}
          {!stopsMinimized && <FontAwesomeIcon
            icon={faDownLeftAndUpRightToCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setStopsMinimized(!stopsMinimized)}>
          </FontAwesomeIcon>}
          <FontAwesomeIcon
            icon={faXmark}
            size='lg'
            className='close-btn'
            onClick={() => onCloseBtn('home')}
          ></FontAwesomeIcon>
        </div>
      </div>
      <div className="search-bar">
        <SearchBar
          placeholder='Durak Ara...'
          value={stopsSearchQuery}
          onChange={onSearch}
        /></div>
      <div className="stops-table-div">
        <table className='stops-table'>
          <thead>
            <tr>
              <th><input
                type="checkbox"
                onChange={handleSelectAll}
                checked={allSelected}
              /></th>
              <th>ID</th>
              <th>Durak Adı</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s, index) => {
              const EARLY_TRIGGER_INDEX = Math.max(0, stops.length - 50);
              const isTriggerRow = index === EARLY_TRIGGER_INDEX;
              const checked = selectedStopIds.includes(s.stop_id);

              return (
                <tr key={s.stop_id} ref={isTriggerRow ? sentinelRef : null} onClick={() => handleRowCheckbox(s.stop_id)}>
                  <td><input
                    type="checkbox"
                    checked={checked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => handleRowCheckbox(s.stop_id)} /></td>
                  <td>{s.stop_id}</td>
                  <td>{s.stop_name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StopsSidebar
import React, { useEffect, useRef, useState, useCallback } from 'react'
import './StopsSidebar.css'
import SearchBar from '../../ui/SearchBar/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'
import { useDispatch, useSelector } from "react-redux";
import { toggleStopId, setAllStopIds, clearAllStopIds } from "../../../store/selectionSlice";



const StopsSidebar = ({ onCloseBtn, stops, stopsLoading, stopsHasMore, onSearch, onPageEnd, stopsSearchQuery }) => {
  const dispatch = useDispatch();
  const selectedStopIds = useSelector(state => state.selection.selectedStopIds);
  const stopsObserver = useRef();
  const [stopsMinimized, setStopsMinimized] = useState(false);
  const [allStopsIds,setAllStopsIds]=useState(0);

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

  const handleSelectAll = async (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const res = await fetch("http://localhost:8080/stops/ids");
      const data = await res.json();
      setAllStopsIds(data.stopIds);
      dispatch(setAllStopIds(data.stopIds)); // örnek: { stopIds: [1,2,3] }
    } else {
      dispatch(clearAllStopIds());
    }
  };


  const handleRowCheckbox = (stop_id) => {
    dispatch(toggleStopId(stop_id));
  };

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
                checked={selectedStopIds.length === allStopsIds.length}
              /></th>
              <th>ID</th>
              <th>Durak Adı</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s, index) => {
              const EARLY_TRIGGER_INDEX = Math.max(0, stops.length - 40);
              const isTriggerRow = index === EARLY_TRIGGER_INDEX;
              const checked = selectedStopIds.includes(s.stop_id);

              return (
                <tr key={s.stop_id} ref={isTriggerRow ? sentinelRef : null} onClick={() => handleRowCheckbox(s.stop_id)}> 
                  <td><input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleRowCheckbox(s.stop_id)}/></td>
                    
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
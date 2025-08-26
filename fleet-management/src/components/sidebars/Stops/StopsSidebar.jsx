import React, { useEffect, useRef, useState, useCallback } from 'react'
import './StopsSidebar.css'
import SearchBar from '../../ui/SearchBar/SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'



const StopsSidebar = ({ onCloseBtn}) => {
  const [stops, setStops] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const [searchQuery, setSearchQuery] = useState("");
  const [stopsMinimized, setStopsMinimized] = useState(false);



  const fetchStops = async (currentPage, currentSearchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/stops?page=${currentPage}&pageSize=200&search=${encodeURIComponent(currentSearchQuery)}`
      );
      const data = await res.json();
      console.log(data);


      setStops(prev => {
        const merged = [...prev, ...data.stops];

        // Aynı stop_id'ye sahip olanları dışla → sadece ilkini al
        const uniqueStops = Array.from(
          new Map(merged.map(stop => [stop.stop_id, stop])).values()
        );

        return uniqueStops;
      });
      setHasMore(data.stops.length > 0);
    } catch (error) {
      console.error("Duraklar alinamadi: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStops(page, searchQuery);
  }, [page, searchQuery])


  const sentinelRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1);
    setStops([]);
  }

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
          value={searchQuery}
          onChange={handleSearchChange}
        /></div>
      <div className="stops-table-div">
        <table className='stops-table'>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>ID</th>
              <th>Durak Adı</th>
            </tr>
          </thead>
          <tbody>
            {stops.map((s, index) => {
              const EARLY_TRIGGER_INDEX = Math.max(0, stops.length - 100);
              const isTriggerRow = index === EARLY_TRIGGER_INDEX;
              return (
                <tr key={s.stop_id} ref={isTriggerRow ? sentinelRef : null}>
                  <td><input type="checkbox" /></td>
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
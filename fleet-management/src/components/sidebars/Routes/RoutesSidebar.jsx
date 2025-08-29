import { useState, useEffect } from 'react'
import './RoutesSidebar.css'
import SearchBar from '../../ui/SearchBar/SearchBar.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from "react-redux";
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'
import { toggleRoutesId } from "../../../store/mapSlice.js";

const RoutesSidebar = ({ onCloseBtn }) => {
  const dispatch = useDispatch();
  const [routes, setRoutes] = useState([]);
  const [routesMinimized, setRoutesMinimized] = useState(false);
  const selectedRouteIds = useSelector(state => state.map.selectedRouteIds);

  useEffect(() => {
    fetch("http://localhost:8080/routes")
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error("Hat verisi alinamadi: ", err))
  }, []);



  const handleRowCheckbox = (route_id) => {
    dispatch(toggleRoutesId(route_id));
  };


  return (
    <div className={`routes-sidebar-container ${routesMinimized ? "minimized" : ""}`}>
      <div className='routes-header'>
        <h2>Routes</h2>
        <div className="top-buttons">
          {routesMinimized && <FontAwesomeIcon
            icon={faUpRightAndDownLeftFromCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setRoutesMinimized(!routesMinimized)}>
          </FontAwesomeIcon>}
          {!routesMinimized && <FontAwesomeIcon
            icon={faDownLeftAndUpRightToCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setRoutesMinimized(!routesMinimized)}>
          </FontAwesomeIcon>}
          <FontAwesomeIcon
            icon={faXmark}
            size='lg'
            className='close-btn'
            onClick={() => onCloseBtn('home')}
          ></FontAwesomeIcon>
        </div>
      </div>
      <div className='search-bar'><SearchBar></SearchBar></div>
      <div className='routes-table-div'>
        <table className='routes-table'>
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Hat Adı</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              
              <tr key={r.route_id} onClick={() => handleRowCheckbox(r.route_id)}>
                <td><input type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleRowCheckbox(r.route_id)}
                  checked = {selectedRouteIds.includes(r.route_id)}
                /></td>
                <td>{r.route_short_name}</td>
                <td>{r.route_long_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  )
}

export default RoutesSidebar
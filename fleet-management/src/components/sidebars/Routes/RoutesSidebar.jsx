import { useState, useEffect } from 'react'
import './RoutesSidebar.css'
import SearchBar from '../../ui/SearchBar/SearchBar.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'
import routeDatas from '../../../data/routedatas.json'

const RoutesSidebar = ({onCloseBtn}) => {
  const [routes, setRoutes] = useState([]);
  const [routesMinimized, setRoutesMinimized] = useState(false);

  useEffect(() => {
    setRoutes(routeDatas);
  }, []);


  return (
    <div className={`routes-sidebar-container ${routesMinimized ? "minimized" : ""}`}>
      <div className='routes-header'>
        <h2>Routes</h2>
        <div className="top-buttons">
          {routesMinimized && <FontAwesomeIcon 
          icon={faUpRightAndDownLeftFromCenter} 
          size='lg' 
          className='minimize-btn'
          onClick={()=>setRoutesMinimized(!routesMinimized)}>
          </FontAwesomeIcon>}
          {!routesMinimized && <FontAwesomeIcon 
          icon={faDownLeftAndUpRightToCenter} 
          size='lg' 
          className='minimize-btn'
          onClick={()=>setRoutesMinimized(!routesMinimized)}>
          </FontAwesomeIcon>}
          <FontAwesomeIcon 
          icon={faXmark} 
          size='lg' 
          className='close-btn'
          onClick={()=>onCloseBtn('home')}
          ></FontAwesomeIcon>
        </div>
      </div>
      <div className='search-bar'><SearchBar></SearchBar></div>
      <div className='routes-table-div'>
        <table className='routes-table'>
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>ID</th>
              <th>Durak Adı</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.route_id}>
                <td><input type="checkbox" /></td>
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
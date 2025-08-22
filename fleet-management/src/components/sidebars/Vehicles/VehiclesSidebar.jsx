import React, { useState } from 'react'
import './VehiclesSidebar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter } from '@fortawesome/free-solid-svg-icons'

const VehiclesSidebar = ({ onCloseBtn }) => {
  const [vehiclesMinimized, setVehiclesMinimized] = useState(false);
  return (
    <div className={`vehicles-sidebar-container ${vehiclesMinimized ? "minimized" : ""}`}>
      <div className='vehicles-header'>
        <h2>Vehicles</h2>
        <div className="top-buttons">
          {vehiclesMinimized && <FontAwesomeIcon
            icon={faUpRightAndDownLeftFromCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setVehiclesMinimized(!vehiclesMinimized)}>
          </FontAwesomeIcon>}
          {!vehiclesMinimized && <FontAwesomeIcon
            icon={faDownLeftAndUpRightToCenter}
            size='lg'
            className='minimize-btn'
            onClick={() => setVehiclesMinimized(!vehiclesMinimized)}>
          </FontAwesomeIcon>}
          <FontAwesomeIcon
            icon={faXmark}
            size='lg'
            className='close-btn'
            onClick={() => onCloseBtn('home')}
          ></FontAwesomeIcon>
        </div>
      </div>

    </div>
  )
}

export default VehiclesSidebar
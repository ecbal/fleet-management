import React from 'react'
import './Navbar.css'
import{FontAwesomeIcon} from "@fortawesome/react-fontawesome" 
import {faGear,faBusSimple,faHouse, faRoute, faLocationDot} from "@fortawesome/free-solid-svg-icons"

const Navbar = ({
  activeScreen,
  onNavClick
}) => {

  const buttons = [
    {key: "home", icon: <FontAwesomeIcon icon={faHouse} size='xl' />},
    {key: "stops", icon: <FontAwesomeIcon icon={faLocationDot} size='xl' />},
    {key: "routes", icon: <FontAwesomeIcon icon={faRoute} size='xl' />},
    {key: "vehicles", icon: <FontAwesomeIcon icon={faBusSimple} size='xl' />},
    {key: "settings", icon: <FontAwesomeIcon icon={faGear} size='xl' />}
  ];


  return (
    <div className='navbar-container'>
      {buttons.map((button) => (
        <div
          key={button.key}
          className={`nav-item ${activeScreen === button.key ? "active" : ""}`}
          onClick={() => onNavClick(button.key)}
          title={button.key}
        >
          {button.icon}
        </div>
      ))}
    </div>
  )
}

export default Navbar
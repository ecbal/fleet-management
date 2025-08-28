import React, { useState } from 'react'
import './InfoSidebar.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleLeft, faAngleRight, faBusSimple, faRoute, faLocationDot } from "@fortawesome/free-solid-svg-icons"

const buttons = [
  { key: "stops", icon: <FontAwesomeIcon icon={faLocationDot} size='lg' /> },
  { key: "routes", icon: <FontAwesomeIcon icon={faRoute} size='lg' /> },
  { key: "vehicles", icon: <FontAwesomeIcon icon={faBusSimple} size='lg' /> },
];

const InfoSidebar = () => {
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("stops");
  return (
    <div className={`infosidebar-container ${infoSidebarOpen ? "open" : "closed"}`}>
      <div className="infosidebar-toggle" onClick={() => setInfoSidebarOpen(!infoSidebarOpen)}>
        {infoSidebarOpen && <FontAwesomeIcon icon={faAngleRight} className='close-btn' size='xl' />}
        {!infoSidebarOpen && <FontAwesomeIcon icon={faAngleLeft} className='close-btn' size='xl' />}

      </div>
      <div className='infosidebar-content'>
        <div className="infosidebar-tabs">
          {buttons.map((button) => (
            <div
              className='tab-select'
              key={button.key}
              title={button.key}
              onClick={() => setActiveTab(button.key)}
            >
              {button.icon}
            </div>
          ))}
        </div>

        {activeTab === "stops"}
        <div className='stops-tab'>
            <h3 className='stops-tab-header'>Secili Duraklar</h3>
        </div>

      </div>
    </div>
  )
}

export default InfoSidebar
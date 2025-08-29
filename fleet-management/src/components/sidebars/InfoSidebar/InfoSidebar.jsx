import React, { useState } from 'react'
import './InfoSidebar.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleLeft, faAngleRight, faBusSimple, faRoute, faLocationDot } from "@fortawesome/free-solid-svg-icons"
import { useSelector } from 'react-redux'

const buttons = [
  { key: "stops", icon: <FontAwesomeIcon icon={faLocationDot} size='lg' /> },
  { key: "routes", icon: <FontAwesomeIcon icon={faRoute} size='lg' /> },
  { key: "vehicles", icon: <FontAwesomeIcon icon={faBusSimple} size='lg' /> },
];

const InfoSidebar = () => {
  const [infoSidebarOpen, setInfoSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("stops");
  const selectedVehicleIds = useSelector(state => state.map.selectedVehicleIds || []);
  const selectedRouteIds = useSelector(state => state.map.selectedRouteIds || []);
  const selectedStopIds = useSelector(state => state.map.selectedStopIds || []);



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

        {/* STOPS TAB */}
        {activeTab === "stops" && (
          <div className='stops-tab'>
            <h3 className='stops-tab-header'>Seçili Duraklar</h3>
            <table className='selected-stops-table'>
              <thead>
                <tr>
                  <td>ID</td>
                </tr>
              </thead>
              <tbody>
                {selectedStopIds.map((s) => (
                  <tr key={s}>
                    <td>{s}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ROUTES TAB */}
        {activeTab === "routes" && (
          <div className='routes-tab'>
            <h3 className='routes-tab-header'>Seçili Hatlar</h3>
            <table className='selected-routes-table'>
              <thead>
                <tr>
                  <td>ID</td>
                </tr>
              </thead>
              <tbody>
                {selectedRouteIds.map((r) => (
                  <tr key={r}>
                    <td>{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VEHICLES TAB */}
        {activeTab === "vehicles" && (
          <div className='vehicles-tab'>
            <h3 className='vehicles-tab-header'>Seçili Araçlar</h3>
            <table className='selected-vehicles-table'>
              <thead>
                <tr>
                  <td>ID</td>
                </tr>
              </thead>
              <tbody>
                {selectedVehicleIds.map((v) => (
                  <tr key={v}>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}

export default InfoSidebar
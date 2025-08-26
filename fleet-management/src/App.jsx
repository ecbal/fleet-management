import { use, useEffect, useState } from 'react'
import './App.css'
import RoutesSidebar from './components/sidebars/Routes/RoutesSidebar'
import StopsSidebar from './components/sidebars/Stops/StopsSidebar'
import VehicleInfo from './components/sidebars/VehicleInfo/VehicleInfo'
import VehiclesSidebar from './components/sidebars/Vehicles/VehiclesSidebar'
import MapView from './components/map/MapView'
import Navbar from './components/sidebars/Navbar/Navbar'


function App() {

  const [activeScreen, setActiveScreen] = useState('home');

  //Stops Things
  const [stopsData, setStopsData] = useState({
    stops: [],
    page: 1,
    hasMore: true,
    fetched: false,
    searchQuery: "", // son kullanılan search query
    loading: false,
  });


  const handleNavClick = (screenKey) => {
    setActiveScreen(screenKey);
  }

  useEffect(() => {
    console.log(activeScreen);
  }, [activeScreen]);



  return (
    <>
      <div className='app-container'>
        <MapView />
        {activeScreen === 'routes' && <RoutesSidebar
          onCloseBtn={handleNavClick}
        />}

        {activeScreen === 'vehicles' && <VehiclesSidebar
          onCloseBtn={handleNavClick} />
        }

        {activeScreen === 'stops' && <StopsSidebar
          stopsData={stopsData}
          setStopsData={setStopsData}
          onCloseBtn={handleNavClick}
        />}

        <Navbar
          activeScreen={activeScreen}
          onNavClick={handleNavClick}
        />
      </div>

    </>
  )
}

export default App

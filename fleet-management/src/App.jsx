import { use, useEffect, useState } from 'react'
import './App.css'
import RoutesSidebar from './components/sidebars/Routes/RoutesSidebar'
import StopsSidebar from './components/sidebars/Stops/StopsSidebar'
import VehicleInfo from './components/sidebars/VehicleInfo/VehicleInfo'
import VehiclesSidebar from './components/sidebars/Vehicles/VehiclesSidebar'
import MapView from './components/map/MapView'
import Navbar from './components/sidebars/Navbar/Navbar'
import useDebounce from './hooks/useDebounce'

function App() {

  const [activeScreen, setActiveScreen] = useState('home');

  //Stops Things
  const [stops, setStops] = useState([]);
  const [stopsPage, setStopsPage] = useState(1);
  const [stopsHasMore, setStopsHasMore] = useState(true);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsSearchQuery, setStopsSearchQuery] = useState("");
  const debouncedStopsSearch = useDebounce(stopsSearchQuery,300);
  const fetchStops = async (currentStopsPage, currentstopsSearchQuery) => {
    setStopsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/stops?page=${currentStopsPage}&pageSize=50&search=${encodeURIComponent(currentstopsSearchQuery)}`
      );
      const data = await res.json();
      console.log(data);

      setStops(prev => {
        const merged = [...prev, ...data.stops];

        //to block get same id twice
        const uniqueStops = Array.from(
          new Map(merged.map(stop => [stop.stop_id, stop])).values()
        );
        return uniqueStops;
      });
      setStopsHasMore(currentStopsPage * (data.pageSize ?? PAGE_SIZE) < (data.total ?? 0));
    } catch (error) {
      console.error("Duraklar alinamadi: ", error);
    } finally {
      setStopsLoading(false);
    }
  }

  useEffect(() => {
    fetchStops(stopsPage, debouncedStopsSearch);
  }, [stopsPage, debouncedStopsSearch])

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setStopsSearchQuery(value);
    setStopsPage(1);
    setStops([]);
  }





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
          stops={stops}
          stopsLoading={stopsLoading}
          stopsHasMore={stopsHasMore}
          onSearch={handleSearchChange}
          onPageEnd={() => setStopsPage(stopsPage + 1)}
          onCloseBtn={handleNavClick}
          stopsSearchQuery= {stopsSearchQuery}
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

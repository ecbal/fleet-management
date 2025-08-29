import { useRef, useEffect, useState } from 'react'
import './App.css'
import RoutesSidebar from './components/sidebars/Routes/RoutesSidebar'
import StopsSidebar from './components/sidebars/Stops/StopsSidebar'
import VehicleInfo from './components/sidebars/VehicleInfo/VehicleInfo'
import VehiclesSidebar from './components/sidebars/Vehicles/VehiclesSidebar'
import MapView from './components/map/MapView'
import Navbar from './components/sidebars/Navbar/Navbar'
import HistoryBar from './components/sidebars/HistoryBar/HistoryBar'
import { useDebounce } from 'use-debounce'
import SettingsSidebar from './components/sidebars/Settings/SettingsSidebar'
import InfoSidebar from './components/sidebars/InfoSidebar/InfoSidebar'

function App() {

  const [activeScreen, setActiveScreen] = useState('home');
  const [historyBarOpen, setHistoryBarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);


  //Map
    const mapRef = useRef();


  //Stops Things
  const [stops, setStops] = useState([]);
  const [stopsPage, setStopsPage] = useState(1);
  const [stopsHasMore, setStopsHasMore] = useState(true);
  const [stopsLoading, setStopsLoading] = useState(false);
  const [stopsSearchQuery, setStopsSearchQuery] = useState("");
  const [debouncedStopsSearch] = useDebounce(stopsSearchQuery, 200);
  const PAGE_SIZE = 100;

  const fetchStops = async (currentStopsPage, currentstopsSearchQuery) => {
    setStopsLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8080/stops?page=${currentStopsPage}&pageSize=100&search=${encodeURIComponent(currentstopsSearchQuery)}`
      );
      const data = await res.json();
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setStopsSearchQuery(value);
    setStopsPage(1);
    setStops([]);
  }

  useEffect(() => {
    setStopsPage(1);
    setStops([]);
  }, [debouncedStopsSearch]);

  useEffect(() => {
    fetchStops(stopsPage, debouncedStopsSearch);
  }, [stopsPage, debouncedStopsSearch]);


  const handleNavClick = (screenKey) => {
    setActiveScreen(screenKey);
  }


  return (
    <>
      <div className='app-container'>
        <MapView
          stops = {stops}
          darkMode = {false}
          isMapFull = {true}
           />
        {activeScreen === 'routes' && <RoutesSidebar
          onCloseBtn={handleNavClick}
        />}

        <InfoSidebar />
        {activeScreen === 'vehicles' && <VehiclesSidebar
          onCloseBtn={handleNavClick}
          setHistoryBarOpen={setHistoryBarOpen}
          historyBarOpen={historyBarOpen} />
        }

        {settingsOpen && <SettingsSidebar />}
        {historyBarOpen && activeScreen === 'vehicles' && <HistoryBar />}
        {activeScreen === 'stops' && <StopsSidebar
          stops={stops}
          stopsLoading={stopsLoading}
          stopsHasMore={stopsHasMore}
          onSearch={handleSearchChange}
          onPageEnd={() => setStopsPage(p => p + 1)}
          onCloseBtn={handleNavClick}
          stopsSearchQuery={stopsSearchQuery}
        />}

        <Navbar
          settingsOpen={settingsOpen}
          setSettingsOpen={setSettingsOpen}
          activeScreen={activeScreen}
          onNavClick={handleNavClick}
        />
      </div>

    </>
  )
}

export default App

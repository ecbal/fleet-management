import React, { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faArrowsLeftRight} from "@fortawesome/free-solid-svg-icons";
import './VehiclesSidebar.css'
import vehicleData from '../../../data/vehicledatas.json';


// 1) Kolon başlık metinleri (ekranda görünecek isimler)
const COL_LABELS = {
  id: "ID",
  plate: "Plaka",
  edge_code: "Edge Kodu",
  line: "Hat",
  name: "Araç Adı",
  status: "Durum",
  trip_no: "Sefer No",
  company: "Firma",
  path_code: "Rota Kodu",
  driver_name: "Şoför",
  speed_kph: "Hız (km/s)",
  last_gps_time: "Son GPS Zamanı",
  lat: "Enlem",
  lon: "Boylam",
};

// 2) Kolon sırası (görünür olanlar bu sırada çizilir)
const COL_ORDER = [
  "id",
  "plate",
  "line",
  "name",
  "status",
  "trip_no",
  "company",
  "driver_name",
  "speed_kph",
  "last_gps_time",
  "lat",
  "lon",
];

// 3) Şimdilik örnek görünürlük objesi (ileride Redux'tan gelecek)
const columnVisibility = {
  id: true,
  plate: true,
  line: true,
  name: true,
  status: true,
  trip_no: true,
  company: true,
  driver_name: true,
  speed_kph: true,
  last_gps_time: true,
  lat: true,
  lon: true,
};

// 4) Basit biçimlendirme yardımcıları (opsiyonel)
const fmtSpeed = (v) => (typeof v === "number" ? v.toFixed(1) : v);
const fmtTime = (iso) => {
  // ISO geliyorsa sadece kısa tarih-saat gösterelim
  try {
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString(); // TR yerel ayarına göre
  } catch {
    return iso;
  }
};

const VehiclesSidebar = ({ onCloseBtn, vehicles = [] }) => {
  const [vehiclesMinimized, setVehiclesMinimized] = useState(false);
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);

  // 5) Görünür kolon anahtarları
  const visibleKeys = useMemo(
    () => COL_ORDER.filter((k) => columnVisibility[k]),
    []
  );

  // 6) Hücre değerini ilgili key’e göre yazdır
  const renderCell = (v, key) => {
    const val = v?.[key];

    if (key === "speed_kph") return fmtSpeed(val);
    if (key === "last_gps_time") return fmtTime(val);
    if (key === "lat" || key === "lon") {
      return typeof val === "number" ? val.toFixed(6) : val;
    }
    return val ?? ""; // undefined/null ise boş string
  };

  return (
    <div className={`vehicles-sidebar-container ${vehiclesMinimized ? "minimized" : ""} ${vehiclesExpanded ? "expanded" : ""}` }>
      <div className="vehicles-header">
        <h2>Vehicles</h2>
        <div className="top-buttons">
          {vehiclesMinimized ? (
            <FontAwesomeIcon
              icon={faUpRightAndDownLeftFromCenter}
              size="lg"
              className="minimize-btn"
              onClick={() => setVehiclesMinimized(false)}
            />
          ) : (
            <FontAwesomeIcon
              icon={faDownLeftAndUpRightToCenter}
              size="lg"
              className="minimize-btn"
              onClick={() => setVehiclesMinimized(true)}
            />
          )}

          <FontAwesomeIcon
          icon={faArrowsLeftRight}
          size="lg"
          className="expand-btn"
          onClick={() => setVehiclesExpanded(!vehiclesExpanded)}
          />
          <FontAwesomeIcon
            icon={faXmark}
            size="lg"
            className="close-btn"
            onClick={() => onCloseBtn("home")}
          />
        </div>
      </div>

      <div className="vehicles-table-div">
        <table className="vehicles-table">
          <thead>
            <tr>
              <th> <input type="checkbox" name="" id="" /></th>
              {visibleKeys.map((key) => (
                <th key={key}>{COL_LABELS[key] ?? key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicleData.map((v) => (
              <tr key={v.id}>
                <td><input type="checkbox" name="" id="" /></td>
                {visibleKeys.map((key) => (
                  <td key={key}>{renderCell(v, key)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehiclesSidebar;

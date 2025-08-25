import React, { useMemo, useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faArrowsLeftRight } from "@fortawesome/free-solid-svg-icons";
import './VehiclesSidebar.css'


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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inFlight = useRef({ abort: () => { } });
  const [hasMore,setHasMore] = useState(false);


  const totalPages = useMemo(() => {
  if (Number.isFinite(total) && total > 0) {
    return Math.max(1, Math.ceil(total / pageSize));
  }
  return hasMore ? page + 1 : page;
}, [total, pageSize, hasMore, page]);


  const [filters, setFilters] = useState(() => {
    const init = {};
    COL_ORDER.forEach((k) => {
      if (columnVisibility[k]) {
        init[k] = "";
      }
    });
    return init;
  });


  useEffect(() => {
    const t = setTimeout(() => {
      const qs = buildQueryString(filters, page, pageSize);
      console.log("/vehicles?" + qs);
    }, 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [filters, page, pageSize]);

  const buildQueryString = (filters, page = 1, pageSize = 30) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    Object.entries(filters).forEach(([k, v]) => {
      const val = (v ?? "").toString().trim().toLowerCase();
      if (val !== "") params.set(k, val);
    });
    return params.toString();
  };

  const onFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    console.log(filters);
  };
  const visibleKeys = useMemo(
    () => COL_ORDER.filter((k) => columnVisibility[k]),
    []
  );

  useEffect(() => {
    const qs = buildQueryString(filters, page, pageSize);
    const t = setTimeout(() => {
      fetchVehicles(qs);
    }, 300);
    return () => clearTimeout(t);
  }, [filters, page, pageSize]);

  const fetchVehicles = async (qs) => {
    try { inFlight.current.abort?.(); } catch { }
    const controller = new AbortController();
    inFlight.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/vehicles?${qs}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

     
      // 🔸 Backend formatına birebir uyum:
      const list = Array.isArray(json.vehicles) ? json.vehicles : [];
      setRows(list);
      console.log(rows);
      setTotal(Number(json.total ?? list.length));
      // Sayfa bilgilerini de backend’den alalım (UI’da kullanacağız)
      setPage(Number(json.page ?? 1));
      setPageSize(Number(json.pageSize ?? 30));
      setHasMore(Boolean(json.hasMore));
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err?.message || "Veri alınamadı");
        setRows([]);
        setTotal(0);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  };


  const renderCell = (v, key) => {
    const val = v?.[key];

    if (key === "speed_kph") return fmtSpeed(val);
    if (key === "last_gps_time") return fmtTime(val);
    if (key === "lat" || key === "lon") {
      return typeof val === "number" ? val.toFixed(6) : val;
    }
    return val ?? "";
  };

  return (
    <div className={`vehicles-sidebar-container ${vehiclesMinimized ? "minimized" : ""} ${vehiclesExpanded ? "expanded" : ""}`}>
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
            <tr className="filter-row">
              <th></th>
              {visibleKeys.map((col) => (
                <th key={`filter-${col}`}>
                  <input
                    key={`input-${col}`}   // 🔑 burası önemli
                    type="text"
                    value={filters[col] ?? ""}
                    onChange={(e) => onFilterChange(col, e.target.value)}
                    className="col-filter"
                    placeholder=" "
                  />
                </th>
              ))}
            </tr>

          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={visibleKeys.length + 1}>Yükleniyor…</td>
              </tr>
            )}

            {!!error && !loading && (
              <tr>
                <td colSpan={visibleKeys.length + 1} className="error">
                  Hata: {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={visibleKeys.length + 1}>Kayıt bulunamadı.</td>
              </tr>
            )}

            {!loading && !error && rows.map((v) => (
              <tr key={v.id ?? `${v.plate}-${v.trip_no}-${v.edge_code}`}>
                <td><input type="checkbox" /></td>
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
